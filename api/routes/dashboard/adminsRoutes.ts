import { Router } from 'express';
import { adminController } from '../../controllers/dashboard/adminController';
import { authenticate, requireRole } from '../../middlewares/authMiddleware';

const router = Router();

router.post('/', (req, res, next) => adminController.createAdmin(req, res, next));
router.get('/', authenticate, requireRole('admin'), (req, res, next) => adminController.getAllAdmins(req, res, next));
router.put('/:id', authenticate, requireRole('admin'), (req, res, next) => adminController.updateAdmin(req, res, next));

export default router;
