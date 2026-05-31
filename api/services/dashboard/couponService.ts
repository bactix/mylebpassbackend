import { Coupon, CreateCouponInput, UpdateCouponInput, CouponResponse } from '../../models/Coupon';
import { CouponUsage, CouponUsageResponse } from '../../models/CouponUsage';
import { User } from '../../models/User';
import { CouponValidation } from '../../validations/couponValidation';
import { ConflictError, NotFoundError, ValidationError } from '../../helpers/errors';
import logger from '../../config/logger';
import { Types } from 'mongoose';

export class CouponService {
  async createCoupon(data: CreateCouponInput): Promise<CouponResponse> {
    CouponValidation.validateCreateCoupon(data);

    const existingCoupon = await Coupon.findOne({ code: data.code.toUpperCase() });
    if (existingCoupon) {
      throw new ConflictError('Coupon code already exists');
    }

    const coupon = new Coupon({
      code: data.code.toUpperCase(),
      businessName: data.businessName.trim(),
      discount: data.discount,
      description: data.description,
      expiryDate: new Date(data.expiryDate),
      maxUsagePerUser: data.maxUsagePerUser,
      totalUsageCount: 0,
      isActive: true,
    });

    await coupon.save();
    logger.info(`Coupon created: ${coupon.code}`);
    return this.mapToResponse(coupon);
  }

  async getCoupon(id: string): Promise<CouponResponse> {
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      throw new NotFoundError('Coupon not found');
    }

    return this.mapToResponse(coupon);
  }

  async getAllCoupons(page: number = 1, limit: number = 20, businessName?: string, code?: string): Promise<{ data: CouponResponse[]; pagination: any }> {
    const skip = (page - 1) * limit;
    const query: any = { isActive: true };

    if (businessName) {
      query.businessName = businessName;
    }
    if (code) {
      query.code = code.toUpperCase();
    }

    const coupons = await Coupon.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Coupon.countDocuments(query);

    return {
      data: coupons.map(c => this.mapToResponse(c)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async updateCoupon(id: string, data: UpdateCouponInput): Promise<CouponResponse> {
    CouponValidation.validateUpdateCoupon(data);

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      throw new NotFoundError('Coupon not found');
    }

    // Cannot change code or discount after creation
    const updateData: any = {};
    if (data.description !== undefined) updateData.description = data.description;
    if (data.expiryDate !== undefined) updateData.expiryDate = new Date(data.expiryDate);
    if (data.maxUsagePerUser !== undefined) updateData.maxUsagePerUser = data.maxUsagePerUser;

    const updated = await Coupon.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) {
      throw new NotFoundError('Coupon not found');
    }

    logger.info(`Coupon updated: ${updated.code}`);
    return this.mapToResponse(updated);
  }

  async deleteCoupon(id: string): Promise<void> {
    const coupon = await Coupon.findById(id);
    if (!coupon) {
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
      businessName: coupon.businessName,
      usedAt: new Date(),
    });

    await usage.save();

    // Increment total usage count
    coupon.totalUsageCount += 1;
    await coupon.save();

    logger.info(`Coupon used: ${coupon.code} by user ${userId}`);

    return {
      id: usage._id.toString(),
      couponId: usage.couponId.toString(),
      userId: usage.userId.toString(),
      businessName: usage.businessName,
      usedAt: usage.usedAt.toISOString(),
    };
  }

  async getUsageStats(couponId: string): Promise<any> {
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
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

  private mapToResponse(coupon: any): CouponResponse {
    return {
      id: coupon._id.toString(),
      code: coupon.code,
      businessName: coupon.businessName,
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
