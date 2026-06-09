import { Router } from 'express';
import { businessController } from '../../controllers/dashboard/businessController';
import { authenticate, requireRole } from '../../middlewares/authMiddleware';

const router = Router();

router.post('/', authenticate, requireRole('admin'), (req, res, next) =>
  businessController.createBusiness(req, res, next)
);
router.get('/', (req, res, next) => businessController.getAllBusinesses(req, res, next));
router.get('/search', (req, res, next) => businessController.searchByCategory(req, res, next));
router.get('/:id', (req, res, next) => businessController.getBusiness(req, res, next));
router.put('/:id', authenticate, requireRole('admin'), (req, res, next) =>
  businessController.updateBusiness(req, res, next)
);
router.get('/:id/usage-remaining', authenticate, requireRole('admin'), (req, res, next) =>
  businessController.getUsageRemaining(req, res, next)
);
router.delete('/:id', authenticate, requireRole('admin'), (req, res, next) =>
  businessController.deleteBusiness(req, res, next)
);

export default router;
