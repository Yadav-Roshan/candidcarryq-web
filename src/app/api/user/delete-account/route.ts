import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/user.model";
import { authenticate } from "@/middleware/auth.middleware";
import { cleanupAuthData } from "@/lib/server/auth-helpers";

export async function DELETE(request: NextRequest) {
  // Authenticate the request
  const user = await authenticate(request);

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();

    // First clean up related auth data
    await cleanupAuthData(user.email);

    // Delete the user from the database
    const deletedUser = await User.findByIdAndDelete(user.id);

    if (!deletedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
