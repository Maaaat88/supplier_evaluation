import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchDashboard } from '../api/dashboard.js';
import { CategoryScoreChart } from '../components/dashboard/CategoryScoreChart.js';
import { StatCard } from '../components/dashboard/StatCard.js';
import { SupplierRankList } from '../components/dashboard/SupplierRankList.js';
import { Badge } from '../components/ui/Badge.js';
import { ErrorMessage } from '../components/ui/ErrorMessage.js';
import { ScoreBadge } from '../components/ui/ScoreBadge.js';
import { FullPageSpinner } from '../components/ui/Spinner.js';
import { ApiError } from '../lib/api.js';
import { SUPPLIER_STATUS_LABELS, SUPPLIER_STATUS_TONES } from '../lib/labels.js';

export function DashboardPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: ({ signal }) => fetchDashboard(signal),
  });

  if (isLoading) {
    return <FullPageSpinner />;
  }

  if (isError || !data) {
    return (
      <ErrorMessage
        message={
          error instanceof ApiError ? error.message : 'Impossible de charger le tableau de bord.'
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">Tableau de bord</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Score moyen global" value={<ScoreBadge score={data.averageScore} />} />

        <StatCard
          label="Fournisseurs par statut"
          value={Object.values(data.suppliersByStatus).reduce((a, b) => a + b, 0)}
        >
          <div className="flex flex-wrap gap-2">
            {Object.entries(data.suppliersByStatus).map(([status, count]) => (
              <Badge
                key={status}
                tone={SUPPLIER_STATUS_TONES[status as keyof typeof SUPPLIER_STATUS_TONES]}
              >
                {SUPPLIER_STATUS_LABELS[status as keyof typeof SUPPLIER_STATUS_LABELS]} : {count}
              </Badge>
            ))}
          </div>
        </StatCard>

        <Link to="/validations" className="block">
          <StatCard
            label="Évaluations en attente de validation"
            value={data.pendingEvaluationsCount}
          />
        </Link>
      </div>

      <div className="rounded-lg bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">
          Répartition des scores par catégorie
        </h2>
        <CategoryScoreChart data={data.scoresByCategory} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SupplierRankList title="Top 5 fournisseurs" suppliers={data.topSuppliers} />
        <SupplierRankList title="Bottom 5 fournisseurs" suppliers={data.bottomSuppliers} />
      </div>
    </div>
  );
}
