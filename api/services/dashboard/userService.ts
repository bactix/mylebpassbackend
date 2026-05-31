import bcrypt from 'bcryptjs';
import { User, CreateUserInput, UpdateUserInput, UserResponse } from '../../models/User';
import { UserValidation } from '../../validations/userValidation';
import { ConflictError, NotFoundError } from '../../helpers/errors';
import logger from '../../config/logger';

export class UserService {
  async createUser(data: CreateUserInput): Promise<UserResponse> {
    UserValidation.validateCreateUser(data);

    const existingUser = await User.findOne({ email: data.email.toLowerCase() });
    if (existingUser) {
      throw new ConflictError('Email already exists');
    }

    const now = new Date();
    const expiryDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = new User({
      name: data.name,
      email: data.email.toLowerCase(),
      password: hashedPassword,
      phone: data.phone,
      status: data.status || 'active',
      startDate: now,
      expiryDate,
    });

    await user.save();
    logger.info(`User created: ${user.email}`);
    return this.mapToResponse(user);
  }

  async getUser(id: string): Promise<UserResponse> {
    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return this.mapToResponse(user);
  }

  async getAllUsers(page: number = 1, limit: number = 20, status?: string): Promise<{ data: UserResponse[]; pagination: any }> {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (status) {
      query.status = status;
    }

    const users = await User.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });
    const total = await User.countDocuments(query);

    return {
      data: users.map(u => this.mapToResponse(u)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async updateUser(id: string, data: UpdateUserInput): Promise<UserResponse> {
    UserValidation.validateUpdateUser(data);

    const user = await User.findByIdAndUpdate(id, data, { new: true });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    logger.info(`User updated: ${user.email}`);
    return this.mapToResponse(user);
  }

  async renewUser(id: string): Promise<UserResponse> {
    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const expiryDate = new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000);
    user.expiryDate = expiryDate;
    await user.save();

    logger.info(`User subscription renewed: ${user.email}`);
    return this.mapToResponse(user);
  }

  async deleteUser(id: string): Promise<UserResponse> {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    logger.info(`User deleted: ${user.email}`);
    return this.mapToResponse(user);
  }

  private mapToResponse(user: any): UserResponse {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      status: user.status,
      startDate: user.startDate.toISOString(),
      expiryDate: user.expiryDate.toISOString(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}

export const userService = new UserService();
