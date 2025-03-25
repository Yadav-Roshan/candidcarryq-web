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

// Authenticate user middleware
export async function authenticate(req: NextRequest) {
  const token = getToken(req);
  if (!token) {
    return null;
  }

  const decoded = verifyToken(token);
  if (!decoded || typeof decoded !== "object") {
    return null;
  }

  try {
    await connectToDatabase();
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return null;
    }

    // Ensure the user has authenticated with Google
    if (user.authProvider !== "google" || !user.googleId) {
      console.warn(
        "User attempted to access a resource without Google authentication"
      );
      return null;
    }

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber || undefined,
      avatar: user.avatar || undefined,
      address: user.address || undefined,
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}

// Check if user is admin
export function isAdmin(user: any) {
  return user?.role === "admin";
}
