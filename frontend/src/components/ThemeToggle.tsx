'use client';

import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'button' | 'compact' | 'pill';
  className?: string;
}

export function ThemeToggle({ variant = 'button', className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  if (variant === 'pill') {
    return (
      <button
        onClick={toggleTheme}
        aria-label="Toggle color theme"
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
          isDark
            ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
        } ${className}`}
      >
        {isDark ? (
          <>
            <Sun className="w-3.5 h-3.5 text-amber-400 animate-fade-in" />
            <span>Light Mode</span>
          </>
        ) : (
          <>
            <Moon className="w-3.5 h-3.5 text-indigo-600 animate-fade-in" />
            <span>Dark Mode</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`relative p-2 rounded-xl transition-all duration-200 cursor-pointer ${
        isDark
          ? 'bg-slate-800/80 hover:bg-slate-700 text-amber-400 border border-slate-700/80 hover:border-slate-600 shadow-soft-sm'
          : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 hover:text-slate-900 shadow-soft-sm'
      } ${className}`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 animate-fade-in transition-transform duration-300 hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 animate-fade-in transition-transform duration-300 hover:-rotate-12" />
        )}
      </div>
    </button>
  );
}
