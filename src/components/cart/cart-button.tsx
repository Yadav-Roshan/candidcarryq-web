"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button, ButtonProps } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import { Product } from "@/contexts/cart-context";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation"; // 👈 Change this import

interface CartButtonProps extends Omit<ButtonProps, "onClick"> {
  product: Product;
  showIcon?: boolean;
}

export function CartButton({
  product,
  variant = "default",
  size = "default",
  showIcon = true,
  className,
  ...props
}: CartButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter(); // Using the client-side router from next/navigation

  const handleAddToCart = async () => {
    try {
      setIsAdding(true);

      // Check if user is logged in
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to add items to your cart",
          variant: "destructive",
        });

        // Redirect to login
        router.push(
          `/login?from=${encodeURIComponent(window.location.pathname)}`
        );
        return;
      }

      // Call addToCart without checking its return value directly
      await addToCart(product, 1);

      // Show success toast after the operation completes
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart`,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn("whitespace-nowrap", className)}
      onClick={handleAddToCart}
      disabled={isAdding || props.disabled}
      {...props}
    >
      {showIcon && <ShoppingCart className="h-4 w-4 mr-1" />}
      {isAdding ? "Adding..." : "Add to Cart"}
    </Button>
  );
}
