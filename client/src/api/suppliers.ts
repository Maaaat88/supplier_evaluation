import type {
  CreateSupplierInput,
  PaginatedResult,
  SupplierDetailDto,
  SupplierListItemDto,
  SupplierListQuery,
} from 'shared';
import { apiFetch } from '../lib/api.js';

function buildQueryString(query: Partial<SupplierListQuery>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export function fetchSuppliers(query: Partial<SupplierListQuery>, signal?: AbortSignal) {
  return apiFetch<PaginatedResult<SupplierListItemDto>>(`/suppliers${buildQueryString(query)}`, {
    signal,
  });
}

export function fetchSupplierById(id: string, signal?: AbortSignal) {
  return apiFetch<SupplierDetailDto>(`/suppliers/${id}`, { signal });
}

export function createSupplier(input: CreateSupplierInput) {
  return apiFetch<SupplierDetailDto>('/suppliers', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
