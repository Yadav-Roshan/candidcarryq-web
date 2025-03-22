import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/user.model';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

// Schema for data validation
const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or phone number is required'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Parse and validate request body
    const body = await request.json();
    const validationResult = loginSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({ 
        message: 'Validation error', 
        errors: validationResult.error.errors 
      }, { status: 400 });
    }
    
    const { identifier, password } = validationResult.data;
    
    // Check if identifier is an email or phone number (basic format check)
    const isEmail = identifier.includes('@');
    
    // Find user by email or phone number
    let user;
    if (isEmail) {
      user = await User.findOne({ email: identifier }).select('+password');
    } else {
      // Normalize phone number (assuming phone numbers are stored with +)
      const phoneNumber = identifier.startsWith('+') ? identifier : `+${identifier}`;
      user = await User.findOne({ phoneNumber }).select('+password');
    }
    
    // Check if user exists and password is correct
    if (!user || !(await user.comparePassword(password))) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    // Return user data without password
    const userWithoutPassword = user.toJSON();
    
    return NextResponse.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
