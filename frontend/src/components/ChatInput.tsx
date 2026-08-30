'use client';

import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
  disabled?: boolean;
  placeholder?: string;
}

const MAX_CHARS = 4000;

export function ChatInput({
  onSendMessage,
  isLoading,
  disabled = false,
  placeholder = 'Reflect on your day, thoughts, or feelings... (Enter to send, Shift+Enter for newline)',
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleSubmit = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading || disabled) return;

    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    await onSendMessage(trimmed);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const charsRemaining = MAX_CHARS - input.length;
  const isOverLimit = charsRemaining < 0;

  return (
    <div className="p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800/80 transition-colors duration-200 flex-shrink-0">
      <div className="max-w-4xl mx-auto relative rounded-2xl border border-slate-300/90 dark:border-slate-700/80 focus-within:border-indigo-600 dark:focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-950/60 transition-all bg-white dark:bg-slate-950 shadow-soft-sm">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isLoading}
          placeholder={placeholder}
          rows={1}
          maxLength={MAX_CHARS}
          className="w-full resize-none py-3.5 pl-4 pr-14 text-sm md:text-base text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-transparent focus:outline-none disabled:opacity-50 max-h-48 leading-relaxed"
        />

        <div className="absolute right-2.5 bottom-2.5 flex items-center gap-2">
          {input.length > 3000 && (
            <span
              className={`text-[10px] font-mono ${
                isOverLimit ? 'text-red-500 font-semibold' : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {charsRemaining}
            </span>
          )}

          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading || disabled || isOverLimit}
            aria-label="Send reflection"
            className="p-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 dark:disabled:text-slate-600 rounded-xl transition-all duration-200 shadow-soft-sm flex items-center justify-center cursor-pointer disabled:cursor-not-allowed group"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Send className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            )}
          </button>
        </div>
      </div>
      <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 mt-2 font-medium">
        Private & Encrypted Journaling • Powered by Gemini AI
      </p>
    </div>
  );
}
