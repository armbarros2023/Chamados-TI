import React from 'react';

export const Notice = ({message, onDismiss}: {message: string | null; onDismiss: () => void}) => message ? (
  <div role="status" className="fixed right-4 bottom-4 z-50 max-w-sm bg-slate-900 text-white px-4 py-3 rounded-lg shadow-md flex items-start gap-4">
    <span>{message}</span><button onClick={onDismiss} className="font-bold" aria-label="Fechar aviso">×</button>
  </div>
) : null;

export const ConfirmDialog = ({message, onConfirm, onCancel}: {message: string | null; onConfirm: () => void; onCancel: () => void}) => message ? (
  <div className="fixed inset-0 z-50 bg-slate-950/60 p-4 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
    <div className="w-full max-w-md rounded-xl bg-white border border-slate-200 shadow-md p-6">
      <h2 id="confirm-title" className="text-xl font-bold text-slate-900">Confirmar ação</h2>
      <p className="mt-3 text-slate-700">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button onClick={onCancel} className="min-h-11 px-4 rounded-lg border border-slate-300 text-slate-800 hover:bg-slate-50">Cancelar</button>
        <button onClick={onConfirm} className="min-h-11 px-4 rounded-lg bg-red-700 text-white hover:bg-red-800">Confirmar</button>
      </div>
    </div>
  </div>
) : null;
