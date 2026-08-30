import { EmotionType, SessionAnalysis, WeeklyInsightData } from '../types';
import { ALLOWED_EMOTIONS, cleanTitle } from '../utils/formatters';

const OPENROUTER_MODELS = [
  'google/gemini-2.0-flash-001',
  'google/gemini-flash-1.5',
  'meta-llama/llama-3.3-70b-instruct',
  'deepseek/deepseek-chat',
  'google/gemini-2.0-flash-exp:free',
  'openrouter/auto',
];

const SYSTEM_INSTRUCTION =
  'You are a thoughtful, empathetic, and secure personal journaling assistant. Help the user reflect, organize their thoughts, and gain insights while respecting their privacy.';

export interface TurnMessage {
  role: 'user' | 'model';
  content: string;
}

/**
 * Generates an empathetic response via OpenRouter API / Gemini.
 */
async function callOpenRouterChat(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  apiKey: string
): Promise<string> {
  const cleanKey = apiKey.trim();
  let lastError: unknown = null;

  for (const model of OPENROUTER_MODELS) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cleanKey}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Personal Gemini Journal',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error?.message || `OpenRouter error status ${response.status}`;
        console.error(`[OpenRouter Error with ${model}]:`, errorMsg);
        lastError = new Error(errorMsg);
        continue;
      }

      const reply = data.choices?.[0]?.message?.content;
      if (reply && reply.trim()) {
        return reply.trim();
      }
    } catch (err: unknown) {
      console.error(`[OpenRouter Exception with ${model}]:`, err);
      lastError = err;
      continue;
    }
  }

  throw lastError || new Error('Failed to generate response using OpenRouter.');
}

/**
 * Dispatches an AI chat call using available environment keys.
 */
async function dispatchAICall(
  formattedMessages: { role: 'system' | 'user' | 'assistant'; content: string }[]
): Promise<string> {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (openRouterKey) {
    return await callOpenRouterChat(formattedMessages, openRouterKey);
  }

  if (groqKey) {
    return await callOpenRouterChat(formattedMessages, groqKey);
  }

  if (geminiKey) {
    return await callOpenRouterChat(formattedMessages, geminiKey);
  }

  throw new Error('No AI API key configured. Please check OPENROUTER_API_KEY or GEMINI_API_KEY.');
}

/**
 * Generates an empathetic journaling response for a conversation turn.
 */
export async function generateJournalReply(
  history: TurnMessage[],
  newMessage: string
): Promise<string> {
  const formattedMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: SYSTEM_INSTRUCTION },
    ...history.map((m) => ({
      role: (m.role === 'model' ? 'assistant' : 'user') as 'assistant' | 'user',
      content: m.content,
    })),
    { role: 'user', content: newMessage },
  ];

  return await dispatchAICall(formattedMessages);
}

/**
 * Analyzes a session to return AI Title (max 5 words), Emotion (from allowed list), and 2-3 sentence Summary in JSON.
 */
export async function generateSessionAnalysis(history: TurnMessage[]): Promise<SessionAnalysis> {
  if (history.length === 0) {
    return {
      title: 'Untitled Session',
      emotion: 'Neutral',
      summary: 'Empty conversation.',
    };
  }

  const prompt = `You are an empathetic, insightful personal journaling assistant.
Based on the provided journaling conversation turns, analyze the session and return a strictly valid JSON object with EXACTLY three fields:

1. "title": A human-readable session title of MAXIMUM 5 words summarizing the central theme (NO quotation marks inside the string, plain text). Example: "Feeling Better After Exam"
2. "emotion": Exactly ONE primary emotion detected from the user's feelings. Allowed values ONLY: ["Happy", "Calm", "Sad", "Stressed", "Angry", "Anxious", "Motivated", "Confused", "Neutral"].
3. "summary": A concise, empathetic 2-3 sentence reflection summary capturing what was discussed and the user's personal growth.

Respond with ONLY the JSON object. Example format:
{
  "title": "Preparing For Interview",
  "emotion": "Anxious",
  "summary": "The user expressed feelings of uncertainty regarding their upcoming technical interview. They explored grounding exercises and identified positive preparation steps."
}`;

  const formattedMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: SYSTEM_INSTRUCTION },
    ...history.map((m) => ({
      role: (m.role === 'model' ? 'assistant' : 'user') as 'assistant' | 'user',
      content: m.content,
    })),
    { role: 'user', content: prompt },
  ];

  try {
    const rawResult = await dispatchAICall(formattedMessages);
    
    // Clean up potential markdown JSON codeblocks ```json ... ```
    const cleaned = rawResult
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    // Extract first JSON substring if surrounded by extra commentary
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    const parseTarget = jsonMatch ? jsonMatch[0] : cleaned;

    const parsed = JSON.parse(parseTarget);

    const title = cleanTitle(parsed.title || 'Untitled Session');
    
    let emotion: EmotionType = 'Neutral';
    if (parsed.emotion && ALLOWED_EMOTIONS.includes(parsed.emotion)) {
      emotion = parsed.emotion as EmotionType;
    }

    const summary = parsed.summary && typeof parsed.summary === 'string' ? parsed.summary.trim() : cleaned;

    return {
      title,
      emotion,
      summary: summary || 'No summary available.',
    };
  } catch (err: unknown) {
    console.error('⚠️ [Failed to parse JSON session analysis, falling back]:', err);
    // Fallback gracefully
    const firstUserMsg = history.find((m) => m.role === 'user')?.content || 'Journal Entry';
    return {
      title: cleanTitle(firstUserMsg),
      emotion: 'Neutral',
      summary: 'Session reflection completed.',
    };
  }
}

