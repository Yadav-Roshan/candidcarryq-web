import "server-only";
import { cache } from "react";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/product.model";
import mongoose from "mongoose";

// Define interface for ProductDocument
interface ProductDocument {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  category: string;
  image: string;
  images?: string[];
  colors?: string[];
  material?: string;
  rating?: number;
  reviewCount?: number;
  stock: number;
  featured?: boolean;
  fullDescription?: string;
  dimensions?: string;
  weight?: string;
  capacity?: string;
  sizes?: string[];
}

// Helper to check if ID is a valid MongoDB ObjectId
function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

// Server-side only functions with cache
export async function getAllProducts(filters = {}) {
  // Add cache control headers to prevent caching
  const cacheOptions = { next: { revalidate: 0 } };

  try {
    await connectToDatabase();

    console.log("Connecting to database to fetch products...");
    console.log("Database connection successful");

    // Handle params that might be a promise
    const params =
      filters instanceof Promise ? await filters : filters;

    // Now safely access properties
    const page = Number(params?.page) || 1;
    const limit = Number(params?.limit) || 100; // Increase default limit to get more products
    const category = params?.category;
    const sort = params?.sort || "newest";
    const minPrice = params?.minPrice ? Number(params.minPrice) : undefined;
    const maxPrice = params?.maxPrice ? Number(params.maxPrice) : undefined;
    const colors = params?.colors ? params.colors.split(",") : undefined;
    const materials = params?.materials
      ? params.materials.split(",")
      : undefined;

    // Build query
    const query: any = {};
    if (category) query.category = category;

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = minPrice;
      if (maxPrice !== undefined) query.price.$lte = maxPrice;
    }

    // Colors filter
    if (colors && colors.length > 0) {
      query.colors = { $in: colors.map((c: string) => new RegExp(c, "i")) };
    }

    // Materials filter
    if (materials && materials.length > 0) {
      query.material = {
        $in: materials.map((m: string) => new RegExp(m, "i")),
      };
    }

    console.log("Product query:", JSON.stringify(query));

    // Determine sort order
    let sortOption = {};
    switch (sort) {
      case "price-low":
        sortOption = { price: 1 };
        break;
      case "price-high":
        sortOption = { price: -1 };
        break;
      case "name-asc":
        sortOption = { name: 1 };
        break;
      case "name-desc":
        sortOption = { name: -1 };
        break;
      default:
        sortOption = { createdAt: -1 }; // newest first
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;

    console.log("Executing product query with pagination:", { skip, limit });
    const products = (await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)) as ProductDocument[];

    console.log(`Found ${products.length} products in database`);

    if (products.length === 0) {
      console.log("No products found in database");
      return []; // Return empty array instead of mock data
    }

    return products.map((product) => ({
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      salePrice: product.salePrice || undefined,
      category: product.category,
      image: product.image,
      images: product.images || undefined,
      colors: product.colors || undefined,
      material: product.material || undefined,
      rating: product.rating || undefined,
      reviewCount: product.reviewCount || undefined,
      stock: product.stock || 0,
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    return []; // Return empty array instead of mock data
  }
}

export const getProductById = cache(async (id: string) => {
  try {
    await connectToDatabase();

    // Check if the ID is a valid MongoDB ObjectId
    if (!isValidObjectId(id)) {
      console.log(`Product ID ${id} is not a valid ObjectId`);
      return null; // Return null instead of checking mock data
    }

    const product = (await Product.findById(id)) as ProductDocument | null;

    if (!product) {
      console.log(`Product ${id} not found`);
      return null; // Return null instead of checking mock data
    }

    return {
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      fullDescription: product.fullDescription || undefined,
      price: product.price,
      salePrice: product.salePrice || undefined,
      category: product.category,
      image: product.image,
      images: product.images || undefined,
      colors: product.colors || undefined,
      sizes: product.sizes || undefined,
      material: product.material || undefined,
      dimensions: product.dimensions || undefined,
      weight: product.weight || undefined,
      capacity: product.capacity || undefined,
      rating: product.rating || undefined,
      reviewCount: product.reviewCount || undefined,
      stock: product.stock || 0,
    };
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null; // Return null instead of checking mock data
  }
});

export const getFeaturedProducts = cache(async () => {
  try {
    await connectToDatabase();

    const featuredProducts = (await Product.find({ featured: true }).limit(
      8
    )) as ProductDocument[];

    if (featuredProducts.length === 0) {
      // Return empty array if no featured products in DB
      return [];
    }

    return featuredProducts.map((product) => ({
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      salePrice: product.salePrice || undefined,
      category: product.category,
      image: product.image,
      rating: product.rating || undefined,
      reviewCount: product.reviewCount || undefined,
      stock: product.stock || 0,
    }));
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return []; // Return empty array instead of mock data
  }
});
