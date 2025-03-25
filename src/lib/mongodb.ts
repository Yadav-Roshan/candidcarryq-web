import { MongoClient, MongoClientOptions } from "mongodb";
import mongoose from "mongoose";

// Connection state tracking
let isConnected = false;

if (!process.env.MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

const uri = process.env.MONGODB_URI;
const options: MongoClientOptions = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// For Mongoose connection
export async function connectToDatabase() {
  // If already connected, return
  if (isConnected) {
    return;
  }

  // If no connection string is provided, throw an error
  if (!process.env.MONGODB_URI) {
    console.warn(
      "MONGODB_URI not defined in environment variables. Using fallback connection."
    );
  }

  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/candidwear";

  try {
    // Set strictQuery option for compatibility
    mongoose.set("strictQuery", false);

    // Connect to MongoDB
    const db = await mongoose.connect(uri);

    // Update connection state
    isConnected = !!db.connections[0].readyState;

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

export default clientPromise;
