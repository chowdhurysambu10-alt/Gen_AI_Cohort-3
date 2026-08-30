'use client';

import React, { useState, useMemo } from 'react';
import { ConversationMetadata } from '../types';
import { ConversationCard } from './ConversationCard';
import { UserMenu } from './UserMenu';
import { SkeletonLoader } from './LoadingSpinner';
import { Plus, BookOpen, MessageSquareDashed, Search, X } from 'lucide-react';

interface SidebarProps {
  conversations: ConversationMetadata[];
  activeId: string | null;
  loading: boolean;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => Promise<void>;
}

export function Sidebar({
  conversations,
  activeId,
  loading,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Feature 5: Search Journals by session title, summary, and first message
  const filteredConversations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return conversations;

    return conversations.filter((c) => {
      const matchTitle = c.title?.toLowerCase().includes(q);
      const matchSummary = c.summary?.toLowerCase().includes(q);
      const matchFirstMsg = c.firstMessage?.toLowerCase().includes(q);
      const matchEmotion = c.emotion?.toLowerCase().includes(q);
      return matchTitle || matchSummary || matchFirstMsg || matchEmotion;
    });
  }, [conversations, searchQuery]);

  return (
    <aside className="w-80 h-full bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800/80 flex flex-col flex-shrink-0 transition-colors duration-200">
      {/* Header & New Chat Button */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-soft-sm">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              Personal Gemini Journal
            </h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              Private & Encrypted Space
            </p>
          </div>
        </div>

        <button
          onClick={onNewConversation}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-semibold shadow-soft-sm hover:shadow-glow-primary transition-all duration-200 cursor-pointer group"
        >
          <Plus className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
          <span>New Journal Entry</span>
        </button>

        {/* Feature 5: Search box above Journal History */}
        <div className="mt-3 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title, summary, message..."
            className="w-full pl-9 pr-8 py-1.5 text-xs text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 dark:focus:border-indigo-500 rounded-xl focus:outline-none focus:bg-white dark:focus:bg-slate-850 transition-all placeholder-slate-400 dark:placeholder-slate-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          <span>{searchQuery ? 'Search Results' : 'Journal History'}</span>
          <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded-full font-mono">
            {filteredConversations.length}
          </span>
        </div>

        {loading && conversations.length === 0 ? (
          <SkeletonLoader count={4} />
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-3">
              <MessageSquareDashed className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              No journal entries yet
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 max-w-[180px] leading-relaxed">
              Start writing to create your first reflection session.
            </p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
            No entries matching &ldquo;{searchQuery}&rdquo;
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <ConversationCard
              key={conv.id}
              conversation={conv}
              isActive={activeId === conv.id}
              onSelect={onSelectConversation}
              onDelete={onDeleteConversation}
            />
          ))
        )}
      </div>

      {/* User Profile & Footer */}
      <UserMenu />
    </aside>
  );
}
