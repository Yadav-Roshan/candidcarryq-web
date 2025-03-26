"use client";

import { useSearchParams } from "next/navigation";
import ProductSort from "./product-sort";

interface ProductsHeaderProps {
  title: string;
  showSort?: boolean;
}

export function ProductsHeader({
  title,
  showSort = true,
}: ProductsHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <h1 className="text-3xl font-bold">{title}</h1>
      {showSort && <ProductSort />}
    </div>
  );
}
