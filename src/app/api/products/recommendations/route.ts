import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/product.model";
import { mockProducts } from "@/lib/api-mock-data";
import mongoose, { Document } from "mongoose";

// Define a ProductDocument interface for proper typing
interface ProductDocument extends Document {
  _id: any;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  category?: string;
  image: string;
  rating?: number;
  reviewCount?: number;
  stock: number;
  featured?: boolean;
}

// Check if ID is a valid MongoDB ObjectId
function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET - Get recommended products based on product ID and category
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const url = new URL(request.url);
    const productId = url.searchParams.get("id");
    const category = url.searchParams.get("category");

    if (!productId) {
      return NextResponse.json(
        { message: "Product ID is required" },
        { status: 400 }
      );
    }

    // If not a valid MongoDB ObjectId, use mock data instead
    if (!isValidObjectId(productId)) {
      console.log(
        `Product ID ${productId} is not a valid ObjectId, using mock data instead`
      );
      const mockRecommendations = mockProducts
        .filter((p) => p.id !== productId)
        .filter((p) => !category || p.category === category)
        .slice(0, 4);

      return NextResponse.json(mockRecommendations);
    }

    // Build query - exclude the current product
    const query: any = { _id: { $ne: productId } };

    // If category is provided, filter by the same category
    if (category) {
      query.category = category;
    }

    // Get recommendations - prefer the same category and featured products
    let recommendations = (await Product.find(query)
      .sort({ featured: -1 }) // Featured products first
      .limit(4)) as ProductDocument[];

    // If not enough recommendations, get more products ignoring category
    if (recommendations.length < 4 && category) {
      const moreProducts = (await Product.find({
        _id: { $ne: productId },
        category: { $ne: category },
      }).limit(4 - recommendations.length)) as ProductDocument[];

      recommendations = [...recommendations, ...moreProducts];
    }

    // If still not enough, return mock data (this is fallback)
    if (recommendations.length === 0) {
      const mockRecommendations = mockProducts
        .filter((p) => p.id !== productId)
        .slice(0, 4);

      return NextResponse.json(mockRecommendations);
    }

    // Transform MongoDB docs to plain objects
    const recommendationsData = recommendations.map((product) => ({
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      salePrice: product.salePrice || undefined,
      category: product.category,
      image: product.image,
      rating: product.rating || undefined,
      reviewCount: product.reviewCount || undefined,
      stock: product.stock || 0,
    }));

    return NextResponse.json(recommendationsData);
  } catch (error) {
    console.error("Error fetching product recommendations:", error);

    // Fallback to mock data
    const mockRecommendations = mockProducts
      .filter(
        (p) => p.id !== String(new URL(request.url).searchParams.get("id"))
      )
      .slice(0, 4);

    return NextResponse.json(mockRecommendations);
  }
}
