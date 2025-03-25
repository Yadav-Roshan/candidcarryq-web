"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import { Product } from "@/contexts/cart-context";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
  product: Product;
  className?: string;
  showQuantity?: boolean;
}

export default function AddToCartButton({
  product,
  className,
  showQuantity = true,
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const increment = () => setQuantity((prev) => prev + 1);
  const decrement = () => setQuantity((prev) => Math.max(1, prev - 1));

  const handleAddToCart = () => {
    addToCart(product, quantity);

    toast({
      title: "Added to cart",
      description: `${product.name} × ${quantity} added to your cart`,
    });

    // Reset quantity to 1 after adding to cart
    setQuantity(1);
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {showQuantity && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={decrement}
            disabled={quantity <= 1}
          >
            <Minus className="h-3 w-3" />
            <span className="sr-only">Decrease quantity</span>
          </Button>
          <span className="w-8 text-center">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={increment}
          >
            <Plus className="h-3 w-3" />
            <span className="sr-only">Increase quantity</span>
          </Button>
        </div>
      )}

      <Button
        onClick={handleAddToCart}
        className="w-full"
        size={showQuantity ? "default" : "sm"}
      >
        <ShoppingBag className="mr-2 h-4 w-4" />
        Add to Cart
      </Button>
    </div>
  );
}
