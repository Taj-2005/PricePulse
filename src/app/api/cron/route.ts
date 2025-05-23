// src/app/api/cron/route.ts

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { TrackedProduct } from "@/models/trackedProduct";
import { Product } from "@/models/product";
import { scrapeProduct } from "@/lib/scraper";
import { sendEmail } from "@/lib/sendEmail";

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET() {
  try {
    await connectDB();

    const products = await TrackedProduct.find(); // userEmail and targetPrice must exist in schema!
    const batchSize = 5;

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (product) => {
          try {
            const { title, price } = await scrapeProduct(product.url);

            // Save current price snapshot
            await Product.create({
              url: product.url,
              title,
              price,
              timestamp: new Date(),
            });

            console.log(`✅ Tracked: ${title} @ ${price}`);

            // Check and send email if alert conditions are met
            const currentPrice = parseFloat(price.replace(/[^0-9.]/g, ""));
            console.log("Ni yabba reyyy" + currentPrice)
            console.log("Attempting to send email to:", product.userEmail);
            const target = product.targetPrice;

            if (
              product.userEmail &&
              target &&
              !isNaN(currentPrice) &&
              currentPrice <= target
            ) {
              await sendEmail(
                product.userEmail,
                "Price Drop Alert",
                `The product "${title}" is now ₹${currentPrice}, which is below your target of ₹${target}.\n\nProduct link: ${product.url}`
              );
              console.log(`📧 Email sent to ${product.userEmail}`);
            } else {
              console.log(
                `ℹ️ No email: ${title} @ ₹${currentPrice} (target: ₹${target})`
              );
            }
          } catch (error: any) {
            console.error("❌ Failed to scrape or email:", product.url, error.message);
          }
        })
      );

      // Delay between batches
      await delay(3000);
    }

    return NextResponse.json({ message: "Scraping & alerting completed." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
