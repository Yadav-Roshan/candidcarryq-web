import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/order.model";
import { authenticate, isAdmin } from "@/middleware/auth.middleware";

// GET - Get order summary statistics (admin only)
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Authentication middleware
    const authResult = await authenticate(request);
    if (!authResult || authResult.status !== 200) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = authResult.user;

    // Admin check
    if (!isAdmin(user)) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    // Gather order statistics
    const totalOrders = await Order.countDocuments();

    // Count by payment status
    const pendingPayment = await Order.countDocuments({
      paymentStatus: "pending",
    });

    // Count by order status
    const processing = await Order.countDocuments({
      orderStatus: "processing",
    });
    const shipped = await Order.countDocuments({ orderStatus: "shipped" });
    const delivered = await Order.countDocuments({ orderStatus: "delivered" });
    const cancelled = await Order.countDocuments({ orderStatus: "cancelled" });

    // Calculate total revenue from verified and delivered orders
    const revenueResult = await Order.aggregate([
      {
        $match: {
          paymentStatus: "verified",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    const revenue =
      revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    return NextResponse.json({
      totalOrders,
      pendingPayment,
      processing,
      shipped,
      delivered,
      cancelled,
      revenue,
    });
  } catch (error) {
    console.error("Order summary API error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
