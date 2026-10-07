import React from 'react';

const IBMBadge = ({ className = '' }) => (
  <span className={`ibm-badge ${className}`}>
    <span>⚡</span>
    Powered by <strong>IBM watsonx.ai</strong>
  </span>
);

export default IBMBadge;
