import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: ReactNode;
  children?: ReactNode;
}

export function StatCard({ label, value, children }: StatCardProps) {
  return (
    <div className="rounded-lg bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-slate-900">{value}</p>
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}
