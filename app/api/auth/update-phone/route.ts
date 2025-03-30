import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/user.model';
import { authenticate } from '@/middleware/auth.middleware';
import { z } from 'zod';

// Schema for phone validation
const phoneSchema = z.object({
  phoneNumber: z.string()
    .regex(/^\+[1-9]\d{1,14}$/, 'Phone number must be in international format (e.g., +1234567890)')
});

export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Authentication middleware
    const authResult = await authenticate(request);
    if (authResult.status !== 200) {
      return authResult;
    }
    
    const user = authResult.user;
    
    // Parse and validate request body
    const body = await request.json();
    const validationResult = phoneSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({ 
        message: 'Validation error', 
        errors: validationResult.error.errors 
      }, { status: 400 });
    }
    
    const { phoneNumber } = validationResult.data;
    
    // Check if phone number is already in use
    const existingUserWithPhone = await User.findOne({ phoneNumber });
    if (existingUserWithPhone && existingUserWithPhone._id.toString() !== user._id.toString()) {
      return NextResponse.json({ 
        message: 'Phone number already in use by another account' 
      }, { status: 400 });
    }
    
    // Update user's phone number
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { phoneNumber },
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      message: 'Phone number updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Phone update error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
