import { Router } from 'express';
import { discountController } from '../../controllers/dashboard/discountController';
import { authenticate, requireRole } from '../../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticate, requireRole('admin'), (req, res, next) =>
  discountController.getAllDiscounts(req, res, next)
);
router.get('/:id', authenticate, requireRole('admin'), (req, res, next) =>
  discountController.getDiscount(req, res, next)
);

export default router;
