import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  computeGlobalScore,
  evaluationInputSchema,
  type CriterionDto,
  type EvaluationDetailDto,
  type EvaluationInput,
} from 'shared';
import { createEvaluation, submitEvaluation, updateEvaluation } from '../../api/evaluations.js';
import { ApiError } from '../../lib/api.js';
import { ErrorMessage } from '../ui/ErrorMessage.js';
import { CriterionRatingInput } from './CriterionRatingInput.js';
import { ScorePreview } from './ScorePreview.js';

interface EvaluationEditorProps {
  supplierId: string;
  period: string;
  criteria: CriterionDto[];
  initialEvaluation: EvaluationDetailDto | null;
  onSubmitted: () => void;
}

/**
 * Réinitialisée à chaque changement de période via la prop `key` passée
 * par le parent (voir EvaluationFormPage) plutôt que par un effet : l'état
 * initial dérive directement de `initialEvaluation`, sans synchronisation
 * manuelle après montage.
 */
export function EvaluationEditor({
  supplierId,
  period,
  criteria,
  initialEvaluation,
  onSubmitted,
}: EvaluationEditorProps) {
  const queryClient = useQueryClient();

  const [evaluationId, setEvaluationId] = useState(initialEvaluation?.id ?? null);
  const [scores, setScores] = useState<Record<string, number>>(() =>
    initialEvaluation
      ? Object.fromEntries(initialEvaluation.scores.map((s) => [s.criterionId, s.score]))
      : {},
  );
  const [comment, setComment] = useState(initialEvaluation?.comment ?? '');
  const [formError, setFormError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const filledScores = criteria
    .filter((c) => scores[c.id] != null)
    .map((c) => ({ score: scores[c.id]!, weight: c.weight }));
  const livePreview = filledScores.length > 0 ? computeGlobalScore(filledScores) : null;
  const allCriteriaScored = criteria.length > 0 && criteria.every((c) => scores[c.id] != null);

  const saveMutation = useMutation({
    mutationFn: (input: EvaluationInput) =>
      evaluationId ? updateEvaluation(evaluationId, input) : createEvaluation(input),
    onSuccess: (evaluation) => {
      setEvaluationId(evaluation.id);
      queryClient.invalidateQueries({ queryKey: ['evaluations'] });
    },
  });

  const submitMutation = useMutation({
    mutationFn: (id: string) => submitEvaluation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluations'] });
      queryClient.invalidateQueries({ queryKey: ['supplier', supplierId] });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      onSubmitted();
    },
  });

  function buildPayload(): EvaluationInput | null {
    const payload = {
      supplierId,
      period,
      comment: comment || undefined,
      scores: Object.entries(scores).map(([criterionId, score]) => ({ criterionId, score })),
    };
    const result = evaluationInputSchema.safeParse(payload);
    if (!result.success) {
      setFormError(result.error.issues[0]?.message ?? 'Formulaire invalide.');
      return null;
    }
    return result.data;
  }

  async function handleSaveDraft() {
    setFormError(null);
    setSavedMessage(null);
    const payload = buildPayload();
    if (!payload) return;
    try {
      await saveMutation.mutateAsync(payload);
      setSavedMessage('Brouillon enregistré.');
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Enregistrement impossible.');
    }
  }

  async function handleSubmitEvaluation() {
    setFormError(null);
    setSavedMessage(null);
    const payload = buildPayload();
    if (!payload) return;
    try {
      const saved = await saveMutation.mutateAsync(payload);
      await submitMutation.mutateAsync(saved.id);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Soumission impossible.');
    }
  }

  return (
    <>
      <div className="space-y-3">
        {criteria.map((criterion) => (
          <CriterionRatingInput
            key={criterion.id}
            criterion={criterion}
            value={scores[criterion.id]}
            onChange={(score) => setScores((prev) => ({ ...prev, [criterion.id]: score }))}
          />
        ))}
      </div>

      <ScorePreview
        score={livePreview}
        scoredCount={filledScores.length}
        totalCount={criteria.length}
      />

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <label htmlFor="comment" className="mb-1 block text-sm font-medium text-slate-700">
          Commentaire (optionnel)
        </label>
        <textarea
          id="comment"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {formError && <ErrorMessage message={formError} />}
      {savedMessage && !formError && <p className="text-sm text-green-700">{savedMessage}</p>}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={handleSaveDraft}
          disabled={saveMutation.isPending}
          className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
        >
          {saveMutation.isPending ? 'Enregistrement...' : 'Enregistrer en brouillon'}
        </button>
        <button
          type="button"
          onClick={handleSubmitEvaluation}
          disabled={!allCriteriaScored || saveMutation.isPending || submitMutation.isPending}
          title={
            !allCriteriaScored
              ? 'Toutes les notes doivent être renseignées avant soumission'
              : undefined
          }
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitMutation.isPending ? 'Soumission...' : 'Soumettre'}
        </button>
      </div>
    </>
  );
}
