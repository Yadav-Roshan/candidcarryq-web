"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, Package, Truck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"

export default function OrderConfirmationPage() {
  const [orderNumber, setOrderNumber] = useState("")
  
  useEffect(() => {
    // Generate a random order number for demo
    setOrderNumber(`ORD-${Date.now().toString().slice(-8)}`)
  }, [])

  return (
    <div className="container mx-auto max-w-2xl px-4 py-16">
      <div className="mb-8 flex flex-col items-center justify-center text-center">
        <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle className="h-12 w-12 text-primary" />
        </div>
        <h1 className="mb-2 text-3xl font-bold">Order Confirmed!</h1>
        <p className="text-xl text-muted-foreground">
          Thank you for your purchase
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span>Order Number:</span>
            <span className="font-medium">{orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>Order Date:</span>
            <span className="font-medium">{new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Payment Method:</span>
            <span className="font-medium">Credit Card •••• 1234</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping Method:</span>
            <span className="font-medium">Standard Shipping (3-5 business days)</span>
          </div>
          <div className="flex justify-between">
            <span>Total:</span>
            <span className="font-bold">${(Math.random() * 300 + 50).toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Shipping Address</CardTitle>
        </CardHeader>
        <CardContent>
          <p>John Doe</p>
          <p>123 Main Street</p>
          <p>Apt 4B</p>
          <p>New York, NY 10001</p>
          <p>United States</p>
        </CardContent>
      </Card>

      <div className="mb-8 rounded-lg border p-6">
        <h3 className="mb-4 text-lg font-semibold">Tracking Your Order</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <CheckCircle className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium">Order Confirmed</p>
              <p className="text-sm text-muted-foreground">{new Date().toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Package className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium">Processing Order</p>
              <p className="text-sm text-muted-foreground">We're preparing your items</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Truck className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium">Shipping</p>
              <p className="text-sm text-muted-foreground">Your order will be shipped soon</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Button asChild className="flex-1">
          <Link href="/products">Continue Shopping</Link>
        </Button>
        <Button variant="outline" asChild className="flex-1">
          <Link href="/profile/orders">View All Orders</Link>
        </Button>
      </div>
    </div>
  )
}
