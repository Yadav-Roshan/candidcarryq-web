import { NextRequest, NextResponse } from "next/server";
import { authenticate, isAdmin } from "@/middleware/auth.middleware";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/product.model";

export async function POST(request: NextRequest) {
  try {
    // Authentication and admin check
    const user = await authenticate(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { message: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    // Parse request body to get migration type
    const body = await request.json();
    const { migrationType } = body;

    if (migrationType === "product-fields") {
      await connectToDatabase();

      // Find products missing warranty or returnPolicy
      const missingFields = await Product.countDocuments({
        $or: [
          { warranty: { $exists: false } },
          { returnPolicy: { $exists: false } },
        ],
      });

      // Update all products that don't have these fields
      const updateResult = await Product.updateMany(
        {
          $or: [
            { warranty: { $exists: false } },
            { returnPolicy: { $exists: false } },
          ],
        },
        { $set: { warranty: "", returnPolicy: "" } }
      );

      return NextResponse.json({
        message: "Migration completed successfully",
        details: {
          type: "product-fields",
          missingFields,
          updated: updateResult.modifiedCount,
        },
      });
    }

    return NextResponse.json(
      { message: "Invalid migration type" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { message: "Migration failed", error: String(error) },
      { status: 500 }
    );
  }
}
