import type { EvaluationStatus, Role, SupplierCategory, SupplierStatus } from 'shared';
import type { BadgeTone } from '../components/ui/Badge.js';

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Administrateur',
  EVALUATOR: 'Évaluateur',
};

export const CATEGORY_LABELS: Record<SupplierCategory, string> = {
  RAW_MATERIALS: 'Matières premières',
  PACKAGING: 'Emballage',
  LOGISTICS: 'Logistique',
  SERVICES: 'Services',
  EQUIPMENT: 'Équipement',
};

export const SUPPLIER_STATUS_LABELS: Record<SupplierStatus, string> = {
  ACTIVE: 'Actif',
  PENDING: 'En attente',
  SUSPENDED: 'Suspendu',
};

export const SUPPLIER_STATUS_TONES: Record<SupplierStatus, BadgeTone> = {
  ACTIVE: 'green',
  PENDING: 'orange',
  SUSPENDED: 'red',
};

export const EVALUATION_STATUS_LABELS: Record<EvaluationStatus, string> = {
  DRAFT: 'Brouillon',
  SUBMITTED: 'Soumise',
  VALIDATED: 'Validée',
};

export const EVALUATION_STATUS_TONES: Record<EvaluationStatus, BadgeTone> = {
  DRAFT: 'slate',
  SUBMITTED: 'blue',
  VALIDATED: 'green',
};
