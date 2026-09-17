import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { PendingEvaluationDto } from 'shared';
import { fetchPendingEvaluations, validateEvaluation } from '../api/evaluations.js';
import { RejectEvaluationModal } from '../components/evaluations/RejectEvaluationModal.js';
import { ErrorMessage } from '../components/ui/ErrorMessage.js';
import { ScoreBadge } from '../components/ui/ScoreBadge.js';
import { Spinner } from '../components/ui/Spinner.js';
import { ApiError } from '../lib/api.js';

function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('fr-FR');
}

export function ValidationsPage() {
  const queryClient = useQueryClient();
  const [rejectTarget, setRejectTarget] = useState<PendingEvaluationDto | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['evaluations', 'pending'],
    queryFn: ({ signal }) => fetchPendingEvaluations(signal),
  });

  const validateMutation = useMutation({
    mutationFn: (id: string) => validateEvaluation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluations'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });

  async function handleValidate(id: string) {
    setActionError(null);
    try {
      await validateMutation.mutateAsync(id);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Validation impossible.');
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">Validation des évaluations</h1>

      {actionError && <ErrorMessage message={actionError} />}

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
                  : 'Impossible de charger les évaluations en attente.'
              }
            />
          </div>
        )}

        {!isLoading && !isError && data && data.length === 0 && (
          <p className="p-8 text-center text-sm text-slate-500">
            Aucune évaluation en attente de validation.
          </p>
        )}

        {!isLoading && !isError && data && data.length > 0 && (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-4 py-3">Fournisseur</th>
                <th className="px-4 py-3">Évaluateur</th>
                <th className="px-4 py-3">Période</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Soumise le</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((evaluation) => (
                <tr key={evaluation.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {evaluation.supplierName}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{evaluation.evaluatorName}</td>
                  <td className="px-4 py-3 text-slate-600">{evaluation.period}</td>
                  <td className="px-4 py-3">
                    <ScoreBadge score={evaluation.globalScore} />
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(evaluation.submittedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleValidate(evaluation.id)}
                        disabled={validateMutation.isPending}
                        className="rounded bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        Valider
                      </button>
                      <button
                        type="button"
                        onClick={() => setRejectTarget(evaluation)}
                        className="rounded border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                      >
                        Renvoyer en brouillon
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {rejectTarget && (
        <RejectEvaluationModal
          evaluationId={rejectTarget.id}
          supplierName={rejectTarget.supplierName}
          period={rejectTarget.period}
          onClose={() => setRejectTarget(null)}
        />
      )}
    </div>
  );
}
