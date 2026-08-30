import React from 'react';
import { ChatMessage as ChatMessageType } from '../types';
import { formatDateTime } from '../utils/formatters';
import { Sparkles, User } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex gap-3 px-4 py-3.5 animate-fade-in group transition-all duration-200 ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {!isUser && (
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0 mt-0.5 shadow-soft-sm group-hover:scale-105 transition-transform">
          <Sparkles className="w-4 h-4" />
        </div>
      )}

      <div
        className={`max-w-[85%] md:max-w-[76%] rounded-2xl px-5 py-3.5 text-sm md:text-base leading-relaxed md:leading-7 transition-all duration-200 ${
          isUser
            ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-xs shadow-soft-md font-medium'
            : 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs shadow-soft-sm font-normal'
        }`}
      >
        <div className="whitespace-pre-wrap break-words">{message.content}</div>
        <div
          className={`text-[11px] mt-2 flex font-medium ${
            isUser ? 'justify-end text-indigo-200' : 'justify-start text-slate-400 dark:text-slate-500'
          }`}
        >
          {formatDateTime(message.createdAt)}
        </div>
      </div>

      {isUser && (
        <div className="w-9 h-9 rounded-2xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 flex-shrink-0 mt-0.5 shadow-soft-sm group-hover:scale-105 transition-transform">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex gap-3 px-4 py-3.5 justify-start items-center animate-fade-in">
      <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0 shadow-soft-sm">
        <Sparkles className="w-4 h-4 animate-spin [animation-duration:3s]" />
      </div>
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl rounded-tl-xs px-5 py-3.5 shadow-soft-sm">
        <div className="flex items-center gap-2 py-1">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-bounce"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-bounce [animation-delay:0.2s]"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-bounce [animation-delay:0.4s]"></div>
        </div>
      </div>
    </div>
  );
}
