import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/product.model";
import Review from "@/models/review.model";
import { authenticate } from "@/middleware/auth.middleware";
import { z } from "zod";
import mongoose from "mongoose";
import { mockProducts } from "@/lib/api-mock-data";

// Schema for creating a review
const reviewSchema = z.object({
  rating: z.number().min(1, "Please provide a rating").max(5),
  comment: z.string().min(3, "Comment must be at least 3 characters"),
});

// GET - Get reviews for a product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await connectToDatabase();

    // Make sure params is resolved before accessing its properties
    const resolvedParams = params instanceof Promise ? await params : params;
    const productId = id;

    // Check if it's a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      // For mock products, return mock reviews
      return NextResponse.json([]);
    }

    // Get reviews, sorted by most recent first
    const reviews = await Review.find({ product: productId })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 });

    // Transform reviews to a frontend-friendly format
    const formattedReviews = reviews.map((review) => ({
      id: review._id.toString(),
      userId: review.user._id.toString(),
      userName: review.user.name,
      userAvatar: review.user.avatar || null,
      rating: review.rating,
      comment: review.comment,
      helpful: review.helpful,
      createdAt: review.createdAt,
    }));

    return NextResponse.json(formattedReviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// POST - Create a new review
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    // Authentication check
    const authResult = await authenticate(request);
    if (authResult.status !== 200 || !authResult.user) {
      return NextResponse.json(
        { message: authResult.message || "Unauthorized" },
        { status: authResult.status || 401 }
      );
    }

    const user = authResult.user;

    // Make sure params is resolved before accessing its properties
    const { id } = await params;
    const productId = id;

    // Check if product exists (handle both MongoDB and mock data)
    let productExists = false;

    if (mongoose.Types.ObjectId.isValid(productId)) {
      const dbProduct = await Product.findById(productId);
      if (dbProduct) productExists = true;
    } else {
      // Check in mock products
      const mockProduct = mockProducts.find((p) => p.id === productId);
      if (mockProduct) productExists = true;
    }

    if (!productExists) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // Check if user has already reviewed this product
    if (mongoose.Types.ObjectId.isValid(productId)) {
      const existingReview = await Review.findOne({
        product: productId,
        user: user.id,
      });

      if (existingReview) {
        return NextResponse.json(
          { message: "You have already reviewed this product" },
          { status: 400 }
        );
      }
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = reviewSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Validation error",
          errors: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    // Create review if using MongoDB
    let review;
    const reviewData = validationResult.data;

    if (mongoose.Types.ObjectId.isValid(productId)) {
      review = await Review.create({
        product: productId,
        user: user.id,
        rating: reviewData.rating,
        comment: reviewData.comment,
      });

      // Update product rating and review count
      const allReviews = await Review.find({ product: productId });
      const totalRating = allReviews.reduce((sum, rev) => sum + rev.rating, 0);
      const averageRating = totalRating / allReviews.length;

      await Product.findByIdAndUpdate(productId, {
        rating: averageRating,
        reviewCount: allReviews.length,
      });
    } else {
      // For mock products, just return a success response
      review = {
        _id: "mock-review-" + Date.now(),
        rating: reviewData.rating,
        comment: reviewData.comment,
        createdAt: new Date(),
      };
    }

    return NextResponse.json(
      {
        message: "Review submitted successfully",
        review: {
          id: review._id.toString(),
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
