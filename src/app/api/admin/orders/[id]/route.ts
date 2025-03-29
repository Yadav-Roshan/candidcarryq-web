import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/order.model";
import Product from "@/models/product.model";
import { authenticate, isAdmin } from "@/middleware/auth.middleware";
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
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    // Authentication middleware
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get order details
    const order = await Order.findById(params.id).lean();

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Check if user is authorized to view this order
    if (
      user.role !== "admin" &&
      order.user.toString() !== user._id.toString()
    ) {
      return NextResponse.json(
        { message: "Not authorized to view this order" },
        { status: 403 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Order API error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// PUT - Update order status (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    // Authentication middleware
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Admin check
    if (user.role !== "admin") {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
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

    // Get the current order status
    const currentOrder = await Order.findById(params.id);
    if (!currentOrder) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const updateData = validationResult.data;

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

    // Add status history entry if provided
    if (updateData.statusHistoryEntry) {
      updateOperation.$push = {
        statusHistory: updateData.statusHistoryEntry,
      };
    }

    // Update order
    const updatedOrder = await Order.findByIdAndUpdate(
      params.id,
      updateOperation,
      { new: true }
    );

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
