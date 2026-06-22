import { Request, Response, NextFunction } from 'express';
import { userService } from '../../services/dashboard/userService';
import { CreateUserInput, UpdateUserInput } from '../../models/User';
import { ResponseHelper } from '../../helpers/response';

export class UserController {
  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: CreateUserInput = req.body;
      const user = await userService.createUser(data);
      res.status(201).json(ResponseHelper.success(user, 'User created successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(ResponseHelper.error('Not authenticated'));
        return;
      }
      const user = await userService.getUser(req.user.id);
      res.status(200).json(ResponseHelper.success(user));
    } catch (error) {
      next(error);
    }
  }

  async getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await userService.getUser(id);
      res.status(200).json(ResponseHelper.success(user));
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string | undefined;

      const result = await userService.getAllUsers(page, limit, status);
      res.status(200).json(ResponseHelper.success(result));
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateUserInput = req.body;
      const user = await userService.updateUser(id, data);
      res.status(200).json(ResponseHelper.success(user, 'User updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  async renewUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { startDate, expiryDate } = (req.body ?? {}) as { startDate?: string; expiryDate?: string };
      const user = await userService.renewUser(id, expiryDate, startDate);
      res.status(200).json(ResponseHelper.success(user, 'User subscription renewed successfully'));
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await userService.deleteUser(id);
      res.status(200).json(ResponseHelper.success(user, 'User deleted successfully'));
    } catch (error) {
      next(error);
    }
  }

  async deleteAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.query.confirm !== 'true') {
        res
          .status(400)
          .json(ResponseHelper.error('This permanently deletes ALL users. Pass ?confirm=true to proceed.'));
        return;
      }
      const result = await userService.deleteAllUsers();
      res.status(200).json(ResponseHelper.success(result, `Deleted ${result.deletedCount} user(s)`));
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
