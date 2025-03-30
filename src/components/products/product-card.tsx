"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Heart, ShoppingCart, Star, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/cart-context"
import { useWishlist } from "@/contexts/wishlist-context"
import { formatPrice } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

export interface ProductCardProps {
  id: string
  name: string
  description?: string
  price: number
  salePrice?: number
  image: string
  category?: string
  rating?: number
  reviewCount?: number
  stock?: number
  featured?: boolean
  createdAt?: string
  soldCount?: number
  // Flags to control which elements to show
  showCategory?: boolean
  showRating?: boolean
  showActions?: boolean
  variant?: "default" | "compact" | "featured"
}

export function ProductCard({
  id,
  name,
  description,
  price,
  salePrice,
  image,
  category,
  rating = 0,
  reviewCount = 0,
  stock = 0,
  featured = false,
  showCategory = true,
  showRating = true,
  showActions = true,
  variant = "default"
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { addItem } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlist()
  const { toast } = useToast()
  const router = useRouter()
  
  // Use functions directly within component to check cart status
  const { isItemInCart } = useCart()
  const { isItemInWishlist } = useWishlist()
  
  const inCart = isItemInCart?.(id) || false
  const inWishlist = isItemInWishlist?.(id) || false
  const isOnSale = salePrice !== undefined && salePrice < price
  const discountPercentage = isOnSale ? Math.round(((price - salePrice!) / price) * 100) : 0
  const isOutOfStock = stock === 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isOutOfStock) {
      toast({
        title: "Out of stock",
        description: "This product is currently out of stock."
      })
      return
    }
    
    addItem({
      id, 
      name, 
      price: salePrice || price, 
      image, 
      quantity: 1
    })
    
    toast({
      title: "Added to cart",
      description: `${name} has been added to your cart.`
    })
  }
  
  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (inWishlist) {
      removeFromWishlist(id)
      toast({
        title: "Removed from wishlist",
        description: `${name} has been removed from your wishlist.`
      })
    } else {
      addToWishlist({
        id, 
        name, 
        price: salePrice || price, 
        image
      })
      toast({
        title: "Added to wishlist",
        description: `${name} has been added to your wishlist.`
      })
    }
  }
  
  // Generate star rating JSX
  const renderRating = () => {
    if (!showRating) return null
    
    return (
      <div className="flex items-center mt-2">
        <div className="flex items-center">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              className={`h-3.5 w-3.5 ${
                index < Math.floor(rating)
                  ? "text-yellow-400 fill-yellow-400"
                  : index < rating
                  ? "text-yellow-400 fill-yellow-400 opacity-50"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>
        {reviewCount > 0 && (
          <span className="text-xs text-muted-foreground ml-1">
            ({reviewCount})
          </span>
        )}
      </div>
    )
  }
  
  // Display sale badge if on sale
  const renderSaleBadge = () => {
    if (!isOnSale) return null
    
    return (
      <Badge 
        className="absolute top-2 left-2 bg-red-500 hover:bg-red-600"
      >
        {discountPercentage}% OFF
      </Badge>
    )
  }
  
  // Display out of stock badge
  const renderStockBadge = () => {
    if (!isOutOfStock) return null
    
    return (
      <Badge 
        className="absolute top-2 left-2 bg-gray-500 hover:bg-gray-600"
      >
        Out of Stock
      </Badge>
    )
  }
  
  // Display category badge
  const renderCategoryBadge = () => {
    if (!showCategory || !category) return null
    
    return (
      <Badge 
        variant="outline" 
        className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm"
      >
        {category}
      </Badge>
    )
  }
  
  // Render featured badge if product is featured
  const renderFeaturedBadge = () => {
    if (!featured) return null
    
    return (
      <Badge 
        className="absolute bottom-2 right-2 bg-primary"
      >
        Featured
      </Badge>
    )
  }
  
  const getCardClass = () => {
    let baseClass = "group relative rounded-lg border bg-card overflow-hidden transition-all"
    
    switch (variant) {
      case "compact":
        return `${baseClass} h-[280px]`
      case "featured":
        return `${baseClass} h-[350px]`
      default:
        return `${baseClass} h-[320px]`
    }
  }
  
  const getContentClass = () => {
    let baseClass = "flex flex-col p-4"
    
    switch (variant) {
      case "compact":
        return `${baseClass} h-[100px]`
      case "featured":
        return `${baseClass} h-[150px]`
      default:
        return `${baseClass} h-[120px]`
    }
  }
  
  const getImageClass = () => {
    let baseClass = "w-full object-cover transition-transform duration-300 group-hover:scale-105"
    
    switch (variant) {
      case "compact":
        return `${baseClass} h-[180px]`
      case "featured":
        return `${baseClass} h-[200px]`
      default:
        return `${baseClass} h-[200px]`
    }
  }
  
  return (
    <Link href={`/products/${id}`} passHref>
      <div
        className={getCardClass()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image container */}
        <div className="relative overflow-hidden">
          <img
            src={image}
            alt={name}
            className={getImageClass()}
          />
          
          {/* Sale badge */}
          {renderSaleBadge()}
          
          {/* Out of stock badge */}
          {renderStockBadge()}
          
          {/* Category badge */}
          {renderCategoryBadge()}
          
          {/* Featured badge */}
          {renderFeaturedBadge()}
          
          {/* Action buttons (Add to cart, Wishlist) */}
          {showActions && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={isHovered ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex gap-2"
              >
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handleAddToCart}
                  disabled={inCart || isOutOfStock}
                  className={inCart ? "bg-primary text-primary-foreground" : ""}
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span className="sr-only">Add to cart</span>
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handleToggleWishlist}
                  className={inWishlist ? "bg-primary text-primary-foreground" : ""}
                >
                  {inWishlist ? (
                    <Heart className="h-4 w-4 fill-current" />
                  ) : (
                    <Heart className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                  </span>
                </Button>
              </motion.div>
            </div>
          )}
        </div>
        
        {/* Product info */}
        <div className={getContentClass()}>
          <h3 className="font-medium line-clamp-1">{name}</h3>
          
          {description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {description}
            </p>
          )}
          
          {/* Rating stars */}
          {renderRating()}
          
          {/* Price */}
          <div className="mt-auto pt-2 flex items-center">
            {isOnSale ? (
              <>
                <span className="font-medium text-primary">
                  {formatPrice(salePrice!)}
                </span>
                <span className="text-sm text-muted-foreground line-through ml-2">
                  {formatPrice(price)}
                </span>
              </>
            ) : (
              <span className="font-medium">
                {formatPrice(price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
