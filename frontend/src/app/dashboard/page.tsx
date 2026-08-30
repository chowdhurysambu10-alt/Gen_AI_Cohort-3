'use client';

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { Sidebar } from '../../components/Sidebar';
import { ChatWindow } from '../../components/ChatWindow';
import { MoodTimeline } from '../../components/MoodTimeline';
import { WeeklyInsightsModal } from '../../components/WeeklyInsightsModal';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { ThemeToggle } from '../../components/ThemeToggle';
import { useConversations } from '../../hooks/useConversations';
import { useChat } from '../../hooks/useChat';
import { Menu, X, BookOpen } from 'lucide-react';

function DashboardContent() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [weeklyModalOpen, setWeeklyModalOpen] = useState(false);

  const {
    conversations,
    activeId,
    loading: loadingConversations,
    setActiveId,
    startNewConversation,
    removeConversation,
    refreshConversations,
  } = useConversations(user?.uid);

  const activeConversation = conversations.find((c) => c.id === activeId);

  const {
    messages,
    summary: activeSummary,
    title: activeTitle,
    emotion: activeEmotion,
    loadingMessages,
    sending,
    summarizing,
    error: chatError,
    send,
    summarize,
    refreshMessages,
  } = useChat(activeId, () => {
    refreshConversations();
  });

  const currentSummary = activeSummary || activeConversation?.summary || null;
  const currentTitle = activeTitle || activeConversation?.title || null;
  const currentEmotion = activeEmotion || activeConversation?.emotion || null;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/60 z-40 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container (Desktop static, Mobile slide-in drawer) */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform md:relative md:translate-x-0 transition-transform duration-200 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          conversations={conversations}
          activeId={activeId}
          loading={loadingConversations}
          onSelectConversation={(id) => {
            setActiveId(id);
            setMobileMenuOpen(false);
          }}
          onNewConversation={() => {
            startNewConversation();
            setMobileMenuOpen(false);
          }}
          onDeleteConversation={removeConversation}
        />
      </div>

      {/* Main Chat & Dashboard Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Mobile Header Bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex-shrink-0">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-soft-sm">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Personal Gemini Journal
            </span>
          </div>
          <ThemeToggle variant="compact" />
        </div>

        {/* Feature 3 & 4: Mood Timeline & Streak Dashboard Card */}
        <div className="flex-shrink-0">
          <MoodTimeline
            conversations={conversations}
            activeId={activeId}
            onSelectConversation={setActiveId}
            onOpenWeeklyInsights={() => setWeeklyModalOpen(true)}
          />
        </div>

        {/* Chat Window Container */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <ErrorBoundary fallbackMessage="Unable to load journal session.">
            <ChatWindow
              messages={messages}
              title={currentTitle}
              emotion={currentEmotion}
              summary={currentSummary}
              loadingMessages={loadingMessages}
              isSending={sending}
              isSummarizing={summarizing}
              error={chatError}
              onSendMessage={send}
              onGenerateSummary={summarize}
              onRetry={refreshMessages}
            />
          </ErrorBoundary>
        </div>

        {/* Feature 7: Weekly Insights Modal */}
        <WeeklyInsightsModal
          isOpen={weeklyModalOpen}
          onClose={() => setWeeklyModalOpen(false)}
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
