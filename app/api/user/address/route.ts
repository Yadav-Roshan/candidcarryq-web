import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/user.model';
import { authenticate } from '@/middleware/auth.middleware';
import { z } from 'zod';

// Schema for address validation
const addressSchema = z.object({
  buildingName: z.string().optional(),
  locality: z.string().min(1, 'Locality is required'),
  wardNo: z.string().optional(),
  postalCode: z.string().min(1, 'Postal code is required'),
  district: z.string().min(1, 'District is required'),
  province: z.string().min(1, 'Province is required'),
  country: z.string().default('Nepal'),
  landmark: z.string().optional(),
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
    
    if (!body.address) {
      return NextResponse.json({ 
        message: 'Address data is required'
      }, { status: 400 });
    }
    
    const validationResult = addressSchema.safeParse(body.address);
    
    if (!validationResult.success) {
      return NextResponse.json({ 
        message: 'Validation error', 
        errors: validationResult.error.errors 
      }, { status: 400 });
    }
    
    // Update user's address
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { address: validationResult.data },
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      message: 'Address updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Address update error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
