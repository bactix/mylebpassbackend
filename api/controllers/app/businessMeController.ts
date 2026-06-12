import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { businessService } from '../../services/dashboard/businessService';
import { ResponseHelper } from '../../helpers/response';
import { Business, BusinessType, LebanesCity } from '../../models/Business';

interface UpdateProfileBody {
  name?: string;
  type?: BusinessType;
  phone?: string;
  ownerName?: string;
  city?: LebanesCity;
  address?: string;
  about?: string;
}

export class BusinessMeController {
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const business = await businessService.getBusiness(req.user!.id);
      res.status(200).json(ResponseHelper.success(business));
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, type, phone, ownerName, city, address, about } = req.body as UpdateProfileBody;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

      const business = await Business.findById(req.user!.id);
      if (!business) {
        res.status(404).json(ResponseHelper.error('Business not found'));
        return;
      }

      // Handle profile picture upload
      const profilePictureFile = files?.profilePicture?.[0];
      if (profilePictureFile) {
        if (business.profilePicture) {
          const oldPath = path.join(process.cwd(), business.profilePicture);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        business.profilePicture = path
          .join('uploads', 'businesses', req.user!.id, profilePictureFile.filename)
          .replace(/\\/g, '/');
      }

      // Handle gallery upload
      const galleryFiles = files?.gallery;
      if (galleryFiles && galleryFiles.length > 0) {
        if (business.gallery && business.gallery.length > 0) {
          for (const oldGalleryPath of business.gallery) {
            const oldPath = path.join(process.cwd(), oldGalleryPath);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
          }
        }
        business.gallery = galleryFiles.map(f =>
          path.join('uploads', 'businesses', req.user!.id, f.filename).replace(/\\/g, '/')
        );
      }

      // Apply text field changes
      if (name !== undefined) business.name = name;
      if (type !== undefined) business.type = type;
      if (phone !== undefined) business.phone = phone;
      if (ownerName !== undefined) business.ownerName = ownerName;
      if (city !== undefined) business.city = city;
      if (address !== undefined) business.address = address;
      if (about !== undefined) business.about = about;

      await business.save();

      const updated = await businessService.getBusiness(req.user!.id);
      res.status(200).json(ResponseHelper.success(updated, 'Profile updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  async deleteAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await businessService.deleteBusiness(req.user!.id);
      res.status(200).json(ResponseHelper.success(null, 'Account deleted successfully'));
    } catch (error) {
      next(error);
    }
  }
}

export const businessMeController = new BusinessMeController();
