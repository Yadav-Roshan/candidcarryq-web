"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Share2, Star, ChevronRight, Check, ShoppingBag } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/components/ui/use-toast"
import { Product } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatPrice, calculateDiscountPercentage } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface ProductDetailsProps {
  product: Product
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const { addToCart } = useCart()
  const { toast } = useToast()
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || null)
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)
  
  const discountPercentage = product.salePrice ? 
    calculateDiscountPercentage(product.price, product.salePrice) : 0
  
  const handleAddToCart = () => {
    addToCart(product, quantity)
    
    toast({
      title: "Added to cart",
      description: `${quantity} × ${product.name} added to your cart`,
      duration: 3000,
    })
  }
  
  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted)
    
    toast({
      title: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
      description: isWishlisted 
        ? `${product.name} removed from your wishlist` 
        : `${product.name} added to your wishlist`,
      duration: 3000,
    })
  }
  
  // Use product images array or fallback to main image
  const images = product.images && product.images.length > 0 
    ? product.images 
    : [product.image || `https://placehold.co/600x600?text=${encodeURIComponent(product.name.substring(0, 2))}`]
    
  return (
    <div>
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <Link href="/products" className="hover:text-foreground">Products</Link>
        {product.category && (
          <>
            <ChevronRight className="h-4 w-4 mx-1" />
            <Link 
              href={`/products?category=${product.category}`} 
              className="hover:text-foreground capitalize"
            >
              {product.category}
            </Link>
          </>
        )}
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className="text-foreground truncate max-w-[200px]">{product.name}</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Product images */}
        <div className="space-y-4">
          {/* Main image */}
          <div className="aspect-square overflow-hidden rounded-lg border bg-muted relative">
            {product.salePrice && (
              <Badge variant="success" className="absolute left-3 top-3 z-10">
                -{discountPercentage}% OFF
              </Badge>
            )}
            <Image
              src={images[selectedImage]}
              alt={product.name}
              width={600}
              height={600}
              className="h-full w-full object-cover transition-all"
              priority
            />
          </div>
          
          {/* Image thumbnails - only show if more than 1 */}
          {images.length > 1 && (
            <div className="flex space-x-2 overflow-auto pb-2">
              {images.map((image, i) => (
                <button
                  key={i}
                  className={`relative aspect-square h-20 overflow-hidden rounded-md border-2 ${selectedImage === i ? 'border-primary' : 'border-transparent'}`}
                  onClick={() => setSelectedImage(i)}
                >
                  <Image
                    src={image}
                    alt={`Product image ${i + 1}`}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Product info */}
        <div>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            
            {/* Rating */}
            {product.rating && (
              <div className="flex items-center mt-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < Math.floor(product.rating!) 
                        ? "fill-yellow-400 text-yellow-400" 
                        : "text-gray-300"}`} 
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-muted-foreground">
                  {product.rating} ({product.reviewCount} reviews)
                </span>
              </div>
            )}
            
            {/* Price */}
            <div className="mt-3">
              {product.salePrice ? (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{formatPrice(product.salePrice)}</span>
                  <span className="text-muted-foreground line-through">{formatPrice(product.price)}</span>
                  <Badge variant="success">Save {discountPercentage}%</Badge>
                </div>
              ) : (
                <span className="text-2xl font-bold">{formatPrice(product.price)}</span>
              )}
            </div>
            
            {/* Short description */}
            <p className="mt-4 text-muted-foreground">
              {product.description}
            </p>
          </div>
          
          {/* Color options */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Color</h3>
              <div className="flex space-x-2">
                {product.colors.map((color) => (
                  <button 
                    key={color} 
                    className={`h-8 w-8 rounded-full border-2 ${selectedColor === color ? 'ring-2 ring-primary ring-offset-2' : 'border-gray-200'}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                    aria-label={`Select ${color} color`}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Size options */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">Size</h3>
                <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                  Size Guide
                </Button>
              </div>
              
              <RadioGroup 
                value={selectedSize || undefined}
                onValueChange={setSelectedSize}
                className="flex flex-wrap gap-2"
              >
                {product.sizes.map((size) => (
                  <div key={size} className="flex items-center">
                    <RadioGroupItem 
                      value={size} 
                      id={`size-${size}`} 
                      className="sr-only"
                    />
                    <Label
                      htmlFor={`size-${size}`}
                      className={`text-center min-w-12 rounded-md border px-3 py-2 text-sm capitalize cursor-pointer ${
                        selectedSize === size 
                          ? "border-primary bg-primary text-primary-foreground" 
                          : "border-input hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      {size}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}
          
          {/* Quantity */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">Quantity</h3>
            <div className="flex items-center border rounded-md w-32">
              <Button
                variant="ghost"
                size="sm"
                disabled={quantity <= 1}
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="rounded-r-none"
              >
                -
              </Button>
              <div className="flex-1 text-center">{quantity}</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuantity(q => q + 1)}
                className="rounded-l-none"
              >
                +
              </Button>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Button 
              onClick={handleAddToCart} 
              size="lg"
              className="flex-1"
            >
              Add to Cart
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={handleWishlist}
              className={isWishlisted ? "text-red-500 flex-1" : "flex-1"}
            >
              <Heart className={`mr-2 h-5 w-5 ${isWishlisted ? "fill-red-500" : ""}`} />
              {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
            </Button>
          </div>
          
          {/* Product highlights */}
          <div className="space-y-2">
            {product.material && (
              <div className="flex gap-2 text-sm">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span><span className="font-medium">Material:</span> {product.material}</span>
              </div>
            )}
            {product.dimensions && (
              <div className="flex gap-2 text-sm">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span><span className="font-medium">Dimensions:</span> {product.dimensions}</span>
              </div>
            )}
            {product.capacity && (
              <div className="flex gap-2 text-sm">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span><span className="font-medium">Capacity:</span> {product.capacity}</span>
              </div>
            )}
            <div className="flex gap-2 text-sm">
              <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span>Free delivery within Kathmandu valley</span>
            </div>
            <div className="flex gap-2 text-sm">
              <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span>30-day return policy</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Product tabs */}
      <div className="mt-16">
        <Tabs defaultValue="description">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-6 prose max-w-none">
            <p>{product.fullDescription || product.description}</p>
          </TabsContent>
          <TabsContent value="specifications" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {product.material && (
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Material</span>
                  <span>{product.material}</span>
                </div>
              )}
              {product.dimensions && (
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Dimensions</span>
                  <span>{product.dimensions}</span>
                </div>
              )}
              {product.weight && (
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Weight</span>
                  <span>{product.weight}</span>
                </div>
              )}
              {product.capacity && (
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Capacity</span>
                  <span>{product.capacity}</span>
                </div>
              )}
              {product.colors && (
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Available colors</span>
                  <span className="capitalize">{product.colors.join(", ")}</span>
                </div>
              )}
              {product.sizes && (
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Available sizes</span>
                  <span className="uppercase">{product.sizes.join(", ")}</span>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            {/* This would be where you'd put reviews component */}
            <div className="text-center py-8 text-muted-foreground">
              <p>No reviews yet. Be the first to review this product!</p>
              <Button className="mt-4">Write a Review</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
