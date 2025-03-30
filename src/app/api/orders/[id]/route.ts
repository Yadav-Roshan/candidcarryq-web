import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/order.model";
import { authenticate } from "@/middleware/auth.middleware";

// Define interface for OrderItem
interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  color?: string;
  size?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await connectToDatabase();

    // Authentication middleware
    const authResult = await authenticate(request);
    if (authResult.status !== 200 || !authResult.user) {
      return NextResponse.json(
        { message: authResult.message || "Unauthorized" },
        { status: authResult.status || 401 }
      );
    }

    const user = authResult.user;
    const orderId = id;

    // Find the order
    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Check if the order belongs to the user
    if (!user || order.user.toString() !== user.id) {
      return NextResponse.json(
        { message: "Access denied - This order does not belong to you" },
        { status: 403 }
      );
    }

    // Format order data for client
    const formattedOrder = {
      _id: order._id.toString(),
      orderNumber: order.orderNumber,
      items: order.items.map((item: OrderItem) => ({
        product: item.product,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        color: item.color,
        size: item.size,
      })),
      totalAmount: order.totalAmount,
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      transactionRef: order.transactionRef,
      paymentProofImage: order.paymentProofImage,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      shippingCost: order.shippingCost,
      taxAmount: order.taxAmount,
      discount: order.discount,
      promoCode: order.promoCode,
      promoCodeDiscount: order.promoCodeDiscount,
      trackingNumber: order.trackingNumber,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      statusHistory: order.statusHistory || [],
      delivererName: order.delivererName,
      delivererPhone: order.delivererPhone,
      deliveryOtp: order.deliveryOtp,
    };

    return NextResponse.json({ order: formattedOrder });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { message: "Error fetching order details" },
      { status: 500 }
    );
  }
}

// PUT: Update order - for customer delivery confirmation
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Authentication middleware
    const authResult = await authenticate(request);
    if (authResult.status !== 200 || !authResult.user) {
      return NextResponse.json(
        { message: authResult.message || "Unauthorized" },
        { status: authResult.status || 401 }
      );
    }

    const user = authResult.user;

    const orderId = id;
    const { deliveryOtp } = await request.json();

    await connectToDatabase();

    // Find order and ensure it belongs to the user
    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Check if the order belongs to the user
    if (!user || order.user.toString() !== user.id) {
      return NextResponse.json(
        { message: "Access denied - This order does not belong to you" },
        { status: 403 }
      );
    }

    // Check if order is in shipped status
    if (order.orderStatus !== "shipped") {
      return NextResponse.json(
        { message: "Order is not in shipped status" },
        { status: 400 }
      );
    }

    // Verify OTP
    if (!deliveryOtp || deliveryOtp !== order.deliveryOtp) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    // Update order status to delivered
    order.orderStatus = "delivered";
    order.statusHistory.unshift({
      status: "delivered",
      timestamp: new Date(),
      note: "Delivery confirmed by customer",
    });

    await order.save();

    return NextResponse.json({ message: "Delivery confirmed successfully" });
  } catch (error) {
    console.error("Error confirming delivery:", error);
    return NextResponse.json(
      { message: "Error confirming delivery" },
      { status: 500 }
    );
  }
}
