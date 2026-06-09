import { Router } from 'express';
import { logoutController } from '../../controllers/app/logoutController';
import { authenticateToken } from '../../middleware/auth';

const router = Router();

router.post('/', authenticateToken, (req, res, next) => logoutController.logout(req, res, next));

export default router;
