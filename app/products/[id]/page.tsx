import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getProductById } from "@/lib/api"
import { formatPrice } from "@/lib/utils"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { ProductDetails } from "@/components/products/product-details"
import { ProductRecommendations } from "@/components/products/product-recommendations"

interface ProductPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const product = await getProductById(params.id)
  
  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found",
    }
  }
  
  return {
    title: `${product.name} - CandidWear`,
    description: product.description || "Explore this premium product at CandidWear",
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductById(params.id)
  
  if (!product) {
    notFound()
  }
  
  return (
    <div className="container py-8">
      {/* Breadcrumbs */}
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/products">Products</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {product.category && (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/categories/${product.category}`} className="capitalize">
                  {product.category}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}
          <BreadcrumbItem>
            <BreadcrumbLink href={`/products/${product.id}`} isCurrentPage>
              {product.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      {/* Main product details */}
      <ProductDetails product={product} />
      
      {/* Related products */}
      <div className="mt-20">
        <h2 className="text-2xl font-bold mb-6">You might also like</h2>
        <ProductRecommendations 
          productId={product.id} 
          category={product.category}
        />
      </div>
    </div>
  )
}
