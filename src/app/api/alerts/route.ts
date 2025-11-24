import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Alert from "@/models/Alert";
import TrackedProduct from "@/models/trackedProduct";
import { createOrUpdateAlert } from "@/services/alertService";

/**
 * GET /api/alerts?productId=xxx OR ?userEmail=xxx
 * Get all alerts for a product or user
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const userEmail = searchParams.get("userEmail");

    if (!productId && !userEmail) {
      return NextResponse.json(
        { error: "Missing productId or userEmail parameter" },
        { status: 400 }
      );
    }

    let query: any = {};
    if (productId) {
      query.productId = productId;
    }
    if (userEmail) {
      query.userEmail = userEmail;
    }

    const alerts = await Alert.find(query)
      .sort({ createdAt: -1 })
      .lean();
    
    // Fetch products separately since lean() doesn't work well with populate
    const alertsWithProducts = await Promise.all(
      alerts.map(async (alert: any) => {
        const productId = alert.productId;
        const product = await TrackedProduct.findById(productId).lean();
        
        return {
          ...alert,
          productId: product || {
            _id: productId,
            title: 'Product Not Found',
            url: '',
            currentPrice: 0,
            imageUrl: ''
          }
        };
      })
    );
    
    return NextResponse.json(alertsWithProducts);
  } catch (error: any) {
    console.error("Get alerts error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/alerts
 * Create or update an alert
 * Body: { productId, userEmail, targetPrice }
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { productId, userEmail, targetPrice } = await request.json();

    if (!productId || !userEmail || !targetPrice) {
      return NextResponse.json(
        { error: "Missing required fields: productId, userEmail, targetPrice" },
        { status: 400 }
      );
    }

    // Validate product exists
    const product = await TrackedProduct.findById(productId);
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate target price
    if (typeof targetPrice !== "number" || targetPrice <= 0) {
      return NextResponse.json(
        { error: "Target price must be a positive number" },
        { status: 400 }
      );
    }

    const alert = await createOrUpdateAlert(productId, userEmail, targetPrice);

    return NextResponse.json({
      message: "Alert created/updated successfully",
      alert,
    });
  } catch (error: any) {
    console.error("Create alert error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/alerts?id=xxx
 * Delete an alert
 */
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get("id");

    if (!alertId) {
      return NextResponse.json(
        { error: "Missing alert id parameter" },
        { status: 400 }
      );
    }

    await Alert.findByIdAndDelete(alertId);

    return NextResponse.json({ message: "Alert deleted successfully" });
  } catch (error: any) {
    console.error("Delete alert error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}

