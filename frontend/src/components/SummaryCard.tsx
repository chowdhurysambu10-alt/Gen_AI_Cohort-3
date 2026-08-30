'use client';

import React, { useState } from 'react';
import { EmotionType } from '../types';
import { EmotionBadge } from './EmotionBadge';
import { Sparkles, ChevronDown, ChevronUp, Loader2, AlertCircle } from 'lucide-react';

interface SummaryCardProps {
  title?: string | null;
  emotion?: EmotionType | string | null;
  summary: string | null;
  onGenerateSummary: () => Promise<void>;
  isSummarizing: boolean;
  canSummarize: boolean;
}

export function SummaryCard({
  title,
  emotion,
  summary,
  onGenerateSummary,
  isSummarizing,
  canSummarize,
}: SummaryCardProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      setError(null);
      await onGenerateSummary();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate summary');
    }
  };

  if (!summary && !canSummarize) {
    return null;
  }

  return (
    <div className="mx-4 my-2.5 flex-shrink-0 bg-gradient-to-r from-indigo-50/80 via-purple-50/60 to-indigo-50/80 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-slate-900/60 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl overflow-hidden shadow-soft-sm transition-all duration-200">
      <div className="flex items-center justify-between px-4 py-3 bg-indigo-100/40 dark:bg-indigo-950/30">
        <div className="flex items-center gap-2 text-indigo-950 dark:text-indigo-200 font-semibold text-xs min-w-0">
          <div className="w-5 h-5 rounded-lg bg-indigo-600/10 dark:bg-indigo-400/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
            <Sparkles className="w-3 h-3" />
          </div>
          <span className="truncate">
            {title ? title : 'Session Reflection & Summary'}
          </span>
          {emotion && <EmotionBadge emotion={emotion} size="xs" />}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {canSummarize && (
            <button
              onClick={handleGenerate}
              disabled={isSummarizing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl disabled:opacity-50 transition-all shadow-soft-sm cursor-pointer"
            >
              {isSummarizing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Summarizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{summary ? 'Regenerate' : 'Summarize'}</span>
                </>
              )}
            </button>
          )}

          {summary && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100/60 dark:hover:bg-indigo-900/40 rounded-lg transition-colors cursor-pointer"
            >
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="px-4 py-2.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs flex items-center gap-2 border-t border-red-100 dark:border-red-900/60">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isOpen && summary && (
        <div className="px-4 py-3.5 text-xs leading-relaxed text-slate-700 dark:text-slate-300 border-t border-indigo-100/60 dark:border-indigo-900/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs">
          <p className="whitespace-pre-wrap font-normal">{summary}</p>
        </div>
      )}
    </div>
  );
}
