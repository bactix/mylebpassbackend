import { Request, Response, NextFunction } from 'express';
import { discountService } from '../../services/dashboard/discountService';
import { ResponseHelper } from '../../helpers/response';

export class DiscountController {
  async getDiscount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const discount = await discountService.getDiscount(id);
      res.status(200).json(ResponseHelper.success(discount));
    } catch (error) {
      next(error);
    }
  }

  async getAllDiscounts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const userId = req.query.userId as string | undefined;
      const businessId = req.query.businessId as string | undefined;

      const result = await discountService.getAllDiscounts(page, limit, userId, businessId);
      res.status(200).json(ResponseHelper.success(result));
    } catch (error) {
      next(error);
    }
  }
}

export const discountController = new DiscountController();
