"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, ArrowRight, ShoppingBag, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface OrderDetails {
  _id: string;
  orderNumber: string;
  totalAmount: number;
  createdAt: string;
  orderStatus: string;
  paymentStatus: string;
}

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(!!orderId);

  // Fetch order details if orderId is provided
  useEffect(() => {
    if (orderId) {
      const fetchOrderDetails = async () => {
        try {
          const token = localStorage.getItem("authToken");
          if (!token) return;

          const response = await fetch(`/api/orders/${orderId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setOrderDetails(data.order);
          }
        } catch (error) {
          console.error("Error fetching order details:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchOrderDetails();
    }
  }, [orderId]);

  return (
    <div className="container py-16 max-w-3xl mx-auto">
      <div className="text-center">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900 mb-6">
          <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-300" />
        </div>

        <h1 className="text-3xl font-bold mb-4">Thank You for Your Order!</h1>

        <p className="text-muted-foreground mb-8">
          Your payment is being verified, and we'll process your order once the
          verification is complete. You'll receive an email confirmation with
          your order details shortly.
        </p>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : orderDetails ? (
          <Card className="p-6 mb-8 text-left">
            <h2 className="text-xl font-medium mb-4">Order Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Order Number</p>
                <p className="font-medium">{orderDetails.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">
                  {new Date(orderDetails.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="font-medium">
                  {formatPrice(orderDetails.totalAmount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium capitalize">
                  {orderDetails.orderStatus}
                </p>
              </div>
            </div>
          </Card>
        ) : null}

        <div className="bg-muted p-6 rounded-lg mb-8">
          <h2 className="font-medium mb-2">What happens next?</h2>
          <ol className="text-left space-y-2 text-sm">
            <li>1. We'll verify your payment (typically within 1-2 hours)</li>
            <li>2. Once verified, we'll process and pack your order</li>
            <li>3. Your order will be dispatched for delivery</li>
            <li>4. You'll receive tracking information via email</li>
          </ol>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/account/orders">
              <ShoppingBag className="mr-2 h-4 w-4" />
              View My Orders
            </Link>
          </Button>

          <Button variant="outline" asChild>
            <Link href="/products" className="flex items-center">
              Continue Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
