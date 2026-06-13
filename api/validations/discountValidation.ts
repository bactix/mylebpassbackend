import { Types } from 'mongoose';
import { ValidationError } from '../helpers/errors';
import { RecordDiscountInput } from '../models/Discount';

export class DiscountValidation {
  static validateRecordDiscount(data: RecordDiscountInput): void {
    if (typeof data.userId === 'string') {
      data.userId = data.userId.trim();
    }

    if (!data.userId || !Types.ObjectId.isValid(data.userId)) {
      throw new ValidationError('A valid userId is required');
    }

    if (typeof data.businessId === 'string') {
      data.businessId = data.businessId.trim();
    }

    if (!data.businessId || !Types.ObjectId.isValid(data.businessId)) {
      throw new ValidationError('A valid businessId is required');
    }
  }
}
