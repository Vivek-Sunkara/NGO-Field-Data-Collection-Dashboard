import React, { useEffect, useState } from 'react';
import { TOAST_TYPES } from '../utils/toast';

const Toast = ({ message, type = TOAST_TYPES.INFO, duration = 3000 }) => {
  const getBackgroundColor = () => {
    switch (type) {
      case TOAST_TYPES.SUCCESS:
        return 'bg-green-500';
      case TOAST_TYPES.ERROR:
        return 'bg-red-500';
      case TOAST_TYPES.WARNING:
        return 'bg-yellow-500';
      case TOAST_TYPES.INFO:
      default:
        return 'bg-blue-500';
    }
  };

  const getIcon = () => {
    switch (type) {
      case TOAST_TYPES.SUCCESS:
        return '✓';
      case TOAST_TYPES.ERROR:
        return '✕';
      case TOAST_TYPES.WARNING:
        return '⚠';
      case TOAST_TYPES.INFO:
      default:
        return 'ℹ';
    }
  };

  return (
    <div
      className={`${getBackgroundColor()} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2`}
    >
      <span className="text-xl">{getIcon()}</span>
      <span>{message}</span>
    </div>
  );
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleShowToast = (event) => {
      const { message, type } = event.detail;
      const id = Date.now();

      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 3000);
    };

    window.addEventListener('showToast', handleShowToast);
    return () => window.removeEventListener('showToast', handleShowToast);
  }, []);

  return (
    <div className="fixed top-4 right-4 space-y-2 z-50">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
