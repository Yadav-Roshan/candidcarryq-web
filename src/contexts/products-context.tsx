"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { fetchProducts } from "@/lib/client/product-service";
import { Product } from "@/lib/client/product-service";

interface FilterOptions {
  minPrice: number;
  maxPrice: number;
  colors: string[];
  materials: string[];
  categories: string[];
}

interface ProductsContextType {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  filterOptions: FilterOptions;
  refreshProducts: (filters?: any) => Promise<void>;
}

const defaultFilterOptions: FilterOptions = {
  minPrice: 0,
  maxPrice: 10000,
  colors: [],
  materials: [],
  categories: [],
};

const ProductsContext = createContext<ProductsContextType | undefined>(
  undefined
);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] =
    useState<FilterOptions>(defaultFilterOptions);

  // Function to load products with optional filters
  const refreshProducts = async (filters = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedProducts = await fetchProducts(filters);
      setProducts(fetchedProducts);

      // Analyze products to update filter options
      updateFilterOptions(fetchedProducts);
    } catch (err) {
      setError("Failed to load products");
      console.error("Error loading products:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Update filter options based on available products
  const updateFilterOptions = (products: Product[]) => {
    if (!products || products.length === 0) return;

    let minPrice = Number.MAX_SAFE_INTEGER;
    let maxPrice = 0;
    const colorsSet = new Set<string>();
    const materialsSet = new Set<string>();
    const categoriesSet = new Set<string>();

    products.forEach((product) => {
      // Update price range
      minPrice = Math.min(minPrice, product.price);
      maxPrice = Math.max(maxPrice, product.price);

      // Update categories
      if (product.category) {
        categoriesSet.add(product.category);
      }

      // Update colors
      if (product.colors && Array.isArray(product.colors)) {
        product.colors.forEach((color) => colorsSet.add(color));
      }

      // Update materials
      if (product.material) {
        materialsSet.add(product.material);
      }
    });

    setFilterOptions({
      minPrice: Math.floor(minPrice),
      maxPrice: Math.ceil(maxPrice),
      colors: Array.from(colorsSet),
      materials: Array.from(materialsSet),
      categories: Array.from(categoriesSet),
    });
  };

  // Initial load of products
  useEffect(() => {
    refreshProducts();
  }, []);

  return (
    <ProductsContext.Provider
      value={{
        products,
        isLoading,
        error,
        filterOptions,
        refreshProducts,
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
