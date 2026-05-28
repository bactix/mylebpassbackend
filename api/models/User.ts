import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  status: 'active' | 'inactive';
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
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
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
  password: string;
  phone: string;
  status?: 'active' | 'inactive';
}

export interface UpdateUserInput {
  name?: string;
  phone?: string;
  status?: 'active' | 'inactive';
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  startDate: string;
  expiryDate: string;
  createdAt: string;
  updatedAt: string;
}
