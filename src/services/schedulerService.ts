import { connectDB } from "@/lib/mongodb";
import TrackedProduct from "@/models/trackedProduct";
import { PriceHistory } from "@/models/product";
import { scrapeProduct } from "./scraperService";
import { checkAndSendAlert, resetAlertIfPriceAboveTarget } from "./alertService";

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function processProduct(product: any) {
  try {
    console.log(`🔄 Processing: ${product.title} (${product.url})`);

    const scraped = await scrapeProduct(product.url, 3);

    await PriceHistory.create({
      productUrl: product.url,
      price: scraped.priceNumber,
      timestamp: new Date(),
    });

    await TrackedProduct.findByIdAndUpdate(product._id, {
      currentPrice: scraped.priceNumber,
      title: scraped.title,
      lastScrapedAt: new Date(),
      updatedAt: new Date(),
      ...(scraped.imageUrl && { imageUrl: scraped.imageUrl }),
      ...(scraped.brand && { brand: scraped.brand }),
    });

    console.log(`✅ Updated: ${scraped.title} @ ₹${scraped.priceNumber}`);

    const alertResult = await checkAndSendAlert(product._id.toString(), scraped.priceNumber);
    if (alertResult.alertSent) {
      console.log(`📧 ${alertResult.message}`);
    }

    if (scraped.priceNumber > product.currentPrice) {
      await resetAlertIfPriceAboveTarget(product._id.toString(), scraped.priceNumber);
    }

    return { success: true, product: scraped.title };
  } catch (error: any) {
    console.error(`❌ Failed to process ${product.url}:`, error.message);
    return { success: false, error: error.message, url: product.url };
  }
}


export async function runScheduler(): Promise<{
  success: number;
  failed: number;
  results: any[];
}> {
  try {
    await connectDB();

    const products = await TrackedProduct.find({}).lean();
    console.log(`📊 Found ${products.length} products to process`);

    if (products.length === 0) {
      return { success: 0, failed: 0, results: [] };
    }

    const batchSize = 5;
    const results: any[] = [];
    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(products.length / batchSize)}`);

      const batchResults = await Promise.allSettled(
        batch.map((product) => processProduct(product))
      );

      for (const result of batchResults) {
        if (result.status === "fulfilled") {
          if (result.value.success) {
            successCount++;
          } else {
            failedCount++;
          }
          results.push(result.value);
        } else {
          failedCount++;
          results.push({ success: false, error: result.reason?.message || "Unknown error" });
        }
      }

      if (i + batchSize < products.length) {
        console.log("⏳ Waiting 3 seconds before next batch...");
        await delay(3000);
      }
    }

    console.log(`\n✅ Scheduler completed: ${successCount} succeeded, ${failedCount} failed`);
    return { success: successCount, failed: failedCount, results };
  } catch (error: any) {
    console.error("❌ Scheduler error:", error);
    throw error;
  }
}

