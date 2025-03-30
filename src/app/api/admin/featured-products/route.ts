import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/product.model";
import { authenticate, isAdmin } from "@/middleware/auth.middleware";
import { mockProducts } from "@/lib/api-mock-data";

// GET endpoint to fetch featured products
export async function GET(request: NextRequest) {
  try {
    // For featured products, we don't need authentication
    // since this could be used on the public-facing part of the site

    try {
      await connectToDatabase();
      const featuredProducts = await Product.find({ featured: true });

      return NextResponse.json(
        featuredProducts.map((product) => ({
          id: product._id.toString(),
          name: product.name,
          price: product.price,
          image: product.image,
          description: product.description,
          category: product.category,
          salePrice: product.salePrice,
          rating: product.rating,
          reviewCount: product.reviewCount,
          stock: product.stock,
          featured: true, // Changed from isFeatured to featured
        }))
      );
    } catch (dbError) {
      console.error("Database connection error:", dbError);

      // Fall back to mock data
      const featured = mockProducts.filter((p) => p.featured).slice(0, 4);
      return NextResponse.json(featured);
    }
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// PUT endpoint to update featured products
export async function PUT(request: NextRequest) {
  try {
    // Authentication check
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Admin check
    if (!isAdmin(user)) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    // Parse body
    const body = await request.json();
    const { productIds } = body;

    if (!Array.isArray(productIds)) {
      return NextResponse.json(
        { message: "Invalid request: productIds must be an array" },
        { status: 400 }
      );
    }

    // Update in database
    try {
      await connectToDatabase();

      // First, reset all featured products
      await Product.updateMany({}, { featured: false });

      // Then, set the selected ones as featured
      await Product.updateMany(
        { _id: { $in: productIds } },
        { featured: true }
      );

      return NextResponse.json({ success: true });
    } catch (dbError) {
      console.error("Database error when updating featured products:", dbError);
      return NextResponse.json({ message: "Database error" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error updating featured products:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
