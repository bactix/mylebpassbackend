import { ValidationError } from '../helpers/errors';
import { CreateCouponInput, UpdateCouponInput } from '../models/Coupon';

export class CouponValidation {
  static validateCreateCoupon(data: CreateCouponInput): void {
    if (!data.code || data.code.trim().length === 0) {
      throw new ValidationError('Coupon code is required');
    }

    if (!data.businessName || data.businessName.trim().length === 0) {
      throw new ValidationError('Business name is required');
    }

    if (!Number.isInteger(data.discount) || data.discount < 0 || data.discount > 100) {
      throw new ValidationError('Discount must be a number between 0 and 100');
    }

    if (!data.description || data.description.trim().length === 0) {
      throw new ValidationError('Description is required');
    }

    const expiryDate = new Date(data.expiryDate);
    if (isNaN(expiryDate.getTime())) {
      throw new ValidationError('Invalid expiry date format');
    }

    if (expiryDate <= new Date()) {
      throw new ValidationError('Expiry date must be in the future');
    }

    if (!Number.isInteger(data.maxUsagePerUser) || data.maxUsagePerUser < 1) {
      throw new ValidationError('Max usage per user must be at least 1');
    }
  }

  static validateUpdateCoupon(data: UpdateCouponInput): void {
    if (data.description !== undefined && data.description.trim().length === 0) {
      throw new ValidationError('Description cannot be empty');
    }

    if (data.expiryDate !== undefined) {
      const expiryDate = new Date(data.expiryDate);
      if (isNaN(expiryDate.getTime())) {
        throw new ValidationError('Invalid expiry date format');
      }

      if (expiryDate <= new Date()) {
        throw new ValidationError('Expiry date must be in the future');
      }
    }

    if (data.maxUsagePerUser !== undefined) {
      if (!Number.isInteger(data.maxUsagePerUser) || data.maxUsagePerUser < 1) {
        throw new ValidationError('Max usage per user must be at least 1');
      }
    }
  }
}
