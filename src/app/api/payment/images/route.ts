import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/middleware/auth.middleware";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary directly in the API route
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(request: NextRequest) {
  try {
    // Authentication check
    const authResult = await authenticate(request);
    if (!authResult.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const { publicId } = await request.json();
    
    // Validate required fields
    if (!publicId) {
      return NextResponse.json(
        { message: "Missing required field - publicId is required" },
        { status: 400 }
      );
    }

    // Delete from Cloudinary
    let deleteResult;
    try {
      deleteResult = await cloudinary.uploader.destroy(publicId);
      console.log("Cloudinary payment proof delete result:", deleteResult);
    } catch (cloudinaryError) {
      console.error("Error deleting payment proof from Cloudinary:", cloudinaryError);
      return NextResponse.json(
        { message: "Failed to delete image from Cloudinary", error: String(cloudinaryError) },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment proof image deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting payment proof image:", error);
    return NextResponse.json(
      { message: "Failed to delete image", error: String(error) },
      { status: 500 }
    );
  }
}
