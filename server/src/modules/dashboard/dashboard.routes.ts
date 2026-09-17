import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { getDashboardData } from './dashboard.service.js';

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

dashboardRouter.get('/', async (_req, res, next) => {
  try {
    const data = await getDashboardData();
    res.json(data);
  } catch (err) {
    next(err);
  }
});
