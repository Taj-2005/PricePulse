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
    if (userEmail && typeof userEmail !== "string") {
      return NextResponse.json({ error: "Invalid userEmail" }, { status: 400 });
    }


    const scraped = await scrapeProduct(url);
    if (!scraped?.title || !scraped?.price) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }


    await Product.create({
      url,
      title: scraped.title,
      price: scraped.price,
      timestamp: new Date(),
    });

    await TrackedProduct.findOneAndUpdate(
      { url },
      {
        $set: {
          url,
          title: scraped.title,
          targetPrice,
          currentPrice: scraped.price,
          ...(userEmail && { userEmail }),
        },
      },
      { upsert: true, new: true }
    );
    console.log("Updated tracked product with:", {
    title: scraped.title,
    currentPrice: scraped.price,
  });

    if (userEmail && targetPrice && scraped.price <= targetPrice) {
      await sendEmail(
        userEmail,
        "📉 Price Drop Alert from PricePulse!",
        `The product "${scraped.title}" is now ₹${scraped.price}, below your target of ₹${targetPrice}.\n\nLink: ${url}`
      );
    }

    return NextResponse.json({
      title: scraped.title,
      price: scraped.price,
    });
  } catch (err: any) {
    console.error("Track API error:", err);
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: err.status || 500 }
    );
  }
}
