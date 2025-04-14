import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import PromoCode from "@/models/promocode.model";
import { authenticate, isAdmin } from "@/middleware/auth.middleware";
import { z } from "zod";

const promoCodeSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").max(20),
  description: z.string().min(5, "Description is required"),
  discountPercentage: z.number().min(1).max(100),
  maxDiscount: z.number().nullable(),
  minPurchase: z.number().nullable(),
  validFrom: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Valid from date is invalid",
  }),
  validTo: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Valid to date is invalid",
  }),
  isActive: z.boolean(),
  applicableCategories: z.array(z.string()).nullable(),
  usageLimit: z.number().nullable(),
});

// GET - Get all promocodes (admin only)
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

    // Get all promocodes
    const promocodes = await PromoCode.find().sort({ createdAt: -1 });

    return NextResponse.json({ promocodes });
  } catch (error) {
    console.error("Error fetching promocodes:", error);
    return NextResponse.json(
      { message: "Error fetching promocodes" },
      { status: 500 }
    );
  }
}

// POST - Create new promocode (admin only)
export async function POST(request: NextRequest) {
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

    // Parse and validate request body
    const body = await request.json();
    const validationResult = promoCodeSchema.safeParse(body);

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

    // Check if promocode already exists
    const existingCode = await PromoCode.findOne({
      code: data.code.toUpperCase(),
    });
    if (existingCode) {
      return NextResponse.json(
        { message: "Promo code already exists" },
        { status: 400 }
      );
    }

    // Create new promocode
    const promocode = await PromoCode.create({
      ...data,
      code: data.code.toUpperCase(),
      validFrom: new Date(data.validFrom),
      validTo: new Date(data.validTo),
      usageCount: 0,
    });

    return NextResponse.json(
      {
        message: "Promo code created successfully",
        promocode,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating promocode:", error);
    return NextResponse.json(
      { message: "Error creating promocode" },
      { status: 500 }
    );
  }
}
