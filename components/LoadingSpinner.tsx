import React from 'react';

export const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center h-full w-full">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
  </div>
);