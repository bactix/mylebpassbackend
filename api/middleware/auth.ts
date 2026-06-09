import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { userAuthService } from '../services/app/userAuthService';
import { UnauthorizedError } from '../helpers/errors';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  token?: string;
}

export async function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('Access token required');
    }

    const isBlacklisted = await userAuthService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      throw new UnauthorizedError('Token has been revoked');
    }

    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, secret) as { id: string; email: string; role: string };

    req.user = decoded;
    req.token = token;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ success: false, message: 'Invalid token' });
    } else if (error instanceof UnauthorizedError) {
      res.status(401).json({ success: false, message: error.message });
    } else {
      next(error);
    }
  }
}
