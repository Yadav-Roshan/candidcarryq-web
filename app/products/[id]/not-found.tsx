import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ProductNotFound() {
  return (
    <div className="container flex flex-col items-center justify-center py-16 text-center">
      <ShoppingBag className="h-20 w-20 text-muted-foreground mb-6" />
      <h1 className="text-3xl font-bold mb-2">Product Not Found</h1>
      <p className="text-muted-foreground mb-8">
        Sorry, the product you're looking for doesn't exist or has been removed.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/products">Browse All Products</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    </div>
  )
}
