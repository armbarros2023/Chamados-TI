export const ticketSystems = [
  'AceData',
  'Computador',
  'Fluig',
  'Internet',
  'Protheus',
  'WebMail',
  'Windows 11',
] as const;

export type TicketSystem = typeof ticketSystems[number];

export const isTicketSystem = (value: unknown): value is TicketSystem =>
  typeof value === 'string' && ticketSystems.includes(value as TicketSystem);
