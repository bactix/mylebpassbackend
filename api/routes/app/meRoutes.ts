import { Router } from 'express';
import { meController } from '../../controllers/app/meController';
import { authenticate, requireRole } from '../../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticate, requireRole('user'), (req, res, next) => meController.getProfile(req, res, next));
router.delete('/', authenticate, requireRole('user'), (req, res, next) => meController.deleteAccount(req, res, next));

export default router;
