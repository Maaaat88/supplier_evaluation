import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchCriteria, fetchMyEvaluationsForSupplier } from '../api/evaluations.js';
import { fetchSupplierById } from '../api/suppliers.js';
import { EvaluationEditor } from '../components/evaluations/EvaluationEditor.js';
import { Badge } from '../components/ui/Badge.js';
import { ErrorMessage } from '../components/ui/ErrorMessage.js';
import { ScoreBadge } from '../components/ui/ScoreBadge.js';
import { FullPageSpinner } from '../components/ui/Spinner.js';
import { EVALUATION_STATUS_LABELS, EVALUATION_STATUS_TONES } from '../lib/labels.js';
import { generateRecentPeriods } from '../lib/periods.js';

const PERIODS = generateRecentPeriods();

export function EvaluationFormPage() {
  const { id: supplierId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [period, setPeriod] = useState(PERIODS[0]!);

  const supplierQuery = useQuery({
    queryKey: ['supplier', supplierId],
    queryFn: ({ signal }) => fetchSupplierById(supplierId!, signal),
    enabled: Boolean(supplierId),
  });

  const criteriaQuery = useQuery({
    queryKey: ['criteria'],
    queryFn: ({ signal }) => fetchCriteria(signal),
  });

  const myEvaluationsQuery = useQuery({
    queryKey: ['evaluations', { supplierId, mine: true }],
    queryFn: ({ signal }) => fetchMyEvaluationsForSupplier(supplierId!, signal),
    enabled: Boolean(supplierId),
  });

  const existingForPeriod = useMemo(
    () => myEvaluationsQuery.data?.find((e) => e.period === period) ?? null,
    [myEvaluationsQuery.data, period],
  );
  const isLocked = existingForPeriod != null && existingForPeriod.status !== 'DRAFT';
  const criteria = criteriaQuery.data ?? [];

  if (supplierQuery.isLoading || criteriaQuery.isLoading || myEvaluationsQuery.isLoading) {
    return <FullPageSpinner />;
  }

  if (supplierQuery.isError || !supplierQuery.data) {
    return <ErrorMessage message="Impossible de charger ce fournisseur." />;
  }

  return (
    <div className="space-y-6">
      <Link to={`/suppliers/${supplierId}`} className="text-sm text-blue-600 hover:underline">
        ← Retour à la fiche fournisseur
      </Link>

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">
          Évaluation — {supplierQuery.data.name}
        </h1>

        <div className="mt-4 max-w-xs">
          <label htmlFor="period" className="mb-1 block text-sm font-medium text-slate-700">
            Période
          </label>
          <select
            id="period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {PERIODS.map((p) => {
              const existing = myEvaluationsQuery.data?.find((e) => e.period === p);
              return (
                <option key={p} value={p}>
                  {p}
                  {existing ? ` (${EVALUATION_STATUS_LABELS[existing.status].toLowerCase()})` : ''}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {isLocked && existingForPeriod ? (
        <div className="space-y-4 rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Badge tone={EVALUATION_STATUS_TONES[existingForPeriod.status]}>
              {EVALUATION_STATUS_LABELS[existingForPeriod.status]}
            </Badge>
            <ScoreBadge score={existingForPeriod.globalScore} />
            <p className="text-sm text-slate-600">
              Cette évaluation ne peut plus être modifiée pour cette période.
            </p>
          </div>
          <ul className="space-y-1 text-sm text-slate-700">
            {existingForPeriod.scores.map((s) => (
              <li key={s.criterionId} className="flex justify-between">
                <span>
                  {s.criterionLabel} (poids {s.weight})
                </span>
                <span className="font-medium">{s.score} / 5</span>
              </li>
            ))}
          </ul>
          {existingForPeriod.comment && (
            <p className="text-sm italic text-slate-600">« {existingForPeriod.comment} »</p>
          )}
        </div>
      ) : (
        <EvaluationEditor
          key={existingForPeriod?.id ?? period}
          supplierId={supplierId!}
          period={period}
          criteria={criteria}
          initialEvaluation={existingForPeriod}
          onSubmitted={() => navigate(`/suppliers/${supplierId}`)}
        />
      )}
    </div>
  );
}
