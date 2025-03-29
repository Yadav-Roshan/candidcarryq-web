import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/product.model";
import { authenticate, isAdmin } from "@/middleware/auth.middleware";
import { z } from "zod";
import { deleteImage, deleteMultipleImages } from "@/lib/cloudinary";

// Schema for updating product
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
  featured: z.boolean().optional(), // Changed from isFeatured to featured
  stock: z
    .number()
    .int()
    .nonnegative("Stock must be a non-negative integer")
    .optional(),
  warranty: z.string().optional(),
  returnPolicy: z.string().optional(),
});

// GET - Get single product (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
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

    // Resolve params if it's a Promise
    const resolvedParams = params instanceof Promise ? await params : params;
    const id = resolvedParams.id;

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // Create the product response with guaranteed values for warranty and returnPolicy
    const productData = {
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      fullDescription: product.fullDescription,
      price: product.price,
      salePrice: product.salePrice,
      category: product.category,
      image: product.image,
      images: product.images,
      imagePublicIds: product.imagePublicIds,
      colors: product.colors,
      sizes: product.sizes,
      material: product.material,
      dimensions: product.dimensions,
      weight: product.weight,
      capacity: product.capacity,
      rating: product.rating,
      reviewCount: product.reviewCount,
      stock: product.stock,
      featured: product.featured, // Changed from isFeatured to featured
      warranty: product.warranty !== undefined ? product.warranty : "",
      returnPolicy:
        product.returnPolicy !== undefined ? product.returnPolicy : "",
    };

    return NextResponse.json({ product: productData });
  } catch (error) {
    console.error(`Error fetching product ${params.id}:`, error);
    return NextResponse.json(
      { message: "Error fetching product" },
      { status: 500 }
    );
  }
}

// PUT - Update product (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
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

    // Resolve params if it's a Promise
    const resolvedParams = params instanceof Promise ? await params : params;
    const id = resolvedParams.id;

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

    // Get existing product for image cleanup
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // Handle image deletion if needed
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
        await deleteMultipleImages(toDelete.filter((id) => id));
      }
    }

    // Create update data without mapping
    const updateData = {
      ...validationResult.data,
      // No isFeatured to featured mapping needed
    };

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedProduct) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Product updated successfully",
      product: {
        id: updatedProduct._id.toString(),
        name: updatedProduct.name,
        price: updatedProduct.price,
        image: updatedProduct.image,
        description: updatedProduct.description,
        category: updatedProduct.category,
        salePrice: updatedProduct.salePrice,
        rating: updatedProduct.rating,
        reviewCount: updatedProduct.reviewCount,
        stock: updatedProduct.stock,
        featured: updatedProduct.featured, // Changed from isFeatured to featured
        images: updatedProduct.images,
        imagePublicIds: updatedProduct.imagePublicIds,
        material: updatedProduct.material,
        dimensions: updatedProduct.dimensions,
        weight: updatedProduct.weight,
        capacity: updatedProduct.capacity,
        colors: updatedProduct.colors,
        sizes: updatedProduct.sizes,
        fullDescription: updatedProduct.fullDescription,
        warranty: updatedProduct.warranty,
        returnPolicy: updatedProduct.returnPolicy,
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
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
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

    // Resolve params if it's a Promise
    const resolvedParams = params instanceof Promise ? await params : params;
    const id = resolvedParams.id;

    // Find the product
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // Delete images from Cloudinary
    if (product.imagePublicIds && product.imagePublicIds.length > 0) {
      await deleteMultipleImages(product.imagePublicIds.filter(Boolean));
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
