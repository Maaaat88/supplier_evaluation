import type { CriterionDto, EvaluationDetailDto, EvaluationInput } from 'shared';
import { apiFetch } from '../lib/api.js';

export function fetchCriteria(signal?: AbortSignal) {
  return apiFetch<CriterionDto[]>('/criteria', { signal });
}

export function fetchMyEvaluationsForSupplier(supplierId: string, signal?: AbortSignal) {
  return apiFetch<EvaluationDetailDto[]>(`/evaluations?supplierId=${supplierId}&mine=true`, {
    signal,
  });
}

export function createEvaluation(input: EvaluationInput) {
  return apiFetch<EvaluationDetailDto>('/evaluations', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateEvaluation(id: string, input: EvaluationInput) {
  return apiFetch<EvaluationDetailDto>(`/evaluations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function submitEvaluation(id: string) {
  return apiFetch<EvaluationDetailDto>(`/evaluations/${id}/submit`, { method: 'POST' });
}
