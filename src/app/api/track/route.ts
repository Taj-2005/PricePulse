import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/product";
import { scrapeProduct } from "@/lib/scraper";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: "Missing URL" }, { status: 400 });

    await connectDB();
    const { title, price } = await scrapeProduct(url);

    const entry = await Product.create({ url, title, price });
    return NextResponse.json(entry);
  } catch (err: any) {
    console.error("API error:", err.message);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
