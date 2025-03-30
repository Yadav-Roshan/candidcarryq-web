import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/user.model';
import { z } from 'zod';

// Validation schema
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phoneNumber: z.string().min(1, "Phone number is required"), // Now required
  address: z.object({
    buildingName: z.string().optional(),
    locality: z.string().optional(),
    wardNo: z.string().optional(),
    postalCode: z.string().optional(),
    district: z.string().optional(),
    province: z.string().optional(),
    country: z.string().optional(),
    landmark: z.string().optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: result.error.format() },
        { status: 400 }
      );
    }

    const { name, email, password, phoneNumber, address } = body;

    // Connect to the database
    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email }, 
        ...(phoneNumber ? [{ phoneNumber }] : [])
      ]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json(
          { message: 'Email already in use' },
          { status: 409 }
        );
      }
      if (phoneNumber && existingUser.phoneNumber === phoneNumber) {
        return NextResponse.json(
          { message: 'Phone number already in use' },
          { status: 409 }
        );
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      address,
      role: 'user' // Default role
    });

    await newUser.save();

    // Generate JWT
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Create a sanitized user object without the password
    const sanitizedUser = {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      phoneNumber: newUser.phoneNumber,
      role: newUser.role,
      address: newUser.address
    };

    return NextResponse.json({
      success: true,
      token,
      user: sanitizedUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
