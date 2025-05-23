import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/product";
import { TrackedProduct } from "@/models/trackedProduct";
import { scrapeProduct } from "@/lib/scraper";

export async function POST(req: NextRequest) {
  try {
    const { url, userEmail, targetPrice } = await req.json();

    if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

    await connectDB();

    await TrackedProduct.updateOne(
      { url },
      { url, userEmail, targetPrice },
      { upsert: true }
    );

    const { title, price } = await scrapeProduct(url);

    const saved = await Product.create({ url, title, price, timestamp: new Date() });

    return NextResponse.json(saved);
  } catch (err: any) {
    console.error("API /track error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
