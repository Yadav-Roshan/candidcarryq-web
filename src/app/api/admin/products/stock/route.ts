import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/product.model";
import { authenticate, isAdmin } from "@/middleware/auth.middleware";

// GET - Get stock information for multiple products
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Authentication middleware
    const authResult = await authenticate(request);
    if (!authResult || authResult.status !== 200) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = authResult.user;

    // Admin check
    if (!isAdmin(user)) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    // Parse product IDs from URL
    const searchParams = request.nextUrl.searchParams;
    const productIds = searchParams.getAll("id");

    if (!productIds || productIds.length === 0) {
      return NextResponse.json(
        { message: "No product IDs provided" },
        { status: 400 }
      );
    }

    // Get stock information for the specified products
    const products = await Product.find({ _id: { $in: productIds } })
      .select("_id stock name")
      .lean();

    return NextResponse.json({
      products,
    });
  } catch (error) {
    console.error("Product stock API error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
