import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import MainContent from '../components/MainContent';
import NewTicketScreen from '../components/NewTicketScreen';
import ProfileScreen from '../components/ProfileScreen';
import UserManagementScreen from '../components/UserManagementScreen';
import TicketDetailModal from '../components/TicketDetailModal';
import { useAuth } from '../context/AuthContext';
import { Ticket, ViewMode, TicketStatus, TicketSystem, TicketTableTab, User } from '../types';
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
  const [systemMetrics, setSystemMetrics] = useState<apiService.TicketSystemMetric[]>([]);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsVersion, setMetricsVersion] = useState(0);
  const [filters, setFilters] = useState<apiService.TicketFilters>({});
  const [statusCounts, setStatusCounts] = useState<Record<TicketStatus, number>>({
    [TicketStatus.Open]: 0,
    [TicketStatus.InProgress]: 0,
    [TicketStatus.Resolved]: 0,
  });

  const statusForTab: Record<TicketTableTab, TicketStatus> = {
    [TicketTableTab.Open]: TicketStatus.Open,
    [TicketTableTab.InProgress]: TicketStatus.InProgress,
    [TicketTableTab.Resolved]: TicketStatus.Resolved,
  };

  const fetchInitialTickets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { tickets: initialTickets, total } = await apiService.getTickets(TICKETS_PER_PAGE, 0, {...filters, status: statusForTab[activeTab]});
      setTickets(initialTickets);
      setTotalTickets(total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Um erro desconhecido ocorreu.');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, filters]);

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
        const { tickets: newTickets } = await apiService.getTickets(TICKETS_PER_PAGE, currentOffset, {...filters, status: statusForTab[activeTab]});
        setTickets(prevTickets => [...prevTickets, ...newTickets]);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar mais chamados.');
    } finally {
        setIsLoadingMore(false);
    }
  };

  const handleApplyFilters = useCallback((nextFilters: apiService.TicketFilters) => {
    setFilters(nextFilters);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const handleSelectSystem = useCallback((system: TicketSystem) => {
    const now = new Date();
    const formatDateInput = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const dateFrom = formatDateInput(new Date(now.getFullYear(), now.getMonth(), 1));
    const dateTo = formatDateInput(new Date(now.getFullYear(), now.getMonth() + 1, 0));
    setFilters({system, dateFrom, dateTo});
    setActiveTab(TicketTableTab.Resolved);
  }, []);

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
      setMetricsVersion(version => version + 1);
      navigateTo('dashboard');
    } catch (err) {
      setNotice('Erro ao criar chamado. Tente novamente.');
    }
  }, [fetchInitialTickets, navigateTo]);

  const handleUpdateTicketStatus = useCallback(async (ticketId: string, newStatus: TicketStatus) => {
    try {
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
      await apiService.updateTicketStatus(ticketId, newStatus);
      setMetricsVersion(version => version + 1);
    } catch (err) {
      setNotice('Erro ao atualizar status. Tente novamente.');
      fetchInitialTickets();
    }
  }, [fetchInitialTickets]);

  const handleDeleteTicket = useCallback((ticketId: string) => {
    setConfirmation({message: 'Excluir este chamado permanentemente?', action: async () => {
      try { await apiService.deleteTicket(ticketId); await fetchInitialTickets(); setMetricsVersion(version => version + 1); setNotice('Chamado excluído.'); }
      catch { setNotice('Erro ao excluir chamado.'); }
    }});
  }, [fetchInitialTickets]);

  useEffect(() => {
    if (!user) return;
    setMetricsLoading(true);
    const metricsRequest = user.role === 'Administrador'
      ? Promise.all([apiService.getTicketMetrics(), apiService.getTicketSystemMetrics()])
      : apiService.getTicketMetrics().then(departmentMetrics => [departmentMetrics, []] as const);
    metricsRequest
      .then(([departmentMetrics, nextSystemMetrics]) => {
        setMetrics(departmentMetrics);
        setSystemMetrics(nextSystemMetrics);
      })
      .catch(() => setNotice('Não foi possível carregar as métricas.'))
      .finally(() => setMetricsLoading(false));
  }, [user?.id, user?.role, metricsVersion]);

  useEffect(() => {
    if (!user) return;
    Promise.all(Object.values(TicketStatus).map(status => apiService.getTickets(1, 0, {status})))
      .then(results => setStatusCounts({
        [TicketStatus.Open]: results[0].total,
        [TicketStatus.InProgress]: results[1].total,
        [TicketStatus.Resolved]: results[2].total,
      }))
      .catch(() => setNotice('Não foi possível atualizar o resumo dos chamados.'));
  }, [user?.id, metricsVersion]);

  const averageClosureHours = metrics.reduce((total, metric) => total + ((metric.averageClosureHours ?? 0) * metric.closed), 0) /
    Math.max(1, metrics.reduce((total, metric) => total + metric.closed, 0));
  const averageClosure = metrics.some(metric => metric.closed > 0) ? averageClosureHours : null;

  const handleRefresh = useCallback(() => {
    void fetchInitialTickets();
    setMetricsVersion(version => version + 1);
  }, [fetchInitialTickets]);

  const handlePruneByCount = useCallback(() => {
    setConfirmation({message: 'Excluir todos os chamados, exceto os 15 mais recentes?', action: async () => {
      try { const result = await apiService.pruneTicketsByCount(); setNotice(result.message); await fetchInitialTickets(); setMetricsVersion(version => version + 1); }
      catch (err) { setNotice(err instanceof Error ? err.message : 'Erro ao realizar a limpeza por contagem.'); }
    }});
  }, [fetchInitialTickets]);

  const handlePruneByDate = useCallback(() => {
    setConfirmation({message: 'Excluir todos os chamados com mais de 30 dias?', action: async () => {
      try { const result = await apiService.pruneTicketsByDate(); setNotice(result.message); await fetchInitialTickets(); setMetricsVersion(version => version + 1); }
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
        systemMetrics={systemMetrics}
        onSelectSystem={handleSelectSystem}
        filters={filters}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        statusCounts={statusCounts}
        averageClosureHours={averageClosure}
        onRefresh={handleRefresh}
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
