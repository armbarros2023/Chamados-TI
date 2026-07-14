import React, { useRef } from 'react';
import { useDialogFocus } from './useDialogFocus';

export const Notice = ({message, onDismiss}: {message: string | null; onDismiss: () => void}) => message ? (
  <div role="status" className="fixed right-4 bottom-4 z-50 flex max-w-sm items-start gap-4 rounded-lg bg-slate-900 px-4 py-3 text-white shadow-md">
    <span>{message}</span><button onClick={onDismiss} className="min-h-11 min-w-11 -my-2 -mr-2 font-bold" aria-label="Fechar aviso">×</button>
  </div>
) : null;

export const ConfirmDialog = ({message, onConfirm, onCancel}: {message: string | null; onConfirm: () => void; onCancel: () => void}) => message ? (
  <ConfirmDialogContent message={message} onConfirm={onConfirm} onCancel={onCancel} />
) : null;

const ConfirmDialogContent = ({message, onConfirm, onCancel}: {message: string; onConfirm: () => void; onCancel: () => void}) => {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useDialogFocus(true, onCancel, cancelRef);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div ref={dialogRef} tabIndex={-1} className="ui-surface w-full max-w-md rounded-xl border p-6 shadow-md" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <h2 id="confirm-title" className="text-xl font-bold text-slate-900">Confirmar ação</h2>
        <p className="mt-3 text-slate-700">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button ref={cancelRef} onClick={onCancel} className="ui-border ui-text min-h-11 rounded-lg border px-4 hover:bg-slate-50">Cancelar</button>
          <button onClick={onConfirm} className="ui-danger min-h-11 rounded-lg px-4 transition-colors">Confirmar</button>
        </div>
      </div>
    </div>
  );
};
