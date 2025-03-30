"use client"

import { ProductCard, ProductCardProps } from "@/components/products/product-card"

type Product = Omit<ProductCardProps, 'variant' | 'showCategory' | 'showRating' | 'showActions'>

interface ProductGridProps {
  products: Product[]
  emptyMessage?: string
  columns?: 2 | 3 | 4
  variant?: "default" | "compact" | "featured"
  showCategory?: boolean
  showRating?: boolean
  showActions?: boolean
}

export function ProductGrid({
  products,
  emptyMessage = "No products found",
  columns = 4,
  variant = "default",
  showCategory = true,
  showRating = true,
  showActions = true
}: ProductGridProps) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  const getGridClass = () => {
    switch (columns) {
      case 2:
        return "grid-cols-1 sm:grid-cols-2"
      case 3:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      case 4:
      default:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    }
  }

  return (
    <div className={`grid ${getGridClass()} gap-4 md:gap-6`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          {...product}
          variant={variant}
          showCategory={showCategory}
          showRating={showRating}
          showActions={showActions}
        />
      ))}
    </div>
  )
}
