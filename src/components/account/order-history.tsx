"use client";

import { useState, useEffect } from "react";
import {
  Package,
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  Search,
  CheckCircle,
  Truck,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Order status types
type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

type PaymentStatus =
  | "pending"
  | "verified"
  | "rejected"
  | "completed"
  | "failed";

// Define a more detailed order type to match what comes from the API
interface Order {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  trackingNumber?: string;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }[];
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    wardNo?: string;
    landmark?: string;
  };
  paymentMethod?: string;
  transactionRef?: string;
  shippingCost?: number;
  taxAmount?: number;
  discount?: number;
  promoCode?: string;
  statusHistory?: Array<{
    status: string;
    timestamp: string;
    note?: string;
  }>;
}

// Get status color based on order status
const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case "pending":
      return "border-l-yellow-500 bg-yellow-50";
    case "processing":
      return "border-l-blue-500 bg-blue-50";
    case "shipped":
      return "border-l-amber-500 bg-amber-50";
    case "delivered":
      return "border-l-green-500 bg-green-50";
    case "cancelled":
      return "border-l-red-500 bg-red-50";
    default:
      return "border-l-gray-500 bg-gray-50";
  }
};

// Get status icon component based on order status
const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return <Clock className="h-5 w-5 text-yellow-500" />;
    case "processing":
      return <Package className="h-5 w-5 text-blue-500" />;
    case "shipped":
      return <Truck className="h-5 w-5 text-amber-500" />;
    case "delivered":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "cancelled":
      return <XCircle className="h-5 w-5 text-red-500" />;
    case "verified":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "rejected":
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    default:
      return <Package className="h-5 w-5 text-gray-500" />;
  }
};

// Status badge display component with more visual styles
const StatusBadge = ({
  status,
  type = "order",
}: {
  status: string;
  type?: "order" | "payment";
}) => {
  // Define styles based on status and type
  const getConfig = () => {
    switch (status) {
      case "pending":
        return {
          label: "Pending",
          className: "bg-yellow-500/10 text-yellow-700 border-yellow-300",
        };
      case "processing":
        return {
          label: "Processing",
          className: "bg-blue-500/10 text-blue-700 border-blue-300",
        };
      case "shipped":
        return {
          label: "Shipped",
          className: "bg-amber-500/10 text-amber-700 border-amber-300",
        };
      case "delivered":
        return {
          label: "Delivered",
          className: "bg-green-500/10 text-green-700 border-green-300",
        };
      case "cancelled":
        return {
          label: "Cancelled",
          className: "bg-red-500/10 text-red-700 border-red-300",
        };
      case "verified":
        return {
          label: "Verified",
          className: "bg-green-500/10 text-green-700 border-green-300",
        };
      case "rejected":
        return {
          label: "Rejected",
          className: "bg-red-500/10 text-red-700 border-red-300",
        };
      case "completed":
        return {
          label: "Completed",
          className: "bg-green-500/10 text-green-700 border-green-300",
        };
      case "failed":
        return {
          label: "Failed",
          className: "bg-red-500/10 text-red-700 border-red-300",
        };
      default:
        return {
          label: status.charAt(0).toUpperCase() + status.slice(1),
          className: "bg-gray-500/10 text-gray-700 border-gray-300",
        };
    }
  };

  const config = getConfig();
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
};

// Helper function to get step number for order status tracker
const getOrderStatusStep = (status: string) => {
  switch (status) {
    case "pending":
      return 0;
    case "processing":
      return 1;
    case "shipped":
      return 2;
    case "delivered":
      return 3;
    case "cancelled":
      return -1;
    default:
      return 0;
  }
};

