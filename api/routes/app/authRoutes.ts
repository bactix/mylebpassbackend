import { Router } from 'express';
import { appAuthController } from '../../controllers/app/authController';
import { logoutController } from '../../controllers/app/logoutController';
import { authenticateToken } from '../../middleware/auth';

const router = Router();

router.post('/user/register', (req, res, next) => appAuthController.userRegister(req, res, next));
router.post('/user', (req, res, next) => appAuthController.userLogin(req, res, next));
router.post('/business/register', (req, res, next) => appAuthController.businessRegister(req, res, next));
router.post('/business', (req, res, next) => appAuthController.businessLogin(req, res, next));
router.post('/logout', authenticateToken, (req, res, next) => logoutController.logout(req, res, next));

export default router;
