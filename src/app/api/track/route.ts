import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/product";
import { TrackedProduct } from "@/models/trackedProduct";
import { scrapeProduct } from "@/lib/scraper";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = body?.url;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    await connectDB();


    await TrackedProduct.updateOne(
      { url },
      { url },
      { upsert: true }
    );

    const { title, price } = await scrapeProduct(url);

    const saved = await Product.create({ url, title, price });

    return NextResponse.json(saved);
  } catch (err: any) {
    console.error("API /track error:", err.message);
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
}
