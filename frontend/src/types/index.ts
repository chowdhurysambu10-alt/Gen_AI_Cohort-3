export type EmotionType =
  | 'Happy'
  | 'Calm'
  | 'Sad'
  | 'Stressed'
  | 'Angry'
  | 'Anxious'
  | 'Motivated'
  | 'Confused'
  | 'Neutral';

export interface ChatMessage {
  id?: string;
  role: 'user' | 'model';
  content: string;
  createdAt: string;
}

export interface ConversationMetadata {
  id: string;
  title: string | null;
  emotion: EmotionType | null;
  summary: string | null;
  firstMessage?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SessionAnalysis {
  title: string;
  emotion: EmotionType;
  summary: string;
}

export interface WeeklyInsightData {
  weeklySummary: string;
  mostCommonEmotion: EmotionType;
  positiveObservation: string;
  improvementSuggestion: string;
  dateRange?: string;
  totalJournalsAnalyzed?: number;
}

export interface SendMessageResponse {
  reply: string;
  conversationId: string;
  userMessageId: string;
  assistantMessageId: string;
  timestamp: string;
}

export interface SummarizeConversationResponse {
  conversationId: string;
  title: string;
  emotion: EmotionType;
  summary: string;
  updatedAt: string;
}

export interface ListConversationsResponse {
  conversations: ConversationMetadata[];
}

export interface GetConversationMessagesResponse {
  conversationId: string;
  messages: ChatMessage[];
}

export interface DeleteConversationResponse {
  success: boolean;
  conversationId: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  avatarUrl?: string | null;
}

// Supabase Database Row Types
export interface ProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConversationRow {
  id: string;
  user_id: string;
  title: string | null;
  summary: string | null;
  emotion?: string | null;
  last_summarized_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MessageRow {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'user' | 'model';
  content: string;
  created_at: string;
}

export interface JournalEntryRow {
  id: string;
  user_id: string;
  conversation_id?: string | null;
  title: string | null;
  content: string | null;
  summary: string | null;
  created_at: string;
  updated_at: string;
}
