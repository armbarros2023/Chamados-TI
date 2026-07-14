import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import MainContent from '../components/MainContent';
import NewTicketScreen from '../components/NewTicketScreen';
import ProfileScreen from '../components/ProfileScreen';
import UserManagementScreen from '../components/UserManagementScreen';
import TicketDetailModal from '../components/TicketDetailModal';
import { useAuth } from '../context/AuthContext';
import { Ticket, ViewMode, TicketStatus, TicketTableTab, User } from '../types';
import * as apiService from '../services/apiService';
import {ConfirmDialog, Notice} from '../components/Feedback';

const TICKETS_PER_PAGE = 15;

const DashboardPage: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [totalTickets, setTotalTickets] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicketForDetail, setSelectedTicketForDetail] = useState<Ticket | null>(null);
  const [activeTab, setActiveTab] = useState<TicketTableTab>(TicketTableTab.Open);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{message: string; action: () => Promise<void>} | null>(null);
  const [metrics, setMetrics] = useState<apiService.TicketMetric[]>([]);
  const [metricsLoading, setMetricsLoading] = useState(false);

  const fetchInitialTickets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { tickets: initialTickets, total } = await apiService.getTickets(TICKETS_PER_PAGE, 0);
      setTickets(initialTickets);
      setTotalTickets(total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Um erro desconhecido ocorreu.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Agora, apenas busca os tickets, sem delay ou splash screen.
    fetchInitialTickets();
  }, [fetchInitialTickets]);

  const handleAvatarUpdated = (updatedUser: User) => {
    updateUser(updatedUser);
    setTickets(prevTickets =>
      prevTickets.map(ticket => {
        if (ticket.requester.name === updatedUser.name) {
          return { ...ticket, requester: { ...ticket.requester, avatarUrl: updatedUser.avatarUrl, }, };
        }
        return ticket;
      })
    );
  };
  
  const handleLoadMore = async () => {
    if (isLoadingMore || tickets.length >= totalTickets) return;
    setIsLoadingMore(true);
    try {
        const currentOffset = tickets.length;
        const { tickets: newTickets } = await apiService.getTickets(TICKETS_PER_PAGE, currentOffset);
        setTickets(prevTickets => [...prevTickets, ...newTickets]);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar mais chamados.');
    } finally {
        setIsLoadingMore(false);
    }
  };

  const navigateTo = useCallback((view: ViewMode) => {
    setCurrentView(view);
    setIsSidebarOpen(false);
    if (view === 'dashboard') {
      setActiveTab(TicketTableTab.Open);
    }
  }, []);

  const handleCreateTicket = useCallback(async () => {
    try {
      await fetchInitialTickets();
      navigateTo('dashboard');
    } catch (err) {
      setNotice('Erro ao criar chamado. Tente novamente.');
    }
  }, [fetchInitialTickets, navigateTo]);

  const handleUpdateTicketStatus = useCallback(async (ticketId: string, newStatus: TicketStatus) => {
    try {
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
      await apiService.updateTicketStatus(ticketId, newStatus);
    } catch (err) {
      setNotice('Erro ao atualizar status. Tente novamente.');
      fetchInitialTickets();
    }
  }, [fetchInitialTickets]);

  const handleDeleteTicket = useCallback((ticketId: string) => {
    setConfirmation({message: 'Excluir este chamado permanentemente?', action: async () => {
      try { await apiService.deleteTicket(ticketId); await fetchInitialTickets(); setNotice('Chamado excluído.'); }
      catch { setNotice('Erro ao excluir chamado.'); }
    }});
  }, [fetchInitialTickets]);

  useEffect(() => {
    if (user?.role !== 'Administrador') return;
    setMetricsLoading(true);
    apiService.getTicketMetrics().then(setMetrics).catch(() => setNotice('Não foi possível carregar as métricas.')).finally(() => setMetricsLoading(false));
  }, [user?.role, tickets.length, totalTickets]);

  const handlePruneByCount = useCallback(() => {
    setConfirmation({message: 'Excluir todos os chamados, exceto os 15 mais recentes?', action: async () => {
      try { const result = await apiService.pruneTicketsByCount(); setNotice(result.message); await fetchInitialTickets(); }
      catch (err) { setNotice(err instanceof Error ? err.message : 'Erro ao realizar a limpeza por contagem.'); }
    }});
  }, [fetchInitialTickets]);

  const handlePruneByDate = useCallback(() => {
    setConfirmation({message: 'Excluir todos os chamados com mais de 30 dias?', action: async () => {
      try { const result = await apiService.pruneTicketsByDate(); setNotice(result.message); await fetchInitialTickets(); }
      catch (err) { setNotice(err instanceof Error ? err.message : 'Erro ao realizar a limpeza por data.'); }
    }});
  }, [fetchInitialTickets]);

  const handleShowTicketDetail = useCallback(async (ticket: Ticket) => {
    setSelectedTicketForDetail(ticket);
    const isUnreadForCurrentUser = (user?.role === 'Administrador' && ticket.unreadByAdmin) || (user?.role !== 'Administrador' && ticket.unreadByRequester);
    if (isUnreadForCurrentUser) {
        try {
            setTickets(prevTickets => prevTickets.map(t => {
                if (t.id === ticket.id) {
                    return { 
                        ...t, 
                        unreadByAdmin: user?.role === 'Administrador' ? false : t.unreadByAdmin,
                        unreadByRequester: user?.role !== 'Administrador' ? false : t.unreadByRequester
                    };
                }
                return t;
            }));
            await apiService.markTicketAsRead(ticket.id);
        } catch (error) {
            console.error("Falha ao marcar chamado como lido:", error);
        }
    }
  }, [user]);

  const handleCloseTicketDetail = useCallback(() => setSelectedTicketForDetail(null), []);

  // Se não houver usuário, não renderiza nada (a rota já deve proteger isso)
  if (!user) {
    return null;
  }

  const renderContent = () => {
    const mainContentWithMenuButton = (
      <MainContent
        user={user}
        tickets={tickets}
        totalTickets={totalTickets}
        isLoadingMore={isLoadingMore}
        navigateTo={navigateTo}
        onUpdateTicketStatus={handleUpdateTicketStatus}
        onShowTicketDetail={handleShowTicketDetail}
        currentUserRole={user.role}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onDeleteTicket={handleDeleteTicket}
        onPruneByCount={handlePruneByCount}
        onPruneByDate={handlePruneByDate}
        onLoadMore={handleLoadMore}
        onMenuClick={() => setIsSidebarOpen(true)}
        metrics={metrics}
        metricsLoading={metricsLoading}
      />
    );

    if (isLoading) {
      return (
        <div className="flex-1 flex items-center justify-center text-slate-600">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-teal-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Carregando chamados...
        </div>
      );
    }
    if (error) {
      return <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center"><p role="alert" className="text-red-800 dark:text-red-200">Não foi possível carregar os chamados. {error}</p><button type="button" onClick={fetchInitialTickets} className="ui-primary min-h-11 rounded-lg px-4 py-2.5 font-semibold transition-colors">Tentar novamente</button></div>;
    }

    switch (currentView) {
      case 'newTicket':
        return <NewTicketScreen user={user} onTicketCreate={handleCreateTicket} onCancel={() => navigateTo('dashboard')} />;
      case 'profile':
        return <ProfileScreen user={user} onBackToDashboard={() => navigateTo('dashboard')} onAvatarUpdated={handleAvatarUpdated} />;
      case 'userManagement':
        return <UserManagementScreen onBackToDashboard={() => navigateTo('dashboard')} />;
      case 'dashboard':
      default:
        return mainContentWithMenuButton;
    }
  };

  return (
    <div className="ui-page flex h-[100dvh] min-h-screen overflow-hidden font-sans">
      <Sidebar
        user={user}
        tickets={tickets}
        setCurrentView={navigateTo}
        currentView={currentView}
        onLogout={logout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        {renderContent()}
      </main>
      <TicketDetailModal
        ticket={selectedTicketForDetail}
        onClose={handleCloseTicketDetail}
        currentUser={user}
      />
      <Notice message={notice} onDismiss={() => setNotice(null)} />
      <ConfirmDialog message={confirmation?.message ?? null} onCancel={() => setConfirmation(null)} onConfirm={() => { const action = confirmation?.action; setConfirmation(null); void action?.(); }} />
    </div>
  );
};

export default DashboardPage;
