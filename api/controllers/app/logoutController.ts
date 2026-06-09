import { Request, Response, NextFunction } from 'express';
import { userAuthService } from '../../services/app/userAuthService';
import { ResponseHelper } from '../../helpers/response';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  token?: string;
}

export class LogoutController {
  async logout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.token;
      const userId = req.user?.id;

      if (!token || !userId) {
        res.status(401).json(ResponseHelper.error('Unauthorized: No valid token provided'));
        return;
      }

      await userAuthService.logout(token, userId);
      res.status(200).json(ResponseHelper.success(null, 'Logged out successfully'));
    } catch (error) {
      next(error);
    }
  }
}

export const logoutController = new LogoutController();
