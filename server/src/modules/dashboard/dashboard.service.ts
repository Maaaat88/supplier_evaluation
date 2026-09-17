import { roundScore, SUPPLIER_CATEGORIES, SUPPLIER_STATUSES, type SupplierCategory } from 'shared';
import { prisma } from '../../lib/prisma.js';

function average(values: number[]): number {
  return roundScore(values.reduce((sum, v) => sum + v, 0) / values.length);
}

export async function getDashboardData() {
  const suppliers = await prisma.supplier.findMany({ select: { status: true } });
  const suppliersByStatus = Object.fromEntries(
    SUPPLIER_STATUSES.map((status) => [status, 0]),
  ) as Record<(typeof SUPPLIER_STATUSES)[number], number>;
  for (const supplier of suppliers) {
    suppliersByStatus[supplier.status] += 1;
  }

  const validatedEvaluations = await prisma.evaluation.findMany({
    where: { status: 'VALIDATED' },
    select: {
      globalScore: true,
      supplier: { select: { id: true, name: true, category: true } },
    },
  });

  const averageScore = validatedEvaluations.length
    ? average(validatedEvaluations.map((e) => e.globalScore ?? 0))
    : null;

  const scoresBySupplier = new Map<string, { name: string; scores: number[] }>();
  const scoresByCategory = new Map<SupplierCategory, number[]>();
  for (const evaluation of validatedEvaluations) {
    const score = evaluation.globalScore ?? 0;

    const supplierEntry = scoresBySupplier.get(evaluation.supplier.id) ?? {
      name: evaluation.supplier.name,
      scores: [],
    };
    supplierEntry.scores.push(score);
    scoresBySupplier.set(evaluation.supplier.id, supplierEntry);

    const categoryScores = scoresByCategory.get(evaluation.supplier.category) ?? [];
    categoryScores.push(score);
    scoresByCategory.set(evaluation.supplier.category, categoryScores);
  }

  const supplierAverages = Array.from(scoresBySupplier.entries()).map(([id, { name, scores }]) => ({
    id,
    name,
    averageScore: average(scores),
  }));

  const topSuppliers = [...supplierAverages]
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, 5);
  const bottomSuppliers = [...supplierAverages]
    .sort((a, b) => a.averageScore - b.averageScore)
    .slice(0, 5);

  const scoresByCategoryDto = SUPPLIER_CATEGORIES.map((category) => {
    const scores = scoresByCategory.get(category) ?? [];
    return {
      category,
      averageScore: scores.length ? average(scores) : null,
    };
  });

  const pendingEvaluationsCount = await prisma.evaluation.count({
    where: { status: 'SUBMITTED' },
  });

  return {
    suppliersByStatus,
    averageScore,
    topSuppliers,
    bottomSuppliers,
    scoresByCategory: scoresByCategoryDto,
    pendingEvaluationsCount,
  };
}
