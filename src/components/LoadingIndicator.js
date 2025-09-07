import React from 'react';

const LoadingIndicator = ({ 
  type = 'typing', 
  message = 'Loading...', 
  size = 'medium',
  className = '' 
}) => {
  const sizeClasses = {
    small: 'text-xs px-2 py-1',
    medium: 'text-sm px-4 py-3',
    large: 'text-base px-6 py-4'
  };

  const dotSizes = {
    small: 'w-1.5 h-1.5',
    medium: 'w-2 h-2', 
    large: 'w-3 h-3'
  };

  if (type === 'typing') {
    return (
      <div className={`flex justify-start mb-6 animate-slide-up ${className}`}>
        <div className={`bg-gray-800 border border-gray-700 rounded-2xl max-w-xs loading-bubble ${sizeClasses[size]}`}>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <div className={`typing-indicator ${dotSizes[size]}`}></div>
              <div className={`typing-indicator ${dotSizes[size]}`}></div>
              <div className={`typing-indicator ${dotSizes[size]}`}></div>
            </div>
            <span className="text-gray-400 font-medium">{message}</span>
          </div>
          <div className="mt-2 flex items-center space-x-2">
            <div className="w-full bg-gray-700 h-1 rounded-full overflow-hidden">
              <div className="bg-blue-400 h-1 rounded-full animate-pulse" style={{width: '60%'}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'spinner') {
    return (
      <div className={`flex items-center justify-center space-x-2 ${className}`}>
        <div className={`border-2 border-gray-300 border-t-blue-400 rounded-full animate-spin ${
          size === 'small' ? 'w-4 h-4' : size === 'large' ? 'w-8 h-8' : 'w-6 h-6'
        }`}></div>
        {message && <span className="text-gray-400">{message}</span>}
      </div>
    );
  }

  if (type === 'dots') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="flex items-center space-x-1">
          <div className={`loading-dot ${dotSizes[size]}`}></div>
          <div className={`loading-dot ${dotSizes[size]}`}></div>
          <div className={`loading-dot ${dotSizes[size]}`}></div>
        </div>
        {message && <span className="text-gray-400">{message}</span>}
      </div>
    );
  }

  if (type === 'pulse') {
    return (
      <div className={`flex items-center space-x-2 animate-pulse ${className}`}>
        <div className={`bg-blue-400 rounded-full ${dotSizes[size]}`}></div>
        {message && <span className="text-gray-400">{message}</span>}
      </div>
    );
  }

  // Default simple loading
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
      {message && <span className="text-gray-400">{message}</span>}
    </div>
  );
};

export default LoadingIndicator;
