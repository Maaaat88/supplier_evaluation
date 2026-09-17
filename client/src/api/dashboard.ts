import type { DashboardDto } from 'shared';
import { apiFetch } from '../lib/api.js';

export function fetchDashboard(signal?: AbortSignal) {
  return apiFetch<DashboardDto>('/dashboard', { signal });
}
