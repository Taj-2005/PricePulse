import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, token, newPassword } = await req.json();

    if (!email || !token || !newPassword) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const user = await User.findOne({ email });

    if (
      !user ||
      !user.resetPasswordToken ||
      !user.resetPasswordExpiry ||
      user.resetPasswordToken !== token ||
      user.resetPasswordExpiry.getTime() < Date.now()
    ) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.passwordHash = hashed; 
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    return NextResponse.json({ ok: true, message: "Password has been reset" });
  } catch (err: any) {
    console.error("Reset password error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
