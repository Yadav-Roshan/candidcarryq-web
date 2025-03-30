import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/product.model";
import { mockProducts } from "@/lib/api-mock-data";
import { authenticate, isAdmin } from "@/middleware/auth.middleware";
import { z } from "zod";

// Schema for creating product
const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().positive("Price must be positive"),
  salePrice: z.number().positive("Sale price must be positive").optional(),
  category: z.string(),
  image: z.string().url("Image must be a valid URL"),
  images: z.array(z.string().url()).optional(),
  colors: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
  material: z.string().optional(),
  dimensions: z.string().optional(),
  weight: z.string().optional(),
  capacity: z.string().optional(),
  fullDescription: z.string().optional(),
  featured: z.boolean().optional(),
  stock: z.number().int().nonnegative("Stock must be a non-negative integer"),
});

// GET - Get all products (public)
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const url = new URL(request.url);
    const category = url.searchParams.get("category");
    const featured = url.searchParams.has("featured")
      ? url.searchParams.get("featured") === "true"
      : undefined;

    // Build the query
    const query: any = {};
    if (category) query.category = category;
    if (featured !== undefined) query.featured = featured;

    // Try to connect to MongoDB
    try {
      await connectToDatabase();
      const products = await Product.find(query);

      return NextResponse.json({
        products: products.map((product) => ({
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
          isFeatured: product.featured,
        })),
      });
    } catch (dbError) {
      console.error("Database connection error:", dbError);

      // Fall back to mock data
      let filteredProducts = [...mockProducts];

      if (category) {
        filteredProducts = filteredProducts.filter(
          (p) => p.category?.toLowerCase() === category.toLowerCase()
        );
      }

      if (featured !== undefined) {
        filteredProducts = filteredProducts.filter(
          (p) => p.isFeatured === featured
        );
      }

      return NextResponse.json({ products: filteredProducts });
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// POST - Create new product (admin only)
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    // Authentication middleware
    const authResult = await authenticate(request);
    if (authResult.status !== 200) {
      return authResult;
    }

    // Admin check
    const adminCheckResult = await isAdmin(request, authResult.user);
    if (adminCheckResult.status !== 200) {
      return adminCheckResult;
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = productSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Validation error",
          errors: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    // Create product
    const product = await Product.create(validationResult.data);

    return NextResponse.json(
      {
        message: "Product created successfully",
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
