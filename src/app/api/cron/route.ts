import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { TrackedProduct } from "@/models/trackedProduct";
import { scrapeProduct } from "@/lib/scraper";

export async function GET() {
  try {
    await connectDB();
    const products = await TrackedProduct.find();

    for (const product of products) {
      try {
        const { title, price } = await scrapeProduct(product.url);
        await Product.create({ url: product.url, title, price });
        console.log("Updated product:", product.url);
      } catch (error) {
        console.error("Failed to scrape:", product.url);
      }
    }

    return NextResponse.json({ message: "Scraping completed." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}