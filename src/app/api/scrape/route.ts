import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { TrackedProduct } from "@/models/trackedProduct";
import { Product } from "@/models/product";
import { scrapeProduct } from "@/lib/scraper";

export async function GET(request: Request) {
  await connectDB();

  const url = new URL(request.url);
  const batch = parseInt(url.searchParams.get("batch") || "1", 10);
  const batchSize = parseInt(url.searchParams.get("batchSize") || "5", 10);

  const skip = (batch - 1) * batchSize;

  const products = await TrackedProduct.find()
    .skip(skip)
    .limit(batchSize);

  if (products.length === 0) {
    return NextResponse.json({ message: "No products in this batch." });
  }

  for (const product of products) {
    try {
      const { title, price } = await scrapeProduct(product.url);
      await Product.create({
        url: product.url,
        title,
        price,
        timestamp: new Date(),
      });
      console.log(`✅ Scraped: ${product.url}`);
    } catch (error: any) {
      console.error(`❌ Failed: ${product.url} - ${error.message}`);
    }
  }

  return NextResponse.json({ message: `Batch ${batch} done.` });
}
