'use client';

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { LogOut, User, AlertCircle } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

export function UserMenu() {
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      setError(null);
      await logout();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Logout failed');
      setLoggingOut(false);
    }
  };

  return (
    <div className="border-t border-slate-200 dark:border-slate-800/80 p-3 bg-white dark:bg-slate-900 transition-colors duration-200">
      {error && (
        <div className="mb-2.5 p-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 rounded-xl flex items-center gap-1.5 border border-red-200 dark:border-red-900">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white flex-shrink-0 shadow-soft-sm font-semibold text-xs">
            {user?.email ? user.email.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
          </div>
          <div className="truncate">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate" title={user?.email || 'User'}>
              {user?.email || 'User'}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              Secure Session
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle variant="compact" />
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            title="Sign Out"
            className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer"
          >
            {loggingOut ? <LoadingSpinner size="sm" /> : <LogOut className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
