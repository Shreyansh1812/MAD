/**
 * Toast Notification Component
 * Provides user feedback for actions
 */

import { useEffect } from 'react';
import { CheckCircle2, XCircle, Info, AlertCircle, X } from 'lucide-react';

export const Toast = ({ type = 'success', message, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const types = {
    success: {
      bg: 'bg-green-500',
      icon: CheckCircle2,
      text: 'text-white',
    },
    error: {
      bg: 'bg-red-500',
      icon: XCircle,
      text: 'text-white',
    },
    info: {
      bg: 'bg-blue-500',
      icon: Info,
      text: 'text-white',
    },
    warning: {
      bg: 'bg-yellow-500',
      icon: AlertCircle,
      text: 'text-white',
    },
  };

  const config = types[type];
  const Icon = config.icon;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div className={`${config.bg} ${config.text} rounded-lg shadow-2xl px-6 py-4 flex items-center gap-3 min-w-[300px] max-w-md`}>
        <Icon size={24} className="flex-shrink-0" />
        <p className="flex-1 font-medium">{message}</p>
        <button
          onClick={onClose}
          className="hover:opacity-80 transition-opacity p-1 rounded hover:bg-white/20"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-3">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          onClose={() => removeToast(toast.id)}
          duration={toast.duration}
        />
      ))}
    </div>
  );
};
