import { Suspense } from "react"
import { Metadata } from "next"
import { getAllProducts } from "@/lib/api"
import { ProductGrid } from "@/components/products/product-grid"
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination"
import ProductFilters from "@/components/products/product-filters"
import ProductSort from "@/components/products/product-sort"
import ProductsLoading from "@/components/products/products-loading"

export const metadata: Metadata = {
  title: 'All Products - MyBags',
  description: 'Browse our complete collection of bags and accessories',
}

export const dynamic = 'force-dynamic'

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Convert searchParams to the correct types
  const page = searchParams.page ? parseInt(searchParams.page as string) : 1
  const category = typeof searchParams.category === "string" ? searchParams.category : undefined
  const sort = typeof searchParams.sort === "string" ? searchParams.sort : undefined

  // Fetch products with the filters
  const products = await getAllProducts({ page, category, sort })

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">All Products</h1>
        <ProductFilters />
      </div>
      
      <Suspense fallback={<ProductsLoading />}>
        <ProductGrid products={products} />
      </Suspense>
      
      <div className="mt-12">
        <Pagination>
          <PaginationContent>
            {page > 1 && (
              <PaginationItem>
                <PaginationPrevious href={`/products?page=${page - 1}`} />
              </PaginationItem>
            )}
            <PaginationItem>Page {page}</PaginationItem>
            <PaginationItem>
              <PaginationNext href={`/products?page=${page + 1}`} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
