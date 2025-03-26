import { NextRequest, NextResponse } from "next/server";
import { authenticate, isAdmin } from "@/middleware/auth.middleware";
import { generateUploadSignature } from "@/lib/cloudinary";

/**
 * This endpoint generates a signed upload signature for client-side uploads
 * to Cloudinary using next-cloudinary
 */
export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Admin role check
    if (!isAdmin(user)) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    // Parse the request body
    const data = await request.json();
    const { productId } = data;

    // Set folder for upload
    const folder = productId ? `products/${productId}` : "products/temp";

    // Use signed upload preset
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

    if (!uploadPreset) {
      return NextResponse.json(
        { message: "Upload preset not configured" },
        { status: 500 }
      );
    }

    // Generate a unique signature for this upload
    // Include more parameters in the signature
    const { signature, timestamp } = generateUploadSignature({
      folder,
      upload_preset: uploadPreset,
      // Add these parameters for better control
      resource_type: "image",
      allowed_formats: "jpg,png,jpeg,webp",
      max_file_size: 10000000, // 10MB limit
      transformation: "c_limit,w_1000,q_auto",
    });

    return NextResponse.json({
      signature,
      timestamp,
      folder,
      uploadPreset,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    });
  } catch (error) {
    console.error("Error generating upload signature:", error);
    return NextResponse.json(
      { message: "Error generating upload signature" },
      { status: 500 }
    );
  }
}
