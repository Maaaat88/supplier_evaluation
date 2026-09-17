// Ces valeurs doivent rester synchronisées avec les enums Prisma
// (server/prisma/schema.prisma). Elles sont dupliquées ici volontairement :
// le frontend ne doit jamais dépendre de @prisma/client.

export const ROLES = ['EVALUATOR', 'ADMIN'] as const;
export type Role = (typeof ROLES)[number];

export const SUPPLIER_CATEGORIES = [
  'RAW_MATERIALS',
  'PACKAGING',
  'LOGISTICS',
  'SERVICES',
  'EQUIPMENT',
] as const;
export type SupplierCategory = (typeof SUPPLIER_CATEGORIES)[number];

export const SUPPLIER_STATUSES = ['ACTIVE', 'PENDING', 'SUSPENDED'] as const;
export type SupplierStatus = (typeof SUPPLIER_STATUSES)[number];

export const EVALUATION_STATUSES = ['DRAFT', 'SUBMITTED', 'VALIDATED'] as const;
export type EvaluationStatus = (typeof EVALUATION_STATUSES)[number];
