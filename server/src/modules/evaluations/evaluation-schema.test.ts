import { describe, expect, it } from 'vitest';
import { evaluationInputSchema } from 'shared';

const validInput = {
  supplierId: 'supplier-1',
  period: '2026-Q1',
  scores: [{ criterionId: 'c1', score: 4 }],
};

describe('evaluationInputSchema', () => {
  it('accepte une saisie valide', () => {
    expect(evaluationInputSchema.safeParse(validInput).success).toBe(true);
  });

  it('rejette une période mal formée', () => {
    const result = evaluationInputSchema.safeParse({ ...validInput, period: '2026-1' });
    expect(result.success).toBe(false);
  });

  it('rejette une note hors de la plage 1-5', () => {
    const result = evaluationInputSchema.safeParse({
      ...validInput,
      scores: [{ criterionId: 'c1', score: 6 }],
    });
    expect(result.success).toBe(false);
  });

  it('rejette un critère noté deux fois', () => {
    const result = evaluationInputSchema.safeParse({
      ...validInput,
      scores: [
        { criterionId: 'c1', score: 3 },
        { criterionId: 'c1', score: 5 },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('rejette une saisie sans aucune note', () => {
    const result = evaluationInputSchema.safeParse({ ...validInput, scores: [] });
    expect(result.success).toBe(false);
  });
});