export function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  const { toast } = useToast();

  // Helper to toggle expanded state
  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  // Check if an order is expanded
  const isOrderExpanded = (orderId: string) => {
    return expandedOrders.includes(orderId);
  };

  // Fetch full order details from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("authToken");
        if (!token) {
          setOrders([]);
          setIsLoading(false);
          return;
        }

        const response = await fetch("/api/user/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setOrders(data.orders || []);
        } else {
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

  // Add this helper function to get the most recent status update for a specific status type
  const getMostRecentStatus = (statusHistory: any[] = [], type: string) => {
    if (!statusHistory || !Array.isArray(statusHistory)) {
      return null;
    }

    // Filter by status type (payment or order related status)
    const relevantStatuses = statusHistory.filter((entry) => {
      if (type === "payment") {
        return ["pending", "verified", "rejected"].includes(entry.status);
      } else {
        return [
          "pending",
          "processing",
          "shipped",
          "delivered",
          "cancelled",
        ].includes(entry.status);
      }
    });

    // Sort by timestamp (newest first)
    relevantStatuses.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return relevantStatuses[0] || null;
  };

  // Filter orders by status and search query
  const filteredOrders = orders.filter((order) => {
    // Get the most current status from status history
    const currentOrderStatus =
      order.statusHistory?.length > 0
        ? getMostRecentStatus(order.statusHistory, "order")?.status ||
          order.status
        : order.status;

    // First filter by status tab
    if (activeTab !== "all" && currentOrderStatus !== activeTab) {
      return false;
    }

    // Then filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        order.orderNumber.toLowerCase().includes(query) ||
        order.items.some((item) => item.name.toLowerCase().includes(query))
      );
    }

    return true;
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-2xl font-semibold leading-none tracking-tight">
            Order History
          </h3>
          <p className="text-sm text-muted-foreground">
            Loading your orders...
          </p>
        </div>
        <div className="p-6 pt-0 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-6 animate-pulse">
              <div className="h-6 w-32 bg-muted rounded mb-4"></div>
              <div className="flex justify-between mb-3">
                <div className="h-4 w-48 bg-muted rounded"></div>
                <div className="h-4 w-24 bg-muted rounded"></div>
              </div>
              <div className="h-14 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (orders.length === 0 && !isLoading) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-2xl font-semibold leading-none tracking-tight">
            Order History
          </h3>
          <p className="text-sm text-muted-foreground">
            View and track your orders
          </p>
        </div>
        <div className="p-6 pt-0 flex flex-col items-center py-20 text-center">
          <div className="bg-muted rounded-full p-6 mb-6">
            <Package className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-medium mb-3">No orders yet</h3>
          <p className="text-muted-foreground mb-8 max-w-md">
            Looks like you haven't placed any orders yet. Start shopping to see
            your orders appear here.
          </p>
          <Button className="px-8" size="lg" asChild>
            <a href="/products">Start Shopping</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6 space-y-5">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">
          Order History
        </h3>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid grid-cols-3 sm:grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="processing">Processing</TabsTrigger>
              <TabsTrigger value="shipped">Shipped</TabsTrigger>
              <TabsTrigger value="delivered">Delivered</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="p-6 pt-0">
        <div className="space-y-5">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">
                No orders found matching your criteria
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              // Get the most current order status from status history
              const currentOrderStatus =
                order.statusHistory?.length > 0
                  ? getMostRecentStatus(order.statusHistory, "order")?.status ||
                    order.status
                  : order.status;

              return (
                <Collapsible
                  key={order.id}
                  className={`border-l-4 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all ${getStatusColor(
                    currentOrderStatus as OrderStatus
                  )}`}
                  open={isOrderExpanded(order.id)}
                  onOpenChange={() => toggleOrderExpand(order.id)}
                >
                  {/* Order Header - Always visible */}
                  <div className="p-5 cursor-pointer">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-white shadow-sm">
                          {getStatusIcon(currentOrderStatus)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            Order #{order.orderNumber}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>
                              {new Date(order.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                        <div className="flex flex-col items-end">
                          <p className="font-semibold text-lg">
                            {formatPrice(order.total)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.items.length}{" "}
                            {order.items.length === 1 ? "item" : "items"}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <StatusBadge status={currentOrderStatus} />
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 p-0 h-auto"
                            >
                              <span className="text-xs">
                                {isOrderExpanded(order.id)
                                  ? "Hide details"
                                  : "View details"}
                              </span>
                              {isOrderExpanded(order.id) ? (
                                <ChevronUp className="h-3 w-3" />
                              ) : (
                                <ChevronDown className="h-3 w-3" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                      </div>
                    </div>

                    {/* Product thumbnails - preview of items */}
                    <div className="flex items-center gap-3 overflow-auto pb-2 pt-3 mt-2">
                      {order.items.slice(0, 4).map((item, idx) => (
                        <div
                          key={idx}
                          className="rounded bg-white shadow-sm p-1 flex-shrink-0 w-16 h-16"
                        >
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted rounded">
                              <Package className="h-6 w-6 text-muted-foreground/40" />
                            </div>
                          )}
                        </div>
                      ))}
                      {order.items.length > 4 && (
                        <div className="w-16 h-16 rounded bg-white shadow-sm flex items-center justify-center">
                          <span className="text-sm font-medium text-muted-foreground">
                            +{order.items.length - 4} more
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Details - Shown when expanded */}
                  <CollapsibleContent>
                    <div className="border-t border-border/60 px-5 py-4">
                      {/* Alert messages for special statuses */}
                      {order.status === "cancelled" && (
                        <Alert variant="destructive" className="mb-4">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>Order Cancelled</AlertTitle>
                          <AlertDescription>
                            {order.statusHistory?.find(
                              (entry) => entry.status === "cancelled"
                            )?.note ||
                              "This order has been cancelled. If you have any questions, please contact our support team."}
                          </AlertDescription>
                        </Alert>
                      )}

                      {order.paymentStatus === "rejected" && (
                        <Alert variant="destructive" className="mb-4">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>Payment Rejected</AlertTitle>
                          <AlertDescription>
                            {order.statusHistory?.find(
                              (entry) => entry.status === "rejected"
                            )?.note ||
                              "Your payment was rejected. Please contact our customer support team for assistance."}
                          </AlertDescription>
                        </Alert>
                      )}

                      {order.paymentStatus === "pending" && (
                        <Alert className="bg-yellow-50 text-yellow-800 border-yellow-300 mb-4">
                          <Clock className="h-4 w-4" />
                          <AlertTitle>
                            Payment Verification In Progress
                          </AlertTitle>
                          <AlertDescription>
                            Your payment is being verified. This typically takes
                            1-2 hours during business hours.
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Progress tracker */}
                      {order.status !== "cancelled" && (
                        <div className="mb-6 relative">
                          <h4 className="text-sm font-medium mb-4">
                            Order Status
                          </h4>

                          {/* Progress bar */}
                          <div className="relative">
                            <div className="absolute h-1 bg-muted inset-x-0 top-[14px]"></div>
                            <div
                              className="absolute h-1 bg-primary inset-y-0 left-0 top-[14px] transition-all duration-500"
                              style={{
                                width: `${
                                  getOrderStatusStep(currentOrderStatus) * 33.3
                                }%`,
                              }}
                            ></div>

                            <div className="relative flex justify-between">
                              {/* Step 1: Pending */}
                              <div className="flex flex-col items-center">
                                <div
                                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center z-10 
                                  ${
                                    getOrderStatusStep(currentOrderStatus) >= 0
                                      ? "border-primary bg-primary text-primary-foreground"
                                      : "border-muted-foreground bg-background"
                                  }`}
                                >
                                  <Clock className="h-3.5 w-3.5" />
                                </div>
                                <span className="text-xs mt-1 text-center w-16">
                                  Pending
                                </span>
                              </div>

                              {/* Step 2: Processing */}
                              <div className="flex flex-col items-center">
                                <div
                                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center z-10 
                                  ${
                                    getOrderStatusStep(currentOrderStatus) >= 1
                                      ? "border-primary bg-primary text-primary-foreground"
                                      : "border-muted-foreground bg-background"
                                  }`}
                                >
                                  <Package className="h-3.5 w-3.5" />
                                </div>
                                <span className="text-xs mt-1 text-center w-16">
                                  Processing
                                </span>
                              </div>

                              {/* Step 3: Shipped */}
                              <div className="flex flex-col items-center">
                                <div
                                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center z-10 
                                  ${
                                    getOrderStatusStep(currentOrderStatus) >= 2
                                      ? "border-primary bg-primary text-primary-foreground"
                                      : "border-muted-foreground bg-background"
                                  }`}
                                >
                                  <Truck className="h-3.5 w-3.5" />
                                </div>
                                <span className="text-xs mt-1 text-center w-16">
                                  Shipped
                                </span>
                              </div>

                              {/* Step 4: Delivered */}
                              <div className="flex flex-col items-center">
                                <div
                                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center z-10 
                                  ${
                                    getOrderStatusStep(currentOrderStatus) >= 3
                                      ? "border-primary bg-primary text-primary-foreground"
                                      : "border-muted-foreground bg-background"
                                  }`}
                                >
                                  <CheckCircle className="h-3.5 w-3.5" />
                                </div>
                                <span className="text-xs mt-1 text-center w-16">
                                  Delivered
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Tracking info if available */}
                          {order.trackingNumber && (
                            <div className="mt-4 p-3 bg-muted/30 rounded-md">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Tracking Number
                                  </p>
                                  <code className="text-sm font-mono bg-muted/50 px-1 py-0.5 rounded">
                                    {order.trackingNumber}
                                  </code>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs h-8 flex items-center gap-1"
                                >
                                  <Truck className="h-3 w-3" />
                                  Track Package
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Order details in tabs */}
                      <Tabs defaultValue="items">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="items">Items</TabsTrigger>
                          <TabsTrigger value="shipping">Shipping</TabsTrigger>
                          <TabsTrigger value="payment">Payment</TabsTrigger>
                        </TabsList>

                        {/* Items tab */}
                        <TabsContent value="items" className="pt-4 space-y-4">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <div className="w-16 h-16 rounded bg-muted flex-shrink-0">
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover rounded"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="h-6 w-6 text-muted-foreground/40" />
                                  </div>
                                )}
                              </div>

                              <div className="flex-grow min-w-0">
                                <h5 className="font-medium text-sm truncate">
                                  {item.name}
                                </h5>
                                <p className="text-xs text-muted-foreground">
                                  Quantity: {item.quantity}
                                </p>
                              </div>

                              <div className="text-right">
                                <p className="font-medium">
                                  {formatPrice(item.price)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Total:{" "}
                                  {formatPrice(item.price * item.quantity)}
                                </p>
                              </div>
                            </div>
                          ))}

                          {/* Order summary */}
                          <div className="bg-muted/40 rounded-md p-3 mt-4 text-sm">
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>
                                  {formatPrice(
                                    order.total -
                                      (order.taxAmount || 0) -
                                      (order.shippingCost || 0)
                                  )}
                                </span>
                              </div>

                              {typeof order.discount === "number" &&
                                order.discount > 0 && (
                                  <div className="flex justify-between text-green-600">
                                    <span>
                                      Discount{" "}
                                      {order.promoCode &&
                                        `(${order.promoCode})`}
                                    </span>
                                    <span>-{formatPrice(order.discount)}</span>
                                  </div>
                                )}

                              <div className="flex justify-between">
                                <span>Shipping</span>
                                <span>
                                  {formatPrice(order.shippingCost || 0)}
                                </span>
                              </div>

                              <div className="flex justify-between">
                                <span>Tax</span>
                                <span>{formatPrice(order.taxAmount || 0)}</span>
                              </div>

                              <Separator className="my-2" />

                              <div className="flex justify-between font-bold">
                                <span>Total</span>
                                <span>{formatPrice(order.total)}</span>
                              </div>
                            </div>
                          </div>
                        </TabsContent>

                        {/* Shipping tab */}
                        <TabsContent value="shipping" className="pt-4">
                          {order.shippingAddress && (
                            <div className="space-y-4">
                              <div>
                                <h5 className="text-sm font-medium">
                                  Delivery Address
                                </h5>
                                <div className="bg-muted/30 p-3 rounded-md mt-2 text-sm">
                                  <p className="font-medium">
                                    {order.shippingAddress.street}
                                  </p>
                                  {order.shippingAddress.wardNo && (
                                    <p>Ward {order.shippingAddress.wardNo}</p>
                                  )}
                                  <p>
                                    {order.shippingAddress.city},{" "}
                                    {order.shippingAddress.state}{" "}
                                    {order.shippingAddress.postalCode}
                                  </p>
                                  <p>{order.shippingAddress.country}</p>
                                  {order.shippingAddress.landmark && (
                                    <p className="mt-1 text-muted-foreground">
                                      Landmark: {order.shippingAddress.landmark}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div>
                                <h5 className="text-sm font-medium">
                                  Shipping Details
                                </h5>
                                <div className="bg-muted/30 p-3 rounded-md mt-2 text-sm">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <p className="text-muted-foreground">
                                        Shipping Cost:
                                      </p>
                                      <p>
                                        {formatPrice(order.shippingCost || 0)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">
                                        Method:
                                      </p>
                                      <p>Standard Delivery</p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Tracking info if available */}
                              {order.trackingNumber && (
                                <div>
                                  <h5 className="text-sm font-medium">
                                    Tracking Information
                                  </h5>
                                  <div className="bg-muted/30 p-3 rounded-md mt-2">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                      <div>
                                        <p className="text-xs text-muted-foreground">
                                          Tracking Number
                                        </p>
                                        <code className="text-sm font-mono bg-muted/50 px-1 py-0.5 rounded">
                                          {order.trackingNumber}
                                        </code>
                                      </div>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-xs h-8 flex items-center gap-1"
                                      >
                                        <Truck className="h-3 w-3" />
                                        Track Package
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Timeline of status changes */}
                              {order.statusHistory &&
                                order.statusHistory.length > 0 && (
                                  <div>
                                    <h5 className="text-sm font-medium mb-3">
                                      Order Timeline
                                    </h5>
                                    <div className="space-y-3">
                                      {/* Sort status history by timestamp (newest first) */}
                                      {[...order.statusHistory]
                                        .sort(
                                          (a, b) =>
                                            new Date(b.timestamp).getTime() -
                                            new Date(a.timestamp).getTime()
                                        )
                                        .map((entry, idx) => (
                                          <div
                                            key={idx}
                                            className="flex items-start gap-3"
                                          >
                                            <div
                                              className={`h-7 w-7 rounded-full flex items-center justify-center 
                                          ${
                                            entry.status === "rejected"
                                              ? "bg-red-100"
                                              : entry.status === "verified" ||
                                                entry.status === "delivered"
                                              ? "bg-green-100"
                                              : entry.status === "shipped"
                                              ? "bg-amber-100"
                                              : entry.status === "processing"
                                              ? "bg-blue-100"
                                              : "bg-gray-100"
                                          }`}
                                            >
                                              {getStatusIcon(entry.status)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <div className="flex justify-between">
                                                <p className="text-sm font-medium">
                                                  {entry.status
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    entry.status.slice(1)}
                                                </p>
                                                <time className="text-xs text-muted-foreground">
                                                  {formatDate(entry.timestamp)}
                                                </time>
                                              </div>
                                              {entry.note && (
                                                <p
                                                  className={`text-xs mt-0.5 ${
                                                    entry.status === "rejected"
                                                      ? "text-red-600 font-medium"
                                                      : "text-muted-foreground"
                                                  }`}
                                                >
                                                  {entry.note}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                )}
                            </div>
                          )}
                        </TabsContent>

                        {/* Payment tab */}
                        <TabsContent value="payment" className="pt-4">
                          <div className="space-y-4">
                            <div className="bg-muted/30 p-3 rounded-md">
                              <div className="flex justify-between items-center mb-2">
                                <h5 className="text-sm font-medium">
                                  Payment Status
                                </h5>
                                <StatusBadge
                                  status={order.paymentStatus}
                                  type="payment"
                                />
                              </div>

                              {/* Show most up-to-date payment information */}
                              <div className="grid grid-cols-2 gap-3 text-sm mt-3">
                                {/* ...rest of the payment information... */}
                              </div>
                            </div>

                            {order.transactionRef && (
                              <div>
                                <h5 className="text-sm font-medium">
                                  Transaction Details
                                </h5>
                                <div className="bg-muted/30 p-3 rounded-md mt-2">
                                  <p className="text-xs text-muted-foreground">
                                    Reference ID
                                  </p>
                                  <p className="text-sm mt-1 font-mono bg-muted/50 px-2 py-1 rounded">
                                    {order.transactionRef}
                                  </p>
                                </div>
                              </div>
                            )}

                            {order.paymentStatus === "rejected" &&
                              order.statusHistory?.find(
                                (entry) => entry.status === "rejected"
                              )?.note && (
                                <div className="bg-red-50 p-3 rounded-md">
                                  <h5 className="text-sm font-medium text-red-700">
                                    Rejection Reason
                                  </h5>
                                  <p className="text-sm text-red-600 mt-1">
                                    {
                                      order.statusHistory.find(
                                        (entry) => entry.status === "rejected"
                                      )?.note
                                    }
                                  </p>
                                </div>
                              )}

                            {/* Payment breakdown */}
                            <div>
                              <h5 className="text-sm font-medium">
                                Payment Summary
                              </h5>
                              <div className="bg-muted/30 p-3 rounded-md mt-2">
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>
                                      {formatPrice(
                                        order.total -
                                          (order.taxAmount || 0) -
                                          (order.shippingCost || 0)
                                      )}
                                    </span>
                                  </div>
                                  {typeof order.discount === "number" &&
                                    order.discount > 0 && (
                                      <div className="flex justify-between text-green-600">
                                        <span>
                                          Discount{" "}
                                          {order.promoCode &&
                                            `(${order.promoCode})`}
                                        </span>
                                        <span>
                                          -{formatPrice(order.discount)}
                                        </span>
                                      </div>
                                    )}
                                  <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span>
                                      {formatPrice(order.shippingCost || 0)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Tax</span>
                                    <span>
                                      {formatPrice(order.taxAmount || 0)}
                                    </span>
                                  </div>
                                  <Separator className="my-2" />
                                  <div className="flex justify-between font-bold">
                                    <span>Total</span>
                                    <span>{formatPrice(order.total)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>

                      {/* Support button */}
                      <div className="mt-4 pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto"
                          asChild
                        >
                          <a href="/contact">Need help with this order?</a>
                        </Button>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
