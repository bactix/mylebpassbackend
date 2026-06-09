import { Request, Response, NextFunction } from 'express';
import { userAuthService } from '../../services/app/userAuthService';
import { businessAuthService } from '../../services/app/businessAuthService';
import { ResponseHelper } from '../../helpers/response';

interface LoginRequest {
  email: string;
  password: string;
}

export class AppAuthController {
  async userLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body as LoginRequest;
      if (!email || !password) {
        res.status(400).json(ResponseHelper.error('Email and password are required'));
        return;
      }
      const result = await userAuthService.login({ email, password });
      res.status(200).json(ResponseHelper.success(result, 'Login successful'));
    } catch (error) {
      next(error);
    }
  }

  async businessLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body as LoginRequest;
      if (!email || !password) {
        res.status(400).json(ResponseHelper.error('Email and password are required'));
        return;
      }
      const result = await businessAuthService.login({ email, password });
      res.status(200).json(ResponseHelper.success(result, 'Login successful'));
    } catch (error) {
      next(error);
    }
  }
}

export const appAuthController = new AppAuthController();
