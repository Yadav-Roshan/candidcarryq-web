import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/product.model";
import { authenticate, isAdmin } from "@/middleware/auth.middleware";
import { z } from "zod";
import mongoose from "mongoose";
import { mockProducts } from "@/lib/api-mock-data";
import { deleteImage, deleteMultipleImages } from "@/lib/cloudinary";

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
  isFeatured: z.boolean().optional(),
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
  { params }: { params: { id: string } }
) {
  try {
    // Ensure params.id is valid before using it
    if (!params || !params.id) {
      return NextResponse.json(
        { message: "Product ID is required" },
        { status: 400 }
      );
    }

    const id = params.id;

    // Try to connect to MongoDB
    try {
      await connectToDatabase();
      const product = await Product.findById(id);

      if (!product) {
        // Check mock data
        const mockProduct = mockProducts.find((p) => p.id === id);
        if (mockProduct) {
          return NextResponse.json({ product: mockProduct });
        }
        return NextResponse.json(
          { message: "Product not found" },
          { status: 404 }
        );
      }

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
          isFeatured: product.featured,
          images: product.images,
          imagePublicIds: product.imagePublicIds,
          material: product.material,
          dimensions: product.dimensions,
          weight: product.weight,
          capacity: product.capacity,
          fullDescription: product.fullDescription,
          publishedDate: product.publishedDate,
          colors: product.colors,
          sizes: product.sizes,
        },
      });
    } catch (dbError) {
      console.error("Database connection error:", dbError);

      // Check mock data
      const mockProduct = mockProducts.find((p) => p.id === id);
      if (mockProduct) {
        return NextResponse.json({ product: mockProduct });
      }

      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// PUT - Update product (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure params.id is valid before using it
    if (!params || !params.id) {
      return NextResponse.json(
        { message: "Product ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Authentication middleware
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Admin check
    if (!isAdmin(user)) {
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
    const existingProduct = await Product.findById(params.id);
    if (!existingProduct) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // If we're updating images and have old image public IDs, delete those from Cloudinary
    if (
      validationResult.data.images &&
      existingProduct.imagePublicIds?.length > 0
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

    // Find and update product - make sure we're properly mapping fields
    const updateData = {
      ...validationResult.data,
      // Explicitly map isFeatured to featured if it exists in the data
      ...(validationResult.data.isFeatured !== undefined && {
        featured: validationResult.data.isFeatured,
      }),
    };

    const product = await Product.findByIdAndUpdate(params.id, updateData, {
      new: true,
      runValidators: true,
    });

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
        isFeatured: product.featured,
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
  { params }: { params: { id: string } }
) {
  try {
    // Ensure params.id is valid before using it
    if (!params || !params.id) {
      return NextResponse.json(
        { message: "Product ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Authentication middleware
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Admin check
    if (!isAdmin(user)) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    // Find the product to get image IDs for deletion
    const product = await Product.findById(params.id);
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
    await Product.findByIdAndDelete(params.id);

    return NextResponse.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
