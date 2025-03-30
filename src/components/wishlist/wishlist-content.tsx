"use client"

import { Heart, ShoppingBag, Trash2 } from "lucide-react"
import { useWishlist } from "@/contexts/wishlist-context"
import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { formatPrice } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"

export default function WishlistContent() {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist()
  const { addToCart } = useCart()
  const { toast } = useToast()
  
  const handleAddToCart = (productId: string) => {
    const product = wishlistItems.find(item => item.id === productId)
    if (product) {
      addToCart(product)
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart`,
        duration: 2000,
      })
    }
  }
  
  if (wishlistItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Heart className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-medium mb-2">Your wishlist is empty</h2>
        <p className="text-muted-foreground mb-6">
          Items you save to your wishlist will appear here.
        </p>
        <Button asChild>
          <Link href="/products">Start Shopping</Link>
        </Button>
      </div>
    )
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">
          {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
        </p>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="text-muted-foreground"
          onClick={() => clearWishlist()}
        >
          Clear Wishlist
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlistItems.map((item) => (
          <div key={item.id} className="relative group rounded-lg border bg-background p-2">
            <div className="flex gap-4">
              {/* Product image */}
              <div className="w-24 h-24 relative rounded-md overflow-hidden flex-shrink-0">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-muted flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              
              {/* Product details */}
              <div className="flex-1">
                <Link 
                  href={`/products/${item.id}`}
                  className="text-lg font-medium hover:underline line-clamp-1"
                >
                  {item.name}
                </Link>
                
                {item.category && (
                  <p className="text-xs text-muted-foreground capitalize mt-1">
                    {item.category}
                  </p>
                )}
                
                <div className="mt-2 mb-3">
                  {item.salePrice ? (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatPrice(item.salePrice)}</span>
                      <span className="text-xs text-muted-foreground line-through">
                        {formatPrice(item.price)}
                      </span>
                    </div>
                  ) : (
                    <span className="font-medium">{formatPrice(item.price)}</span>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleAddToCart(item.id)}
                  >
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeFromWishlist(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
