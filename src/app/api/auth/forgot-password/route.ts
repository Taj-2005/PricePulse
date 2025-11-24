import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { sendResetPasswordEmail } from "@/services/passService";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email } = await req.json();

    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ ok: true });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000);

    user.resetPasswordToken = token;
    user.resetPasswordExpiry = expiry;
    await user.save();

    try {
      await sendResetPasswordEmail(user.email, token);
    } catch (err) {
      console.error("Reset email error:", err);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
