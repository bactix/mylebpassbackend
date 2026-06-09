import { Schema, model, Document } from 'mongoose';

export interface ITokenBlacklist extends Document {
  token: string;
  userId: string;
  email: string;
  expiresAt: Date;
  createdAt: Date;
}

const tokenBlacklistSchema = new Schema<ITokenBlacklist>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
      expires: 86400,
    },
  },
  {
    timestamps: true,
  }
);

export const TokenBlacklist = model<ITokenBlacklist>('TokenBlacklist', tokenBlacklistSchema);
