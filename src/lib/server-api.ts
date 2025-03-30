import "server-only";
import { cache } from "react";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/product.model";
import mongoose from "mongoose";
import { mockProducts } from "./api-mock-data";

// Helper to check if ID is a valid MongoDB ObjectId
function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

// Server-side only functions with cache
export const getAllProducts = cache(async (params: any = {}) => {
  try {
    await connectToDatabase();

    const { page = 1, limit = 12, category, sort = "newest" } = params;

    // Build query
    const query: any = {};
    if (category) query.category = category;

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
    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    if (products.length === 0) {
      console.log("No products found in database, returning mock data");
      return mockProducts;
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
      rating: product.rating || undefined,
      reviewCount: product.reviewCount || undefined,
      stock: product.stock || 0,
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    return mockProducts;
  }
});

export const getProductById = cache(async (id: string) => {
  try {
    await connectToDatabase();

    // Check if the ID is a valid MongoDB ObjectId
    if (!isValidObjectId(id)) {
      console.log(
        `Product ID ${id} is not a valid ObjectId, checking mock data`
      );
      const mockProduct = mockProducts.find((p) => p.id === id);
      if (!mockProduct) return null;
      return mockProduct;
    }

    const product = await Product.findById(id);

    if (!product) {
      console.log(`Product ${id} not found, checking mock data`);
      const mockProduct = mockProducts.find((p) => p.id === id);
      if (!mockProduct) return null;
      return mockProduct;
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
    const mockProduct = mockProducts.find((p) => p.id === id);
    return mockProduct || null;
  }
});

export const getFeaturedProducts = cache(async () => {
  try {
    await connectToDatabase();

    const featuredProducts = await Product.find({ featured: true }).limit(8);

    if (featuredProducts.length === 0) {
      // Return first 4 mock products if no featured products in DB
      return mockProducts.slice(0, 4);
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
    return mockProducts.slice(0, 4);
  }
});
