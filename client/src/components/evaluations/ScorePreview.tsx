import { ScoreBadge } from '../ui/ScoreBadge.js';

export function ScorePreview({
  score,
  scoredCount,
  totalCount,
}: {
  score: number | null;
  scoredCount: number;
  totalCount: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-blue-50 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-blue-900">Score global (aperçu en temps réel)</p>
        <p className="text-xs text-blue-700">
          {scoredCount} / {totalCount} critère{totalCount > 1 ? 's' : ''} noté
          {totalCount > 1 ? 's' : ''}
        </p>
      </div>
      <ScoreBadge score={score} />
    </div>
  );
}
