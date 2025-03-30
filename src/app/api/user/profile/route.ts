import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/middleware/auth.middleware";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/user.model";
import { z } from "zod";

// GET - Get user profile
export async function GET(request: NextRequest) {
  // Authenticate request with updated format check
  const authResult = await authenticate(request);

  if (authResult.status !== 200) {
    return NextResponse.json(
      { message: authResult.message || "Unauthorized" },
      { status: authResult.status }
    );
  }

  return NextResponse.json({
    user: authResult.user,
  });
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  // Authenticate request with updated format check
  const authResult = await authenticate(request);

  if (authResult.status !== 200) {
    return NextResponse.json(
      { message: authResult.message || "Unauthorized" },
      { status: authResult.status }
    );
  }

  const user = authResult.user;

  try {
    const body = await request.json();

    // Validate update data with improved phone validation
    const updateSchema = z.object({
      name: z.string().min(2).optional(),
      email: z.string().email().optional(),
      phoneNumber: z
        .string()
        .regex(
          /^\+?[0-9]{10,15}$/,
          "Phone number must be a valid international format"
        )
        .optional()
        .nullable(),
      avatar: z.string().optional().nullable(),
    });

    const result = updateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: result.error.format() },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // If email is being updated, check if it's already in use
    if (body.email && body.email !== user.email) {
      const existingUser = await User.findOne({ email: body.email });
      if (existingUser) {
        return NextResponse.json(
          { message: "Email already in use" },
          { status: 409 }
        );
      }
    }

    // If phone is being updated, ensure proper format and check if it's already in use
    if (body.phoneNumber && body.phoneNumber !== user.phoneNumber) {
      // Ensure phone number starts with a plus sign for international format
      if (!body.phoneNumber.startsWith("+")) {
        body.phoneNumber = `+${body.phoneNumber}`;
      }

      const existingUser = await User.findOne({
        phoneNumber: body.phoneNumber,
      });
      if (existingUser && existingUser._id.toString() !== user.id) {
        return NextResponse.json(
          { message: "Phone number already in use" },
          { status: 409 }
        );
      }
    }

    // Handle null phoneNumber properly (allow removal)
    if (body.phoneNumber === null) {
      body.phoneNumber = undefined; // MongoDB will unset the field
    }

    // Update user in database
    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      { $set: body },
      { new: true, runValidators: true }
    ).select("-password");

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        address: updatedUser.address,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
