import React from 'react';

interface SummaryCardProps {title: string; description: string; count: React.ReactNode; icon: React.ElementType; color: 'blue' | 'yellow' | 'purple' | 'green'}
const colors = {
  blue: 'ocean-kpi-icon ocean-kpi-icon--blue',
  yellow: 'ocean-kpi-icon ocean-kpi-icon--amber',
  purple: 'ocean-kpi-icon ocean-kpi-icon--turquoise',
  green: 'ocean-kpi-icon ocean-kpi-icon--emerald',
};

const SummaryCard: React.FC<SummaryCardProps> = ({title, description, count, icon: Icon, color}) => (
  <div className="ocean-panel ocean-kpi rounded-xl border p-5 sm:p-6">
    <div className="flex items-start justify-between gap-4">
      <div><p className="text-sm font-semibold text-slate-600">{title}</p><p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{count}</p></div>
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${colors[color]}`}><Icon className="h-6 w-6" /></div>
    </div>
    <p className="mt-4 text-sm text-slate-600">{description}</p>
  </div>
);
export default SummaryCard;
