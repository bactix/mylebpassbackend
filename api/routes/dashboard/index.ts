import { Router } from 'express';
import statsRoutes from './statsRoutes';
import authRoutes from './authRoutes';
import usersRoutes from './usersRoutes';
import adminsRoutes from './adminsRoutes';
import businessRoutes from './businessRoutes';
import couponRoutes from './couponRoutes';
import discountRoutes from './discountRoutes';

const router = Router();

router.use('/stats', statsRoutes);
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/admins', adminsRoutes);
router.use('/businesses', businessRoutes);
router.use('/coupons', couponRoutes);
router.use('/discounts', discountRoutes);

export default router;
