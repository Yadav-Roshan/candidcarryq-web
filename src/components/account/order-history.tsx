"use client";

import { useState, useEffect } from "react";
import { Eye, ChevronDown, ChevronUp, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

// Order status types
type OrderStatus = "processing" | "shipped" | "delivered" | "cancelled";

// Define order type
interface Order {
  id: string;
  date: string;
  total: number;
  status: OrderStatus;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }[];
}

// Status badge variants based on order status
const getStatusBadge = (status: OrderStatus) => {
  switch (status) {
    case "processing":
      return (
        <Badge
          variant="outline"
          className="bg-blue-500/10 text-blue-700 border-blue-300"
        >
          Processing
        </Badge>
      );
    case "shipped":
      return (
        <Badge
          variant="outline"
          className="bg-amber-500/10 text-amber-700 border-amber-300"
        >
          Shipped
        </Badge>
      );
    case "delivered":
      return (
        <Badge
          variant="outline"
          className="bg-green-500/10 text-green-700 border-green-300"
        >
          Delivered
        </Badge>
      );
    case "cancelled":
      return (
        <Badge
          variant="outline"
          className="bg-red-500/10 text-red-700 border-red-300"
        >
          Cancelled
        </Badge>
      );
  }
};

export function OrderHistory() {
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>(
    {}
  );
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        // Get token from localStorage
        const token = localStorage.getItem("authToken");
        if (!token) {
          setOrders([]);
          setIsLoading(false);
          return;
        }

        // Fetch orders from API
        const response = await fetch("/api/user/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setOrders(data.orders || []);
        } else {
          // If there's an error, set orders to empty array
          setOrders([]);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Toggle order details view
  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>Loading your orders...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="border rounded-lg p-4 animate-pulse">
              <div className="h-6 w-32 bg-muted rounded mb-4"></div>
              <div className="h-4 w-48 bg-muted rounded"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>View and track your orders</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-12 text-center">
          <Package className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No orders yet</h3>
          <p className="text-muted-foreground mb-6">
            When you place orders, they will appear here.
          </p>
          <Button asChild>
            <a href="/products">Start Shopping</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
        <CardDescription>View and track your orders</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="border rounded-lg overflow-hidden">
              {/* Order header */}
              <div className="bg-muted p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{order.id}</span>
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Ordered on {new Date(order.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium">
                    {formatPrice(order.total)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleOrderExpansion(order.id)}
                  >
                    {expandedOrders[order.id] ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-1" />
                        Hide Details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-1" />
                        View Details
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Order details (expanded) */}
              {expandedOrders[order.id] && (
                <div className="p-4 border-t">
                  <h4 className="font-medium mb-3">Order Items</h4>
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-muted rounded-md overflow-hidden">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted">
                              <Package className="h-6 w-6 text-muted-foreground/40" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Qty: {item.quantity} x {formatPrice(item.price)}
                            </span>
                            <span>
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t flex justify-between">
                    <div>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        Track Order
                      </Button>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        Order total
                      </p>
                      <p className="font-medium">{formatPrice(order.total)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
