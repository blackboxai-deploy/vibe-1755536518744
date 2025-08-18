'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  progress?: number;
  className?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  message, 
  progress,
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      {/* Spinner */}
      <div className="relative">
        <div className={`${sizeClasses[size]} border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin`}></div>
        
        {/* Progress ring if progress is provided */}
        {typeof progress === 'number' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className={`${sizeClasses[size]} transform -rotate-90`} viewBox="0 0 32 32">
              <circle
                cx="16"
                cy="16"
                r="14"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-gray-200"
              />
              <circle
                cx="16"
                cy="16"
                r="14"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeDasharray={`${progress * 0.88} 88`}
                className="text-blue-600 transition-all duration-300"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Message */}
      {message && (
        <p className="text-sm text-gray-600 text-center max-w-xs">
          {message}
        </p>
      )}

      {/* Progress percentage */}
      {typeof progress === 'number' && (
        <p className="text-xs text-gray-500 font-medium">
          {Math.round(progress)}%
        </p>
      )}
    </div>
  );
}

// Inline loading component for buttons
export function InlineSpinner({ className = '' }: { className?: string }) {
  return (
    <div className={`w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ${className}`}></div>
  );
}

// Full page loading overlay
export function LoadingOverlay({ 
  message = 'Loading...', 
  progress 
}: { 
  message?: string;
  progress?: number;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-sm mx-4">
        <LoadingSpinner size="lg" message={message} progress={progress} />
      </div>
    </div>
  );
}