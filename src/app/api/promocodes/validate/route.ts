import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import PromoCode from "@/models/promocode.model";
import { authenticate } from "@/middleware/auth.middleware";
import { z } from "zod";

const validatePromoSchema = z.object({
  code: z.string().min(1),
  cartTotal: z.number().positive(),
  categories: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    // Authentication middleware - users need to be logged in to use promocodes
    const authResult = await authenticate(request);
    if (authResult.status !== 200) {
      return NextResponse.json(
        { message: authResult.message || "Unauthorized" },
        { status: authResult.status }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = validatePromoSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Validation error",
          errors: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { code, cartTotal, categories = [] } = validationResult.data;

    // Find promocode, case-insensitive
    const promocode = await PromoCode.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!promocode) {
      return NextResponse.json(
        { message: "Invalid promo code" },
        { status: 404 }
      );
    }

    // Check validity period
    const now = new Date();
    if (now < promocode.validFrom || now > promocode.validTo) {
      return NextResponse.json(
        { message: "Promo code has expired or is not yet active" },
        { status: 400 }
      );
    }

    // Check if usage limit is reached
    if (
      promocode.usageLimit !== null &&
      promocode.usageCount >= promocode.usageLimit
    ) {
      return NextResponse.json(
        { message: "Promo code usage limit reached" },
        { status: 400 }
      );
    }

    // Check minimum purchase requirement
    if (promocode.minPurchase !== null && cartTotal < promocode.minPurchase) {
      return NextResponse.json(
        {
          message: `Order total must be at least ${promocode.minPurchase} to use this code`,
        },
        { status: 400 }
      );
    }

    // Check category restrictions if any
    const hasCategories =
      promocode.applicableCategories !== null &&
      promocode.applicableCategories.length > 0;
    if (hasCategories && categories.length > 0) {
      // Check if any cart category is in the applicable categories
      const hasMatch = categories.some((category) =>
        promocode.applicableCategories?.includes(category.toLowerCase())
      );

      if (!hasMatch) {
        return NextResponse.json(
          {
            message: "This promo code is not applicable to items in your cart",
          },
          { status: 400 }
        );
      }
    }

    // Calculate discount amount
    let discountAmount = (cartTotal * promocode.discountPercentage) / 100;

    // Apply maximum discount cap if set
    if (promocode.maxDiscount !== null) {
      discountAmount = Math.min(discountAmount, promocode.maxDiscount);
    }

    // Round to 2 decimal places
    discountAmount = Math.round(discountAmount * 100) / 100;

    return NextResponse.json({
      valid: true,
      code: promocode.code,
      discountPercentage: promocode.discountPercentage,
      discountAmount, // This will be used for both discount and promoCodeDiscount
      description: promocode.description,
    });
  } catch (error) {
    console.error("Error validating promocode:", error);
    return NextResponse.json(
      { message: "Error validating promo code" },
      { status: 500 }
    );
  }
}
