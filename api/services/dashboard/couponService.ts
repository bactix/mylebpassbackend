import { Coupon, CreateCouponInput, UpdateCouponInput, CouponResponse } from '../../models/Coupon';
import { CouponUsage, CouponUsageResponse } from '../../models/CouponUsage';
import { User } from '../../models/User';
import { Business } from '../../models/Business';
import { CouponValidation } from '../../validations/couponValidation';
import { ConflictError, NotFoundError, ValidationError } from '../../helpers/errors';
import logger from '../../config/logger';
import { Types } from 'mongoose';

export class CouponService {
  async createCoupon(businessId: string, data: CreateCouponInput): Promise<CouponResponse> {
    CouponValidation.validateCreateCoupon(data);

    const business = await Business.findById(businessId);
    if (!business) {
      throw new NotFoundError('Business not found');
    }

    const existingCoupon = await Coupon.findOne({ code: data.code.toUpperCase() });
    if (existingCoupon) {
      throw new ConflictError('Coupon code already exists');
    }

    // If business is limited model, check usage limit
    if (business.businessModel === 'limited') {
      const currentUsage = await Coupon.aggregate([
        { $match: { businessId: new Types.ObjectId(businessId), isActive: true } },
        { $group: { _id: null, total: { $sum: '$totalUsageCount' } } },
      ]);

      const usedCount = currentUsage[0]?.total || 0;
      const remainingCount = (business.usageLimit || 0) - usedCount;

      if (remainingCount < 1) {
        throw new ValidationError('Business has reached its usage limit');
      }

      // Decrement usage limit
      business.usageLimit = (business.usageLimit || 0) - 1;
      await business.save();
    }

    const coupon = new Coupon({
      code: data.code.toUpperCase(),
      businessId: new Types.ObjectId(businessId),
      discount: data.discount,
      description: data.description,
      expiryDate: new Date(data.expiryDate),
      maxUsagePerUser: data.maxUsagePerUser,
      totalUsageCount: 0,
      isActive: true,
    });

    await coupon.save();
    logger.info(`Coupon created: ${coupon.code}`);
    return this.mapToResponse(coupon, business.name);
  }

  async getCoupon(id: string): Promise<CouponResponse> {
    const coupon = await Coupon.findById(id).populate('businessId', 'name');
    if (!coupon) {
      throw new NotFoundError('Coupon not found');
    }

    const businessName = (coupon.businessId as any)?.name || '';
    return this.mapToResponse(coupon, businessName);
  }

