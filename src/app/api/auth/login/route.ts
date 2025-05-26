import bcrypt from "bcrypt";
import User from "@/models/User";
import {connectDB} from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { signJWT } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = signJWT({ userId: user._id, email: user.email });

    // Send token in HTTP-only cookie (optional: here we send in JSON for frontend storage)
    return NextResponse.json({ token });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
