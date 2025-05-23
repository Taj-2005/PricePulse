import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { TrackedProduct } from "@/models/trackedProduct";
import { Product } from "@/models/product";
import { scrapeProduct } from "@/lib/scraper";

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET() {
  try {
    await connectDB();
    const products = await TrackedProduct.find();
    const batchSize = 5;

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (product) => {
          try {
            const { title, price } = await scrapeProduct(product.url);

            await Product.create({
              url: product.url,
              title,
              price,
              timestamp: new Date(),
            });

            console.log("✅ Tracked:", product.url);
          } catch (error: any) {
            console.error("❌ Failed to scrape:", product.url, error.message);
          }
        })
      );

      // Add delay between batches
      await delay(3000); // 3 seconds
    }

    return NextResponse.json({ message: "Scraping completed in batches." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
