import { Suspense } from "react"
import { ProductGrid } from "@/components/products/product-grid"
import { ProductFilters } from "@/components/products/product-filters"
import { mockProducts } from "@/lib/api" // Using mock data for now

export const metadata = {
  title: "Products - CandidWear",
  description: "Explore our collection of high-quality products",
}

export default function ProductsPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-4">Products</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full lg:w-1/4">
          <Suspense fallback={<div>Loading filters...</div>}>
            <ProductFilters />
          </Suspense>
        </div>
        
        {/* Products Grid */}
        <div className="w-full lg:w-3/4">
          <Suspense fallback={<div>Loading products...</div>}>
            <ProductGrid 
              products={mockProducts} 
              variant="default"
              showCategory={true}
              showRating={true}
              showActions={true}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
