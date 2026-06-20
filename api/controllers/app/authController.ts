import { Request, Response, NextFunction } from 'express';
import { userAuthService } from '../../services/app/userAuthService';
import { businessAuthService } from '../../services/app/businessAuthService';
import { ResponseHelper } from '../../helpers/response';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface BusinessRegisterRequest {
  name: string;
  type: 'restaurant' | 'hotel' | 'other';
  email?: string;
  phone: string;
  ownerName: string;
  city: string;
  address: string;
  about: string;
  password: string;
  confirmPassword: string;
}

interface BusinessLoginRequest {
  phone: string;
  password: string;
}

export class AppAuthController {
  async businessRegister(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, type, email, phone, ownerName, city, address, about, password, confirmPassword } = req.body as BusinessRegisterRequest;
      const result = await businessAuthService.register({
        name,
        type,
        email,
        phone,
        ownerName,
        city,
        address,
        about,
        password,
        confirmPassword,
      });
      res.status(201).json(ResponseHelper.success(result, 'Business account created successfully'));
    } catch (error) {
      next(error);
    }
  }

  async userRegister(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, phone, password, confirmPassword } = req.body as RegisterRequest;
      const result = await userAuthService.register({
        name,
        email,
        phone,
        password,
        confirmPassword,
      });
      res.status(201).json(ResponseHelper.success(result, 'Account created successfully'));
    } catch (error) {
      next(error);
    }
  }

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
      const { phone, password } = req.body as BusinessLoginRequest;
      if (!phone || !password) {
        res.status(400).json(ResponseHelper.error('Phone number and password are required'));
        return;
      }
      const result = await businessAuthService.login({ phone, password });
      res.status(200).json(ResponseHelper.success(result, 'Login successful'));
    } catch (error) {
      next(error);
    }
  }
}

export const appAuthController = new AppAuthController();
