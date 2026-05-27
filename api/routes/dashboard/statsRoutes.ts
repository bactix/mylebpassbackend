import { Router, Request, Response } from 'express';
import { ResponseHelper } from '../../helpers/response';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const stats = {
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    growthRate: 0,
  };
  res.status(200).json(ResponseHelper.success(stats));
});

router.get('/daily', (_req: Request, res: Response) => {
  const dailyStats = {
    date: new Date().toISOString().split('T')[0],
    newUsers: 0,
    activeUsers: 0,
    revenue: 0,
  };
  res.status(200).json(ResponseHelper.success(dailyStats));
});

export default router;
