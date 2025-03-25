"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/contexts/wishlist-context";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/product-card";
import Link from "next/link";

export default function WishlistContent() {
  const { items, clearWishlist } = useWishlist();

  if (items.length === 0) {
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
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">
          {items.length} {items.length === 1 ? "item" : "items"}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.price}
            image={product.image}
            category={product.category}
            salePrice={product.salePrice}
            rating={product.rating || 0}
            reviewCount={product.reviewCount || 0}
            stock={product.stock || 0}
            description={product.description || ""}
          />
        ))}
      </div>
    </div>
  );
}
