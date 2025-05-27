import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TrackedProduct from "@/models/trackedProduct";

export async function GET() {
  try {
    await connectDB();

    const products = await TrackedProduct.find({}).lean();

    return NextResponse.json(products || []);
  } catch (error) {
    console.error("Error fetching tracked products:", error);
    return NextResponse.json([]);
  }
}