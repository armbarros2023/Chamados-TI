import React from 'react';
import {TicketStatus} from '../types';

interface QueueSummaryProps {
  open: number;
  inProgress: number;
  resolved: number;
}

const QueueSummary: React.FC<QueueSummaryProps> = ({open, inProgress, resolved}) => {
  const total = open + inProgress + resolved;
  const openEnd = total ? (open / total) * 100 : 0;
  const progressEnd = openEnd + (total ? (inProgress / total) * 100 : 0);
  const chartBackground = total
    ? `conic-gradient(#3B82F6 0 ${openEnd}%, #FFC62E ${openEnd}% ${progressEnd}%, #31C979 ${progressEnd}% 100%)`
    : 'conic-gradient(#2B4968 0 100%)';

  const items = [
    {label: 'Abertos', value: open, color: 'bg-blue-500', status: TicketStatus.Open},
    {label: 'Em andamento', value: inProgress, color: 'bg-amber-400', status: TicketStatus.InProgress},
    {label: 'Resolvidos', value: resolved, color: 'bg-emerald-400', status: TicketStatus.Resolved},
  ];

  return (
    <section aria-labelledby="queue-summary-title" className="ocean-panel ocean-queue-summary rounded-xl border p-5 sm:p-6">
      <h2 id="queue-summary-title" className="text-lg font-bold text-slate-900">Resumo da fila</h2>
      <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <div className="ocean-donut" style={{background: chartBackground}} role="img" aria-label={`${total} chamados: ${open} abertos, ${inProgress} em andamento e ${resolved} resolvidos`}>
          <div className="ocean-donut__center">
            <strong>{total}</strong>
            <span>Total</span>
          </div>
        </div>
        <ul className="w-full space-y-3" aria-label="Legenda do resumo da fila">
          {items.map(item => (
            <li key={item.status} className="flex items-center justify-between gap-4 text-sm">
              <span className="flex items-center gap-3 text-slate-700"><i aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${item.color}`} />{item.label}</span>
              <strong className="text-base text-slate-900">{item.value}</strong>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default QueueSummary;
