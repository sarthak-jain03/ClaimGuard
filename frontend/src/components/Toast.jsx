import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export default function ToastContainer({ toasts, removeToast }) {
  if (!toasts || toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    error: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/30 bg-emerald-950/40',
    warning: 'border-amber-500/30 bg-amber-950/40',
    error: 'border-rose-500/30 bg-rose-950/40',
    info: 'border-blue-500/30 bg-blue-950/40',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-xl text-sm transition-all animate-in slide-in-from-right duration-200 ${borders[toast.type] || borders.info}`}
        >
          {icons[toast.type] || icons.info}
          <div className="flex-1">
            <div className="font-semibold text-white">{toast.title}</div>
            {toast.message && <div className="text-neutral-300 text-xs mt-0.5 leading-relaxed">{toast.message}</div>}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-neutral-400 hover:text-white p-0.5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
