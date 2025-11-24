import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { PriceHistory, Product } from "@/models/product";

type CleanHistory = {
  price: number;
  timestamp: Date;
};

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");
    const filter = searchParams.get("filter") || "all"; // 24h, 7d, 30d, all

    if (!url) {
      return NextResponse.json(
        { error: "Missing url parameter" },
        { status: 400 }
      );
    }

    // Date range logic
    let startDate: Date | null = null;
    const now = new Date();

    switch (filter) {
      case "24h":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "all":
      default:
        startDate = null;
        break;
    }

    // Build query
    const query: any = { productUrl: url };
    if (startDate) {
      query.timestamp = { $gte: startDate };
    }

    let history: CleanHistory[] = [];

    // Fetch using new model
    const newHistory = await PriceHistory.find(query).sort({ timestamp: 1 }).lean();

    if (newHistory.length > 0) {
      history = newHistory.map((doc: any) => ({
        price: typeof doc.price === "number"
          ? doc.price
          : parseFloat(doc.price?.toString().replace(/[^0-9.]/g, "") || "0"),
        timestamp: doc.timestamp,
      }));
    } else {
      // Fallback to legacy model
      const legacyQuery: any = { url };
      if (startDate) {
        legacyQuery.timestamp = { $gte: startDate };
      }

      const legacyHistory = await Product.find(legacyQuery)
        .sort({ timestamp: 1 })
        .lean();

      history = legacyHistory.map((doc: any) => ({
        price: parseFloat(doc.price?.toString().replace(/[^0-9.]/g, "") || "0"),
        timestamp: doc.timestamp,
      }));
    }

    return NextResponse.json(history);
  } catch (err: any) {
    console.error("History API error:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
