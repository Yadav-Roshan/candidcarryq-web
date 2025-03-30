import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/product.model";
import { authenticate, isAdmin } from "@/middleware/auth.middleware";
import { z } from "zod";
import { Document } from "mongoose";

// Define a ProductDocument interface for proper typing
interface ProductDocument extends Document {
  _id: any;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  image: string;
  category: string;
  rating?: number;
  reviewCount?: number;
  stock: number;
  featured?: boolean;
  publishedDate?: Date;
}

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

// GET - Fetch products with filtering
export async function GET(request: NextRequest) {
  try {
    // Parse URL parameters
    const url = new URL(request.url);
    const category = url.searchParams.get("category");
    const featured = url.searchParams.get("featured") === "true";
    const search = url.searchParams.get("search");
    const sort = url.searchParams.get("sort") || "-publishedDate"; // Default sort by newest
    const minPrice = url.searchParams.get("minPrice")
      ? parseInt(url.searchParams.get("minPrice") || "0")
      : undefined;
    const maxPrice = url.searchParams.get("maxPrice")
      ? parseInt(url.searchParams.get("maxPrice") || "0")
      : undefined;
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "12");

    // Skip value for pagination
    const skip = (page - 1) * limit;

    // Try database connection
    try {
      await connectToDatabase();

      // Build query based on filters
      let query: any = {};

      if (category) {
        query.category = category;
      }

      if (featured) {
        query.featured = true;
      }

      // Handle search
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
        ];
      }

      // Handle price range
      if (minPrice !== undefined || maxPrice !== undefined) {
        query.price = {};
        if (minPrice !== undefined) query.price.$gte = minPrice;
        if (maxPrice !== undefined) query.price.$lte = maxPrice;
      }

      // Count total matching products for pagination info
      const total = await Product.countDocuments(query);

      // Execute query with pagination and sorting
      const products = (await Product.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)) as ProductDocument[];

      // Format products for response
      const formattedProducts = products.map((product) => ({
        id: product._id.toString(),
        name: product.name,
        description: product.description,
        price: product.price,
        salePrice: product.salePrice || null,
        image: product.image,
        category: product.category,
        rating: product.rating || 0,
        reviewCount: product.reviewCount || 0,
        stock: product.stock || 0,
      }));

      // Calculate pagination info
      const totalPages = Math.ceil(total / limit);

      return NextResponse.json({
        products: formattedProducts,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      });
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      return NextResponse.json({ message: "Server error" }, { status: 500 });
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
