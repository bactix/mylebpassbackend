import { User } from '../models/User';
import { generateId } from '../helpers/generateId';
import { NotFoundError } from '../helpers/errors';

export class Database {
  private users: Map<string, User> = new Map();

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const id = generateId();
    const user: User = {
      ...userData,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updatedUser: User = {
      ...user,
      ...userData,
      id: user.id,
      createdAt: user.createdAt,
      updatedAt: new Date(),
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    if (!this.users.has(id)) {
      throw new NotFoundError('User not found');
    }
    this.users.delete(id);
  }
}

export const db = new Database();
