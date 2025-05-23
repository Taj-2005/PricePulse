// lib/scheduler.ts
import cron from "node-cron";
import { connectDB } from "./mongodb";
import { TrackedProduct } from "@/models/trackedProduct";
import { scrapeProduct } from "./scraper";
import { Product } from "@/models/product";

export function startScheduler() {
  cron.schedule("*/5 * * * *", async () => {
    console.log("Starting hourly scrape...");
    try {
      await connectDB();

      const trackedUrls = await TrackedProduct.find().distinct("url");

      for (const url of trackedUrls) {
        try {
          const { title, price } = await scrapeProduct(url);
          await Product.create({ url, title, price });
          console.log(`Scraped and saved: ${title}`);
        } catch (err : any) {
          console.error(`Failed to scrape ${url}:`, err.message);
        }
      }
    } catch (err : any) {
      console.error("Scheduler error:", err.message);
    }
  });
}
