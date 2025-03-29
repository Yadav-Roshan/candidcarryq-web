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
  Clock,
  Check,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice, formatDate } from "@/lib/utils";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [viewPaymentProof, setViewPaymentProof] = useState(false);
  const orderId = params.id as string;
  const [note, setNote] = useState("");
  const [stockAdjustmentWarning, setStockAdjustmentWarning] = useState(false);
  const [stockData, setStockData] = useState<Record<string, number>>({});

  // New state for status management
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [statusToReject, setStatusToReject] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("payment"); // Set active tab for status management

  // Add new states for deliverer details and OTP
  const [delivererName, setDelivererName] = useState("");
  const [delivererPhone, setDelivererPhone] = useState("");
  const [deliveryOtp, setDeliveryOtp] = useState("");

  // Move fetchOrder outside useEffect so it can be called from other functions
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

      const order = await response.json();

      // Ensure data has the order property
      if (order) {
        setOrder(order);

        // Check stock levels for items if payment is pending
        if (order.paymentStatus === "pending") {
          await checkStockLevels(order.items);
        }
      } else {
        // Handle the case when order data is missing
        toast({
          title: "Error",
          description: "Order data is incomplete or missing",
          variant: "destructive",
        });
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

  useEffect(() => {
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

  // Modified updateOrderStatus function to include delivery information
  const updateOrderStatus = async (
    statusType: "paymentStatus" | "orderStatus",
    value: string,
    note: string = ""
  ) => {
    try {
      setIsUpdating(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        router.push("/login");
        return;
      }

      let updateData: any = {};
      updateData[statusType] = value;

      // FIXED: Create a status history entry to add (not replace)
      const newStatusEntry = {
        status: value,
        timestamp: new Date().toISOString(),
        note: note || undefined,
      };

      updateData.statusHistoryEntry = newStatusEntry;

      // Add deliverer information when shipping
      if (statusType === "orderStatus" && value === "shipped") {
        if (!delivererName || !delivererPhone) {
          toast({
            title: "Missing Information",
            description: "Please enter deliverer name and phone number",
            variant: "destructive",
          });
          setIsUpdating(false);
          return;
        }
        updateData.delivererName = delivererName;
        updateData.delivererPhone = delivererPhone;
      }

      // Add OTP verification when delivering
      if (statusType === "orderStatus" && value === "delivered") {
        if (!deliveryOtp) {
          toast({
            title: "Missing Information",
            description: "Please enter the delivery OTP",
            variant: "destructive",
          });
          setIsUpdating(false);
          return;
        }
        updateData.deliveryOtp = deliveryOtp;
      }

      // Change the API endpoint to use the admin route which properly generates OTPs
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update order status");
      }

      const data = await response.json();
      setOrder(data.order);

      toast({
        title: "Status Updated",
        description: `Order ${
          statusType === "paymentStatus" ? "payment" : "status"
        } has been marked as ${value}`,
      });

      // Reset form fields after successful update
      setDelivererName("");
      setDelivererPhone("");
      setDeliveryOtp("");
      setNote("");

      // If payment was verified, refresh the page to update stock information
      if (statusType === "paymentStatus" && value === "verified") {
        fetchOrder();
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Update Failed",
        description:
          error instanceof Error
            ? error.message
            : "Could not update the order status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle approval (tick button) - Remove tracking number validation for shipping
  const handleApproveStatus = (
    statusType: "paymentStatus" | "orderStatus",
    currentStatus: string
  ) => {
    // Determine next status based on current status
    let nextStatus = "";

    if (statusType === "paymentStatus" && currentStatus === "pending") {
      nextStatus = "verified";
    } else if (statusType === "orderStatus") {
      switch (currentStatus) {
        case "pending":
          nextStatus = "processing";
          break;
        case "processing":
          nextStatus = "shipped"; // No tracking validation required now
          break;
        case "shipped":
          nextStatus = "delivered";
          break;
        default:
          nextStatus = currentStatus;
      }
    }

    // When marking as shipped, make sure deliverer details are provided
    if (statusType === "orderStatus" && currentStatus === "processing") {
      // Before proceeding with the status update, validate deliverer details
      if (!delivererName.trim() || !delivererPhone.trim()) {
        toast({
          title: "Missing Information",
          description: "Please provide deliverer name and phone number",
          variant: "destructive",
        });
        return;
      }

      // Validate phone number format with a basic pattern
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(delivererPhone.trim())) {
        toast({
          title: "Invalid Phone Number",
          description: "Please enter a valid 10-digit phone number",
          variant: "destructive",
        });
        return;
      }
    }

    if (nextStatus && nextStatus !== currentStatus) {
      // Generate automatic note if none provided
      let statusNote = note;
      if (!statusNote.trim()) {
        if (statusType === "paymentStatus") {
          statusNote = `Payment ${nextStatus}`;
        } else {
          switch (nextStatus) {
            case "processing":
              statusNote = "Order is being processed";
              break;
            case "shipped":
              statusNote = "Order shipped"; // No tracking number in note
              break;
            case "delivered":
              statusNote = "Order successfully delivered";
              break;
            default:
              statusNote = `Status changed to ${nextStatus}`;
          }
        }
      }

      // Proceed with the update
      updateOrderStatus(statusType, nextStatus, statusNote);
      setNote(""); // Clear the note after use
    }
  };

  // Handle rejection button click
  const handleRejectClick = (statusType: "paymentStatus" | "orderStatus") => {
    setStatusToReject(statusType);
    setRejectionReason("");
    setShowRejectionDialog(true);
  };

  // Handle rejection confirm
  const handleRejectConfirm = () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for the rejection",
        variant: "destructive",
      });
      return;
    }

    const statusType = statusToReject as "paymentStatus" | "orderStatus";
    const value = statusType === "paymentStatus" ? "rejected" : "cancelled";

    updateOrderStatus(statusType, value, rejectionReason);
    setShowRejectionDialog(false);
    setRejectionReason("");
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
        {/* Left/Main Content - Order Summary and Status Management */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Management</CardTitle>
              <CardDescription>Manage payment and order status</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="payment">Payment Status</TabsTrigger>
                  <TabsTrigger value="order">Order Status</TabsTrigger>
                </TabsList>

                {/* Payment Status Tab */}
                <TabsContent value="payment" className="pt-6 space-y-6">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h3 className="font-medium mb-1">
                          Current Payment Status
                        </h3>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(order.paymentStatus)}
                          <span className="text-muted-foreground">
                            {order.paymentStatus === "pending" &&
                              "Awaiting verification"}
                            {order.paymentStatus === "verified" &&
                              "Payment confirmed"}
                            {order.paymentStatus === "rejected" &&
                              "Payment was rejected"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => setViewPaymentProof(true)}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          View Payment Proof
                        </Button>
                      </div>
                    </div>

                    {/* Payment Details Summary */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Method</p>
                        <p className="font-medium">
                          {order.paymentMethod === "mobile_banking"
                            ? "Mobile Banking"
                            : order.paymentMethod.charAt(0).toUpperCase() +
                              order.paymentMethod.slice(1)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">
                          Transaction Reference
                        </p>
                        <p className="font-medium font-mono">
                          {order.transactionRef}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Amount</p>
                        <p className="font-medium">
                          {formatPrice(order.totalAmount)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Actions - Only show if payment is pending */}
                  {order.paymentStatus === "pending" && (
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-4">Verify Payment</h3>

                      {stockAdjustmentWarning && (
                        <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
                          <AlertTriangle className="h-4 w-4 inline mr-1" />
                          Warning: Some items may not have enough stock.
                        </div>
                      )}

                      <div className="mb-3">
                        <Label htmlFor="note">Add a Note (optional)</Label>
                        <Input
                          id="note"
                          placeholder="Add approval note (optional)"
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                        />
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button
                          onClick={() =>
                            handleApproveStatus(
                              "paymentStatus",
                              order.paymentStatus
                            )
                          }
                          disabled={isUpdating}
                          className="bg-green-600 hover:bg-green-700 flex-1"
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Approve Payment
                        </Button>

                        <Button
                          onClick={() => handleRejectClick("paymentStatus")}
                          disabled={isUpdating}
                          variant="destructive"
                          className="flex-1"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Reject Payment
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Order Status Tab */}
                <TabsContent value="order" className="pt-6 space-y-6">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h3 className="font-medium mb-1">
                          Current Order Status
                        </h3>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(order.orderStatus)}
                          <span className="text-muted-foreground">
                            {order.orderStatus === "pending" && "Order placed"}
                            {order.orderStatus === "processing" &&
                              "Order is being prepared"}
                            {order.orderStatus === "shipped" &&
                              "Order has been shipped"}
                            {order.orderStatus === "delivered" &&
                              "Order has been delivered"}
                            {order.orderStatus === "cancelled" &&
                              "Order was cancelled"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status progress visualization */}
                    <div className="mt-6 relative">
                      <div className="absolute top-4 left-0 right-0 h-1 bg-muted"></div>
                      <div
                        className="absolute top-4 left-0 h-1 bg-primary transition-all duration-500"
                        style={{
                          width:
                            order.orderStatus === "pending"
                              ? "0%"
                              : order.orderStatus === "processing"
                              ? "33%"
                              : order.orderStatus === "shipped"
                              ? "66%"
                              : order.orderStatus === "delivered"
                              ? "100%"
                              : "0%",
                        }}
                      ></div>

                      <div className="relative flex justify-between">
                        {["pending", "processing", "shipped", "delivered"].map(
                          (status, index) => (
                            <div
                              key={status}
                              className="flex flex-col items-center"
                            >
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center mb-2
                              ${
                                order.orderStatus === status
                                  ? "bg-primary text-primary-foreground"
                                  : [
                                      "pending",
                                      "processing",
                                      "shipped",
                                      "delivered",
                                    ].indexOf(order.orderStatus) >= index
                                  ? "bg-primary/80 text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                              }`}
                              >
                                {status === "pending" && (
                                  <Clock className="h-4 w-4" />
                                )}
                                {status === "processing" && (
                                  <Package className="h-4 w-4" />
                                )}
                                {status === "shipped" && (
                                  <Truck className="h-4 w-4" />
                                )}
                                {status === "delivered" && (
                                  <CheckCircle className="h-4 w-4" />
                                )}
                              </div>
                              <span className="text-xs capitalize text-muted-foreground">
                                {status}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {/* Tracking number display field if shipped */}
                    {(order.orderStatus === "shipped" ||
                      order.orderStatus === "delivered") &&
                      order.trackingNumber && (
                        <div className="mt-6 p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">
                            Tracking Number
                          </p>
                          <p className="font-medium font-mono">
                            {order.trackingNumber}
                          </p>
                        </div>
                      )}

                    {/* Deliverer information if shipped */}
                    {(order.orderStatus === "shipped" ||
                      order.orderStatus === "delivered") &&
                      order.delivererName &&
                      order.delivererPhone && (
                        <div className="mt-6 p-3 bg-muted/50 rounded-lg">
                          <h4 className="font-medium mb-2">
                            Deliverer Information
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">
                                Deliverer Name
                              </p>
                              <p className="font-medium">
                                {order.delivererName}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">
                                Contact Number
                              </p>
                              <p className="font-medium">
                                {order.delivererPhone}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                    {/* Delivery OTP if shipped and not delivered */}
                    {order.orderStatus === "shipped" && order.deliveryOtp && (
                      <div className="mt-6 p-3 bg-muted/50 rounded-lg">
                        <h4 className="font-medium mb-2">
                          Delivery Verification Code
                        </h4>
                        <p className="text-sm text-muted-foreground mb-1">
                          Customer needs to provide this code to the deliverer
                        </p>
                        <p className="font-medium text-xl font-mono tracking-wider">
                          {order.deliveryOtp}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Order Status Actions */}
                  {order.paymentStatus === "verified" &&
                    order.orderStatus !== "delivered" &&
                    order.orderStatus !== "cancelled" && (
                      <div className="border rounded-lg p-4">
                        <h3 className="font-medium mb-4">
                          Update Order Status
                        </h3>

                        {/* Deliverer information form when shipping */}
                        {order.orderStatus === "processing" && (
                          <div className="space-y-3 mb-4">
                            <div>
                              <Label htmlFor="delivererName">
                                Deliverer Name
                              </Label>
                              <Input
                                id="delivererName"
                                placeholder="Enter deliverer name"
                                value={delivererName}
                                onChange={(e) =>
                                  setDelivererName(e.target.value)
                                }
                                className="mt-1"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="delivererPhone">
                                Deliverer Phone Number
                              </Label>
                              <Input
                                id="delivererPhone"
                                placeholder="Enter deliverer phone number"
                                value={delivererPhone}
                                onChange={(e) =>
                                  setDelivererPhone(e.target.value)
                                }
                                className="mt-1"
                                required
                              />
                            </div>
                          </div>
                        )}

                        {/* OTP verification when delivering */}
                        {order.orderStatus === "shipped" && (
                          <div className="space-y-3 mb-4">
                            <div>
                              <Label htmlFor="deliveryOtp">Delivery OTP</Label>
                              <Input
                                id="deliveryOtp"
                                placeholder="Enter OTP provided by customer"
                                value={deliveryOtp}
                                onChange={(e) => setDeliveryOtp(e.target.value)}
                                className="mt-1"
                                required
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Ask the customer for their delivery verification
                                code
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="mb-3">
                          <Label htmlFor="statusNote">
                            Add a Note (optional)
                          </Label>
                          <Input
                            id="statusNote"
                            placeholder="Add status update note (optional)"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                          />
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Button
                            onClick={() =>
                              handleApproveStatus(
                                "orderStatus",
                                order.orderStatus
                              )
                            }
                            disabled={isUpdating}
                            className="bg-green-600 hover:bg-green-700 flex-1"
                          >
                            <Check className="mr-2 h-4 w-4" />
                            {order.orderStatus === "pending"
                              ? "Start Processing"
                              : order.orderStatus === "processing"
                              ? "Mark Shipped"
                              : order.orderStatus === "shipped"
                              ? "Confirm Delivery"
                              : "Update Status"}
                          </Button>

                          <Button
                            onClick={() => handleRejectClick("orderStatus")}
                            disabled={isUpdating}
                            variant="destructive"
                            className="flex-1"
                          >
                            <X className="mr-2 h-4 w-4" />
                            Cancel Order
                          </Button>
                        </div>
                      </div>
                    )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Order Summary Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
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

          {/* Order History */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent>
              {order.statusHistory && order.statusHistory.length > 0 ? (
                <div className="space-y-4">
                  {order.statusHistory.map((entry, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 border-b pb-4 last:border-0"
                    >
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center
                        ${
                          entry.status === "rejected" ||
                          entry.status === "cancelled"
                            ? "bg-red-100"
                            : entry.status === "verified" ||
                              entry.status === "delivered"
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
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        {entry.status === "cancelled" && (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">
                              {entry.status.charAt(0).toUpperCase() +
                                entry.status.slice(1)}
                            </p>
                            <time className="text-sm text-muted-foreground">
                              {formatDate(entry.timestamp)}
                            </time>
                          </div>
                          {(entry.status === "rejected" ||
                            entry.status === "cancelled") && (
                            <Badge variant="destructive" className="ml-2">
                              {entry.status === "rejected"
                                ? "Rejected"
                                : "Cancelled"}
                            </Badge>
                          )}
                        </div>
                        {entry.note && (
                          <div className="mt-2 p-3 bg-muted/30 rounded text-sm">
                            <p className="font-medium mb-1">Note:</p>
                            <p>{entry.note}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No history available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Customer Information */}
        <div className="xl:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 mb-4">
                <h3 className="font-medium">{order.user.name}</h3>
                <p className="text-muted-foreground">{order.user.email}</p>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Shipping Address</h3>
                  <div className="text-sm bg-muted/30 p-3 rounded-md space-y-1">
                    {/* Show building name if available */}
                    {order.shippingAddress.buildingName && (
                      <p>
                        <span className="font-medium text-muted-foreground">
                          Building/House:
                        </span>{" "}
                        {order.shippingAddress.buildingName}
                      </p>
                    )}

                    <p>
                      <span className="font-medium text-muted-foreground">
                        Street/Locality:
                      </span>{" "}
                      {order.shippingAddress.street}
                    </p>

                    {/* Show ward number if available */}
                    {order.shippingAddress.wardNo && (
                      <p>
                        <span className="font-medium text-muted-foreground">
                          Ward:
                        </span>{" "}
                        {order.shippingAddress.wardNo}
                      </p>
                    )}

                    <p>
                      <span className="font-medium text-muted-foreground">
                        City/District:
                      </span>{" "}
                      {order.shippingAddress.city}
                    </p>

                    <p>
                      <span className="font-medium text-muted-foreground">
                        State/Province:
                      </span>{" "}
                      {order.shippingAddress.state}
                    </p>

                    <p>
                      <span className="font-medium text-muted-foreground">
                        Postal Code:
                      </span>{" "}
                      {order.shippingAddress.postalCode}
                    </p>

                    <p>
                      <span className="font-medium text-muted-foreground">
                        Country:
                      </span>{" "}
                      {order.shippingAddress.country}
                    </p>

                    {/* Show landmark if available */}
                    {order.shippingAddress.landmark && (
                      <p>
                        <span className="font-medium text-muted-foreground">
                          Landmark:
                        </span>{" "}
                        {order.shippingAddress.landmark}
                      </p>
                    )}

                    {/* Show phone number if available */}
                    {order.shippingAddress.phoneNumber && (
                      <p>
                        <span className="font-medium text-muted-foreground">
                          Phone:
                        </span>{" "}
                        {order.shippingAddress.phoneNumber}
                      </p>
                    )}
                  </div>
                </div>

                {/* Additional Info */}
                {order.notes && (
                  <div>
                    <h3 className="font-medium mb-2">Order Notes</h3>
                    <div className="text-sm bg-muted/30 p-3 rounded-md">
                      <p>{order.notes}</p>
                    </div>
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
          <div className="bg-muted/30 p-3 rounded-md mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Transaction Reference
                </p>
                <p className="font-medium font-mono">{order.transactionRef}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Method</p>
                <p className="font-medium">
                  {order.paymentMethod === "mobile_banking"
                    ? "Mobile Banking"
                    : order.paymentMethod.charAt(0).toUpperCase() +
                      order.paymentMethod.slice(1)}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rejection Reason Dialog */}
      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {statusToReject === "paymentStatus"
                ? "Reject Payment"
                : "Cancel Order"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="rejectionReason" className="mb-2 block">
              Please provide a reason for{" "}
              {statusToReject === "paymentStatus"
                ? "rejection"
                : "cancellation"}
              :
            </Label>
            <Input
              id="rejectionReason"
              placeholder="Enter reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="mb-2"
            />
            <p className="text-sm text-muted-foreground">
              This reason will be visible to the customer.
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleRejectConfirm}>
              <X className="mr-2 h-4 w-4" />
              {statusToReject === "paymentStatus"
                ? "Reject Payment"
                : "Cancel Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
