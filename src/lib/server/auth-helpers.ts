import { connectToDatabase } from "../mongodb";
import mongoose from "mongoose";

/**
 * Clean up all auth-related data for a user
 * This can be called from various places when a user cancels registration
 * or deletes their account
 */
export async function cleanupAuthData(email: string) {
  if (!email) return false;

  try {
    await connectToDatabase();
    const db = mongoose.connection.db;

    if (!db) return false;

    console.log(`Starting cleanup for user: ${email}`);

    // Clean up sessions collection
    try {
      const result = await db.collection("sessions").deleteMany({
        "session.user.email": email,
      });
      console.log(`Cleaned up ${result.deletedCount} sessions for ${email}`);
    } catch (error) {
      console.error("Error cleaning sessions:", error);
    }

    // Clean up accounts collection
    try {
      const result = await db.collection("accounts").deleteMany({
        email,
      });
      console.log(`Cleaned up ${result.deletedCount} accounts for ${email}`);
    } catch (error) {
      console.error("Error cleaning accounts:", error);
    }

    // Clean up user orders (if your app has an orders collection)
    try {
      const user = await db.collection("users").findOne({ email });
      if (user) {
        await db.collection("orders").deleteMany({
          userId: user._id.toString(),
        });
        console.log(`Cleaned up orders for user: ${email}`);
      }
    } catch (error) {
      console.error("Error cleaning orders:", error);
    }

    // We'll delete the actual user record from the /api/user/delete-account endpoint
    // rather than here, since we need to first authenticate the request

    return true;
  } catch (error) {
    console.error("Error in cleanupAuthData:", error);
    return false;
  }
}
