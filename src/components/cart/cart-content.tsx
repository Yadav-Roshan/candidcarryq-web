"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

export default function CartContent() {
  const router = useRouter();
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const { toast } = useToast();

  // Calculate order summary values with sale prices
  const subtotal = cartItems.reduce(
    (total, item) => total + (item.salePrice || item.price) * item.quantity,
    0
  );

  // Calculate total quantity of items in the cart
  const totalQuantity = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Free shipping if 10 or more items are ordered
  const shipping = totalQuantity >= 10 ? 0 : 100; // Changed from 250 to 100
  const total = subtotal + shipping;

  const handleCheckout = () => {
    // Navigate to checkout page where promocodes will be applied
    router.push("/checkout");
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-medium mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Button asChild>
          <Link href="/products">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Cart items - 8/12 width on large screens */}
      <div className="lg:col-span-8">
        <div className="bg-background rounded-lg border p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium">
              {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => clearCart()}
            >
              Clear Cart
            </Button>
          </div>

          {/* Cart items list */}
          <div className="space-y-6">
            {cartItems.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className="grid grid-cols-12 gap-4 items-center"
              >
                {/* Product image - 2 columns */}
                <div className="col-span-2">
                  <div className="aspect-square relative rounded-md overflow-hidden border">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100px, 150px"
                      />
                    ) : (
                      <div className="h-full w-full bg-muted flex items-center justify-center">
                        <ShoppingBag className="h-8 w-8 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Product details - 6 columns */}
                <div className="col-span-6">
                  <h3 className="font-medium">
                    <Link
                      href={`/products/${item.id}`}
                      className="hover:underline"
                    >
                      {item.name}
                    </Link>
                  </h3>
                  {item.category && (
                    <p className="text-sm text-muted-foreground capitalize">
                      Category: {item.category}
                    </p>
                  )}
                  <div className="mt-2">
                    {item.salePrice ? (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {formatPrice(item.salePrice)}
                        </span>
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(item.price)}
                        </span>
                      </div>
                    ) : (
                      <span className="font-medium">
                        {formatPrice(item.price)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity controls - 3 columns */}
                <div className="col-span-3 flex items-center">
                  <div className="flex items-center border rounded-md">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-r-none"
                      onClick={() =>
                        updateQuantity(item.id, Math.max(1, item.quantity - 1))
                      }
                    >
                      -
                    </Button>
                    <div className="w-10 text-center text-sm">
                      {item.quantity}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-l-none"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Item total and remove button - 1 column */}
                <div className="col-span-1 flex flex-col items-end gap-2">
                  <div className="font-medium">
                    {formatPrice(
                      (item.salePrice || item.price) * item.quantity
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Continue shopping button */}
        <div className="mt-6">
          <Button variant="outline" asChild className="flex items-center gap-2">
            <Link href="/products">
              <ShoppingBag className="h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>

      {/* Order summary - 4/12 width on large screens */}
      <div className="lg:col-span-4">
        <div className="bg-background rounded-lg border p-6 sticky top-20">
          <h2 className="text-xl font-medium mb-6">Order Summary</h2>

          {/* Subtotal */}
          <div className="flex justify-between mb-3">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          {/* Shipping */}
          <div className="flex justify-between mb-3">
            <span className="text-muted-foreground">Shipping</span>
            {shipping === 0 ? (
              <span className="text-green-600">Free</span>
            ) : (
              <span>{formatPrice(shipping)}</span>
            )}
          </div>

          <Separator className="my-4" />

          {/* Total */}
          <div className="flex justify-between mb-6">
            <span className="font-medium">Estimated Total</span>
            <span className="font-bold text-lg">{formatPrice(total)}</span>
          </div>

          {/* Note about promocodes */}
          <p className="text-xs text-muted-foreground mb-4">
            Promo codes can be applied during checkout
          </p>

          {/* Checkout Button */}
          <Button className="w-full" size="lg" onClick={handleCheckout}>
            Proceed to Checkout
          </Button>

          {/* Additional info */}
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Shipping & delivery options will be calculated at checkout
          </p>
        </div>
      </div>
    </div>
  );
}
