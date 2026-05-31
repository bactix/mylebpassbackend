import { Schema, model, Document } from 'mongoose';

export interface IAdmin extends Document {
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

const adminSchema = new Schema<IAdmin>(
  {
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
  },
  {
    timestamps: true,
  }
);

// Maps to the "admins" collection
export const Admin = model<IAdmin>('Admin', adminSchema);

export interface CreateAdminInput {
  email: string;
  password: string;
}

export interface UpdateAdminInput {
  email?: string;
  password?: string;
}

export interface AdminResponse {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}
