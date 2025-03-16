"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ArrowRight, ShoppingBag } from "lucide-react"
import EmptyState from "@/components/ui/empty-state"

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, subtotal, clearCart } = useCart()
  const [promoCode, setPromoCode] = useState("")
  
  const shipping = 10.00
  const discount = 0.00
  const tax = subtotal * 0.07
  const total = subtotal + shipping + tax - discount
  
  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <EmptyState 
          icon={<ShoppingBag className="h-12 w-12" />}
          title="Your cart is empty"
          description="Looks like you haven't added any products to your cart yet."
          action={
            <Button asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Shopping Cart</h1>
      
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Cart items */}
          <div className="rounded-lg border">
            <div className="p-6">
              {cartItems.map((item) => (
                <div key={item.id} className="mb-6 last:mb-0">
                  <div className="flex items-start gap-4">
                    <div className="relative h-24 w-24 overflow-hidden rounded-md">
                      <Image 
                        src={item.image} 
                        alt={item.name}
                        fill
                        sizes="100px"
                        className="object-cover"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <Link href={`/products/${item.id}`} className="font-medium hover:underline">
                            {item.name}
                          </Link>
                          
                          <p className="mt-1 text-sm text-muted-foreground">
                            ${item.price.toFixed(2)} each
                          </p>
                          
                          <div className="mt-2 flex items-center gap-4">
                            <div className="flex items-center">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-8 w-8 rounded-r-none"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >-</Button>
                              <div className="flex h-8 w-12 items-center justify-center border-y border-input bg-background">
                                {item.quantity}
                              </div>
                              <Button 
                                variant="outline"
                                size="icon" 
                                className="h-8 w-8 rounded-l-none"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >+</Button>
                            </div>
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="h-auto p-0 text-muted-foreground"
                              onClick={() => removeFromCart(item.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {cartItems.indexOf(item) < cartItems.length - 1 && <Separator className="my-6" />}
                </div>
              ))}
            </div>
            <div className="border-t bg-muted/50 p-4">
              <div className="flex justify-between">
                <Button variant="outline" size="sm" onClick={() => clearCart()}>
                  Clear cart
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/products">Continue shopping</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="rounded-lg border p-6">
          <h2 className="mb-4 text-lg font-bold">Order Summary</h2>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>${shipping.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
          </div>
          
          <Separator className="my-4" />
          
          <div className="mb-6 flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          
          {/* Promo code */}
          <div className="mb-6">
            <div className="mb-2 flex items-center gap-2">
              <Input
                type="text"
                placeholder="Promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
              <Button variant="outline" className="shrink-0" disabled={!promoCode}>
                Apply
              </Button>
            </div>
          </div>
          
          <Button className="w-full" size="lg" asChild>
            <Link href="/checkout">
              Checkout <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          
          <div className="mt-4 text-center text-xs text-muted-foreground">
            <p>We accept major credit cards, PayPal, and Apple Pay</p>
          </div>
        </div>
      </div>
    </div>
  )
}