/**
 * Backward compatibility wrapper for generateSummary.
 */
export async function generateSummary(history: TurnMessage[]): Promise<string> {
  const analysis = await generateSessionAnalysis(history);
  return `[Emotion: ${analysis.emotion}]\n${analysis.summary}`;
}

/**
 * Generates structured 7-day weekly insights from a collection of session reflections.
 */
export async function generateWeeklyInsights(
  journals: { title?: string | null; emotion?: string | null; summary: string; date: string }[]
): Promise<WeeklyInsightData> {
  if (!journals || journals.length === 0) {
    return {
      weeklySummary: 'No journal sessions recorded in the past 7 days. Complete daily reflections to unlock weekly AI insights!',
      mostCommonEmotion: 'Neutral',
      positiveObservation: 'Begin your journaling journey to track habits and personal growth.',
      improvementSuggestion: 'Try setting aside 5 minutes each evening for a quick emotional check-in.',
    };
  }

  const journalsContext = journals
    .map(
      (j, idx) =>
        `Session ${idx + 1} (${j.date}): Title: "${j.title || 'Untitled'}", Emotion: ${j.emotion || 'Neutral'}\nSummary: ${j.summary}`
    )
    .join('\n\n');

  const prompt = `Analyze these personal journal entries from the user over the last 7 days:

${journalsContext}

Please return a strictly valid JSON object with the following four fields:
1. "weeklySummary": A thoughtful 3-4 sentence summary capturing the overall arc, themes, and personal journey of their week.
2. "mostCommonEmotion": The predominant or overall emotional tone of the week (Must be ONLY one of: ["Happy", "Calm", "Sad", "Stressed", "Angry", "Anxious", "Motivated", "Confused", "Neutral"]).
3. "positiveObservation": A specific strength, resilience, positive habit, or achievement evident in their entries.
4. "improvementSuggestion": One gentle, supportive, and actionable self-care or mindset suggestion for the upcoming week.

Respond with ONLY the JSON object.`;

  const formattedMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: SYSTEM_INSTRUCTION },
    { role: 'user', content: prompt },
  ];

  try {
    const rawResult = await dispatchAICall(formattedMessages);
    const cleaned = rawResult.replace(/```json/gi, '').replace(/```/g, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    const parseTarget = jsonMatch ? jsonMatch[0] : cleaned;
    const parsed = JSON.parse(parseTarget);

    let mostCommonEmotion: EmotionType = 'Neutral';
    if (parsed.mostCommonEmotion && ALLOWED_EMOTIONS.includes(parsed.mostCommonEmotion)) {
      mostCommonEmotion = parsed.mostCommonEmotion as EmotionType;
    }

    return {
      weeklySummary: parsed.weeklySummary?.trim() || 'A reflective week of meaningful personal insights.',
      mostCommonEmotion,
      positiveObservation: parsed.positiveObservation?.trim() || 'Consistent dedication to self-reflection and emotional awareness.',
      improvementSuggestion: parsed.improvementSuggestion?.trim() || 'Take time to celebrate small wins as you progress towards your goals.',
      totalJournalsAnalyzed: journals.length,
    };
  } catch (err: unknown) {
    console.error('⚠️ [Failed to parse weekly insights JSON]:', err);
    return {
      weeklySummary: 'You have actively journaled throughout the week, building consistency and emotional self-awareness.',
      mostCommonEmotion: 'Calm',
      positiveObservation: 'You are taking proactive steps to reflect on daily experiences and clarify your thoughts.',
      improvementSuggestion: 'Continue prioritizing a few quiet minutes each day for mindful reflection.',
      totalJournalsAnalyzed: journals.length,
    };
  }
}
