import type { Prisma } from '@prisma/client';
import type { EvaluationInput, EvaluationListQuery, Role } from 'shared';
import { AppError } from '../../errors/AppError.js';
import { prisma } from '../../lib/prisma.js';
import { toEvaluationDetail } from './evaluations.mapper.js';
import { computeGlobalScore } from './scoring.js';

const evaluationInclude = {
  scores: { include: { criterion: true } },
} satisfies Prisma.EvaluationInclude;

interface Requester {
  id: string;
  role: Role;
}

async function resolveGlobalScore(scores: EvaluationInput['scores']) {
  const criteria = await prisma.criterion.findMany({
    where: { id: { in: scores.map((s) => s.criterionId) } },
  });
  if (criteria.length !== scores.length) {
    throw AppError.badRequest('Un ou plusieurs critères sont invalides');
  }

  const criteriaById = new Map(criteria.map((c) => [c.id, c]));
  return computeGlobalScore(
    scores.map((s) => ({ score: s.score, weight: criteriaById.get(s.criterionId)!.weight })),
  );
}

export async function listEvaluations(requester: Requester, filters: EvaluationListQuery) {
  const where: Prisma.EvaluationWhereInput = {};
  if (filters.supplierId) {
    where.supplierId = filters.supplierId;
  }

  if (filters.mine) {
    where.evaluatorId = requester.id;
  } else if (requester.role !== 'ADMIN') {
    where.OR = [{ status: 'VALIDATED' }, { evaluatorId: requester.id }];
  }

  const evaluations = await prisma.evaluation.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: evaluationInclude,
  });

  return evaluations.map(toEvaluationDetail);
}

export async function getEvaluationById(id: string, requester: Requester) {
  const evaluation = await prisma.evaluation.findUnique({
    where: { id },
    include: evaluationInclude,
  });
  if (!evaluation) {
    throw AppError.notFound('Évaluation introuvable');
  }

  const canView =
    requester.role === 'ADMIN' ||
    evaluation.evaluatorId === requester.id ||
    evaluation.status === 'VALIDATED';
  if (!canView) {
    throw AppError.forbidden();
  }

  return toEvaluationDetail(evaluation);
}

export async function createEvaluation(evaluatorId: string, input: EvaluationInput) {
  const supplier = await prisma.supplier.findUnique({ where: { id: input.supplierId } });
  if (!supplier) {
    throw AppError.badRequest('Fournisseur introuvable');
  }

  const existing = await prisma.evaluation.findUnique({
    where: {
      supplierId_evaluatorId_period: {
        supplierId: input.supplierId,
        evaluatorId,
        period: input.period,
      },
    },
  });
  if (existing) {
    throw AppError.conflict('Une évaluation existe déjà pour ce fournisseur et cette période');
  }

  const globalScore = await resolveGlobalScore(input.scores);

  const evaluation = await prisma.evaluation.create({
    data: {
      supplierId: input.supplierId,
      evaluatorId,
      period: input.period,
      comment: input.comment,
      globalScore,
      scores: {
        create: input.scores.map((s) => ({ criterionId: s.criterionId, score: s.score })),
      },
    },
    include: evaluationInclude,
  });

  return toEvaluationDetail(evaluation);
}

export async function updateEvaluation(id: string, requesterId: string, input: EvaluationInput) {
  const evaluation = await prisma.evaluation.findUnique({ where: { id } });
  if (!evaluation) {
    throw AppError.notFound('Évaluation introuvable');
  }
  if (evaluation.evaluatorId !== requesterId) {
    throw AppError.forbidden();
  }
  if (evaluation.status !== 'DRAFT') {
    throw AppError.conflict('Seul un brouillon peut être modifié');
  }

  const globalScore = await resolveGlobalScore(input.scores);

  const updated = await prisma.$transaction(async (tx) => {
    await tx.evaluationScore.deleteMany({ where: { evaluationId: id } });
    return tx.evaluation.update({
      where: { id },
      data: {
        period: input.period,
        comment: input.comment,
        globalScore,
        scores: {
          create: input.scores.map((s) => ({ criterionId: s.criterionId, score: s.score })),
        },
      },
      include: evaluationInclude,
    });
  });

  return toEvaluationDetail(updated);
}

export async function submitEvaluation(id: string, requesterId: string) {
  const evaluation = await prisma.evaluation.findUnique({
    where: { id },
    include: { scores: true },
  });
  if (!evaluation) {
    throw AppError.notFound('Évaluation introuvable');
  }
  if (evaluation.evaluatorId !== requesterId) {
    throw AppError.forbidden();
  }
  if (evaluation.status !== 'DRAFT') {
    throw AppError.conflict('Seul un brouillon peut être soumis');
  }

  const criteriaCount = await prisma.criterion.count();
  if (evaluation.scores.length < criteriaCount) {
    throw AppError.badRequest('Tous les critères doivent être notés avant soumission');
  }

  const updated = await prisma.evaluation.update({
    where: { id },
    data: { status: 'SUBMITTED', submittedAt: new Date(), rejectionReason: null },
    include: evaluationInclude,
  });

  return toEvaluationDetail(updated);
}

export async function validateEvaluation(id: string) {
  const evaluation = await prisma.evaluation.findUnique({ where: { id } });
  if (!evaluation) {
    throw AppError.notFound('Évaluation introuvable');
  }
  if (evaluation.status !== 'SUBMITTED') {
    throw AppError.conflict('Seule une évaluation soumise peut être validée');
  }

  const updated = await prisma.evaluation.update({
    where: { id },
    data: { status: 'VALIDATED', validatedAt: new Date() },
    include: evaluationInclude,
  });

  return toEvaluationDetail(updated);
}

export async function rejectEvaluation(id: string, rejectionReason: string) {
  const evaluation = await prisma.evaluation.findUnique({ where: { id } });
  if (!evaluation) {
    throw AppError.notFound('Évaluation introuvable');
  }
  if (evaluation.status !== 'SUBMITTED') {
    throw AppError.conflict('Seule une évaluation soumise peut être renvoyée en brouillon');
  }

  const updated = await prisma.evaluation.update({
    where: { id },
    data: { status: 'DRAFT', submittedAt: null, rejectionReason },
    include: evaluationInclude,
  });

  return toEvaluationDetail(updated);
}

export async function listPendingEvaluations() {
  const evaluations = await prisma.evaluation.findMany({
    where: { status: 'SUBMITTED' },
    orderBy: { submittedAt: 'asc' },
    include: {
      ...evaluationInclude,
      supplier: { select: { name: true } },
      evaluator: { select: { firstName: true, lastName: true } },
    },
  });

  return evaluations.map((evaluation) => ({
    ...toEvaluationDetail(evaluation),
    supplierName: evaluation.supplier.name,
    evaluatorName: `${evaluation.evaluator.firstName} ${evaluation.evaluator.lastName}`,
  }));
}
