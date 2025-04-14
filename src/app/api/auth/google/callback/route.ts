import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/user.model";

// Define interface for Google user info
interface GoogleUserInfo {
  sub: string;
  name: string;
  email: string;
  picture: string;
  email_verified?: boolean;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", request.url));
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("Missing Google OAuth credentials");
    }

    // Get the current host from request headers
    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const redirectUri = `${protocol}://${host}/api/auth/google/callback`;

    // Create OAuth client
    const oAuth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);

    // Get tokens
    const tokenResponse = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokenResponse.tokens);

    // Get user info
    const userInfoResponse = await oAuth2Client.request({
      url: "https://www.googleapis.com/oauth2/v3/userinfo",
    });

    const userInfo = userInfoResponse.data as GoogleUserInfo;

    // Connect to database
    await connectToDatabase();

    // Check if user exists by either email or googleId
    let user = await User.findOne({
      $or: [{ email: userInfo.email }, { googleId: userInfo.sub }],
    });

    if (user) {
      console.log(`User already exists: ${user.email}`);

      // If user exists but googleId doesn't match (rare case), update it
      if (user.googleId !== userInfo.sub) {
        console.log(
          `Updating existing user with new googleId: ${userInfo.sub}`
        );
        user.googleId = userInfo.sub;
        user.authProvider = "google";
        await user.save();
      }

      // Update avatar if it has changed
      if (user.avatar !== userInfo.picture) {
        user.avatar = userInfo.picture;
        await user.save();
      }

      // Preserve existing phone number and address
      // No need to modify these fields for existing users
    } else {
      // Create new user only if they don't exist
      console.log(`Creating new user: ${userInfo.email}`);
      user = new User({
        name: userInfo.name,
        email: userInfo.email,
        googleId: userInfo.sub,
        authProvider: "google",
        emailVerified: true,
        avatar: userInfo.picture,
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

    // Set cookie with token
    const response = NextResponse.redirect(new URL("/account", request.url));

    // Create JWT cookie for client-side usage
    response.cookies.set("auth_token", authToken, {
      httpOnly: false, // Let JavaScript access it
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/login?error=auth_failed", request.url)
    );
  }
}
