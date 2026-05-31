import { Request, Response, NextFunction } from 'express';
import { businessService } from '../../services/dashboard/businessService';
import { CreateBusinessInput, UpdateBusinessInput } from '../../models/Business';
import { ResponseHelper } from '../../helpers/response';

export class BusinessController {
  async createBusiness(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: CreateBusinessInput = req.body;
      const business = await businessService.createBusiness(data);
      res.status(201).json(ResponseHelper.success(business, 'Business created successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getBusiness(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const business = await businessService.getBusiness(id);
      res.status(200).json(ResponseHelper.success(business));
    } catch (error) {
      next(error);
    }
  }

  async getAllBusinesses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const type = req.query.type as string | undefined;
      const city = req.query.city as string | undefined;

      const result = await businessService.getAllBusinesses(page, limit, type, city);
      res.status(200).json(ResponseHelper.success(result));
    } catch (error) {
      next(error);
    }
  }

  async updateBusiness(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateBusinessInput = req.body;
      const business = await businessService.updateBusiness(id, data);
      res.status(200).json(ResponseHelper.success(business, 'Business updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  async deleteBusiness(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const business = await businessService.deleteBusiness(id);
      res.status(200).json(ResponseHelper.success(business, 'Business deleted successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getUsageRemaining(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const usage = await businessService.getUsageRemaining(id);
      res.status(200).json(ResponseHelper.success(usage));
    } catch (error) {
      next(error);
    }
  }
}

export const businessController = new BusinessController();
