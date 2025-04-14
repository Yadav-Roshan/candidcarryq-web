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
  price: number;
  image: string;
  description: string;
  category: string;
  salePrice?: number;
  rating?: number;
  reviewCount?: number;
  stock: number;
  featured: boolean;
  publishedDate?: Date;
  images?: string[];
  imagePublicIds?: string[];
  material?: string;
  dimensions?: string;
  weight?: string;
  capacity?: string;
  fullDescription?: string;
  warranty?: string;
  returnPolicy?: string;
}

// Schema for creating product
const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().positive("Price must be positive"),
  salePrice: z
    .number()
    .positive("Sale price must be positive")
    .optional()
    .nullable(),
  category: z.string(),
  image: z.string().url("Main image must be a valid URL"),
  images: z
    .array(z.string().url("Image must be a valid URL"))
    .min(1, "At least one image is required")
    .max(3, "Maximum 3 images allowed"),
  imagePublicIds: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
  material: z.string().optional(),
  dimensions: z.string().optional(),
  weight: z.string().optional(),
  capacity: z.string().optional(),
  fullDescription: z.string().optional(),
  featured: z.boolean().optional(), // Field name in the database
  isFeatured: z.boolean().optional(), // Field name from the client
  stock: z.number().int().nonnegative("Stock must be a non-negative integer"),
  publishedDate: z.date().optional(),
  warranty: z.string().optional(),
  returnPolicy: z.string().optional(),
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
      const products = (await Product.find(query).sort({
        publishedDate: -1,
      })) as ProductDocument[];

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
          publishedDate: product.publishedDate,
          images: product.images,
        })),
      });
    } catch (dbError) {
      console.error("Database connection error:", dbError);

      return NextResponse.json(
        { message: "Database Server error" },
        { status: 500 }
      );
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
    if (authResult.status !== 200 || !isAdmin(authResult.user)) {
      return NextResponse.json(
        { message: authResult.message || "Access denied" },
        { status: authResult.status || 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();

    // Remove the mapping and just assign publishedDate
    const processedBody = {
      ...body,
      publishedDate: new Date(),
      // No mapping needed between featured and isFeatured
    };

    const validationResult = productSchema.safeParse(processedBody);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Validation error",
          errors: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    // Create product with proper type annotation
    const product = (await Product.create(
      validationResult.data
    )) as ProductDocument;

    return NextResponse.json(
      {
        message: "Product created successfully",
        product: {
          id: product._id.toString(),
          ...validationResult.data,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
