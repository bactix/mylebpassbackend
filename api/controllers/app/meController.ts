import { Request, Response, NextFunction } from 'express';
import { userService } from '../../services/dashboard/userService';
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
