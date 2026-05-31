import { Router } from 'express';
import { couponController } from '../../controllers/dashboard/couponController';
import { authenticate, requireRole } from '../../middlewares/authMiddleware';

const router = Router();

router.post('/', authenticate, requireRole('admin'), (req, res, next) =>
  couponController.createCoupon(req, res, next)
);
router.get('/', (req, res, next) => couponController.getAllCoupons(req, res, next));
router.get('/:id', (req, res, next) => couponController.getCoupon(req, res, next));
router.put('/:id', authenticate, requireRole('admin'), (req, res, next) =>
  couponController.updateCoupon(req, res, next)
);
router.delete('/:id', authenticate, requireRole('admin'), (req, res, next) =>
  couponController.deleteCoupon(req, res, next)
);
router.post('/:id/use', authenticate, requireRole('admin'), (req, res, next) =>
  couponController.useCoupon(req, res, next)
);
router.get('/:id/usage-stats', authenticate, requireRole('admin'), (req, res, next) =>
  couponController.getUsageStats(req, res, next)
);

export default router;
