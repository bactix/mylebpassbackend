import { Router } from 'express';
import { businessStatsController } from '../../controllers/app/businessStatsController';
import { authenticate, requireRole } from '../../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticate, requireRole('business'), (req, res, next) =>
  businessStatsController.getStats(req, res, next)
);

export default router;
