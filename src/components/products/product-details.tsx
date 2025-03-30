"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Heart, ShoppingCart, Star, ChevronLeft, ChevronRight, Share2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/contexts/cart-context"
import { useWishlist } from "@/contexts/wishlist-context"
import { useToast } from "@/components/ui/use-toast"
import { formatPrice } from "@/lib/utils"
import Link from "next/link"

interface ProductDetailsProps {
  product: any
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const { addItem, isItemInCart } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isItemInWishlist } = useWishlist()
  const { toast } = useToast()
  const router = useRouter()
  
  // Check if product is in cart/wishlist
  const inCart = isItemInCart?.(product.id) || false
  const inWishlist = isItemInWishlist?.(product.id) || false
  
  // Check if product is on sale
  const isOnSale = product.salePrice && product.salePrice < product.price
  const discountPercentage = isOnSale ? Math.round(((product.price - product.salePrice!) / product.price) * 100) : 0
  
  // Check if product is out of stock
  const isOutOfStock = product.stock === 0
  
  // Images for the product (fallback to single image if no images array)
  const images = product.images?.length ? product.images : [product.image]
  
  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast({
        title: "Out of stock",
        description: "This product is currently out of stock."
      })
      return
    }
    
    addItem({
      id: product.id,
      name: product.name,
      price: isOnSale ? product.salePrice : product.price,
      image: product.image,
      quantity
    })
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`
    })
  }
  
  const handleToggleWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(product.id)
      toast({
        title: "Removed from wishlist",
        description: `${product.name} has been removed from your wishlist.`
      })
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: isOnSale ? product.salePrice : product.price,
        image: product.image
      })
      toast({
        title: "Added to wishlist",
        description: `${product.name} has been added to your wishlist.`
      })
    }
  }
  
  const handleQuantityChange = (value: number) => {
    if (value < 1) return
    if (product.stock && value > product.stock) return
    setQuantity(value)
  }
  
  return (
    <div>
      <div className="mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.back()}
          className="flex items-center text-sm font-medium hover:text-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to products
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main image */}
          <div className="overflow-hidden rounded-lg border bg-muted/50">
            <img 
              src={images[selectedImage]}
              alt={product.name}
              className="h-full w-full object-cover object-center"
            />
          </div>
          
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`h-16 w-16 cursor-pointer overflow-hidden rounded-md border ${
                    selectedImage === index ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <img 
                    src={image}
                    alt={`${product.name} - view ${index + 1}`}
                    className="h-full w-full object-cover object-center"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div className="space-y-6">
          {/* Category */}
          {product.category && (
            <div>
              <Link 
                href={`/categories/${product.category.toLowerCase()}`}
                className="text-sm font-medium text-muted-foreground hover:text-primary"
              >
                {product.category}
              </Link>
            </div>
          )}
          
          {/* Product name */}
          <h1 className="text-3xl font-bold">{product.name}</h1>
          
          {/* Rating */}
          {product.rating !== undefined && (
            <div className="flex items-center">
              <div className="flex mr-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : i < product.rating
                        ? "text-yellow-400 fill-yellow-400 opacity-60"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating.toFixed(1)} ({product.reviewCount} reviews)
              </span>
            </div>
          )}
          
          {/* Price */}
          <div className="flex items-baseline space-x-3">
            {isOnSale ? (
              <>
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(product.salePrice)}
                </span>
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </span>
                <Badge className="bg-red-500">
                  {discountPercentage}% OFF
                </Badge>
              </>
            ) : (
              <span className="text-2xl font-bold">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          
          {/* Stock status */}
          <div>
            {isOutOfStock ? (
              <Badge variant="outline" className="text-destructive border-destructive">
                Out of Stock
              </Badge>
            ) : (
              <Badge variant="outline" className="text-green-600 border-green-400">
                In Stock
              </Badge>
            )}
          </div>
          
          {/* Description */}
          <p className="text-muted-foreground">{product.description}</p>
          
          {/* Quantity selector and add to cart */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium">Quantity:</span>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-r-none"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1 || isOutOfStock}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Decrease</span>
                </Button>
                <div className="flex h-8 w-12 items-center justify-center border-y">
                  {quantity}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-l-none"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={product.stock && quantity >= product.stock || isOutOfStock}
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Increase</span>
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button
                className="flex-1"
                size="lg"
                onClick={handleAddToCart}
                disabled={inCart || isOutOfStock}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {inCart ? "Added to Cart" : "Add to Cart"}
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={handleToggleWishlist}
                className={inWishlist ? "text-primary border-primary hover:bg-primary/10" : ""}
              >
                {inWishlist ? (
                  <Heart className="h-4 w-4 fill-primary" />
                ) : (
                  <Heart className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                </span>
              </Button>
            </div>
          </div>
          
          {/* Additional info */}
          {(product.material || product.dimensions || product.weight) && (
            <div className="space-y-2">
              <Separator />
              {product.material && (
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Material:</span>
                  <span>{product.material}</span>
                </div>
              )}
              {product.dimensions && (
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Dimensions:</span>
                  <span>{product.dimensions}</span>
                </div>
              )}
              {product.weight && (
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Weight:</span>
                  <span>{product.weight}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Detailed tabs */}
      <Tabs defaultValue="description" className="mt-12">
        <TabsList className="w-full grid grid-cols-3 max-w-md">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="py-4">
          <div className="prose max-w-none dark:prose-invert">
            {product.fullDescription ? (
              <div dangerouslySetInnerHTML={{ __html: product.fullDescription }} />
            ) : (
              <p>{product.description}</p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="features" className="py-4">
          <div className="prose max-w-none dark:prose-invert">
            <ul>
              {product.features?.map((feature, i) => (
                <li key={i}>{feature}</li>
              )) || (
                <>
                  <li>Premium quality materials</li>
                  <li>Durable construction</li>
                  <li>Stylish and functional design</li>
                </>
              )}
            </ul>
          </div>
        </TabsContent>
        <TabsContent value="reviews" className="py-4">
          <div className="text-center py-8">
            <h3 className="text-lg font-medium mb-2">Reviews Coming Soon</h3>
            <p className="text-muted-foreground">
              Customer reviews will be available soon.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
