import { Request, Response, NextFunction } from 'express';
import { businessService } from '../../services/dashboard/businessService';
import { ResponseHelper } from '../../helpers/response';

export class BusinessMeController {
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const business = await businessService.getBusiness(req.user!.id);
      res.status(200).json(ResponseHelper.success(business));
    } catch (error) {
      next(error);
    }
  }

  async deleteAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await businessService.deleteBusiness(req.user!.id);
      res.status(200).json(ResponseHelper.success(null, 'Account deleted successfully'));
    } catch (error) {
      next(error);
    }
  }
}

export const businessMeController = new BusinessMeController();
