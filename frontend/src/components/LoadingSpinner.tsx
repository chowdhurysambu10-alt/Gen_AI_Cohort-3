import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

export function LoadingSpinner({ size = 'md', message, className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-indigo-600 dark:text-indigo-400`} />
      {message && (
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 tracking-wide">
          {message}
        </p>
      )}
    </div>
  );
}

export function SkeletonLoader({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2.5 p-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 animate-pulse space-y-2"
        >
          <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded-md w-3/4"></div>
          <div className="h-2.5 bg-slate-200/60 dark:bg-slate-700/60 rounded-md w-1/2"></div>
        </div>
      ))}
    </div>
  );
}
