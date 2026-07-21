import React from 'react';
import {TicketMetric} from '../services/apiService';

interface DepartmentMetricsProps {metrics: TicketMetric[]; isLoading: boolean}

const formatDuration = (hours: number | null) => {
  if (hours === null) return '—';
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} min`;
  const days = Math.floor(hours / 24);
  const remainingHours = Math.round(hours % 24);
  return days > 0 ? `${days}d ${remainingHours}h` : `${Math.round(hours)}h`;
};

const DepartmentMetrics: React.FC<DepartmentMetricsProps> = ({metrics, isLoading}) => {
  const rows = [...metrics].sort((a, b) => a.department.localeCompare(b.department, 'pt-BR'));
  const maxTotal = Math.max(1, ...rows.map(row => row.total));
  return (
    <section aria-labelledby="department-metrics-title" className="ocean-panel h-full rounded-xl border p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="department-metrics-title" className="text-lg font-bold text-slate-900">Chamados por departamento</h2>
          <p className="mt-1 text-sm text-slate-600">Volume recebido e tempo médio até o fechamento.</p>
        </div>
      </div>
      {isLoading ? <p className="text-sm text-slate-600">Carregando métricas...</p> : rows.length === 0 ? <p className="text-sm text-slate-600">Ainda não há chamados para medir.</p> : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="pb-3 pr-4 font-semibold">Departamento</th><th className="pb-3 pr-4 font-semibold">Volume</th><th className="pb-3 font-semibold">Tempo médio</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map(row => {
                const progress = Math.round((row.total / maxTotal) * 100);
                return <tr key={row.department}>
                <th scope="row" className="py-3 pr-4 font-semibold text-slate-800">{row.department}</th>
                <td className="py-3 pr-4"><div className="flex items-center gap-3"><span className="ui-text shrink-0 font-semibold">{row.total} {row.total === 1 ? 'chamado' : 'chamados'}</span><span className="h-2 min-w-[80px] flex-1 rounded-full bg-slate-100" role="progressbar" aria-label={`Volume de chamados em ${row.department}`} aria-valuemin={0} aria-valuemax={maxTotal} aria-valuenow={row.total}><span className="block h-2 rounded-full bg-blue-500" style={{width: `${progress}%`}} /></span></div></td>
                <td className="py-3 font-medium text-slate-700">{formatDuration(row.averageClosureHours)}</td>
              </tr>})}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default DepartmentMetrics;
