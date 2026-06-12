import { Schema, model, Document, Types } from 'mongoose';

export interface IDiscount extends Document {
  userId: Types.ObjectId;
  businessId: Types.ObjectId;
  discountedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const discountSchema = new Schema<IDiscount>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    discountedAt: {
      type: Date,
      required: true,
      default: () => new Date(),
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Discount = model<IDiscount>('Discount', discountSchema);

export interface RecordDiscountInput {
  // The business is taken from the authenticated JWT; the member's id comes
  // from the scanned QR code.
  userId: string;
}

export interface DiscountResponse {
  id: string;
  userId: string;
  businessId: string;
  discountedAt: string;
  createdAt: string;
  updatedAt: string;
}
