"use client";

import { Product } from "@/lib/client/product-service";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { StarRating } from "@/components/ui/star-rating";
import { Badge } from "@/components/ui/badge";
import { CartButton } from "@/components/cart/cart-button";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface QuickViewModalProps {
  product: Product;
  open: boolean;
  onClose: () => void;
}

export default function QuickViewModal({
  product,
  open,
  onClose,
}: QuickViewModalProps) {
  if (!product) return null;

  const isOutOfStock = typeof product.stock === "number" && product.stock <= 0;
  const discountPercentage =
    product.salePrice && product.price
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {product.name}
          </DialogTitle>
          <DialogDescription>
            {product.category && (
              <Badge variant="outline" className="capitalize">
                {product.category}
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Product Image */}
          <div className="relative aspect-square bg-muted rounded-md overflow-hidden">
            {product.salePrice && product.salePrice < product.price && (
              <Badge className="absolute top-2 right-2 z-10 bg-red-500">
                {discountPercentage}% OFF
              </Badge>
            )}

            {isOutOfStock && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                <Badge
                  variant="outline"
                  className="text-destructive border-destructive"
                >
                  Out of Stock
                </Badge>
              </div>
            )}

            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <span className="text-muted-foreground">No image</span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <StarRating rating={product.rating || 0} />
              <span className="text-sm text-muted-foreground">
                {product.rating?.toFixed(1) || "0.0"}
                {product.reviewCount
                  ? ` (${product.reviewCount} reviews)`
                  : " (No reviews)"}
              </span>
            </div>

            <div className="mb-4">
              {product.salePrice ? (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-destructive">
                    {formatPrice(product.salePrice)}
                  </span>
                  <span className="text-muted-foreground line-through">
                    {formatPrice(product.price)}
                  </span>
                </div>
              ) : (
                <span className="text-2xl font-bold">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            <p className="text-muted-foreground mb-4">
              {product.description || "No description available."}
            </p>

            {/* Stock Status */}
            <div className="mb-4">
              <p className="text-sm">
                Status:{" "}
                {isOutOfStock ? (
                  <span className="text-destructive font-medium">
                    Out of Stock
                  </span>
                ) : (
                  <span className="text-green-600 font-medium">In Stock</span>
                )}
              </p>
            </div>

            <Separator className="my-4" />

            <div className="flex flex-col gap-4">
              <CartButton
                product={product}
                disabled={isOutOfStock}
                className="w-full"
              />

              <Button asChild variant="outline">
                <Link href={`/products/${product.id}`}>
                  View Full Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
