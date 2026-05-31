import bcrypt from 'bcryptjs';
import { Admin, CreateAdminInput, UpdateAdminInput, AdminResponse } from '../../models/Admin';
import { AdminValidation } from '../../validations/adminValidation';
import { ConflictError, NotFoundError } from '../../helpers/errors';
import logger from '../../config/logger';

export class AdminService {
  async createAdmin(data: CreateAdminInput): Promise<AdminResponse> {
    AdminValidation.validateCreateAdmin(data);

    const existingAdmin = await Admin.findOne({ email: data.email.toLowerCase() });
    if (existingAdmin) {
      throw new ConflictError('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const admin = new Admin({
      email: data.email.toLowerCase(),
      password: hashedPassword,
    });

    await admin.save();
    logger.info(`Admin created: ${admin.email}`);
    return this.mapToResponse(admin);
  }

  async updateAdmin(id: string, data: UpdateAdminInput): Promise<AdminResponse> {
    AdminValidation.validateUpdateAdmin(data);

    const updateData: any = {};
    if (data.email !== undefined) {
      const email = data.email.toLowerCase();
      const existingAdmin = await Admin.findOne({ email, _id: { $ne: id } });
      if (existingAdmin) {
        throw new ConflictError('Email already exists');
      }
      updateData.email = email;
    }
    if (data.password !== undefined) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const admin = await Admin.findByIdAndUpdate(id, updateData, { new: true });
    if (!admin) {
      throw new NotFoundError('Admin not found');
    }

    logger.info(`Admin updated: ${admin.email}`);
    return this.mapToResponse(admin);
  }

  async getAllAdmins(page: number = 1, limit: number = 20): Promise<{ data: AdminResponse[]; pagination: any }> {
    const skip = (page - 1) * limit;

    const admins = await Admin.find().skip(skip).limit(limit).sort({ createdAt: -1 });
    const total = await Admin.countDocuments();

    return {
      data: admins.map(a => this.mapToResponse(a)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  private mapToResponse(admin: any): AdminResponse {
    return {
      id: admin._id.toString(),
      email: admin.email,
      createdAt: admin.createdAt.toISOString(),
      updatedAt: admin.updatedAt.toISOString(),
    };
  }
}

export const adminService = new AdminService();
