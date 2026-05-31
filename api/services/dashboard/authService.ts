import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Admin } from '../../models/Admin';
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
    role: 'admin';
  };
}

export class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const admin = await Admin.findOne({ email: credentials.email.toLowerCase() });
    if (!admin) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const passwordMatch = await bcrypt.compare(credentials.password, admin.password);
    if (!passwordMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = this.generateToken(admin._id.toString(), admin.email, 'admin');
    logger.info(`Admin logged in: ${admin.email}`);

    return {
      token,
      user: {
        id: admin._id.toString(),
        email: admin.email,
        role: 'admin',
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
