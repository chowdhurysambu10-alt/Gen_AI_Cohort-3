import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateWeeklyInsights } from '@/lib/gemini';
import { parseEmotionAndSummary, formatDateOnly } from '@/utils/formatters';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function GET(req: NextRequest) {
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

    // 1. Fetch conversations from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('id, title, summary, created_at, updated_at')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    if (convError) {
      throw new Error(`Failed to fetch recent journals: ${convError.message}`);
    }

    const formattedJournals = (conversations || []).map((c) => {
      const { emotion, summary } = parseEmotionAndSummary(c.summary);
      return {
        title: c.title || 'Journal Entry',
        emotion: emotion || 'Neutral',
        summary: summary || 'Reflective session turn.',
        date: formatDateOnly(c.created_at) || 'Past Week',
      };
    });

    const now = new Date();
    const dateRange = `${formatDateOnly(sevenDaysAgo.toISOString())} – ${formatDateOnly(now.toISOString())}`;

    // 2. Generate structured weekly reflection with Gemini
    const insightData = await generateWeeklyInsights(formattedJournals);

    return NextResponse.json({
      ...insightData,
      dateRange,
      totalJournalsAnalyzed: formattedJournals.length,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
