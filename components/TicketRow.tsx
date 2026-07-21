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
  const baseClass = 'flex items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold';
  switch (priority) {
    case TicketPriority.High:
      return `${baseClass} border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200`;
    case TicketPriority.Medium:
      return `${baseClass} border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200`;
    case TicketPriority.Low:
      return `${baseClass} border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-200`;
    default:
      return `${baseClass} border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200`;
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
    <tr className={`ticket-table-row group transition-colors duration-200 ${hasUnreadMessage ? 'bg-amber-50 hover:bg-amber-100' : 'hover:bg-slate-50'}`}>
        <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center space-x-3">
                <div className="max-w-48">
                     <div className="flex items-center gap-2.5">
                        <button onClick={handleRowClick} className="max-w-full truncate text-left text-sm font-semibold text-slate-900 transition-colors hover:text-teal-700" title={ticket.title} aria-label={`Visualizar detalhes do chamado ${ticket.title}`}>
                            {ticket.title}
                        </button>
                        {hasUnreadMessage && (
                            <span className="rounded-full bg-teal-100 px-2.5 py-1 text-xs font-bold text-teal-800 dark:bg-teal-950/60 dark:text-teal-200">NOVO</span>
                        )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{ticket.ticketNumber}</div>
                </div>
            </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
            {ticket.requester.avatarUrl ? (
                <img src={getFullAvatarUrl(ticket.requester.avatarUrl)} alt={ticket.requester.name} className="h-9 w-9 rounded-full mr-3 object-cover" loading="lazy" decoding="async"/>
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
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700">
            {ticket.system || 'Não classificado'}
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
                  <button onClick={() => onUpdateTicketStatus(ticket.id, TicketStatus.InProgress)} className="min-h-11 rounded-md bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-800" title="Iniciar atendimento">
                      Iniciar
                  </button>
                )}
                {currentUserRole === 'Administrador' && ticket.status === TicketStatus.InProgress && (
                  <button onClick={() => onUpdateTicketStatus(ticket.id, TicketStatus.Resolved)} className="min-h-11 rounded-md bg-green-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-green-800" title="Marcar chamado como resolvido">
                      Marcar resolvido
                  </button>
                )}
                {currentUserRole === 'Administrador' && (
                  <button onClick={() => onDeleteTicket(ticket.id)} className="min-h-11 min-w-11 rounded-md bg-red-800 p-2 text-xs font-semibold text-white transition-colors hover:bg-red-900" title="Excluir chamado" aria-label={`Excluir chamado ${ticket.title}`}>
                      <TrashIcon className="h-4 w-4" />
                  </button>
                )}
            </div>
        </td>
    </tr>
  );
};

export default TicketRow;
