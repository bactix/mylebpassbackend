import { Schema, model, Document } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  businessName: string;
  discount: number;
  description: string;
  expiryDate: Date;
  maxUsagePerUser: number;
  totalUsageCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    discount: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    description: {
      type: String,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
      index: true,
    },
    maxUsagePerUser: {
      type: Number,
      required: true,
      min: 1,
    },
    totalUsageCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Coupon = model<ICoupon>('Coupon', couponSchema);

export interface CreateCouponInput {
  code: string;
  businessName: string;
  discount: number;
  description: string;
  expiryDate: string;
  maxUsagePerUser: number;
}

export interface UpdateCouponInput {
  description?: string;
  expiryDate?: string;
  maxUsagePerUser?: number;
}

export interface CouponResponse {
  id: string;
  code: string;
  businessName: string;
  discount: number;
  description: string;
  expiryDate: string;
  maxUsagePerUser: number;
  totalUsageCount: number;
  createdAt: string;
  updatedAt: string;
}
