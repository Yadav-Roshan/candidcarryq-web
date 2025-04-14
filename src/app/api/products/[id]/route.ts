import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/product.model";
import { authenticate, isAdmin } from "@/middleware/auth.middleware";
import { z } from "zod";
import mongoose from "mongoose";
import { deleteImage, deleteMultipleImages } from "@/lib/cloudinary";
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
  images?: string[];
  imagePublicIds?: string[];
  material?: string;
  dimensions?: string;
  weight?: string;
  capacity?: string;
  colors?: string[];
  sizes?: string[];
  fullDescription?: string;
  warranty?: string;
  returnPolicy?: string;
  publishedDate?: Date;
}

// Update the product schema validation for updates
const updateProductSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .optional(),
  price: z.number().positive("Price must be positive").optional(),
  salePrice: z
    .number()
    .positive("Sale price must be positive")
    .optional()
    .nullable(),
  category: z.string().optional(),
  image: z.string().url("Image must be a valid URL").optional(),
  images: z
    .array(z.string().url())
    .min(1, "At least one image is required")
    .max(3, "Maximum 3 images allowed")
    .optional(),
  imagePublicIds: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
  material: z.string().optional(),
  dimensions: z.string().optional(),
  weight: z.string().optional(),
  capacity: z.string().optional(),
  fullDescription: z.string().optional(),
  featured: z.boolean().optional(),
  stock: z
    .number()
    .int()
    .nonnegative("Stock must be a non-negative integer")
    .optional(),
});

// Check if ID is a valid MongoDB ObjectId
function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET - Get single product (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Resolve params if it's a Promise

    await connectToDatabase();

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid product ID format" },
        { status: 400 }
      );
    }

    // Find product in database
    const product = (await Product.findById(id)) as ProductDocument;

    if (!product) {
      // Don't fall back to mock data, just return a 404
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // Return the found product
    return NextResponse.json({
      product: {
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
        featured: product.featured, // Changed from isFeatured to featured
        images: product.images,
        imagePublicIds: product.imagePublicIds,
        material: product.material,
        dimensions: product.dimensions,
        weight: product.weight,
        capacity: product.capacity,
        colors: product.colors,
        sizes: product.sizes,
        fullDescription: product.fullDescription,
        warranty: product.warranty,
        returnPolicy: product.returnPolicy,
      },
    });
  } catch (error) {
    console.error(
      `Error fetching product ${
        params instanceof Promise ? await params.then((p) => p.id) : id
      }:`,
      error
    );
    return NextResponse.json(
      { message: "Error fetching product" },
      { status: 500 }
    );
  }
}

// PUT - Update product (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Resolve params if it's a Promise
    const { id } = await params;

    // Ensure id is valid
    if (!id) {
      return NextResponse.json(
        { message: "Product ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Authentication middleware
    const authResult = await authenticate(request);
    if (authResult.status !== 200 || !authResult.user) {
      return NextResponse.json(
        { message: authResult.message || "Unauthorized" },
        { status: authResult.status || 401 }
      );
    }

    const user = authResult.user;

    // Admin check - log the user role to debug
    console.log("User role:", user.role);
    if (user.role !== "admin") {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateProductSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Validation error",
          errors: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    // Get the product to check if we need to delete old images
    const existingProduct = (await Product.findById(id)) as ProductDocument;
    if (!existingProduct) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // If we're updating images and have old image public IDs, delete those from Cloudinary
    if (
      validationResult.data.images &&
      existingProduct.imagePublicIds &&
      existingProduct.imagePublicIds.length > 0
    ) {
      const oldPublicIds = existingProduct.imagePublicIds;
      const newPublicIds = validationResult.data.imagePublicIds || [];

      // Delete images that are no longer used
      const toDelete = oldPublicIds.filter((id) => !newPublicIds.includes(id));

      if (toDelete.length > 0) {
        console.log(
          `Deleting ${toDelete.length} unused images from Cloudinary`
        );
        // Use batch delete for efficiency
        await deleteMultipleImages(toDelete.filter((id) => id));
      }
    }

    // Find and update product - no mapping needed
    const updateData = {
      ...validationResult.data,
    };

    const product = (await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })) as ProductDocument;

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Product updated successfully",
      product: {
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
        featured: product.featured,
        images: product.images,
        imagePublicIds: product.imagePublicIds,
        material: product.material,
        dimensions: product.dimensions,
        weight: product.weight,
        capacity: product.capacity,
        colors: product.colors,
        sizes: product.sizes,
        fullDescription: product.fullDescription,
        publishedDate: product.publishedDate,
        warranty: product.warranty,
        returnPolicy: product.returnPolicy,
      },
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// DELETE - Delete product (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Resolve params if it's a Promise
    const { id } = await params;

    // Ensure id is valid
    if (!id) {
      return NextResponse.json(
        { message: "Product ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Authentication middleware
    const authResult = await authenticate(request);
    if (authResult.status !== 200 || !authResult.user) {
      return NextResponse.json(
        { message: authResult.message || "Unauthorized" },
        { status: authResult.status || 401 }
      );
    }

    const user = authResult.user;

    // Admin check
    if (user.role !== "admin") {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    // Find the product to get image IDs for deletion
    const product = (await Product.findById(id)) as ProductDocument;
    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // Delete images from Cloudinary
    if (product.imagePublicIds && product.imagePublicIds.length > 0) {
      for (const publicId of product.imagePublicIds) {
        if (publicId) {
          await deleteImage(publicId);
        }
      }
    }

    // Delete the product
    await Product.findByIdAndDelete(id);

    return NextResponse.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
