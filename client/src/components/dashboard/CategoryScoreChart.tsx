import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DashboardCategoryScoreDto } from 'shared';
import { CATEGORY_LABELS } from '../../lib/labels.js';
import { CHART_AXIS_TEXT, CHART_GRID, scoreStatusColor } from '../../lib/chartColors.js';

export function CategoryScoreChart({ data }: { data: DashboardCategoryScoreDto[] }) {
  const chartData = data.map((d) => ({
    category: CATEGORY_LABELS[d.category],
    averageScore: d.averageScore,
  }));

  const hasData = chartData.some((d) => d.averageScore != null);

  if (!hasData) {
    return (
      <p className="p-8 text-center text-sm text-slate-500">
        Pas encore assez d'évaluations validées pour ce graphique.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 20, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={CHART_GRID} />
        <XAxis
          dataKey="category"
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
        <Tooltip
          formatter={(value) => [`${value} / 100`, 'Score moyen']}
          cursor={{ fill: CHART_GRID, opacity: 0.4 }}
        />
        <Bar dataKey="averageScore" radius={[4, 4, 0, 0]} maxBarSize={48} isAnimationActive={false}>
          <LabelList
            dataKey="averageScore"
            position="top"
            formatter={(value) => (typeof value === 'number' ? Math.round(value) : '')}
            style={{ fill: '#52514e', fontSize: 12 }}
          />
          {chartData.map((entry) => (
            <Cell
              key={entry.category}
              fill={entry.averageScore != null ? scoreStatusColor(entry.averageScore) : CHART_GRID}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
