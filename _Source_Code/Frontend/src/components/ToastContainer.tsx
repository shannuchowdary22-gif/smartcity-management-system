import React from 'react';
import { useSmartCity } from '../context/SmartCityContext';
import { CheckCircle2, AlertTriangle, Info, AlertOctagon, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useSmartCity();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all animate-in slide-in-from-bottom-3 duration-200 ${
              isSuccess
                ? 'bg-[#0a2318]/95 border-emerald-500/50 text-emerald-100 shadow-emerald-950/40'
                : isError
                ? 'bg-[#290d13]/95 border-rose-500/50 text-rose-100 shadow-rose-950/40'
                : isWarning
                ? 'bg-[#261c07]/95 border-amber-500/50 text-amber-100 shadow-amber-950/40'
                : 'bg-[#0d1c38]/95 border-cyan-500/50 text-cyan-100 shadow-cyan-950/40'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {isError && <AlertOctagon className="w-4 h-4 text-rose-400" />}
              {isWarning && <AlertTriangle className="w-4 h-4 text-amber-400" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-4 h-4 text-cyan-400" />}
            </div>

            <div className="flex-1 text-xs leading-relaxed font-medium">
              {toast.message}
            </div>

            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="shrink-0 p-1 text-slate-400 hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
