import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { TrackedProduct } from "@/models/trackedProduct";
import { Product } from "@/models/product";
import { scrapeProduct } from "@/lib/scraper";

// Simple concurrency limiter helper
async function withConcurrencyLimit(tasks: (() => Promise<void>)[], limit: number) {
  const results = [];
  const executing: Promise<void>[] = [];

  for (const task of tasks) {
    const p = task();
    results.push(p);

    if (limit <= tasks.length) {
      const e: Promise<void> = p.then(() => {
        executing.splice(executing.indexOf(e), 1);
      });
      executing.push(e);

      if (executing.length >= limit) {
        await Promise.race(executing);
      }
    }
  }

  await Promise.all(results);
}

export async function GET() {
  try {
    await connectDB();
    const products = await TrackedProduct.find();

    const scrapeTasks = products.map((product) => async () => {
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
    });

    // Limit concurrency to 5
    await withConcurrencyLimit(scrapeTasks, 5);

    return NextResponse.json({ message: "Scraping completed." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
