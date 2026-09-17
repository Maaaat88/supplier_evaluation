import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { EvaluationSummaryDto } from 'shared';
import { CHART_AXIS_TEXT, CHART_BLUE, CHART_GRID } from '../../lib/chartColors.js';

export function ScoreEvolutionChart({ evaluations }: { evaluations: EvaluationSummaryDto[] }) {
  const chartData = [...evaluations]
    .filter((e) => e.globalScore != null)
    .sort((a, b) => a.period.localeCompare(b.period))
    .map((e) => ({ period: e.period, score: e.globalScore }));

  if (chartData.length < 2) {
    return (
      <p className="p-8 text-center text-sm text-slate-500">
        Pas encore assez d'évaluations pour tracer une évolution.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={CHART_GRID} />
        <XAxis
          dataKey="period"
          tick={{ fill: CHART_AXIS_TEXT, fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: CHART_GRID }}
        />
        <YAxis
          type="number"
          domain={[0, 100]}
          tick={{ fill: CHART_AXIS_TEXT, fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          width={32}
        />
        <Tooltip formatter={(value) => [`${value} / 100`, 'Score global']} />
        <Line
          type="monotone"
          dataKey="score"
          stroke={CHART_BLUE}
          strokeWidth={2}
          dot={{ r: 4, fill: CHART_BLUE, stroke: '#fff', strokeWidth: 2 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
