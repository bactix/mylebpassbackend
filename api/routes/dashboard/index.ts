import { Router } from 'express';
import statsRoutes from './statsRoutes';
import authRoutes from './authRoutes';
import usersRoutes from './usersRoutes';
import businessRoutes from './businessRoutes';
import couponRoutes from './couponRoutes';

const router = Router();

router.use('/stats', statsRoutes);
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/businesses', businessRoutes);
router.use('/coupons', couponRoutes);

export default router;
