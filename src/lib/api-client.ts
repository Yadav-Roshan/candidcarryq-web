/**
 * Client-safe API utilities for fetching products and other data
 */

import { mockProducts } from "./api-mock-data";

// Token handling utilities
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken");
  }
  return null;
};

const setToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("authToken", token);
  }
};

const clearToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("authToken");
  }
};

// Client-safe API functions for products
const fetchFeaturedProducts = async () => {
  try {
    const response = await fetch("/api/products?featured=true");
    if (!response.ok) {
      throw new Error("Failed to fetch featured products");
    }
    const data = await response.json();
    return data.products || mockProducts.slice(0, 4);
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return mockProducts.slice(0, 4);
  }
};

const fetchProductById = async (id: string) => {
  try {
    const response = await fetch(`/api/products/${id}`);
    if (!response.ok) {
      // Check if it exists in mock data
      const mockProduct = mockProducts.find((p) => p.id === id);
      return mockProduct || null;
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    // Check mock data as fallback
    const mockProduct = mockProducts.find((p) => p.id === id);
    return mockProduct || null;
  }
};

const fetchAllProducts = async (params: any = {}) => {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });

    const response = await fetch(`/api/products?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }
    const data = await response.json();
    return data.products || mockProducts;
  } catch (error) {
    console.error("Error fetching products:", error);
    return mockProducts;
  }
};

// Auth API functions
const auth = {
  setToken,
  getToken,
  clearToken,

  login: async (identifier: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ identifier, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    const data = await response.json();
    setToken(data.token);
    return data;
  },

  register: async (userData: any) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Registration failed");
    }

    const data = await response.json();
    setToken(data.token);
    return data;
  },

  googleAuth: async (token: string) => {
    const response = await fetch("/api/auth/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Google authentication failed");
    }

    const data = await response.json();
    setToken(data.token);
    return data;
  },
};

// User API functions
const user = {
  getProfile: async () => {
    const token = getToken();
    if (!token) throw new Error("Not authenticated");

    const response = await fetch("/api/user/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        clearToken();
        throw new Error("Session expired");
      }
      throw new Error("Failed to fetch profile");
    }

    return response.json();
  },

  updateProfile: async (userData: any) => {
    const token = getToken();
    if (!token) throw new Error("Not authenticated");

    const response = await fetch("/api/user/profile", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        clearToken();
        throw new Error("Session expired");
      }
      const error = await response.json();
      throw new Error(error.message || "Failed to update profile");
    }

    return response.json();
  },

  updateAddress: async (address: any) => {
    const token = getToken();
    if (!token) throw new Error("Not authenticated");

    const response = await fetch("/api/user/address", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ address }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        clearToken();
        throw new Error("Session expired");
      }
      const error = await response.json();
      throw new Error(error.message || "Failed to update address");
    }

    return response.json();
  },
};

// All API functions
const apiClient = {
  fetchFeaturedProducts,
  fetchProductById,
  fetchAllProducts,
  auth,
  user,
};

// Export only once - removed the duplicate export
export { fetchFeaturedProducts, fetchProductById, fetchAllProducts };

export default apiClient;
