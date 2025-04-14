/**
 * Client service for uploading images with next-cloudinary
 */

/**
 * Get configuration for Cloudinary uploads (works with both signed and unsigned uploads)
 */
export async function getUploadSignature(
  productId?: string,
  purpose?: string,
  orderId?: string,
  endpoint: string = "/api/admin/upload" // Add endpoint parameter with default
): Promise<any> {
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
      response = await fetch(endpoint, {
        // Use the endpoint parameter
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, purpose, orderId }),
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
      console.error("Upload configuration error:", errorMessage);
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting upload configuration:", error);
    throw error;
  }
}

/**
 * Direct upload to Cloudinary using a pre-signed signature or unsigned upload
 */
export async function uploadProductImage(
  file: File,
  productId?: string,
  purpose: string = "product_upload"
): Promise<{ url: string; publicId: string }> {
  try {
    const uploadConfig = await getUploadSignature(productId, purpose);

    // Create form data for the upload
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", uploadConfig.folder);

    // Handle signed vs unsigned uploads
    if (uploadConfig.uploadPreset) {
      // Unsigned upload
      formData.append("upload_preset", uploadConfig.uploadPreset);
    } else {
      // Signed upload
      formData.append("api_key", uploadConfig.apiKey);
      formData.append("timestamp", uploadConfig.timestamp.toString());
      formData.append("signature", uploadConfig.signature);
    }

    // Upload directly to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${uploadConfig.cloudName}/image/upload`,
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
 * Get upload widget options based on whether we're using signed or unsigned uploads
 */
export async function getUploadWidgetOptions(
  productId?: string,
  purpose?: string,
  orderId?: string,
  customEndpoint?: string
) {
  // Determine which endpoint to use based on the purpose
  const endpoint =
    customEndpoint ||
    (purpose === "payment_proof" ? "/api/payment/upload" : "/api/admin/upload");

  const uploadConfig = await getUploadSignature(
    productId,
    purpose,
    orderId,
    endpoint
  );

  // Build options object based on the response
  const options: any = {
    cloudName: uploadConfig.cloudName,
    apiKey: uploadConfig.apiKey,
    folder: uploadConfig.folder,
    sources: ["local", "url", "camera"],
    multiple: false,
    maxFiles: 1,
  };

  // Add upload preset for unsigned uploads
  if (uploadConfig.uploadPreset) {
    options.uploadPreset = uploadConfig.uploadPreset;
  } else {
    // Add signature for signed uploads
    options.uploadSignature = uploadConfig.signature;
    options.uploadSignatureTimestamp = uploadConfig.timestamp;
  }

  return options;
}
