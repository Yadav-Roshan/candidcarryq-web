import { notFound } from "next/navigation"
import { Suspense } from "react"
import { ProductDetails } from "@/components/products/product-details"
import { mockProducts } from "@/lib/api" // Using mock data for now

export const generateMetadata = async ({ params }: { params: { id: string } }) => {
  // Fetch product data
  const product = mockProducts.find(p => p.id === params.id)
  
  if (!product) {
    return {
      title: "Product Not Found - CandidWear",
      description: "The requested product could not be found."
    }
  }
  
  return {
    title: `${product.name} - CandidWear`,
    description: product.description || "View product details and pricing."
  }
}

export default function ProductPage({ params }: { params: { id: string } }) {
  // In a real app, you would fetch data from an API
  const product = mockProducts.find(p => p.id === params.id)
  
  // If product doesn't exist, return the not-found page
  if (!product) {
    notFound()
  }
  
  return (
    <div className="container py-10">
      <Suspense fallback={<div>Loading product details...</div>}>
        <ProductDetails product={product} />
      </Suspense>
    </div>
  )
}
