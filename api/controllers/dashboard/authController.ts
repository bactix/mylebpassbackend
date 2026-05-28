import { Request, Response, NextFunction } from 'express';
import { authService } from '../../services/dashboard/authService';
import { ResponseHelper } from '../../helpers/response';

interface LoginRequest {
  email: string;
  password: string;
}

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body as LoginRequest;

      if (!email || !password) {
        res.status(400).json(ResponseHelper.error('Email and password are required'));
        return;
      }

      const result = await authService.login({ email, password });
      res.status(200).json(ResponseHelper.success(result, 'Login successful'));
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
