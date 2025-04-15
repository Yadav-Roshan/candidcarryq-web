import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/product.model";
import { authenticate, isAdmin } from "@/middleware/auth.middleware";
import { Document } from "mongoose"; // Import Document type from mongoose

// Define a minimal interface for Product document properties
interface ProductDocument extends Document {
  _id: any;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  salePrice?: number;
  rating?: number;
  reviewCount?: number;
  stock: number;
  featured: boolean;
}

// GET endpoint to fetch featured products
export async function GET(request: NextRequest) {
  // Set cache control headers to prevent caching
  const headers = new Headers();
  headers.set('Cache-Control', 'no-store, must-revalidate, max-age=0');
  headers.set('Pragma', 'no-cache');
  headers.set('Expires', '0');

  try {
    // For featured products, we don't need authentication
    // since this could be used on the public-facing part of the site

    try {
      await connectToDatabase();
      const featuredProducts = (await Product.find({
        featured: true,
      })) as ProductDocument[];

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
        })),
        { headers }
      );
    } catch (dbError) {
      console.error("Database connection error:", dbError);
    }
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500, headers }
    );
  }
}

// PUT endpoint to update featured products
export async function PUT(request: NextRequest) {
  try {
    // Authentication check
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
