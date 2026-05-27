import mongoose from 'mongoose';
import { User, IUser } from '../models/User';
import { NotFoundError } from '../helpers/errors';
import logger from './logger';

export class Database {
  async connect(): Promise<void> {
    try {
      // Build MongoDB URL based on environment
      let mongoUrl = process.env.MONGO_URL;

      // If Railway environment variables are present, use them
      if (process.env.RAILWAY_PRIVATE_DOMAIN) {
        mongoUrl = `mongodb://${process.env.MONGOUSER}:${process.env.MONGOPASSWORD}@${process.env.RAILWAY_PRIVATE_DOMAIN}:27017`;
        logger.info('Using Railway MongoDB connection');
      } else if (!mongoUrl) {
        mongoUrl = 'mongodb://mongo:password@localhost:27017';
      }

      await mongoose.connect(mongoUrl, {
        dbName: 'mylebpass',
        serverSelectionTimeoutMS: 5000,
      });
      logger.info('Connected to MongoDB');
    } catch (error) {
      logger.warn('MongoDB connection failed - running in memory mode');
      logger.debug('Connection error:', error);
      logger.warn('For Railway deployment: Ensure environment variables are set');
      logger.warn('For local development: You can ignore this warning');
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
