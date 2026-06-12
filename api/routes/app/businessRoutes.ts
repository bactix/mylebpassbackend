import { Router } from 'express';
import { businessController } from '../../controllers/app/businessController';
import { authenticate, requireRole } from '../../middlewares/authMiddleware';

const router = Router();

router.get('/:id', authenticate, requireRole('user'), (req, res, next) =>
  businessController.getBusinessDetails(req, res, next)
);

export default router;
