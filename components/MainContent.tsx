import React, { useState, useEffect, useRef } from 'react';
import { User, Ticket, TicketStatus, TicketSystem, ViewMode, TicketTableTab } from '../types';
import SummaryCard from './SummaryCard';
import TicketTable from './TicketTable';
import { PlusIcon, ComputerDesktopIcon, ExclamationTriangleIcon, ClockIcon, CheckCircleIcon, TrashIcon, Bars3Icon } from './icons';
import DepartmentMetrics from './DepartmentMetrics';
import SystemMetrics from './SystemMetrics';
import QueueSummary from './QueueSummary';
import {TicketFilters, TicketMetric, TicketSystemMetric} from '../services/apiService';

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
  systemMetrics: TicketSystemMetric[];
  onSelectSystem: (system: TicketSystem) => void;
  filters: TicketFilters;
  onApplyFilters: (filters: TicketFilters) => void;
  onClearFilters: () => void;
  statusCounts: Record<TicketStatus, number>;
  averageClosureHours: number | null;
  onRefresh: () => void;
}

const formatDuration = (hours: number | null) => {
  if (hours === null) return '—';
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} min`;
  const days = Math.floor(hours / 24);
  const remainingHours = Math.round(hours % 24);
  return days > 0 ? `${days}d ${remainingHours}h` : `${Math.round(hours)}h`;
};

const MainContent: React.FC<MainContentProps> = ({ user, tickets, totalTickets, isLoadingMore, navigateTo, onUpdateTicketStatus, onShowTicketDetail, currentUserRole, activeTab, setActiveTab, onDeleteTicket, onPruneByCount, onPruneByDate, onLoadMore, onMenuClick, metrics, metricsLoading, systemMetrics, onSelectSystem, filters, onApplyFilters, onClearFilters, statusCounts, averageClosureHours, onRefresh }) => {
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const abertos = statusCounts[TicketStatus.Open];
  const emAndamento = statusCounts[TicketStatus.InProgress];
  const resolvidos = statusCounts[TicketStatus.Resolved];
  const resolvidosNoMes = currentUserRole === 'Administrador' ? systemMetrics.reduce((total, metric) => total + metric.closedCount, 0) : resolvidos;

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
    <main className="ocean-workspace flex-1 overflow-y-auto p-4 custom-scrollbar sm:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
            <button onClick={onMenuClick} className="min-h-11 min-w-11 text-slate-600 hover:text-slate-900 lg:hidden" aria-label="Abrir navegação">
                <Bars3Icon className="h-7 w-7"/>
            </button>
            <div>
                <p className="ocean-eyebrow">Painel</p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Visão geral</h1>
                <p className="mt-2 text-sm text-slate-600 md:text-base">Acompanhe o desempenho e gerencie os chamados da equipe.</p>
            </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3 self-end sm:self-auto">
            <button onClick={onRefresh} className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50" title="Atualizar dados">↻ <span className="ml-1">Atualizado agora</span></button>
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

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
        <SummaryCard title="Chamados abertos" description="Aguardando atendimento" count={abertos} icon={ComputerDesktopIcon} color="blue" />
        <SummaryCard title="Em andamento" description="Sendo tratados pela equipe" count={emAndamento} icon={ClockIcon} color="yellow" />
        <SummaryCard title="Resolvidos no mês" description="Concluídos com sucesso" count={resolvidosNoMes} icon={CheckCircleIcon} color="green" />
        <SummaryCard title="Tempo médio" description="Até o fechamento" count={formatDuration(averageClosureHours)} icon={ExclamationTriangleIcon} color="purple" />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.8fr)_minmax(19rem,1fr)] xl:gap-6">
        <DepartmentMetrics metrics={metrics} isLoading={metricsLoading} />
        <QueueSummary open={abertos} inProgress={emAndamento} resolved={resolvidos} />
      </div>

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
        filters={filters}
        onApplyFilters={onApplyFilters}
        onClearFilters={onClearFilters}
        onCreateTicket={() => navigateTo('newTicket')}
      />

      {currentUserRole === 'Administrador' && (
        <SystemMetrics metrics={systemMetrics} isLoading={metricsLoading} onSelectSystem={onSelectSystem} />
      )}
    </main>
  );
};

export default MainContent;
