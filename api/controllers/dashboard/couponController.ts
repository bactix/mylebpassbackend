import { Request, Response, NextFunction } from 'express';
import { couponService } from '../../services/dashboard/couponService';
import { CreateCouponInput, UpdateCouponInput } from '../../models/Coupon';
import { ResponseHelper } from '../../helpers/response';

export class CouponController {
  async createCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(ResponseHelper.error('Not authenticated'));
        return;
      }

      const data: CreateCouponInput = req.body;
      const coupon = await couponService.createCoupon(req.user.id, data);
      res.status(201).json(ResponseHelper.success(coupon, 'Coupon created successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const coupon = await couponService.getCoupon(id);
      res.status(200).json(ResponseHelper.success(coupon));
    } catch (error) {
      next(error);
    }
  }

  async getAllCoupons(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const businessId = req.query.businessId as string | undefined;
      const code = req.query.code as string | undefined;

      const result = await couponService.getAllCoupons(page, limit, businessId, code);
      res.status(200).json(ResponseHelper.success(result));
    } catch (error) {
      next(error);
    }
  }

  async updateCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(ResponseHelper.error('Not authenticated'));
        return;
      }

      const { id } = req.params;
      const data: UpdateCouponInput = req.body;
      const coupon = await couponService.updateCoupon(id, req.user.id, data);
      res.status(200).json(ResponseHelper.success(coupon, 'Coupon updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  async deleteCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(ResponseHelper.error('Not authenticated'));
        return;
      }

      const { id } = req.params;
      await couponService.deleteCoupon(id, req.user.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async useCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(ResponseHelper.error('Not authenticated'));
        return;
      }

      const { id } = req.params;
      const usage = await couponService.useCoupon(id, req.user.id);
      res.status(200).json(
        ResponseHelper.success({ couponUsage: usage }, 'Coupon used successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  async getUsageStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(ResponseHelper.error('Not authenticated'));
        return;
      }

      const { id } = req.params;
      const stats = await couponService.getUsageStats(id, req.user.id);
      res.status(200).json(ResponseHelper.success(stats));
    } catch (error) {
      next(error);
    }
  }
}

export const couponController = new CouponController();
