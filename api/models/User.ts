import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  type: 'user';
  status: 'active' | 'inactive' | 'pending';
  startDate: Date;
  expiryDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
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
      required: false,
    },
    phone: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['user'],
      default: 'user',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'pending',
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
    expiryDate: {
      type: Date,
      required: true,
      index: true,
      default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  },
  {
    timestamps: true,
  }
);

export const User = model<IUser>('User', userSchema);

export interface CreateUserInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  status?: 'active' | 'inactive' | 'pending';
}

export interface UpdateUserInput {
  name?: string;
  phone?: string;
  password?: string;
  status?: 'active' | 'inactive' | 'pending';
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'pending';
  startDate: string;
  expiryDate: string;
  createdAt: string;
  updatedAt: string;
}
