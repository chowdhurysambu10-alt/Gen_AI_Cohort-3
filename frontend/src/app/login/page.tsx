'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeToggle } from '../../components/ThemeToggle';
import { BookOpen, Lock, Mail, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const { login, loginWithGoogle, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      setGoogleSubmitting(true);
      await loginWithGoogle();
      router.replace('/dashboard');
    } catch (err: unknown) {
      let message = 'Failed to sign in with Google.';
      if (err instanceof Error) {
        if (err.message.includes('popup-closed-by-user')) {
          message = 'Google sign-in was cancelled.';
        } else {
          message = err.message;
        }
      }
      setError(message);
    } finally {
      setGoogleSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setError(null);
      setSubmitting(true);
      await login(email.trim(), password);
      router.replace('/dashboard');
    } catch (err: unknown) {
      let message = 'Failed to sign in. Please check your credentials.';
      if (err instanceof Error) {
        if (
          err.message.includes('user-not-found') ||
          err.message.includes('wrong-password') ||
          err.message.includes('invalid-credential')
        ) {
          message = 'Invalid email address or password.';
        } else if (err.message.includes('too-many-requests')) {
          message = 'Too many failed attempts. Please try again in a few minutes.';
        } else {
          message = err.message;
        }
      }
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <LoadingSpinner size="lg" message="Authenticating..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 relative transition-colors duration-200">
      <div className="absolute top-4 left-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-slate-100 dark:hover:text-white bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/80 dark:border-slate-800 shadow-soft-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-soft-sm group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">
              Personal Gemini Journal
            </span>
          </Link>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Welcome back</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Sign in to access your private journaling sessions
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900/90 p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft-sm backdrop-blur-md">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 focus:border-indigo-600 dark:focus:border-indigo-500 transition-all placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 focus:border-indigo-600 dark:focus:border-indigo-500 transition-all placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || googleSubmitting}
              className="w-full mt-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-soft-sm hover:shadow-glow-primary transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-white dark:bg-slate-900 px-2 text-slate-400 dark:text-slate-500 font-medium">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={submitting || googleSubmitting}
            className="w-full py-2.5 px-4 bg-white dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 active:bg-slate-100 disabled:opacity-50 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold shadow-soft-sm transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer"
          >
            {googleSubmitting ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Don&apos;t have an account yet?{' '}
              <Link
                href="/register"
                className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
