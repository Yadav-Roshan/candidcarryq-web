"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getProductById } from "@/lib/api"
import { ProductForm } from "@/components/admin/product-form"

export default function EditProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const isNewProduct = params.id === "new"
  
  useEffect(() => {
    async function loadProduct() {
      if (isNewProduct) {
        setLoading(false)
        return
      }
      
      try {
        const productData = await getProductById(params.id)
        if (!productData) {
          router.push("/admin/products")
          return
        }
        
        setProduct(productData)
      } catch (error) {
        console.error("Error loading product:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadProduct()
  }, [params.id, isNewProduct, router])
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading...</p>
      </div>
    )
  }
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">
        {isNewProduct ? "Add New Product" : "Edit Product"}
      </h1>
      <ProductForm product={product} isEditing={!isNewProduct} />
    </div>
  )
}
