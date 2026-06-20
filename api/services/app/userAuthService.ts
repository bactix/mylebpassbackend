import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../../models/User';
import { Business } from '../../models/Business';
import { TokenBlacklist } from '../../models/TokenBlacklist';
import { UnauthorizedError, ConflictError, ValidationError } from '../../helpers/errors';
import { generateToken } from '../../helpers/jwt';
import logger from '../../config/logger';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
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

interface RegisterResponse {
  user: {
    id: string;
    email: string;
    name: string;
    phone: string;
    status: string;
  };
  message: string;
}

export class UserAuthService {
  async register(credentials: RegisterCredentials): Promise<RegisterResponse> {
    const email = credentials.email.toLowerCase();

    this.validateRegisterInput(credentials);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    const existingBusiness = await Business.findOne({ email });
    if (existingBusiness) {
      throw new ConflictError('This email is registered as a business account');
    }

    const hashedPassword = await bcrypt.hash(credentials.password, 10);

    const user = new User({
      name: credentials.name,
      email,
      phone: credentials.phone,
      password: hashedPassword,
      type: 'user',
      status: 'inactive',
    });

    await user.save();
    logger.info(`New user registered: ${email}`);

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        phone: user.phone,
        status: user.status,
      },
      message: 'Account created successfully. Please wait for admin activation.',
    };
  }

  private validateRegisterInput(credentials: RegisterCredentials): void {
    if (!credentials.name || credentials.name.trim().length === 0) {
      throw new ValidationError('Name is required');
    }

    if (!credentials.email || !this.isValidEmail(credentials.email)) {
      throw new ValidationError('Invalid email format');
    }

    if (!credentials.phone || !this.isValidLebanesPhone(credentials.phone)) {
      throw new ValidationError('Invalid phone number. Format: 3 000 000 or 3000000');
    }

    if (!credentials.password || credentials.password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long');
    }

    if (credentials.password !== credentials.confirmPassword) {
      throw new ValidationError('Passwords do not match');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidLebanesPhone(phone: string): boolean {
    const phoneRegex = /^(\d{1} \d{3} \d{4}|\d{8})$/;
    return phoneRegex.test(phone);
  }

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
