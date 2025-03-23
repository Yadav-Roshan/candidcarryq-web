import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/middleware/auth.middleware';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/user.model';
import { z } from 'zod';

// GET - Get user profile
export async function GET(request: NextRequest) {
  // Authenticate request
  const user = await authenticate(request);
  
  if (!user) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      avatar: user.avatar,
      address: user.address
    }
  });
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  // Authenticate request
  const user = await authenticate(request);
  
  if (!user) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    const body = await request.json();
    
    // Validate update data
    const updateSchema = z.object({
      name: z.string().min(2).optional(),
      email: z.string().email().optional(),
      phoneNumber: z.string().optional().nullable(),
      avatar: z.string().optional().nullable(),
    });
    
    const result = updateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: result.error.format() },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    // If email is being updated, check if it's already in use
    if (body.email && body.email !== user.email) {
      const existingUser = await User.findOne({ email: body.email });
      if (existingUser) {
        return NextResponse.json(
          { message: 'Email already in use' },
          { status: 409 }
        );
      }
    }
    
    // If phone is being updated, check if it's already in use
    if (body.phoneNumber && body.phoneNumber !== user.phoneNumber) {
      const existingUser = await User.findOne({ phoneNumber: body.phoneNumber });
      if (existingUser) {
        return NextResponse.json(
          { message: 'Phone number already in use' },
          { status: 409 }
        );
      }
    }
    
    // Update user in database
    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      { $set: body },
      { new: true, runValidators: true }
    ).select('-password');
    
    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        address: updatedUser.address
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
