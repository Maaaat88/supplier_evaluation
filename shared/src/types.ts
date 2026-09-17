import type { EvaluationStatus, Role, SupplierCategory, SupplierStatus } from './enums.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export interface CriterionDto {
  id: string;
  label: string;
  description: string;
  weight: number;
}

export interface SupplierListItemDto {
  id: string;
  name: string;
  category: SupplierCategory;
  status: SupplierStatus;
  averageScore: number | null;
  lastEvaluationDate: string | null;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface EvaluationScoreDto {
  criterionId: string;
  criterionLabel: string;
  weight: number;
  score: number;
}

export interface EvaluationSummaryDto {
  id: string;
  period: string;
  status: EvaluationStatus;
  globalScore: number | null;
  createdAt: string;
  submittedAt: string | null;
  validatedAt: string | null;
}

export interface EvaluationDetailDto extends EvaluationSummaryDto {
  supplierId: string;
  evaluatorId: string;
  comment: string | null;
  rejectionReason: string | null;
  scores: EvaluationScoreDto[];
}

export interface PendingEvaluationDto extends EvaluationDetailDto {
  supplierName: string;
  evaluatorName: string;
}

export interface SupplierDetailDto {
  id: string;
  name: string;
  category: SupplierCategory;
  country: string;
  contactEmail: string;
  contactPhone: string;
  status: SupplierStatus;
  averageScore: number | null;
  evaluations: EvaluationSummaryDto[];
}
