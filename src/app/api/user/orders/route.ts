import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { authenticate } from "@/middleware/auth.middleware";
import { z } from "zod";

// Define order schema for validation
const orderItemSchema = z.object({
  product: z.string(),
  name: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  image: z.string(),
});

const shippingAddressSchema = z.object({
  street: z.string(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  country: z.string().default("Nepal"),
  wardNo: z.string().optional(),
  landmark: z.string().optional(),
});

const createOrderSchema = z.object({
  items: z.array(orderItemSchema),
  totalAmount: z.number().positive(),
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.enum(["esewa", "khalti", "mobile_banking"]),
  transactionRef: z.string().min(1),
  paymentProofImage: z.string().url(),
  shippingCost: z.number().default(0),
  taxAmount: z.number().default(0),
  discount: z.number().optional(),
  promoCode: z.string().optional(),
});

// GET - Get user's orders
export async function GET(request: NextRequest) {
  try {
    // Authentication middleware
    const authResult = await authenticate(request);
    if (!authResult || authResult.status !== 200) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = authResult.user;

    await connectToDatabase();

    // Get orders for this user
    const orders = await Order.find({ user: user._id })
      .sort({ createdAt: -1 })
      .select(
        "orderNumber items totalAmount paymentStatus orderStatus createdAt trackingNumber"
      )
      .lean();

    // Format the response
    const formattedOrders = orders.map((order: any) => ({
      id: order._id.toString(),
      orderNumber: order.orderNumber,
      date: order.createdAt,
      total: order.totalAmount,
      status: order.orderStatus,
      paymentStatus: order.paymentStatus,
      trackingNumber: order.trackingNumber || null,
      items: order.items.map((item: any) => ({
        id: item.product.toString(),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
    }));

    return NextResponse.json({ orders: formattedOrders });
  } catch (error) {
    console.error("Orders fetch error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// Helper function to generate a unique order number
async function generateOrderNumber() {
  // Format: ORD-YYYYMMDD-XXXX (where XXXX is a sequential number)
  const date = new Date();
  const dateStr =
    date.getFullYear().toString() +
    (date.getMonth() + 1).toString().padStart(2, "0") +
    date.getDate().toString().padStart(2, "0");

  // Find highest order number for today
  const lastOrder = await Order.findOne({
    orderNumber: new RegExp(`^ORD-${dateStr}-`),
  }).sort({ orderNumber: -1 });

  let sequence = 1;
  if (lastOrder) {
    const lastSequence = parseInt(lastOrder.orderNumber.split("-")[2]);
    sequence = lastSequence + 1;
  }

  return `ORD-${dateStr}-${sequence.toString().padStart(4, "0")}`;
}

// POST - Create new order
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    // Authentication middleware - fixed to properly log authentication errors
    const authResult = await authenticate(request);
    if (!authResult) {
      console.error("Authentication failed: No auth result returned");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (authResult.status !== 200) {
      console.error(`Authentication failed with status: ${authResult.status}`);
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = authResult.user;
    if (!user || !user._id) {
      console.error("Authentication failed: No valid user in auth result");
      return NextResponse.json(
        { message: "Invalid user data" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createOrderSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Validation error",
          errors: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // Create order
    const order = await Order.create({
      user: user._id,
      orderNumber: await generateOrderNumber(),
      paymentStatus: "pending",
      orderStatus: "pending",
      ...validatedData,
      statusHistory: [
        {
          status: "pending",
          timestamp: new Date(),
          note: "Order placed",
        },
      ],
    });

    // Update user's orders array
    await User.findByIdAndUpdate(user._id, { $push: { orders: order._id } });

    return NextResponse.json(
      {
        message: "Order created successfully",
        order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order API error:", error);

    // Return more detailed error for debugging
    return NextResponse.json(
      {
        message: "Server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
