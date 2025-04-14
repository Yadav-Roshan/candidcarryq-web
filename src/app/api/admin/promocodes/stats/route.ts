import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/order.model";
import PromoCode from "@/models/promocode.model";
import { authenticate, isAdmin } from "@/middleware/auth.middleware";

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

    // Admin check
    if (!isAdmin(authResult.user)) {
      return NextResponse.json(
        { message: "Access denied - Admin only" },
        { status: 403 }
      );
    }

    // Get stats for each promo code
    const promoCodesWithStats = await PromoCode.find().sort({ createdAt: -1 });

    // Get aggregate data from orders
    const orderStats = await Order.aggregate([
      {
        $match: {
          promoCode: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: "$promoCode",
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          totalDiscount: { $sum: "$promoCodeDiscount" }, // Use promoCodeDiscount for accuracy
        },
      },
    ]);

    // Create a map for quick lookup
    const statsMap = orderStats.reduce((acc: Record<string, any>, curr) => {
      acc[curr._id] = curr;
      return acc;
    }, {});

    // Combine data
    const result = promoCodesWithStats.map((code) => {
      const stats = statsMap[code.code] || {
        totalOrders: 0,
        totalRevenue: 0,
        totalDiscount: 0,
      };

      return {
        id: code._id,
        code: code.code,
        description: code.description,
        discountPercentage: code.discountPercentage,
        isActive: code.isActive,
        validFrom: code.validFrom,
        validTo: code.validTo,
        usageCount: code.usageCount,
        usageLimit: code.usageLimit,
        totalOrders: stats.totalOrders,
        totalRevenue: stats.totalRevenue,
        totalDiscount: stats.totalDiscount,
      };
    });

    return NextResponse.json({ stats: result });
  } catch (error) {
    console.error("Error fetching promocode stats:", error);
    return NextResponse.json(
      { message: "Error fetching promocode stats" },
      { status: 500 }
    );
  }
}
