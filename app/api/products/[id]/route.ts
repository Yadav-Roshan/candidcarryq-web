import { NextResponse } from 'next/server';
import { mockProducts } from '@/lib/api';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const product = mockProducts.find(product => product.id === params.id);
  
  if (!product) {
    return new Response('Product not found', { status: 404 });
  }
  
  // Add a small delay to simulate network latency
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return NextResponse.json(product);
}
