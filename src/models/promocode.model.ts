import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPromoCode extends Document {
  code: string;
  description: string;
  discountPercentage: number;
  maxDiscount: number | null;
  minPurchase: number | null;
  validFrom: Date;
  validTo: Date;
  isActive: boolean;
  applicableCategories: string[] | null; // null means applicable to all
  usageLimit: number | null; // null means unlimited
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const promoCodeSchema = new Schema<IPromoCode>(
  {
    code: {
      type: String,
      required: [true, "Promo code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    discountPercentage: {
      type: Number,
      required: [true, "Discount percentage is required"],
      min: [0, "Discount cannot be negative"],
      max: [100, "Discount cannot exceed 100%"],
    },
    maxDiscount: {
      type: Number,
      default: null, // No maximum if null
    },
    minPurchase: {
      type: Number,
      default: null, // No minimum if null
    },
    validFrom: {
      type: Date,
      required: [true, "Start date is required"],
    },
    validTo: {
      type: Date,
      required: [true, "End date is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    applicableCategories: {
      type: [String], // null means applicable to all categories
      default: null,
    },
    usageLimit: {
      type: Number,
      default: null, // Unlimited if null
    },
    usageCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Create or get the model
const PromoCode: Model<IPromoCode> =
  mongoose.models.PromoCode ||
  mongoose.model<IPromoCode>("PromoCode", promoCodeSchema);

export default PromoCode;
