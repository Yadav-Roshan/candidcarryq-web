"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ExternalLink,
  XCircle,
  Clock,
} from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { OrderStatusBadge } from "@/components/order-status-badge";

// Define interfaces for TypeScript
interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface StatusHistoryEntry {
  status: string;
  timestamp: string;
  note?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    wardNo?: string;
    landmark?: string;
  };
  paymentMethod: string;
  transactionRef: string;
  paymentProofImage: string; // We won't display this for privacy
  paymentStatus: string;
  orderStatus: string;
  shippingCost: number;
  taxAmount: number;
  discount?: number;
  promoCode?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: StatusHistoryEntry[];
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewPaymentDetails, setViewPaymentDetails] = useState(false);
  const orderId = params.id as string;

  // State to track status notification indicators
  const [orderStatusNotifications, setOrderStatusNotifications] = useState<{
    [key: string]: boolean;
  }>({});

  // Fetch order data
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("authToken");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(`/api/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch order");
        }

        const data = await response.json();
        setOrder(data.order);
      } catch (error) {
        console.error("Error loading order:", error);
        toast({
          title: "Error",
          description: "Failed to load order details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router, toast]);

  // Check for status changes since last visit
  useEffect(() => {
    const checkStatusChanges = () => {
      const viewedStatuses = localStorage.getItem(`order-status-${orderId}`);
      if (viewedStatuses && order) {
        try {
          const parsedStatuses = JSON.parse(viewedStatuses);
          // Check if payment status or order status has changed
          const notifications = {
            payment: parsedStatuses.payment !== order.paymentStatus,
            order: parsedStatuses.order !== order.orderStatus,
          };
          setOrderStatusNotifications(notifications);

          // Update with current statuses
          localStorage.setItem(
            `order-status-${orderId}`,
            JSON.stringify({
              payment: order.paymentStatus,
              order: order.orderStatus,
            })
          );
        } catch (e) {
          console.error("Error parsing stored status", e);
        }
      } else if (order) {
        // First time viewing - set current status
        localStorage.setItem(
          `order-status-${orderId}`,
          JSON.stringify({
            payment: order.paymentStatus,
            order: order.orderStatus,
          })
        );
      }
    };

    if (order) {
      checkStatusChanges();
    }
  }, [order, orderId]);

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

  // Helper function to show a notification badge if status changed
  const StatusChangeIndicator = ({ type }: { type: "payment" | "order" }) => {
    if (orderStatusNotifications[type]) {
      return (
        <span className="inline-block animate-pulse ml-2 h-2 w-2 rounded-full bg-primary"></span>
      );
    }
    return null;
  };

  // Helper function to get the most recent status
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

  // Get the most current status from status history if available
  const currentOrderStatus =
    order?.statusHistory?.length > 0
      ? getMostRecentStatus(order.statusHistory, "order")?.status ||
        order.orderStatus
      : order?.orderStatus;

  // Use the current status for display
  const currentStep = order ? getOrderStatusStep(currentOrderStatus || "") : 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="container py-12 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Order not found state
  if (!order) {
    return (
      <div className="container py-12">
        <div className="flex items-center mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Order not found</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-xl font-medium mb-2">Order not found</p>
              <p className="text-muted-foreground">
                The order you're looking for doesn't exist or you don't have
                permission to view it.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mr-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
          <p className="text-muted-foreground">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
      </div>

      {/* Status Alert Messages */}
      {order.orderStatus === "cancelled" && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Order Cancelled</AlertTitle>
          <AlertDescription>
            This order has been cancelled. If you have any questions, please
            contact our support team.
          </AlertDescription>
        </Alert>
      )}

      {order.paymentStatus === "rejected" && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Payment Rejected</AlertTitle>
          <AlertDescription>
            {order.statusHistory.find((entry) => entry.status === "rejected")
              ?.note ||
              "Your payment was rejected. Please contact our customer support team for assistance."}
          </AlertDescription>
        </Alert>
      )}

      {order.paymentStatus === "pending" && (
        <Alert
          variant="warning"
          className="bg-yellow-50 text-yellow-800 border-yellow-300 mb-6"
        >
          <Clock className="h-4 w-4" />
          <AlertTitle>Payment Verification In Progress</AlertTitle>
          <AlertDescription>
            Your payment is being verified. This typically takes 1-2 hours
            during business hours.
          </AlertDescription>
        </Alert>
      )}

      {order.paymentStatus === "verified" &&
        order.orderStatus === "pending" && (
          <Alert className="bg-green-50 text-green-800 border-green-300 mb-6">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Payment Verified</AlertTitle>
            <AlertDescription>
              Your payment has been verified. Your order will be processed soon.
            </AlertDescription>
          </Alert>
        )}

      {/* Order Status Tracker - Only show for non-cancelled orders */}
      {currentStep >= 0 && (
        <Card className="mb-6 overflow-hidden">
          <CardHeader className="bg-muted/30 border-b pb-2">
            <CardTitle className="flex items-center">
              Order Status <StatusChangeIndicator type="order" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Visual Status Tracker */}
            <div className="relative pt-6 px-6">
              {/* Progress bar */}
              <div className="absolute top-[4.5rem] left-[2.5rem] right-10 h-2 bg-muted">
                <div
                  className="h-2 bg-primary rounded-full transition-all duration-1000"
                  style={{
                    width: `${currentStep === 0 ? 0 : currentStep * 33.3}%`,
                  }}
                />
              </div>

              {/* Steps with detailed information */}
              <div className="flex justify-between mb-16">
                {/* Step 1: Order Placed */}
                <div className="flex flex-col items-center relative">
                  <div className={`relative`}>
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center z-10 relative ${
                        currentStep >= 0
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Package className="h-6 w-6" />
                      {order.orderStatus === "pending" && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full animate-pulse"></span>
                      )}
                    </div>
                    {order.orderStatus === "pending" && (
                      <div className="absolute -inset-1 rounded-full bg-primary/30 blur-sm animate-pulse z-0"></div>
                    )}
                  </div>
                  <div className="mt-3 text-center">
                    <span
                      className={`font-medium ${
                        currentStep === 0 ? "text-primary" : ""
                      }`}
                    >
                      Order Placed
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                      })}
                    </p>
                    {order.orderStatus === "pending" && (
                      <div className="mt-2 px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full inline-flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Active
                      </div>
                    )}
                  </div>

                  <div className="absolute top-36 w-48 text-center">
                    <p className="text-xs text-muted-foreground">
                      {order.paymentStatus === "pending"
                        ? "Payment verification in progress"
                        : order.paymentStatus === "verified"
                        ? "Payment verified successfully"
                        : "Payment status updated"}
                    </p>
                  </div>
                </div>

                {/* Step 2: Processing */}
                <div className="flex flex-col items-center relative">
                  <div className={`relative`}>
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center z-10 relative ${
                        currentStep >= 1
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Package className="h-6 w-6" />
                      {order.orderStatus === "processing" && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-pulse"></span>
                      )}
                    </div>
                    {order.orderStatus === "processing" && (
                      <div className="absolute -inset-1 rounded-full bg-primary/30 blur-sm animate-pulse z-0"></div>
                    )}
                  </div>
                  <div className="mt-3 text-center">
                    <span
                      className={`font-medium ${
                        currentStep === 1 ? "text-primary" : ""
                      }`}
                    >
                      Processing
                    </span>
                    {currentStep >= 1 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {order.statusHistory.find(
                          (entry) => entry.status === "processing"
                        )?.timestamp
                          ? new Date(
                              order.statusHistory.find(
                                (entry) => entry.status === "processing"
                              )!.timestamp
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          : "In progress"}
                      </p>
                    )}
                    {order.orderStatus === "processing" && (
                      <div className="mt-2 px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full inline-flex items-center">
                        <Package className="h-3 w-3 mr-1" />
                        Active
                      </div>
                    )}
                  </div>

                  <div className="absolute top-36 w-48 text-center">
                    <p className="text-xs text-muted-foreground">
                      {currentStep < 1
                        ? "Waiting to be processed"
                        : currentStep === 1
                        ? "Your order is being prepared for shipment"
                        : "Order was processed and packed"}
                    </p>
                  </div>
                </div>

                {/* Step 3: Shipped */}
                <div className="flex flex-col items-center relative">
                  <div className={`relative`}>
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center z-10 relative ${
                        currentStep >= 2
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Truck className="h-6 w-6" />
                      {order.orderStatus === "shipped" && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full animate-pulse"></span>
                      )}
                    </div>
                    {order.orderStatus === "shipped" && (
                      <div className="absolute -inset-1 rounded-full bg-primary/30 blur-sm animate-pulse z-0"></div>
                    )}
                  </div>
                  <div className="mt-3 text-center">
                    <span
                      className={`font-medium ${
                        currentStep === 2 ? "text-primary" : ""
                      }`}
                    >
                      Shipped
                    </span>
                    {currentStep >= 2 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {order.statusHistory.find(
                          (entry) => entry.status === "shipped"
                        )?.timestamp
                          ? new Date(
                              order.statusHistory.find(
                                (entry) => entry.status === "shipped"
                              )!.timestamp
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          : "In progress"}
                      </p>
                    )}
                    {order.orderStatus === "shipped" && (
                      <div className="mt-2 px-3 py-1 text-xs bg-amber-100 text-amber-800 rounded-full inline-flex items-center">
                        <Truck className="h-3 w-3 mr-1" />
                        Active
                      </div>
                    )}
                  </div>

                  <div className="absolute top-36 w-48 text-center">
                    <p className="text-xs text-muted-foreground">
                      {currentStep < 2
                        ? "Waiting to be shipped"
                        : currentStep === 2
                        ? "Your package is on the way"
                        : "Package was delivered to courier"}
                    </p>
                  </div>
                </div>

                {/* Step 4: Delivered */}
                <div className="flex flex-col items-center relative">
                  <div className={`relative`}>
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center z-10 relative ${
                        currentStep >= 3
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <CheckCircle className="h-6 w-6" />
                      {order.orderStatus === "delivered" && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></span>
                      )}
                    </div>
                    {order.orderStatus === "delivered" && (
                      <div className="absolute -inset-1 rounded-full bg-green-400/30 blur-sm z-0"></div>
                    )}
                  </div>
                  <div className="mt-3 text-center">
                    <span
                      className={`font-medium ${
                        currentStep === 3 ? "text-primary" : ""
                      }`}
                    >
                      Delivered
                    </span>
                    {currentStep >= 3 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {order.statusHistory.find(
                          (entry) => entry.status === "delivered"
                        )?.timestamp
                          ? new Date(
                              order.statusHistory.find(
                                (entry) => entry.status === "delivered"
                              )!.timestamp
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          : "Complete"}
                      </p>
                    )}
                    {order.orderStatus === "delivered" && (
                      <div className="mt-2 px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full inline-flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Complete
                      </div>
                    )}
                  </div>

                  <div className="absolute top-36 w-48 text-center">
                    <p className="text-xs text-muted-foreground">
                      {currentStep < 3
                        ? "Not yet delivered"
                        : "Package successfully delivered"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tracking info */}
            {order.trackingNumber && (
              <div className="border-t p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-1">
                      Tracking Information
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="bg-muted px-3 py-1 rounded text-sm font-mono">
                        {order.trackingNumber}
                      </span>
                      <button
                        className="text-xs text-primary"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            order.trackingNumber || ""
                          );
                          toast({
                            title: "Copied to clipboard",
                            description: "Tracking number copied to clipboard",
                          });
                        }}
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  <Button variant="outline" className="sm:w-auto w-full">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Track Package
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add a specialized cancelled order notice */}
      {order.orderStatus === "cancelled" && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-lg font-medium text-red-800 mb-2">
                Order Cancelled
              </h3>
              <p className="text-red-600 mb-4 max-w-md">
                This order has been cancelled and will not be processed.
                {order.statusHistory.find(
                  (entry) => entry.status === "cancelled"
                )?.note && (
                  <>
                    {" "}
                    Reason:{" "}
                    {
                      order.statusHistory.find(
                        (entry) => entry.status === "cancelled"
                      )?.note
                    }
                  </>
                )}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details and Timeline - Left side */}
        <div className="lg:col-span-2">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-md border overflow-hidden bg-muted">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-muted">
                                <Package className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <span className="font-medium">{item.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatPrice(item.price)}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        {formatPrice(item.price * item.quantity)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-6 bg-muted/40 rounded-md p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>
                      {formatPrice(
                        order.totalAmount - order.taxAmount - order.shippingCost
                      )}
                    </span>
                  </div>
                  {order.discount && order.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>
                        Discount {order.promoCode && `(${order.promoCode})`}
                      </span>
                      <span>-{formatPrice(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{formatPrice(order.shippingCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>{formatPrice(order.taxAmount)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.statusHistory && order.statusHistory.length > 0 ? (
                  order.statusHistory.map((entry, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center
                        ${
                          entry.status === "rejected"
                            ? "bg-red-100"
                            : entry.status === "verified"
                            ? "bg-green-100"
                            : entry.status === "delivered"
                            ? "bg-green-100"
                            : entry.status === "shipped"
                            ? "bg-amber-100"
                            : entry.status === "processing"
                            ? "bg-blue-100"
                            : "bg-muted"
                        }`}
                      >
                        {entry.status === "pending" && (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        )}
                        {entry.status === "processing" && (
                          <Package className="h-5 w-5 text-blue-500" />
                        )}
                        {entry.status === "shipped" && (
                          <Truck className="h-5 w-5 text-amber-500" />
                        )}
                        {entry.status === "delivered" && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        {entry.status === "verified" && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        {entry.status === "rejected" && (
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        )}
                        {entry.status === "cancelled" && (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="font-medium">
                            {entry.status.charAt(0).toUpperCase() +
                              entry.status.slice(1)}
                          </p>
                          <time className="text-muted-foreground text-sm">
                            {formatDate(entry.timestamp)}
                          </time>
                        </div>
                        {entry.note && (
                          <p
                            className={`text-sm mt-1 ${
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
                  ))
                ) : (
                  <p className="text-muted-foreground">No history available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Info Sidebar - Right side */}
        <div className="lg:col-span-1">
          {/* Payment and Order Status Cards - New format */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 mb-4">
            {/* Payment Status Card */}
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">
                    Payment Status
                  </h3>
                  <div className="flex items-center mt-1">
                    {order.paymentStatus === "pending" && (
                      <Clock className="h-4 w-4 text-yellow-500 mr-2" />
                    )}
                    {order.paymentStatus === "verified" && (
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    )}
                    {order.paymentStatus === "rejected" && (
                      <XCircle className="h-4 w-4 text-red-500 mr-2" />
                    )}
                    <span className="font-medium capitalize">
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
                <OrderStatusBadge status={order.paymentStatus} type="payment" />
              </div>
              <p className="text-sm text-muted-foreground">
                {order.paymentStatus === "pending" &&
                  "Your payment is being verified"}
                {order.paymentStatus === "verified" &&
                  "Your payment has been verified"}
                {order.paymentStatus === "rejected" &&
                  "Your payment was rejected"}
              </p>
            </div>

            {/* Order Status Card */}
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">
                    Order Status
                  </h3>
                  <div className="flex items-center mt-1">
                    {currentOrderStatus === "pending" && (
                      <Clock className="h-4 w-4 text-yellow-500 mr-2" />
                    )}
                    {currentOrderStatus === "processing" && (
                      <Package className="h-4 w-4 text-blue-500 mr-2" />
                    )}
                    {currentOrderStatus === "shipped" && (
                      <Truck className="h-4 w-4 text-amber-500 mr-2" />
                    )}
                    {currentOrderStatus === "delivered" && (
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    )}
                    {currentOrderStatus === "cancelled" && (
                      <XCircle className="h-4 w-4 text-red-500 mr-2" />
                    )}
                    <span className="font-medium capitalize">
                      {currentOrderStatus}
                    </span>
                  </div>
                </div>
                <OrderStatusBadge status={currentOrderStatus || ""} />
              </div>
              <p className="text-sm text-muted-foreground">
                {currentOrderStatus === "pending" &&
                  "Your order is waiting to be processed"}
                {currentOrderStatus === "processing" &&
                  "Your order is being prepared"}
                {currentOrderStatus === "shipped" && "Your order is on its way"}
                {currentOrderStatus === "delivered" &&
                  "Your order has been delivered"}
                {currentOrderStatus === "cancelled" &&
                  "Your order has been cancelled"}
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Method */}
              <div>
                <h3 className="text-sm font-medium mb-2">Payment Method</h3>
                <div className="text-sm">
                  <p>
                    {order.paymentMethod === "mobile_banking"
                      ? "Mobile Banking"
                      : order.paymentMethod === "esewa"
                      ? "eSewa"
                      : "Khalti"}
                  </p>
                  <p className="mt-1">
                    <span className="text-muted-foreground">Reference: </span>
                    {order.transactionRef}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setViewPaymentDetails(true)}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Payment Details
                  </Button>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="text-sm font-medium mb-2">Shipping Address</h3>
                <div className="text-sm">
                  <p>{order.shippingAddress.street}</p>
                  {order.shippingAddress.wardNo && (
                    <p>Ward {order.shippingAddress.wardNo}</p>
                  )}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    {order.shippingAddress.postalCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                  {order.shippingAddress.landmark && (
                    <p className="mt-1">
                      Landmark: {order.shippingAddress.landmark}
                    </p>
                  )}
                </div>
              </div>

              {/* Need Help */}
              <div className="bg-muted/50 p-4 rounded-md">
                <h3 className="text-sm font-medium mb-2">Need Help?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  If you have any questions about your order, please contact our
                  customer support.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Details Dialog - IMPORTANT: No screenshot shown for privacy */}
      <Dialog open={viewPaymentDetails} onOpenChange={setViewPaymentDetails}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-1">
                Transaction Reference
              </h3>
              <p>{order.transactionRef}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-1">Payment Method</h3>
              <p>
                {order.paymentMethod === "mobile_banking"
                  ? "Mobile Banking"
                  : order.paymentMethod === "esewa"
                  ? "eSewa"
                  : "Khalti"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-1">Payment Status</h3>
              <div className="flex items-center">
                <OrderStatusBadge status={order.paymentStatus} type="payment" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-1">Date Submitted</h3>
              <p>{formatDate(order.createdAt)}</p>
            </div>
            {/* Explicitly NOT showing payment proof image for privacy */}
            {order.paymentStatus === "rejected" && (
              <div>
                <h3 className="text-sm font-medium mb-1 text-red-600">
                  Rejection Reason
                </h3>
                <p className="text-red-600">
                  {order.statusHistory.find(
                    (entry) => entry.status === "rejected"
                  )?.note ||
                    "No specific reason provided. Please contact customer support."}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
