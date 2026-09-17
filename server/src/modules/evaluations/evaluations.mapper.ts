import type { Prisma } from '@prisma/client';
import type { EvaluationDetailDto, EvaluationSummaryDto } from 'shared';

type EvaluationWithScores = Prisma.EvaluationGetPayload<{
  include: { scores: { include: { criterion: true } } };
}>;

export function toEvaluationSummary(evaluation: EvaluationWithScores): EvaluationSummaryDto {
  return {
    id: evaluation.id,
    period: evaluation.period,
    status: evaluation.status,
    globalScore: evaluation.globalScore,
    createdAt: evaluation.createdAt.toISOString(),
    submittedAt: evaluation.submittedAt?.toISOString() ?? null,
    validatedAt: evaluation.validatedAt?.toISOString() ?? null,
  };
}

export function toEvaluationDetail(evaluation: EvaluationWithScores): EvaluationDetailDto {
  return {
    ...toEvaluationSummary(evaluation),
    supplierId: evaluation.supplierId,
    evaluatorId: evaluation.evaluatorId,
    comment: evaluation.comment,
    rejectionReason: evaluation.rejectionReason,
    scores: evaluation.scores.map((s) => ({
      criterionId: s.criterionId,
      criterionLabel: s.criterion.label,
      weight: s.criterion.weight,
      score: s.score,
    })),
  };
}
