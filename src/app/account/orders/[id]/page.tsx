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
  CircleDot,
  Info as InfoIcon,
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
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";le, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";
import { OrderStatusBadge } from "@/components/order-status-badge";

interface OrderItem {
  product: string;
  name: string;  price: number;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  _id: string;rNumber: string;
  orderNumber: string;tems: OrderItem[];
  items: OrderItem[];mber;
  totalAmount: number;ess: {
  shippingAddress: {
    street: string;
    city: string;
    state: string;ng;
    postalCode: string;;
    country: string;ng;
    wardNo?: string;ing;
    landmark?: string;
  };ng;
  paymentMethod: string;
  transactionRef: string;
  paymentProofImage: string;ntStatus: string;
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
    status: string;g;
    timestamp: string;
    note?: string;
  }>;
}
Router();
export default function OrderDetailPage() {t default function OrderDetailPage() {
  const params = useParams(); const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);seState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);ing] = useState(true);
  const [viewPaymentProof, setViewPaymentProof] = useState(false);iewPaymentProof] = useState(false);
  const orderId = params.id as string;

  const [orderStatusNotifications, setOrderStatusNotifications] = useState<{useState<{
    [key: string]: boolean;
  }>({});  }>({});

  useEffect(() => {
    const fetchOrder = async () => { fetchOrder = async () => {
      try {      try {
        setIsLoading(true);g(true);
        const token = localStorage.getItem("authToken");etItem("authToken");
        if (!token) {(!token) {
          router.push("/login");in");
          return;
        }

        const response = await fetch(`/api/orders/${orderId}`, {ponse = await fetch(`/api/orders/${orderId}`, {
          headers: { headers: {
            Authorization: `Bearer ${token}`,            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {!response.ok) {
          throw new Error("Failed to fetch order");hrow new Error("Failed to fetch order");
        }        }

        const data = await response.json();
        setOrder(data.order);etOrder(data.order);
      } catch (error) {      } catch (error) {
        console.error("Error loading order:", error);", error);
        toast({
          title: "Error",",
          description: "Failed to load order details",,
          variant: "destructive",nt: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();chOrder();
  }, [orderId, router, toast]);orderId, router, toast]);

  useEffect(() => { {
    // Check for status changes since last visit since last visit
    const checkStatusChanges = () => {    const checkStatusChanges = () => {
      const viewedStatuses = localStorage.getItem(`order-status-${orderId}`);tatuses = localStorage.getItem(`order-status-${orderId}`);
      if (viewedStatuses && order) {
        try {
          const parsedStatuses = JSON.parse(viewedStatuses);
          // Check if payment status or order status has changed or order status has changed
          const notifications = {st notifications = {
            payment: parsedStatuses.payment !== order.paymentStatus,tStatus,
            order: parsedStatuses.order !== order.orderStatus,
          };
          setOrderStatusNotifications(notifications);

          // Update with current statuses Update with current statuses
          localStorage.setItem(
            `order-status-${orderId}`,            `order-status-${orderId}`,
            JSON.stringify({
              payment: order.paymentStatus,ymentStatus,
              order: order.orderStatus,,
            })
          );
        } catch (e) {
          console.error("Error parsing stored status", e);ole.error("Error parsing stored status", e);
        }
      } else if (order) {r) {
        // First time viewing - set current status
        localStorage.setItem(ocalStorage.setItem(
          `order-status-${orderId}`,{orderId}`,
          JSON.stringify({
            payment: order.paymentStatus,ymentStatus,
            order: order.orderStatus,,
          })
        );
      }
    };

    if (order) {(order) {
      checkStatusChanges();checkStatusChanges();
    }    }
  }, [order, orderId]);erId]);

  const getOrderStatusStep = (status: string) => {st getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":      case "pending":
        return 0;
      case "processing":
        return 1;outline"
      case "shipped":sName="bg-yellow-500/10 text-yellow-700 border-yellow-300"
        return 2;
      case "delivered":
        return 3;
      case "cancelled":
        return -1;ing":
      default:
        return 0;<Badge
    }line"
  };sName="bg-blue-500/10 text-blue-700 border-blue-300"

  if (isLoading) {
    return (
      <div className="container py-12 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );<Badge
  }outline"
sName="bg-amber-500/10 text-amber-700 border-amber-300"
  if (!order) {
    return (
      <div className="container py-12">
        <div className="flex items-center mb-6">
          <Buttoned":
            variant="outline"
            onClick={() => router.back()}<Badge
            className="mr-4"tline"
          >sName="bg-green-500/10 text-green-700 border-green-300"
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Order not found</h1>
        </div>":
        <Card>
          <CardContent className="pt-6"><Badge
            <div className="flex flex-col items-center justify-center py-12">tline"
              <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />sName="bg-red-500/10 text-red-700 border-red-300"
              <p className="text-xl font-medium mb-2">Order not found</p>
              <p className="text-muted-foreground">
                The order you're looking for doesn't exist or you don't have
                permission to view it.
              </p>:
            </div>
          </CardContent><Badge
        </Card>utline"
      </div>sName="bg-green-500/10 text-green-700 border-green-300"
    );
  }

  const currentStep = getOrderStatusStep(order.orderStatus);
":
  // Helper function to show a notification badge if status changed
  const StatusChangeIndicator = ({ type }: { type: "payment" | "order" }) => {<Badge
    if (orderStatusNotifications[type]) {utline"
      return (sName="bg-red-500/10 text-red-700 border-red-300"
        <span className="inline-block animate-pulse ml-2 h-2 w-2 rounded-full bg-primary"></span>
      );
    }
    return null;
  };
dge variant="outline">{status}</Badge>;
  return (
    <div className="container py-8">
      <div className="flex items-center mb-6">
        <Buttonst getOrderStatusStep = (status: string) => {
          variant="outline"switch (status) {
          onClick={() => router.back()}      case "pending":
          className="mr-4"
        >g":
          <ArrowLeft className="mr-2 h-4 w-4" />
          Backed":
        </Button>
        <div>ered":
          <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
          <p className="text-muted-foreground">lled":
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
      </div>

      {/* Order Status Tracker */}
      {currentStep >= 0 && ((isLoading) {
        <Card className="mb-6">return (
          <CardHeader>      <div className="container py-12 flex justify-center items-center">
            <CardTitle className="flex items-center">lassName="h-8 w-8 animate-spin text-primary" />
              Order Status <StatusChangeIndicator type="order" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">!order) {
              {/* Progress bar */} return (
              <div className="absolute top-4 left-0 right-0 h-1 bg-muted">      <div className="container py-12">
                <divassName="flex items-center mb-6">
                  className="h-1 bg-primary"utton
                  style={{
                    width: `${currentStep === 0 ? 5 : currentStep * 33}%`,
                    transition: "width 0.5s ease-in-out",Name="mr-4"
                  }}
                />4 w-4" />
              </div>
/Button>
              {/* Steps */} not found</h1>
              <div className="flex justify-between">
                <div className="flex flex-col items-center">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${iv className="flex flex-col items-center justify-center py-12">
                      currentStep >= 0<AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                        ? "bg-primary text-primary-foreground"-medium mb-2">Order not found</p>
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
                      currentStep >= 1t currentStep = getOrderStatusStep(order.orderStatus);
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"  // Helper function to show a notification badge if status changed
                    }`} | "order" }) => {
                  >    if (orderStatusNotifications[type]) {
                    <Package className="h-4 w-4" />
                  </div>bg-primary"></span>
                  <span className="text-sm mt-2">Processing</span>
                </div>

                <div className="flex flex-col items-center">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      currentStep >= 2<div className="container py-8">
                        ? "bg-primary text-primary-foreground"      <div className="flex items-center mb-6">
                        : "bg-muted text-muted-foreground"utton
                    }`}
                  >
                    <Truck className="h-4 w-4" />Name="mr-4"
                  </div>
                  <span className="text-sm mt-2">Shipped</span>4 w-4" />
                </div>
/Button>
                <div className="flex flex-col items-center">
                  <divclassName="text-2xl font-bold">Order #{order.orderNumber}</h1>
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${sName="text-muted-foreground">
                      currentStep >= 3laced on {formatDate(order.createdAt)}
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <CheckCircle className="h-4 w-4" />r Status Tracker */}
                  </div>ntStep >= 0 && (
                  <span className="text-sm mt-2">Delivered</span>        <Card className="mb-6">
                </div>
              </div>Name="flex items-center">
            </div>tusChangeIndicator type="order" />
e>
            <div className="mt-8">
              {order.trackingNumber && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-md border p-4 mt-4">atus Alert - NEW SECTION */}
                  <div>ame="mb-6">
                    <p className="font-medium">Tracking Number</p>derStatus === "cancelled" && (
                    <p className="text-muted-foreground">ctive" className="mb-4">
                      {order.trackingNumber}lassName="h-4 w-4" />
                    </p>
                  </div>lertDescription>
                  <Button variant="outline" className="mt-2 sm:mt-0">elled. If you have any questions, please contact our support team.
                    Track Packageescription>
                  </Button>
                </div>
              )}
Payment Status Alert - NEW */}
              {/* Payment status info */}.paymentStatus === "rejected" && (
              <div className="flex flex-col sm:flex-row sm:items-center rounded-md border p-4 mt-4">                <Alert variant="destructive" className="mb-4">
                <div className="flex-1">className="h-4 w-4" />
                  <p className="font-medium flex items-center">tTitle>
                    Payment Status <StatusChangeIndicator type="payment" />
                  </p>rder.statusHistory.find(entry => entry.status === "rejected")?.note || 
                  <div className="flex items-center gap-2 mt-1">am for assistance."}
                    <OrderStatusBadge status={order.paymentStatus} type="payment" />
                    <span className="text-sm text-muted-foreground">
                      {order.paymentStatus === "pending" &&
                        "Your payment is being verified"}
                      {order.paymentStatus === "verified" &&ending Payment Alert - NEW */}
                        "Your payment has been verified"} (
                      {order.paymentStatus === "rejected" &&lassName="bg-yellow-50 text-yellow-800 border-yellow-300 mb-4">
                        "Your payment was rejected"}
                    </span>rtTitle>Payment Verification In Progress</AlertTitle>
                  </div>                  <AlertDescription>
                </div>. This typically takes 1-2 hours during business hours.
                <ButtonertDescription>
                  variant="outline"
                  size="sm"
                  className="mt-2 sm:mt-0"
                  onClick={() => setViewPaymentProof(true)}
                >ymentStatus === "verified" && order.orderStatus === "pending" && (
                  <ExternalLink className="mr-2 h-4 w-4" />ert className="bg-green-50 text-green-800 border-green-300 mb-4">
                  View Payment Proof/>
                </Button>Title>Payment Verified</AlertTitle>
              </div>
            </div>ur payment has been verified. Your order will be processed soon.
          </CardContent>                  </AlertDescription>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details */}
        <div className="lg:col-span-2">
          <Card>sName="absolute top-4 left-0 right-0 h-1 bg-muted">
            <CardHeader>v
              <CardTitle>Order Details</CardTitle>
            </CardHeader>{{
            <CardContent>ep * 33}%`,
              <Table>ansition: "width 0.5s ease-in-out",
                <TableHeader>                  }}
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Quantity</TableHead> improved styling */}
                    <TableHead>Total</TableHead>
                  </TableRow>">
                </TableHeader>
                <TableBody> className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  {order.items.map((item, index) => (
                    <TableRow key={index}>? "bg-primary text-primary-foreground"
                      <TableCell>
                        <div className="flex items-center gap-3">}
                          <div className="h-12 w-12 rounded-md border overflow-hidden bg-muted">
                            {item.image ? (  <Package className="h-4 w-4" />
                              <Image                  </div>
                                src={item.image}"text-sm mt-2">Order Placed</span>
                                alt={item.name} "pending" && (
                                width={48}
                                height={48}
                                className="h-full w-full object-cover"
                              />
                            ) : (l items-center">
                              <div className="flex h-full w-full items-center justify-center bg-muted">
                                <Package className="h-6 w-6 text-muted-foreground" />sName={`h-8 w-8 rounded-full flex items-center justify-center ${
                              </div>
                            )}mary text-primary-foreground"
                          </div>bg-muted text-muted-foreground"
                          <span className="font-medium">{item.name}</span>}
                        </div>  >
                      </TableCell>                    <Package className="h-4 w-4" />
                      <TableCell>{formatPrice(item.price)}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell> "processing" && (
                        {formatPrice(item.price * item.quantity)}animate-pulse">Current</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>r">
              </Table>
tems-center justify-center ${
              <div className="mt-6 bg-muted/40 rounded-md p-4">
                <div className="space-y-2">d"
                  <div className="flex justify-between">"
                    <span>Subtotal</span>
                    <span>
                      {formatPrice(className="h-4 w-4" />
                        order.totalAmount - order.taxAmount - order.shippingCost
                      )}n className="text-sm mt-2">Shipped</span>
                    </span>r.orderStatus === "shipped" && (
                  </div>="text-xs text-primary mt-1 animate-pulse">Current</span>
                  {order.discount && order.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>
                        Discount {order.promoCode && `(${order.promoCode})`}div className="flex flex-col items-center">
                      </span>
                      <span>-{formatPrice(order.discount)}</span>w-8 rounded-full flex items-center justify-center ${
                    </div>rentStep >= 3
                  )}    ? "bg-primary text-primary-foreground"
                  <div className="flex justify-between">      : "bg-muted text-muted-foreground"
                    <span>Shipping</span>
                    <span>{formatPrice(order.shippingCost)}</span>   >
                  </div>            <CheckCircle className="h-4 w-4" />
                  <div className="flex justify-between">                  </div>
                    <span>Tax</span>pan>
                    <span>{formatPrice(order.taxAmount)}</span>rStatus === "delivered" && (
                  </div>xt-xs text-primary mt-1">Completed</span>
                  <Separator className="my-2" />  )}
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>sName="mt-8">
              </div>s - NEW IMPROVED UI */}
            </CardContent>="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          </Card>
g p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground">Payment Status</h3>
                      <div className="flex items-center mt-1"> Timeline</CardTitle>
                        {order.paymentStatus === "pending" && (
                          <Clock className="h-4 w-4 text-yellow-500 mr-2" />
                        )}
                        {order.paymentStatus === "verified" && (ory && order.statusHistory.length > 0 ? (
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        )}
                        {order.paymentStatus === "rejected" && (w-10 rounded-full bg-muted flex items-center justify-center">
                          <XCircle className="h-4 w-4 text-red-500 mr-2" />s === "pending" && (
                        )}me="h-5 w-5 text-yellow-500" />
                        <span className="font-medium capitalize">{order.paymentStatus}</span>
                      </div>"processing" && (
                    </div>e="h-5 w-5 text-blue-500" />
                    {getStatusBadge(order.paymentStatus)}
                  </div>tatus === "shipped" && (
                  <p className="text-sm text-muted-foreground">className="h-5 w-5 text-amber-500" />
                    {order.paymentStatus === "pending" && "Your payment is being verified"}
                    {order.paymentStatus === "verified" && "Your payment has been verified"}
                    {order.paymentStatus === "rejected" && "Your payment was rejected"}le className="h-5 w-5 text-green-500" />
                  </p>
                </div>tatus === "verified" && (
/>
                {/* Order Status Card */}
                <div className="border rounded-lg p-4">tus === "rejected" && (
                  <div className="flex justify-between items-start mb-2">00" />
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground">Order Status</h3>
                      <div className="flex items-center mt-1">
                        {order.orderStatus === "pending" && (Name="flex justify-between items-start">
                          <Clock className="h-4 w-4 text-yellow-500 mr-2" />assName="font-medium">
                        )}       {entry.status.charAt(0).toUpperCase() +
                        {order.orderStatus === "processing" && (  entry.status.slice(1)}
                          <Package className="h-4 w-4 text-blue-500 mr-2" />    </p>
                        )}                          <time className="text-muted-foreground text-sm">
                        {order.orderStatus === "shipped" && (
                          <Truck className="h-4 w-4 text-amber-500 mr-2" />
                        )}
                        {order.orderStatus === "delivered" && (
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" /><p className="text-sm text-muted-foreground mt-1">
                        )}note}
                        {order.orderStatus === "cancelled" && (
                          <XCircle className="h-4 w-4 text-red-500 mr-2" />)}
                        )}>
                        <span className="font-medium capitalize">{order.orderStatus}</span>v>
                      </div>
                    </div>
                    {getStatusBadge(order.orderStatus)}me="text-muted-foreground">No history available</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {order.orderStatus === "pending" && "Your order is waiting to be processed"}
                    {order.orderStatus === "processing" && "Your order is being prepared"}
                    {order.orderStatus === "shipped" && "Your order is on its way"}
                    {order.orderStatus === "delivered" && "Your order has been delivered"}
                    {order.orderStatus === "cancelled" && "Your order has been cancelled"}
                  </p>
                </div>
              </div>
mation</CardTitle>
              {/* Tracking Number section (if available) */}
              {order.trackingNumber && ( className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-md border p-4 mt-4">
                  <div>
                    <p className="font-medium">Tracking Number</p> font-medium mb-2">Payment Method</h3>
                    <p className="text-muted-foreground">
                      {order.trackingNumber}
                    </p>rder.paymentMethod === "mobile_banking"
                  </div>  ? "Mobile Banking"
                  <Button variant="outline" className="mt-2 sm:mt-0">der.paymentMethod === "esewa"
                    Track Package     ? "eSewa"
                  </Button>                      : "Khalti"}
                </div>
              )}t-1">
            </div>n className="text-muted-foreground">Reference: </span>
          </CardContent>
        </Card>
      )}

      {/* Order Timeline - Enhanced */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details - Keep existing code */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>hippingAddress.wardNo && (
            </CardHeader>/p>
            <CardContent>
              <Table>
                <TableHeader>.shippingAddress.state}{" "}
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Total</TableHead>ssName="mt-1">
                  </TableRow>ndmark}
                </TableHeader>
                <TableBody>
                  {order.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center gap-3">*/}
                          <div className="h-12 w-12 rounded-md border overflow-hidden bg-muted">rounded-md">
                            {item.image ? (
                              <Imageground mb-4">
                                src={item.image}e contact our
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
                          <span className="font-medium">{item.name}</span>og */}
                        </div>ymentProof} onOpenChange={setViewPaymentProof}>
                      </TableCell>nt className="max-w-2xl">
                      <TableCell>{formatPrice(item.price)}</TableCell>er>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>Header>
                        {formatPrice(item.price * item.quantity)}Name="relative h-[500px] w-full bg-muted rounded-md overflow-hidden">
                      </TableCell>
                    </TableRow>={order.paymentProofImage}
                  ))}alt="Payment proof"
                </TableBody>              fill
              </Table>ntain"

              <div className="mt-6 bg-muted/40 rounded-md p-4">
                <div className="space-y-2">="mt-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Subtotal</span>Name="font-medium">Transaction Reference:</span>{" "}
                    <span>
                      {formatPrice(
                        order.totalAmount - order.taxAmount - order.shippingCost
                      )}
                    </span>obile_banking"
                  </div>bile Banking"
                  {order.discount && order.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>
                        Discount {order.promoCode && `(${order.promoCode})`}
                      </span>
                      <span>-{formatPrice(order.discount)}</span>t>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{formatPrice(order.shippingCost)}</span>                  </div>                  <div className="flex justify-between">                    <span>Tax</span>                    <span>{formatPrice(order.taxAmount)}</span>                  </div>                  <Separator className="my-2" />                  <div className="flex justify-between font-bold">                    <span>Total</span>                    <span>{formatPrice(order.totalAmount)}</span>                  </div>                </div>              </div>            </CardContent>          </Card>          {/* Order Timeline - Enhanced */}          <Card className="mt-6">            <CardHeader>              <CardTitle>Order Timeline</CardTitle>            </CardHeader>            <CardContent>              <div className="space-y-4">                {order.statusHistory && order.statusHistory.length > 0 ? (                  order.statusHistory.map((entry, index) => (                    <div key={index} className="flex items-start gap-4">                      <div className={`h-10 w-10 rounded-full flex items-center justify-center                        ${entry.status === "rejected" ? "bg-red-100" :                           entry.status === "verified" ? "bg-green-100" :                          entry.status === "delivered" ? "bg-green-100" :                          entry.status === "shipped" ? "bg-amber-100" :                          entry.status === "processing" ? "bg-blue-100" : "bg-muted"}`}>                        {entry.status === "pending" && (                          <AlertTriangle className="h-5 w-5 text-yellow-500" />                        )}                        {entry.status === "processing" && (                          <Package className="h-5 w-5 text-blue-500" />                        )}                        {entry.status === "shipped" && (                          <Truck className="h-5 w-5 text-amber-500" />                        )}                        {entry.status === "delivered" && (                          <CheckCircle className="h-5 w-5 text-green-500" />                        )}                        {entry.status === "verified" && (                          <CheckCircle className="h-5 w-5 text-green-500" />                        )}                        {entry.status === "rejected" && (                          <AlertTriangle className="h-5 w-5 text-red-500" />                        )}                        {entry.status === "cancelled" && (                          <XCircle className="h-5 w-5 text-red-500" />                        )}                      </div>                      <div className="flex-1">                        <div className="flex justify-between items-start">                          <p className="font-medium">                            {entry.status.charAt(0).toUpperCase() +                              entry.status.slice(1)}                          </p>                          <time className="text-muted-foreground text-sm">                            {formatDate(entry.timestamp)}                          </time>                        </div>                        {entry.note && (                          <p className={`text-sm mt-1 ${entry.status === "rejected" ? "text-red-600 font-medium" : "text-muted-foreground"}`}>                            {entry.note}                          </p>                        )}                      </div>                    </div>                  ))                ) : (                  <p className="text-muted-foreground">No history available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Info Sidebar - Keep existing code */}
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

      {/* Payment Proof Dialog - Keep existing code but remove the image display */}
      <Dialog open={viewPaymentProof} onOpenChange={setViewPaymentProof}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-1">Transaction Reference</h3>
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
                {getStatusBadge(order.paymentStatus)}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-1">Date Submitted</h3>
              <p>{formatDate(order.createdAt)}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
