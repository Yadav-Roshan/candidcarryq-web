import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User, { IUser } from '@/models/user.model';
import { connectToDatabase } from '@/lib/mongodb';

interface DecodedToken {
  userId: string;
  iat: number;
  exp: number;
}

export async function authenticate(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Check for token in headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Authentication required' }, 
        { status: 401 }
      );
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { message: 'Authentication required' }, 
        { status: 401 }
      );
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET as string
      ) as DecodedToken;
      
      // Find user from token
      const user = await User.findById(decoded.userId);
      if (!user) {
        return NextResponse.json(
          { message: 'Invalid token' }, 
          { status: 401 }
        );
      }
      
      // Return success with user
      return { status: 200, user };
    } catch (error) {
      return NextResponse.json(
        { message: 'Invalid token' }, 
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: 'Server error' }, 
      { status: 500 }
    );
  }
}

export async function isAdmin(request: NextRequest, user: IUser) {
  try {
    if (!user) {
      return NextResponse.json(
        { message: 'Authentication required' }, 
        { status: 401 }
      );
    }
    
    if (user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Access denied. Admin only.' }, 
        { status: 403 }
      );
    }
    
    // Return success
    return { status: 200 };
  } catch (error) {
    return NextResponse.json(
      { message: 'Server error' }, 
      { status: 500 }
    );
  }
}
