import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import PromoCode from "@/models/promocode.model";
import { authenticate, isAdmin } from "@/middleware/auth.middleware";
import { z } from "zod";
import mongoose from "mongoose";

const updatePromoCodeSchema = z.object({
  description: z.string().min(5, "Description is required").optional(),
  discountPercentage: z.number().min(1).max(100).optional(),
  maxDiscount: z.number().nullable().optional(),
  minPurchase: z.number().nullable().optional(),
  validFrom: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Valid from date is invalid",
    })
    .optional(),
  validTo: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Valid to date is invalid",
    })
    .optional(),
  isActive: z.boolean().optional(),
  applicableCategories: z.array(z.string()).nullable().optional(),
  usageLimit: z.number().nullable().optional(),
});

// Function to validate MongoDB ObjectId
function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET - Get single promocode (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Validate id
    if (!isValidObjectId(params.id)) {
      return NextResponse.json(
        { message: "Invalid promocode ID" },
        { status: 400 }
      );
    }

    // Get promocode
    const promocode = await PromoCode.findById(params.id);
    if (!promocode) {
      return NextResponse.json(
        { message: "Promo code not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ promocode });
  } catch (error) {
    console.error(`Error fetching promocode ${params.id}:`, error);
    return NextResponse.json(
      { message: "Error fetching promocode" },
      { status: 500 }
    );
  }
}

// PUT - Update promocode (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Validate id
    if (!isValidObjectId(params.id)) {
      return NextResponse.json(
        { message: "Invalid promocode ID" },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updatePromoCodeSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Validation error",
          errors: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Process dates correctly
    const updateData: any = { ...data };
    if (data.validFrom) {
      updateData.validFrom = new Date(data.validFrom);
    }
    if (data.validTo) {
      updateData.validTo = new Date(data.validTo);
    }

    // Update promocode
    const updatedPromoCode = await PromoCode.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    );

    if (!updatedPromoCode) {
      return NextResponse.json(
        { message: "Promo code not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Promo code updated successfully",
      promocode: updatedPromoCode,
    });
  } catch (error) {
    console.error(`Error updating promocode ${params.id}:`, error);
    return NextResponse.json(
      { message: "Error updating promocode" },
      { status: 500 }
    );
  }
}

// DELETE - Delete promocode (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Validate id
    if (!isValidObjectId(params.id)) {
      return NextResponse.json(
        { message: "Invalid promocode ID" },
        { status: 400 }
      );
    }

    // Delete promocode
    const result = await PromoCode.findByIdAndDelete(params.id);
    if (!result) {
      return NextResponse.json(
        { message: "Promo code not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Promo code deleted successfully",
    });
  } catch (error) {
    console.error(`Error deleting promocode ${params.id}:`, error);
    return NextResponse.json(
      { message: "Error deleting promocode" },
      { status: 500 }
    );
  }
}
