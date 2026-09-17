import type { CriterionDto } from 'shared';

const RATING_VALUES = [1, 2, 3, 4, 5] as const;

interface CriterionRatingInputProps {
  criterion: CriterionDto;
  value: number | undefined;
  onChange: (score: number) => void;
  disabled?: boolean;
}

export function CriterionRatingInput({
  criterion,
  value,
  onChange,
  disabled,
}: CriterionRatingInputProps) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium text-slate-900">{criterion.label}</p>
          <p className="text-sm text-slate-500">{criterion.description}</p>
        </div>
        <span className="whitespace-nowrap rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
          Poids {criterion.weight}
        </span>
      </div>

      <div role="group" aria-label={`Note pour ${criterion.label}`} className="mt-3 flex gap-2">
        {RATING_VALUES.map((rating) => {
          const selected = value === rating;
          return (
            <button
              key={rating}
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              aria-label={`Note ${rating} sur 5`}
              onClick={() => onChange(rating)}
              className={`h-10 w-10 rounded border text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                selected
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-slate-300 text-slate-600 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              {rating}
            </button>
          );
        })}
      </div>
    </div>
  );
}
