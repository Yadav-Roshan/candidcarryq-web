"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  Star,
  StarHalf,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useCart } from "@/contexts/cart-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { formatPrice } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";

interface ProductDetailsProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    salePrice?: number;
    category?: string;
    image: string;
    images?: string[];
    colors?: string[];
    sizes?: string[];
    material?: string;
    dimensions?: string;
    weight?: string;
    capacity?: string;
    fullDescription?: string;
    warranty?: string; // Add warranty field
    returnPolicy?: string; // Add return policy field
    rating?: number;
    reviewCount?: number;
    stock?: number;
  };
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(product.image);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || "");
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || "");

  const { addToCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const {
    isItemInWishlist,
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
  } = useWishlist();
  const { toast } = useToast();

  const isInWishlist = isItemInWishlist(product.id);
  const isInStock = (product.stock ?? 0) > 0;
  const discountPercentage = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!isInStock) return;

    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add items to your cart",
        variant: "destructive",
      });

      // Save current URL to return after login
      router.push(
        `/login?from=${encodeURIComponent(window.location.pathname)}`
      );
      return;
    }

    // Fix: Pass product object and quantity as separate arguments
    // instead of embedding quantity inside the product object
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.salePrice || product.price,
        image: product.image,
        // Remove quantity from here - it's passed as second argument
        color: selectedColor,
        size: selectedSize,
      },
      quantity // Pass quantity as separate parameter
    );

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  const toggleWishlist = () => {
    if (isInWishlist) {
      removeFromWishlist(product.id);
      toast({
        title: "Removed from wishlist",
        description: `${product.name} has been removed from your wishlist`,
      });
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        salePrice: product.salePrice,
        category: product.category,
        stock: product.stock, // Include stock information
      });
      toast({
        title: "Added to wishlist",
        description: `${product.name} has been added to your wishlist`,
      });
    }
  };

  const incrementQuantity = () => {
    if (quantity < (product.stock ?? 10)) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= (product.stock ?? 10)) {
      setQuantity(value);
    }
  };

  const renderRatingStars = (rating: number = 0) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`star-${i}`}
          className="h-4 w-4 fill-yellow-400 text-yellow-400"
        />
      );
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <StarHalf
          key="half-star"
          className="h-4 w-4 fill-yellow-400 text-yellow-400"
        />
      );
    }

    // Add empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star
          key={`empty-star-${i}`}
          className="h-4 w-4 text-muted-foreground"
        />
      );
    }

    return stars;
  };

  // Function to get unique product images without placeholders
  const getProductImages = () => {
    // Create a Set to automatically handle duplicates
    const uniqueImages = new Set<string>();

    // Add the main product image if it exists
    if (product.image) {
      uniqueImages.add(product.image);
    }

    // Add additional images if they exist
    if (product.images && product.images.length > 0) {
      product.images.forEach((img) => uniqueImages.add(img));
    }

    // Convert back to array
    return Array.from(uniqueImages);
  };

  const allProductImages = getProductImages();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
      {/* Product Images */}
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-lg aspect-square border bg-muted">
          <img
            src={selectedImage}
            alt={product.name}
            className="w-full h-full object-contain"
          />

          {product.salePrice && (
            <Badge className="absolute left-4 top-4 bg-red-500 text-white">
              {discountPercentage}% OFF
            </Badge>
          )}
        </div>

        {/* Image thumbnails - Updated to always show at least 3 */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {allProductImages.map((img, index) => (
            <button
              key={index}
              className={`relative rounded border overflow-hidden w-20 h-20 flex-shrink-0 ${
                selectedImage === img ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedImage(img)}
            >
              <img
                src={img}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        <div>
          {product.category && (
            <div className="text-sm text-muted-foreground capitalize mb-2">
              {product.category}
            </div>
          )}

          <h1 className="text-3xl font-bold">{product.name}</h1>

          {/* Ratings */}
          {product.rating ? (
            <div className="flex items-center mt-2">
              <div className="flex">{renderRatingStars(product.rating)}</div>
              <span className="ml-2 text-sm text-muted-foreground">
                {product.rating.toFixed(1)} ({product.reviewCount} reviews)
              </span>
            </div>
          ) : null}

          {/* Price */}
          <div className="mt-4">
            {product.salePrice ? (
              <div className="flex items-center">
                <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {formatPrice(product.salePrice)}
                </span>
                <span className="ml-3 text-lg text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </span>
              </div>
            ) : (
              <span className="text-3xl font-bold">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>

        {/* Short description */}
        <p className="text-muted-foreground">{product.description}</p>

        {/* Product variants */}
        <div className="space-y-4">
          {/* Colors */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Color</label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border ${
                      selectedColor === color
                        ? "ring-2 ring-primary ring-offset-2"
                        : "ring-1 ring-muted"
                    }`}
                    style={{ backgroundColor: color.toLowerCase() }}
                    onClick={() => setSelectedColor(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Size</label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`px-3 py-1 border rounded ${
                      selectedSize === size
                        ? "bg-primary text-primary-foreground"
                        : "bg-background hover:bg-muted"
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity selector */}
          <div>
            <label className="block text-sm font-medium mb-2">Quantity</label>
            <div className="flex items-center w-32">
              <Button
                variant="outline"
                size="icon"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className="h-9 w-9 rounded-r-none"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                min="1"
                max={product.stock ?? 10}
                value={quantity}
                onChange={handleQuantityChange}
                className="h-9 rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={incrementQuantity}
                disabled={quantity >= (product.stock ?? 10)}
                className="h-9 w-9 rounded-l-none"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {isInStock ? (
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                In Stock
                {typeof product.stock === "number" && product.stock < 10 && (
                  <span> (Only {product.stock} left)</span>
                )}
              </p>
            ) : (
              <p className="text-sm text-destructive mt-2">Out of Stock</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              size="lg"
              className="w-full sm:w-2/3"
              onClick={handleAddToCart}
              disabled={!isInStock}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-1/3"
              onClick={toggleWishlist}
            >
              <Heart
                className={`mr-2 h-5 w-5 ${
                  isInWishlist ? "fill-red-500 text-red-500" : ""
                }`}
              />
              {isInWishlist ? "Saved" : "Save"}
            </Button>
          </div>
        </div>

        {/* Shipping info */}
        <div className="border-t border-b py-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center">
            <Truck className="h-5 w-5 mr-2 text-muted-foreground" />
            <span>Free shipping on orders over Rs.5000</span>
          </div>
          <div className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-muted-foreground" />
            <span>{product.warranty || "2 year warranty"}</span>
          </div>
          <div className="flex items-center">
            <RotateCcw className="h-5 w-5 mr-2 text-muted-foreground" />
            <span>{product.returnPolicy || "30-day return policy"}</span>
          </div>
        </div>

        {/* Product details tabs */}
        <Tabs defaultValue="details" className="mt-8">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="shipping">Shipping</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="pt-4">
            <div className="prose prose-sm dark:prose-invert">
              {product.fullDescription ? (
                <div
                  dangerouslySetInnerHTML={{ __html: product.fullDescription }}
                />
              ) : (
                <p>{product.description}</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="specifications" className="pt-4">
            <div className="space-y-4">
              {product.material && (
                <div className="grid grid-cols-3 border-b pb-2">
                  <span className="font-medium">Material</span>
                  <span className="col-span-2">{product.material}</span>
                </div>
              )}
              {product.dimensions && (
                <div className="grid grid-cols-3 border-b pb-2">
                  <span className="font-medium">Dimensions</span>
                  <span className="col-span-2">{product.dimensions}</span>
                </div>
              )}
              {product.weight && (
                <div className="grid grid-cols-3 border-b pb-2">
                  <span className="font-medium">Weight</span>
                  <span className="col-span-2">{product.weight}</span>
                </div>
              )}
              {product.capacity && (
                <div className="grid grid-cols-3 border-b pb-2">
                  <span className="font-medium">Capacity</span>
                  <span className="col-span-2">{product.capacity}</span>
                </div>
              )}
              {!product.material &&
                !product.dimensions &&
                !product.weight &&
                !product.capacity && <p>No specifications available.</p>}
            </div>
          </TabsContent>

          <TabsContent value="shipping" className="pt-4">
            <div className="space-y-4">
              <p>Standard shipping: 2-5 business days</p>
              <p>
                Express shipping: 1-2 business days (additional charges apply)
              </p>
              <p>Free shipping on orders over Rs. 5000</p>
              <p>
                We ship to all major cities in Nepal. Remote locations may
                require additional delivery time.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
