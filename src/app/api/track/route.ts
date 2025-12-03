import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TrackedProduct from "@/models/trackedProduct";
import { PriceHistory } from "@/models/product";
import { scrapeProduct } from "@/services/scraperService";
import { createOrUpdateAlert, checkAndSendAlert } from "@/services/alertService";

/**
 * POST /api/track - Track a product or fetch existing product data
 * 
 * Handles:
 * - Product scraping with timeout protection (max 8s to stay within Vercel limits)
 * - Early fallback to cached data to prevent 502 timeouts
 * - Proper error handling and JSON responses
 * - MongoDB connection errors with graceful degradation
 */
export async function POST(req: NextRequest) {
  const requestStartTime = Date.now();
  const MAX_EXECUTION_TIME = 8000; // 8s max to leave buffer for Vercel (10s hobby limit)

  try {
    // Wrap DB connection in try-catch to prevent 502 on connection failure
    let dbConnected = false;
    try {
      await connectDB();
      dbConnected = true;
      console.log("[API] MongoDB connection established");
    } catch (dbError: any) {
      console.error("[API] MongoDB connection failed:", {
        message: dbError.message,
        stack: dbError.stack,
      });
      // If we can't connect, we can still return cached data if available
      // But we'll need to skip DB operations
    }

    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError: any) {
      console.error("[API] Invalid JSON in request body:", parseError.message);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { url, userEmail, targetPrice } = requestBody;

    // Validation
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    if (!url.includes("amazon.")) {
      return NextResponse.json(
        { error: "Please provide a valid Amazon product URL" },
        { status: 400 }
      );
    }

    if (userEmail && typeof userEmail !== "string") {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    if (targetPrice && (typeof targetPrice !== "number" || targetPrice <= 0)) {
      return NextResponse.json(
        { error: "Target price must be a positive number" },
        { status: 400 }
      );
    }

    // Try to get cached product data first (for fast fallback)
    let cachedProduct: any = null;
    if (dbConnected) {
      try {
        cachedProduct = await TrackedProduct.findOne({ url }).lean();
        if (cachedProduct) {
          console.log(`[API] Found cached product: ${cachedProduct.title} (last scraped: ${cachedProduct.lastScrapedAt})`);
        }
      } catch (dbError: any) {
        console.warn("[API] Failed to fetch cached product (non-critical):", dbError.message);
      }
    }

    // Check if we're running out of time - return cached data immediately if available
    const elapsedTime = Date.now() - requestStartTime;
    if (elapsedTime > MAX_EXECUTION_TIME && cachedProduct) {
      console.log(`[API] Time limit approaching (${elapsedTime}ms), returning cached data immediately`);
      const cacheAge = Date.now() - new Date(cachedProduct.lastScrapedAt).getTime();
      const maxCacheAge = 7 * 24 * 60 * 60 * 1000; // 7 days

      if (cacheAge < maxCacheAge) {
        return NextResponse.json({
          id: cachedProduct._id?.toString(),
          title: cachedProduct.title,
          price: `₹${cachedProduct.currentPrice}`,
          priceNumber: cachedProduct.currentPrice,
          imageUrl: cachedProduct.imageUrl,
          url: cachedProduct.url,
          cached: true,
        });
      }
    }

    // Attempt to scrape fresh data with timeout protection
    let scraped: any = null;
    let usedCache = false;
    const startTime = Date.now();

    // Create a timeout promise to ensure we don't exceed Vercel limits
    const scrapeWithTimeout = Promise.race([
      scrapeProduct(url),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Scraping timeout - exceeded time limit")), MAX_EXECUTION_TIME - elapsedTime - 1000)
      ),
    ]) as Promise<any>;

    try {
      console.log(`[API] Starting scrape for URL: ${url}`);
      scraped = await scrapeWithTimeout;
      const scrapeTime = Date.now() - startTime;
      console.log(`[API] Scrape completed in ${scrapeTime}ms`);
    } catch (scrapeError: any) {
      const scrapeTime = Date.now() - startTime;
      const totalElapsed = Date.now() - requestStartTime;
      console.error(`[API] Scrape failed after ${scrapeTime}ms (total: ${totalElapsed}ms):`, {
        message: scrapeError.message,
        errorType: scrapeError.name,
      });

      // Always try cached data first before returning error
      if (cachedProduct) {
        const cacheAge = Date.now() - new Date(cachedProduct.lastScrapedAt).getTime();
        const maxCacheAge = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

        if (cacheAge < maxCacheAge) {
          const cacheAgeHours = Math.round(cacheAge / (60 * 60 * 1000));
          console.log(`[API] Using cached data (age: ${cacheAgeHours} hours) after scrape failure`);
          scraped = {
            title: cachedProduct.title,
            price: `₹${cachedProduct.currentPrice}`,
            priceNumber: cachedProduct.currentPrice,
            imageUrl: cachedProduct.imageUrl,
            brand: cachedProduct.brand,
            model: cachedProduct.model,
          };
          usedCache = true;
        } else {
          const cacheAgeDays = Math.round(cacheAge / (24 * 60 * 60 * 1000));
          console.warn(`[API] Cached data too old (${cacheAgeDays} days), cannot use as fallback`);
          
          // Return error with cached data if still valid (even if old)
          if (cachedProduct.title && cachedProduct.currentPrice) {
            return NextResponse.json({
              id: cachedProduct._id?.toString(),
              title: cachedProduct.title,
              price: `₹${cachedProduct.currentPrice}`,
              priceNumber: cachedProduct.currentPrice,
              imageUrl: cachedProduct.imageUrl,
              url: cachedProduct.url,
              cached: true,
              warning: "Showing cached data. Fresh scrape failed.",
            });
          }
          
          return NextResponse.json(
            {
              error: "Unable to fetch product data. The product may be unavailable or the URL is invalid.",
              cached: false,
            },
            { status: 502 }
          );
        }
      } else {
        // No cached data available
        return NextResponse.json(
          {
            error: "Unable to fetch product data. The product may be unavailable or the URL is invalid.",
            cached: false,
          },
          { status: 502 }
        );
      }
    }

    // Validate scraped data
    if (!scraped?.title || !scraped?.price || scraped?.priceNumber == null) {
      console.error("[API] Invalid scraped data:", scraped);
      
      // Try cached data as last resort
      if (cachedProduct && !usedCache) {
        console.log("[API] Using cached data due to invalid scraped data");
        scraped = {
          title: cachedProduct.title,
          price: `₹${cachedProduct.currentPrice}`,
          priceNumber: cachedProduct.currentPrice,
          imageUrl: cachedProduct.imageUrl,
          brand: cachedProduct.brand,
          model: cachedProduct.model,
        };
        usedCache = true;
      } else {
        return NextResponse.json(
          {
            error: "Product not found or could not be scraped",
            cached: false,
          },
          { status: 404 }
        );
      }
    }

    // Save/update product in database (only if DB is connected and we have time)
    let trackedProduct: any = null;
    const elapsedBeforeSave = Date.now() - requestStartTime;
    
    if (dbConnected && elapsedBeforeSave < MAX_EXECUTION_TIME - 2000) {
      try {
        trackedProduct = await TrackedProduct.findOne({ url });

        if (trackedProduct) {
          // Update existing product
          trackedProduct.currentPrice = scraped.priceNumber;
          trackedProduct.title = scraped.title;
          trackedProduct.lastScrapedAt = new Date();
          trackedProduct.updatedAt = new Date();
          if (scraped.imageUrl) trackedProduct.imageUrl = scraped.imageUrl;
          if (scraped.brand) trackedProduct.brand = scraped.brand;
          if (scraped.model) trackedProduct.model = scraped.model;
          if (userEmail) trackedProduct.userEmail = userEmail;
          await trackedProduct.save();
          console.log(`[API] Updated existing product: ${trackedProduct._id}`);
        } else {
          // Create new product
          trackedProduct = await TrackedProduct.create({
            url,
            title: scraped.title,
            currentPrice: scraped.priceNumber,
            userEmail: userEmail || undefined,
            imageUrl: scraped.imageUrl,
            brand: scraped.brand,
            model: scraped.model,
            lastScrapedAt: new Date(),
          });
          console.log(`[API] Created new product: ${trackedProduct._id}`);
        }
      } catch (dbError: any) {
        console.error("[API] Failed to save product to database:", {
          message: dbError.message,
          errorType: dbError.name,
        });
        // Continue even if DB save fails - return scraped data
        // Use cached product ID if available
        if (cachedProduct && !trackedProduct) {
          trackedProduct = { _id: cachedProduct._id, url: cachedProduct.url };
        }
      }
    } else {
      // Use cached product data structure if DB operations were skipped
      if (cachedProduct && !trackedProduct) {
        trackedProduct = { _id: cachedProduct._id, url: cachedProduct.url };
        console.log("[API] Using cached product structure (DB operations skipped due to time/connection limits)");
      }
    }

    // Save price history (non-critical - don't fail if this errors)
    // Skip if we're out of time or DB not connected
    const elapsedBeforeHistory = Date.now() - requestStartTime;
    if (dbConnected && elapsedBeforeHistory < MAX_EXECUTION_TIME - 1000 && trackedProduct?._id) {
      try {
        await PriceHistory.create({
          productUrl: url,
          price: scraped.priceNumber,
          timestamp: new Date(),
        });
      } catch (historyError: any) {
        console.warn("[API] Failed to save price history (non-critical):", historyError.message);
      }
    }

    // Handle alerts (non-critical - don't fail if this errors)
    // Skip if we're out of time or DB not connected
    const elapsedBeforeAlerts = Date.now() - requestStartTime;
    if (dbConnected && elapsedBeforeAlerts < MAX_EXECUTION_TIME - 1000 && trackedProduct?._id) {
      try {
        if (userEmail && targetPrice) {
          await createOrUpdateAlert(
            trackedProduct._id.toString(),
            userEmail,
            targetPrice
          );

          if (scraped.priceNumber <= targetPrice) {
            await checkAndSendAlert(trackedProduct._id.toString(), scraped.priceNumber);
          }
        }
      } catch (alertError: any) {
        console.warn("[API] Failed to handle alerts (non-critical):", alertError.message);
      }
    }

    // Return success response
    const totalExecutionTime = Date.now() - requestStartTime;
    console.log(`[API] Request completed in ${totalExecutionTime}ms (cached: ${usedCache})`);

    return NextResponse.json({
      id: trackedProduct?._id?.toString() || cachedProduct?._id?.toString(),
      title: scraped.title,
      price: scraped.price,
      priceNumber: scraped.priceNumber,
      imageUrl: scraped.imageUrl,
      url: trackedProduct?.url || cachedProduct?.url || url,
      cached: usedCache,
    });
  } catch (err: any) {
    const totalExecutionTime = Date.now() - requestStartTime;
    console.error("[API] Unhandled error in /api/track:", {
      message: err.message,
      stack: err.stack,
      name: err.name,
      executionTime: totalExecutionTime,
      url: requestBody?.url,
    });

    // Ensure we always return proper JSON with correct status
    let status = err.status || 500;
    let message = err.message || "Unknown error";

    // Map common errors to user-friendly messages
    if (err.message?.includes("Failed to scrape") || err.message?.includes("Scraping timeout")) {
      message = "Unable to fetch product data. The product may be unavailable or the URL is invalid.";
      status = 502;
    } else if (err.message?.includes("Product not found")) {
      message = "Product not found. Please check the URL and try again.";
      status = 404;
    } else if (err.message?.includes("timeout") || err.message?.includes("Timeout")) {
      message = "Request timed out. Please try again.";
      status = 504;
    } else if (err.name === "MongoServerError" || err.message?.includes("MongoDB")) {
      message = "Database error. Please try again later.";
      status = 503;
    } else if (status === 500) {
      message = "Internal server error. Please try again later.";
    }

    return NextResponse.json(
      {
        error: message,
        cached: false,
      },
      { status }
    );
  }
}
