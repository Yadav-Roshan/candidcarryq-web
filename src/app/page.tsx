import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { TrustIndicators } from "@/components/home/trust-indicators"
import { NewsletterSubscription } from "@/components/home/newsletter"
import { ProductCard } from "@/components/products/product-card"
import { getFeaturedProducts } from "@/lib/api" // Server-side function 
import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
  title: "Premium Bags and Accessories for Every Lifestyle",
  description: "Discover our exquisite collection of handbags, backpacks, and travel bags designed for your modern lifestyle. Quality craftsmanship and stylish designs.",
});

export default async function Home() {
  // This will run only on the server
  const featuredProducts = await getFeaturedProducts()
  
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-slate-100 dark:bg-slate-900">
        <div className="container flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">Premium Bags for Every Style</h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">
            Discover our exquisite collection of handbags, backpacks, and travel bags designed for your lifestyle.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" asChild>
              <Link href="/products">Shop Now</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/categories">Browse Categories</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-primary/5">
        <div className="container">
          <div className="text-center pb-6">
            <h2 className="text-3xl font-bold">Featured Products</h2>
          </div>
          
          <div className="h-12"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <Button asChild variant="outline">
              <Link href="/products" className="flex items-center">
                View All Products <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories section */}
      <section className="py-16 bg-blue-50 dark:bg-slate-800">
        <div className="container">
          <div className="text-center pb-6">
            <h2 className="text-3xl font-bold">Shop by Category</h2>
          </div>
          
          <div className="h-12"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative overflow-hidden rounded-lg bg-background shadow-md hover:shadow-lg transition-shadow">
              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold mb-4">Backpacks</h3>
                <p className="text-muted-foreground mb-4">Practical and stylish backpacks for everyday use.</p>
                <Button asChild>
                  <Link href="/products?category=backpacks">View Collection</Link>
                </Button>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg bg-background shadow-md hover:shadow-lg transition-shadow">
              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold mb-4">Handbags</h3>
                <p className="text-muted-foreground mb-4">Elegant handbags to complement any outfit.</p>
                <Button asChild>
                  <Link href="/products?category=handbags">View Collection</Link>
                </Button>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg bg-background shadow-md hover:shadow-lg transition-shadow">
              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold mb-4">Travel Bags</h3>
                <p className="text-muted-foreground mb-4">Durable and spacious bags for your journeys.</p>
                <Button asChild>
                  <Link href="/products?category=travel">View Collection</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Trust Indicators */}
      <TrustIndicators />
      
      {/* Newsletter */}
      <NewsletterSubscription />
    </div>
  )
}
