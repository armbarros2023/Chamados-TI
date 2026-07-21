import {describe, expect, it} from 'vitest';
import {isTicketSystem, ticketSystems} from './ticket-system.js';

describe('ticket systems', () => {
  it('keeps the approved systems in dashboard order', () => {
    expect(ticketSystems).toEqual([
      'AceData', 'Computador', 'Fluig', 'Internet', 'Protheus', 'WebMail', 'Windows 11',
    ]);
  });

  it('accepts only approved systems', () => {
    expect(isTicketSystem('Protheus')).toBe(true);
    expect(isTicketSystem('Outro sistema')).toBe(false);
    expect(isTicketSystem(undefined)).toBe(false);
  });
});
