'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChatMessage, EmotionType } from '../types';
import { apiGetConversationMessages, apiSendMessage, apiSummarizeConversation } from '../services/api';

export function useChat(conversationId: string | null, onTurnCompleted?: () => void) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);
  const [emotion, setEmotion] = useState<EmotionType | null>(null);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const [summarizing, setSummarizing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      setSummary(null);
      setTitle(null);
      setEmotion(null);
      return;
    }

    try {
      setLoadingMessages(true);
      setError(null);
      const res = await apiGetConversationMessages(conversationId);
      setMessages(res.messages || []);
    } catch {
      // If conversation is brand new, it won't have messages yet in database
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const send = async (content: string) => {
    if (!conversationId || !content.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };

    // Optimistically show user message immediately
    setMessages((prev) => [...prev, userMessage]);
    setSending(true);
    setError(null);

    try {
      const res = await apiSendMessage(conversationId, content);

      const aiMessage: ChatMessage = {
        id: res.assistantMessageId,
        role: 'model',
        content: res.reply,
        createdAt: res.timestamp || new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (onTurnCompleted) {
        onTurnCompleted();
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to send message';
      setError(errMsg);
    } finally {
      setSending(false);
    }
  };

  const summarize = async () => {
    if (!conversationId) return;

    try {
      setSummarizing(true);
      setError(null);
      const res = await apiSummarizeConversation(conversationId);
      setSummary(res.summary);
      setTitle(res.title);
      setEmotion(res.emotion);
      if (onTurnCompleted) {
        onTurnCompleted();
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to summarize conversation';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setSummarizing(false);
    }
  };

  return {
    messages,
    summary,
    title,
    emotion,
    loadingMessages,
    sending,
    summarizing,
    error,
    send,
    summarize,
    refreshMessages: fetchMessages,
  };
}
