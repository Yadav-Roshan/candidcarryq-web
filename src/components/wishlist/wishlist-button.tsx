"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useWishlist } from "@/contexts/wishlist-context";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
  productCategory?: string;
  productSalePrice?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function WishlistButton({
  productId,
  productName,
  productPrice,
  productImage,
  productCategory,
  productSalePrice,
  size = "md",
  className,
}: WishlistButtonProps) {
  const { isItemInWishlist, addItem, removeItem } = useWishlist();
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  // Only show wishlisted state if user is logged in
  const isWishlisted = user ? isItemInWishlist(productId) : false;

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isProcessing) return;

    // Check if user is logged in
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save items to your wishlist",
      });
      router.push(`/login?from=/products/${productId}`);
      return;
    }

    setIsProcessing(true);

    // Toggle wishlist status
    if (isWishlisted) {
      removeItem(productId);
      toast({
        title: "Removed from wishlist",
        description: `${productName} has been removed from your wishlist`,
      });
    } else {
      addItem({
        id: productId,
        name: productName,
        price: productPrice,
        image: productImage,
        category: productCategory,
        salePrice: productSalePrice,
      });
      toast({
        title: "Added to wishlist",
        description: `${productName} has been added to your wishlist`,
      });
    }

    setIsProcessing(false);
  };

  const sizeClassNames = {
    sm: "h-7 w-7",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        sizeClassNames[size],
        "rounded-full hover:bg-background/80",
        isWishlisted && "text-red-500",
        className
      )}
      onClick={handleWishlistToggle}
      disabled={isProcessing}
    >
      <Heart
        className={cn("h-[60%] w-[60%]", isWishlisted && "fill-current")}
      />
      <span className="sr-only">
        {isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
      </span>
    </Button>
  );
}
