import { Router } from 'express';
import { userController } from '../../controllers/dashboard/userController';
import { authenticate } from '../../middlewares/authMiddleware';

const router = Router();

router.post('/', (req, res, next) => userController.createUser(req, res, next));
router.get('/', authenticate, (req, res, next) => userController.getAllUsers(req, res, next));
router.get('/:id', authenticate, (req, res, next) => userController.getUser(req, res, next));
router.put('/:id', authenticate, (req, res, next) => userController.updateUser(req, res, next));
router.post('/:id/renew', authenticate, (req, res, next) =>
  userController.renewUser(req, res, next)
);
router.delete('/:id', authenticate, (req, res, next) => userController.deleteUser(req, res, next));

export default router;
