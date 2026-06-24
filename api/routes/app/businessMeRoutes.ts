import { Router } from 'express';
import { businessMeController } from '../../controllers/app/businessMeController';
import { authenticate, requireRole } from '../../middlewares/authMiddleware';
import { uploadBusinessProfile, uploadProfilePicture, uploadGallery } from '../../middlewares/uploadMiddleware';

const router = Router();

router.get('/', authenticate, requireRole('business'), (req, res, next) => businessMeController.getProfile(req, res, next));
router.put('/', authenticate, requireRole('business'), uploadBusinessProfile, (req, res, next) => businessMeController.updateProfile(req, res, next));
router.put('/profile-picture', authenticate, requireRole('business'), uploadProfilePicture, (req, res, next) => businessMeController.updateProfilePicture(req, res, next));
router.put('/photos', authenticate, requireRole('business'), uploadGallery, (req, res, next) => businessMeController.updatePhotos(req, res, next));
router.delete('/photos/:index', authenticate, requireRole('business'), (req, res, next) => businessMeController.deletePhoto(req, res, next));
router.delete('/', authenticate, requireRole('business'), (req, res, next) => businessMeController.deleteAccount(req, res, next));

export default router;
