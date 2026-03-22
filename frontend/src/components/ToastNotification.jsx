import React, { useState, useEffect, useCallback } from 'react';

let toastId = 0;
let addToastFn = null;

export const toast = {
  success: (message, duration = 4000) => {
    if (addToastFn) addToastFn({ type: 'success', message, duration });
  },
  error: (message, duration = 5000) => {
    if (addToastFn) addToastFn({ type: 'error', message, duration });
  },
  warning: (message, duration = 4000) => {
    if (addToastFn) addToastFn({ type: 'warning', message, duration });
  },
};

const Toast = ({ toast: item, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Slide in
    setTimeout(() => setIsVisible(true), 10);

    // Auto close
    const timer = setTimeout(() => {
      handleClose();
    }, item.duration);

    return () => clearTimeout(timer);
  }, [item.duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  const getIcon = () => {
    switch (item.type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      default: return 'ℹ';
    }
  };

  const getColors = () => {
    switch (item.type) {
      case 'success': return { bg: '#d4edda', border: '#c3e6cb', color: '#155724', iconBg: '#28a745' };
      case 'error': return { bg: '#f8d7da', border: '#f5c6cb', color: '#721c24', iconBg: '#dc3545' };
      case 'warning': return { bg: '#fff3cd', border: '#ffeeba', color: '#856404', iconBg: '#ffc107' };
      default: return { bg: '#d1ecf1', border: '#bee5eb', color: '#0c5460', iconBg: '#17a2b8' };
    }
  };

  const colors = getColors();

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 99999,
        transform: isVisible && !isExiting ? 'translateX(0)' : 'translateX(120%)',
        opacity: isVisible && !isExiting ? 1 : 0,
        transition: 'all 0.3s ease',
        maxWidth: '400px',
        width: '100%',
      }}
    >
      <div
        style={{
          background: colors.bg,
          border: `1px solid ${colors.border}`,
          borderRadius: '12px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: colors.iconBg,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 'bold',
            flexShrink: 0,
          }}
        >
          {getIcon()}
        </div>

        {/* Message */}
        <div style={{ flex: 1, color: colors.color }}>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: '500', lineHeight: 1.5 }}>
            {item.message}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            background: 'none',
            border: 'none',
            color: colors.color,
            cursor: 'pointer',
            fontSize: '20px',
            padding: '0',
            lineHeight: 1,
            opacity: 0.6,
            transition: 'opacity 0.2s',
            flexShrink: 0,
          }}
          onMouseOver={(e) => e.target.style.opacity = 1}
          onMouseOut={(e) => e.target.style.opacity = 0.6}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    addToastFn = addToast;
    return () => {
      addToastFn = null;
    };
  }, [addToast]);

  return (
    <>
      {toasts.map(t => (
        <Toast key={t.id} toast={t} onClose={() => removeToast(t.id)} />
      ))}
    </>
  );
};

export default ToastContainer;
