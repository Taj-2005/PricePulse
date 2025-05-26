import { NextResponse } from "next/server";
import TrackedProduct from "@/models/trackedProduct";
import {Product} from "@/models/product";
import {connectDB} from "@/lib/mongodb";
import { verifyJWT } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await connectDB();
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyJWT(token);

    if (!decoded || typeof decoded === "string") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (decoded as any).userId;

    // Get tracked products by this user
    const tracked = await TrackedProduct.find({ userId }).lean();

    // For each tracked product, fetch latest product data and history
    const results = await Promise.all(
      tracked.map(async (item) => {
        const product = await Product.findOne({ url: item.url }).lean();

        // Assume product.history is array of {price, timestamp}
        return {
        ...item,
        product,
        };
      })
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
