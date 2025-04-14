import { NextRequest, NextResponse } from "next/server";
import {
  authenticate,
  getToken,
  verifyToken,
} from "@/middleware/auth.middleware";
import { generateUploadSignature, getUploadPreset } from "@/lib/cloudinary";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/user.model";

/**
 * This endpoint generates upload configuration for payment proof uploads
 * A separate endpoint from admin/upload to have appropriate permissions
 */
export async function POST(request: NextRequest) {
  try {
    // Get token from either the URL query parameter or the request header
    const url = new URL(request.url);
    const tokenFromQuery = url.searchParams.get("token");
    const tokenFromHeader = getToken(request);
    const token = tokenFromQuery || tokenFromHeader;

    let userId;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized - No token provided" },
        { status: 401 }
      );
    }

    // Verify the token
    const decoded = verifyToken(token);
    if (!decoded || typeof decoded !== "object") {
      return NextResponse.json(
        { message: "Unauthorized - Invalid token" },
        { status: 401 }
      );
    }

    // Get user info from the database
    try {
      await connectToDatabase();
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      }

      userId = user._id.toString();
    } catch (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { message: "Server error during authentication" },
        { status: 500 }
      );
    }

    // Parse the request body
    const data = await request.json();
    const { orderId } = data;

    // Set folder for upload based on context
    let folder = orderId
      ? `payment_proofs/${userId}/${orderId}`
      : `payment_proofs/${userId}`;

    // Get upload preset for unsigned uploads
    const uploadPreset = getUploadPreset();

    // If no upload preset is configured, we'll fall back to signed uploads
    if (!uploadPreset) {
      // Generate a signature for signed uploads
      const { signature, timestamp } = generateUploadSignature({
        folder,
        resource_type: "image",
        allowed_formats: "jpg,png,jpeg,webp",
        max_file_size: 10000000, // 10MB limit
      });

      return NextResponse.json({
        signature,
        timestamp,
        folder,
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
      });
    }

    // For unsigned uploads, just return the upload preset and folder
    return NextResponse.json({
      uploadPreset,
      folder,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    });
  } catch (error) {
    console.error("Error generating upload configuration:", error);
    return NextResponse.json(
      { message: "Error generating upload configuration" },
      { status: 500 }
    );
  }
}
