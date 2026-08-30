import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateSessionAnalysis, TurnMessage } from '@/lib/gemini';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized. Missing bearer token.' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    
    // Create an authenticated Supabase client for the requesting user
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Invalid authentication token.' }, { status: 401 });
    }

    const body = await req.json();
    const { conversationId } = body;

    if (!conversationId || typeof conversationId !== 'string' || !UUID_REGEX.test(conversationId)) {
      return NextResponse.json({ error: 'Invalid conversationId. Must be a valid UUID.' }, { status: 400 });
    }

    // 1. Fetch conversation messages
    const { data: historyData } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (!historyData || historyData.length === 0) {
      return NextResponse.json({ error: 'Cannot summarize an empty conversation.' }, { status: 400 });
    }

    const history: TurnMessage[] = historyData.map((m) => ({
      role: m.role as 'user' | 'model',
      content: m.content,
    }));

    // 2. Generate title, emotion, and summary using Gemini
    const analysis = await generateSessionAnalysis(history);
    const now = new Date().toISOString();
    const encodedSummary = `[Emotion: ${analysis.emotion}]\n${analysis.summary}`;

    // 3. Update conversation in Supabase
    await supabase
      .from('conversations')
      .update({
        title: analysis.title,
        summary: encodedSummary,
        last_summarized_at: now,
        updated_at: now,
      })
      .eq('id', conversationId);

    // 4. Also record in journal_entries table for history / reflection logs
    await supabase.from('journal_entries').insert({
      user_id: user.id,
      conversation_id: conversationId,
      title: analysis.title,
      summary: encodedSummary,
      created_at: now,
      updated_at: now,
    });

    return NextResponse.json({
      conversationId,
      title: analysis.title,
      emotion: analysis.emotion,
      summary: analysis.summary,
      updatedAt: now,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
