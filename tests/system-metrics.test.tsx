import {fireEvent, render, screen} from '@testing-library/react';
import {expect, test, vi} from 'vitest';
import SystemMetrics from '../components/SystemMetrics';
import {TicketSystem} from '../types';

test('exibe todos os sistemas na ordem aprovada e filtra pelo logo selecionado', () => {
  const onSelectSystem = vi.fn();
  render(<SystemMetrics metrics={[{system: TicketSystem.Protheus, closedCount: 3}]} isLoading={false} onSelectSystem={onSelectSystem} />);

  const buttons = screen.getAllByRole('button');
  expect(buttons).toHaveLength(7);
  expect(screen.getByRole('heading', {name: 'Chamados fechados por sistema'})).toBeVisible();
  expect(buttons[0]).toHaveAccessibleName(/AceData/i);
  expect(buttons[4]).toHaveAccessibleName(/Protheus/i);
  expect(screen.getByText('3')).toBeVisible();

  fireEvent.click(buttons[4]);
  expect(onSelectSystem).toHaveBeenCalledWith(TicketSystem.Protheus);
});
