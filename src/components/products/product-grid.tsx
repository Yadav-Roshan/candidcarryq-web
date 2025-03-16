"use client"

import React from "react"
import { ProductCard, ProductCardProps } from "@/components/products/product-card"

interface ProductGridProps {
  products: ProductCardProps[];
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  );
}
