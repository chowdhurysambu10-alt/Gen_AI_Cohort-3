'use client';

import React, { useState } from 'react';
import { ConversationMetadata } from '../types';
import { formatDateTime, cleanTitle } from '../utils/formatters';
import { EmotionBadge } from './EmotionBadge';
import { MessageSquare, Trash2, Loader2 } from 'lucide-react';

interface ConversationCardProps {
  conversation: ConversationMetadata;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
}

export function ConversationCard({
  conversation,
  isActive,
  onSelect,
  onDelete,
}: ConversationCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this journal entry?')) {
      try {
        setIsDeleting(true);
        await onDelete(conversation.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Feature 1: AI Generated Session Title (Fallback to clean title or "Untitled Session")
  const displayTitle = conversation.title
    ? cleanTitle(conversation.title)
    : conversation.summary
    ? cleanTitle(conversation.summary)
    : 'Untitled Session';

  return (
    <div
      onClick={() => onSelect(conversation.id)}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className={`group relative flex flex-col p-3 rounded-2xl cursor-pointer transition-all duration-200 border ${
        isActive
          ? 'bg-indigo-50/90 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200 shadow-soft-sm'
          : 'bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/80 border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 shadow-soft-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
              isActive
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </div>

          {/* AI Title (Feature 1 & 6) */}
          <p
            className={`text-xs font-semibold truncate ${
              isActive
                ? 'text-indigo-950 dark:text-indigo-100'
                : 'text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white'
            }`}
            title={displayTitle}
          >
            {displayTitle}
          </p>
        </div>

        {/* Delete button */}
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          title="Delete session"
          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-all flex-shrink-0 cursor-pointer"
        >
          {isDeleting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Meta Row: Emotion Badge & Created Time (Feature 2 & 6) */}
      <div className="mt-2 flex items-center justify-between gap-2 pl-9">
        <div className="flex-1 min-w-0">
          {conversation.emotion ? (
            <EmotionBadge emotion={conversation.emotion} size="xs" />
          ) : (
            <span className="text-[10px] text-slate-400 dark:text-slate-500 italic">
              Unsummarized
            </span>
          )}
        </div>

        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">
          {formatDateTime(conversation.createdAt)}
        </span>
      </div>

      {/* Feature 6: Hover tooltip with summary preview */}
      {showTooltip && conversation.summary && (
        <div className="hidden md:block absolute left-full ml-2 top-0 z-50 w-64 p-3 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-700 pointer-events-none animate-fade-in text-xs leading-relaxed">
          <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-800">
            <span className="font-bold text-[11px] text-slate-200 truncate">
              {displayTitle}
            </span>
            {conversation.emotion && (
              <EmotionBadge emotion={conversation.emotion} size="xs" />
            )}
          </div>
          <p className="text-[11px] text-slate-300 font-normal line-clamp-4">
            {conversation.summary}
          </p>
        </div>
      )}
    </div>
  );
}
