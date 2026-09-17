import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchSupplierById } from '../api/suppliers.js';
import { Badge } from '../components/ui/Badge.js';
import { ComingSoon } from '../components/ui/ComingSoon.js';
import { ErrorMessage } from '../components/ui/ErrorMessage.js';
import { ScoreBadge } from '../components/ui/ScoreBadge.js';
import { FullPageSpinner } from '../components/ui/Spinner.js';
import { ApiError } from '../lib/api.js';
import {
  CATEGORY_LABELS,
  EVALUATION_STATUS_LABELS,
  EVALUATION_STATUS_TONES,
  SUPPLIER_STATUS_LABELS,
  SUPPLIER_STATUS_TONES,
} from '../lib/labels.js';

function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('fr-FR');
}

export function SupplierDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['supplier', id],
    queryFn: ({ signal }) => fetchSupplierById(id!, signal),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return <FullPageSpinner />;
  }

  if (isError || !data) {
    return (
      <ErrorMessage
        message={
          error instanceof ApiError ? error.message : 'Impossible de charger ce fournisseur.'
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/suppliers" className="text-sm text-blue-600 hover:underline">
        ← Retour à la liste des fournisseurs
      </Link>

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{data.name}</h1>
            <p className="mt-1 text-sm text-slate-600">
              {CATEGORY_LABELS[data.category]} · {data.country}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ScoreBadge score={data.averageScore} />
            <Badge tone={SUPPLIER_STATUS_TONES[data.status]}>
              {SUPPLIER_STATUS_LABELS[data.status]}
            </Badge>
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Email de contact</dt>
            <dd className="text-slate-900">{data.contactEmail}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Téléphone de contact</dt>
            <dd className="text-slate-900">{data.contactPhone}</dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={() => navigate(`/suppliers/${data.id}/evaluate`)}
          className="mt-4 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Nouvelle évaluation
        </button>
      </div>

      <ComingSoon title="Graphiques (évolution du score, radar par critère)" />

      <div className="rounded-lg bg-white shadow-sm">
        <h2 className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">
          Historique des évaluations
        </h2>

        {data.evaluations.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">
            Aucune évaluation soumise pour ce fournisseur.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-4 py-3">Période</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Soumise le</th>
                <th className="px-4 py-3">Validée le</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.evaluations.map((evaluation) => (
                <tr key={evaluation.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{evaluation.period}</td>
                  <td className="px-4 py-3">
                    <Badge tone={EVALUATION_STATUS_TONES[evaluation.status]}>
                      {EVALUATION_STATUS_LABELS[evaluation.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <ScoreBadge score={evaluation.globalScore} />
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(evaluation.submittedAt)}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(evaluation.validatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
