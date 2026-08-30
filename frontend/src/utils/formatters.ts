import { EmotionType } from '../types';

export const ALLOWED_EMOTIONS: EmotionType[] = [
  'Happy',
  'Calm',
  'Sad',
  'Stressed',
  'Angry',
  'Anxious',
  'Motivated',
  'Confused',
  'Neutral',
];

export interface EmotionConfig {
  emoji: string;
  label: EmotionType;
  badgeClass: string;
  dotColor: string;
}

export const EMOTION_CONFIGS: Record<EmotionType, EmotionConfig> = {
  Happy: {
    emoji: '😊',
    label: 'Happy',
    badgeClass: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900',
    dotColor: '#f59e0b',
  },
  Calm: {
    emoji: '😌',
    label: 'Calm',
    badgeClass: 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-900',
    dotColor: '#14b8a6',
  },
  Sad: {
    emoji: '😔',
    label: 'Sad',
    badgeClass: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900',
    dotColor: '#3b82f6',
  },
  Stressed: {
    emoji: '⚡',
    label: 'Stressed',
    badgeClass: 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-900',
    dotColor: '#f97316',
  },
  Angry: {
    emoji: '😡',
    label: 'Angry',
    badgeClass: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900',
    dotColor: '#f43f5e',
  },
  Anxious: {
    emoji: '😰',
    label: 'Anxious',
    badgeClass: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900',
    dotColor: '#a855f7',
  },
  Motivated: {
    emoji: '🚀',
    label: 'Motivated',
    badgeClass: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
    dotColor: '#10b981',
  },
  Confused: {
    emoji: '🤔',
    label: 'Confused',
    badgeClass: 'bg-yellow-50 dark:bg-yellow-950/60 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-900',
    dotColor: '#eab308',
  },
  Neutral: {
    emoji: '😐',
    label: 'Neutral',
    badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    dotColor: '#64748b',
  },
};

/**
 * Returns the styling and metadata for a given emotion.
 */
export function getEmotionConfig(emotion: string | null | undefined): EmotionConfig {
  if (emotion && (ALLOWED_EMOTIONS as string[]).includes(emotion)) {
    return EMOTION_CONFIGS[emotion as EmotionType];
  }
  return EMOTION_CONFIGS.Neutral;
}

/**
 * Extracts any embedded [Emotion: X] header from a raw summary string, returning clean values.
 */
export function parseEmotionAndSummary(rawSummary: string | null | undefined): {
  emotion: EmotionType | null;
  summary: string | null;
} {
  if (!rawSummary) return { emotion: null, summary: null };

  const match = rawSummary.match(/^\[Emotion:\s*([A-Za-z]+)\]\s*\n*([\s\S]*)$/);
  if (match) {
    const rawEmotion = match[1];
    const isAllowed = (ALLOWED_EMOTIONS as string[]).includes(rawEmotion);
    return {
      emotion: isAllowed ? (rawEmotion as EmotionType) : 'Neutral',
      summary: match[2]?.trim() || null,
    };
  }

  return { emotion: null, summary: rawSummary };
}

/**
 * Calculates current consecutive daily journaling streak.
 */
export function calculateStreak(dates: (string | Date)[]): {
  streakCount: number;
  lastJournalDate: string | null;
  isTodayLogged: boolean;
} {
  if (!dates || dates.length === 0) {
    return { streakCount: 0, lastJournalDate: null, isTodayLogged: false };
  }

  // Normalize to unique YYYY-MM-DD local strings
  const dateSet = new Set<string>();
  dates.forEach((d) => {
    try {
      const dt = new Date(d);
      if (!isNaN(dt.getTime())) {
        const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(
          dt.getDate()
        ).padStart(2, '0')}`;
        dateSet.add(key);
      }
    } catch {
      // ignore invalid dates
    }
  });

  const sortedDates = Array.from(dateSet).sort().reverse();
  if (sortedDates.length === 0) {
    return { streakCount: 0, lastJournalDate: null, isTodayLogged: false };
  }

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
    today.getDate()
  ).padStart(2, '0')}`;

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(yesterday.getDate()).padStart(2, '0')}`;

  const isTodayLogged = sortedDates.includes(todayKey);
  const isYesterdayLogged = sortedDates.includes(yesterdayKey);

  // If user didn't journal today AND didn't journal yesterday, streak is broken
  if (!isTodayLogged && !isYesterdayLogged) {
    return {
      streakCount: 0,
      lastJournalDate: sortedDates[0],
      isTodayLogged: false,
    };
  }

  // Count contiguous days backwards starting from the most recent active date
  let streak = 0;
  let checkDate = isTodayLogged ? new Date(today) : new Date(yesterday);

  while (true) {
    const key = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(checkDate.getDate()).padStart(2, '0')}`;
    if (dateSet.has(key)) {
      streak += 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return {
    streakCount: streak,
    lastJournalDate: sortedDates[0],
    isTodayLogged,
  };
}

/**
 * Formats an ISO date string into a clean, human-readable format.
 */
export function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Recently';

    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }

    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Recently';
  }
}

/**
 * Formats date into a short string like "Aug 30".
 */
export function formatDateOnly(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

/**
 * Truncates text cleanly with an ellipsis.
 */
export function truncateText(text: string, maxLength: number = 32): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Cleans quotation marks and excess whitespace from titles.
 */
export function cleanTitle(title: string | null | undefined): string {
  if (!title || !title.trim()) return 'Untitled Session';
  let cleaned = title.replace(/["'“”‘’]/g, '').trim();
  // Ensure maximum 5 words
  const words = cleaned.split(/\s+/);
  if (words.length > 5) {
    cleaned = words.slice(0, 5).join(' ');
  }
  return cleaned || 'Untitled Session';
}

/**
 * Validates if a string is a standard UUID v4 format.
 */
export function isValidUuid(id: string | null | undefined): boolean {
  if (!id || typeof id !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Generates a valid standard UUID v4 for Supabase PostgreSQL compatibility.
 */
export function generateConversationId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
