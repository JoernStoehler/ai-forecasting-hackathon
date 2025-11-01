import React, { useEffect } from 'react';
import { Icon } from './icons';

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [message, duration, onClose]);

  return (
    <div className="fixed top-20 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-4 max-w-sm animate-fade-in-down">
      <div className="flex-grow">
        <strong className="font-bold">Error</strong>
        <p className="text-sm">{message}</p>
      </div>
      <button onClick={onClose} className="p-1 rounded-full hover:bg-red-200">
        <Icon name="X" className="w-5 h-5" />
      </button>
    </div>
  );
};
