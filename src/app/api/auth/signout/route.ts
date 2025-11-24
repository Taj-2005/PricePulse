import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const response = NextResponse.json({ message: "Signed out successfully" });

    response.cookies.delete("token");

    return response;
  } catch (error) {
    console.error("Signout error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
