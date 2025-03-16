import { Button } from '@/components/ui/button'
import ProductGrid from '@/components/products/product-grid'
import { getFeaturedProducts } from '@/lib/api'
import Link from 'next/link'
import CategoryShowcase from '@/components/products/category-showcase'

export default async function Home() {
  const featuredProducts = await getFeaturedProducts()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero section */}
      <section className="relative py-20">
        <div className="bg-muted/50 absolute inset-0 -z-10 rounded-lg"></div>
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-6 text-4xl font-bold sm:text-5xl md:text-6xl">Premium Bags for Every Occasion</h1>
          <p className="mb-8 text-xl text-muted-foreground">
            Discover our collection of high-quality, stylish bags designed to elevate your everyday look.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/products">Shop Now</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/categories">Browse Categories</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured products section */}
      <section className="py-16">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold">Featured Products</h2>
          <Button variant="outline" asChild>
            <Link href="/products">View All</Link>
          </Button>
        </div>
        <ProductGrid products={featuredProducts} />
      </section>

      {/* Categories section */}
      <section className="py-16">
        <h2 className="mb-8 text-3xl font-bold">Shop by Category</h2>
        <CategoryShowcase categories={[]} />
      </section>

      {/* Newsletter signup */}
      <section className="rounded-lg bg-muted/50 px-8 py-16">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="mb-4 text-2xl font-bold">Join Our Newsletter</h2>
          <p className="mb-6 text-muted-foreground">
            Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
          </p>
          <form className="flex flex-col items-center gap-4 sm:flex-row">
            <input
              type="email"
              placeholder="Your email address"
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              required
            />
            <Button type="submit" className="w-full sm:w-auto">
              Subscribe
            </Button>
          </form>
        </div>
      </section>
    </div>
  )
}
