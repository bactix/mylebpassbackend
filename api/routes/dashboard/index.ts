import { Router } from 'express';
import statsRoutes from './statsRoutes';
import usersRoutes from './usersRoutes';

const router = Router();

router.use('/stats', statsRoutes);
router.use('/users', usersRoutes);

export default router;
