import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWTEdge } from "@/lib/verifyJWTEdge";

const PROTECTED_ROUTES = [
  "/dashboard",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  // Check if path is protected
  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // Only protect private routes - let client handle public route navigation
  if (isProtected) {
    // Protected route requires authentication
    if (!token) {
      // No token, redirect to login
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    // Verify token (using Edge-compatible library)
    const isValid = await verifyJWTEdge(token);
    if (!isValid) {
      // Invalid token, clear cookie and redirect to login
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      const response = NextResponse.redirect(url);
      response.cookies.delete("token");
      return response;
    }
  }

  // Allow all other routes (public routes, API routes, static files, etc.)
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
  ],
};
