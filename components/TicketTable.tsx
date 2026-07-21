import React, { useMemo } from 'react';
import { Ticket, TicketStatus, TicketTableTab } from '../types';
import {CheckCircleIcon} from './icons';
import TicketRow from './TicketRow';
import TicketFilterControls from './TicketFilterControls';
import {TicketFilters} from '../services/apiService';

interface TicketTableProps {
  tickets: Ticket[];
  totalTickets: number;
  isLoadingMore: boolean;
  onUpdateTicketStatus: (ticketId: string, newStatus: TicketStatus) => void;
  onShowTicketDetail: (ticket: Ticket) => void;
  currentUserRole: string;
  activeTab: TicketTableTab;
  setActiveTab: (tab: TicketTableTab) => void;
  onDeleteTicket: (ticketId: string) => void;
  onLoadMore: () => void;
  filters: TicketFilters;
  onApplyFilters: (filters: TicketFilters) => void;
  onClearFilters: () => void;
  onCreateTicket: () => void;
}

const TicketTable: React.FC<TicketTableProps> = ({ tickets, totalTickets, isLoadingMore, onUpdateTicketStatus, onShowTicketDetail, currentUserRole, activeTab, setActiveTab, onDeleteTicket, onLoadMore, filters, onApplyFilters, onClearFilters, onCreateTicket }) => {
  const emptyState = activeTab === TicketTableTab.InProgress
    ? {title: 'Nenhum chamado em andamento', description: 'Quando um chamado entrar nesta etapa, ele aparecerá aqui.', action: 'Ver chamados abertos', tab: TicketTableTab.Open}
    : activeTab === TicketTableTab.Resolved
      ? {title: 'Nenhum chamado resolvido', description: 'Os chamados concluídos aparecerão aqui.', action: 'Ver chamados abertos', tab: TicketTableTab.Open}
      : {title: 'Nenhum chamado aberto', description: 'Quando houver uma nova solicitação, ela aparecerá aqui.', action: 'Novo chamado', tab: null};
  
  const filteredTickets = useMemo(() => {
    switch (activeTab) {
      case TicketTableTab.InProgress:
        return tickets.filter(ticket => ticket.status === TicketStatus.InProgress);
      case TicketTableTab.Resolved:
        return tickets.filter(ticket => ticket.status === TicketStatus.Resolved);
      case TicketTableTab.Open:
      default:
        return tickets.filter(ticket => ticket.status === TicketStatus.Open);
    }
  }, [tickets, activeTab]);

  const getTabClass = (tab: TicketTableTab) => {
    const baseClass = "px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors min-h-11";
    if (activeTab === tab) {
      switch(tab) {
        case TicketTableTab.Open: return `${baseClass} bg-amber-100 text-amber-900`;
        case TicketTableTab.InProgress: return `${baseClass} bg-blue-100 text-blue-900`;
        case TicketTableTab.Resolved: return `${baseClass} bg-green-100 text-green-900`;
      }
    }
    return `${baseClass} text-slate-600 hover:bg-white`;
  }

  return (
    <section aria-labelledby="ticket-table-title" className="ocean-panel overflow-hidden rounded-xl border">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <h2 id="ticket-table-title" className="text-xl font-bold text-slate-900">Fila de chamados</h2>
        <div className="ocean-tabs grid grid-cols-1 gap-1 rounded-xl border border-slate-200 p-1.5 sm:flex sm:gap-2" role="tablist" aria-label="Status dos chamados">
          <button
            onClick={() => setActiveTab(TicketTableTab.Open)}
            className={getTabClass(TicketTableTab.Open)}
            role="tab"
            aria-selected={activeTab === TicketTableTab.Open}
          >
            Abertos
          </button>
          <button
            onClick={() => setActiveTab(TicketTableTab.InProgress)}
            className={getTabClass(TicketTableTab.InProgress)}
            role="tab"
            aria-selected={activeTab === TicketTableTab.InProgress}
          >
            Em Andamento
          </button>
          <button
            onClick={() => setActiveTab(TicketTableTab.Resolved)}
            className={getTabClass(TicketTableTab.Resolved)}
            role="tab"
            aria-selected={activeTab === TicketTableTab.Resolved}
          >
            Resolvidos
          </button>
        </div>
      </div>
      <TicketFilterControls filters={filters} onApply={onApplyFilters} onClear={onClearFilters} />

      <div className="overflow-x-auto custom-scrollbar">
        <table className="min-w-full divide-y divide-gray-700/60">
          <thead className="ocean-table-head sticky top-0 z-10 bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Chamado
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Solicitante
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Categoria
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Sistema
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Prioridade
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Data
              </th>
               <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider text-center">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="ocean-table-body bg-white divide-y divide-gray-700/60">
            {filteredTickets.length > 0 ? (
              filteredTickets.map((ticket) => (
                <TicketRow 
                  key={ticket.id} 
                  ticket={ticket} 
                  onUpdateTicketStatus={onUpdateTicketStatus}
                  onShowTicketDetail={onShowTicketDetail}
                  currentUserRole={currentUserRole}
                  onDeleteTicket={onDeleteTicket}
                />
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center text-slate-500">
                  <div className='flex flex-col items-center justify-center'>
                    <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-teal-500 text-teal-600"><CheckCircleIcon className="h-7 w-7" /></span>
                    <p className='font-semibold text-slate-800'>{emptyState.title}</p>
                    <p className='mt-1 text-sm'>{emptyState.description}</p>
                    <button type="button" onClick={() => emptyState.tab ? setActiveTab(emptyState.tab) : onCreateTicket()} className="mt-4 min-h-11 rounded-lg border border-teal-600 px-4 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50">{emptyState.action}</button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {tickets.length < totalTickets && (
        <div className="px-6 py-4 text-center border-t border-slate-200">
            <button
                onClick={onLoadMore}
                disabled={isLoadingMore}
                className="min-h-11 rounded-lg border border-slate-300 bg-white px-6 py-2.5 font-semibold text-slate-800 transition-colors hover:bg-slate-50 disabled:cursor-wait disabled:opacity-50"
            >
                {isLoadingMore ? 'Carregando...' : 'Mostrar mais'}
            </button>
        </div>
      )}
    </section>
  );
};

export default TicketTable;
