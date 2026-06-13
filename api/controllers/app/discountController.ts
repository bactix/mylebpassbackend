import { Request, Response, NextFunction } from 'express';
import { discountService } from '../../services/dashboard/discountService';
import { RecordDiscountInput } from '../../models/Discount';
import { ResponseHelper } from '../../helpers/response';

export class DiscountController {
  async recordDiscount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(ResponseHelper.error('Not authenticated'));
        return;
      }

      const data: RecordDiscountInput = req.body;
      const discount = await discountService.createDiscount(req.user.id, data);
      res.status(201).json(ResponseHelper.success(discount, 'Discount recorded successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getMyDiscounts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(ResponseHelper.error('Not authenticated'));
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const userId = req.query.userId as string | undefined;

      // Scope results to the authenticated business; a business can only see
      // discounts recorded at its own location.
      const result = await discountService.getAllDiscounts(page, limit, userId, req.user.id);
      res.status(200).json(ResponseHelper.success(result));
    } catch (error) {
      next(error);
    }
  }
}

export const discountController = new DiscountController();
