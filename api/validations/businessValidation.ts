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

    if (!data.type || !['restaurant', 'hotel', 'other'].includes(data.type)) {
      throw new ValidationError('Type must be one of: restaurant, hotel, other');
    }

    if (!data.email || !this.isValidEmail(data.email)) {
      throw new ValidationError('Invalid email format');
    }

    if (!data.phone || !this.isValidLebanesPhone(data.phone)) {
      throw new ValidationError('Invalid Lebanese phone number. Format: +961 XXXXXXXX');
    }

    if (!data.ownerName || data.ownerName.trim().length === 0) {
      throw new ValidationError('Owner name is required');
    }

    if (!data.city || !LEBANESE_CITIES.includes(data.city)) {
      throw new ValidationError(
        `City must be one of: ${LEBANESE_CITIES.join(', ')}`
      );
    }

    if (!data.businessModel || !['unlimited', 'limited'].includes(data.businessModel)) {
      throw new ValidationError('Business model must be either "unlimited" or "limited"');
    }

    if (data.businessModel === 'limited') {
      if (!data.usageLimit || data.usageLimit < 1) {
        throw new ValidationError('Usage limit must be at least 1 for limited model');
      }
    } else if (data.usageLimit !== undefined) {
      throw new ValidationError('Usage limit should not be set for unlimited model');
    }
  }

  static validateUpdateBusiness(data: UpdateBusinessInput): void {
    if (data.name !== undefined && data.name.trim().length === 0) {
      throw new ValidationError('Business name cannot be empty');
    }

    if (data.type !== undefined && !['restaurant', 'hotel', 'other'].includes(data.type)) {
      throw new ValidationError('Type must be one of: restaurant, hotel, other');
    }

    if (data.phone !== undefined && !this.isValidLebanesPhone(data.phone)) {
      throw new ValidationError('Invalid Lebanese phone number. Format: +961 XXXXXXXX');
    }

    if (data.ownerName !== undefined && data.ownerName.trim().length === 0) {
      throw new ValidationError('Owner name cannot be empty');
    }

    if (data.usageLimit !== undefined && data.usageLimit < 1) {
      throw new ValidationError('Usage limit must be at least 1');
    }
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private static isValidLebanesPhone(phone: string): boolean {
    const phoneRegex = /^\+961 \d{8}$/;
    return phoneRegex.test(phone);
  }
}
