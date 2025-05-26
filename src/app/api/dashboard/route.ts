import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import TrackedProduct from "@/models/trackedProduct";
import Product from "@/models/product";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const decoded = jwt.decode(token) as { email?: string } | null;

    if (!decoded || !decoded.email) {
      return new Response(JSON.stringify({ error: "Invalid token payload" }), {
        status: 401,
      });
    }

    await connectDB();

    const trackedProducts = await TrackedProduct.find({
      userEmail: decoded.email,
    }).populate("product"); // ✅ populate product reference

    return new Response(JSON.stringify({ trackedProducts }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
