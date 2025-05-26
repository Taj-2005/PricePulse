import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Product from "@/models/product";

const MONGODB_URI = process.env.MONGODB_URI!;

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(MONGODB_URI);
}

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json({ error: "Missing url param" }, { status: 400 });
    }

    const history = await Product.find({ url }).sort({ timestamp: 1 }).lean();

    const responseData = history.map((doc) => ({
      price: doc.price,
      timestamp: doc.timestamp,
    }));

    return NextResponse.json(responseData);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
