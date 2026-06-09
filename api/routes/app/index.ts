import { Router } from 'express';
// NOTE: The /users app API is temporarily disabled until it's rebuilt against
// the current Mongoose User model. Its files are excluded from the build in
// tsconfig.json (api/routes/app/userRoutes.ts, controllers/app/userController.ts,
// services/app/userService.ts). Re-enable by restoring these two lines, fixing
// those files, and removing the tsconfig excludes.
// import userRoutes from './userRoutes';
import authRoutes from './authRoutes';
import meRoutes from './meRoutes';
import businessMeRoutes from './businessMeRoutes';

const router = Router();

// router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/me', meRoutes);
router.use('/business/me', businessMeRoutes);

export default router;
