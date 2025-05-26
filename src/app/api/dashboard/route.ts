import { NextResponse } from "next/server";
import TrackedProduct from "@/models/trackedProduct";
import { Product } from "@/models/product";
import { connectDB } from "@/lib/mongodb";
import { verifyJWT } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");
    console.log("AUTH HEADER:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized: Missing token" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    console.log("Token:", token);

    const decoded = verifyJWT(token);
    console.log("Decoded Token:", decoded);

    if (!decoded || typeof decoded === "string") {
      return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
    }

    const userId = (decoded as any).userId;
    console.log("User ID:", userId);

    const tracked = await TrackedProduct.find({ userId }).lean();
    console.log("Tracked Products:", tracked);

    const results = await Promise.all(
      tracked.map(async (item) => {
        const product = await Product.findOne({ url: item.url }).lean();
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