  async getAllCoupons(page: number = 1, limit: number = 20, businessId?: string, code?: string): Promise<{ data: CouponResponse[]; pagination: any }> {
    const skip = (page - 1) * limit;
    const query: any = { isActive: true };

    if (businessId) {
      query.businessId = new Types.ObjectId(businessId);
    }
    if (code) {
      query.code = code.toUpperCase();
    }

    const coupons = await Coupon.find(query)
      .populate('businessId', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Coupon.countDocuments(query);

    return {
      data: coupons.map(c => {
        const businessName = (c.businessId as any)?.name || '';
        return this.mapToResponse(c, businessName);
      }),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async updateCoupon(id: string, businessId: string, data: UpdateCouponInput): Promise<CouponResponse> {
    CouponValidation.validateUpdateCoupon(data);

    const coupon = await Coupon.findById(id).populate('businessId', 'name');
    if (!coupon) {
      throw new NotFoundError('Coupon not found');
    }

    if (coupon.businessId.toString() !== businessId) {
      throw new NotFoundError('Coupon not found');
    }

    // Cannot change code or discount after creation
    const updateData: any = {};
    if (data.description !== undefined) updateData.description = data.description;
    if (data.expiryDate !== undefined) updateData.expiryDate = new Date(data.expiryDate);
    if (data.maxUsagePerUser !== undefined) updateData.maxUsagePerUser = data.maxUsagePerUser;

    const updated = await Coupon.findByIdAndUpdate(id, updateData, { new: true }).populate('businessId', 'name');
    if (!updated) {
      throw new NotFoundError('Coupon not found');
    }

    const businessName = (updated.businessId as any)?.name || '';
    logger.info(`Coupon updated: ${updated.code}`);
    return this.mapToResponse(updated, businessName);
  }

  async deleteCoupon(id: string, businessId: string): Promise<void> {
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      throw new NotFoundError('Coupon not found');
    }

    if (coupon.businessId.toString() !== businessId) {
      throw new NotFoundError('Coupon not found');
    }

    coupon.isActive = false;
    await coupon.save();
    logger.info(`Coupon deleted (soft): ${coupon.code}`);
  }

  async useCoupon(couponId: string, userId: string): Promise<CouponUsageResponse> {
    const coupon = await Coupon.findById(couponId);
    if (!coupon || !coupon.isActive) {
      throw new NotFoundError('Coupon not found');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Business rules validation
    if (user.status !== 'active') {
      throw new ValidationError('User account is inactive');
    }

    if (new Date() > user.expiryDate) {
      throw new ValidationError('User subscription has expired');
    }

    if (new Date() > coupon.expiryDate) {
      throw new ValidationError('Coupon has expired');
    }

    // Check usage count
    const userUsageCount = await CouponUsage.countDocuments({
      couponId: new Types.ObjectId(couponId),
      userId: new Types.ObjectId(userId),
    });

    if (userUsageCount >= coupon.maxUsagePerUser) {
      throw new ValidationError('Coupon usage limit exceeded for this user');
    }

    // Create usage record
    const usage = new CouponUsage({
      couponId: new Types.ObjectId(couponId),
      userId: new Types.ObjectId(userId),
      businessId: coupon.businessId,
      usedAt: new Date(),
    });

    await usage.save();

    // Increment total usage count
    coupon.totalUsageCount += 1;
    await coupon.save();

    // If business is limited model, decrement usage limit
    const business = await Business.findById(coupon.businessId);
    if (business && business.businessModel === 'limited') {
      business.usageLimit = (business.usageLimit || 0) - 1;
      await business.save();
    }

    logger.info(`Coupon used: ${coupon.code} by user ${userId}`);

    return {
      id: usage._id.toString(),
      couponId: usage.couponId.toString(),
      userId: usage.userId.toString(),
      businessId: usage.businessId.toString(),
      usedAt: usage.usedAt.toISOString(),
    };
  }

  async getUsageStats(couponId: string, businessId: string): Promise<any> {
    const coupon = await Coupon.findById(couponId).populate('businessId', 'name');
    if (!coupon) {
      throw new NotFoundError('Coupon not found');
    }

    if (coupon.businessId.toString() !== businessId) {
      throw new NotFoundError('Coupon not found');
    }

    const usageRecords = await CouponUsage.find({ couponId: new Types.ObjectId(couponId) })
      .populate('userId', 'name email')
      .sort({ usedAt: -1 });

    // Group by user and count usages
    const usageByUser: any = {};
    for (const record of usageRecords) {
      const userId = (record.userId as any)?._id.toString();
      if (userId) {
        if (!usageByUser[userId]) {
          usageByUser[userId] = {
            userId,
            userName: (record.userId as any)?.name,
            userEmail: (record.userId as any)?.email,
            usageCount: 0,
            usages: [],
          };
        }
        usageByUser[userId].usageCount += 1;
        usageByUser[userId].usages.push(record.usedAt.toISOString());
      }
    }

    return {
      couponId,
      code: coupon.code,
      totalUsageCount: coupon.totalUsageCount,
      maxUsagePerUser: coupon.maxUsagePerUser,
      uniqueUsersCount: Object.keys(usageByUser).length,
      usageHistory: Object.values(usageByUser),
    };
  }

  private mapToResponse(coupon: any, businessName?: string): CouponResponse {
    return {
      id: coupon._id.toString(),
      code: coupon.code,
      businessId: coupon.businessId.toString(),
      businessName,
      discount: coupon.discount,
      description: coupon.description,
      expiryDate: coupon.expiryDate.toISOString(),
      maxUsagePerUser: coupon.maxUsagePerUser,
      totalUsageCount: coupon.totalUsageCount,
      createdAt: coupon.createdAt.toISOString(),
      updatedAt: coupon.updatedAt.toISOString(),
    };
  }
}

export const couponService = new CouponService();
