import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // For product API routes, add cache-control headers
  if (request.nextUrl.pathname.startsWith('/api/products') ||
      request.nextUrl.pathname.startsWith('/api/admin/products')) {
    const response = NextResponse.next();
    
    // Add cache-busting headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  }
  
  return NextResponse.next();
}

// Specify which routes this middleware applies to
export const config = {
  matcher: ['/api/products/:path*', '/api/admin/products/:path*'],
};
