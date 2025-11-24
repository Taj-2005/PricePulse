import bcrypt from "bcrypt";
import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email";
import { signJWT } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User does not exist" }, { status: 404 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (!user.isVerified) {
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const expiry = new Date(Date.now() + 24 * 3600 * 1000);

      user.verificationToken = verificationToken;
      user.verificationTokenExpiry = expiry;
      await user.save();

      await sendVerificationEmail(email, verificationToken);

      return NextResponse.json(
        {
          needsVerification: true,
          message: "Email not verified. Verification email resent.",
        },
        { status: 403 }
      );
    }

    const token = signJWT({ userId: user._id, email: user.email });

    const res = NextResponse.json({ ok: true });

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
