/**
 * Alert Component
 * Display error, warning, or success messages
 */

import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';

export const Alert = ({ 
  type = 'info', 
  title, 
  message, 
  onClose,
  className = '' 
}) => {
  const types = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: XCircle,
      iconColor: 'text-red-500',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: AlertCircle,
      iconColor: 'text-yellow-500',
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: CheckCircle2,
      iconColor: 'text-green-500',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: Info,
      iconColor: 'text-blue-500',
    },
  };

  const config = types[type];
  const Icon = config.icon;

  return (
    <div className={`${config.bg} ${config.border} border rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <Icon className={`${config.iconColor} mt-0.5 mr-3 flex-shrink-0`} size={20} />
        <div className="flex-1">
          {title && (
            <h4 className={`font-medium ${config.text} mb-1`}>{title}</h4>
          )}
          {message && (
            <p className={`text-sm ${config.text}`}>{message}</p>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`${config.text} hover:opacity-70 ml-3`}
          >
            <XCircle size={18} />
          </button>
        )}
      </div>
    </div>
  );
};
