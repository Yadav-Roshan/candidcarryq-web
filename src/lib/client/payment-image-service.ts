/**
 * Client service for managing payment proof images
 */

/**
 * Delete a payment proof image from Cloudinary
 */
export async function deletePaymentProofImage(publicId: string): Promise<boolean> {
  try {
    // Get authentication token from localStorage
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("Authentication token not found. Please log in again.");
    }

    const response = await fetch("/api/payment/images", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ publicId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete image");
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error("Error deleting payment proof image:", error);
    throw error;
  }
}
