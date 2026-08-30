import { supabase } from './supabase';
import { ConversationMetadata, ChatMessage, ConversationRow, MessageRow } from '../types';
import { isValidUuid, parseEmotionAndSummary } from '../utils/formatters';

/**
 * Lists all conversations for the authenticated user, ordered by most recently updated.
 * Also attaches firstMessage snippet to support full-text search.
 */
export async function getConversations(): Promise<ConversationMetadata[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('id, title, summary, created_at, updated_at')
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rawConversations: Partial<ConversationRow>[] = data || [];
  if (rawConversations.length === 0) return [];

  // Fetch the first user message for each conversation to enable searching by first message
  const conversationIds = rawConversations.map((c) => c.id).filter(Boolean) as string[];
  
  let firstMessagesMap: Record<string, string> = {};
  if (conversationIds.length > 0) {
    const { data: msgData } = await supabase
      .from('messages')
      .select('conversation_id, content')
      .in('conversation_id', conversationIds)
      .eq('role', 'user')
      .order('created_at', { ascending: true });

    if (msgData) {
      msgData.forEach((m) => {
        if (m.conversation_id && !firstMessagesMap[m.conversation_id]) {
          firstMessagesMap[m.conversation_id] = m.content;
        }
      });
    }
  }

  return rawConversations.map((row) => {
    const { emotion, summary } = parseEmotionAndSummary(row.summary);
    return {
      id: row.id || '',
      title: row.title || null,
      emotion: emotion,
      summary: summary,
      firstMessage: row.id ? firstMessagesMap[row.id] || null : null,
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.updated_at || new Date().toISOString(),
    };
  });
}

/**
 * Retrieves all messages for a given conversation ID, ordered chronologically.
 */
export async function getMessages(conversationId: string): Promise<ChatMessage[]> {
  if (!isValidUuid(conversationId)) {
    return [];
  }

  const { data, error } = await supabase
    .from('messages')
    .select('id, role, content, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((row: Partial<MessageRow>) => ({
    id: row.id,
    role: (row.role as 'user' | 'model') || 'user',
    content: row.content || '',
    createdAt: row.created_at || new Date().toISOString(),
  }));
}

/**
 * Deletes a conversation and its messages.
 */
export async function deleteConversation(conversationId: string): Promise<void> {
  if (!isValidUuid(conversationId)) {
    return;
  }

  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId);

  if (error) {
    throw new Error(error.message);
  }
}
