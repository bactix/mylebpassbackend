import { Request, Response, NextFunction } from 'express';
import { adminService } from '../../services/dashboard/adminService';
import { CreateAdminInput, UpdateAdminInput } from '../../models/Admin';
import { ResponseHelper } from '../../helpers/response';

export class AdminController {
  async createAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: CreateAdminInput = req.body;
      const admin = await adminService.createAdmin(data);
      res.status(201).json(ResponseHelper.success(admin, 'Admin created successfully'));
    } catch (error) {
      next(error);
    }
  }

  async updateAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateAdminInput = req.body;
      const admin = await adminService.updateAdmin(id, data);
      res.status(200).json(ResponseHelper.success(admin, 'Admin updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getAllAdmins(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await adminService.getAllAdmins(page, limit);
      res.status(200).json(ResponseHelper.success(result));
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
