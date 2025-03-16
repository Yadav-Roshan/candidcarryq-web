import { Suspense } from "react"
import { getAllProducts } from "@/lib/api"
import ProductGrid from "@/components/products/product-grid"
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
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Convert searchParams to the correct types
  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page) : 1
  const category = typeof searchParams.category === "string" ? searchParams.category : undefined
  const sort = typeof searchParams.sort === "string" ? searchParams.sort : undefined
  const search = typeof searchParams.search === "string" ? searchParams.search : ""
  const minPrice = typeof searchParams.minPrice === "string" ? parseFloat(searchParams.minPrice) : undefined
  const maxPrice = typeof searchParams.maxPrice === "string" ? parseFloat(searchParams.maxPrice) : undefined
  
  // Fetch products with all the filters
  const products = await getAllProducts({ page, category, sort, search, minPrice, maxPrice })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">All Products</h1>
      
      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <form>
          <Input 
            name="search"
            placeholder="Search products..." 
            className="pl-10"
            defaultValue={search}
          />
        </form>
      </div>
      
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <ProductFilters />
        <ProductSort />
      </div>
      
      <Suspense fallback={<ProductsLoading />}>
        <ProductGrid products={products} />
      </Suspense>
      
      <div className="mt-12">
        <Pagination>
          <PaginationContent>
            {page > 1 && (
              <PaginationItem>
                <PaginationPrevious href={`/products?page=${page - 1}${category ? `&category=${category}` : ''}${sort ? `&sort=${sort}` : ''}${search ? `&search=${search}` : ''}${minPrice ? `&minPrice=${minPrice}` : ''}${maxPrice ? `&maxPrice=${maxPrice}` : ''}`} />
              </PaginationItem>
            )}
            <PaginationItem>Page {page}</PaginationItem>
            <PaginationItem>
              <PaginationNext href={`/products?page=${page + 1}${category ? `&category=${category}` : ''}${sort ? `&sort=${sort}` : ''}${search ? `&search=${search}` : ''}${minPrice ? `&minPrice=${minPrice}` : ''}${maxPrice ? `&maxPrice=${maxPrice}` : ''}`} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
