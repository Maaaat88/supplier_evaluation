export interface WeightedScore {
  score: number;
  weight: number;
}

export function roundScore(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Moyenne pondérée des notes (1 à 5) par le poids de leur critère,
 * ramenée sur une échelle de 0 à 100.
 */
export function computeGlobalScore(scores: WeightedScore[]): number {
  const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);
  if (totalWeight === 0) return 0;

  const weightedSum = scores.reduce((sum, s) => sum + s.score * s.weight, 0);
  const scoreOnFive = weightedSum / totalWeight;
  return roundScore(scoreOnFive * 20);
}
