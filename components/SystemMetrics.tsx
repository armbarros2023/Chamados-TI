import React from 'react';
import {ticketSystems} from '../constants';
import {TicketSystem} from '../types';
import {TicketSystemMetric} from '../services/apiService';

interface SystemMetricsProps {
  metrics: TicketSystemMetric[];
  isLoading: boolean;
  onSelectSystem: (system: TicketSystem) => void;
}

const currentMonthLabel = new Intl.DateTimeFormat('pt-BR', {month: 'long', year: 'numeric'})
  .format(new Date())
  .replace(/^./, character => character.toUpperCase());

const SystemMetrics: React.FC<SystemMetricsProps> = ({metrics, isLoading, onSelectSystem}) => {
  const totals = new Map(metrics.map(metric => [metric.system, metric.closedCount]));
  return (
    <section aria-labelledby="system-metrics-title" className="ocean-panel mt-8 rounded-xl border p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="system-metrics-title" className="text-lg font-bold text-slate-900">Chamados fechados por sistema</h2>
          <p className="mt-1 text-sm text-slate-600">Fechados de 1º até o último dia de {currentMonthLabel}.</p>
        </div>
        <span className="text-xs font-medium text-slate-500">Selecione um logo para filtrar a fila</span>
      </div>
      {isLoading ? <p className="text-sm text-slate-600">Carregando métricas de sistemas...</p> : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
          {ticketSystems.map(item => (
            <button
              key={item.value}
              type="button"
              onClick={() => onSelectSystem(item.value)}
              className="ocean-system-card group flex min-h-36 flex-col items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-center transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-teal-500"
              aria-label={`Filtrar chamados fechados de ${item.label} em ${currentMonthLabel}`}
            >
              <img src={item.asset} alt="" width={220} height={120} loading="lazy" decoding="async" className="h-16 max-w-full object-contain" />
              <span className="mt-2 text-sm font-semibold text-slate-800">{item.label}</span>
              <span className="mt-1 text-2xl font-bold text-teal-800">{totals.get(item.value) || 0}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default SystemMetrics;
