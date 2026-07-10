import React, { useMemo } from 'react';
import { User, Ticket, NavItem, ViewMode, TicketStatus } from '../types';
import { ChartBarIcon, PlusIcon, UserCircleIconComponent, UserGroupIcon, ChevronRightIcon, LogoutIcon, XMarkIcon } from './icons';
import { getFullAvatarUrl } from '../utils';
import { quickStatus } from '../constants';
import ThemeToggle from './ThemeToggle';

interface SidebarProps {
  user: User;
  tickets: Ticket[];
  setCurrentView: (view: ViewMode) => void;
  currentView: ViewMode;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, tickets, setCurrentView, currentView, onLogout, isOpen, onClose }) => {
    const statusCounts = quickStatus(tickets);
    
    const navigationItems = useMemo((): NavItem[] => {
        const items: NavItem[] = [
          { name: "Painel", icon: ChartBarIcon, action: () => setCurrentView('dashboard') },
          { name: "Novo Chamado", icon: PlusIcon, action: () => setCurrentView('newTicket') },
          { name: "Meu Perfil", icon: UserCircleIconComponent, action: () => setCurrentView('profile') },
        ];
        if (user.role === 'Administrador') {
          items.push({ name: "Gerenciar Usuários", icon: UserGroupIcon, action: () => setCurrentView('userManagement') });
        }
        return items;
    }, [user.role, setCurrentView]);

    const isActive = (viewName: ViewMode) => currentView === viewName;

    const getStatusDisplayName = (status: TicketStatus): string => {
        switch (status) {
            case TicketStatus.Open: return "Abertos";
            case TicketStatus.InProgress: return "Em Andamento";
            case TicketStatus.Resolved: return "Resolvido";
            default: return status;
        }
    };
    const getStatusColorClass = (status: TicketStatus): string => {
        const colors = {
            [TicketStatus.Open]: "bg-blue-500/20 text-blue-300",
            [TicketStatus.InProgress]: "bg-yellow-500/20 text-yellow-300",
            [TicketStatus.Resolved]: "bg-green-500/20 text-green-300",
        };
        return colors[status] || "bg-gray-500/20 text-slate-300";
    }
    
    const anyUnread = useMemo(() => tickets.some(t => (user.role === 'Administrador' && t.unreadByAdmin) || (user.role !== 'Administrador' && t.unreadByRequester)), [tickets, user.role]);

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 z-30 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      ></div>

      <aside className={`fixed top-0 left-0 h-full w-72 bg-slate-900 border-r border-slate-800 p-6 flex flex-col z-40 transition-transform duration-200 ease-out lg:static lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between lg:justify-center text-center mb-10">
          <div className="flex flex-col items-center space-y-4">
            <img 
                src="/images.png" 
                alt="Chemisch Labs Logo"
                className="h-24 w-24 rounded-full object-cover ring-2 ring-offset-4 ring-offset-slate-900 ring-teal-400"
            />
            <div>
                <h1 className="text-xl font-bold text-white">Chemisch Labs</h1>
                <p className="text-sm text-slate-300">Suporte Técnico</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
              <XMarkIcon className="h-7 w-7"/>
          </button>
        </div>
        
        <nav className="flex-grow">
            <h2 className="text-xs font-semibold text-slate-400 mb-4 uppercase tracking-wider">Navegação</h2>
            <ul className="space-y-2">
            {navigationItems.map((item) => {
                let active = false;
                let hasNotification = false;
                
                if (item.name === "Painel") {
                    active = isActive('dashboard');
                    hasNotification = anyUnread;
                }
                else if (item.name === "Novo Chamado") active = isActive('newTicket');
                else if (item.name === "Meu Perfil") active = isActive('profile');
                else if (item.name === "Gerenciar Usuários") active = isActive('userManagement');
                
                return <NavItemLink key={item.name} item={item} active={active} hasNotification={hasNotification} />
            })}
            </ul>
        </nav>
        <div className='mb-8'>
            <h2 className="text-xs font-semibold text-slate-400 mb-4 uppercase tracking-wider">Status Rápido</h2>
            <ul className="space-y-3">
            {statusCounts.map((statusItem) => (
                <li key={statusItem.name} className="flex justify-between items-center text-sm text-slate-200 group">
                <div className="flex items-center">
                    <span className={`h-2 w-2 rounded-full mr-3 ${getStatusColorClass(statusItem.name).split(' ')[0]}`}></span>
                    <span>{getStatusDisplayName(statusItem.name)}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${getStatusColorClass(statusItem.name)} 
                    ${statusItem.name === TicketStatus.Open && statusItem.count > 0 ? 'animate-pulse ring-2 ring-offset-2 ring-offset-gray-900 ring-blue-500' : ''}`}>
                    {statusItem.count}
                </span>
                </li>
            ))}
            </ul>
        </div>
        <div className="mt-auto border-t border-slate-800 pt-6">
            <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-slate-300">Aparência</span>
                <ThemeToggle />
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    {user.avatarUrl ? (
                        <img src={getFullAvatarUrl(user.avatarUrl)} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                        <div className="h-10 w-10 rounded-full flex items-center justify-center bg-teal-600 text-white text-base font-semibold">
                        {user.name.split(' ').map(n => n[0]).join('').substring(0,2)}
                        </div>
                    )}
                    <div>
                        <p className="text-sm font-semibold text-white">{user.name}</p>
                        <p className="text-xs text-slate-300">{user.role}</p>
                    </div>
                </div>
                <button
                    onClick={onLogout}
                    className="p-2 text-white rounded-lg hover:bg-red-700 transition-colors"
                    aria-label="Sair"
                    title="Sair"
                >
                    <LogoutIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
      </aside>
    </>
  );
};

interface NavItemLinkProps {
  item: NavItem;
  active: boolean;
  hasNotification?: boolean;
}

const NavItemLink: React.FC<NavItemLinkProps> = ({ item, active, hasNotification }) => {
  const Icon = item.icon;
  return (
    <li>
      <button 
        onClick={item.action}
        className={`w-full flex items-center justify-between space-x-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 transform
          ${active
            ? 'bg-teal-600 text-white font-semibold'
            : 'text-slate-200 hover:bg-slate-800 hover:text-white hover:translate-x-1'
          }`}
      >
        <div className="flex items-center space-x-3">
          <Icon className="h-5 w-5" />
          <span>{item.name}</span>
           {hasNotification && !active && (
            <span className="relative flex h-2.5 w-2.5 ml-auto">
                <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-40"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
            </span>
        )}
        </div>
        <ChevronRightIcon className={`h-4 w-4 transition-transform ${active ? 'text-white' : 'text-gray-600'}`} />
      </button>
    </li>
  );
};

export default Sidebar;
