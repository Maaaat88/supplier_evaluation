export interface WeightedScore {
  score: number;
  weight: number;
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
  return Math.round(scoreOnFive * 20 * 100) / 100;
}
