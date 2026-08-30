'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

export interface AuthUser {
  uid: string;
  id: string;
  email: string | null;
  user_metadata?: Record<string, unknown>;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapSupabaseUser(user: SupabaseUser | null): AuthUser | null {
  if (!user) return null;
  return {
    uid: user.id,
    id: user.id,
    email: user.email || null,
    user_metadata: user.user_metadata,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // 1. Check initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(mapSupabaseUser(session?.user ?? null));
      } catch (err) {
        console.error('Failed to get initial Supabase session:', err);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // 2. Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(mapSupabaseUser(currentSession?.user ?? null));
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string): Promise<void> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    if (error) {
      throw new Error(error.message);
    }
  };

  const register = async (email: string, pass: string): Promise<void> => {
    const { error } = await supabase.auth.signUp({
      email,
      password: pass,
    });
    if (error) {
      throw new Error(error.message);
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });
    if (error) {
      throw new Error(error.message);
    }
  };

  const logout = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
