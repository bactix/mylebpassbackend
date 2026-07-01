import bcrypt from 'bcryptjs';
import { Business } from '../../models/Business';
import { User } from '../../models/User';
import { UnauthorizedError, ConflictError, ValidationError } from '../../helpers/errors';
import { generateToken } from '../../helpers/jwt';
import logger from '../../config/logger';

// Fixed discount usage limit assigned to every self-registered business.
const SELF_REGISTER_USAGE_LIMIT = 12;

interface LoginCredentials {
  phone: string;
  password: string;
}

interface RegisterCredentials {
  name: string;
  type: 'restaurant' | 'hotel' | 'spa' | 'coffee shop' | 'activities' | 'other';
  email?: string;
  phone: string;
  ownerName: string;
  city: string;
  address: string;
  about: string;
  password: string;
  confirmPassword: string;
}

interface BusinessAuthResponse {
  token: string;
  business: {
    id: string;
    phone: string;
    name: string;
    role: 'business';
  };
}

interface RegisterResponse {
  business: {
    id: string;
    email?: string;
    name: string;
    ownerName: string;
    phone: string;
    type: string;
    address: string;
    city: string;
    status: string;
  };
  message: string;
}

export class BusinessAuthService {
  async register(credentials: RegisterCredentials): Promise<RegisterResponse> {
    this.validateRegisterInput(credentials);

    const existingBusiness = await Business.findOne({ phone: credentials.phone });
    if (existingBusiness) {
      throw new ConflictError('Phone number already registered as a business');
    }

    const email = credentials.email ? credentials.email.toLowerCase() : undefined;
    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new ConflictError('This email is registered as a user account');
      }
    }

    const hashedPassword = await bcrypt.hash(credentials.password, 10);

    const business = new Business({
      name: credentials.name,
      type: credentials.type,
      email,
      phone: credentials.phone,
      ownerName: credentials.ownerName,
      city: credentials.city,
      address: credentials.address,
      about: credentials.about,
      password: hashedPassword,
      accountType: 'business',
      status: 'inactive',
      businessModel: 'limited',
      // Self-registered businesses always get a fixed usage limit of 12.
      usageLimit: SELF_REGISTER_USAGE_LIMIT,
    });

    await business.save();
    logger.info(`New business registered: ${credentials.phone}`);

    return {
      business: {
        id: business._id.toString(),
        email: business.email,
        name: business.name,
        ownerName: business.ownerName,
        phone: business.phone,
        type: business.type,
        address: business.address,
        city: business.city,
        status: business.status,
      },
      message: 'Business account created successfully. Please wait for admin activation.',
    };
  }

  private validateRegisterInput(credentials: RegisterCredentials): void {
    if (!credentials.name || credentials.name.trim().length === 0) {
      throw new ValidationError('Restaurant name is required');
    }

    if (!credentials.ownerName || credentials.ownerName.trim().length === 0) {
      throw new ValidationError('Owner name is required');
    }

    if (credentials.email !== undefined && credentials.email !== null && credentials.email !== '' && !this.isValidEmail(credentials.email)) {
      throw new ValidationError('Invalid email format');
    }

    if (!credentials.phone || !this.isValidLebanesPhone(credentials.phone)) {
      throw new ValidationError('Invalid phone number. Format: 3 000 000 or 3000000');
    }

    if (!credentials.type || !['restaurant', 'hotel', 'spa', 'coffee shop', 'activity', 'other'].includes(credentials.type)) {
      throw new ValidationError('Invalid business type');
    }

    if (!credentials.city || credentials.city.trim().length === 0) {
      throw new ValidationError('City is required');
    }

    if (!credentials.address || credentials.address.trim().length === 0) {
      throw new ValidationError('Address is required');
    }

    if (!credentials.about || credentials.about.trim().length === 0) {
      throw new ValidationError('About section is required');
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

  async login(credentials: LoginCredentials): Promise<BusinessAuthResponse> {
    if (!credentials.phone || !this.isValidLebanesPhone(credentials.phone)) {
      throw new UnauthorizedError('Invalid phone number. Format: 3 000 000 or 3000000');
    }

    const business = await Business.findOne({
      phone: credentials.phone,
      $or: [{ accountType: 'business' }, { accountType: { $exists: false } }]
    });
    if (!business) {
      throw new UnauthorizedError('Invalid phone number or password');
    }

    if (!business.password) {
      throw new UnauthorizedError('Invalid phone number or password');
    }

    const passwordMatch = await bcrypt.compare(credentials.password, business.password);
    if (!passwordMatch) {
      throw new UnauthorizedError('Invalid phone number or password');
    }

    if (business.status !== 'active') {
      throw new UnauthorizedError('Your account is not active. Please contact support.');
    }

    const token = generateToken(business._id.toString(), business.phone, 'business');
    logger.info(`Business logged in: ${business.phone}`);

    return {
      token,
      business: {
        id: business._id.toString(),
        phone: business.phone,
        name: business.name,
        role: 'business',
      },
    };
  }
}

export const businessAuthService = new BusinessAuthService();
