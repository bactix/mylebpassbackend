import { Router } from 'express';
import { couponController } from '../../controllers/dashboard/couponController';
import { authenticate } from '../../middlewares/authMiddleware';

const router = Router();

router.post('/', authenticate, (req, res, next) =>
  couponController.createCoupon(req, res, next)
);
router.get('/', (req, res, next) => couponController.getAllCoupons(req, res, next));
router.get('/:id', (req, res, next) => couponController.getCoupon(req, res, next));
router.put('/:id', authenticate, (req, res, next) =>
  couponController.updateCoupon(req, res, next)
);
router.delete('/:id', authenticate, (req, res, next) =>
  couponController.deleteCoupon(req, res, next)
);
router.post('/:id/use', authenticate, (req, res, next) =>
  couponController.useCoupon(req, res, next)
);
router.get('/:id/usage-stats', authenticate, (req, res, next) =>
  couponController.getUsageStats(req, res, next)
);

export default router;
