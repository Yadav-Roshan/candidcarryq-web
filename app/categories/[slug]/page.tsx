import { Suspense } from "react"
import { ProductGrid } from "@/components/products/product-grid"
import { ProductFilters } from "@/components/products/product-filters"
import { mockProducts } from "@/lib/api" // Using mock data for now

interface CategoryPageProps {
  params: {
    slug: string
  }
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = params
  
  // Format category name for display (replace hyphens with spaces, capitalize)
  const categoryName = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
  
  // Filter products by category 
  // In a real app, this would be a server-side DB query
  const categoryProducts = mockProducts.filter(
    product => product.category?.toLowerCase() === categoryName.toLowerCase()
  )
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-4">{categoryName}</h1>
      
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
              products={categoryProducts} 
              emptyMessage={`No products found in ${categoryName}`}
              variant="default"
              showCategory={false} // Category is known from the page
              showRating={true}
              showActions={true}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
