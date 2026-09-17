import { describe, expect, it } from 'vitest';
import { computeGlobalScore } from './scoring.js';

describe('computeGlobalScore', () => {
  it('retourne 100 quand toutes les notes sont maximales', () => {
    expect(
      computeGlobalScore([
        { score: 5, weight: 3 },
        { score: 5, weight: 1 },
      ]),
    ).toBe(100);
  });

  it('retourne 20 quand toutes les notes sont minimales', () => {
    expect(
      computeGlobalScore([
        { score: 1, weight: 3 },
        { score: 1, weight: 1 },
      ]),
    ).toBe(20);
  });

  it('pondère correctement selon le poids des critères', () => {
    // (5*3 + 1*1) / (3+1) = 4 sur 5 -> 80 sur 100
    expect(
      computeGlobalScore([
        { score: 5, weight: 3 },
        { score: 1, weight: 1 },
      ]),
    ).toBe(80);
  });

  it('retourne 0 pour une liste vide', () => {
    expect(computeGlobalScore([])).toBe(0);
  });

  it('ignore les critères de poids nul dans la moyenne', () => {
    expect(
      computeGlobalScore([
        { score: 3, weight: 2 },
        { score: 5, weight: 0 },
      ]),
    ).toBe(60);
  });
});
