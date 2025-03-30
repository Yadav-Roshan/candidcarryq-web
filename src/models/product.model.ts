import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  category: string;
  image: string;
  images: string[];
  imagePublicIds: string[]; // Store Cloudinary public IDs for deletion
  colors?: string[];
  sizes?: string[];
  material?: string;
  dimensions?: string;
  weight?: string;
  capacity?: string;
  fullDescription?: string;
  featured: boolean;
  stock: number;
  rating: number;
  reviewCount: number;
  publishedDate: Date;
  updatedAt?: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Product name must be at least 2 characters"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      minlength: [10, "Description must be at least 10 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    salePrice: {
      type: Number,
      min: [0, "Sale price cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      lowercase: true,
    },
    image: {
      type: String,
      required: [true, "Main product image is required"],
    },
    images: {
      type: [String],
      validate: [
        function (val: string[]) {
          return val.length >= 1 && val.length <= 3;
        },
        "Product must have 1-3 images",
      ],
    },
    imagePublicIds: {
      type: [String],
      default: [],
    },
    colors: {
      type: [String],
    },
    sizes: {
      type: [String],
    },
    material: {
      type: String,
    },
    dimensions: {
      type: String,
    },
    weight: {
      type: String,
    },
    capacity: {
      type: String,
    },
    fullDescription: {
      type: String,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be negative"],
      max: [5, "Rating cannot be more than 5"],
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    publishedDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Create or get the model
const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema);

export default Product;
