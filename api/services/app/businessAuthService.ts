import bcrypt from 'bcryptjs';
import { Business } from '../../models/Business';
import { User } from '../../models/User';
import { UnauthorizedError } from '../../helpers/errors';
import { generateToken } from '../../helpers/jwt';
import logger from '../../config/logger';

interface LoginCredentials {
  email: string;
  password: string;
}

interface BusinessAuthResponse {
  token: string;
  business: {
    id: string;
    email: string;
    name: string;
    role: 'business';
  };
}

export class BusinessAuthService {
  async login(credentials: LoginCredentials): Promise<BusinessAuthResponse> {
    const email = credentials.email.toLowerCase();

    // Check if email exists in User collection
    const user = await User.findOne({ email });
    if (user) {
      throw new UnauthorizedError('This account is registered as a regular user. Please use the user login endpoint.');
    }

    const business = await Business.findOne({
      email,
      $or: [{ accountType: 'business' }, { accountType: { $exists: false } }]
    });
    if (!business) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!business.password) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const passwordMatch = await bcrypt.compare(credentials.password, business.password);
    if (!passwordMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = generateToken(business._id.toString(), business.email, 'business');
    logger.info(`Business logged in: ${business.email}`);

    return {
      token,
      business: {
        id: business._id.toString(),
        email: business.email,
        name: business.name,
        role: 'business',
      },
    };
  }
}

export const businessAuthService = new BusinessAuthService();
