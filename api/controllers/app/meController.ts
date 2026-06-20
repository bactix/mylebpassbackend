import { Request, Response, NextFunction } from 'express';
import { userService } from '../../services/dashboard/userService';
import { discountService } from '../../services/dashboard/discountService';
import { UpdateUserInput } from '../../models/User';
import { ResponseHelper } from '../../helpers/response';

export class MeController {
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.getUser(req.user!.id);
      res.status(200).json(ResponseHelper.success(user));
    } catch (error) {
      next(error);
    }
  }

  async getDiscounts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      // userId comes from the authenticated member's token — never the client.
      const result = await discountService.getUserDiscounts(req.user!.id, page, limit);
      res.status(200).json(ResponseHelper.success(result));
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, phone, password } = req.body as {
        name?: string;
        email?: string;
        phone?: string;
        password?: string;
      };

      // Members may only edit their own basic details — never status or dates.
      const data: UpdateUserInput = {};
      if (name !== undefined) data.name = name;
      if (email !== undefined) data.email = email;
      if (phone !== undefined) data.phone = phone;
      if (password) data.password = password;

      const user = await userService.updateUser(req.user!.id, data);
      res.status(200).json(ResponseHelper.success(user, 'Profile updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  async deleteAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await userService.deleteUser(req.user!.id);
      res.status(200).json(ResponseHelper.success(null, 'Account deleted successfully'));
    } catch (error) {
      next(error);
    }
  }
}

export const meController = new MeController();
