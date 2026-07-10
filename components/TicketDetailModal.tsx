import React, { useEffect, useState, useRef } from 'react';
import { Ticket, TicketStatus, TicketPriority, User, ChatMessage, Comment } from '../types';
import { XMarkIcon, Cog8ToothIcon, ClockIcon, CheckCircleIcon, PaperAirplaneIcon, EnvelopeIcon, CalendarDaysIcon, HashtagIcon, ShieldCheckIcon, SignalIcon } from './icons';
import * as apiService from '../services/apiService';
import { getFullAvatarUrl } from '../utils';

interface TicketDetailModalProps {
  ticket: Ticket | null;
  onClose: () => void;
  currentUser: User;
}

const TicketDetailModal: React.FC<TicketDetailModalProps> = ({ ticket, onClose, currentUser }) => {
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoadingChat, setIsLoadingChat] = useState(false);
    const [isSendingEmail, setIsSendingEmail] = useState(false); // Estado original restaurado
    const [showEmailForm, setShowEmailForm] = useState(false);
    const [emailMessage, setEmailMessage] = useState('');
    const [feedback, setFeedback] = useState<string | null>(null);
    const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
    const chatMessagesEndRef = useRef<null | HTMLDivElement>(null);

    const getStatusInfo = (status: TicketStatus) => {
        switch (status) {
            case TicketStatus.Open: return { color: 'text-yellow-400', icon: ClockIcon, label: 'Aberto' };
            case TicketStatus.InProgress: return { color: 'text-blue-400', icon: SignalIcon, label: 'Em Andamento' };
            case TicketStatus.Resolved: return { color: 'text-green-400', icon: CheckCircleIcon, label: 'Resolvido' };
            default: return { color: 'text-slate-600', icon: Cog8ToothIcon, label: status };
        }
    };

    const getPriorityInfo = (priority: TicketPriority) => {
        switch (priority) {
            case TicketPriority.High: return 'border-red-500/50 bg-red-500/10 text-red-400';
            case TicketPriority.Medium: return 'border-orange-500/50 bg-orange-500/10 text-teal-700';
            case TicketPriority.Low: return 'border-blue-500/50 bg-blue-500/10 text-blue-400';
            default: return 'border-gray-500/50 bg-gray-500/10 text-slate-600';
        }
    };

    const capitalizeFirstLetter = (string: string) => {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscKey);
        return () => document.removeEventListener('keydown', handleEscKey);
    }, [onClose]);

    useEffect(() => {
        chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages]);

    useEffect(() => {
        if (ticket) {
            const fetchComments = async () => {
                setIsLoadingChat(true);
                try {
                    const commentsFromApi: Comment[] = await apiService.getCommentsForTicket(ticket.id);
                    const formattedMessages: ChatMessage[] = commentsFromApi.map(comment => ({
                        id: comment.id,
                        senderName: comment.author.name,
                        senderAvatar: comment.author.avatarUrl, // Mantido para consistência, mas pode ser undefined
                        text: comment.text,
                        timestamp: new Date(comment.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                        isCurrentUser: comment.author.name === currentUser.name,
                    }));
                    setChatMessages(formattedMessages);
                } catch (error) {
                    console.error("Erro ao buscar comentários:", error);
                } finally {
                    setIsLoadingChat(false);
                }
            };
            fetchComments();
        }
    }, [ticket, currentUser.name]);

    useEffect(() => {
        let objectUrl: string | null = null;
        if (ticket?.attachmentUrl) {
            apiService.getTicketAttachmentUrl(ticket.id).then(url => { objectUrl = url; setAttachmentUrl(url); }).catch(() => setAttachmentUrl(null));
        } else setAttachmentUrl(null);
        return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
    }, [ticket]);

    if (!ticket) return null;

    const { icon: StatusIcon, color: statusColor, label: statusLabel } = getStatusInfo(ticket.status);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !ticket) return;
        const originalMessage = newMessage;
        setNewMessage('');
        try {
            const newComment = await apiService.addCommentToTicket(ticket.id, originalMessage);
            const formattedMessage: ChatMessage = {
                id: newComment.id,
                senderName: newComment.author.name,
                senderAvatar: newComment.author.avatarUrl,
                text: newComment.text,
                timestamp: new Date(newComment.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                isCurrentUser: true,
            };
            setChatMessages(prevMessages => [...prevMessages, formattedMessage]);
        } catch (error) {
            console.error("Erro ao enviar mensagem:", error);
            setNewMessage(originalMessage);
            setFeedback('Não foi possível enviar a mensagem. Tente novamente.');
        }
    };

    const handleSendEmail = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!ticket) return;
        if (emailMessage.trim()) {
            setIsSendingEmail(true);
            try {
                await apiService.sendEmailForTicket(ticket.id, emailMessage);
                setFeedback('E-mail enviado para os administradores.');
                setEmailMessage('');
                setShowEmailForm(false);
            } catch (error) {
                console.error("Erro ao enviar email:", error);
                setFeedback(`Falha ao enviar o e-mail: ${(error as Error).message}`);
            } finally {
                setIsSendingEmail(false);
            }
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ticket-detail-title"
        >
            <div
                className="bg-white border border-slate-200 rounded-xl shadow-md w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-5 border-b border-slate-200 shrink-0">
                    <div>
                        <p className={`text-sm font-semibold flex items-center ${statusColor}`}>
                            <StatusIcon className="h-5 w-5 mr-2" />
                            {statusLabel}
                        </p>
                        <h2 id="ticket-detail-title" className="text-xl font-bold text-slate-900 truncate pr-4" title={ticket.title}>{ticket.title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full p-2.5 transition-colors min-h-11 min-w-11"
                        aria-label="Fechar modal"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 space-y-6">
                        {/* Bloco de Solicitante e Detalhes... */}
                        <div className='bg-white p-4 rounded-lg border border-slate-200'>
                            <p className="text-xs text-slate-600 uppercase mb-2 font-semibold">Solicitante</p>
                            <div className="flex items-center space-x-3">
                                {ticket.requester.avatarUrl ? (
                                    <img src={getFullAvatarUrl(ticket.requester.avatarUrl)} alt={ticket.requester.name} className="h-10 w-10 rounded-full object-cover" />
                                ) : (
                                    <div className="h-10 w-10 rounded-full flex items-center justify-center bg-slate-700 text-white text-sm font-bold">
                                        {ticket.requester.name.split(' ').map((n: string) => n[0]).join('').substring(0,2)}
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">{ticket.requester.name}</p>
                                    <p className="text-xs text-slate-600">{ticket.requester.role}</p>
                                    <p className="text-xs text-slate-500">{ticket.requester.email}</p>
                                </div>
                            </div>
                        </div>
                        <div className='bg-white p-4 rounded-lg border border-slate-200 space-y-3'>
                            <div className="flex items-center">
                                <HashtagIcon className="h-5 w-5 text-slate-500 mr-3" />
                                <div>
                                    <p className="text-xs text-slate-600">Nº do Chamado</p>
                                    <p className="text-sm text-slate-700 font-mono">{ticket.ticketNumber}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <CalendarDaysIcon className="h-5 w-5 text-slate-500 mr-3" />
                                <div>
                                    <p className="text-xs text-slate-600">Data</p>
                                    <p className="text-sm text-slate-700">{new Date(ticket.date).toLocaleDateString('pt-BR')}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <Cog8ToothIcon className="h-5 w-5 text-slate-500 mr-3" />
                                <div>
                                    <p className="text-xs text-slate-600">Categoria</p>
                                    <p className="text-sm text-slate-700">{ticket.category}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <ShieldCheckIcon className="h-5 w-5 text-slate-500 mr-3" />
                                <div>
                                    <p className="text-xs text-slate-600">Prioridade</p>
                                    <p className={`text-sm font-semibold px-2 rounded-md inline-block ${getPriorityInfo(ticket.priority)}`}>{capitalizeFirstLetter(ticket.priority)}</p>
                                </div>
                            </div>
                        </div>
                        {attachmentUrl && (
                            <div className='bg-white p-4 rounded-lg border border-slate-200'>
                                <p className="text-xs text-slate-600 uppercase mb-2 font-semibold">Anexo</p>
                                <a href={attachmentUrl} target="_blank" rel="noopener noreferrer" className='block rounded-lg overflow-hidden border-2 border-transparent hover:border-teal-600 transition-all'>
                                    <img 
                                        src={attachmentUrl}
                                        alt="Anexo do chamado"
                                        className="w-full h-auto object-contain"
                                    />
                                </a>
                            </div>
                        )}
                    </div>
                    <div className="md:col-span-2 flex flex-col space-y-6 min-h-0">
                        <div className='bg-white p-4 rounded-lg border border-slate-200 shrink-0'>
                            <p className="text-xs text-slate-600 uppercase mb-2 font-semibold">Descrição Completa</p>
                            <div className="max-h-32 overflow-y-auto custom-scrollbar pr-2">
                                <p className="text-sm text-slate-700 whitespace-pre-wrap">{ticket.description}</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg border border-slate-200 flex flex-col flex-grow min-h-0">
                            <h3 className="text-sm text-slate-600 uppercase p-4 border-b border-slate-200 font-semibold shrink-0">Chat / Comentários</h3>
                            <div className="flex-grow p-4 space-y-4 overflow-y-auto custom-scrollbar">
                                {isLoadingChat && <p className="text-sm text-slate-600 text-center py-4">Carregando comentários...</p>}
                                {!isLoadingChat && chatMessages.length === 0 && (
                                    <p className="text-sm text-slate-500 text-center py-4">Nenhuma mensagem ainda.</p>
                                )}
                                {chatMessages.map(msg => (
                                    <div key={msg.id} className={`flex items-end gap-2 ${msg.isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                                        {!msg.isCurrentUser && (
                                            msg.senderAvatar ? (
                                                <img src={getFullAvatarUrl(msg.senderAvatar)} alt={msg.senderName} className="h-7 w-7 rounded-full object-cover self-start"/>
                                            ) : (
                                                <div className="h-7 w-7 rounded-full flex items-center justify-center bg-gray-600 text-white text-xs font-bold self-start">
                                                    {msg.senderName.split(' ').map((n: string) => n[0]).join('').substring(0,2)}
                                                </div>
                                            )
                                        )}
                                        <div className={`max-w-[80%] p-3 rounded-xl ${msg.isCurrentUser ? 'bg-teal-700 rounded-br-sm' : 'bg-slate-100 rounded-bl-sm'}`}>
                                            <p className={`text-sm whitespace-pre-wrap ${msg.isCurrentUser ? 'text-white' : 'text-slate-800'}`}>{msg.text}</p>
                                            <p className={`text-xs mt-1.5 ${msg.isCurrentUser ? 'text-right text-teal-50' : 'text-left text-slate-600'}`}>{msg.timestamp}</p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={chatMessagesEndRef} />
                            </div>
                            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 flex items-center space-x-3 shrink-0">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Digite sua mensagem..."
                                    className="flex-1 bg-white border border-slate-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-teal-600 sm:text-sm text-slate-900"
                                    aria-label="Nova mensagem de chat"
                                />
                                <button
                                    type="submit"
                                    className="p-2 bg-teal-700 hover:bg-teal-800 text-white rounded-full transition-colors disabled:opacity-50"
                                    aria-label="Enviar mensagem"
                                    disabled={!newMessage.trim()}
                                >
                                    <PaperAirplaneIcon className="h-5 w-5" />
                                </button>
                            </form>
                        </div>
                        <div className='shrink-0'>
                            <h3 className="text-sm text-slate-600 uppercase mb-2 font-semibold">Ações Rápidas</h3>
                            {feedback && <p role="status" className="mb-3 rounded-lg bg-slate-100 p-3 text-sm text-slate-800">{feedback}</p>}
                            {!showEmailForm ? <button
                                onClick={() => setShowEmailForm(true)}
                                disabled={isSendingEmail}
                                className="w-full flex items-center justify-center min-h-11 py-2.5 px-4 border border-blue-300 rounded-lg text-sm font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 focus:ring-2 focus:ring-blue-600 transition-colors disabled:opacity-50 disabled:cursor-wait"
                                aria-label="Enviar email aos administradores"
                            >
                                <EnvelopeIcon className="h-5 w-5 mr-2" />
                                {isSendingEmail ? 'Enviando Email...' : 'Enviar Email para Administradores'}
                            </button> : (
                              <form onSubmit={handleSendEmail} className="space-y-3">
                                <label htmlFor="email-message" className="block text-sm font-semibold text-slate-700">Mensagem aos administradores</label>
                                <textarea id="email-message" value={emailMessage} onChange={event => setEmailMessage(event.target.value)} rows={4} maxLength={5000} className="w-full rounded-lg border border-slate-300 p-3 text-slate-900 focus:ring-2 focus:ring-teal-600" required />
                                <div className="flex justify-end gap-3">
                                  <button type="button" onClick={() => setShowEmailForm(false)} className="min-h-11 rounded-lg border border-slate-300 px-4 text-slate-800">Cancelar</button>
                                  <button type="submit" disabled={isSendingEmail} className="min-h-11 rounded-lg bg-teal-700 px-4 font-semibold text-white hover:bg-teal-800 disabled:opacity-50">{isSendingEmail ? 'Enviando…' : 'Enviar e-mail'}</button>
                                </div>
                              </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetailModal;
