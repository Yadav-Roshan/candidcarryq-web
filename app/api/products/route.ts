import { NextResponse } from 'next/server';
import { mockProducts } from '@/lib/api';

export async function GET(request: Request) {
  // Parse the URL to get query parameters
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const sort = searchParams.get('sort');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');

  // Filter by category if provided
  let filteredProducts = category 
    ? mockProducts.filter(product => product.category === category)
    : [...mockProducts];

  // Sort products
  if (sort === "price-low") {
    filteredProducts.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
  } else if (sort === "price-high") {
    filteredProducts.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
  } else if (sort === "rating") {
    filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (sort === "popular") {
    filteredProducts.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
  }
  
  // Implement pagination
  const start = (page - 1) * limit;
  const paginatedProducts = filteredProducts.slice(start, start + limit);
  
  // Add a small delay to simulate network latency
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return NextResponse.json(paginatedProducts);
}
