import { Ticket, TicketStatus, TicketPriority, User, NavItem, TicketCategory, TicketSystem, ViewMode } from './types';
import { ChartBarIcon, PlusIcon, UserCircleIconComponent } from './components/icons';



export const getNavigationItems = (setCurrentView: (view: ViewMode) => void): NavItem[] => [
  { name: "Painel", icon: ChartBarIcon, action: () => setCurrentView('dashboard') },
  { name: "Novo Chamado", icon: PlusIcon, action: () => setCurrentView('newTicket') },
  { name: "Meu Perfil", icon: UserCircleIconComponent, action: () => setCurrentView('profile') },
];


export const quickStatus = (tickets: Ticket[]) => {
  return [
    { name: TicketStatus.Open, count: tickets.filter(t => t.status === TicketStatus.Open).length, color: "blue" },
    { name: TicketStatus.InProgress, count: tickets.filter(t => t.status === TicketStatus.InProgress).length, color: "yellow" },
    { name: TicketStatus.Resolved, count: tickets.filter(t => t.status === TicketStatus.Resolved).length, color: "green" },
  ];
};

export const ticketCategories: { value: TicketCategory; label: string }[] = [
  { value: TicketCategory.AceData, label: "Ace-Data" },
  { value: TicketCategory.Access, label: "Acesso" },
  { value: TicketCategory.Email, label: "Email" },
  { value: TicketCategory.Fluig, label: "Fluig" },
  { value: TicketCategory.Hardware, label: "Hardware" },
  { value: TicketCategory.Other, label: "Outros" },
  { value: TicketCategory.Protheus, label: "Protheus" },
  { value: TicketCategory.Network, label: "Rede" },
  { value: TicketCategory.Software, label: "Software" },
  { value: TicketCategory.TelefoniaFixa, label: "Telefonia Fixa" },
  { value: TicketCategory.TelefoniaMovel, label: "Telefonia Móvel" },
].sort((a, b) => a.label.localeCompare(b.label));


export const ticketPriorities: { value: TicketPriority; label: string }[] = [
  { value: TicketPriority.Low, label: "Baixa" },
  { value: TicketPriority.Medium, label: "Média" },
  { value: TicketPriority.High, label: "Alta" },
];

export const ticketSystems: { value: TicketSystem; label: string; asset: string }[] = [
  { value: TicketSystem.AceData, label: 'AceData', asset: '/systems/acedata.webp' },
  { value: TicketSystem.Computer, label: 'Computador', asset: '/systems/computador.webp' },
  { value: TicketSystem.Fluig, label: 'Fluig', asset: '/systems/fluig.webp' },
  { value: TicketSystem.Internet, label: 'Internet', asset: '/systems/internet.webp' },
  { value: TicketSystem.Protheus, label: 'Protheus', asset: '/systems/protheus.webp' },
  { value: TicketSystem.WebMail, label: 'WebMail', asset: '/systems/webmail.webp' },
  { value: TicketSystem.Windows11, label: 'Windows 11', asset: '/systems/windows-11.webp' },
];

export const departments = [
  'Caixa 1', 'Caixa 2', 'Contabilidade', 'Contas a Pagar', 'Contas a Receber',
  'Compras', 'Diretoria', 'Estoque', 'Fiscal', 'Financeiro', 'Loja',
  'Marketing', 'TI', 'Televendas', 'Xaraies',
].sort((a, b) => a.localeCompare(b, 'pt-BR'));
