import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/order.model";
import Product from "@/models/product.model";
import User from "@/models/user.model";
import { authenticate, isAdmin } from "@/middleware/auth.middleware";
import mongoose from "mongoose";
import { z } from "zod";

// Schema for updating order status - ensure values match the Order model
const updateOrderSchema = z.object({
  paymentStatus: z
    .enum(["pending", "verified", "rejected", "completed", "failed"])
    .optional(),
  orderStatus: z
    .enum(["pending", "processing", "shipped", "delivered", "cancelled"])
    .optional(),
  trackingNumber: z.string().optional(),
  shippingNotes: z.string().optional(),
  adminNotes: z.string().optional(),
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

// Generate a random 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// GET - Get order details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Fixed type annotation
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

    // Admin check
    if (!isAdmin(authResult.user)) {
      return NextResponse.json(
        { message: "Access denied - Admin only" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid order ID format" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find the order and include complete order details in response
    const order = await Order.findById(id).populate({
      path: "user",
      select: "name email", // Include user details
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Format order data for frontend
    const formattedOrder = {
      _id: order._id.toString(),
      orderNumber: order.orderNumber,
      user: {
        _id: order.user._id.toString(),
        name: order.user.name,
        email: order.user.email,
      },
      items: order.items,
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
      promoCodeDiscount: order.promoCodeDiscount, // Include promoCodeDiscount
      trackingNumber: order.trackingNumber,
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      statusHistory: order.statusHistory,
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

// PUT - Update order status (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Fixed type annotation
) {
  try {
    await connectToDatabase();

    // Authentication middleware
    const authResult = await authenticate(request);

    if (authResult.status !== 200) {
      return NextResponse.json(
        { message: authResult.message || "Unauthorized" },
        { status: authResult.status }
      );
    }

    const user = authResult.user;

    // Admin check with clearer error message
    if (!isAdmin(user)) {
      console.error("Access denied - User is not an admin:", user);
      return NextResponse.json(
        { message: "Access denied - Admin privileges required" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    console.log("Received update data:", body);

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

    const { id } = await params;

    // Get the current order status
    const currentOrder = await Order.findById(id);
    if (!currentOrder) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const updateData = validationResult.data;

    // Check if the status is actually changing to avoid duplicate entries
    if (
      (updateData.orderStatus &&
        updateData.orderStatus === currentOrder.orderStatus) ||
      (updateData.paymentStatus &&
        updateData.paymentStatus === currentOrder.paymentStatus)
    ) {
      return NextResponse.json({
        message: "No change in status",
        order: currentOrder,
      });
    }

    // Check if changing from processing to shipped
    const isShipping =
      currentOrder.orderStatus === "processing" &&
      updateData.orderStatus === "shipped";

    // Check if changing from shipped to delivered
    const isDelivering =
      currentOrder.orderStatus === "shipped" &&
      updateData.orderStatus === "delivered";

    // Validate deliverer details when shipping
    if (isShipping) {
      if (!updateData.delivererName || !updateData.delivererPhone) {
        return NextResponse.json(
          { message: "Deliverer name and phone number are required" },
          { status: 400 }
        );
      }

      // Generate OTP for delivery verification
      updateData.deliveryOtp = generateOTP();
    }

    // Validate OTP when marking as delivered
    if (isDelivering) {
      if (!updateData.deliveryOtp) {
        return NextResponse.json(
          { message: "Delivery OTP is required" },
          { status: 400 }
        );
      }

      // Verify OTP
      if (updateData.deliveryOtp !== currentOrder.deliveryOtp) {
        return NextResponse.json(
          { message: "Invalid OTP. Delivery cannot be confirmed." },
          { status: 400 }
        );
      }
    }

    // Check if payment status is changing from pending to verified
    const isVerifyingPayment =
      currentOrder.paymentStatus === "pending" &&
      updateData.paymentStatus === "verified";

    // Create update operation with $set and optional $push
    let updateOperation: any = { $set: {} };

    // Add properties to $set
    if (updateData.paymentStatus) {
      updateOperation.$set.paymentStatus = updateData.paymentStatus;
    }

    if (updateData.orderStatus) {
      updateOperation.$set.orderStatus = updateData.orderStatus;
    }

    if (updateData.trackingNumber) {
      updateOperation.$set.trackingNumber = updateData.trackingNumber;
    }

    // Add deliverer details if provided
    if (updateData.delivererName) {
      updateOperation.$set.delivererName = updateData.delivererName;
    }

    if (updateData.delivererPhone) {
      updateOperation.$set.delivererPhone = updateData.delivererPhone;
    }

    if (isShipping && updateData.deliveryOtp) {
      updateOperation.$set.deliveryOtp = updateData.deliveryOtp;
    }

    // Add status history entry if provided and avoid duplicates
    if (updateData.statusHistoryEntry) {
      // Check if this exact status is the most recent one to avoid duplicates
      const mostRecentEntry = currentOrder.statusHistory?.[0];
      const isDuplicate =
        mostRecentEntry &&
        mostRecentEntry.status === updateData.statusHistoryEntry.status;

      if (!isDuplicate) {
        updateOperation.$push = {
          statusHistory: {
            $each: [updateData.statusHistoryEntry],
            $position: 0, // Add to beginning of array for newest-first order
          },
        };
      }
    }

    // Update order using the id param
    const updatedOrder = await Order.findByIdAndUpdate(id, updateOperation, {
      new: true,
    });

    // If payment is being verified, reduce stock quantities
    if (isVerifyingPayment) {
      for (const item of currentOrder.items) {
        // Update stock for each product
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: -item.quantity } } // Decrement stock by ordered quantity
        );
      }
    }

    return NextResponse.json({
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Order API error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
