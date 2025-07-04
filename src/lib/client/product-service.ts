// Client-safe API utility for products data

// Types that are safe to use on the client
export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
  category?: string;
  salePrice?: number | null;
  rating?: number;
  reviewCount?: number;
  images?: string[];
  colors?: string[];
  sizes?: string[];
  material?: string;
  dimensions?: string;
  weight?: string;
  capacity?: string;
  fullDescription?: string;
  warranty?: string;
  returnPolicy?: string;
  featured?: boolean;
  stock?: number;
}

// Client-safe fetch function
export async function fetchProducts(filters = {}) {
  try {
    // Convert filters to query string
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const queryString = params.toString();
    // Use the public products API endpoint instead of the admin endpoint
    const url = `/api/products${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error("Failed to fetch products from API");
      return [];
    }

    // Extract products from the response
    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

// Get featured products
export async function getFeaturedProducts() {
  try {
    const response = await fetch("/api/admin/featured-products");

    if (!response.ok) {
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}

// Update featured products
export async function updateFeaturedProducts(productIds: string[]) {
  try {
    const response = await fetch("/api/admin/featured-products", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productIds }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update featured products");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating featured products:", error);
    throw error;
  }
}
