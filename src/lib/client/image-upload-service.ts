/**
 * Client service for uploading images with next-cloudinary
 */
import { CldUploadWidget } from "next-cloudinary";

/**
 * Get a signature for authenticated Cloudinary uploads
 */
export async function getUploadSignature(productId?: string): Promise<{
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
  uploadPreset: string;
}> {
  try {
    // Get the authentication token from localStorage
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("Authentication token not found. Please log in again.");
    }

    // Add a retry mechanism
    let attempts = 0;
    const maxAttempts = 2;
    let response;

    while (attempts < maxAttempts) {
      attempts++;
      response = await fetch("/api/admin/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
        credentials: "include",
        cache: "no-store",
      });

      if (response.ok) break;

      // Wait briefly before retrying
      if (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (!response || !response.ok) {
      const errorText = (await response?.text()) || "No response";
      let errorJson;

      try {
        errorJson = JSON.parse(errorText);
      } catch (e) {
        // If not valid JSON, use the raw text
      }

      const errorMessage =
        errorJson?.message || `Failed with status: ${response?.status}`;
      console.error("Upload signature error:", errorMessage);
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting upload signature:", error);
    throw error;
  }
}

/**
 * Direct upload to Cloudinary using a pre-signed signature
 * This can be used for more custom upload scenarios
 */
export async function uploadProductImage(
  file: File,
  productId?: string
): Promise<{ url: string; publicId: string }> {
  try {
    // Get upload signature
    const { signature, timestamp, cloudName, apiKey, folder, uploadPreset } =
      await getUploadSignature(productId);

    // Create form data for the upload
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);
    formData.append("folder", folder);
    formData.append("upload_preset", uploadPreset);

    // Upload directly to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to upload image to Cloudinary");
    }

    const data = await response.json();

    return {
      url: data.secure_url,
      publicId: data.public_id,
    };
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

/**
 * Configuration type for CldUploadWidget
 */
export interface UploadWidgetConfig {
  uploadPreset?: string;
  folder?: string;
  multiple?: boolean;
  resourceType?: string;
  maxFiles?: number;
  clientAllowedFormats?: string[];
  maxFileSize?: number;
  maxImageWidth?: number;
  cropping?: boolean;
}

/**
 * Hook-like function to configure widget options with signature
 */
export async function getUploadWidgetOptions(productId?: string) {
  const { signature, timestamp, cloudName, apiKey, folder, uploadPreset } =
    await getUploadSignature(productId);

  return {
    cloudName,
    apiKey,
    uploadSignature: signature,
    uploadSignatureTimestamp: timestamp,
    folder,
    uploadPreset,
  };
}
