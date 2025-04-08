import { MetadataRoute } from 'next'
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/product.model";
import mongoose from "mongoose";

// Define interface for the product document with the fields we need
interface ProductDocument {
  _id: mongoose.Types.ObjectId;
  updatedAt?: Date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://candidcarryq.com';
  
  // Add static routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ];
  
  // Get category routes
  const categories = ['backpacks', 'handbags', 'wallets', 'travel', 'accessories'];
  const categoryRoutes = categories.map(category => ({
    url: `${baseUrl}/categories/${category}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));
  
  // Get dynamic product routes
  let productRoutes: MetadataRoute.Sitemap = [];
  
  try {
    await connectToDatabase();
    const products = await Product.find({}, { _id: 1, updatedAt: 1 }) as ProductDocument[];
    
    productRoutes = products.map(product => ({
      url: `${baseUrl}/products/${product._id.toString()}`,
      lastModified: product.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Failed to generate product sitemap entries:', error);
  }
  
  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
