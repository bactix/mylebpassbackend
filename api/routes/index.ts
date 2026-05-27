import { Router } from 'express';
import appRoutes from './app';
import dashboardRoutes from './dashboard';

const router = Router();

// App API routes
router.use('/app', appRoutes);

// Dashboard API routes
router.use('/dashboard', dashboardRoutes);

export default router;
