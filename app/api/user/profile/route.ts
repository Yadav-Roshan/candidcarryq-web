import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/user.model';
import { authenticate } from '@/middleware/auth.middleware';
import { z } from 'zod';

// Schema for updating user profile
const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  avatar: z.string().url('Avatar must be a valid URL').optional(),
});

// Schema for updating password
const updatePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Authentication middleware
    const authResult = await authenticate(request);
    if (authResult.status !== 200) {
      return authResult;
    }
    
    return NextResponse.json(authResult.user);
  } catch (error) {
    console.error('User API error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

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
    const validationResult = updateProfileSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({ 
        message: 'Validation error', 
        errors: validationResult.error.errors 
      }, { status: 400 });
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      validationResult.data,
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('User API error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
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
    const validationResult = updatePasswordSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({ 
        message: 'Validation error', 
        errors: validationResult.error.errors 
      }, { status: 400 });
    }
    
    const { currentPassword, newPassword } = validationResult.data;
    
    // Get user with password
    const userWithPassword = await User.findById(user._id).select('+password');
    
    // Check if current password is correct
    const isPasswordCorrect = await userWithPassword.comparePassword(currentPassword);
    if (!isPasswordCorrect) {
      return NextResponse.json({ message: 'Current password is incorrect' }, { status: 400 });
    }
    
    // Update password
    userWithPassword.password = newPassword;
    await userWithPassword.save();
    
    return NextResponse.json({
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('User API error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
