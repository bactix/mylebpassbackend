import { Router } from 'express';
import { userController } from '../controllers/userController';

const router = Router();

router.post('/', (req, res, next) => userController.createUser(req, res, next));
router.get('/', (req, res, next) => userController.getAllUsers(req, res, next));
router.get('/:id', (req, res, next) => userController.getUser(req, res, next));
router.put('/:id', (req, res, next) => userController.updateUser(req, res, next));
router.delete('/:id', (req, res, next) => userController.deleteUser(req, res, next));

export default router;
