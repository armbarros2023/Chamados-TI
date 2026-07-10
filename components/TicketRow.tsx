import React from 'react';
import { Ticket, TicketStatus, TicketPriority } from '../types';
import { TrashIcon, Squares2X2Icon } from './icons';
import { getFullAvatarUrl } from '../utils';

interface TicketRowProps {
  ticket: Ticket;
  onUpdateTicketStatus: (ticketId: string, newStatus: TicketStatus) => void;
  onShowTicketDetail: (ticket: Ticket) => void;
  currentUserRole: string;
  onDeleteTicket: (ticketId: string) => void;
}

const getPriorityPillClass = (priority: TicketPriority) => {
  const baseClass = 'px-3 py-1 text-xs font-semibold rounded-full flex items-center justify-center';
  switch (priority) {
    case TicketPriority.High:
      return `${baseClass} bg-red-500/20 text-red-300 border border-red-500/30`;
    case TicketPriority.Medium:
      return `${baseClass} bg-orange-500/20 text-teal-800 border border-orange-500/30`;
    case TicketPriority.Low:
      return `${baseClass} bg-blue-500/20 text-blue-300 border border-blue-500/30`;
    default:
      return `${baseClass} bg-gray-500/20 text-slate-700 border border-gray-500/30`;
  }
};

const capitalizeFirstLetter = (string: string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const TicketRow: React.FC<TicketRowProps> = ({ ticket, onUpdateTicketStatus, onShowTicketDetail, currentUserRole, onDeleteTicket }) => {
  
  const handleRowClick = () => {
    onShowTicketDetail(ticket);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
  };

  const hasUnreadMessage = (currentUserRole === 'Administrador' && ticket.unreadByAdmin) ||
                           (currentUserRole !== 'Administrador' && ticket.unreadByRequester);

  return (
    <tr
      className={`group transition-colors duration-200 cursor-pointer ${hasUnreadMessage ? 'bg-amber-50 hover:bg-amber-100' : 'hover:bg-slate-50'}`}
      onClick={handleRowClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleRowClick();}}
      aria-label={`Visualizar detalhes do chamado ${ticket.title}`}
    >
        <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center space-x-3">
                <div className="max-w-48">
                     <div className="flex items-center gap-2.5">
                        <div className="text-sm font-semibold text-slate-900 truncate group-hover:text-teal-700" title={ticket.title}>
                            {ticket.title}
                        </div>
                        {hasUnreadMessage && (
                            <span className="text-xs font-bold text-teal-800 bg-orange-500/20 px-2.5 py-1 rounded-full animate-pulse">NOVO</span>
                        )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{ticket.ticketNumber}</div>
                </div>
            </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
            {ticket.requester.avatarUrl ? (
                <img src={getFullAvatarUrl(ticket.requester.avatarUrl)} alt={ticket.requester.name} className="h-9 w-9 rounded-full mr-3 object-cover"/>
            ) : (
                <div className="h-9 w-9 rounded-full flex items-center justify-center bg-slate-700 text-white text-sm font-bold mr-3">
                    {ticket.requester.name.split(' ').map(n => n[0]).join('').substring(0,2)}
                </div>
            )}
            <div className="max-w-32">
                <div className="text-sm text-slate-700 truncate" title={ticket.requester.name}>
                    {ticket.requester.name}
                </div>
                <div className="text-xs text-slate-500 truncate" title={ticket.requester.role}>
                    {ticket.requester.role}
                </div>
            </div>
            </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center text-sm text-slate-600">
                <Squares2X2Icon className="h-5 w-5 mr-2 text-slate-600"/>
                {ticket.category}
            </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
            <span className={getPriorityPillClass(ticket.priority)}>
                {capitalizeFirstLetter(ticket.priority)}
            </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
            {formatDate(ticket.date)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
            <div className="flex items-center space-x-2 justify-center">
                {currentUserRole === 'Administrador' && ticket.status === TicketStatus.Open && (
                  <button onClick={(e) => { e.stopPropagation(); onUpdateTicketStatus(ticket.id, TicketStatus.InProgress);}} className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold py-1.5 px-3 rounded-md transition-colors" title="Iniciar Atendimento">
                      Iniciar
                  </button>
                )}
                {currentUserRole === 'Administrador' && ticket.status === TicketStatus.InProgress && (
                  <button onClick={(e) => { e.stopPropagation(); onUpdateTicketStatus(ticket.id, TicketStatus.Resolved);}} className="text-xs bg-green-600 hover:bg-green-500 text-white font-semibold py-1.5 px-3 rounded-md transition-colors" title="Resolver Chamado">
                      Resolver
                  </button>
                )}
                {currentUserRole === 'Administrador' && (
                  <button onClick={(e) => { e.stopPropagation(); onDeleteTicket(ticket.id);}} className="text-xs bg-red-800 hover:bg-red-700 text-white font-semibold p-2 rounded-md transition-colors" title="Excluir Chamado">
                      <TrashIcon className="h-4 w-4" />
                  </button>
                )}
            </div>
        </td>
    </tr>
  );
};

export default TicketRow;
