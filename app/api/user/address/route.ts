import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/middleware/auth.middleware';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/user.model';
import { z } from 'zod';

// Address validation schema
const addressSchema = z.object({
  buildingName: z.string().optional(),
  locality: z.string().min(1, "Locality is required"),
  wardNo: z.string().optional(),
  postalCode: z.string().min(1, "Postal code is required"),
  district: z.string().min(1, "District is required"),
  province: z.string().min(1, "Province is required"),
  country: z.string().min(1, "Country is required"),
  landmark: z.string().optional(),
});

// GET - Get user address
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
    address: user.address || null
  });
}

// PUT - Update user address
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
    
    // Validate address data
    const result = addressSchema.safeParse(body.address);
    if (!result.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: result.error.format() },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    // Update user's address in database
    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      { $set: { address: body.address } },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'Address updated successfully',
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
    console.error('Address update error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove user address
export async function DELETE(request: NextRequest) {
  // Authenticate request
  const user = await authenticate(request);
  
  if (!user) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    await connectToDatabase();
    
    // Remove user's address from database
    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      { $unset: { address: 1 } },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'Address removed successfully',
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
    console.error('Address delete error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
