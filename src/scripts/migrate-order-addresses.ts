import mongoose from "mongoose";
import Order from "../models/order.model";
import { config } from "dotenv";

// Load environment variables
config();

async function migrateOrderAddresses() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "");
    console.log("Connected to MongoDB");

    // Find all orders
    const orders = await Order.find({});
    console.log(`Found ${orders.length} orders to update`);

    let updatedCount = 0;

    // Update each order
    for (const order of orders) {
      // Check if the order has the old address structure
      if (
        order.shippingAddress &&
        order.shippingAddress.street &&
        order.shippingAddress.city &&
        order.shippingAddress.state
      ) {
        try {
          // Convert old format to new format
          const updatedAddress = {
            phoneNumber: order.shippingAddress.phoneNumber || "Not provided", // Default value if missing
            buildingName: undefined, // Not available in old structure
            locality: order.shippingAddress.street,
            wardNo: order.shippingAddress.wardNo,
            postalCode: order.shippingAddress.postalCode,
            district: order.shippingAddress.city,
            province: order.shippingAddress.state,
            country: order.shippingAddress.country,
            landmark: order.shippingAddress.landmark,
          };

          // Update the order with new address structure
          await Order.updateOne(
            { _id: order._id },
            { $set: { shippingAddress: updatedAddress } }
          );

          updatedCount++;
        } catch (error) {
          console.error(`Error updating order ${order._id}:`, error);
        }
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
migrateOrderAddresses();
