import mongoose, { Schema, Document } from "mongoose";

// Define address schema as a subdocument
const AddressSchema = new Schema(
  {
    buildingName: String,
    locality: String,
    wardNo: String,
    postalCode: String,
    district: String,
    province: String,
    country: String,
    landmark: String,
  },
  { _id: false }
);

// Define cart item schema
const CartItemSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    color: String,
    size: String,
  },
  { _id: false }
);

export interface Address {
  buildingName?: string;
  locality: string;
  wardNo?: string;
  postalCode: string;
  district: string;
  province: string;
  country: string;
  landmark?: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  phoneNumber?: string;
  role: "user" | "admin";
  avatar?: string;
  address?: Address;
  googleId: string;
  authProvider: "local" | "google";
  emailVerified: boolean;
  wishlist?: string[];
  cart?: {
    productId: string;
    quantity: number;
    color?: string;
    size?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Please provide your name"],
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    phoneNumber: {
      type: String,
      unique: true,
      sparse: true, // This allows null/undefined values to not be considered in the uniqueness constraint
      validate: {
        validator: function (v: string) {
          if (!v) return true; // Allow empty values since the field is optional
          // Basic validation for international phone numbers
          return /^\+[1-9]\d{1,14}$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid international phone number!`,
      },
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    avatar: String,
    address: AddressSchema, // Keep the address field
    googleId: {
      type: String,
      sparse: true, // This allows null values while maintaining uniqueness for non-null values
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    // Add wishlist field to store wishlisted product IDs
    wishlist: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    // Add cart field to store cart items
    cart: [CartItemSchema],
  },
  {
    timestamps: true,
  }
);

// Only hash the password if it's new or modified
UserSchema.pre("save", async function (next) {
  // ...existing code...
});

// Use mongoose.models to check if the model is already defined
// This prevents the model from being redefined on hot reloads
const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
