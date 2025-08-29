import React from 'react';

export const SaveIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    className={className} 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor" 
    strokeWidth={2}
    aria-hidden="true"
  >
     <path  strokeLinecap="round" 
      strokeLinejoin="round" d="M17 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2z" />
     <path  strokeLinecap="round" 
      strokeLinejoin="round" d="M15 3v6H9V3h6z" />
  </svg>
);
