import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { authenticate, isAdmin } from "@/middleware/auth.middleware";
import Product from "@/models/product.model";
import Order from "@/models/order.model";
import User from "@/models/user.model";

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

    // Get total products count
    const totalProducts = await Product.countDocuments();

    // Get total orders count
    const totalOrders = await Order.countDocuments();

    // Get total customers (users who placed at least one order)
    const totalCustomers = await User.countDocuments({
      role: "user",
      // Only count users who have placed at least one order
      orders: { $exists: true, $not: { $size: 0 } },
    });

    // Get revenue from delivered orders only
    const revenueResult = await Order.aggregate([
      {
        $match: {
          orderStatus: "delivered",
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

    const totalRevenue =
      revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    return NextResponse.json({
      totalProducts,
      totalOrders,
      totalCustomers,
      totalRevenue,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
