"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function OrderSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams?.get("orderId");
  const orderNumber = searchParams?.get("orderNumber");
  const total = searchParams?.get("total");

  const [orderData, setOrderData] = useState({
    id: orderId || "",
    orderNumber: orderNumber || "",
    total: total ? parseFloat(total) : 0,
  });

  useEffect(() => {
    // If no order ID is provided, redirect to home
    if (!orderId) {
      router.push("/");
    }
  }, [orderId, router]);

  return (
    <div className="container max-w-lg py-16">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="bg-green-100 rounded-full p-3 mb-4">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Order Successful!</h1>
        <p className="text-muted-foreground">
          Thank you for your purchase. Your order has been received.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Order Number:</span>
            <span className="font-medium">{orderData.orderNumber}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Amount:</span>
            <span className="font-medium">{formatPrice(orderData.total)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Status:</span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Pending
            </span>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Link href={`/account/orders/${orderData.id}`} className="w-full">
            <Button variant="default" className="w-full">
              View Order Details
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/products" className="w-full">
            <Button variant="outline" className="w-full">
              Continue Shopping
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
