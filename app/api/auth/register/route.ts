import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/user.model';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

// Schema for address validation
const addressSchema = z.object({
  buildingName: z.string().optional(),
  locality: z.string().optional(),
  wardNo: z.string().optional(),
  postalCode: z.string().optional(),
  district: z.string().optional(),
  province: z.string().optional(),
  country: z.string().default('Nepal'),
  landmark: z.string().optional(),
}).optional();

// Schema for data validation
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string()
    .regex(/^\+[1-9]\d{1,14}$/, 'Phone number must be in international format (e.g., +1234567890)'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  address: addressSchema,
});

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Parse and validate request body
    const body = await request.json();
    const validationResult = registerSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({ 
        message: 'Validation error', 
        errors: validationResult.error.errors 
      }, { status: 400 });
    }
    
    const { name, email, phoneNumber, password, address } = validationResult.data;
    
    // Check if user already exists with this email
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return NextResponse.json({ message: 'Email already in use' }, { status: 400 });
    }
    
    // Check if user already exists with this phone number (if provided)
    if (phoneNumber) {
      const existingUserByPhone = await User.findOne({ phoneNumber });
      if (existingUserByPhone) {
        return NextResponse.json({ message: 'Phone number already in use' }, { status: 400 });
      }
    }
    
    // Create new user with potential address
    const userData = {
      name,
      email,
      phoneNumber,
      password,
      ...(address && { address }),
    };
    
    const user = await User.create(userData);
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    // Return user data without password
    const userWithoutPassword = user.toJSON();
    
    return NextResponse.json({
      message: 'Registration successful',
      user: userWithoutPassword,
      token,
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
