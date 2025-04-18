"use client";

import React from "react";
import { Product } from "@/contexts/cart-context";
import { ProductCard } from "@/components/products/product-card";
import { NoProducts } from "@/components/products/no-products";
import { useSearchParams } from "next/navigation";

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  const searchParams = useSearchParams();
  const searchQuery = searchParams?.get("search") ?? undefined;

  if (products.length === 0) {
    return <NoProducts searchQuery={searchQuery} />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
