import mongoose, { Schema, Document, Types } from "mongoose";

interface IOrderItem {
  product: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  image: string;
  color?: string;
  size?: string;
}

// Status history entry interface
interface IStatusHistoryEntry {
  status: string;
  timestamp: Date;
  note?: string;
}

export interface IOrder extends Document {
  user: Types.ObjectId;
  orderNumber: string;
  items: IOrderItem[];
  totalAmount: number;
  shippingAddress: {
    phoneNumber: string;
    buildingName?: string;
    locality: string;
    wardNo?: string;
    postalCode: string;
    district: string;
    province: string;
    country: string;
    landmark?: string;
  };
  paymentMethod: string;
  paymentStatus: "pending" | "verified" | "rejected" | "completed" | "failed";
  orderStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  trackingNumber?: string;
  transactionRef?: string;
  paymentProofImage?: string;
  delivererName?: string;
  delivererPhone?: string;
  deliveryOtp?: string;
  shippingCost: number;
  taxAmount: number;
  discount: number;
  promoCode: string | null;
  promoCodeDiscount: number;
  notes?: string;
  statusHistory: IStatusHistoryEntry[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: [true, "Product ID is required"],
        },
        name: {
          type: String,
          required: [true, "Product name is required"],
        },
        price: {
          type: Number,
          required: [true, "Product price is required"],
        },
        quantity: {
          type: Number,
          required: [true, "Product quantity is required"],
          min: [1, "Quantity must be at least 1"],
        },
        image: String,
        color: String,
        size: String,
      },
    ],
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
    },
    shippingAddress: {
      phoneNumber: {
        type: String,
        required: [true, "Phone number is required"],
      },
      buildingName: String,
      locality: {
        type: String,
        required: [true, "Locality/Area is required"],
      },
      district: {
        type: String,
        required: [true, "District is required"],
      },
      province: {
        type: String,
        required: [true, "Province is required"],
      },
      postalCode: {
        type: String,
        required: [true, "Postal code is required"],
      },
      country: {
        type: String,
        required: [true, "Country is required"],
        default: "Nepal",
      },
      wardNo: String,
      landmark: String,
    },
    paymentMethod: {
      type: String,
      required: [true, "Payment method is required"],
      enum: ["cash", "esewa", "khalti", "card", "mobile_banking"],
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "verified", "rejected", "completed", "failed"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    trackingNumber: {
      type: String,
    },
    transactionRef: String,
    paymentProofImage: String,
    delivererName: {
      type: String,
    },
    delivererPhone: {
      type: String,
    },
    deliveryOtp: {
      type: String,
    },
    shippingCost: {
      type: Number,
      default: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
      required: false, // Make this field optional
    },
    discount: {
      type: Number,
      default: 0,
    },
    promoCode: {
      type: String,
      default: null,
    },
    promoCodeDiscount: {
      type: Number,
      default: 0,
    },
    notes: String,
    statusHistory: [
      {
        status: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        note: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Order ||
  mongoose.model<IOrder>("Order", OrderSchema);
