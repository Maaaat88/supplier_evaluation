import type { Prisma } from '@prisma/client';
import type { CreateSupplierInput, SupplierListItemDto, SupplierListQuery } from 'shared';
import { AppError } from '../../errors/AppError.js';
import { prisma } from '../../lib/prisma.js';
import { toEvaluationSummary } from '../evaluations/evaluations.mapper.js';

const PAGE_SIZE = 20;

function compareItems(
  a: SupplierListItemDto,
  b: SupplierListItemDto,
  sortBy: SupplierListQuery['sortBy'],
  sortOrder: SupplierListQuery['sortOrder'],
): number {
  const direction = sortOrder === 'desc' ? -1 : 1;

  if (sortBy === 'name') {
    return a.name.localeCompare(b.name) * direction;
  }

  const key = sortBy === 'averageScore' ? 'averageScore' : 'lastEvaluationDate';
  const aValue = a[key];
  const bValue = b[key];

  if (aValue === null && bValue === null) return 0;
  if (aValue === null) return 1;
  if (bValue === null) return -1;

  return (aValue < bValue ? -1 : aValue > bValue ? 1 : 0) * direction;
}

export async function listSuppliers(query: SupplierListQuery) {
  const { page, search, category, status, sortBy, sortOrder } = query;

  const where: Prisma.SupplierWhereInput = {
    ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
    ...(category ? { category } : {}),
    ...(status ? { status } : {}),
  };

  const suppliers = await prisma.supplier.findMany({ where });
  const supplierIds = suppliers.map((s) => s.id);

  const aggregates = await prisma.evaluation.groupBy({
    by: ['supplierId'],
    where: { supplierId: { in: supplierIds }, status: 'VALIDATED' },
    _avg: { globalScore: true },
    _max: { validatedAt: true },
  });
  const aggregateBySupplierId = new Map(aggregates.map((a) => [a.supplierId, a]));

  const items: SupplierListItemDto[] = suppliers.map((supplier) => {
    const aggregate = aggregateBySupplierId.get(supplier.id);
    return {
      id: supplier.id,
      name: supplier.name,
      category: supplier.category,
      status: supplier.status,
      averageScore: aggregate?._avg.globalScore ?? null,
      lastEvaluationDate: aggregate?._max.validatedAt?.toISOString() ?? null,
    };
  });

  items.sort((a, b) => compareItems(a, b, sortBy, sortOrder));

  const total = items.length;
  const start = (page - 1) * PAGE_SIZE;
  const paginated = items.slice(start, start + PAGE_SIZE);

  return { items: paginated, total, page, pageSize: PAGE_SIZE };
}

export async function getSupplierById(id: string) {
  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: {
      evaluations: {
        where: { status: { in: ['SUBMITTED', 'VALIDATED'] } },
        orderBy: { createdAt: 'desc' },
        include: { scores: { include: { criterion: true } } },
      },
    },
  });

  if (!supplier) {
    throw AppError.notFound('Fournisseur introuvable');
  }

  const validated = supplier.evaluations.filter((e) => e.status === 'VALIDATED');
  const averageScore = validated.length
    ? Math.round(
        (validated.reduce((sum, e) => sum + (e.globalScore ?? 0), 0) / validated.length) * 100,
      ) / 100
    : null;

  return {
    id: supplier.id,
    name: supplier.name,
    category: supplier.category,
    country: supplier.country,
    contactEmail: supplier.contactEmail,
    contactPhone: supplier.contactPhone,
    status: supplier.status,
    averageScore,
    evaluations: supplier.evaluations.map(toEvaluationSummary),
  };
}

export async function createSupplier(input: CreateSupplierInput) {
  const supplier = await prisma.supplier.create({ data: input });
  return supplier;
}
