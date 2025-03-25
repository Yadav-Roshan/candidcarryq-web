import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { message: "Google client ID not configured" },
      { status: 500 }
    );
  }

  // Get the current host from request headers
  const host = request.headers.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const redirectUri = `${protocol}://${host}/api/auth/google/callback`;

  // Add a debugging message
  console.log(`Redirect URI: ${redirectUri}`);

  // Construct Google OAuth URL
  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.append("client_id", clientId);
  googleAuthUrl.searchParams.append("redirect_uri", redirectUri);
  googleAuthUrl.searchParams.append("response_type", "code");
  googleAuthUrl.searchParams.append("scope", "profile email");
  googleAuthUrl.searchParams.append("prompt", "select_account");
  googleAuthUrl.searchParams.append("access_type", "offline");

  // Log the full URL for debugging
  console.log(`Redirecting to: ${googleAuthUrl.toString()}`);

  // Redirect to Google auth
  return NextResponse.redirect(googleAuthUrl.toString());
}
