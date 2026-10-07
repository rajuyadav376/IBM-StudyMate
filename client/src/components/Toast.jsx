import React, { useState } from 'react';

const Toast = ({ message, type = 'info', onClose }) => {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1000,
        minWidth: 280,
        maxWidth: 400,
        background: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: 8,
        padding: '12px 16px',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        animation: 'slideIn 0.2s ease'
      }}
    >
      <span>{icons[type]}</span>
      <span style={{ flex: 1, fontSize: '0.875rem' }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--text-secondary)' }}>×</button>
    </div>
  );
};

export const useToast = () => {
  const [toast, setToast] = useState(null);

  const show = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const ToastComponent = toast
    ? <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
    : null;

  return { show, ToastComponent };
};

export default Toast;
