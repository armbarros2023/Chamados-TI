import React, { useMemo } from 'react';
import { Ticket, TicketStatus, TicketTableTab } from '../types';
import TicketRow from './TicketRow';

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
}

const TicketTable: React.FC<TicketTableProps> = ({ tickets, totalTickets, isLoadingMore, onUpdateTicketStatus, onShowTicketDetail, currentUserRole, activeTab, setActiveTab, onDeleteTicket, onLoadMore }) => {
  
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
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 flex justify-between items-center border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900">Fila de Chamados</h2>
        <div className="flex space-x-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab(TicketTableTab.Open)}
            className={getTabClass(TicketTableTab.Open)}
          >
            Abertos
          </button>
          <button
            onClick={() => setActiveTab(TicketTableTab.InProgress)}
            className={getTabClass(TicketTableTab.InProgress)}
          >
            Em Andamento
          </button>
          <button
            onClick={() => setActiveTab(TicketTableTab.Resolved)}
            className={getTabClass(TicketTableTab.Resolved)}
          >
            Resolvidos
          </button>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="min-w-full divide-y divide-gray-700/60">
          <thead className="bg-slate-50 backdrop-blur-sm sticky top-0 z-10">
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
          <tbody className="bg-white divide-y divide-gray-700/60">
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
                <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                  <div className='flex flex-col items-center justify-center'>
                    <p className='font-semibold'>Tudo limpo por aqui!</p>
                    <p className='text-sm'>Nenhum chamado encontrado para esta guia.</p>
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
                className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold py-2.5 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-wait"
            >
                {isLoadingMore ? 'Carregando...' : 'Mostrar mais'}
            </button>
        </div>
      )}
    </div>
  );
};

export default TicketTable;
