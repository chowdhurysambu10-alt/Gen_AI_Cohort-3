'use client';

import React, { useRef, useEffect } from 'react';
import { ChatMessage as ChatMessageType, EmotionType } from '../types';
import { ChatMessage, TypingIndicator } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { SummaryCard } from './SummaryCard';
import { LoadingSpinner } from './LoadingSpinner';
import { Sparkles, Heart, Compass, Lightbulb, AlertTriangle } from 'lucide-react';

interface ChatWindowProps {
  messages: ChatMessageType[];
  title?: string | null;
  emotion?: EmotionType | string | null;
  summary: string | null;
  loadingMessages: boolean;
  isSending: boolean;
  isSummarizing: boolean;
  error: string | null;
  onSendMessage: (message: string) => Promise<void>;
  onGenerateSummary: () => Promise<void>;
  onRetry?: () => void;
}

const STARTER_PROMPTS = [
  {
    icon: Compass,
    title: 'Daily Reflection',
    prompt: 'What was the most meaningful part of my day today, and what did I learn from it?',
  },
  {
    icon: Heart,
    title: 'Emotional Check-in',
    prompt: 'I want to unpack how I am feeling right now and gain some perspective.',
  },
  {
    icon: Lightbulb,
    title: 'Problem Clarification',
    prompt: 'I have a decision to make. Can you help me organize my thoughts and options?',
  },
];

export function ChatWindow({
  messages,
  title,
  emotion,
  summary,
  loadingMessages,
  isSending,
  isSummarizing,
  error,
  onSendMessage,
  onGenerateSummary,
  onRetry,
}: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever messages or typing indicator changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isSending]);

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-slate-50/50 dark:bg-slate-950 relative transition-colors duration-200 overflow-hidden">
      {/* Top Session Summary Card */}
      <SummaryCard
        title={title}
        emotion={emotion}
        summary={summary}
        onGenerateSummary={onGenerateSummary}
        isSummarizing={isSummarizing}
        canSummarize={messages.length >= 2}
      />

      {/* Messages Scroll Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto pb-4">
        {loadingMessages ? (
          <div className="h-full flex items-center justify-center">
            <LoadingSpinner size="md" message="Loading journal turns..." />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-5 shadow-soft-sm">
              <Sparkles className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1.5 tracking-tight">
              Personal Gemini Journal
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-8 max-w-md leading-relaxed">
              A private, authenticated space for your daily reflections, thoughts, and emotional clarity.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full text-left">
              {STARTER_PROMPTS.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(item.prompt)}
                    disabled={isSending}
                    className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/60 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 text-left transition-all duration-200 shadow-soft-sm group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3 group-hover:scale-110 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {item.prompt}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto py-3 space-y-1">
            {messages.map((msg, index) => (
              <ChatMessage key={msg.id || index} message={msg} />
            ))}
            {isSending && <TypingIndicator />}
          </div>
        )}
      </div>

      {/* Error Alert Bar */}
      {error && (
        <div className="mx-4 mb-2 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl flex items-center justify-between text-xs text-red-700 dark:text-red-300 shadow-soft-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-red-300 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg text-red-700 dark:text-red-300 font-medium transition-colors cursor-pointer"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Bottom Chat Input */}
      <ChatInput
        onSendMessage={onSendMessage}
        isLoading={isSending}
        disabled={loadingMessages}
      />
    </div>
  );
}
