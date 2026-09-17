/**
 * Génère les N derniers trimestres (le plus récent en premier), au
 * format attendu par le backend (ex: "2026-Q3").
 */
export function generateRecentPeriods(count = 8, from = new Date()): string[] {
  let year = from.getFullYear();
  let quarter = Math.floor(from.getMonth() / 3) + 1;

  const periods: string[] = [];
  for (let i = 0; i < count; i += 1) {
    periods.push(`${year}-Q${quarter}`);
    quarter -= 1;
    if (quarter === 0) {
      quarter = 4;
      year -= 1;
    }
  }
  return periods;
}
