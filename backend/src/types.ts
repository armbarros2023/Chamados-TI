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
  avatar?: string;
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
}

export interface User {
  username: string;
  name: string;
  role: string;
  email: string;
  avatarUrl?: string;
}

export interface BackendUser extends User {
    username: string;
    passwordHash: string;
    permissions: string[];
}