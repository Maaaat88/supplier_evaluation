import { Link } from 'react-router-dom';
import type { DashboardSupplierScoreDto } from 'shared';
import { ScoreBadge } from '../ui/ScoreBadge.js';

export function SupplierRankList({
  title,
  suppliers,
}: {
  title: string;
  suppliers: DashboardSupplierScoreDto[];
}) {
  return (
    <div className="rounded-lg bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-slate-900">{title}</h3>
      {suppliers.length === 0 ? (
        <p className="text-sm text-slate-500">Pas encore de données.</p>
      ) : (
        <ol className="space-y-2">
          {suppliers.map((supplier, index) => (
            <li key={supplier.id} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-700">
                <span className="text-slate-400">{index + 1}.</span>
                <Link to={`/suppliers/${supplier.id}`} className="text-blue-600 hover:underline">
                  {supplier.name}
                </Link>
              </span>
              <ScoreBadge score={supplier.averageScore} />
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
