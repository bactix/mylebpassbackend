import { Types } from 'mongoose';
import { Discount } from '../../models/Discount';

export interface BusinessStats {
  todayRedemptions: number;
  thisMonthRedemptions: number;
  allTimeScans: number;
  uniqueCustomers: number;
}

export class BusinessStatsService {
  async getStats(businessId: string): Promise<BusinessStats> {
    const bid = new Types.ObjectId(businessId);

    const now = new Date();

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todayRedemptions, thisMonthRedemptions, allTimeScans, uniqueCustomers] =
      await Promise.all([
        Discount.countDocuments({ businessId: bid, discountedAt: { $gte: startOfToday } }),
        Discount.countDocuments({ businessId: bid, discountedAt: { $gte: startOfMonth } }),
        Discount.countDocuments({ businessId: bid }),
        Discount.distinct('userId', { businessId: bid }).then(ids => ids.length),
      ]);

    return { todayRedemptions, thisMonthRedemptions, allTimeScans, uniqueCustomers };
  }
}

export const businessStatsService = new BusinessStatsService();
