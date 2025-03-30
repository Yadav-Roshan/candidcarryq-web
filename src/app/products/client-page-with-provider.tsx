"use client";

import { ProductsProvider } from "@/contexts/products-context";
import { ProductsPageClient } from "./client-page";

export function ProductsPageClientWithProvider() {
  return (
    <ProductsProvider>
      <ProductsPageClient />
    </ProductsProvider>
  );
}
