import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { Toast as ToastType } from '../hooks/useToast';

interface ToastProps {
  toast: ToastType;
  onRemove: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-400" />;
    }
  };

  const getColorClasses = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 400, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 400, scale: 0.8, transition: { duration: 0.3 } }}
      className={`min-w-80 max-w-sm shadow-xl rounded-xl pointer-events-auto border-2 backdrop-blur-sm ${getColorClasses()}`}
    >
      <div className="p-4 relative overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 pointer-events-none" />
        
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium whitespace-nowrap">{toast.title}</p>
              <button
                className="ml-3 inline-flex rounded-full p-1 hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors flex-shrink-0"
                onClick={() => onRemove(toast.id)}
              >
                <span className="sr-only">Close</span>
                <X className="h-4 w-4 opacity-70 hover:opacity-100 transition-opacity" />
              </button>
            </div>
            {toast.message && (
              <p className="mt-1 text-sm opacity-90 break-words">{toast.message}</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface ToastContainerProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toast;