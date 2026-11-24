import React from 'react';
import { Check, Info, AlertTriangle, X } from 'lucide-react';
import { useShowroom } from '../../context/ShowroomContext';
import { t } from '../../i18n/translations';

export const ToastContainer: React.FC = () => {
  const { lang, toasts, dismissToast } = useShowroom();
  if (toasts.length === 0) return null;

  return (
    <div className="no-print fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center gap-3 px-4 py-3 bg-[#241913] text-[#FAF8F5] border border-[#3D281D] shadow-lg text-sm transition-all"
        >
          {toast.tone === 'warning' ? (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          ) : toast.tone === 'info' ? (
            <Info className="w-4 h-4 text-stone-300 shrink-0" />
          ) : (
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span className="flex-1 leading-snug">{toast.message}</span>
          <button
            onClick={() => dismissToast(toast.id)}
            className="text-stone-400 hover:text-white transition-colors"
            aria-label={t(lang, 'close')}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
