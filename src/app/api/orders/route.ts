import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/order.model";
import Product from "@/models/product.model";
import { authenticate, isAdmin } from "@/middleware/auth.middleware";
import { z } from "zod";

// Schema for creating order
const orderItemSchema = z.object({
  product: z.string(),
  name: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  image: z.string(),
});

const orderSchema = z.object({
  items: z.array(orderItemSchema),
  totalAmount: z.number().positive(),
  shippingAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string().default("Nepal"),
  }),
  paymentMethod: z.enum(["cash", "esewa", "khalti", "card"]),
});

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const authResult = await authenticate(request);

    if (authResult.status !== 200 || !authResult.user) {
      return NextResponse.json(
        { message: authResult.message || "Unauthorized" },
        { status: authResult.status || 401 }
      );
    }

    const user = authResult.user;

    // Make sure user exists and has a role property
    let query = {};
    // Regular users can only see their own orders
    if (user && user.role !== "admin") {
      query = { user: user.id }; // Changed from user._id to user.id
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Order API error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    // Authentication middleware - Fix to ensure NextResponse
    const authResult = await authenticate(request);
    if (authResult.status !== 200 || !authResult.user) {
      return NextResponse.json(
        { message: authResult.message || "Unauthorized" },
        { status: authResult.status || 401 }
      );
    }

    const user = authResult.user;

    // Parse and validate request body
    const body = await request.json();
    const validationResult = orderSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Validation error",
          errors: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const orderData = validationResult.data;

    // Verify product availability and update stock
    for (const item of orderData.items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return NextResponse.json(
          {
            message: `Product with ID ${item.product} not found`,
          },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            message: `Not enough stock for ${product.name}. Available: ${product.stock}`,
          },
          { status: 400 }
        );
      }

      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Create order
    const order = await Order.create({
      user: user.id, // Changed from user._id to user.id
      ...orderData,
    });

    return NextResponse.json(
      {
        message: "Order created successfully",
        order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order API error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
