import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getProductById, getRelatedProducts } from "@/lib/api"
import { ProductDetails } from "@/components/products/product-details"
import { ProductGrid } from "@/components/products/product-grid"

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductById(params.id)
  
  if (!product) {
    return {
      title: "Product Not Found - MyBags",
      description: "The requested product could not be found."
    }
  }
  
  return {
    title: `${product.name} - MyBags`,
    description: product.description || `${product.name} available at MyBags`,
  }
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductById(params.id)
  
  if (!product) {
    notFound()
  }
  
  // Get related products
  const relatedProducts = await getRelatedProducts(product.id, product.category)
  
  return (
    <div className="container py-8">
      <ProductDetails product={product} />
      
      {relatedProducts.length > 0 && (
        <div className="mt-20">
          <h2 className="text-2xl font-bold mb-6">You might also like</h2>
          <ProductGrid products={relatedProducts} />
        </div>
      )}
    </div>
  )
}
