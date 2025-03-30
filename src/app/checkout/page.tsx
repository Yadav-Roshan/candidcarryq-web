"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import CheckoutSummary from "@/components/checkout/checkout-summary";
import CheckoutPaymentForm from "@/components/checkout/checkout-payment-form";
import { useAuth } from "@/contexts/auth-context";
import ShippingAddressForm from "@/components/checkout/shipping-address-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatNPR } from "@/lib/utils";

export default function CheckoutPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"shipping" | "payment">("shipping");
  const [shippingAddress, setShippingAddress] = useState<any>(null);
  const { cartItems, subtotal, clearCart, createOrder } = useCart();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isUserInfoComplete, setIsUserInfoComplete] = useState<boolean | null>(
    null
  );
  const [orderId, setOrderId] = useState<string | undefined>(undefined);

  // Calculate other costs
  const shipping = subtotal >= 5000 ? 0 : 250; // Free shipping over Rs. 5000
  const tax = Math.round(subtotal * 0.13); // 13% tax
  const total = subtotal + shipping + tax;

  // Check if user has required information
  useEffect(() => {
    if (!isAuthLoading && user) {
      const hasPhoneNumber = !!user.phoneNumber;
      const hasAddress =
        !!user.address?.locality &&
        !!user.address?.district &&
        !!user.address?.postalCode;
      setIsUserInfoComplete(hasPhoneNumber && hasAddress);
    }
  }, [user, isAuthLoading]);

  // Initialize order ID for better file organization
  useEffect(() => {
    if (!isAuthLoading && user) {
      // Generate a temporary order ID that will be replaced with the real one after order creation
      // This helps organize uploaded files even before the order is created
      setOrderId(`temp_${user.id}_${Date.now()}`);
    }
  }, [user, isAuthLoading]);

  // Handle shipping form submission
  const handleShippingSubmit = (data: any) => {
    // Extract shipping address from form data and ensure phone number is included
    const addressData = {
      buildingName: data.buildingName,
      locality: data.locality,
      wardNo: data.wardNo,
      postalCode: data.postalCode,
      district: data.district,
      province: data.province,
      country: data.country,
      landmark: data.landmark,
    };

    setShippingAddress({
      ...addressData,
      phoneNumber: data.phoneNumber, // Ensure the phone number is included
    });
    setStep("payment");
  };

  // Handle payment form submission
  const handlePaymentSubmit = async (paymentData: any) => {
    try {
      setIsSubmitting(true);

      // Get payment proof image URL from Cloudinary or other storage
      const paymentProofUrl = paymentData.paymentProofUrl || "";

      // Create order using cart context function
      const result = await createOrder({
        shippingAddress,
        paymentMethod: paymentData.paymentMethod,
        transactionRef: paymentData.transactionId,
        paymentProofImage: paymentProofUrl,
      });

      if (result.success) {
        // Success path - clear cart and redirect
        toast({
          title: "Order Successfully Placed",
          description: "Your payment is being verified. We'll update you soon!",
        });

        try {
          // Make sure to await cart clearing before redirecting
          await clearCart();
          console.log("Cart cleared successfully");
        } catch (cartError) {
          console.error("Error clearing cart on client:", cartError);
          // Continue with redirect even if client-side clearing fails
          // Server-side cart should still be cleared by our API update
        }

        // Redirect to order success page with order ID if available
        router.push(
          `/order-success${
            result.order?._id ? `?orderId=${result.order._id}` : ""
          }`
        );
      } else {
        throw new Error(result.error || "Failed to create order");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Checkout failed",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // If cart is empty, redirect to cart page
  if (cartItems.length === 0) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
        <p className="mb-8 text-muted-foreground">
          Add some products to your cart before proceeding to checkout
        </p>
        <Button onClick={() => router.push("/products")}>
          Browse Products
        </Button>
      </div>
    );
  }

  // Show loading state when checking user info
  if (isAuthLoading || isUserInfoComplete === null) {
    return (
      <div className="container py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {!isUserInfoComplete && (
        <Alert variant="warning" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Information Required</AlertTitle>
          <AlertDescription>
            Please complete your phone number and shipping address information
            below to proceed with checkout.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content - Shipping or Payment form */}
        <div className="lg:col-span-2">
          <div className="bg-background rounded-lg border shadow-sm p-6">
            {step === "shipping" ? (
              <>
                <h2 className="text-xl font-bold mb-6">Shipping Information</h2>
                <ShippingAddressForm
                  onSubmit={handleShippingSubmit}
                  defaultValues={user?.address}
                />
              </>
            ) : (
              <CheckoutPaymentForm
                onSubmit={handlePaymentSubmit}
                isSubmitting={isSubmitting}
                orderId={orderId} // Pass the orderId for better file organization
              />
            )}
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-background rounded-lg border shadow-sm sticky top-24">
            <CheckoutSummary
              cartItems={cartItems}
              subtotal={subtotal}
              tax={tax}
              shipping={shipping}
              total={total}
            />

            {step === "payment" && (
              <div className="px-6 pb-6">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setStep("shipping")}
                >
                  Back to Shipping
                </Button>
              </div>
            )}
          </div>

          {/* Order summary on mobile */}
          <div className="bg-background rounded-lg border shadow-sm mt-6 p-4 lg:hidden">
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatNPR(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
