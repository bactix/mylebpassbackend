import { Router } from 'express';
import { userController } from '../../controllers/app/userController';

const router = Router();

// Admin/Dashboard user management endpoints
router.get('/all', (req, res, next) => userController.getAllUsers(req, res, next));
router.get('/:id', (req, res, next) => userController.getUser(req, res, next));
router.put('/:id', (req, res, next) => userController.updateUser(req, res, next));
router.delete('/:id', (req, res, next) => userController.deleteUser(req, res, next));

export default router;
