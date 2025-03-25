import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/product.model';
import { authenticate, isAdmin } from '@/middleware/auth.middleware';
import { z } from 'zod';
import mongoose from 'mongoose';
import { mockProducts } from '@/lib/api-mock-data';

// Schema for updating product
const updateProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').optional(),
  price: z.number().positive('Price must be positive').optional(),
  salePrice: z.number().positive('Sale price must be positive').optional().nullable(),
  category: z.string().optional(),
  image: z.string().url('Image must be a valid URL').optional(),
  images: z.array(z.string().url()).optional(),
  colors: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
  material: z.string().optional(),
  dimensions: z.string().optional(),
  weight: z.string().optional(),
  capacity: z.string().optional(),
  fullDescription: z.string().optional(),
  featured: z.boolean().optional(),
  stock: z.number().int().nonnegative('Stock must be a non-negative integer').optional(),
});

// Check if ID is a valid MongoDB ObjectId
function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET - Get single product (public)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const id = params.id;
    
    // Check if ID is a valid MongoDB ObjectId
    if (!isValidObjectId(id)) {
      // If not a valid ObjectId, check mock data
      const mockProduct = mockProducts.find(p => p.id === id);
      if (mockProduct) {
        return NextResponse.json(mockProduct);
      }
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }
    
    const product = await Product.findById(id);
    
    if (!product) {
      // If not found in DB, check mock data
      const mockProduct = mockProducts.find(p => p.id === id);
      if (mockProduct) {
        return NextResponse.json(mockProduct);
      }
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    
    // Fallback to mock data on error
    const mockProduct = mockProducts.find(p => p.id === params.id);
    if (mockProduct) {
      return NextResponse.json(mockProduct);
    }
    
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

// PUT - Update product (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    // Authentication middleware
    const authResult = await authenticate(request);
    if (authResult.status !== 200) {
      return authResult;
    }
    
    // Admin check
    const adminCheckResult = await isAdmin(request, authResult.user);
    if (adminCheckResult.status !== 200) {
      return adminCheckResult;
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateProductSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({ 
        message: 'Validation error', 
        errors: validationResult.error.errors 
      }, { status: 400 });
    }
    
    // Find and update product
    const product = await Product.findByIdAndUpdate(
      params.id,
      validationResult.data,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

// DELETE - Delete product (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    // Authentication middleware
    const authResult = await authenticate(request);
    if (authResult.status !== 200) {
      return authResult;
    }
    
    // Admin check
    const adminCheckResult = await isAdmin(request, authResult.user);
    if (adminCheckResult.status !== 200) {
      return adminCheckResult;
    }
    
    const product = await Product.findByIdAndDelete(params.id);
    
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
