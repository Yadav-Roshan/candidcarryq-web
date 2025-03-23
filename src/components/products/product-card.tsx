"use client"

import React from "react"
import Link from "next/link"
import { Heart, ShoppingCart, Star, StarHalf, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn, formatPrice } from "@/lib/utils"
import { useWishlist } from "@/contexts/wishlist-context"
import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/components/ui/use-toast"

export interface ProductCardProps {
  id: string
  name: string
  price: number
  category?: string
  image?: string
  salePrice?: number
  rating?: number
  reviewCount?: number
  stock?: number
  description?: string
}

export function ProductCard({
  id,
  name,
  price,
  category,
  image = "https://placehold.co/600x400?text=No+Image",
  salePrice,
  rating = 0,
  reviewCount = 0,
  stock = 0,
  description,
}: ProductCardProps) {
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isItemInWishlist } = useWishlist()
  const { addItem: addToCart } = useCart()
  const { toast } = useToast()
  const isWishlisted = isItemInWishlist(id)
  
  const discountPercentage = salePrice ? Math.round(((price - salePrice) / price) * 100) : 0
  
  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isWishlisted) {
      removeFromWishlist(id)
      toast({
        title: "Removed from wishlist",
        description: `${name} has been removed from your wishlist`,
      })
    } else {
      addToWishlist({ 
        id, 
        name, 
        price, 
        image, 
        category, 
        salePrice
      })
      toast({
        title: "Added to wishlist",
        description: `${name} has been added to your wishlist`,
      })
    }
  }
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    addToCart({ 
      id, 
      name, 
      price: salePrice || price, 
      image,
      quantity: 1,
    })
    
    toast({
      title: "Added to cart",
      description: `${name} has been added to your cart`,
    })
  }
  
  const handleNavigate = (e: React.MouseEvent, path: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Use router or window.location to navigate
    window.location.href = path
  }
  
  const renderRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }
    
    // Add empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-star-${i}`} className="h-4 w-4 text-muted-foreground" />);
    }
    
    return stars;
  };
  
  return (
    <div className="group relative overflow-hidden rounded-lg border bg-background shadow-sm transition-colors hover:shadow-md">
      {/* Wishlist button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "absolute right-2 top-2 z-10 h-8 w-8 rounded-full bg-white/80 shadow-sm transition-colors hover:bg-white dark:bg-black/80 dark:hover:bg-black",
          isWishlisted && "text-red-500"
        )}
        onClick={handleWishlistToggle}
      >
        <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
        <span className="sr-only">
          {isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        </span>
      </Button>
      
      {/* Product content - now using a div instead of a Link */}
      <div className="flex flex-col" onClick={(e) => handleNavigate(e, `/products/${id}`)}>
        {/* Product image */}
        <div className="relative aspect-square overflow-hidden rounded-t-lg bg-muted cursor-pointer">
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
          
          {salePrice && (
            <Badge className="absolute left-2 top-2 bg-red-500 text-white">
              {discountPercentage}% OFF
            </Badge>
          )}
        </div>
        
        {/* Product info */}
        <div className="flex flex-1 flex-col p-4">
          <h3 className="font-medium truncate cursor-pointer">{name}</h3>
          
          {category && (
            <p className="text-xs text-muted-foreground capitalize">
              {category}
            </p>
          )}
          
          {/* Rating stars */}
          {rating > 0 && (
            <div className="mt-2 flex items-center">
              <div className="flex">
                {renderRatingStars(rating)}
              </div>
              {reviewCount > 0 && (
                <span className="ml-2 text-xs text-muted-foreground">
                  ({reviewCount})
                </span>
              )}
            </div>
          )}
          
          <div className="mt-4 flex items-center">
            {salePrice ? (
              <>
                <p className="font-medium text-green-600 dark:text-green-400">
                  {formatPrice(salePrice)}
                </p>
                <p className="ml-2 text-sm text-muted-foreground line-through">
                  {formatPrice(price)}
                </p>
              </>
            ) : (
              <p className="font-medium">{formatPrice(price)}</p>
            )}
          </div>
          
          {/* Action buttons container - shown on hover or focus */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button 
              variant="outline"
              size="sm"
              className="w-full"
              onClick={(e) => handleNavigate(e, `/products/${id}`)}
            >
              <Eye className="mr-1 h-3 w-3" /> View
            </Button>
            
            <Button 
              variant="default"
              size="sm"
              className="w-full"
              onClick={handleAddToCart}
              disabled={stock === 0}
            >
              <ShoppingCart className="mr-1 h-3 w-3" /> Cart
            </Button>
            
            {stock === 0 && (
              <div className="col-span-2 mt-2 text-center text-xs text-destructive">
                Out of stock
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
