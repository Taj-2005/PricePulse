// lib/scheduler.ts
import cron from "node-cron";
import { connectDB } from "./mongodb";
import { TrackedProduct } from "@/models/trackedProduct";
import { scrapeProduct } from "./scraper";
import { Product } from "@/models/product";

export function startScheduler() {
  cron.schedule("*/5 * * * *", async () => {
    console.log("Starting scrape every 5 minutes...");
    try {
      await connectDB();

      const trackedUrls = await TrackedProduct.find().distinct("url");
      console.log("Tracked URLs:", trackedUrls);
      for (const url of trackedUrls) {
        console.log("Scraping URL:", url);
        try {
        const { title, price } = await scrapeProduct(url);
        console.log(`Scraped title: ${title}, price: ${price}`);
        await Product.create({ url, title, price });
        console.log(`Saved product data for: ${url}`);
        } catch (err : any) {
        console.error(`Failed to scrape ${url}:`, err.message);
        }
      }
    } catch (err : any) {
      console.error("Scheduler error:", err.message);
    }
  });
}
