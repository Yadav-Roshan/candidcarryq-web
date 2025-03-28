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
});

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

    // Update order
    const order = await Order.findByIdAndUpdate(id, validationResult.data, {
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
