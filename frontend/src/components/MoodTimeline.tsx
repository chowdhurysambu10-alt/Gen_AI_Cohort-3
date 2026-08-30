'use client';

import React from 'react';
import { ConversationMetadata } from '../types';
import { calculateStreak, formatDateOnly, getEmotionConfig } from '../utils/formatters';
import { Flame, Sparkles, TrendingUp } from 'lucide-react';

interface MoodTimelineProps {
  conversations: ConversationMetadata[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onOpenWeeklyInsights: () => void;
}

export function MoodTimeline({
  conversations,
  activeId,
  onSelectConversation,
  onOpenWeeklyInsights,
}: MoodTimelineProps) {
  // Chronological order for the timeline (earliest to latest)
  const chronologicalConversations = [...conversations].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const entriesWithEmotions = chronologicalConversations.filter((c) => Boolean(c.emotion));

  // Streak calculations
  const allDates = conversations.map((c) => c.createdAt);
  const streakInfo = calculateStreak(allDates);

  return (
    <div className="mx-4 mt-3 mb-1 p-3.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft-sm transition-all duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        {/* Streak Indicator (Feature 4) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-900 text-orange-600 dark:text-orange-400 text-xs font-bold shadow-soft-xs">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
            <span>
              {streakInfo.streakCount} Day Streak
            </span>
          </div>

          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            {streakInfo.isTodayLogged ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                ✓ Journaled today
              </span>
            ) : (
              <span>Write an entry today to keep streak!</span>
            )}
          </span>
        </div>

        {/* Action: Weekly Insights Trigger (Feature 7) */}
        <button
          onClick={onOpenWeeklyInsights}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/50 border border-indigo-100 dark:border-indigo-900 rounded-xl transition-all shadow-soft-xs cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Weekly Insights</span>
        </button>
      </div>

      {/* Mood Timeline (Feature 3) */}
      <div className="pt-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
            <span>Mood Timeline</span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            {entriesWithEmotions.length} logged states
          </span>
        </div>

        {entriesWithEmotions.length === 0 ? (
          <div className="py-2 text-center text-xs text-slate-400 dark:text-slate-500 italic">
            Summarize your journal sessions to track your emotional timeline.
          </div>
        ) : (
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin">
            {entriesWithEmotions.map((conv) => {
              const config = getEmotionConfig(conv.emotion);
              const isActive = conv.id === activeId;
              const dateStr = formatDateOnly(conv.createdAt);

              return (
                <button
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  title={`${conv.title || 'Untitled Session'} (${config.label}) - ${dateStr}`}
                  className={`group relative flex flex-col items-center px-2.5 py-1.5 rounded-xl border transition-all duration-200 cursor-pointer flex-shrink-0 ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-300 dark:border-indigo-700 shadow-soft-xs scale-105'
                      : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200/80 dark:border-slate-800 text-slate-700'
                  }`}
                >
                  <span className="text-base group-hover:scale-125 transition-transform duration-150">
                    {config.emoji}
                  </span>
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                    {dateStr}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
