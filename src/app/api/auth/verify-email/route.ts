import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { token } = await req.json();

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() }
    });

    if (!user)
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;

    await user.save();

    return NextResponse.json({ message: "Email verified!" });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
