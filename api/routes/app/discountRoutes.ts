import { Router } from 'express';
import { discountController } from '../../controllers/app/discountController';
import { authenticate, requireRole } from '../../middlewares/authMiddleware';

const router = Router();

// A business scans a member's QR code, so the scanner must be authenticated
// as a business. businessId is taken from the JWT; userId from the request body.
router.post('/', authenticate, requireRole('business'), (req, res, next) =>
  discountController.recordDiscount(req, res, next)
);

// List the discounts recorded at the authenticated business (paginated).
router.get('/', authenticate, requireRole('business'), (req, res, next) =>
  discountController.getMyDiscounts(req, res, next)
);

export default router;
