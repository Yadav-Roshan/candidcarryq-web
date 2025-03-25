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
  authProvider: "google";
  emailVerified: boolean;
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
      required: true,
      unique: true,
    },
    authProvider: {
      type: String,
      enum: ["google"],
      default: "google",
    },
    emailVerified: {
      type: Boolean,
      default: true, // Google emails are already verified
    },
  },
  {
    timestamps: true,
  }
);

// Use mongoose.models to check if the model is already defined
// This prevents the model from being redefined on hot reloads
const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
