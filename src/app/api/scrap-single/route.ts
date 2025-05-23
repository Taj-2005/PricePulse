import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { TrackedProduct } from "@/models/trackedProduct";
import { Product } from "@/models/product";
import { scrapeProduct } from "@/lib/scraper";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

    await connectDB();
    const { title, price } = await scrapeProduct(url);
    await Product.create({ url, title, price });

    return NextResponse.json({ success: true, title, price });
  } catch (err: any) {
    console.error("Single scrape failed:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}