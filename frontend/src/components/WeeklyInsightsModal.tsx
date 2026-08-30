'use client';

import React, { useState } from 'react';
import { WeeklyInsightData } from '../types';
import { apiGenerateWeeklyInsights } from '../services/api';
import { EmotionBadge } from './EmotionBadge';
import {
  Sparkles,
  X,
  Loader2,
  Calendar,
  Smile,
  Award,
  Compass,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface WeeklyInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WeeklyInsightsModal({ isOpen, onClose }: WeeklyInsightsModalProps) {
  const [insight, setInsight] = useState<WeeklyInsightData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiGenerateWeeklyInsights();
      setInsight(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate weekly insight');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-soft-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Weekly AI Reflection
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Last 7 days synthesis & personal growth insights
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl flex items-center gap-2.5 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!insight && !loading && (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3 shadow-soft-xs">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
              Ready for Your Weekly Reflection?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-6 leading-relaxed">
              Gemini will analyze your journal entries from the past 7 days to identify overarching themes, your primary mood, and actionable suggestions.
            </p>

            <button
              onClick={handleGenerate}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-semibold shadow-soft-sm hover:shadow-glow-primary transition-all duration-200 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Weekly Insight</span>
            </button>
          </div>
        )}

        {loading && (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400 mb-3" />
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Synthesizing your week with Gemini...
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Evaluating emotional patterns and positive highlights
            </p>
          </div>
        )}

        {insight && !loading && (
          <div className="space-y-3.5 max-h-[65vh] overflow-y-auto pr-1">
            {/* Range & Emotion Header */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
              <div className="flex items-center gap-2">
                <Smile className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Dominant Emotion:
                </span>
                <EmotionBadge emotion={insight.mostCommonEmotion} size="sm" />
              </div>

              {insight.dateRange && (
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-full border border-slate-200/80 dark:border-slate-800">
                  {insight.dateRange}
                </span>
              )}
            </div>

            {/* Weekly Summary */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 shadow-soft-xs">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                <span>📝</span> Weekly Summary
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {insight.weeklySummary}
              </p>
            </div>

            {/* Positive Observation */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 shadow-soft-xs">
              <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 mb-1.5 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Positive Observation</span>
              </h4>
              <p className="text-xs text-emerald-800 dark:text-emerald-200 leading-relaxed">
                {insight.positiveObservation}
              </p>
            </div>

            {/* Improvement Suggestion */}
            <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50 shadow-soft-xs">
              <h4 className="text-xs font-bold text-purple-900 dark:text-purple-300 mb-1.5 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Growth Suggestion</span>
              </h4>
              <p className="text-xs text-purple-800 dark:text-purple-200 leading-relaxed">
                {insight.improvementSuggestion}
              </p>
            </div>

            {/* Regenerate footer */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Refresh Analysis</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
