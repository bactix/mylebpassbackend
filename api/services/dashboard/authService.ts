import bcrypt from 'bcryptjs';
import { Admin } from '../../models/Admin';
import { User } from '../../models/User';
import { Business } from '../../models/Business';
import { UnauthorizedError } from '../../helpers/errors';
import { generateToken } from '../../helpers/jwt';
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
    const email = credentials.email.toLowerCase();

    // Check if email exists in User collection
    const user = await User.findOne({ email });
    if (user) {
      throw new UnauthorizedError('This account is registered as a regular user. Please use the user login endpoint.');
    }

    // Check if email exists in Business collection
    const business = await Business.findOne({ email });
    if (business) {
      throw new UnauthorizedError('This account is registered as a business. Please use the business login endpoint.');
    }

    const admin = await Admin.findOne({
      email,
      $or: [{ type: 'admin' }, { type: { $exists: false } }]
    });
    if (!admin) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const passwordMatch = await bcrypt.compare(credentials.password, admin.password);
    if (!passwordMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = generateToken(admin._id.toString(), admin.email, 'admin');
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
}

export const authService = new AuthService();
