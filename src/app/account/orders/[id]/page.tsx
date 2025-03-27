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
} from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import Image from "next/image";

interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
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
  paymentProofImage: string;
  paymentStatus: string;
  orderStatus: string;
  shippingCost: number;
  taxAmount: number;
  discount?: number;
  promoCode?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: Array<{
    status: string;
    timestamp: string;
    note?: string;
  }>;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewPaymentProof, setViewPaymentProof] = useState(false);
  const orderId = params.id as string;

  const [orderStatusNotifications, setOrderStatusNotifications] = useState<{
    [key: string]: boolean;
  }>({});

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

  useEffect(() => {
    // Check for status changes since last visit
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-500/10 text-yellow-700 border-yellow-300"
          >
            Pending
          </Badge>
        );
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
      case "verified":
        return (
          <Badge
            variant="outline"
            className="bg-green-500/10 text-green-700 border-green-300"
          >
            Verified
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="bg-red-500/10 text-red-700 border-red-300"
          >
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

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

  if (isLoading) {
    return (
      <div className="container py-12 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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

  const currentStep = getOrderStatusStep(order.orderStatus);

  // Helper function to show a notification badge if status changed
  const StatusChangeIndicator = ({ type }: { type: "payment" | "order" }) => {
    if (orderStatusNotifications[type]) {
      return (
        <span className="inline-block animate-pulse ml-2 h-2 w-2 rounded-full bg-primary"></span>
      );
    }
    return null;
  };

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

      {/* Order Status Tracker */}
      {currentStep >= 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              Order Status <StatusChangeIndicator type="order" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Progress bar */}
              <div className="absolute top-4 left-0 right-0 h-1 bg-muted">
                <div
                  className="h-1 bg-primary"
                  style={{
                    width: `${currentStep === 0 ? 5 : currentStep * 33}%`,
                    transition: "width 0.5s ease-in-out",
                  }}
                />
              </div>

              {/* Steps */}
              <div className="flex justify-between">
                <div className="flex flex-col items-center">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      currentStep >= 0
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Package className="h-4 w-4" />
                  </div>
                  <span className="text-sm mt-2">Order Placed</span>
                </div>

                <div className="flex flex-col items-center">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      currentStep >= 1
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Package className="h-4 w-4" />
                  </div>
                  <span className="text-sm mt-2">Processing</span>
                </div>

                <div className="flex flex-col items-center">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      currentStep >= 2
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Truck className="h-4 w-4" />
                  </div>
                  <span className="text-sm mt-2">Shipped</span>
                </div>

                <div className="flex flex-col items-center">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      currentStep >= 3
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <span className="text-sm mt-2">Delivered</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              {order.trackingNumber && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-md border p-4 mt-4">
                  <div>
                    <p className="font-medium">Tracking Number</p>
                    <p className="text-muted-foreground">
                      {order.trackingNumber}
                    </p>
                  </div>
                  <Button variant="outline" className="mt-2 sm:mt-0">
                    Track Package
                  </Button>
                </div>
              )}

              {/* Payment status info */}
              <div className="flex flex-col sm:flex-row sm:items-center rounded-md border p-4 mt-4">
                <div className="flex-1">
                  <p className="font-medium flex items-center">
                    Payment Status <StatusChangeIndicator type="payment" />
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(order.paymentStatus)}
                    <span className="text-sm text-muted-foreground">
                      {order.paymentStatus === "pending" &&
                        "Your payment is being verified"}
                      {order.paymentStatus === "verified" &&
                        "Your payment has been verified"}
                      {order.paymentStatus === "rejected" &&
                        "Your payment was rejected"}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 sm:mt-0"
                  onClick={() => setViewPaymentProof(true)}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Payment Proof
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details */}
        <div className="lg:col-span-2">
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
                              <Image
                                src={item.image}
                                alt={item.name}
                                width={48}
                                height={48}
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
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        {entry.status === "pending" && (
                          <AlertTriangle className="h-5 w-5 text-yellow-500" />
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
                          <p className="text-sm text-muted-foreground mt-1">
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

        {/* Order Info Sidebar */}
        <div className="lg:col-span-1">
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

      {/* Payment Proof Dialog */}
      <Dialog open={viewPaymentProof} onOpenChange={setViewPaymentProof}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Proof</DialogTitle>
          </DialogHeader>
          <div className="relative h-[500px] w-full bg-muted rounded-md overflow-hidden">
            <Image
              src={order.paymentProofImage}
              alt="Payment proof"
              fill
              className="object-contain"
            />
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            <p>
              <span className="font-medium">Transaction Reference:</span>{" "}
              {order.transactionRef}
            </p>
            <p>
              <span className="font-medium">Payment Method:</span>{" "}
              {order.paymentMethod === "mobile_banking"
                ? "Mobile Banking"
                : order.paymentMethod === "esewa"
                ? "eSewa"
                : "Khalti"}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
