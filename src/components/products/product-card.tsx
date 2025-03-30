"use client"

import React from "react"
import Link from "next/link"
import { ShoppingBag, Heart, Star, ShoppingCart } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/cart-context"
import { useWishlist } from "@/contexts/wishlist-context"
import { formatPrice } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

export interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
  salePrice?: number | null;
  rating?: number;
  reviewCount?: number;
}

export function ProductCard({ id, name, price, image, category, salePrice, rating = 0, reviewCount = 0 }: ProductCardProps) {
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { toast } = useToast()
  const isWishlisted = isInWishlist(id)
  
  const discountPercentage = salePrice ? Math.round(((price - salePrice) / price) * 100) : 0

  // Handle add to cart
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart({ id, name, price, image: image || "", salePrice })
    
    toast({
      title: "Added to cart",
      description: `${name} has been added to your cart`,
      duration: 2000,
    })
  }

  // Toggle wishlist
  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isWishlisted) {
      removeFromWishlist(id)
      toast({
        title: "Removed from wishlist",
        description: `${name} has been removed from your wishlist`,
        duration: 2000,
      })
    } else {
      addToWishlist({ id, name, price, image: image || "", salePrice })
      toast({
        title: "Added to wishlist",
        description: `${name} has been added to your wishlist`,
        duration: 2000,
      })
    }
  }

  // Generate placeholder text from product name
  const getInitials = () => {
    return name.split(' ').slice(0, 2).map(word => word[0]).join('')
  }

  return (
    <div className="group relative overflow-hidden rounded-lg border bg-background transition-all hover:shadow-md">
      {/* Wishlist button */}
      <button 
        onClick={toggleWishlist}
        className="absolute right-3 top-3 z-10 rounded-full bg-white/80 p-1.5 text-gray-900 transition-all hover:bg-white dark:bg-gray-900/80 dark:text-gray-50 dark:hover:bg-gray-900"
        aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
      >
        <Heart className={cn("h-4 w-4", isWishlisted ? "fill-red-500 text-red-500" : "")} />
      </button>

      {/* Sale badge */}
      {salePrice && (
        <Badge variant="success" className="absolute left-3 top-3 z-10">
          -{discountPercentage}%
        </Badge>
      )}

      {/* Product image with link */}
      <Link href={`/products/${id}`} className="block">
        <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={name}
              className="object-cover object-center w-full h-80 transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="h-80 bg-muted flex items-center justify-center text-5xl font-bold text-muted-foreground/60">
              {getInitials()}
            </div>
          )}
        </div>
      </Link>

      <div className="p-5">
        {/* Category */}
        {category && (
          <div className="mb-2 text-xs text-muted-foreground">
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </div>
        )}

        {/* Product name */}
        <h3 className="font-medium truncate">
          <Link href={`/products/${id}`}>{name}</Link>
        </h3>

        {/* Ratings */}
        {rating > 0 && (
          <div className="mt-1 flex items-center">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={cn(
                    "h-3 w-3", 
                    i < Math.floor(rating) 
                      ? "fill-yellow-400 text-yellow-400" 
                      : i < rating 
                        ? "fill-yellow-400/50 text-yellow-400" 
                        : "text-gray-300"
                  )}
                />
              ))}
            </div>
            <span className="ml-2 text-xs text-muted-foreground">({reviewCount})</span>
          </div>
        )}

        {/* Price */}
        <div className="mt-2 flex items-baseline gap-2">
          {salePrice ? (
            <>
              <span className="text-sm font-medium">{formatPrice(salePrice)}</span>
              <span className="text-xs text-muted-foreground line-through">{formatPrice(price)}</span>
            </>
          ) : (
            <span className="text-sm font-medium">{formatPrice(price)}</span>
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            asChild
          >
            <Link href={`/products/${id}`}>View</Link>
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="mr-1 h-4 w-4" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
