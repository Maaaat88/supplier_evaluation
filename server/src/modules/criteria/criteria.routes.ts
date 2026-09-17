import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { prisma } from '../../lib/prisma.js';

export const criteriaRouter = Router();

criteriaRouter.use(requireAuth);

criteriaRouter.get('/', async (_req, res, next) => {
  try {
    const criteria = await prisma.criterion.findMany({ orderBy: { label: 'asc' } });
    res.json(criteria);
  } catch (err) {
    next(err);
  }
});
