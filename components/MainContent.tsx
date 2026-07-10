import React, { useState, useEffect, useRef } from 'react';
import { User, Ticket, TicketStatus, ViewMode, TicketTableTab } from '../types';
import SummaryCard from './SummaryCard';
import TicketTable from './TicketTable';
import { PlusIcon, ComputerDesktopIcon, ExclamationTriangleIcon, ClockIcon, CheckCircleIcon, TrashIcon, Bars3Icon } from './icons';

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
}

const MainContent: React.FC<MainContentProps> = ({ user, tickets, totalTickets, isLoadingMore, navigateTo, onUpdateTicketStatus, onShowTicketDetail, currentUserRole, activeTab, setActiveTab, onDeleteTicket, onPruneByCount, onPruneByDate, onLoadMore, onMenuClick }) => {
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
    <div className="flex-1 p-4 sm:p-8 overflow-y-auto custom-scrollbar">
      <div className="flex justify-between items-start mb-8 gap-4">
        <div className="flex items-center gap-4">
            <button onClick={onMenuClick} className="lg:hidden text-slate-600 hover:text-slate-900 min-h-11 min-w-11">
                <Bars3Icon className="h-7 w-7"/>
            </button>
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Olá, {user.name.split(' ')[0]}</h1>
                <p className="text-slate-600 mt-1 text-sm md:text-base">Acompanhe prioridades e próximos atendimentos.</p>
            </div>
        </div>
        <div className="flex items-center gap-3">
            {currentUserRole === 'Administrador' && (
                <div className="relative" ref={menuRef}>
                    <button 
                        onClick={() => setIsActionMenuOpen(!isActionMenuOpen)} 
                        className="bg-white hover:bg-slate-50 border border-slate-300 text-red-700 font-semibold p-2.5 rounded-lg flex items-center space-x-2 transition-colors min-h-11 min-w-11" 
                        title="Ações de Administrador"
                    >
                        <TrashIcon className="h-5 w-5" />
                    </button>
                    {isActionMenuOpen && (
                        <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-md z-20">
                            <div className="p-2">
                                <p className="px-3 py-1.5 text-xs font-semibold text-slate-600 uppercase">Limpeza de Chamados</p>
                                <button onClick={() => { onPruneByCount(); setIsActionMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-800 hover:bg-red-50 transition-colors">
                                    <TrashIcon className="h-5 w-5" />
                                    <span>Limpar por Contagem</span>
                                </button>
                                <button onClick={() => { onPruneByDate(); setIsActionMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-800 hover:bg-red-50 transition-colors">
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
                className="bg-teal-700 hover:bg-teal-800 text-white font-semibold py-2.5 px-4 rounded-lg flex items-center space-x-2 transition-colors min-h-11"
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
