import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/product";
import { scrapeProduct } from "@/lib/scraper";

export async function POST(req: NextRequest) {
  const { url } = await req.json();
  await connectDB();

  try {
    const { title, price } = await scrapeProduct(url);
    const saved = await Product.create({ url, title, price });
    return NextResponse.json(saved);
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
  }
}
