import { Types } from 'mongoose';
import { Discount, RecordDiscountInput, DiscountResponse } from '../../models/Discount';
import { User } from '../../models/User';
import { Business } from '../../models/Business';
import { DiscountValidation } from '../../validations/discountValidation';
import { ForbiddenError, NotFoundError } from '../../helpers/errors';
import logger from '../../config/logger';

const LIMITED_BUSINESS_USAGE_CAP = 12;

export class DiscountService {
  // The business is authenticated (it scans the member's QR), so businessId
  // comes from the JWT and the member's userId comes from the scanned code.
  async createDiscount(businessId: string, data: RecordDiscountInput): Promise<DiscountResponse> {
    DiscountValidation.validateRecordDiscount(data);

    const user = await User.findById(data.userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const business = await Business.findById(businessId);
    if (!business) {
      throw new NotFoundError('Business not found');
    }

    // Limited-model businesses cap how many times a user can claim a discount
    // within their current subscription period (startDate -> expiryDate).
    if (business.businessModel === 'limited') {
      const usageCount = await Discount.countDocuments({
        userId: new Types.ObjectId(data.userId),
        businessId: new Types.ObjectId(businessId),
        discountedAt: { $gte: user.startDate, $lte: user.expiryDate },
      });

      if (usageCount >= LIMITED_BUSINESS_USAGE_CAP) {
        throw new ForbiddenError(
          `Discount limit reached: this business allows up to ${LIMITED_BUSINESS_USAGE_CAP} uses per subscription period`
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
