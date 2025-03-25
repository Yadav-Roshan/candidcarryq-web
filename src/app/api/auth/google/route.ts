import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/user.model";

// Initialize Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { message: "Google token is required" },
        { status: 400 }
      );
    }

    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return NextResponse.json(
        { message: "Invalid Google token" },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Check if user exists by either email or googleId
    let user = await User.findOne({
      $or: [{ email: payload.email }, { googleId: payload.sub }],
    });

    if (user) {
      console.log(`User already exists: ${user.email}`);

      // If user exists but googleId doesn't match, update it
      if (user.googleId !== payload.sub) {
        console.log(`Updating existing user with new googleId: ${payload.sub}`);
        user.googleId = payload.sub;
        user.authProvider = "google";
        await user.save();
      }

      // Update avatar if it has changed
      if (user.avatar !== payload.picture) {
        user.avatar = payload.picture;
        await user.save();
      }

      // Preserve existing phone number and address
      // No need to modify these for existing users
    } else {
      // Create new user only if they don't exist
      console.log(`Creating new user: ${payload.email}`);
      user = new User({
        name: payload.name,
        email: payload.email,
        googleId: payload.sub,
        authProvider: "google",
        emailVerified: true,
        avatar: payload.picture,
        role: "user",
        // phoneNumber and address will be undefined for new users
        // They can be set later in the profile settings
      });

      await user.save();
    }

    // Generate JWT
    const authToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" }
    );

    // Create a sanitized user object without sensitive data
    const sanitizedUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber || undefined,
      role: user.role,
      avatar: user.avatar || payload.picture || undefined,
      address: user.address || undefined,
    };

    return NextResponse.json({
      success: true,
      token: authToken,
      user: sanitizedUser,
    });
  } catch (error) {
    console.error("Google authentication error:", error);
    return NextResponse.json(
      { message: "Authentication failed" },
      { status: 500 }
    );
  }
}
