import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../../config/database';
import { User } from '../../models/User';
import { Business } from '../../models/Business';
import { UnauthorizedError } from '../../helpers/errors';
import logger from '../../config/logger';

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: 'user';
  };
}

export class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const user = await User.findOne({ email: credentials.email.toLowerCase() });
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const passwordMatch = await bcrypt.compare(credentials.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = this.generateToken(user._id.toString(), user.email, 'user');
    logger.info(`User logged in: ${user.email}`);

    return {
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        role: 'user',
      },
    };
  }

  private generateToken(id: string, email: string, role: 'user' | 'business' | 'admin'): string {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const expiresIn = '24h';

    return jwt.sign(
      {
        id,
        email,
        role,
      },
      secret,
      { expiresIn }
    );
  }
}

export const authService = new AuthService();
