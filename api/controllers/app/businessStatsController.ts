import { Request, Response, NextFunction } from 'express';
import { businessStatsService } from '../../services/app/businessStatsService';
import { ResponseHelper } from '../../helpers/response';

export class BusinessStatsController {
  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await businessStatsService.getStats(req.user!.id);
      res.status(200).json(ResponseHelper.success(stats));
    } catch (error) {
      next(error);
    }
  }
}

export const businessStatsController = new BusinessStatsController();
