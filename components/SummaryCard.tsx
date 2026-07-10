import React from 'react';

interface SummaryCardProps {title: string; count: number; icon: React.ElementType; color: 'blue' | 'yellow' | 'purple' | 'green'}
const colors = {
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  yellow: 'bg-amber-50 text-amber-800 border-amber-200',
  purple: 'bg-teal-50 text-teal-700 border-teal-200',
  green: 'bg-green-50 text-green-700 border-green-200',
};

const SummaryCard: React.FC<SummaryCardProps> = ({title, count, icon: Icon, color}) => (
  <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
    <div><p className="text-sm font-semibold text-slate-600">{title}</p><p className="text-3xl font-bold text-slate-900 mt-1">{count}</p></div>
    <div className={`h-11 w-11 rounded-lg border flex items-center justify-center ${colors[color]}`}><Icon className="h-6 w-6" /></div>
  </div>
);
export default SummaryCard;
