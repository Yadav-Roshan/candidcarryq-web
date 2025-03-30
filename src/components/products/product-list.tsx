// Assuming you have a product-list.tsx file, if not, create one

import { Product } from "@/lib/client/product-service";
import { ProductCard } from "./product-card";
import { NoProducts } from "./no-products";

interface ProductListProps {
  products: Product[];
  isLoading?: boolean;
}

export function ProductList({ products, isLoading = false }: ProductListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCard.Skeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return <NoProducts />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
