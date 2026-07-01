import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { businessService } from '../../services/dashboard/businessService';
import { Business, CreateBusinessInput, UpdateBusinessInput } from '../../models/Business';
import { ResponseHelper } from '../../helpers/response';

export class BusinessController {
  async createBusiness(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: CreateBusinessInput = req.body;
      const business = await businessService.createBusiness(data);
      res.status(201).json(ResponseHelper.success(business, 'Business created successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getBusiness(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const business = await businessService.getBusiness(id);
      res.status(200).json(ResponseHelper.success(business));
    } catch (error) {
      next(error);
    }
  }

  async getAllBusinesses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const type = req.query.type as string | undefined;
      const city = req.query.city as string | undefined;

      const result = await businessService.getAllBusinesses(page, limit, type, city);
      res.status(200).json(ResponseHelper.success(result));
    } catch (error) {
      next(error);
    }
  }

  async searchByCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = req.query.category as string | undefined;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await businessService.getAllBusinesses(page, limit, category, undefined);
      res.status(200).json(ResponseHelper.success(result));
    } catch (error) {
      next(error);
    }
  }

  async updateBusiness(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateBusinessInput = req.body;
      const business = await businessService.updateBusiness(id, data);
      res.status(200).json(ResponseHelper.success(business, 'Business updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  async deleteBusiness(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const existing = await Business.findById(id);
      if (existing) {
        if (existing.profilePicture) {
          const p = path.join(process.cwd(), existing.profilePicture);
          if (fs.existsSync(p)) fs.unlinkSync(p);
        }
        for (const photo of existing.gallery ?? []) {
          const p = path.join(process.cwd(), photo);
          if (fs.existsSync(p)) fs.unlinkSync(p);
        }
      }

      const business = await businessService.deleteBusiness(id);
      res.status(200).json(ResponseHelper.success(business, 'Business deleted successfully'));
    } catch (error) {
      next(error);
    }
  }

  async deleteAllBusinesses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.query.confirm !== 'true') {
        res
          .status(400)
          .json(ResponseHelper.error('This permanently deletes ALL businesses. Pass ?confirm=true to proceed.'));
        return;
      }

      const businesses = await Business.find({}, { profilePicture: 1, gallery: 1 });
      const result = await businessService.deleteAllBusinesses();

      for (const b of businesses) {
        if (b.profilePicture) {
          const p = path.join(process.cwd(), b.profilePicture);
          if (fs.existsSync(p)) fs.unlinkSync(p);
        }
        for (const photo of b.gallery ?? []) {
          const p = path.join(process.cwd(), photo);
          if (fs.existsSync(p)) fs.unlinkSync(p);
        }
      }

      res.status(200).json(ResponseHelper.success(result, `Deleted ${result.deletedCount} business(es)`));
    } catch (error) {
      next(error);
    }
  }

  async uploadProfilePicture(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const file = req.file;
      if (!file) {
        res.status(400).json(ResponseHelper.error('No file uploaded'));
        return;
      }

      const existing = await Business.findById(id);
      if (!existing) {
        res.status(404).json(ResponseHelper.error('Business not found'));
        return;
      }

      if (existing.profilePicture) {
        const oldPath = path.join(process.cwd(), existing.profilePicture);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      const relativePath = path.join('uploads', 'businesses', id, file.filename).replace(/\\/g, '/');
      const business = await businessService.updateProfilePicture(id, relativePath);
      res.status(200).json(ResponseHelper.success(business, 'Profile picture updated'));
    } catch (error) {
      next(error);
    }
  }

  async uploadGallery(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const files = req.files as Express.Multer.File[] | undefined;
      if (!files || files.length === 0) {
        res.status(400).json(ResponseHelper.error('No files uploaded'));
        return;
      }

      const existing = await Business.findById(id);
      if (!existing) {
        res.status(404).json(ResponseHelper.error('Business not found'));
        return;
      }

      const currentCount = existing.gallery?.length ?? 0;
      const availableSlots = 3 - currentCount;

      if (availableSlots === 0) {
        res.status(400).json(ResponseHelper.error('Gallery is full (3/3). Delete a photo first.'));
        return;
      }
      if (files.length > availableSlots) {
        res.status(400).json(ResponseHelper.error(`Only ${availableSlots} slot(s) available in the gallery.`));
        return;
      }

      const relativePaths = files.map(f =>
        path.join('uploads', 'businesses', id, f.filename).replace(/\\/g, '/')
      );
      const business = await businessService.addGalleryImages(id, relativePaths);
      res.status(200).json(ResponseHelper.success(business, 'Gallery updated'));
    } catch (error) {
      next(error);
    }
  }

  async removeGalleryImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const index = parseInt(req.params.index, 10);
      if (isNaN(index) || index < 0) {
        res.status(400).json(ResponseHelper.error('Invalid image index'));
        return;
      }

      const existing = await Business.findById(id);
      if (!existing) {
        res.status(404).json(ResponseHelper.error('Business not found'));
        return;
      }

      const gallery = existing.gallery ?? [];
      if (index >= gallery.length) {
        res.status(404).json(ResponseHelper.error('Photo not found'));
        return;
      }

      const photoPath = path.join(process.cwd(), gallery[index]);
      if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath);

      const business = await businessService.removeGalleryImage(id, index);
      res.status(200).json(ResponseHelper.success(business, 'Gallery image removed'));
    } catch (error) {
      next(error);
    }
  }

  async getUsageRemaining(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const usage = await businessService.getUsageRemaining(id);
      res.status(200).json(ResponseHelper.success(usage));
    } catch (error) {
      next(error);
    }
  }
}

export const businessController = new BusinessController();
