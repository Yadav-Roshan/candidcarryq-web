import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/product.model";

/**
 * This script adds warranty and returnPolicy fields to existing product documents
 * Run this script once to update all products in the database
 */
async function migrateProductFields() {
  try {
    console.log("Connecting to database...");
    await connectToDatabase();

    console.log("Finding products without warranty or returnPolicy fields...");

    // Update all products that don't have these fields
    const updateResult = await Product.updateMany(
      {
        $or: [
          { warranty: { $exists: false } },
          { returnPolicy: { $exists: false } },
        ],
      },
      { $set: { warranty: "", returnPolicy: "" } }
    );

    console.log(
      `Migration complete. Updated ${updateResult.modifiedCount} products.`
    );
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

// Execute the migration if this file is run directly
if (require.main === module) {
  migrateProductFields()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default migrateProductFields;
