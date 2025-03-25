"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { mockProducts } from "@/lib/api-mock-data";

// Define the product type based on our mock data structure
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
  stock?: number;
  images?: string[];
  colors?: string[];
  material?: string;
  dimensions?: string;
  weight?: string;
  capacity?: string;
}

interface ProductsContextType {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
  filterOptions: {
    categories: string[];
    colors: string[];
    materials: string[];
    minPrice: number;
    maxPrice: number;
  };
}

const ProductsContext = createContext<ProductsContextType | undefined>(
  undefined
);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState(0);

  // Extract unique filter options from products
  const filterOptions = {
    categories: [
      ...new Set(products.map((p) => p.category).filter(Boolean)),
    ].sort(),
    colors: [...new Set(products.flatMap((p) => p.colors || []))].sort(),
    materials: [
      ...new Set(products.map((p) => p.material).filter(Boolean)),
    ].sort(),
    minPrice: products.length ? Math.min(...products.map((p) => p.price)) : 0,
    maxPrice: products.length
      ? Math.max(...products.map((p) => p.price))
      : 10000,
  };

  // Function to fetch products - for now using mock data
  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // In the future, this would be an API call
      // const response = await fetch('/api/products');
      // const data = await response.json();

      // For now, use mock data with a slight delay to simulate network request
      await new Promise((resolve) => setTimeout(resolve, 300));
      setProducts(mockProducts);
      setLastFetched(Date.now());
    } catch (err) {
      console.error("Failed to fetch products", err);
      setError("Failed to load products. Please try again later.");
      // Fallback to mock data in case of error
      setProducts(mockProducts);
    } finally {
      setIsLoading(false);
    }
  };

  // Public refresh function that consumers can call
  const refreshProducts = async () => {
    // Only refresh if it's been more than 5 minutes since last fetch
    const fiveMinutes = 5 * 60 * 1000;
    if (Date.now() - lastFetched > fiveMinutes) {
      await fetchProducts();
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchProducts();

    // Set up a refresh interval - every 30 minutes
    const intervalId = setInterval(() => {
      refreshProducts();
    }, 30 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <ProductsContext.Provider
      value={{
        products,
        isLoading,
        error,
        refreshProducts,
        filterOptions,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductsProvider");
  }
  return context;
};
