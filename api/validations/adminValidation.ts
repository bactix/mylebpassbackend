import { ValidationError } from '../helpers/errors';
import { CreateAdminInput, UpdateAdminInput } from '../models/Admin';

export class AdminValidation {
  static validateCreateAdmin(data: CreateAdminInput): void {
    if (!data.email || !this.isValidEmail(data.email)) {
      throw new ValidationError('Invalid email format');
    }

    if (!data.password || data.password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }
  }

  static validateUpdateAdmin(data: UpdateAdminInput): void {
    if (data.email !== undefined && !this.isValidEmail(data.email)) {
      throw new ValidationError('Invalid email format');
    }

    if (data.password !== undefined && data.password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
