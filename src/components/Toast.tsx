import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ToastItem } from '../types';

const toastStyles: Record<ToastItem['type'], { bg: string; icon: React.ReactNode; border: string }> = {
  success: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />,
  },
  error: {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    icon: <XCircle size={18} className="text-rose-500 flex-shrink-0" />,
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: <AlertTriangle size={18} className="text-amber-500 flex-shrink-0" />,
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: <Info size={18} className="text-blue-500 flex-shrink-0" />,
  },
};

const ToastMessage: React.FC<{ toast: ToastItem }> = ({ toast }) => {
  const { removeToast } = useApp();
  const style = toastStyles[toast.type];

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3.5 rounded-xl border shadow-lg shadow-slate-200/80 ${style.bg} ${style.border} min-w-[280px] max-w-[360px] toast-slide-in`}
    >
      {style.icon}
      <p className="text-slate-700 text-sm font-medium flex-1 leading-snug">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0 mt-0.5"
      >
        <X size={16} />
      </button>
    </div>
  );
};

const Toast: React.FC = () => {
  const { toasts } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastMessage key={t.id} toast={t} />
      ))}
    </div>
  );
};

export default Toast;
