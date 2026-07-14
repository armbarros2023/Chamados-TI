import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmDialog } from '../components/Feedback';

describe('ConfirmDialog', () => {
  it('moves focus to a safe action and closes with Escape', async () => {
    const onCancel = vi.fn();
    render(<ConfirmDialog message="Excluir este chamado?" onConfirm={vi.fn()} onCancel={onCancel} />);

    const dialog = screen.getByRole('dialog', { name: 'Confirmar ação' });
    const cancel = screen.getByRole('button', { name: 'Cancelar' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    await waitFor(() => expect(cancel).toHaveFocus());

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
