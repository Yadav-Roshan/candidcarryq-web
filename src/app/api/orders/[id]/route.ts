import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/order.model";
import { authenticate, isAdmin } from "@/middleware/auth.middleware";
import { z } from "zod";

// Schema for updating order status
const updateOrderSchema = z.object({
  orderStatus: z
    .enum(["pending", "processing", "shipped", "delivered", "cancelled"])
    .optional(),
  paymentStatus: z
    .enum(["pending", "verified", "rejected", "completed", "failed"])
    .optional(),
  trackingNumber: z.string().optional(),
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

export async function GET(
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
    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Check if user is authorized to view this order
    if (user.role !== "admin" && order.user.toString() !== user.id.toString()) {
      return NextResponse.json(
        { message: "Not authorized to view this order" },
        { status: 403 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Order API error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
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
