import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  category: string;
  image: string;
  images?: string[];
  colors?: string[];
  sizes?: string[];
  material?: string;
  dimensions?: string;
  weight?: string;
  capacity?: string;
  fullDescription?: string;
  rating?: number;
  reviewCount?: number;
  featured: boolean;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide product description'],
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide product price'],
      min: [0, 'Price must be a positive number'],
    },
    salePrice: {
      type: Number,
      min: [0, 'Sale price must be a positive number'],
    },
    category: {
      type: String,
      required: [true, 'Please provide product category'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Please provide product image'],
    },
    images: [String],
    colors: [String],
    sizes: [String],
    material: String,
    dimensions: String,
    weight: String,
    capacity: String,
    fullDescription: String,
    rating: {
      type: Number,
      min: [0, 'Rating must be at least 0'],
      max: [5, 'Rating cannot be more than 5'],
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    stock: {
      type: Number,
      required: [true, 'Please provide product stock'],
      min: [0, 'Stock must be a positive number'],
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for searching
ProductSchema.index({ name: 'text', description: 'text', category: 'text' });

export default mongoose.models.Product || 
  mongoose.model<IProduct>('Product', ProductSchema);
