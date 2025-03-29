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
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    wardNo?: string;
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
  discount?: number;
  promoCode?: string;
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
      street: {
        type: String,
        required: [true, "Street address is required"],
      },
      city: {
        type: String,
        required: [true, "City is required"],
      },
      state: {
        type: String,
        required: [true, "State is required"],
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
    trackingNumber: String,
    transactionRef: String,
    paymentProofImage: String,
    delivererName: String,
    delivererPhone: String,
    deliveryOtp: String,
    shippingCost: {
      type: Number,
      default: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    discount: Number,
    promoCode: String,
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
