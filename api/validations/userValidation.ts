import { ValidationError } from '../helpers/errors';
import { CreateUserInput, UpdateUserInput } from '../models/User';

export class UserValidation {
  static validateCreateUser(data: CreateUserInput): void {
    if (!data.name || data.name.trim().length === 0) {
      throw new ValidationError('Name is required');
    }

    if (!data.email || !this.isValidEmail(data.email)) {
      throw new ValidationError('Invalid email format');
    }

    if (!data.phone || !this.isValidLebanesPhone(data.phone)) {
      throw new ValidationError('Invalid phone number. Format: 3 000 000 or 3000000');
    }

    if (!data.password || data.password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long');
    }

    if (data.status && !['active', 'inactive'].includes(data.status)) {
      throw new ValidationError('Status must be either "active" or "inactive"');
    }
  }

  static validateUpdateUser(data: UpdateUserInput): void {
    if (data.name !== undefined && data.name.trim().length === 0) {
      throw new ValidationError('Name cannot be empty');
    }

    if (data.email !== undefined && !this.isValidEmail(data.email)) {
      throw new ValidationError('Invalid email format');
    }

    if (data.phone !== undefined && !this.isValidLebanesPhone(data.phone)) {
      throw new ValidationError('Invalid phone number. Format: 3 000 000 or 3000000');
    }

    if (data.password !== undefined && data.password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long');
    }

    if (data.status !== undefined && !['active', 'inactive'].includes(data.status)) {
      throw new ValidationError('Status must be either "active" or "inactive"');
    }

    if (data.startDate !== undefined && isNaN(new Date(data.startDate).getTime())) {
      throw new ValidationError('Invalid start date');
    }
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private static isValidLebanesPhone(phone: string): boolean {
    const phoneRegex = /^(\d{1} \d{3} \d{4}|\d{8})$/;
    return phoneRegex.test(phone);
  }
}
