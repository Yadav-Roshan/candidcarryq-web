import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary for server-side operations
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload an image to Cloudinary using the server SDK (for non-client side uploads)
 */
export async function uploadImage(
  file: Buffer,
  folder: string = "products"
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    // Generate a unique identifier using timestamp and random string
    const uniqueId = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 15)}`;

    const uploadOptions = {
      folder,
      public_id: uniqueId,
      overwrite: true,
    };

    // Upload file buffer to Cloudinary
    cloudinary.uploader
      .upload_stream(uploadOptions, (error, result) => {
        if (error) reject(error);
        else
          resolve({
            url: result?.secure_url || "",
            publicId: result?.public_id || "",
          });
      })
      .end(file);
  });
}

export function generateProductImagePublicId(
  productId: string,
  index: number
): string {
  return `products/${productId}/${index}`;
}

/**
 * Delete an image from Cloudinary using public ID
 * This is a server-side function only
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === "ok";
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    return false;
  }
}

/**
 * Delete multiple images from Cloudinary using public IDs
 * This is a server-side function only
 */
export async function deleteMultipleImages(
  publicIds: string[]
): Promise<boolean> {
  if (!publicIds.length) return true;

  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    return Object.values(result.deleted).every(
      (status) => status === "deleted" || status === "not_found"
    );
  } catch (error) {
    console.error("Error batch deleting images from Cloudinary:", error);
    return false;
  }
}

/**
 * Generate a Cloudinary upload signature for client-side uploads
 * This is used by the API route to create signatures for the client
 */
export function generateUploadSignature(params: Record<string, any> = {}): {
  signature: string;
  timestamp: number;
} {
  // Create a timestamp for the signature
  const timestamp = Math.round(new Date().getTime() / 1000);

  // Combine all parameters that need to be signed
  const signParams = {
    timestamp,
    folder: params.folder || "products",
    ...params,
  };

  // Generate the signature
  const signature = cloudinary.utils.api_sign_request(
    signParams,
    process.env.CLOUDINARY_API_SECRET || ""
  );

  return { signature, timestamp };
}
