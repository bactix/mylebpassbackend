import { Router } from 'express';
import { businessController } from '../../controllers/dashboard/businessController';
import { authenticate } from '../../middlewares/authMiddleware';

const router = Router();

router.post('/', (req, res, next) => businessController.createBusiness(req, res, next));
router.get('/', (req, res, next) => businessController.getAllBusinesses(req, res, next));
router.get('/:id', (req, res, next) => businessController.getBusiness(req, res, next));
router.put('/:id', authenticate, (req, res, next) =>
  businessController.updateBusiness(req, res, next)
);
router.get('/:id/usage-remaining', authenticate, (req, res, next) =>
  businessController.getUsageRemaining(req, res, next)
);

export default router;
