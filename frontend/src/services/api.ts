import { supabase } from '../lib/supabase';
import { getConversations, getMessages, deleteConversation } from '../lib/database';
import {
  SendMessageResponse,
  SummarizeConversationResponse,
  ListConversationsResponse,
  GetConversationMessagesResponse,
  DeleteConversationResponse,
  WeeklyInsightData,
} from '../types';

/**
 * Retrieves the current user's session JWT token.
 */
async function getAuthToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('You must be signed in to perform this action.');
  }
  return session.access_token;
}

/**
 * 1. Sends a new journal message to the Gemini AI backend and stores turns in Supabase.
 */
export async function apiSendMessage(
  conversationId: string,
  message: string
): Promise<SendMessageResponse> {
  const token = await getAuthToken();

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      conversationId,
      message,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to send message');
  }

  return data as SendMessageResponse;
}

/**
 * 2. Summarizes the specified conversation with Gemini AI (generating title, emotion, summary).
 */
export async function apiSummarizeConversation(
  conversationId: string
): Promise<SummarizeConversationResponse> {
  const token = await getAuthToken();

  const response = await fetch('/api/summarize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      conversationId,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to summarize conversation');
  }

  return data as SummarizeConversationResponse;
}

/**
 * 3. Fetches AI-generated Weekly Insights for the last 7 days of journaling.
 */
export async function apiGenerateWeeklyInsights(): Promise<WeeklyInsightData> {
  const token = await getAuthToken();

  const response = await fetch('/api/insights/weekly', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to generate weekly insights');
  }

  return data as WeeklyInsightData;
}

/**
 * 4. Fetches the authenticated user's list of conversations directly from Supabase PostgreSQL.
 */
export async function apiListConversations(): Promise<ListConversationsResponse> {
  const conversations = await getConversations();
  return { conversations };
}

/**
 * 5. Retrieves message history for a specific conversation directly from Supabase PostgreSQL.
 */
export async function apiGetConversationMessages(
  conversationId: string
): Promise<GetConversationMessagesResponse> {
  const messages = await getMessages(conversationId);
  return { conversationId, messages };
}

/**
 * 6. Deletes a conversation and its messages from Supabase PostgreSQL.
 */
export async function apiDeleteConversation(
  conversationId: string
): Promise<DeleteConversationResponse> {
  await deleteConversation(conversationId);
  return { success: true, conversationId };
}
