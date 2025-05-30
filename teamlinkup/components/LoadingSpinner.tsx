
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', message }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div 
        className={`animate-spin rounded-full border-t-4 border-b-4 border-blue-500 ${sizeClasses[size]}`}
      ></div>
      {message && <p className="mt-2 text-gray-600">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
