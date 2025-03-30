import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/order.model";
import { authenticate, isAdmin } from "@/middleware/auth.middleware";
import { z } from "zod";
import mongoose from "mongoose";

// Schema for updating order status
const updateOrderSchema = z.object({
  orderStatus: z
    .enum(["pending", "processing", "shipped", "delivered", "cancelled"])
    .optional(),
  paymentStatus: z
    .enum(["pending", "verified", "rejected", "completed", "failed"])
    .optional(),
  trackingNumber: z.string().optional(),
  delivererName: z.string().optional(),
  delivererPhone: z.string().optional(),
  deliveryOtp: z.string().optional(),
  statusHistoryEntry: z
    .object({
      status: z.string(),
      timestamp: z.string(),
      note: z.string().optional(),
    })
    .optional(),
});

// Function to generate a unique tracking number
function generateTrackingNumber(): string {
  // Format: TRK-YYYYMMDD-XXXXX where XXXXX is a random number
  const now = new Date();
  const dateStr =
    now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, "0") +
    now.getDate().toString().padStart(2, "0");

  // Generate a random 5-digit number
  const randomPart = Math.floor(10000 + Math.random() * 90000);

  return `TRK-${dateStr}-${randomPart}`;
}

// Generate a random 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    // Authentication middleware
    const authResult = await authenticate(request);
    if (authResult.status !== 200) {
      return NextResponse.json(
        { message: authResult.message || "Unauthorized" },
        { status: authResult.status }
      );
    }

    const userId = authResult.user.id;

    // Resolve params if it's a Promise
    const resolvedParams = params instanceof Promise ? await params : params;
    const orderId = resolvedParams.id;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json(
        { message: "Invalid order ID format" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find the order that belongs to the user
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    }).lean();

    if (!order) {
      return NextResponse.json(
        { message: "Order not found or access denied" },
        { status: 404 }
      );
    }

    // Format the order for the client
    const formattedOrder = {
      id: order._id.toString(),
      orderNumber: order.orderNumber,
      date: order.createdAt,
      status: order.orderStatus,
      paymentStatus: order.paymentStatus,
      items: order.items.map((item: any) => ({
        id: item.product.toString(),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || null,
        color: item.color || null,
        size: item.size || null,
      })),
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      transactionRef: order.transactionRef,
      paymentProofImage: order.paymentProofImage,
      total: order.totalAmount,
      shippingCost: order.shippingCost || 0,
      taxAmount: order.taxAmount || 0,
      discount: order.discount || 0, // Include discount
      promoCode: order.promoCode || null, // Include promocode
      statusHistory: order.statusHistory || [],
      trackingNumber: order.trackingNumber || null,
      deliveryOtp: order.deliveryOtp || null,
      delivererName: order.delivererName || null,
      delivererPhone: order.delivererPhone || null,
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    // Resolve params if it's a Promise
    const resolvedParams = params instanceof Promise ? await params : params;

    // Ensure we have the id parameter
    if (!resolvedParams?.id) {
      return NextResponse.json(
        { message: "Order ID is required" },
        { status: 400 }
      );
    }

    const id = resolvedParams.id; // Now safely access the id

    await connectToDatabase();

    // Authentication middleware
    const authResult = await authenticate(request);
    if (authResult.status !== 200) {
      return authResult;
    }

    const user = authResult.user;

    // Check if user is admin
    if (user.role !== "admin") {
      return NextResponse.json(
        { message: "Not authorized. Admin only." },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateOrderSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Validation error",
          errors: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // Handle status history updates
    let updateOperation: any = { $set: {} };

    // Check if order status is changing to shipped
    let isMarkingAsShipped = false;
    if (updateData.orderStatus === "shipped") {
      isMarkingAsShipped = true;

      // Get the current order to check its status
      const currentOrder = await Order.findById(id);
      if (!currentOrder) {
        return NextResponse.json(
          { message: "Order not found" },
          { status: 404 }
        );
      }

      // Only generate tracking number if the order is not already shipped
      if (currentOrder.orderStatus !== "shipped") {
        // Generate a unique tracking number
        const trackingNumber = generateTrackingNumber();
        updateOperation.$set.trackingNumber = trackingNumber;

        // Update the note to include the tracking number
        if (
          updateData.statusHistoryEntry &&
          updateData.statusHistoryEntry.note
        ) {
          updateData.statusHistoryEntry.note += ` (Tracking #: ${trackingNumber})`;
        } else if (updateData.statusHistoryEntry) {
          updateData.statusHistoryEntry.note = `Order shipped with tracking #: ${trackingNumber}`;
        }
      }
    }

    if (updateData.orderStatus) {
      updateOperation.$set.orderStatus = updateData.orderStatus;
    }

    if (updateData.paymentStatus) {
      updateOperation.$set.paymentStatus = updateData.paymentStatus;
    }

    if (updateData.trackingNumber) {
      updateOperation.$set.trackingNumber = updateData.trackingNumber;
    }

    // Add new history entry if provided
    if (updateData.statusHistoryEntry) {
      updateOperation.$push = {
        statusHistory: updateData.statusHistoryEntry,
      };
    }

    // Update order
    const order = await Order.findByIdAndUpdate(params.id, updateOperation, {
      new: true,
      runValidators: true,
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    console.error("Order API error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
