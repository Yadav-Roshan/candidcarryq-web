import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/user.model";

// Function to get token from Authorization header
export function getToken(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.split(" ")[1];
}

// Verify JWT token
export function verifyToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "fallback-secret");
  } catch (error) {
    return null;
  }
}

// Ensure this function properly checks and resolves with the user
export async function authenticate(req: NextRequest) {
  const token = getToken(req);
  if (!token) {
    return { status: 401, message: "No token provided" };
  }

  const decoded = verifyToken(token);

  if (!decoded || typeof decoded !== "object") {
    return { status: 401, message: "Invalid token" };
  }

  try {
    await connectToDatabase();

    // Ensure we're requesting all necessary fields, especially role
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return { status: 404, message: "User not found" };
    }

    // Return user object in consistent format
    return {
      status: 200,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role, // Make sure role is included here
        phoneNumber: user.phoneNumber || undefined,
        avatar: user.avatar || undefined,
        address: user.address || undefined,
      },
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return { status: 500, message: "Server error during authentication" };
  }
}

// Update the isAdmin function to be more robust
export function isAdmin(user: any) {
  // Check if user has role property and it equals 'admin'
  if (!user) return false;

  // Handle different object formats
  const role = user.role || (user.user && user.user.role);

  return role === "admin";
}
