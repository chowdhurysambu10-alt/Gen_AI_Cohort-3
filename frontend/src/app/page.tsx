'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { BookOpen, ShieldCheck, Sparkles, Lock, ArrowRight, Zap } from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <LoadingSpinner size="lg" message="Loading Personal Gemini Journal..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-200">
      {/* Header Navigation */}
      <header className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md sticky top-0 z-30 transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-soft-sm">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-sm md:text-base tracking-tight">
              Personal Gemini Journal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-xl transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-4 py-2 rounded-xl shadow-soft-sm hover:shadow-glow-primary transition-all duration-200 flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-4 py-16 md:py-24 text-center my-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-medium mb-6 shadow-soft-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Zero-Trust Authenticated Architecture</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight md:leading-tight mb-5">
          A Private, Reflective Space <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            Powered by Gemini AI
          </span>
        </h1>

        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Record your daily reflections, gain thoughtful emotional clarity, and generate session summaries. 
          Your entries remain strictly isolated and protected by Google Cloud infrastructure.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto mb-16">
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-semibold shadow-soft-sm hover:shadow-glow-primary transition-all duration-200 group"
          >
            <span>Start Journaling</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 bg-white dark:bg-slate-900 border border-slate-300/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold shadow-soft-sm transition-colors"
          >
            Sign In
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          <div className="p-5 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-soft-sm transition-all hover:border-indigo-300 dark:hover:border-indigo-700">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-1.5">Empathetic Reflections</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
              Multi-turn reflective dialogue designed to help process thoughts and emotions constructively.
            </p>
          </div>

          <div className="p-5 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-soft-sm transition-all hover:border-purple-300 dark:hover:border-purple-700">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-3.5">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-1.5">Automated Summaries</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
              Generate concise 2-3 sentence session reflections to track your personal growth over time.
            </p>
          </div>

          <div className="p-5 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-soft-sm transition-all hover:border-emerald-300 dark:hover:border-emerald-700">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3.5">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-1.5">Strict Isolation</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
              Cryptographically verified Supabase Auth JWT tokens and PostgreSQL Row Level Security protect your entries.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-400 dark:text-slate-500 bg-white/60 dark:bg-slate-950/60 transition-colors duration-200">
        Personal Gemini Journal • Secure Hackathon Backend & Frontend
      </footer>
    </div>
  );
}
