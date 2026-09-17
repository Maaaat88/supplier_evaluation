import { z } from 'zod';

export const PERIOD_REGEX = /^\d{4}-Q[1-4]$/;

export const evaluationScoreInputSchema = z.object({
  criterionId: z.string().min(1),
  score: z.coerce.number().int().min(1, 'La note minimale est 1').max(5, 'La note maximale est 5'),
});

export const evaluationInputSchema = z.object({
  supplierId: z.string().min(1, 'Le fournisseur est requis'),
  period: z.string().regex(PERIOD_REGEX, 'Format attendu : AAAA-Qn (ex : 2026-Q1)'),
  comment: z.string().trim().max(2000).optional(),
  scores: z
    .array(evaluationScoreInputSchema)
    .min(1, 'Au moins une note est requise')
    .refine(
      (scores) => new Set(scores.map((s) => s.criterionId)).size === scores.length,
      "Chaque critère ne peut être noté qu'une seule fois",
    ),
});

export type EvaluationInput = z.infer<typeof evaluationInputSchema>;

export const rejectEvaluationSchema = z.object({
  rejectionReason: z.string().trim().min(1, 'Un motif est requis').max(1000),
});

export type RejectEvaluationInput = z.infer<typeof rejectEvaluationSchema>;

export const evaluationListQuerySchema = z.object({
  supplierId: z.string().min(1).optional(),
  mine: z.coerce.boolean().optional(),
});

export type EvaluationListQuery = z.infer<typeof evaluationListQuerySchema>;
