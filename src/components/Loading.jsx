import React from 'react';

export const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-gray-600">{text}</p>
    </div>
  );
};

export const LoadingButton = ({ loading, children, disabled, ...props }) => {
  return (
    <button
      disabled={loading || disabled}
      className={`flex items-center gap-2 ${
        loading || disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      {...props}
    >
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
      )}
      {children}
    </button>
  );
};

export default LoadingSpinner;
