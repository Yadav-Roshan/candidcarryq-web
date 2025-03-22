"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { ProductGrid } from "@/components/products/product-grid"
import { Button } from "@/components/ui/button"
import { mockProducts } from "@/lib/api" // Using mock data for now

export function FeaturedProducts() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Fetch featured products
  useEffect(() => {
    // In a real app, you would fetch from your API
    // For now, use mock data and filter for featured products
    const featured = mockProducts
      .filter(product => product.featured)
      .slice(0, 4)
    
    setFeaturedProducts(featured)
    setIsLoading(false)
  }, [])
  
  if (isLoading) {
    return (
      <div className="container py-16">
        <div className="h-60 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }
  
  if (featuredProducts.length === 0) {
    return null // Don't show section if no featured products
  }
  
  return (
    <section className="bg-muted/50 py-16">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Featured Products</h2>
          <Button variant="link" asChild className="font-medium">
            <Link href="/products" className="flex items-center">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <ProductGrid 
          products={featuredProducts} 
          columns={4}
          variant="featured"
          showCategory={true}
          showRating={true}
          showActions={true}
        />
      </div>
    </section>
  )
}
