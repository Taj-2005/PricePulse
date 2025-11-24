import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWTEdge } from "@/lib/verifyJWTEdge";

const PUBLIC_ROUTES = ["/login", "/signup", "/"];
const PROTECTED_ROUTES = ["/dashboard"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  const isPublic = PUBLIC_ROUTES.includes(pathname);
  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isPublic) {
    if (token) {
      const valid = await verifyJWTEdge(token);

      if (valid) {
        const url = req.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }

      const res = NextResponse.next();
      res.cookies.delete("token");
      return res;
    }

    return NextResponse.next();
  }

  if (isProtected) {
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    const valid = await verifyJWTEdge(token);

    if (!valid) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("expired", "true");

      const res = NextResponse.redirect(url);
      res.cookies.delete("token");
      return res;
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
    "/dashboard/:path*",
  ],
};
