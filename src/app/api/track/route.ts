import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TrackedProduct from "@/models/trackedProduct";
import { PriceHistory } from "@/models/product";
import { scrapeProduct } from "@/services/scraperService";
import { createOrUpdateAlert, checkAndSendAlert } from "@/services/alertService";
import { isValidAmazonUrl, extractProductUrl } from "@/lib/urlValidator";

export async function POST(req: NextRequest) {
  const requestStartTime = Date.now();
  const MAX_EXECUTION_TIME = 8000;
  let requestBody: any = null;

  try {
    let dbConnected = false;
    try {
      await connectDB();
      dbConnected = true;
    } catch (dbError: any) {
      console.error("[API] MongoDB connection failed:", dbError.message);
    }

    try {
      requestBody = await req.json();
    } catch (parseError: any) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_JSON",
            message: "Invalid JSON in request body",
          },
        },
        { status: 400 }
      );
    }

    const { url, userEmail, targetPrice } = requestBody;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_URL",
            message: "URL is required and must be a string",
          },
        },
        { status: 400 }
      );
    }

    if (!isValidAmazonUrl(url)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_AMAZON_URL",
            message: "Please provide a valid Amazon product URL",
          },
        },
        { status: 400 }
      );
    }

    if (userEmail && typeof userEmail !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_EMAIL",
            message: "Email must be a string",
          },
        },
        { status: 400 }
      );
    }

    if (targetPrice !== undefined && (typeof targetPrice !== "number" || targetPrice <= 0)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_TARGET_PRICE",
            message: "Target price must be a positive number",
          },
        },
        { status: 400 }
      );
    }

    const normalizedUrl = extractProductUrl(url);

    let cachedProduct: any = null;
    if (dbConnected) {
      try {
        cachedProduct = await TrackedProduct.findOne({ url: normalizedUrl }).lean();
      } catch (dbError: any) {
        console.warn("[API] Failed to fetch cached product:", dbError.message);
      }
    }

    const elapsedTime = Date.now() - requestStartTime;
    if (elapsedTime > MAX_EXECUTION_TIME && cachedProduct) {
      const cacheAge = Date.now() - new Date(cachedProduct.lastScrapedAt).getTime();
      const maxCacheAge = 7 * 24 * 60 * 60 * 1000;

      if (cacheAge < maxCacheAge) {
        return NextResponse.json({
          success: true,
          data: {
            id: cachedProduct._id?.toString(),
            title: cachedProduct.title,
            price: `₹${cachedProduct.currentPrice}`,
            priceNumber: cachedProduct.currentPrice,
            imageUrl: cachedProduct.imageUrl,
            url: cachedProduct.url,
            cached: true,
          },
        });
      }
    }

    let scraped: any = null;
    let usedCache = false;
    const startTime = Date.now();

    const scrapeWithTimeout = Promise.race([
      scrapeProduct(normalizedUrl),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Scraping timeout")), MAX_EXECUTION_TIME - elapsedTime - 1000)
      ),
    ]) as Promise<any>;

    try {
      scraped = await scrapeWithTimeout;
    } catch (scrapeError: any) {
      const scrapeTime = Date.now() - startTime;
      console.error(`[API] Scrape failed after ${scrapeTime}ms:`, scrapeError.message);

      if (cachedProduct) {
        const cacheAge = Date.now() - new Date(cachedProduct.lastScrapedAt).getTime();
        const maxCacheAge = 7 * 24 * 60 * 60 * 1000;

        if (cacheAge < maxCacheAge) {
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
          if (cachedProduct.title && cachedProduct.currentPrice) {
            return NextResponse.json({
              success: true,
              data: {
                id: cachedProduct._id?.toString(),
                title: cachedProduct.title,
                price: `₹${cachedProduct.currentPrice}`,
                priceNumber: cachedProduct.currentPrice,
                imageUrl: cachedProduct.imageUrl,
                url: cachedProduct.url,
                cached: true,
                warning: "Showing cached data. Fresh scrape failed.",
              },
            });
          }

          return NextResponse.json(
            {
              success: false,
              error: {
                code: "SCRAPE_FAILED",
                message: "Unable to fetch product data. The product may be unavailable or the URL is invalid.",
              },
            },
            { status: 502 }
          );
        }
      } else {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "SCRAPE_FAILED",
              message: "Unable to fetch product data. The product may be unavailable or the URL is invalid.",
            },
          },
          { status: 502 }
        );
      }
    }

    if (!scraped?.title || !scraped?.price || scraped?.priceNumber == null) {
      if (cachedProduct && !usedCache) {
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
            success: false,
            error: {
              code: "INVALID_PRODUCT_DATA",
              message: "Product not found or could not be scraped",
            },
          },
          { status: 404 }
        );
      }
    }

    let trackedProduct: any = null;
    const elapsedBeforeSave = Date.now() - requestStartTime;

    if (dbConnected && elapsedBeforeSave < MAX_EXECUTION_TIME - 2000) {
      try {
        trackedProduct = await TrackedProduct.findOne({ url: normalizedUrl });

        if (trackedProduct) {
          trackedProduct.currentPrice = scraped.priceNumber;
          trackedProduct.title = scraped.title;
          trackedProduct.lastScrapedAt = new Date();
          trackedProduct.updatedAt = new Date();
          if (scraped.imageUrl) trackedProduct.imageUrl = scraped.imageUrl;
          if (scraped.brand) trackedProduct.brand = scraped.brand;
          if (scraped.model) trackedProduct.model = scraped.model;
          if (userEmail) trackedProduct.userEmail = userEmail;
          await trackedProduct.save();
        } else {
          trackedProduct = await TrackedProduct.create({
            url: normalizedUrl,
            title: scraped.title,
            currentPrice: scraped.priceNumber,
            userEmail: userEmail || undefined,
            imageUrl: scraped.imageUrl,
            brand: scraped.brand,
            model: scraped.model,
            lastScrapedAt: new Date(),
          });
        }
      } catch (dbError: any) {
        console.error("[API] Failed to save product:", dbError.message);
        if (cachedProduct && !trackedProduct) {
          trackedProduct = { _id: cachedProduct._id, url: cachedProduct.url };
        }
      }
    } else {
      if (cachedProduct && !trackedProduct) {
        trackedProduct = { _id: cachedProduct._id, url: cachedProduct.url };
      }
    }

    const elapsedBeforeHistory = Date.now() - requestStartTime;
    if (dbConnected && elapsedBeforeHistory < MAX_EXECUTION_TIME - 1000 && trackedProduct?._id) {
      try {
        await PriceHistory.create({
          productUrl: normalizedUrl,
          price: scraped.priceNumber,
          timestamp: new Date(),
        });
      } catch (historyError: any) {
        console.warn("[API] Failed to save price history:", historyError.message);
      }
    }

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
        console.warn("[API] Failed to handle alerts:", alertError.message);
      }
    }

    const totalExecutionTime = Date.now() - requestStartTime;

    return NextResponse.json({
      success: true,
      data: {
        id: trackedProduct?._id?.toString() || cachedProduct?._id?.toString(),
        title: scraped.title,
        price: scraped.price,
        priceNumber: scraped.priceNumber,
        imageUrl: scraped.imageUrl,
        url: trackedProduct?.url || cachedProduct?.url || normalizedUrl,
        cached: usedCache,
      },
    });
  } catch (err: any) {
    const totalExecutionTime = Date.now() - requestStartTime;
    console.error("[API] Unhandled error:", {
      message: err.message,
      stack: err.stack,
      executionTime: totalExecutionTime,
      url: requestBody?.url,
    });

    let status = err.status || 500;
    let code = "INTERNAL_ERROR";
    let message = err.message || "Internal server error";

    if (err.message?.includes("Failed to scrape") || err.message?.includes("Scraping timeout")) {
      message = "Unable to fetch product data. The product may be unavailable or the URL is invalid.";
      status = 502;
      code = "SCRAPE_FAILED";
    } else if (err.message?.includes("Product not found")) {
      message = "Product not found. Please check the URL and try again.";
      status = 404;
      code = "PRODUCT_NOT_FOUND";
    } else if (err.message?.includes("timeout")) {
      message = "Request timed out. Please try again.";
      status = 504;
      code = "TIMEOUT";
    } else if (err.name === "MongoServerError" || err.message?.includes("MongoDB")) {
      message = "Database error. Please try again later.";
      status = 503;
      code = "DATABASE_ERROR";
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code,
          message,
        },
      },
      { status }
    );
  }
}
