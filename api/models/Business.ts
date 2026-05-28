import { Schema, model, Document } from 'mongoose';

export type BusinessType = 'restaurant' | 'hotel' | 'other';
export type BusinessModel = 'unlimited' | 'limited';
export type LebanesCity =
  | 'Beirut'
  | 'Tripoli'
  | 'Sidon'
  | 'Tyre'
  | 'Zahle'
  | 'Jounieh'
  | 'Baalbek'
  | 'Nabatieh'
  | 'Byblos'
  | 'Aley'
  | 'Chouf'
  | 'Bint Jbeil';

export interface IBusiness extends Document {
  name: string;
  type: BusinessType;
  email: string;
  password: string;
  phone: string;
  ownerName: string;
  city: LebanesCity;
  businessModel: BusinessModel;
  usageLimit?: number;
  createdAt: Date;
  updatedAt: Date;
}

const businessSchema = new Schema<IBusiness>(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['restaurant', 'hotel', 'other'],
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    ownerName: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
      index: true,
    },
    businessModel: {
      type: String,
      enum: ['unlimited', 'limited'],
      required: true,
    },
    usageLimit: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

export const Business = model<IBusiness>('Business', businessSchema);

export interface CreateBusinessInput {
  name: string;
  type: BusinessType;
  email: string;
  password: string;
  phone: string;
  ownerName: string;
  city: LebanesCity;
  businessModel: BusinessModel;
  usageLimit?: number;
}

export interface UpdateBusinessInput {
  name?: string;
  type?: BusinessType;
  phone?: string;
  ownerName?: string;
  usageLimit?: number;
}

export interface BusinessResponse {
  id: string;
  name: string;
  type: BusinessType;
  email: string;
  phone: string;
  ownerName: string;
  city: LebanesCity;
  businessModel: BusinessModel;
  usageLimit?: number;
  couponsCount?: number;
  totalUsageCount?: number;
  createdAt: string;
  updatedAt: string;
}
