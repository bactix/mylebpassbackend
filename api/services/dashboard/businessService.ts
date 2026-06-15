import { Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { Business, CreateBusinessInput, UpdateBusinessInput, BusinessResponse } from '../../models/Business';
import { Coupon } from '../../models/Coupon';
import { User } from '../../models/User';
import { Discount } from '../../models/Discount';
import { BusinessValidation } from '../../validations/businessValidation';
import { ConflictError, NotFoundError } from '../../helpers/errors';
import { toAbsoluteMediaUrl, toAbsoluteMediaUrls } from '../../helpers/media';
import { DEFAULT_LIMITED_BUSINESS_USAGE_CAP } from './discountService';
import logger from '../../config/logger';

export interface BusinessForUserResponse extends BusinessResponse {
  userUsage: {
    usageCount: number;
    // Per-user cap at this business (null for unlimited businesses).
    usageLimit: number | null;
    // Discounts the user still has at this business this period (null = unlimited).
    remaining: number | null;
    periodStart: string;
    periodEnd: string;
  };
}

export class BusinessService {
  async createBusiness(data: CreateBusinessInput): Promise<BusinessResponse> {
    BusinessValidation.validateCreateBusiness(data);

    const existingBusiness = await Business.findOne({ email: data.email.toLowerCase() });
    if (existingBusiness) {
      throw new ConflictError('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const business = new Business({
      name: data.name,
      type: data.type,
      email: data.email.toLowerCase(),
      phone: data.phone,
      ownerName: data.ownerName,
      city: data.city,
      address: data.address,
      about: data.about,
      password: hashedPassword,
      accountType: 'business',
      businessModel: data.businessModel,
      usageLimit: data.businessModel === 'limited' ? data.usageLimit : undefined,
    });

    await business.save();
    logger.info(`Business created: ${business.email}`);
    return this.mapToResponse(business);
  }

  async getBusiness(id: string): Promise<BusinessResponse> {
    const business = await Business.findById(id);
    if (!business) {
      throw new NotFoundError('Business not found');
    }

    const couponsCount = await Coupon.countDocuments({ businessName: business.name, isActive: true });
    const totalUsageCount = await Coupon.aggregate([
      { $match: { businessName: business.name, isActive: true } },
      { $group: { _id: null, total: { $sum: '$totalUsageCount' } } },
    ]);

    return this.mapToResponse(business, couponsCount, totalUsageCount[0]?.total || 0);
  }

  async getBusinessForUser(businessId: string, userId: string): Promise<BusinessForUserResponse> {
    const business = await Business.findById(businessId);
    if (!business) {
      throw new NotFoundError('Business not found');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Count how many discounts this user has used at this business within
    // their subscription period (startDate -> expiryDate).
    const usageCount = await Discount.countDocuments({
      userId: new Types.ObjectId(userId),
      businessId: new Types.ObjectId(businessId),
      discountedAt: { $gte: user.startDate, $lte: user.expiryDate },
    });

    const couponsCount = await Coupon.countDocuments({ businessName: business.name, isActive: true });

    // Limited businesses cap each user at usageLimit per subscription period;
    // unlimited businesses have no cap (null).
    const usageLimit =
      business.businessModel === 'limited'
        ? business.usageLimit ?? DEFAULT_LIMITED_BUSINESS_USAGE_CAP
        : null;
    const remaining = usageLimit === null ? null : Math.max(0, usageLimit - usageCount);

    return {
      ...this.mapToResponse(business, couponsCount),
      userUsage: {
        usageCount,
        usageLimit,
        remaining,
        periodStart: user.startDate.toISOString(),
        periodEnd: user.expiryDate.toISOString(),
      },
    };
  }

  async getAllBusinesses(page: number = 1, limit: number = 20, type?: string, city?: string): Promise<{ data: BusinessResponse[]; pagination: any }> {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (type) {
      query.type = type;
    }
    if (city) {
      query.city = city;
    }

    const businesses = await Business.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });
    const total = await Business.countDocuments(query);

    const data = await Promise.all(
      businesses.map(async b => {
        const couponsCount = await Coupon.countDocuments({ businessName: b.name, isActive: true });
        const totalUsageCount = await Coupon.aggregate([
          { $match: { businessName: b.name, isActive: true } },
          { $group: { _id: null, total: { $sum: '$totalUsageCount' } } },
        ]);
        return this.mapToResponse(b, couponsCount, totalUsageCount[0]?.total || 0);
      })
    );

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async updateBusiness(id: string, data: UpdateBusinessInput): Promise<BusinessResponse> {
    BusinessValidation.validateUpdateBusiness(data);

    const update: Partial<Record<keyof UpdateBusinessInput, unknown>> = { ...data };
    if (data.password !== undefined) {
      update.password = await bcrypt.hash(data.password, 10);
    }

    const business = await Business.findByIdAndUpdate(id, update, { new: true });
    if (!business) {
      throw new NotFoundError('Business not found');
    }

    logger.info(`Business updated: ${business.email}`);
    return this.mapToResponse(business);
  }

  async deleteBusiness(id: string): Promise<BusinessResponse> {
    const business = await Business.findByIdAndDelete(id);
    if (!business) {
      throw new NotFoundError('Business not found');
    }

    logger.info(`Business deleted: ${business.email}`);
    return this.mapToResponse(business);
  }

  async deleteAllBusinesses(): Promise<{ deletedCount: number }> {
    const result = await Business.deleteMany({});
    logger.warn(`All businesses deleted: ${result.deletedCount} removed`);
    return { deletedCount: result.deletedCount ?? 0 };
  }

  async getUsageRemaining(id: string): Promise<any> {
    const business = await Business.findById(id);
    if (!business) {
      throw new NotFoundError('Business not found');
    }

    if (business.businessModel === 'unlimited') {
      return {
        businessModel: 'unlimited',
        message: 'Unlimited usage',
      };
    }

    const totalUsageCount = await Coupon.aggregate([
      { $match: { businessName: business.name, isActive: true } },
      { $group: { _id: null, total: { $sum: '$totalUsageCount' } } },
    ]);

    const usedCount = totalUsageCount[0]?.total || 0;
    const remainingCount = (business.usageLimit || 0) - usedCount;

    return {
      businessModel: 'limited',
      totalLimit: business.usageLimit,
      usedCount,
      remainingCount: Math.max(0, remainingCount),
    };
  }

  private mapToResponse(business: any, couponsCount?: number, totalUsageCount?: number): BusinessResponse {
    return {
      id: business._id.toString(),
      name: business.name,
      type: business.type,
      email: business.email,
      phone: business.phone,
      ownerName: business.ownerName,
      city: business.city,
      address: business.address,
      about: business.about,
      businessModel: business.businessModel,
      usageLimit: business.usageLimit,
      profilePicture: toAbsoluteMediaUrl(business.profilePicture),
      gallery: toAbsoluteMediaUrls(business.gallery),
      couponsCount,
      totalUsageCount,
      createdAt: business.createdAt.toISOString(),
      updatedAt: business.updatedAt.toISOString(),
    };
  }
}

export const businessService = new BusinessService();
