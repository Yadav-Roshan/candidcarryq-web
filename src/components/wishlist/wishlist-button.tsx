"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/contexts/wishlist-context";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface WishlistButtonProps {
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
  productCategory?: string;
  productSalePrice?: number | null;
  productStock?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  requireAuth?: boolean;
}

export function WishlistButton({
  productId,
  productName,
  productPrice,
  productImage,
  productCategory,
  productSalePrice,
  productStock,
  size = "md",
  className,
  requireAuth = true,
}: WishlistButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  // Change this line to use user directly instead of isAuthenticated
  const { user } = useAuth();
  const router = useRouter();
  const { isItemInWishlist, addItem, removeItem } = useWishlist();
  const { toast } = useToast();

  const isWishlisted = isItemInWishlist(productId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Change this line to check for user existence instead of isAuthenticated
    if (requireAuth && !user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to manage your wishlist",
      });

      // Save the current URL to return to after login
      const currentPath = window.location.pathname;
      router.push(`/login?from=${encodeURIComponent(currentPath)}`);
      return;
    }

    // Only set processing state if we're actually going to process something
    if (user) {
      setIsProcessing(true);

      try {
        if (isWishlisted) {
          await removeItem(productId);
          toast({
            title: "Removed from wishlist",
            description: `${productName} has been removed from your wishlist`,
          });
        } else {
          await addItem({
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage,
            category: productCategory,
            salePrice: productSalePrice,
            stock: productStock || 10, // Default to 10 if stock is undefined
          });
          toast({
            title: "Added to wishlist",
            description: `${productName} has been added to your wishlist`,
          });
        }
      } catch (error) {
        console.error("Wishlist operation failed:", error);
        toast({
          title: "Operation failed",
          description: "Could not update wishlist. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const sizeClasses = {
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
        sizeClasses[size],
        "rounded-full bg-background/80 hover:bg-background shadow-sm",
        isWishlisted && "text-red-500 hover:text-red-600",
        isProcessing && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={handleClick}
      disabled={isProcessing}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
    </Button>
  );
}
