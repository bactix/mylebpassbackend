import { db } from '../config/database';
import { UserValidation } from '../validations/userValidation';
import { ConflictError, NotFoundError } from '../helpers/errors';
import { CreateUserInput, UpdateUserInput, UserResponse, IUser } from '../models/User';
import logger from '../config/logger';

export class UserService {
  async createUser(data: CreateUserInput): Promise<UserResponse> {
    UserValidation.validateCreateUser(data);

    const existingUser = await db.getUserByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    const user = await db.createUser(data);
    logger.info(`User created: ${user._id}`);

    return this.mapToResponse(user);
  }

  async getUserById(id: string): Promise<UserResponse> {
    const user = await db.getUserById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return this.mapToResponse(user);
  }

  async getAllUsers(): Promise<UserResponse[]> {
    const users = await db.getAllUsers();
    return users.map((user) => this.mapToResponse(user));
  }

  async updateUser(id: string, data: UpdateUserInput): Promise<UserResponse> {
    UserValidation.validateUpdateUser(data);

    const user = await db.getUserById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (data.email && data.email !== user.email) {
      const existingUser = await db.getUserByEmail(data.email);
      if (existingUser) {
        throw new ConflictError('Email already in use');
      }
    }

    const updatedUser = await db.updateUser(id, data);
    logger.info(`User updated: ${id}`);

    return this.mapToResponse(updatedUser);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await db.getUserById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    await db.deleteUser(id);
    logger.info(`User deleted: ${id}`);
  }

  private mapToResponse(user: IUser): UserResponse {
    return {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export const userService = new UserService();
