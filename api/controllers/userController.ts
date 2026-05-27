import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/userService';
import { ResponseHelper } from '../helpers/response';
import { CreateUserInput, UpdateUserInput } from '../models/User';

export class UserController {
  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: CreateUserInput = req.body;
      const user = await userService.createUser(data);
      res.status(201).json(ResponseHelper.success(user, 'User created successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      res.status(200).json(ResponseHelper.success(user));
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await userService.getAllUsers();
      res.status(200).json(ResponseHelper.success(users));
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateUserInput = req.body;
      const user = await userService.updateUser(id, data);
      res.status(200).json(ResponseHelper.success(user, 'User updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await userService.deleteUser(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
