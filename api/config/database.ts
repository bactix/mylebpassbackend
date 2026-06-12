import mongoose from 'mongoose';
import { User, IUser } from '../models/User';
import { NotFoundError } from '../helpers/errors';
import logger from './logger';

export class Database {
  async connect(): Promise<void> {
    try {
      let mongoUrl = process.env.MONGO_URL;

      if (!mongoUrl) {
        logger.info('ℹ MongoDB offline mode - API running without database');
        return;
      }

      logger.info('✓ Connecting to MongoDB');
      await mongoose.connect(mongoUrl, {
        dbName: 'mylebpass',
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS: 30000,
        socketTimeoutMS: 60000,
        retryWrites: true,
      });
      logger.info('✓ Successfully connected to MongoDB');
    } catch (error) {
      logger.warn('⚠ MongoDB connection failed');
      logger.error('Connection error details:', error);
      logger.info('ℹ This is normal for local development without MongoDB');
      logger.info('ℹ Check your MONGO_URL in .env file');
    }
  }

  async disconnect(): Promise<void> {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }

  async createUser(userData: { email: string; password: string; firstName: string; lastName: string }): Promise<IUser> {
    const user = new User(userData);
    await user.save();
    return user;
  }

  async getUserById(id: string): Promise<IUser | null> {
    return await User.findById(id);
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

  async getAllUsers(): Promise<IUser[]> {
    return await User.find();
  }

  async updateUser(id: string, userData: Partial<IUser>): Promise<IUser> {
    const user = await User.findByIdAndUpdate(id, userData, { new: true });
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    const result = await User.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundError('User not found');
    }
  }
}

export const db = new Database();