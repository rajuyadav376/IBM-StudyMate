import React from 'react';

const Spinner = ({ size = 24, label = 'Loading...' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <div
      className="spinner"
      style={{ width: size, height: size, borderWidth: size / 8 }}
    />
    {label && <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{label}</span>}
  </div>
);

export const PageLoader = ({ label = 'Loading...' }) => (
  <div className="loading-center">
    <Spinner size={32} label={null} />
    <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
  </div>
);

export default Spinner;
