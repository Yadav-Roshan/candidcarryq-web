"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  XCircle,
  ArrowLeft,
  Truck,
  Package,
  AlertTriangle,
  Loader2,
  ExternalLink,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice, formatDate } from "@/lib/utils";
import Image from "next/image";

interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface OrderAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  wardNo?: string;
  landmark?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: OrderAddress;
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
  notes?: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: Array<{
    status: string;
    timestamp: string;
    note?: string;
  }>;
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [viewPaymentProof, setViewPaymentProof] = useState(false);
  const orderId = params.id as string;
  const [note, setNote] = useState("");
  const [stockAdjustmentWarning, setStockAdjustmentWarning] = useState(false);
  const [stockData, setStockData] = useState<Record<string, number>>({});

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
        if (data.order.trackingNumber) {
          setTrackingNumber(data.order.trackingNumber);
        }

        // Check stock levels for items if payment is pending
        if (data.order.paymentStatus === "pending") {
          await checkStockLevels(data.order.items);
        }
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

  // Function to check product stock levels
  const checkStockLevels = async (items: OrderItem[]) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const productIds = items.map((item) => item.product);

      if (productIds.length === 0) return;

      const queryString = productIds.map((id) => `id=${id}`).join("&");
      const response = await fetch(`/api/admin/products/stock?${queryString}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) return;

      const data = await response.json();
      const stockInfo = data.products.reduce(
        (acc: Record<string, number>, product: any) => {
          acc[product._id] = product.stock;
          return acc;
        },
        {}
      );

      setStockData(stockInfo);

      // Check if any product will be out of stock after verification
      const willBeOutOfStock = items.some((item) => {
        const currentStock = stockInfo[item.product] || 0;
        return currentStock < item.quantity;
      });

      setStockAdjustmentWarning(willBeOutOfStock);
    } catch (error) {
      console.error("Error checking stock levels:", error);
    }
  };

  const updateOrderStatus = async (status: string, note: string = "") => {
    try {
      setIsUpdating(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        router.push("/login");
        return;
      }

      let updateData: any = {};

      if (status === "verified" || status === "rejected") {
        updateData.paymentStatus = status;
      } else {
        updateData.orderStatus = status;
      }

      // Add tracking number if shipping the order
      if (status === "shipped" && trackingNumber) {
        updateData.trackingNumber = trackingNumber;
      }

      // Add note if provided
      if (note) {
        updateData.notes = note;
      }

      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      const data = await response.json();
      setOrder(data.order);

      toast({
        title: "Status Updated",
        description: `Order has been marked as ${status}`,
      });

      // If payment was verified, refresh the page to update stock information
      if (status === "verified") {
        fetchOrder();
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Update Failed",
        description: "Could not update the order status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

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

  return (
    <div className="container py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center">
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
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Order Summary */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  {order.orderStatus.charAt(0).toUpperCase() +
                    order.orderStatus.slice(1)}
                </Badge>
                {getStatusBadge(order.paymentStatus)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Total</TableHead>
                      {order.paymentStatus === "pending" && (
                        <TableHead>Stock</TableHead>
                      )}
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
                            <div className="flex flex-col">
                              <span className="font-medium">{item.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ID: {item.product}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatPrice(item.price)}</TableCell>
                        <TableCell>
                          {formatPrice(item.price * item.quantity)}
                        </TableCell>
                        {order.paymentStatus === "pending" && (
                          <TableCell>
                            {stockData[item.product] !== undefined ? (
                              <span
                                className={
                                  stockData[item.product] < item.quantity
                                    ? "text-red-500 font-medium"
                                    : ""
                                }
                              >
                                {stockData[item.product]}/{item.quantity} needed
                              </span>
                            ) : (
                              "Loading..."
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

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

          {/* Payment Information */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Payment Details</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Method:</span>{" "}
                      {order.paymentMethod === "mobile_banking"
                        ? "Mobile Banking"
                        : order.paymentMethod.charAt(0).toUpperCase() +
                          order.paymentMethod.slice(1)}
                    </p>
                    <p>
                      <span className="font-medium">
                        Transaction Reference:
                      </span>{" "}
                      {order.transactionRef}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>{" "}
                      {getStatusBadge(order.paymentStatus)}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => setViewPaymentProof(true)}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Payment Proof
                    </Button>
                  </div>
                </div>

                {/* Payment Actions */}
                {order.paymentStatus === "pending" && (
                  <div>
                    <h3 className="font-medium mb-2">Payment Verification</h3>
                    {stockAdjustmentWarning && (
                      <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
                        <AlertTriangle className="h-4 w-4 inline mr-1" />
                        Warning: Some items may not have enough stock.
                      </div>
                    )}

                    <div className="mb-3">
                      <textarea
                        placeholder="Add a note (optional)"
                        className="w-full px-3 py-2 border rounded-md text-sm"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={2}
                      />
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <Button
                        onClick={() => updateOrderStatus("verified")}
                        disabled={isUpdating}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Verify Payment
                      </Button>
                      <Button
                        onClick={() => updateOrderStatus("rejected")}
                        disabled={isUpdating}
                        variant="destructive"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject Payment
                      </Button>
                    </div>
                  </div>
                )}

                {/* Order Actions */}
                {order.paymentStatus === "verified" && (
                  <div>
                    <h3 className="font-medium mb-2">Order Actions</h3>
                    {order.orderStatus === "pending" && (
                      <Button
                        onClick={() => updateOrderStatus("processing")}
                        disabled={isUpdating}
                      >
                        <Package className="mr-2 h-4 w-4" />
                        Mark as Processing
                      </Button>
                    )}

                    {order.orderStatus === "processing" && (
                      <div className="space-y-2">
                        <div className="flex items-end gap-2">
                          <div className="flex-1">
                            <Label htmlFor="trackingNumber">
                              Tracking Number
                            </Label>
                            <Input
                              id="trackingNumber"
                              value={trackingNumber}
                              onChange={(e) =>
                                setTrackingNumber(e.target.value)
                              }
                              placeholder="Enter tracking number"
                            />
                          </div>
                          <Button
                            onClick={() => updateOrderStatus("shipped")}
                            disabled={isUpdating || !trackingNumber}
                          >
                            <Truck className="mr-2 h-4 w-4" />
                            Mark as Shipped
                          </Button>
                        </div>
                      </div>
                    )}

                    {order.orderStatus === "shipped" && (
                      <Button
                        onClick={() => updateOrderStatus("delivered")}
                        disabled={isUpdating}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Delivered
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order History */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Order History</CardTitle>
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
                          <XCircle className="h-5 w-5 text-red-500" />
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

        {/* Customer Information */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 mb-4">
                <h3 className="font-medium">{order.user.name}</h3>
                <p className="text-muted-foreground">{order.user.email}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Shipping Address</h3>
                  <div className="text-sm text-muted-foreground">
                    <p>{order.shippingAddress.street}</p>
                    {order.shippingAddress.wardNo && (
                      <p>Ward: {order.shippingAddress.wardNo}</p>
                    )}
                    <p>
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.state}{" "}
                      {order.shippingAddress.postalCode}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                    {order.shippingAddress.landmark && (
                      <p>Landmark: {order.shippingAddress.landmark}</p>
                    )}
                  </div>
                </div>

                {/* Tracking Information */}
                {order.trackingNumber && (
                  <div>
                    <h3 className="font-medium mb-2">Tracking Information</h3>
                    <div className="text-sm">
                      <p>
                        <span className="font-medium">Tracking Number:</span>{" "}
                        {order.trackingNumber}
                      </p>
                    </div>
                  </div>
                )}

                {/* Additional Notes */}
                {order.notes && (
                  <div>
                    <h3 className="font-medium mb-2">Additional Notes</h3>
                    <p className="text-sm text-muted-foreground">
                      {order.notes}
                    </p>
                  </div>
                )}
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
                : order.paymentMethod.charAt(0).toUpperCase() +
                  order.paymentMethod.slice(1)}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
