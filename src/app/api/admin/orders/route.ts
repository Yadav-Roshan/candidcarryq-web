import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/order.model";
import { authenticate, isAdmin } from "@/middleware/auth.middleware";

// GET - Get all orders with pagination and filtering (admin only)
export async function GET(request: NextRequest) {
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

    // Admin check
    if (!isAdmin(user)) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    // Parse query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const status = url.searchParams.get("status");

    // Build query
    const query: any = {};

    // Filter by status if provided
    if (status && status !== "all") {
      // Check if it's a payment status or order status
      if (["pending", "verified", "rejected"].includes(status)) {
        query.paymentStatus = status;
      } else {
        query.orderStatus = status;
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await Order.countDocuments(query);

    // Get orders with pagination
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "user",
        select: "name email",
      })
      .lean();

    // Calculate total pages
    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      orders,
      pagination: {
        total,
        page,
        limit,
        pages,
      },
    });
  } catch (error) {
    console.error("Admin orders API error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
