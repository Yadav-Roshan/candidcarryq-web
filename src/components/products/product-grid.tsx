"use client";

import React from "react";
import { Product } from "@/contexts/cart-context";
import { ProductCard } from "@/components/products/product-card";
import { NoProducts } from "@/components/products/no-products"; // Changed from NoResults

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <NoProducts
        message="No products match your search criteria"
        showHomeButton={false}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
