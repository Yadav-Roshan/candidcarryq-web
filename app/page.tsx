import { Suspense } from "react"
import { ProductGrid } from "@/components/products/product-grid"
import { FeaturedProducts } from "@/components/home/featured-products"
import { TrustIndicators } from "@/components/home/trust-indicators"
import { Newsletter } from "@/components/home/newsletter"
import { mockProducts } from "@/lib/api" // Using mock data for now

export default function HomePage() {
  // Get newest products for the "New Arrivals" section
  const newArrivals = [...mockProducts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);
  
  // Get best selling products
  const bestSellers = [...mockProducts]
    .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
    .slice(0, 4);
  
  return (
    <main>
      {/* Hero Section */}
      <section className="bg-muted py-20">
        <div className="container">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold mb-4">
              Fashion For The Modern You
            </h1>
            <p className="text-xl mb-8">
              Explore our handcrafted collection of premium bags and accessories
            </p>
            <a href="/products" className="inline-block bg-primary text-white px-6 py-3 rounded-md font-medium">
              Shop Now
            </a>
          </div>
        </div>
      </section>
      
      {/* Featured Products Section */}
      <Suspense fallback={<div>Loading featured products...</div>}>
        <FeaturedProducts />
      </Suspense>
      
      {/* New Arrivals Section */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8">New Arrivals</h2>
          <Suspense fallback={<div>Loading new arrivals...</div>}>
            <ProductGrid 
              products={newArrivals} 
              columns={4}
              variant="default"
              showCategory={true}
              showRating={true}
              showActions={true}
            />
          </Suspense>
        </div>
      </section>
      
      {/* Best Sellers Section */}
      <section className="bg-muted/50 py-16">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8">Best Sellers</h2>
          <Suspense fallback={<div>Loading best sellers...</div>}>
            <ProductGrid 
              products={bestSellers} 
              columns={4}
              variant="featured"
              showCategory={true}
              showRating={true}
              showActions={true}
            />
          </Suspense>
        </div>
      </section>
      
      {/* Trust Indicators */}
      <TrustIndicators />
      
      {/* Newsletter */}
      <Newsletter />
    </main>
  )
}
