import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/product.model";
import { authenticate, isAdmin } from "@/middleware/auth.middleware";
import mongoose from "mongoose";

// GET - Get stock information for multiple products
export async function GET(request: NextRequest) {
  try {
    // Authentication middleware
    const authResult = await authenticate(request);
    if (authResult.status !== 200) {
      return NextResponse.json(
        { message: authResult.message || "Unauthorized" },
        { status: authResult.status }
      );
    }

    // Admin check
    if (!isAdmin(authResult.user)) {
      return NextResponse.json(
        { message: "Access denied - Admin only" },
        { status: 403 }
      );
    }

    // Get product IDs from query parameters
    const url = new URL(request.url);
    const ids = url.searchParams.getAll("id");

    // Filter out invalid IDs
    const validIds = ids.filter(
      (id) => id && id !== "undefined" && mongoose.Types.ObjectId.isValid(id)
    );

    if (validIds.length === 0) {
      return NextResponse.json({
        products: [],
        message: "No valid product IDs provided",
      });
    }

    await connectToDatabase();

    // Get stock information for the specified products
    const products = await Product.find({ _id: { $in: validIds } })
      .select("_id stock name")
      .lean();

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Product stock API error:", error);
    return NextResponse.json(
      {
        message: "Error fetching product stock information",
        error: String(error),
      },
      { status: 500 }
    );
  }
}
