import mongoose from "mongoose";
import Order from "../models/order.model";
import { config } from "dotenv";

// Load environment variables
config();

async function updatePromoCodeDiscount() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "");
    console.log("Connected to MongoDB");

    // Find all orders with a discount but no promoCodeDiscount
    const orders = await Order.find({
      discount: { $exists: true, $ne: null, $gt: 0 },
      promoCodeDiscount: { $exists: false },
    });

    console.log(
      `Found ${orders.length} orders to update with promoCodeDiscount`
    );

    let updatedCount = 0;

    // Update each order
    for (const order of orders) {
      try {
        // Set promoCodeDiscount equal to discount if it's missing
        await Order.updateOne(
          { _id: order._id },
          { $set: { promoCodeDiscount: order.discount } }
        );

        updatedCount++;
      } catch (error) {
        console.error(`Error updating order ${order._id}:`, error);
      }
    }

    console.log(`Successfully updated ${updatedCount} orders`);
  } catch (error) {
    console.error("Migration script error:", error);
  } finally {
    // Close database connection
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the migration
updatePromoCodeDiscount();
