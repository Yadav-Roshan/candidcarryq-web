import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { authenticate } from "@/middleware/auth.middleware";
import { z } from "zod";

// Define order schema for validation with relaxed validation
const orderItemSchema = z.object({
  product: z.string(),
  name: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  image: z.string(),
  color: z.string().optional(),
  size: z.string().optional(),
});

// Updated shipping address schema to match the form data
const shippingAddressSchema = z.object({
  buildingName: z.string().optional(),
  locality: z.string().min(1, "Locality is required"),
  wardNo: z.string().optional(),
  postalCode: z.string().min(1, "Postal code is required"),
  district: z.string().min(1, "District is required"),
  province: z.string().min(1, "Province is required"),
  country: z.string().min(1, "Country is required"),
  landmark: z.string().optional(),
  // Also include the original street, city, state fields for compatibility
  street: z.string().optional(), // Will be populated from locality
  city: z.string().optional(), // Will be populated from district
  state: z.string().optional(), // Will be populated from province
  phoneNumber: z.string().optional(),
});

// Updated order schema with more flexible validation
const createOrderSchema = z.object({
  items: z.array(orderItemSchema),
  totalAmount: z.number().positive(),
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.enum(["esewa", "khalti", "mobile_banking", "cash", "card"]),
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
    if (authResult.status !== 200) {
      return NextResponse.json(
        { message: authResult.message || "Unauthorized" },
        { status: authResult.status }
      );
    }

    const user = authResult.user;

    await connectToDatabase();

    // Get orders for this user
    const orders = await Order.find({ user: user.id })
      .sort({ createdAt: -1 })
      // Remove the select or expand it to include all needed fields
      // .select(
      //   "orderNumber items totalAmount paymentStatus orderStatus createdAt trackingNumber"
      // )
      .lean();

    // Format the response with additional fields
    const formattedOrders = orders.map((order: any) => ({
      id: order._id.toString(),
      orderNumber: order.orderNumber,
      date: order.createdAt,
      total: order.totalAmount,
      status: order.orderStatus,
      paymentStatus: order.paymentStatus,
      trackingNumber: order.trackingNumber || null,
      // Include additional fields needed for order details
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      transactionRef: order.transactionRef,
      shippingCost: order.shippingCost || 0,
      taxAmount: order.taxAmount || 0,
      discount: order.discount || 0,
      promoCode: order.promoCode || null,
      statusHistory: order.statusHistory || [],
      // Map items as before
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

    // Authentication middleware - updated to check the new format
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
    console.log("Order request body:", JSON.stringify(body, null, 2));

    const validationResult = createOrderSchema.safeParse(body);

    if (!validationResult.success) {
      console.error("Order validation errors:", validationResult.error.errors);
      return NextResponse.json(
        {
          message: "Validation error",
          errors: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // Convert the shipping address format to match our order model
    // Map new address format to the format expected by the Order model
    const addressData = {
      street: validatedData.shippingAddress.locality, // Use locality as street
      city: validatedData.shippingAddress.district, // Use district as city
      state: validatedData.shippingAddress.province, // Use province as state
      postalCode: validatedData.shippingAddress.postalCode,
      country: validatedData.shippingAddress.country || "Nepal",
      // Add any additional fields as metadata or comments
      // ...other address fields can be stored in a notes field if needed
    };

    // Create order with the adapted address format - ensuring orderStatus and paymentStatus match the schema
    const order = await Order.create({
      user: user.id,
      orderNumber: await generateOrderNumber(),
      paymentStatus: "pending", // Valid enum value
      orderStatus: "pending", // Valid enum value
      items: validatedData.items,
      totalAmount: validatedData.totalAmount,
      shippingAddress: addressData,
      paymentMethod: validatedData.paymentMethod,
      transactionRef: validatedData.transactionRef,
      paymentProofImage: validatedData.paymentProofImage,
      shippingCost: validatedData.shippingCost,
      taxAmount: validatedData.taxAmount,
      discount: validatedData.discount,
      promoCode: validatedData.promoCode,
      statusHistory: [
        {
          status: "pending",
          timestamp: new Date(),
          note: "Order placed",
        },
      ],
    });

    // Update user's orders array AND clear the cart in one operation
    await User.findByIdAndUpdate(user.id, {
      $push: { orders: order._id },
      $set: { cart: [] }, // Clear the cart as part of order creation
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
