import { Schema, model, Document } from 'mongoose';

export type BusinessType = 'restaurant' | 'hotel' | 'spa' | 'coffee shop' | 'activities' | 'gym' | 'online store' | 'other';
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
  accountType: 'business';
  email?: string;
  password: string;
  phone: string;
  ownerName: string;
  city: LebanesCity;
  address: string;
  about: string;
  discount: number;
  status: 'active' | 'inactive' | 'pending';
  businessModel: BusinessModel;
  usageLimit?: number;
  profilePicture?: string;
  gallery?: string[];
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
      enum: ['restaurant', 'hotel', 'spa', 'coffee shop', 'activities', 'gym', 'online store', 'other'],
      required: true,
      index: true,
    },
    accountType: {
      type: String,
      enum: ['business'],
      default: 'business',
      required: true,
      index: true,
    },
    email: {
      type: String,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      index: true,
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
    address: {
      type: String,
      required: true,
    },
    about: {
      type: String,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'inactive',
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
    profilePicture: {
      type: String,
    },
    gallery: {
      type: [String],
      default: [],
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
  email?: string;
  phone: string;
  ownerName: string;
  city: LebanesCity;
  address: string;
  about: string;
  discount?: number;
  password: string;
  businessModel?: BusinessModel;
  usageLimit?: number;
}

export interface UpdateBusinessInput {
  name?: string;
  type?: BusinessType;
  phone?: string;
  password?: string;
  ownerName?: string;
  city?: LebanesCity;
  address?: string;
  about?: string;
  discount?: number;
  usageLimit?: number;
  status?: 'active' | 'inactive';
}

export interface BusinessResponse {
  id: string;
  name: string;
  type: BusinessType;
  email?: string;
  phone: string;
  ownerName: string;
  city: LebanesCity;
  businessModel: BusinessModel;
  usageLimit?: number;
  address: string;
  about: string;
  discount: number;
  status: 'active' | 'inactive' | 'pending';
  profilePicture: string | null;
  gallery?: string[];
  couponsCount?: number;
  totalUsageCount?: number;
  createdAt: string;
  updatedAt: string;
}
