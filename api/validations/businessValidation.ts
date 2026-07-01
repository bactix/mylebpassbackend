import { ValidationError } from '../helpers/errors';
import { CreateBusinessInput, UpdateBusinessInput, LebanesCity } from '../models/Business';

const LEBANESE_CITIES: LebanesCity[] = [
  'Beirut',
  'Tripoli',
  'Sidon',
  'Tyre',
  'Zahle',
  'Jounieh',
  'Baalbek',
  'Nabatieh',
  'Byblos',
  'Aley',
  'Chouf',
  'Bint Jbeil',
];

export class BusinessValidation {
  static validateCreateBusiness(data: CreateBusinessInput): void {
    if (!data.name || data.name.trim().length === 0) {
      throw new ValidationError('Business name is required');
    }

    if (!data.type || !['restaurant', 'hotel', 'spa', 'coffee shop', 'activities', 'other'].includes(data.type)) {
      throw new ValidationError('Type must be one of: restaurant, hotel, spa, coffee shop, activities, other');
    }

    if (data.email !== undefined && data.email !== null && data.email !== '' && !this.isValidEmail(data.email)) {
      throw new ValidationError('Invalid email format');
    }

    if (!data.phone || !this.isValidLebanesPhone(data.phone)) {
      throw new ValidationError('Invalid phone number. Must be 8 digits starting with 03, 70, 71, 72, 73, 76, 78, 79, or 81');
    }

    if (!data.ownerName || data.ownerName.trim().length === 0) {
      throw new ValidationError('Owner name is required');
    }

    if (!data.city || !LEBANESE_CITIES.includes(data.city)) {
      throw new ValidationError(
        `City must be one of: ${LEBANESE_CITIES.join(', ')}`
      );
    }

    if (!data.address || data.address.trim().length === 0) {
      throw new ValidationError('Address is required');
    }

    if (!data.about || data.about.trim().length === 0) {
      throw new ValidationError('About is required');
    }

    if (data.discount !== undefined && !this.isValidDiscount(data.discount)) {
      throw new ValidationError('Discount must be a number between 0 and 100');
    }

    if (!data.password || data.password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long');
    }

    if (data.businessModel !== undefined && !['unlimited', 'limited'].includes(data.businessModel)) {
      throw new ValidationError('Business model must be either "unlimited" or "limited"');
    }

    if (data.businessModel === 'limited') {
      if (!data.usageLimit || data.usageLimit < 1) {
        throw new ValidationError('Usage limit must be at least 1 for limited model');
      }
    } else if (data.businessModel === 'unlimited' && data.usageLimit !== undefined) {
      throw new ValidationError('Usage limit should not be set for unlimited model');
    }
  }

  static validateUpdateBusiness(data: UpdateBusinessInput): void {
    if (data.name !== undefined && data.name.trim().length === 0) {
      throw new ValidationError('Business name cannot be empty');
    }

    if (data.type !== undefined && !['restaurant', 'hotel', 'spa', 'coffee shop', 'activities', 'other'].includes(data.type)) {
      throw new ValidationError('Type must be one of: restaurant, hotel, spa, coffee shop, activities, other');
    }

    if (data.phone !== undefined && !this.isValidLebanesPhone(data.phone)) {
      throw new ValidationError('Invalid phone number. Format: 3 000 000 or 3000000');
    }

    if (data.password !== undefined && data.password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long');
    }

    if (data.ownerName !== undefined && data.ownerName.trim().length === 0) {
      throw new ValidationError('Owner name cannot be empty');
    }

    if (data.city !== undefined && !LEBANESE_CITIES.includes(data.city)) {
      throw new ValidationError(
        `City must be one of: ${LEBANESE_CITIES.join(', ')}`
      );
    }

    if (data.address !== undefined && data.address.trim().length === 0) {
      throw new ValidationError('Address cannot be empty');
    }

    if (data.about !== undefined && data.about.trim().length === 0) {
      throw new ValidationError('About cannot be empty');
    }

    if (data.discount !== undefined && !this.isValidDiscount(data.discount)) {
      throw new ValidationError('Discount must be a number between 0 and 100');
    }

    if (data.usageLimit !== undefined && data.usageLimit < 1) {
      throw new ValidationError('Usage limit must be at least 1');
    }

    if (data.status !== undefined && !['active', 'inactive'].includes(data.status)) {
      throw new ValidationError('Status must be either "active" or "inactive"');
    }
  }

  private static isValidDiscount(discount: number): boolean {
    return typeof discount === 'number' && !isNaN(discount) && discount >= 0 && discount <= 100;
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private static isValidLebanesPhone(phone: string): boolean {
    const phoneRegex = /^(03|70|71|72|73|76|78|79|81)\d{6}$/;
    return phoneRegex.test(phone);
  }
}
