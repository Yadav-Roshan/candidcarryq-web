import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/user.model";
import Product from "@/models/product.model";
import { authenticate } from "@/middleware/auth.middleware";

// Define interfaces for better type safety with more flexible typing
interface CartItem {
  productId: string;
  quantity: number;
  color?: string;
  size?: string;
}

// Make the cart property optional since we're using select
interface UserData {
  _id: any;
  cart?: CartItem[];
}

// GET - Get user's cart
export async function GET(request: NextRequest) {
  try {
    // Authentication middleware - update to use new response format
    const authResult = await authenticate(request);
    if (authResult.status !== 200 || !authResult.user) {
      return NextResponse.json(
        { message: authResult.message || "Unauthorized" },
        { status: authResult.status || 401 }
      );
    }
    const user = authResult.user;

    await connectToDatabase();

    // Get user with populated cart - fix type casting
    const userData = await User.findById(user.id).select("cart").lean();

    if (!userData) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Safely access cart property with proper typing
    const userCart =
      userData && "cart" in userData
        ? (userData.cart as CartItem[] | undefined)
        : undefined;

    // If user has no cart items, return empty array
    if (!userCart || !Array.isArray(userCart) || userCart.length === 0) {
      return NextResponse.json({ cart: [] });
    }

    // Get product details for all cart items
    const productIds = userCart.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } }).lean();

    // Create a map of product ID to product details
    const productMap = new Map();
    products.forEach((product: any) => {
      productMap.set(product._id.toString(), product);
    });

    // Map cart items with product details
    const cart = userCart
      .map((item: CartItem) => {
        const product = productMap.get(item.productId.toString());
        if (!product) return null; // Skip if product not found

        return {
          id: product._id.toString(),
          name: product.name,
          price: product.price,
          image: product.image,
          salePrice: product.salePrice,
          category: product.category,
          quantity: item.quantity,
          color: item.color,
          size: item.size,
        };
      })
      .filter(Boolean); // Remove any nulls (for deleted products)

    return NextResponse.json({ cart });
  } catch (error) {
    console.error("Cart fetch error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// POST - Add/update cart item or sync cart
export async function POST(request: NextRequest) {
  try {
    // Authentication middleware - update to use new response format
    const authResult = await authenticate(request);
    if (authResult.status !== 200 || !authResult.user) {
      return NextResponse.json(
        { message: authResult.message || "Unauthorized" },
        { status: authResult.status || 401 }
      );
    }
    const user = authResult.user;

    // Parse and validate request body
    const body = await request.json();

    // Handle cart sync case (array of items)
    if (Array.isArray(body)) {
      await connectToDatabase();
      const userData = await User.findById(user.id).select("cart");

      if (!userData) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      }

      // Create a map of existing cart items by product ID
      const existingCartMap = new Map();
      userData.cart.forEach((item: any) => {
        existingCartMap.set(item.productId.toString(), item);
      });

      // Process each item from the request body
      const updatedCart = [];
      for (const item of body) {
        const { productId, quantity, color, size } = item;

        if (!productId || !quantity || quantity < 1) {
          continue; // Skip invalid items
        }

        // Check if product exists
        const productExists = await Product.exists({ _id: productId });
        if (!productExists) continue;

        // If product is already in the cart, use the higher quantity
        const existingItem = existingCartMap.get(productId);
        if (existingItem) {
          updatedCart.push({
            productId,
            quantity: Math.max(existingItem.quantity, quantity),
            color: color || existingItem.color,
            size: size || existingItem.size,
          });
          existingCartMap.delete(productId);
        } else {
          // New item
          updatedCart.push({
            productId,
            quantity,
            color,
            size,
          });
        }
      }

      // Add any remaining existing items that weren't in the request body
      existingCartMap.forEach((item) => {
        updatedCart.push(item);
      });

      // Update the user's cart
      const updatedUser = await User.findByIdAndUpdate(
        user.id,
        { $set: { cart: updatedCart } },
        { new: true }
      );

      return NextResponse.json({
        message: "Cart synchronized successfully",
        cartCount: updatedUser.cart.length,
      });
    }
    // Handle single item case
    else {
      const { productId, quantity, color, size } = body;

      if (!productId || !quantity || quantity < 1) {
        return NextResponse.json(
          { message: "Invalid cart item data" },
          { status: 400 }
        );
      }

      await connectToDatabase();

      // Validate that product exists
      const productExists = await Product.exists({ _id: productId });
      if (!productExists) {
        return NextResponse.json(
          { message: "Product not found" },
          { status: 404 }
        );
      }

      // Check if the item already exists in the cart
      const userData = await User.findById(user.id).select("cart");
      if (!userData) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      }

      // Try to find the item in the cart
      const existingCartItem = userData.cart.find(
        (item: any) => item.productId.toString() === productId
      );

      // Update or add the item
      if (existingCartItem) {
        // Update existing item
        const updatedUser = await User.findOneAndUpdate(
          { _id: user.id, "cart.productId": productId },
          {
            $set: {
              "cart.$.quantity": quantity,
              "cart.$.color": color,
              "cart.$.size": size,
            },
          },
          { new: true }
        );

        return NextResponse.json({
          message: "Cart item updated successfully",
          cartCount: updatedUser.cart.length,
        });
      } else {
        // Add new item
        const newCartItem = {
          productId,
          quantity,
          color,
          size,
        };

        const updatedUser = await User.findByIdAndUpdate(
          user.id,
          { $push: { cart: newCartItem } },
          { new: true }
        );

        return NextResponse.json({
          message: "Product added to cart",
          cartCount: updatedUser.cart.length,
        });
      }
    }

    // Add this missing return statement for the array case too
    return NextResponse.json({
      message: "Cart operation completed",
    });
  } catch (error) {
    console.error("Cart update error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// DELETE - Remove product from cart or clear cart
export async function DELETE(request: NextRequest) {
  try {
    // Authentication middleware - update to use new response format
    const authResult = await authenticate(request);
    if (authResult.status !== 200 || !authResult.user) {
      return NextResponse.json(
        { message: authResult.message || "Unauthorized" },
        { status: authResult.status || 401 }
      );
    }
    const user = authResult.user;

    await connectToDatabase();

    // Parse URL to get info
    const url = new URL(request.url);
    const productId = url.searchParams.get("productId");
    const clearAll = url.searchParams.get("clearAll");

    // Clear entire cart case
    if (clearAll === "true") {
      const updatedUser = await User.findByIdAndUpdate(
        user.id,
        { $set: { cart: [] } },
        { new: true }
      );

      if (!updatedUser) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ message: "Cart cleared successfully" });
    }

    // Remove single product case
    if (!productId) {
      return NextResponse.json(
        { message: "Product ID is required" },
        { status: 400 }
      );
    }

    // Remove from cart
    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      { $pull: { cart: { productId } } },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Product removed from cart",
      cartCount: updatedUser.cart.length,
    });
  } catch (error) {
    console.error("Cart remove error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
