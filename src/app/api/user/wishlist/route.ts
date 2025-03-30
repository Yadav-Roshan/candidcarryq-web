import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/user.model";
import Product from "@/models/product.model";
import { authenticate } from "@/middleware/auth.middleware";
import mongoose from "mongoose";

// GET - Get user's wishlist
export async function GET(request: NextRequest) {
  try {
    // Authentication middleware - updated to use the new format
    const authResult = await authenticate(request);
    if (authResult.status !== 200 || !authResult.user) {
      return NextResponse.json(
        { message: authResult.message || "Unauthorized" },
        { status: authResult.status || 401 }
      );
    }

    const user = authResult.user;

    await connectToDatabase();

    // Get user with populated wishlist
    const userData = await User.findById(user.id).populate({
      path: "wishlist",
      select: "name price image category salePrice stock",
    });

    if (!userData) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Map wishlist to a more friendly format
    const wishlist = userData.wishlist.map((item: any) => ({
      id: item._id.toString(),
      name: item.name,
      price: item.price,
      image: item.image,
      category: item.category,
      salePrice: item.salePrice,
      stock: item.stock || 10, // Add stock information with a default of 10
    }));

    return NextResponse.json({ wishlist });
  } catch (error) {
    console.error("Wishlist fetch error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// POST - Add product to wishlist
export async function POST(request: NextRequest) {
  try {
    // Authentication middleware
    const authResult = await authenticate(request);
    if (authResult.status !== 200 || !authResult.user) {
      return NextResponse.json(
        { message: authResult.message || "Unauthorized" },
        { status: authResult.status || 401 }
      );
    }

    const user = authResult.user;

    // Parse and validate request body
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { message: "Product ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Validate that product exists
    const productExists = await Product.exists({ _id: productId });
    if (!productExists && mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // Add to wishlist if not already there
    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      { $addToSet: { wishlist: productId } }, // $addToSet adds only if not already in the array
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Product added to wishlist",
      wishlistCount: updatedUser.wishlist.length,
    });
  } catch (error) {
    console.error("Wishlist add error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// DELETE - Remove product from wishlist
export async function DELETE(request: NextRequest) {
  try {
    // Authentication middleware
    const authResult = await authenticate(request);
    if (authResult.status !== 200 || !authResult.user) {
      return NextResponse.json(
        { message: authResult.message || "Unauthorized" },
        { status: authResult.status || 401 }
      );
    }

    const user = authResult.user;

    // Parse URL to get product ID
    const url = new URL(request.url);
    const productId = url.searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { message: "Product ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Remove from wishlist
    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      { $pull: { wishlist: productId } }, // $pull removes all instances from the array
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Product removed from wishlist",
      wishlistCount: updatedUser.wishlist.length,
    });
  } catch (error) {
    console.error("Wishlist remove error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
