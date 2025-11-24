import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TrackedProduct from "@/models/trackedProduct";
import { verifyJWT } from "@/lib/verifyJWT";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get("userEmail");

    const query: any = {};
    if (userEmail) {
      query.userEmail = userEmail;
    }

    const products = await TrackedProduct.find(query)
      .sort({ updatedAt: -1 })
      .lean();

    if (userEmail) {
      let totalValue = 0;
      if (products.length > 0) {
        const validPrices = products
          .map((p: any) => {
            const price = p.currentPrice;
            if (price == null) return null;
            
            if (typeof price === 'number') {
              return isNaN(price) || price <= 0 ? null : price;
            }
            
            if (typeof price === 'string') {
              const cleaned = price.replace(/[₹,\s]/g, '');
              const parsed = parseFloat(cleaned);
              return isNaN(parsed) || parsed <= 0 ? null : parsed;
            }
            
            return null;
          })
          .filter((price: number | null) => price != null) as number[];
        
        if (validPrices.length > 0) {
          totalValue = validPrices.reduce((acc: number, price: number) => acc + price, 0);
        }
      }

      return NextResponse.json({
        products: products || [],
        totalValue: Math.round(totalValue),
      });
    }

    return NextResponse.json(products || []);
  } catch (error: any) {
    console.error("Error fetching tracked products:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}


export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = verifyJWT(token);
      if (!decoded || typeof decoded === "string") {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("id");

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const product = await TrackedProduct.findById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const userEmail = (decoded as any).email;
    if (product.userEmail !== userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await TrackedProduct.findByIdAndDelete(productId);

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting tracked product:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}