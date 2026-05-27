import { ValidationError } from '../helpers/errors';
import { CreateUserInput, UpdateUserInput } from '../models/User';

export class UserValidation {
  static validateCreateUser(data: CreateUserInput): void {
    if (!data.email || !this.isValidEmail(data.email)) {
      throw new ValidationError('Invalid email format');
    }

    if (!data.password || data.password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters');
    }

    if (!data.firstName || data.firstName.trim().length === 0) {
      throw new ValidationError('First name is required');
    }

    if (!data.lastName || data.lastName.trim().length === 0) {
      throw new ValidationError('Last name is required');
    }
  }

  static validateUpdateUser(data: UpdateUserInput): void {
    if (data.email && !this.isValidEmail(data.email)) {
      throw new ValidationError('Invalid email format');
    }

    if (data.firstName !== undefined && data.firstName.trim().length === 0) {
      throw new ValidationError('First name cannot be empty');
    }

    if (data.lastName !== undefined && data.lastName.trim().length === 0) {
      throw new ValidationError('Last name cannot be empty');
    }
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
