import bcrypt from 'bcryptjs';
import { Business, CreateBusinessInput, UpdateBusinessInput, BusinessResponse } from '../../models/Business';
import { Coupon } from '../../models/Coupon';
import { BusinessValidation } from '../../validations/businessValidation';
import { ConflictError, NotFoundError } from '../../helpers/errors';
import logger from '../../config/logger';

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
      password: hashedPassword,
      phone: data.phone,
      ownerName: data.ownerName,
      city: data.city,
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

    const couponsCount = await Coupon.countDocuments({ businessId: id, isActive: true });
    const totalUsageCount = await Coupon.aggregate([
      { $match: { businessId: business._id, isActive: true } },
      { $group: { _id: null, total: { $sum: '$totalUsageCount' } } },
    ]);

    return this.mapToResponse(business, couponsCount, totalUsageCount[0]?.total || 0);
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
        const couponsCount = await Coupon.countDocuments({ businessId: b._id, isActive: true });
        const totalUsageCount = await Coupon.aggregate([
          { $match: { businessId: b._id, isActive: true } },
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

    const business = await Business.findByIdAndUpdate(id, data, { new: true });
    if (!business) {
      throw new NotFoundError('Business not found');
    }

    logger.info(`Business updated: ${business.email}`);
    return this.mapToResponse(business);
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
      { $match: { businessId: business._id, isActive: true } },
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
      businessModel: business.businessModel,
      usageLimit: business.usageLimit,
      couponsCount,
      totalUsageCount,
      createdAt: business.createdAt.toISOString(),
      updatedAt: business.updatedAt.toISOString(),
    };
  }
}

export const businessService = new BusinessService();
