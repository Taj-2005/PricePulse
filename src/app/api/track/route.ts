import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TrackedProduct from "@/models/trackedProduct";
import { Product } from "@/models/product";
import { scrapeProduct } from "@/lib/scraper";
import { NextRequest } from "next/server";
import { sendEmail } from "@/lib/sendEmail";

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const { url, userEmail, targetPrice } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // Scrape product data
    const scraped = await scrapeProduct(url);
    if (!scraped?.title || !scraped?.price) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Save price snapshot
    await Product.create({
      url,
      title: scraped.title,
      price: scraped.price,
    });

    // Track product for future cron jobs
    const existing = await TrackedProduct.findOne({ url });
    if (!existing) {
      await TrackedProduct.create({
        url,
        userEmail: userEmail || null,
        targetPrice: targetPrice || null,
      });
    }

    // Send alert if price is below target
    if (userEmail && targetPrice) {
      const numericPrice = parseFloat(scraped.price.replace(/[^\d.]/g, ""));
      if (numericPrice <= targetPrice) {
        await sendEmail(
          userEmail,
          "📉 Price Drop Alert from PricePulse!",
          `The product "${scraped.title}" is now ₹${numericPrice}, below your target of ₹${targetPrice}.\n\nLink: ${url}`
        );
        console.log(`📧 Email sent to ${userEmail}`);
      }
    }

    return NextResponse.json({
      title: scraped.title,
      price: scraped.price,
    });
  } catch (err: any) {
  console.error("Track API error:", err.message);
  return NextResponse.json(
    { error: err.message || "Unknown error" },
    { status: err.status || 500 }
  );
}

}
