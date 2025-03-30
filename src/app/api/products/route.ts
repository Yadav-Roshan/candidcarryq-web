import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/product.model";
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
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const category = searchParams.get("category");
    const sort = searchParams.get("sort") || "newest";
    const featured = searchParams.get("featured") === "true";
    const minPrice = searchParams.get("minPrice")
      ? parseInt(searchParams.get("minPrice") || "0")
      : undefined;
    const maxPrice = searchParams.get("maxPrice")
      ? parseInt(searchParams.get("maxPrice") || "100000")
      : undefined;

    await connectToDatabase();

    // Build query
    const query: any = {};

    if (category) {
      query.category = category;
    }

    if (featured) {
      query.featured = true;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = minPrice;
      if (maxPrice !== undefined) query.price.$lte = maxPrice;
    }

    // Determine sort order
    let sortOption = {};
    switch (sort) {
      case "price-low":
        sortOption = { price: 1 };
        break;
      case "price-high":
        sortOption = { price: -1 };
        break;
      case "name-asc":
        sortOption = { name: 1 };
        break;
      case "name-desc":
        sortOption = { name: -1 };
        break;
      default:
        sortOption = { createdAt: -1 }; // newest first
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    // Instead of falling back to mock data, just return what we have (even if empty)
    return NextResponse.json({
      products: products.map((product) => ({
        id: product._id.toString(),
        name: product.name,
        description: product.description,
        price: product.price,
        salePrice: product.salePrice || undefined,
        category: product.category,
        image: product.image,
        rating: product.rating || undefined,
        reviewCount: product.reviewCount || undefined,
        stock: product.stock || 0,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    // Return empty array instead of mock data on error
    return NextResponse.json({
      products: [],
      pagination: { page: 1, limit: 12, total: 0, pages: 0 },
    });
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
