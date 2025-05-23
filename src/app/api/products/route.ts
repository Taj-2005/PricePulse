import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/product";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

    await connectDB();
    return NextResponse.json({ message: "URL added for tracking" });
  } catch (err : any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const products = await Product.find().sort({ timestamp: -1 }).limit(50);
    return NextResponse.json(products);
  } catch (err : any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
