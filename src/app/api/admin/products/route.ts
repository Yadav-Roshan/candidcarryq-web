import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/product.model';
import { authenticate } from '@/middleware/auth.middleware';

// GET all products for admin (with pagination)
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Authentication
    const authResult = await authenticate(request);
    
    // Check if authentication returned a NextResponse (error)
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    // Admin check
    if (authResult.user.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden - Admin access required' }, { status: 403 });
    }
    
    // Get query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    // Fetch products with pagination
    const products = await Product.find().skip(skip).limit(limit).sort({ createdAt: -1 });
    const total = await Product.countDocuments();
    
    return NextResponse.json({
      products: products.map(product => ({
        id: product._id.toString(),
        name: product.name,
        price: product.price,
        salePrice: product.salePrice,
        category: product.category,
        image: product.image,
        stock: product.stock,
        featured: product.featured || false,
        createdAt: product.createdAt,
      })),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching admin products:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
