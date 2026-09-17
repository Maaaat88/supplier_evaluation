import { Router } from 'express';
import {
  evaluationInputSchema,
  evaluationListQuerySchema,
  rejectEvaluationSchema,
  type EvaluationListQuery,
} from 'shared';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import {
  createEvaluation,
  getEvaluationById,
  listEvaluations,
  listPendingEvaluations,
  rejectEvaluation,
  submitEvaluation,
  updateEvaluation,
  validateEvaluation,
} from './evaluations.service.js';

export const evaluationsRouter = Router();

evaluationsRouter.use(requireAuth);

evaluationsRouter.get('/', validate(evaluationListQuerySchema, 'query'), async (req, res, next) => {
  try {
    const evaluations = await listEvaluations(
      req.user!,
      req.query as unknown as EvaluationListQuery,
    );
    res.json(evaluations);
  } catch (err) {
    next(err);
  }
});

evaluationsRouter.get('/pending', requireRole('ADMIN'), async (_req, res, next) => {
  try {
    const evaluations = await listPendingEvaluations();
    res.json(evaluations);
  } catch (err) {
    next(err);
  }
});

evaluationsRouter.get('/:id', async (req, res, next) => {
  try {
    const evaluation = await getEvaluationById(req.params.id!, req.user!);
    res.json(evaluation);
  } catch (err) {
    next(err);
  }
});

evaluationsRouter.post('/', validate(evaluationInputSchema), async (req, res, next) => {
  try {
    const evaluation = await createEvaluation(req.user!.id, req.body);
    res.status(201).json(evaluation);
  } catch (err) {
    next(err);
  }
});

evaluationsRouter.patch('/:id', validate(evaluationInputSchema), async (req, res, next) => {
  try {
    const evaluation = await updateEvaluation(req.params.id!, req.user!.id, req.body);
    res.json(evaluation);
  } catch (err) {
    next(err);
  }
});

evaluationsRouter.post('/:id/submit', async (req, res, next) => {
  try {
    const evaluation = await submitEvaluation(req.params.id!, req.user!.id);
    res.json(evaluation);
  } catch (err) {
    next(err);
  }
});

evaluationsRouter.post('/:id/validate', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const evaluation = await validateEvaluation(req.params.id!);
    res.json(evaluation);
  } catch (err) {
    next(err);
  }
});

evaluationsRouter.post(
  '/:id/reject',
  requireRole('ADMIN'),
  validate(rejectEvaluationSchema),
  async (req, res, next) => {
    try {
      const evaluation = await rejectEvaluation(req.params.id!, req.body.rejectionReason);
      res.json(evaluation);
    } catch (err) {
      next(err);
    }
  },
);
