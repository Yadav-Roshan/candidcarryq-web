"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button, ButtonProps } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import { Product } from "@/lib/client/product-service";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

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
  const { toast } = useToast();

  const handleAddToCart = async () => {
    try {
      setIsAdding(true);

      // Wait for the addToCart operation to complete
      const success = await addToCart(product, 1);

      // Only show success toast if the operation was successful
      if (success) {
        toast({
          title: "Added to cart",
          description: `${product.name} has been added to your cart`,
        });
      }
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
