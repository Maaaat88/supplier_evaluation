// Palette validée (contraste + daltonisme) — voir la skill dataviz.
// Les couleurs "status" reprennent les seuils du badge de score
// (vert >= 75, orange 50-74, rouge < 50) pour rester cohérentes avec le
// reste de l'application.
export const STATUS_COLORS = {
  good: '#0ca30c',
  warning: '#fab219',
  critical: '#d03b3b',
} as const;

export const CHART_BLUE = '#2a78d6';
export const CHART_GRID = '#e1e0d9';
export const CHART_AXIS_TEXT = '#898781';

export function scoreStatusColor(score: number): string {
  if (score >= 75) return STATUS_COLORS.good;
  if (score >= 50) return STATUS_COLORS.warning;
  return STATUS_COLORS.critical;
}
