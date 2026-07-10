export enum TicketStatus {
  Open = "aberto",
  InProgress = "em andamento",
  Resolved = "resolvido",
}

export enum TicketPriority {
  Low = "baixa",
  Medium = "média",
  High = "alta",
}

export enum TicketCategory {
  Software = "Software",
  Hardware = "Hardware",
  Access = "Acesso",
  Network = "Rede",
  Protheus = "Protheus",
  Fluig = "Fluig",
  AceData = "Ace-Data",
  Email = "Email",
  TelefoniaFixa = "Telefonia Fixa",
  TelefoniaMovel = "Telefonia Movel",
  Other = "Outros",
}

export interface TicketRequester {
  name: string;
  role: string;
  email: string;
  avatarUrl?: string; 
}

export interface Ticket {
  id: string;
  title: string;
  ticketNumber: string;
  requester: TicketRequester;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  date: string;
  description: string;
  attachmentUrl?: string; 
  unreadByAdmin?: boolean;
  unreadByRequester?: boolean; 
}

export interface User {
  id?: string;
  username: string;
  name: string;
  role: string;
  email: string;
  avatarUrl?: string;
}

export interface NavItem {
  name: string;
  icon: React.ElementType;
  active?: boolean;
  isDropdown?: boolean;
  href?: string;
  action?: () => void;
}

export type ViewMode = 'dashboard' | 'newTicket' | 'profile' | 'userManagement';

export interface ChatMessage {
  id: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: string;
  isCurrentUser: boolean;
}

export interface Comment {
  id: string;
  ticket_id: string;
  author: {
    name: string;
    role: string;
    avatarUrl?: string;
  };
  text: string;
  created_at: string;
}

// NOVO TIPO ADICIONADO AQUI
export enum TicketTableTab {
  Open = "Abertos",
  InProgress = "Em Andamento",
  Resolved = "Resolvidos",
}