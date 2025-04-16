import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/middleware/auth.middleware";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/product.model";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary directly in the API route to ensure it's available
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY, // Updated to use the correct env variable
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Authenticate and verify admin role
    const authResult = await authenticate(request);
    if (!authResult.user || authResult.user.role !== "admin") {
      return NextResponse.json(
        { message: "Access denied - Admin role required" },
        { status: 403 }
      );
    }

    // Parse request body
    const { productId, imageUrl, publicId } = await request.json();
    
    // Validate required fields
    if (!productId || !imageUrl || !publicId) {
      return NextResponse.json(
        { message: "Missing required fields - productId, imageUrl, and publicId are required" },
        { status: 400 }
      );
    }

    // Get the product first
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // Only attempt to delete from Cloudinary if there are multiple images
    // or if we're going to keep a placeholder image
    let deleteResult = false;
    try {
      // Delete from Cloudinary (directly using cloudinary instance)
      deleteResult = await cloudinary.uploader.destroy(publicId);
      console.log("Cloudinary delete result:", deleteResult);
    } catch (cloudinaryError) {
      console.error("Error deleting from Cloudinary:", cloudinaryError);
      // Continue with database update even if Cloudinary delete fails
    }

    // Special handling to maintain at least one image (MongoDB validation)
    if (product.images.length <= 1) {
      // If this is the last image, we need to disable validation temporarily
      // or replace with a placeholder
      
      // Option 1: Use findByIdAndUpdate to bypass validation
      const result = await Product.findByIdAndUpdate(
        productId,
        {
          $set: { 
            // Set a placeholder image
            images: ["https://placeholder.com/400"],
            imagePublicIds: ["placeholder"],
            image: "https://placeholder.com/400"
          }
        },
        { new: true, runValidators: false }
      );
      
      return NextResponse.json({
        success: true,
        message: "Image deleted and replaced with placeholder"
      });
    } else {
      // Normal case - multiple images exist
      
      // Remove the image from arrays
      product.images = product.images.filter(img => img !== imageUrl);
      product.imagePublicIds = product.imagePublicIds.filter(id => id !== publicId);

      // Update main image if needed
      if (product.image === imageUrl && product.images.length > 0) {
        product.image = product.images[0];
      }

      await product.save();

      return NextResponse.json({
        success: true,
        message: "Image deleted successfully"
      });
    }
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json(
      { message: "Failed to delete image", error: String(error) },
      { status: 500 }
    );
  }
}
