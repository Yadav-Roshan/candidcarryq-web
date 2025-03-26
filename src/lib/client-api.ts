// Client-safe API utilities for fetching data without MongoDB imports

// Client-side API for products
export const productsApi = {
  // Get all products with optional filters
  async getAll(filters = {}) {
    try {
      // Convert filters to query params
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });

      const queryString = params.toString();
      const url = `/api/products${queryString ? `?${queryString}` : ""}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      return data.products || [];
    } catch (error) {
      console.error("Error fetching products:", error);
      // Return empty array instead of mock data
      return [];
    }
  },

  // Get a single product by ID
  async getById(id: string) {
    try {
      const response = await fetch(`/api/products/${id}`);

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.product;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      return null;
    }
  },

  // Get featured products
  async getFeatured() {
    try {
      const response = await fetch("/api/products?featured=true");

      if (!response.ok) {
        throw new Error("Failed to fetch featured products");
      }

      const data = await response.json();
      return data.products || [];
    } catch (error) {
      console.error("Error fetching featured products:", error);
      return [];
    }
  },
};
