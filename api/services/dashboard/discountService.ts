import { Types } from 'mongoose';
import { Discount, RecordDiscountInput, DiscountResponse } from '../../models/Discount';
import { User } from '../../models/User';
import { Business } from '../../models/Business';
import { DiscountValidation } from '../../validations/discountValidation';
import { ForbiddenError, NotFoundError } from '../../helpers/errors';
import logger from '../../config/logger';

// Fallback cap for a limited business that has no usageLimit configured.
export const DEFAULT_LIMITED_BUSINESS_USAGE_CAP = 12;

export class DiscountService {
  // The business is authenticated (its id comes from the JWT). The scanned QR
  // carries both the member's userId and the businessId it was issued for; the
  // QR's businessId must match the authenticated business, otherwise the QR
  // belongs to a different business and the scan is rejected.
  async createDiscount(businessId: string, data: RecordDiscountInput): Promise<DiscountResponse> {
    DiscountValidation.validateRecordDiscount(data);

    if (data.businessId !== businessId) {
      throw new ForbiddenError('Invalid QR code: this code is not registered to your business');
    }

    const user = await User.findById(data.userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const business = await Business.findById(businessId);
    if (!business) {
      throw new NotFoundError('Business not found');
    }

    // Limited-model businesses cap how many times a user can claim a discount
    // within their current subscription period (startDate -> expiryDate). The
    // cap is the business's configured usageLimit, falling back to a default.
    if (business.businessModel === 'limited') {
      const cap = business.usageLimit ?? DEFAULT_LIMITED_BUSINESS_USAGE_CAP;

      const usageCount = await Discount.countDocuments({
        userId: new Types.ObjectId(data.userId),
        businessId: new Types.ObjectId(businessId),
        discountedAt: { $gte: user.startDate, $lte: user.expiryDate },
      });

      if (usageCount >= cap) {
        throw new ForbiddenError(
          `Discount limit reached: this business allows up to ${cap} uses per subscription period`
        );
      }
    }

    const discount = new Discount({
      userId: new Types.ObjectId(data.userId),
      businessId: new Types.ObjectId(businessId),
      discountedAt: new Date(),
    });

    await discount.save();
    logger.info(`Discount recorded: user ${data.userId} at business ${businessId}`);
    return this.mapToResponse(discount);
  }

  async getDiscount(id: string): Promise<DiscountResponse> {
    const discount = await Discount.findById(id);
    if (!discount) {
      throw new NotFoundError('Discount not found');
    }

    return this.mapToResponse(discount);
  }

  async getAllDiscounts(
    page: number = 1,
    limit: number = 20,
    userId?: string,
    businessId?: string
  ): Promise<{ data: DiscountResponse[]; pagination: any }> {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (userId && Types.ObjectId.isValid(userId)) {
      query.userId = new Types.ObjectId(userId);
    }
    if (businessId && Types.ObjectId.isValid(businessId)) {
      query.businessId = new Types.ObjectId(businessId);
    }

    const discounts = await Discount.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ discountedAt: -1 });

    const total = await Discount.countDocuments(query);

    return {
      data: discounts.map((d) => this.mapToResponse(d)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  private mapToResponse(discount: any): DiscountResponse {
    return {
      id: discount._id.toString(),
      userId: discount.userId.toString(),
      businessId: discount.businessId.toString(),
      discountedAt: discount.discountedAt.toISOString(),
      createdAt: discount.createdAt.toISOString(),
      updatedAt: discount.updatedAt.toISOString(),
    };
  }
}

export const discountService = new DiscountService();
