import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Announcement from '@/models/announcement.model';
import { authenticate, isAdmin } from '@/middleware/auth.middleware';
import { z } from 'zod';

// Schema for creating announcement
const announcementSchema = z.object({
  text: z.string().min(5, 'Text must be at least 5 characters'),
  link: z.string().url('Link must be a valid URL').optional(),
  active: z.boolean().default(true),
  startDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  endDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
});

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const url = new URL(request.url);
    const all = url.searchParams.get('all');
    
    let query = {};
    if (all !== 'true') {
      // For public API, only return active announcements
      query = { 
        active: true,
        $or: [
          { startDate: { $exists: false } },
          { startDate: { $lte: new Date() } }
        ],
        $or: [
          { endDate: { $exists: false } },
          { endDate: { $gte: new Date() } }
        ]
      };
    }
    
    const announcements = await Announcement.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

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
    const validationResult = announcementSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({ 
        message: 'Validation error', 
        errors: validationResult.error.errors 
      }, { status: 400 });
    }
    
    // Create announcement
    const announcement = await Announcement.create(validationResult.data);
    
    return NextResponse.json({
      message: 'Announcement created successfully',
      announcement,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating announcement:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
