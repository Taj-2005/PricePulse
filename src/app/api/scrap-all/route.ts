import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { TrackedProduct } from "@/models/trackedProduct";

export async function GET() {
  try {
    await connectDB();
    const products = await TrackedProduct.find();

    for (const product of products) {
      fetch(`${process.env.APP_URL}/api/scrape-single`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: product.url }),
      });
    }

    return NextResponse.json({ message: "Triggered all scrapes." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}