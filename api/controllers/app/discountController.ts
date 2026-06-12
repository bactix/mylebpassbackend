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
}

export const discountController = new DiscountController();
