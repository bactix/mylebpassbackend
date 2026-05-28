import { Router } from 'express';
import { authController } from '../../controllers/dashboard/authController';

const router = Router();

router.post('/', (req, res, next) => authController.login(req, res, next));

export default router;
