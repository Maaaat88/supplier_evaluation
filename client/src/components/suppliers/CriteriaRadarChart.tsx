import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { EvaluationScoreDto } from 'shared';
import { CHART_BLUE, CHART_GRID } from '../../lib/chartColors.js';

export function CriteriaRadarChart({ scores }: { scores: EvaluationScoreDto[] }) {
  if (scores.length < 3) {
    return (
      <p className="p-8 text-center text-sm text-slate-500">
        Pas assez de critères notés pour un radar lisible.
      </p>
    );
  }

  const chartData = scores.map((s) => ({ criterion: s.criterionLabel, score: s.score }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={chartData}>
        <PolarGrid stroke={CHART_GRID} />
        <PolarAngleAxis dataKey="criterion" tick={{ fill: '#52514e', fontSize: 11 }} />
        <PolarRadiusAxis type="number" domain={[0, 5]} tick={false} axisLine={false} />
        <Tooltip formatter={(value) => [`${value} / 5`, 'Note']} />
        <Radar
          dataKey="score"
          stroke={CHART_BLUE}
          fill={CHART_BLUE}
          fillOpacity={0.2}
          strokeWidth={2}
          isAnimationActive={false}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
