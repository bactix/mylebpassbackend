import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../../models/User';
import { Business } from '../../models/Business';
import { TokenBlacklist } from '../../models/TokenBlacklist';
import { UnauthorizedError } from '../../helpers/errors';
import { generateToken } from '../../helpers/jwt';
import logger from '../../config/logger';

interface LoginCredentials {
  email: string;
  password: string;
}

interface UserAuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: 'user';
  };
}

export class UserAuthService {
  async login(credentials: LoginCredentials): Promise<UserAuthResponse> {
    const email = credentials.email.toLowerCase();

    // Check if email exists in Business collection
    const business = await Business.findOne({ email });
    if (business) {
      throw new UnauthorizedError('This account is registered as a business. Please use the business login endpoint.');
    }

    const user = await User.findOne({
      email,
      $or: [{ type: 'user' }, { type: { $exists: false } }]
    });
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.password) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const passwordMatch = await bcrypt.compare(credentials.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.status === 'pending') {
      throw new UnauthorizedError('Account is pending activation');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedError('Account is inactive');
    }

    const token = generateToken(user._id.toString(), user.email, 'user');
    logger.info(`User logged in: ${user.email}`);

    return {
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: 'user',
      },
    };
  }

  async logout(token: string, userId: string): Promise<void> {
    try {
      const secret = process.env.JWT_SECRET || 'your-secret-key';
      const decoded = jwt.verify(token, secret) as { id: string; email: string; exp: number };

      const expiresAt = new Date(decoded.exp * 1000);

      await TokenBlacklist.create({
        token,
        userId,
        email: decoded.email,
        expiresAt,
      });

      logger.info(`User logged out: ${decoded.email}`);
    } catch (error) {
      logger.error(`Logout error: ${error}`);
      throw new UnauthorizedError('Invalid token');
    }
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const blacklistedToken = await TokenBlacklist.findOne({ token });
    return !!blacklistedToken;
  }
}

export const userAuthService = new UserAuthService();
