import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import {afterEach, expect, test, vi} from 'vitest';
import TicketRow from '../components/TicketRow';
import {Ticket, TicketCategory, TicketPriority, TicketStatus, TicketSystem} from '../types';

const ticket: Ticket = {
  id: 'ticket-1',
  title: 'Falha no sistema',
  ticketNumber: 'TI-000001',
  requester: {name: 'Pessoa de teste', role: 'Usuário', email: 'teste@empresa.local'},
  category: TicketCategory.Software,
  status: TicketStatus.InProgress,
  priority: TicketPriority.Medium,
  date: '2026-07-21T12:00:00.000Z',
  description: 'Descrição do chamado',
  system: TicketSystem.Protheus,
};

afterEach(() => cleanup());

test('administrador pode marcar chamado em atendimento como resolvido', () => {
  const onUpdateTicketStatus = vi.fn();
  render(
    <table><tbody><TicketRow
      ticket={ticket}
      currentUserRole="Administrador"
      onUpdateTicketStatus={onUpdateTicketStatus}
      onShowTicketDetail={vi.fn()}
      onDeleteTicket={vi.fn()}
    /></tbody></table>,
  );

  fireEvent.click(screen.getByRole('button', {name: 'Marcar resolvido'}));
  expect(onUpdateTicketStatus).toHaveBeenCalledWith('ticket-1', TicketStatus.Resolved);
});

test('usuário não recebe ação de resolução', () => {
  render(
    <table><tbody><TicketRow
      ticket={ticket}
      currentUserRole="Usuário"
      onUpdateTicketStatus={vi.fn()}
      onShowTicketDetail={vi.fn()}
      onDeleteTicket={vi.fn()}
    /></tbody></table>,
  );

  expect(screen.queryByRole('button', {name: 'Marcar resolvido'})).not.toBeInTheDocument();
});
