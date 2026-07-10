import {describe, expect, it} from 'vitest';
import {canAccessTicket} from './ticket-access.js';

describe('canAccessTicket', () => {
  it('permite que administradores acessem qualquer chamado', () => {
    expect(canAccessTicket({id: 'admin-1', role: 'Administrador'}, 'user-2')).toBe(true);
  });

  it('permite que o solicitante acesse seu chamado', () => {
    expect(canAccessTicket({id: 'user-1', role: 'Usuário'}, 'user-1')).toBe(true);
  });

  it('nega acesso horizontal a chamado de outro usuário', () => {
    expect(canAccessTicket({id: 'user-1', role: 'Usuário'}, 'user-2')).toBe(false);
  });

  it('nega acesso quando o chamado não possui proprietário', () => {
    expect(canAccessTicket({id: 'user-1', role: 'Usuário'}, null)).toBe(false);
  });
});
