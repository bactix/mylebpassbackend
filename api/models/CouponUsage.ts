import { Schema, model, Document, Types } from 'mongoose';

export interface ICouponUsage extends Document {
  couponId: Types.ObjectId;
  userId: Types.ObjectId;
  businessName: string;
  usedAt: Date;
  createdAt: Date;
}

const couponUsageSchema = new Schema<ICouponUsage>(
  {
    couponId: {
      type: Schema.Types.ObjectId,
      ref: 'Coupon',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    usedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

export const CouponUsage = model<ICouponUsage>('CouponUsage', couponUsageSchema);

export interface CouponUsageResponse {
  id: string;
  couponId: string;
  userId: string;
  businessName: string;
  usedAt: string;
}
