import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password)
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });

    const exists = await User.findOne({ email });
    if (exists)
      return NextResponse.json({ error: "User already exists" }, { status: 409 });

    const hash = await bcrypt.hash(password, 10);

    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await User.create({
      email,
      passwordHash: hash,
      isVerified: false,
      verificationToken: token,
      verificationTokenExpiry: tokenExpiry
    });

    await sendVerificationEmail(email, token);

    return NextResponse.json({
      message: "Signup successful. Check your email to verify your account.",
      email: user.email,
    });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
