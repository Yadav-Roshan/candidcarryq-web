"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { formatPrice } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import CheckoutAddressForm from "@/components/checkout/checkout-address-form";
import CheckoutPaymentForm from "@/components/checkout/checkout-payment-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { cartItems, clearCart } = useCart();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [promoCode, setPromoCode] = useState<{
    code: string;
    discountPercentage: number;
    discountAmount: number;
    description: string;
  } | null>(null);
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [promoCodeError, setPromoCodeError] = useState("");
  const [isPromoLoading, setIsPromoLoading] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    shippingAddress: {
      buildingName: "",
      locality: "",
      wardNo: "",
      district: "",
      province: "",
      postalCode: "",
      country: "Nepal",
      landmark: "",
      phoneNumber: "",
    },
    paymentMethod: "esewa",
    transactionRef: "",
    paymentProofUrl: "",
    paymentProofPublicId: "", // Add the public ID field
  });

  // Try to retrieve promo code from localStorage on page load
  useEffect(() => {
    const savedPromo = localStorage.getItem("activePromoCode");
    if (savedPromo) {
      try {
        setPromoCode(JSON.parse(savedPromo));
      } catch (e) {
        // If parsing fails, clear the stored value
        localStorage.removeItem("activePromoCode");
      }
    }
  }, []);

  // Make sure cartItems is defined before calculating
  const items = cartItems || [];

  // Calculate order summary values - now properly using sale prices
  const subtotal = items.reduce(
    (total, item) => total + (item.salePrice || item.price) * item.quantity,
    0
  );

  // Calculate total quantity of items in the cart
  const totalQuantity = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Free shipping if 10 or more items are ordered
  const shipping = totalQuantity >= 10 ? 0 : 100; // Changed from 200 to 100
  const discount = promoCode?.discountAmount || 0;
  const tax = (subtotal - discount) * 0.13; // 13% tax
  const total = subtotal - discount + shipping + tax;

  // Get product categories for promo code validation
  const cartCategories = items
    .map((item) => item.category)
    .filter((category): category is string => !!category);

  // Redirect if cart is empty
  useEffect(() => {
    if (!isAuthLoading && items.length === 0) {
      router.push("/cart");
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Please add items before checkout.",
      });
    }
  }, [items, router, toast, isAuthLoading]);

  // Check for authentication
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/login?redirect=/checkout");
      toast({
        title: "Authentication Required",
        description: "Please log in to continue checkout",
      });
    }
  }, [user, router, toast, isAuthLoading]);

  // Handle address form submission
  const handleAddressSubmit = (address: any) => {
    setFormData((prev) => ({
      ...prev,
      shippingAddress: address,
    }));
    setCurrentStep(2);
  };

  // Handle applying promo code
  const handleApplyPromoCode = async () => {
    // Clear previous errors
    setPromoCodeError("");

    if (!promoCodeInput.trim()) {
      setPromoCodeError("Please enter a promo code");
      return;
    }

    try {
      setIsPromoLoading(true);
      const token = localStorage.getItem("authToken");

      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in again",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch("/api/promocodes/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: promoCodeInput,
          cartTotal: subtotal, // Use subtotal with sale prices already applied
          categories: cartCategories,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setPromoCodeError(data.message || "Invalid promo code");
        return;
      }

      // Set valid promocode data
      const validPromo = {
        code: data.code,
        discountPercentage: data.discountPercentage,
        discountAmount: data.discountAmount,
        description: data.description,
      };

      setPromoCode(validPromo);

      // Save to localStorage for persistence between page reloads
      localStorage.setItem("activePromoCode", JSON.stringify(validPromo));

      // Clear input
      setPromoCodeInput("");

      toast({
        title: "Promo Code Applied",
        description: `${data.code} has been applied to your order`,
      });
    } catch (error) {
      console.error("Error applying promo code:", error);
      setPromoCodeError("Failed to apply promo code. Please try again.");
    } finally {
      setIsPromoLoading(false);
    }
  };

  // Handle clearing promocode
  const handleClearPromoCode = () => {
    setPromoCode(null);
    localStorage.removeItem("activePromoCode");
  };

  // Handle payment form submission and create order
  const handlePaymentSubmit = async (paymentData: any) => {
    try {
      setIsSubmitting(true);

      const token = localStorage.getItem("authToken");
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in again to complete your order",
          variant: "destructive",
        });
        return;
      }

      // Prepare order data
      const orderData = {
        items: items.map((item) => ({
          product: item.id,
          name: item.name,
          price: item.salePrice || item.price, // Use sale price if available
          originalPrice: item.price, // Store the original price
          quantity: item.quantity,
          image: item.image || "",
          color: item.color,
          size: item.size,
        })),
        totalAmount: total,
        shippingAddress: formData.shippingAddress,
        paymentMethod: paymentData.paymentMethod,
        transactionRef: paymentData.transactionId,
        paymentProofImage: paymentData.paymentProofUrl,
        paymentProofPublicId: paymentData.paymentProofPublicId, // Include the public ID
        shippingCost: shipping,
        taxAmount: tax,
        discount: discount, // Include discount amount
        promoCode: promoCode?.code, // Include promo code if used
        promoCodeDiscount: discount, // Set promoCodeDiscount same as discount for now
      };

      // Send order to API
      const response = await fetch("/api/user/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create order");
      }

      // Clear cart and promo code
      clearCart();
      localStorage.removeItem("activePromoCode");

      // Show success message and redirect to order confirmation
      toast({
        title: "Order Placed Successfully",
        description: "Thank you for your order!",
      });

      // Redirect to order confirmation page
      router.push(`/account/orders/${result.order._id}`);
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to place your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isAuthLoading || items.length === 0) {
    return (
      <div className="container py-10 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Preparing checkout...</span>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Main checkout form (steps) */}
        <div className="md:col-span-2">
          {/* Step 1: Address */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-xl font-bold mb-6">Shipping Address</h2>
              <CheckoutAddressForm
                onSubmit={handleAddressSubmit}
                initialAddress={formData.shippingAddress}
                isSubmitting={isSubmitting}
              />
            </div>
          )}

          {/* Step 2: Payment */}
          {currentStep === 2 && (
            <div>
              <div className="mb-6 flex items-center">
                <Button
                  variant="ghost"
                  onClick={() => setCurrentStep(1)}
                  className="mr-2"
                >
                  Back
                </Button>
                <h2 className="text-xl font-bold">Payment</h2>
              </div>

              <CheckoutPaymentForm
                onSubmit={handlePaymentSubmit}
                isSubmitting={isSubmitting}
              />
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div>
          <div className="sticky top-20 bg-card rounded-lg border p-6">
            <h2 className="font-semibold text-lg mb-4">Order Summary</h2>

            {/* Items count */}
            <div className="text-sm mb-4">
              {items.length} {items.length === 1 ? "item" : "items"}
            </div>

            {/* Items preview (first 3) */}
            <div className="space-y-3 mb-6">
              {items.slice(0, 3).map((item) => (
                <div
                  key={`${item.id}-${item.color}-${item.size}`}
                  className="flex items-center gap-3"
                >
                  <div className="h-12 w-12 bg-muted rounded-md overflow-hidden flex-shrink-0">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <div className="text-xs text-muted-foreground">
                      Qty: {item.quantity} ×{" "}
                      {formatPrice(item.salePrice || item.price)}
                      {item.salePrice && (
                        <span className="line-through ml-1 text-muted-foreground">
                          {formatPrice(item.price)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {items.length > 3 && (
                <div className="text-sm text-muted-foreground">
                  ...and {items.length - 3} more{" "}
                  {items.length - 3 === 1 ? "item" : "items"}
                </div>
              )}
            </div>

            {/* Promo Code Input (only show in first step) */}
            {currentStep === 1 && (
              <div className="mt-6 mb-4">
                {promoCode ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="bg-green-100 border-green-200"
                        >
                          {promoCode.code}
                        </Badge>
                        <span className="text-sm text-green-600">
                          {promoCode.discountPercentage}% off
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={handleClearPromoCode}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount:</span>
                      <span>-{formatPrice(promoCode.discountAmount)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {promoCode.description}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter promo code"
                        value={promoCodeInput}
                        onChange={(e) => setPromoCodeInput(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        onClick={handleApplyPromoCode}
                        disabled={isPromoLoading || !promoCodeInput.trim()}
                      >
                        {isPromoLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Apply"
                        )}
                      </Button>
                    </div>
                    {promoCodeError && (
                      <p className="text-sm text-destructive">
                        {promoCodeError}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Order calculations */}
            <div className="border-t pt-4 mt-4">
              {/* Subtotal */}
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              {/* Discount (if applied) */}
              {discount > 0 && (
                <div className="flex justify-between mb-2 text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}

              {/* Shipping */}
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Shipping</span>
                {shipping === 0 ? (
                  <span className="text-green-600">Free</span>
                ) : (
                  <span>{formatPrice(shipping)}</span>
                )}
              </div>

              {/* Tax */}
              <div className="flex justify-between mb-4">
                <span className="text-muted-foreground">Tax (13%)</span>
                <span>{formatPrice(tax)}</span>
              </div>

              {/* Total */}
              <div className="flex justify-between font-medium text-lg pt-2 border-t">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
