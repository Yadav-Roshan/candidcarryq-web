"use client";

import { ProductsProvider } from "@/contexts/products-context";
import ProductFilters from "./product-filters";

export function ProductsFilters() {
  return (
    <ProductsProvider>
      <ProductFilters />
    </ProductsProvider>
  );
}
