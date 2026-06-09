import { Router } from 'express';
import { businessMeController } from '../../controllers/app/businessMeController';
import { authenticate, requireRole } from '../../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticate, requireRole('business'), (req, res, next) => businessMeController.getProfile(req, res, next));
router.delete('/', authenticate, requireRole('business'), (req, res, next) => businessMeController.deleteAccount(req, res, next));

export default router;
