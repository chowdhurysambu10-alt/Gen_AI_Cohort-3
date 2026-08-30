import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateJournalReply, TurnMessage } from '@/lib/gemini';
import { cleanTitle } from '@/utils/formatters';
import crypto from 'crypto';

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
      console.error('❌ [Supabase Auth Error]:', authError?.message);
      return NextResponse.json({ error: 'Unauthorized. Invalid authentication token.' }, { status: 401 });
    }

    const body = await req.json();
    const { conversationId, message } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message content cannot be empty.' }, { status: 400 });
    }

    if (message.length > 4000) {
      return NextResponse.json({ error: 'Message cannot exceed 4000 characters.' }, { status: 400 });
    }

    // Ensure conversationId is a valid UUID for PostgreSQL
    let targetConversationId = conversationId;
    if (!targetConversationId || typeof targetConversationId !== 'string' || !UUID_REGEX.test(targetConversationId)) {
      targetConversationId = crypto.randomUUID();
    }

    const now = new Date().toISOString();

    // 1. Ensure conversation record exists
    const { data: existingConv } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', targetConversationId)
      .single();

    if (!existingConv) {
      await supabase.from('conversations').insert({
        id: targetConversationId,
        user_id: user.id,
        title: cleanTitle(message.trim()),
        created_at: now,
        updated_at: now,
      });
    }

    // 2. Fetch past conversation turns for context
    const { data: historyData } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', targetConversationId)
      .order('created_at', { ascending: true });

    const history: TurnMessage[] = (historyData || []).map((m) => ({
      role: m.role as 'user' | 'model',
      content: m.content,
    }));

    // 3. Generate response with AI
    const reply = await generateJournalReply(history, message.trim());

    // 4. Save user message and model response to Supabase
    const { data: insertedUserMsg, error: userMsgErr } = await supabase
      .from('messages')
      .insert({
        conversation_id: targetConversationId,
        user_id: user.id,
        role: 'user',
        content: message.trim(),
        created_at: now,
      })
      .select('id')
      .single();

    if (userMsgErr) {
      console.error('❌ [Supabase Insert User Msg Error]:', userMsgErr);
      throw new Error(`Failed to save user message: ${userMsgErr.message}`);
    }

    const { data: insertedModelMsg, error: modelMsgErr } = await supabase
      .from('messages')
      .insert({
        conversation_id: targetConversationId,
        user_id: user.id,
        role: 'model',
        content: reply,
        created_at: new Date().toISOString(),
      })
      .select('id, created_at')
      .single();

    if (modelMsgErr) {
      console.error('❌ [Supabase Insert Model Msg Error]:', modelMsgErr);
      throw new Error(`Failed to save model reply: ${modelMsgErr.message}`);
    }

    // 5. Update conversation timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', targetConversationId);

    return NextResponse.json({
      reply,
      conversationId: targetConversationId,
      userMessageId: insertedUserMsg?.id || '',
      assistantMessageId: insertedModelMsg?.id || '',
      timestamp: insertedModelMsg?.created_at || new Date().toISOString(),
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal Server Error';
    console.error('🔥 [API Chat Handler Error]:', errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
