// Product interface for client-side usage
export interface ProductDetail {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
  category?: string;
  salePrice?: number | null;
  rating?: number;
  reviewCount?: number;
  stock?: number;
  featured?: boolean; // Changed from isFeatured to featured
  images?: string[];
  imagePublicIds?: string[];
  colors?: string[];
  sizes?: string[];
  material?: string;
  dimensions?: string;
  weight?: string;
  capacity?: string;
  fullDescription?: string;
  warranty?: string;
  returnPolicy?: string;
}

// Client-side function to get product by ID
export async function fetchProductById(
  id: string
): Promise<ProductDetail | null> {
  try {
    // Get the authentication token from localStorage
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("Authentication token not found. Please log in again.");
      return null;
    }

    // Use the admin API endpoint instead of the public one
    const response = await fetch(`/api/admin/products/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // Check for specific error cases
      if (response.status === 401) {
        console.error("Authentication failed. Please log in again.");
        // Could trigger a logout or redirect here
      } else if (response.status === 403) {
        console.error("You don't have permission to access this product.");
      } else {
        console.error(`Product ${id} not found or error: ${response.status}`);
      }
      return null;
    }

    const data = await response.json();
    return data.product;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }
}

// Update product
export async function updateProduct(
  id: string,
  productData: Partial<ProductDetail>
) {
  try {
    // Get authentication token from localStorage
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("Authentication token not found. Please log in again.");
    }

    // Log the image changes for debugging
    console.log("Updating product with images:", productData.images);
    console.log("Image public IDs:", productData.imagePublicIds);

    // Make sure we're working with a clean object
    const cleanedData = {
      name: productData.name,
      price: productData.price,
      salePrice: productData.salePrice,
      category: productData.category,
      description: productData.description,
      fullDescription: productData.fullDescription,
      featured: productData.featured, // Changed from isFeatured to featured
      material: productData.material,
      dimensions: productData.dimensions,
      weight: productData.weight,
      capacity: productData.capacity,
      stock: productData.stock,
      image: productData.image,
      images: productData.images,
      imagePublicIds: productData.imagePublicIds,
      colors: productData.colors,
      sizes: productData.sizes,
      warranty: productData.warranty,
      returnPolicy: productData.returnPolicy,
    };

    // Debug output to check API call
    console.log(`Sending PUT request to /api/admin/products/${id}`);

    // FIX: Use the admin-specific endpoint for product updates
    const response = await fetch(`/api/admin/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(cleanedData),
    });

    // Detailed error logging
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}):`, errorText);

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText };
      }

      throw new Error(
        errorData.message || `Failed to update product: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
}

// Delete product
export async function deleteProduct(id: string) {
  try {
    // Get authentication token from localStorage
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("Authentication token not found. Please log in again.");
    }

    const response = await fetch(`/api/products/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`, // Add token to headers
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete product");
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
}
