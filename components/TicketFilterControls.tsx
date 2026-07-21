import React, {useEffect, useState} from 'react';
import {departments, ticketSystems} from '../constants';
import {TicketFilters} from '../services/apiService';

interface TicketFilterControlsProps {
  filters: TicketFilters;
  onApply: (filters: TicketFilters) => void;
  onClear: () => void;
}

const TicketFilterControls: React.FC<TicketFilterControlsProps> = ({filters, onApply, onClear}) => {
  const [draft, setDraft] = useState<TicketFilters>(filters);
  const [isExpanded, setIsExpanded] = useState(false);
  useEffect(() => setDraft(filters), [filters]);
  const setValue = (key: keyof TicketFilters, value: string) => setDraft(current => ({...current, [key]: value || undefined}));

  return (
    <form onSubmit={(event) => { event.preventDefault(); onApply(draft); }} className="ocean-filter-bar border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="ticket-search">Buscar chamados</label>
        <input id="ticket-search" value={draft.search || ''} onChange={(event) => setValue('search', event.target.value)} className="ui-input min-h-11 min-w-0 flex-1 rounded-lg border px-3 text-slate-900" placeholder="Buscar por número, título ou solicitante" />
        <button type="button" onClick={() => setIsExpanded(current => !current)} className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100" aria-expanded={isExpanded} aria-controls="ticket-advanced-filters">Filtros</button>
        <button type="submit" className="ui-primary min-h-11 rounded-lg px-4 py-2.5 text-sm font-semibold">Buscar</button>
      </div>
      {isExpanded && <div id="ticket-advanced-filters" className="mt-4 grid gap-3 border-t border-slate-200 pt-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm font-medium text-slate-700">Sistema
          <select value={draft.system || ''} onChange={(event) => setValue('system', event.target.value)} className="ui-input mt-1 min-h-11 w-full rounded-lg border px-3 text-slate-900"><option value="">Todos</option>{ticketSystems.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
        </label>
        <label className="text-sm font-medium text-slate-700">Departamento
          <select value={draft.department || ''} onChange={(event) => setValue('department', event.target.value)} className="ui-input mt-1 min-h-11 w-full rounded-lg border px-3 text-slate-900"><option value="">Todos</option>{departments.map(item => <option key={item} value={item}>{item}</option>)}</select>
        </label>
        <label className="text-sm font-medium text-slate-700">De
          <input type="date" value={draft.dateFrom || ''} onChange={(event) => setValue('dateFrom', event.target.value)} className="ui-input mt-1 min-h-11 w-full rounded-lg border px-3 text-slate-900" />
        </label>
        <label className="text-sm font-medium text-slate-700">Até
          <input type="date" value={draft.dateTo || ''} onChange={(event) => setValue('dateTo', event.target.value)} className="ui-input mt-1 min-h-11 w-full rounded-lg border px-3 text-slate-900" />
        </label>
        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-4">
          <button type="submit" className="ui-primary min-h-11 rounded-lg px-4 py-2.5 text-sm font-semibold">Aplicar filtros</button>
          <button type="button" onClick={() => { setDraft({}); onClear(); setIsExpanded(false); }} className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100">Limpar</button>
        </div>
      </div>}
    </form>
  );
};

export default TicketFilterControls;
