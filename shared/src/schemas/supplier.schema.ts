import { z } from 'zod';
import { SUPPLIER_CATEGORIES, SUPPLIER_STATUSES } from '../enums.js';

export const createSupplierSchema = z.object({
  name: z.string().trim().min(2, 'Le nom doit contenir au moins 2 caractères').max(200),
  category: z.enum(SUPPLIER_CATEGORIES),
  country: z.string().trim().min(2, 'Le pays est requis').max(100),
  contactEmail: z.string().email('Adresse email invalide'),
  contactPhone: z.string().trim().min(5, 'Le téléphone est requis').max(30),
});

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;

export const supplierListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  search: z.string().trim().optional(),
  category: z.enum(SUPPLIER_CATEGORIES).optional(),
  status: z.enum(SUPPLIER_STATUSES).optional(),
  sortBy: z.enum(['name', 'averageScore', 'lastEvaluationDate']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type SupplierListQuery = z.infer<typeof supplierListQuerySchema>;
