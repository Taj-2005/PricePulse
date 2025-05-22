import mongoose from "mongoose";
import { scrapeProduct } from "./lib/scraper";
import { Product } from "./models/product";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const testUrls = [
    "https://www.amazon.in/dp/B09G9ZPV38",
    "https://www.amazon.in/dp/B0C6M4N9Z9"
  ];

  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("✅ Connected to MongoDB");

    for (const url of testUrls) {
      try {
        console.log(`🔍 Scraping: ${url}`);
        const { title, price } = await scrapeProduct(url);

        const saved = await Product.create({ url, title, price });
        console.log("💾 Saved:", saved);
      } catch (err) {
        if (err instanceof Error) {
          console.error("❌ Failed to scrape or save:", url, err.message);
        } else {
          console.error("❌ Failed to scrape or save:", url, err);
        }
      }
    }

    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  } catch (err) {
    console.error("❌ MongoDB error:", err);
  }
}

main();
