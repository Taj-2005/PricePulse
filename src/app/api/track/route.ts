import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TrackedProduct from "@/models/trackedProduct";
import { PriceHistory } from "@/models/product";
import { scrapeProduct } from "@/services/scraperService";
import { createOrUpdateAlert, checkAndSendAlert } from "@/services/alertService";

export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const { url, userEmail, targetPrice } = await req.json();

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

    // Scrape product
    const scraped = await scrapeProduct(url);
    if (!scraped?.title || !scraped?.price) {
      return NextResponse.json(
        { error: "Product not found or could not be scraped" },
        { status: 404 }
      );
    }

    // Find or create tracked product
    let trackedProduct = await TrackedProduct.findOne({ url });

    if (trackedProduct) {
      // Update existing product
      trackedProduct.currentPrice = scraped.priceNumber;
      trackedProduct.title = scraped.title;
      trackedProduct.lastScrapedAt = new Date();
      trackedProduct.updatedAt = new Date();
      if (scraped.imageUrl) trackedProduct.imageUrl = scraped.imageUrl;
      if (scraped.brand) trackedProduct.brand = scraped.brand;
      if (userEmail) trackedProduct.userEmail = userEmail;
      await trackedProduct.save();
    } else {
      // Create new tracked product
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
    }

    // Save to price history
    await PriceHistory.create({
      productUrl: url,
      price: scraped.priceNumber,
      timestamp: new Date(),
    });

    // Create or update alert if target price and email provided
    if (userEmail && targetPrice) {
      await createOrUpdateAlert(
        trackedProduct._id.toString(),
        userEmail,
        targetPrice
      );

      // Check if we should send an immediate alert
      if (scraped.priceNumber <= targetPrice) {
        await checkAndSendAlert(trackedProduct._id.toString(), scraped.priceNumber);
      }
    }

    return NextResponse.json({
      id: trackedProduct._id.toString(),
      title: scraped.title,
      price: scraped.price,
      priceNumber: scraped.priceNumber,
      imageUrl: scraped.imageUrl,
      url: trackedProduct.url,
    });
  } catch (err: any) {
    console.error("Track API error:", err);
    
    // Provide user-friendly error messages
    let status = err.status || 500;
    let message = err.message || "Unknown error";

    if (err.message?.includes("Failed to scrape")) {
      status = 502;
      message = "Unable to fetch product data. The product may be unavailable or the URL is invalid.";
    } else if (err.message?.includes("Product not found")) {
      status = 404;
      message = "Product not found. Please check the URL and try again.";
    }

    return NextResponse.json({ error: message }, { status });
  }
}
