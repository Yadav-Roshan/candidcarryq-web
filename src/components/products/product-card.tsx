"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/lib/client/product-service";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StarRating } from "@/components/ui/star-rating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, ShoppingCart } from "lucide-react";
import { CartButton } from "@/components/cart/cart-button";
import { WishlistButton } from "@/components/wishlist/wishlist-button";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/ui/use-toast";

type ProductCardProps =
  | {
      product: Product;
    }
  | {
      id: string;
      name: string;
      price: number;
      image: string;
      category?: string;
      salePrice?: number;
      rating?: number;
      reviewCount?: number;
      stock?: number;
      description?: string;
    };

export function ProductCard(props: ProductCardProps) {
  // Handle both prop types (direct properties or product object)
  const product = "product" in props ? props.product : props;
  // Change this line to use user directly instead of isAuthenticated
  const { user } = useAuth();
  const { toast } = useToast();

  const {
    id,
    name,
    price,
    image,
    category,
    salePrice,
    rating = 0, // Default to 0 if no rating
    reviewCount = 0, // Default to 0 if no review count
    stock, // Remove the default value of 0
  } = product;

  // Change how we determine if an item is out of stock
  // Only consider it out of stock if stock is explicitly set to 0
  const isOutOfStock = typeof stock === "number" && stock <= 0;
  const discountPercentage =
    salePrice && price ? Math.round(((price - salePrice) / price) * 100) : 0;

  const handleWishlistClick = () => {
    // Change this line to check for user existence
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add items to your wishlist",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="overflow-hidden group border border-border transition-all hover:border-primary/20 hover:shadow-md h-full flex flex-col">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {/* Sale badge */}
        {salePrice && salePrice < price && (
          <Badge className="absolute top-2 right-2 z-10 bg-red-500">
            {discountPercentage}% OFF
          </Badge>
        )}

        {/* Out of stock overlay - modified to not block interactions */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center pointer-events-none">
            <Badge
              variant="outline"
              className="text-destructive border-destructive"
            >
              Out of Stock
            </Badge>
          </div>
        )}

        {/* Product image with proper sizing */}
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-all group-hover:scale-105"
            priority={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <span className="text-muted-foreground">No image</span>
          </div>
        )}

        {/* Wishlist button - ensure higher z-index and proper styling */}
        <div
          className="absolute top-2 left-2 z-30"
          onClick={handleWishlistClick}
        >
          <WishlistButton
            productId={id}
            productName={name}
            productPrice={price}
            productImage={image}
            productCategory={category}
            productSalePrice={salePrice}
            productStock={stock} // Pass stock information
            size="sm"
            requireAuth={true}
          />
        </div>

        {/* Quick view overlay with button - ensure higher z-index than out-of-stock overlay */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <Link href={`/products/${id}`}>
            <Button variant="secondary" size="sm" className="gap-2">
              <Eye className="h-4 w-4" />
              Quick View
            </Button>
          </Link>
        </div>
      </div>

      <CardContent className="p-4 flex flex-col flex-grow">
        {/* Product category */}
        {category && (
          <div className="mb-1">
            <Link
              href={`/categories/${category}`}
              className="text-xs text-muted-foreground hover:text-primary capitalize"
            >
              {category}
            </Link>
          </div>
        )}

        {/* Product name */}
        <Link href={`/products/${id}`} className="block">
          <h3 className="font-medium text-base line-clamp-1 hover:underline hover:underline-offset-2 mb-1">
            {name}
          </h3>
        </Link>

        {/* Star rating - show for all products including those with 0 rating */}
        <div className="flex items-center gap-1 mb-2">
          <StarRating rating={rating} size="sm" />
          <span className="text-xs text-muted-foreground ml-1">
            {rating.toFixed(1)}
            {reviewCount > 0 ? ` (${reviewCount})` : " (No reviews)"}
          </span>
        </div>

        {/* Price and add to cart - push to bottom with flex */}
        <div className="flex items-center justify-between mt-auto pt-2">
          <div>
            {salePrice ? (
              <div className="flex flex-col">
                <span className="font-medium text-destructive">
                  {formatPrice(salePrice)}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(price)}
                </span>
              </div>
            ) : (
              <span className="font-medium">{formatPrice(price)}</span>
            )}
          </div>

          {/* Add to cart button - fixed width to prevent wrapping */}
          <CartButton
            product={product}
            variant="default"
            size="sm"
            disabled={isOutOfStock}
            className="whitespace-nowrap min-w-[80px]"
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Add skeleton component for loading states
ProductCard.Skeleton = function ProductCardSkeleton() {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="aspect-square relative bg-muted">
        <Skeleton className="h-full w-full" />
      </div>
      <div className="p-4">
        <Skeleton className="h-4 w-2/3 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-4" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
};
