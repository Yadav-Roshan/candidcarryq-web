import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/product.model';
import { authenticate, isAdmin } from '@/middleware/auth.middleware';
import { z } from 'zod';

// Schema for creating product
const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().positive('Price must be positive'),
  salePrice: z.number().positive('Sale price must be positive').optional(),
  category: z.string(),
  image: z.string().url('Image must be a valid URL'),
  images: z.array(z.string().url()).optional(),
  colors: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
  material: z.string().optional(),
  dimensions: z.string().optional(),
  weight: z.string().optional(),
  capacity: z.string().optional(),
  fullDescription: z.string().optional(),
  featured: z.boolean().optional(),
  stock: z.number().int().nonnegative('Stock must be a non-negative integer'),
});

// GET - Get all products (public)
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const url = new URL(request.url);
    
    // Extract query parameters
    const page = url.searchParams.get('page') || '1';
    const limit = url.searchParams.get('limit') || '10';
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search');
    const featured = url.searchParams.get('featured');
    const minPrice = url.searchParams.get('minPrice');
    const maxPrice = url.searchParams.get('maxPrice');
    const sort = url.searchParams.get('sort') || 'newest';
    
    // Build query
    const query: any = {};
    
    // Add filters if provided
    if (category) query.category = category;
    if (featured === 'true') query.featured = true;
    
    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }
    
    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    
    // Prepare sort options
    let sortOption = {};
    switch (sort) {
      case 'price-low':
        sortOption = { price: 1 };
        break;
      case 'price-high':
        sortOption = { price: -1 };
        break;
      case 'name-asc':
        sortOption = { name: 1 };
        break;
      case 'name-desc':
        sortOption = { name: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      default:
        sortOption = { createdAt: -1 }; // newest first
    }
    
    // Execute query with pagination
    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);
    
    // Get total count for pagination
    const totalProducts = await Product.countDocuments(query);
    
    return NextResponse.json({
      products,
      totalPages: Math.ceil(totalProducts / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

// POST - Create new product (admin only)
export async function POST(request: NextRequest) {
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
    const validationResult = productSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({ 
        message: 'Validation error', 
        errors: validationResult.error.errors 
      }, { status: 400 });
    }
    
    // Create product
    const product = await Product.create(validationResult.data);
    
    return NextResponse.json({
      message: 'Product created successfully',
      product,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
