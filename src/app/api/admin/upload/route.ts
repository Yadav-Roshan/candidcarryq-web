import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/middleware/auth.middleware";
import { generateUploadSignature, getUploadPreset } from "@/lib/cloudinary";

/**
 * This endpoint generates upload configuration for client-side uploads
 * to Cloudinary using next-cloudinary - works with both signed and unsigned uploads
 */
export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const authResult = await authenticate(request);
    const user = authResult.user;

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Parse the request body
    const data = await request.json();
    const { productId, purpose, orderId } = data;

    // Allow non-admin access for payment proof and delivery proof uploads
    const isPaymentProof = purpose === "payment_proof";
    const isDeliveryProof = purpose === "delivery_proof";
    const isProductUpload = purpose === "product_upload" || !purpose;

    // Check permissions - only admins can upload product images
    const userRole = authResult.user.role;
    const isUserAdmin = userRole === "admin";

    if (isProductUpload && !isUserAdmin) {
      console.log("Admin check failed for product upload");
      return NextResponse.json(
        { message: "Access denied - Admin role required" },
        { status: 403 }
      );
    }

    // For other purposes that aren't payment proofs or delivery proofs, also check admin role
    if (!(isPaymentProof || isDeliveryProof) && !isUserAdmin) {
      console.log("Access denied for non-admin user with purpose:", purpose);
      return NextResponse.json(
        { message: "Access denied - Invalid purpose or permissions" },
        { status: 403 }
      );
    }

    // Set folder for upload based on context
    let folder;
    if (isPaymentProof && orderId) {
      folder = `payment_proofs/${authResult.user.id}/${orderId}`;
    } else if (isPaymentProof) {
      folder = `payment_proofs/${authResult.user.id}`;
    } else if (isDeliveryProof && orderId) {
      folder = `delivery_proofs/${authResult.user.id}/${orderId}`;
    } else if (isDeliveryProof) {
      folder = `delivery_proofs/${authResult.user.id}`;
    } else if (productId) {
      folder = `products/${productId}`;
    } else {
      folder = "products";
    }

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
