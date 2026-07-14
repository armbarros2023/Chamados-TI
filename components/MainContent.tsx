import React, { useState, useEffect, useRef } from 'react';
import { User, Ticket, TicketStatus, ViewMode, TicketTableTab } from '../types';
import SummaryCard from './SummaryCard';
import TicketTable from './TicketTable';
import { PlusIcon, ComputerDesktopIcon, ExclamationTriangleIcon, ClockIcon, CheckCircleIcon, TrashIcon, Bars3Icon } from './icons';
import DepartmentMetrics from './DepartmentMetrics';
import {TicketMetric} from '../services/apiService';

interface MainContentProps {
  user: User;
  tickets: Ticket[];
  totalTickets: number;
  isLoadingMore: boolean;
  navigateTo: (view: ViewMode) => void;
  onUpdateTicketStatus: (ticketId: string, newStatus: TicketStatus) => void;
  onShowTicketDetail: (ticket: Ticket) => void;
  currentUserRole: string;
  activeTab: TicketTableTab;
  setActiveTab: (tab: TicketTableTab) => void;
  onDeleteTicket: (ticketId: string) => void;
  onPruneByCount: () => void;
  onPruneByDate: () => void;
  onLoadMore: () => void;
  onMenuClick: () => void;
  metrics: TicketMetric[];
  metricsLoading: boolean;
}

const MainContent: React.FC<MainContentProps> = ({ user, tickets, totalTickets, isLoadingMore, navigateTo, onUpdateTicketStatus, onShowTicketDetail, currentUserRole, activeTab, setActiveTab, onDeleteTicket, onPruneByCount, onPruneByDate, onLoadMore, onMenuClick, metrics, metricsLoading }) => {
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const abertos = tickets.filter(t => t.status === TicketStatus.Open).length;
  const emAndamento = tickets.filter(t => t.status === TicketStatus.InProgress).length;
  const resolvidos = tickets.filter(t => t.status === TicketStatus.Resolved).length;

  // Fecha o menu se clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsActionMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  return (
    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar sm:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
            <button onClick={onMenuClick} className="min-h-11 min-w-11 text-slate-600 hover:text-slate-900 lg:hidden" aria-label="Abrir navegação">
                <Bars3Icon className="h-7 w-7"/>
            </button>
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Olá, {user.name.split(' ')[0]}</h1>
                <p className="text-slate-600 mt-1 text-sm md:text-base">Acompanhe prioridades e próximos atendimentos.</p>
            </div>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto">
            {currentUserRole === 'Administrador' && (
                <div className="relative" ref={menuRef}>
                    <button 
                        onClick={() => setIsActionMenuOpen(!isActionMenuOpen)} 
                        className="flex min-h-11 min-w-11 items-center space-x-2 rounded-lg border border-slate-300 bg-white p-2.5 font-semibold text-red-700 transition-colors hover:bg-slate-50"
                        title="Ações de Administrador"
                        aria-label="Abrir ações administrativas"
                        aria-expanded={isActionMenuOpen}
                        aria-haspopup="menu"
                    >
                        <TrashIcon className="h-5 w-5" />
                    </button>
                    {isActionMenuOpen && (
                        <div className="ui-surface absolute right-0 top-full z-20 mt-2 w-64 rounded-xl border shadow-md" role="menu" aria-label="Ações administrativas">
                            <div className="p-2">
                                <p className="px-3 py-1.5 text-xs font-semibold text-slate-600 uppercase">Limpeza de Chamados</p>
                                <button onClick={() => { onPruneByCount(); setIsActionMenuOpen(false); }} className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-red-800 transition-colors hover:bg-red-50" role="menuitem">
                                    <TrashIcon className="h-5 w-5" />
                                    <span>Limpar por Contagem</span>
                                </button>
                                <button onClick={() => { onPruneByDate(); setIsActionMenuOpen(false); }} className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-red-800 transition-colors hover:bg-red-50" role="menuitem">
                                    <TrashIcon className="h-5 w-5" />
                                    <span>Limpar por Data</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
            <button 
                onClick={() => navigateTo('newTicket')}
                className="ui-primary flex min-h-11 items-center space-x-2 rounded-lg px-4 py-2.5 font-semibold transition-colors"
            >
                <PlusIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Novo Chamado</span>
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <SummaryCard title="Total" count={totalTickets} icon={ComputerDesktopIcon} color="blue" />
        <SummaryCard title="Abertos" count={abertos} icon={ExclamationTriangleIcon} color="yellow" />
        <SummaryCard title="Em Andamento" count={emAndamento} icon={ClockIcon} color="purple" />
        <SummaryCard title="Resolvidos" count={resolvidos} icon={CheckCircleIcon} color="green" />
      </div>

      {currentUserRole === 'Administrador' && <DepartmentMetrics metrics={metrics} isLoading={metricsLoading} />}

      <TicketTable 
        tickets={tickets} 
        totalTickets={totalTickets}
        isLoadingMore={isLoadingMore}
        onUpdateTicketStatus={onUpdateTicketStatus}
        onShowTicketDetail={onShowTicketDetail}
        currentUserRole={currentUserRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onDeleteTicket={onDeleteTicket}
        onLoadMore={onLoadMore}
      />
    </div>
  );
};

export default MainContent;
