export interface TicketActor {
  id: string;
  role: string;
}

export const canAccessTicket = (actor: TicketActor, requesterUserId: string | null) =>
  actor.role === 'Administrador' || (requesterUserId !== null && actor.id === requesterUserId);
