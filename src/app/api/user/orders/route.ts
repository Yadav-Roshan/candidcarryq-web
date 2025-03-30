import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/order.model";
import PromoCode from "@/models/promocode.model"; // Add import for PromoCode
import User from "@/models/user.model";
import { authenticate } from "@/middleware/auth.middleware";
import { z } from "zod";

// Define order schema for validation with relaxed validation
const orderItemSchema = z.object({
  product: z.string(),
  name: z.string(),
  price: z.number().positive(), // This now represents the effective price (sale price if exists, otherwise regular price)
  originalPrice: z.number().positive().optional(), // Add this field to track original price before sale
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
  promoCode: z.string().optional().nullable(), // Added for promocode
});

// Define interface for OrderItem from the database schema
interface OrderItem {
  product: any; // MongoDB ObjectId or string
  name: string;
  price: number;
  quantity: number;
  image: string;
  color?: string;
  size?: string;
}

// GET - Get user's orders
export async function GET(request: NextRequest) {
  try {
    // Authentication middleware
    const authResult = await authenticate(request);
    if (authResult.status !== 200 || !authResult.user) {
      return NextResponse.json(
        { message: authResult.message || "Unauthorized" },
        { status: authResult.status || 401 }
      );
    }

    const userId = authResult.user.id;

    await connectToDatabase();

    // Ensure we include all necessary fields in the projection, especially delivererName and delivererPhone
    const orders = await Order.find({ user: userId })
      .select(
        "orderNumber createdAt totalAmount items orderStatus paymentStatus shippingAddress paymentMethod transactionRef shippingCost taxAmount discount promoCode statusHistory trackingNumber deliveryOtp delivererName delivererPhone promoCodeDiscount"
      )
      .sort({ createdAt: -1 });

    // Transform to client-friendly format
    const formattedOrders = orders.map((order) => ({
      id: order._id.toString(),
      orderNumber: order.orderNumber,
      date: order.createdAt,
      status: order.orderStatus,
      total: order.totalAmount,
      items: order.items.map((item: OrderItem) => ({
        id: item.product.toString(),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      transactionRef: order.transactionRef,
      shippingCost: order.shippingCost,
      taxAmount: order.taxAmount,
      discount: order.discount,
      promoCode: order.promoCode,
      promoCodeDiscount: order.promoCodeDiscount, // Include promoCodeDiscount in response
      statusHistory: order.statusHistory,
      trackingNumber: order.trackingNumber,
      deliveryOtp: order.deliveryOtp,
      // Ensure these fields are explicitly included in the response
      delivererName: order.delivererName,
      delivererPhone: order.delivererPhone,
    }));

    // Add logging to help debug
    console.log(
      "Order with courier details:",
      formattedOrders.find(
        (o) => o.status === "shipped" && (o.delivererName || o.delivererPhone)
      )
    );

    return NextResponse.json({ orders: formattedOrders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { message: "Error fetching orders" },
      { status: 500 }
    );
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
    // Use new address format directly instead of converting from old format
    const addressData = {
      phoneNumber: validatedData.shippingAddress.phoneNumber,
      buildingName: validatedData.shippingAddress.buildingName,
      locality: validatedData.shippingAddress.locality,
      wardNo: validatedData.shippingAddress.wardNo,
      postalCode: validatedData.shippingAddress.postalCode,
      district: validatedData.shippingAddress.district,
      province: validatedData.shippingAddress.province,
      country: validatedData.shippingAddress.country || "Nepal",
      landmark: validatedData.shippingAddress.landmark,
    };

    // Check and apply promocode if provided
    let discountAmount = validatedData.discount || 0;
    let promoCodeUsed = null;

    if (validatedData.promoCode) {
      const promoCode = await PromoCode.findOne({
        code: validatedData.promoCode.toUpperCase(),
        isActive: true,
      });

      if (promoCode) {
        // Increment usage count
        promoCode.usageCount += 1;
        await promoCode.save();
        promoCodeUsed = promoCode.code;
      }
    }

    // Create order with the updated address format
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
      discount: discountAmount,
      promoCode: promoCodeUsed,
      promoCodeDiscount: discountAmount, // Ensure promoCodeDiscount is set correctly
      statusHistory: [
        {
          status: "pending",
          timestamp: new Date(),
          note: "Order placed with CandidCarryq",
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
