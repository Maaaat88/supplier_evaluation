import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SUPPLIER_CATEGORIES, SUPPLIER_STATUSES, type SupplierListQuery } from 'shared';
import { fetchSuppliers } from '../api/suppliers.js';
import { useAuth } from '../auth/useAuth.js';
import { CreateSupplierModal } from '../components/suppliers/CreateSupplierModal.js';
import { ErrorMessage } from '../components/ui/ErrorMessage.js';
import { Pagination } from '../components/ui/Pagination.js';
import { ScoreBadge } from '../components/ui/ScoreBadge.js';
import { Badge } from '../components/ui/Badge.js';
import { Spinner } from '../components/ui/Spinner.js';
import { ApiError } from '../lib/api.js';
import { CATEGORY_LABELS, SUPPLIER_STATUS_LABELS, SUPPLIER_STATUS_TONES } from '../lib/labels.js';
import { useDebouncedValue } from '../lib/useDebouncedValue.js';

type SortBy = SupplierListQuery['sortBy'];

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'name', label: 'Nom' },
  { value: 'averageScore', label: 'Score moyen' },
  { value: 'lastEvaluationDate', label: 'Dernière évaluation' },
];

function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('fr-FR');
}

export function SuppliersPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  const page = Number(searchParams.get('page') ?? '1');
  const category = searchParams.get('category') ?? '';
  const status = searchParams.get('status') ?? '';
  const sortBy = (searchParams.get('sortBy') ?? 'name') as SortBy;
  const sortOrder = (searchParams.get('sortOrder') ?? 'asc') as SupplierListQuery['sortOrder'];

  function updateFilters(patch: Record<string, string>) {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    next.set('page', '1');
    setSearchParams(next);
  }

  function setPage(nextPage: number) {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(nextPage));
    setSearchParams(next);
  }

  function handleSearchChange(value: string) {
    setSearchInput(value);
    const next = new URLSearchParams(searchParams);
    next.set('page', '1');
    setSearchParams(next, { replace: true });
  }

  function toggleSort(column: SortBy) {
    if (sortBy === column) {
      updateFilters({ sortBy: column, sortOrder: sortOrder === 'asc' ? 'desc' : 'asc' });
    } else {
      updateFilters({ sortBy: column, sortOrder: 'asc' });
    }
  }

  const query = {
    page,
    search: debouncedSearch || undefined,
    category: (category || undefined) as SupplierListQuery['category'],
    status: (status || undefined) as SupplierListQuery['status'],
    sortBy,
    sortOrder,
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['suppliers', query],
    queryFn: ({ signal }) => fetchSuppliers(query, signal),
    placeholderData: keepPreviousData,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Fournisseurs</h1>
        {user?.role === 'ADMIN' && (
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Nouveau fournisseur
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3 rounded-lg bg-white p-4 shadow-sm">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-sm font-medium text-slate-700">
            Recherche par nom
          </label>
          <input
            id="search"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Nom du fournisseur..."
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="category-filter"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Catégorie
          </label>
          <select
            id="category-filter"
            value={category}
            onChange={(e) => updateFilters({ category: e.target.value })}
            className="rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Toutes</option>
            {SUPPLIER_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="status-filter" className="mb-1 block text-sm font-medium text-slate-700">
            Statut
          </label>
          <select
            id="status-filter"
            value={status}
            onChange={(e) => updateFilters({ status: e.target.value })}
            className="rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Tous</option>
            {SUPPLIER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {SUPPLIER_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="sort-by" className="mb-1 block text-sm font-medium text-slate-700">
            Trier par
          </label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => toggleSort(e.target.value as SortBy)}
            className="rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        {isLoading && (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        )}

        {isError && (
          <div className="p-4">
            <ErrorMessage
              message={
                error instanceof ApiError
                  ? error.message
                  : 'Impossible de charger les fournisseurs.'
              }
            />
          </div>
        )}

        {!isLoading && !isError && data && data.items.length === 0 && (
          <p className="p-8 text-center text-sm text-slate-500">
            Aucun fournisseur ne correspond à ces critères.
          </p>
        )}

        {!isLoading && !isError && data && data.items.length > 0 && (
          <>
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleSort('name')}
                      className="font-medium hover:text-slate-900"
                    >
                      Nom {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </button>
                  </th>
                  <th className="px-4 py-3">Catégorie</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleSort('averageScore')}
                      className="font-medium hover:text-slate-900"
                    >
                      Score moyen {sortBy === 'averageScore' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </button>
                  </th>
                  <th className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleSort('lastEvaluationDate')}
                      className="font-medium hover:text-slate-900"
                    >
                      Dernière évaluation{' '}
                      {sortBy === 'lastEvaluationDate' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link
                        to={`/suppliers/${supplier.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {supplier.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {CATEGORY_LABELS[supplier.category]}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={SUPPLIER_STATUS_TONES[supplier.status]}>
                        {SUPPLIER_STATUS_LABELS[supplier.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <ScoreBadge score={supplier.averageScore} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDate(supplier.lastEvaluationDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Pagination
              page={data.page}
              pageSize={data.pageSize}
              total={data.total}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      {createModalOpen && <CreateSupplierModal onClose={() => setCreateModalOpen(false)} />}
    </div>
  );
}
