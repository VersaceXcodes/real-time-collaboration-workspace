import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Loading...', 
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const containerClasses = fullScreen 
    ? 'min-h-screen flex items-center justify-center bg-gray-50'
    : 'flex items-center justify-center py-8';

  return (
    <div className={containerClasses} role="status" aria-label={text}>
      <div className="flex flex-col items-center space-y-2">
        <div 
          className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}
          aria-hidden="true"
        />
        <span className={`text-gray-600 ${textSizeClasses[size]}`}>
          {text}
        </span>
      </div>
    </div>
  );
};

export default LoadingSpinner;