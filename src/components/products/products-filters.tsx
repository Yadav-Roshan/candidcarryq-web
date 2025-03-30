"use client";

import { ProductsProvider } from "@/contexts/products-context";
import ProductFilters from "./product-filters";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";

export function ProductsFilters() {
  return (
    <ProductsProvider>
      <div className="flex justify-end">
        <ProductFilters />
      </div>
    </ProductsProvider>
  );
}
