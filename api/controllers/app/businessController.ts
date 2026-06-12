import { Request, Response, NextFunction } from 'express';
import { businessService } from '../../services/dashboard/businessService';
import { ResponseHelper } from '../../helpers/response';

export class BusinessController {
  async getBusinessDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(ResponseHelper.error('Not authenticated'));
        return;
      }

      const { id } = req.params;
      const business = await businessService.getBusinessForUser(id, req.user.id);
      res.status(200).json(ResponseHelper.success(business));
    } catch (error) {
      next(error);
    }
  }
}

export const businessController = new BusinessController();
