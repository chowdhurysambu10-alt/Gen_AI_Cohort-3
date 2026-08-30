'use client';

import { useState, useEffect, useCallback } from 'react';
import { ConversationMetadata } from '../types';
import { apiListConversations, apiDeleteConversation } from '../services/api';
import { generateConversationId } from '../utils/formatters';

export function useConversations(userUid?: string | null) {
  const [conversations, setConversations] = useState<ConversationMetadata[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!userUid) {
      setConversations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await apiListConversations();
      setConversations(res.conversations || []);

      // If no active conversation selected, pick the most recent one if available
      if (res.conversations && res.conversations.length > 0) {
        setActiveId((prev) => prev || res.conversations[0].id);
      } else {
        // Create initial session ID
        setActiveId((prev) => prev || generateConversationId());
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [userUid]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const startNewConversation = () => {
    const newId = generateConversationId();
    setActiveId(newId);
  };

  const removeConversation = async (conversationId: string) => {
    try {
      await apiDeleteConversation(conversationId);
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));

      if (activeId === conversationId) {
        startNewConversation();
      }
    } catch (err: unknown) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete conversation');
    }
  };

  return {
    conversations,
    activeId,
    loading,
    error,
    setActiveId,
    startNewConversation,
    removeConversation,
    refreshConversations: fetchConversations,
  };
}
