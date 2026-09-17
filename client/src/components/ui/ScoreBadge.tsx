import { Badge } from './Badge.js';

export function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) {
    return <Badge tone="slate">—</Badge>;
  }

  const tone = score >= 75 ? 'green' : score >= 50 ? 'orange' : 'red';
  return <Badge tone={tone}>{Math.round(score)}</Badge>;
}
