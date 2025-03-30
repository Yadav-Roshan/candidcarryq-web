import { connectToDatabase } from "../mongodb";
import mongoose from "mongoose";

/**
 * Clean up all auth-related data for a user
 * This can be called from various places when a user cancels registration
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

    // Only clean up incomplete user profiles - don't delete established users
    try {
      const result = await db.collection("users").deleteMany({
        email,
        $or: [
          { profileComplete: false },
          { profileComplete: { $exists: false } },
        ],
      });
      console.log(`Cleaned up ${result.deletedCount} users for ${email}`);
    } catch (error) {
      console.error("Error cleaning users:", error);
    }

    return true;
  } catch (error) {
    console.error("Error in cleanupAuthData:", error);
    return false;
  }
}
