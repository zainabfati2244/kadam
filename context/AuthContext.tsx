import React, { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { authApi, UserProfileResponse } from '../api/auth';
import { supabase } from '../src/lib/supabase';
import type { Session } from '@supabase/supabase-js';

export type AppUser = {
  uid: string;
  name: string;
  email: string;
  photo: string | null;
  role?: 'admin' | 'customer' | null;
};

export type ForceRole = 'admin' | 'customer' | null;

type AuthValue = {
  session: Session | null;
  user: AppUser | null;
  token: string | null;
  role: 'admin' | 'customer' | null;
  forceRole: ForceRole;
  currentRole: 'admin' | 'customer';
  setForceRole: (nextRole: ForceRole) => void;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [customUser, setCustomUser] = useState<AppUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<'admin' | 'customer' | null>(null);
  const [forceRole, setForceRole] = useState<ForceRole>(null);
  const [loading, setLoading] = useState(true);

  // Initialize Auth State from stored token / Supabase session
  useEffect(() => {
    async function initAuth() {
      try {
        const storedSession = await authApi.getStoredSession();
        if (storedSession) {
          let activeSession = storedSession;
          let profile: UserProfileResponse;
          try {
            profile = await authApi.getMe(storedSession.accessToken);
          } catch {
            const refreshedSession = await authApi.refreshToken();
            const refreshedToken = refreshedSession.accessToken || refreshedSession.token;
            if (!refreshedToken) throw new Error('Session refresh returned no access token');
            activeSession = {
              accessToken: refreshedToken,
              refreshToken: refreshedSession.refreshToken || storedSession.refreshToken,
              role: refreshedSession.role || storedSession.role,
              user: refreshedSession.user || storedSession.user,
            };
            try {
              profile = await authApi.getMe(refreshedToken);
            } catch {
              profile = activeSession.user;
            }
          }

          setToken(activeSession.accessToken);
          setRole(activeSession.role);
          setCustomUser({
            uid: String(profile.id ?? activeSession.user.id ?? 'custom-user'),
            name: profile.fullName || profile.username || activeSession.user.fullName || activeSession.user.username || profile.email.split('@')[0],
            email: profile.email || activeSession.user.email,
            photo: profile.avatarUrl ?? activeSession.user.avatarUrl ?? null,
            role: activeSession.role,
          });
        }
      } catch {
        await authApi.logout();
        setToken(null);
        setRole(null);
        setCustomUser(null);
      } finally {
        setLoading(false);
      }
    }

    initAuth();

    // Listener for Supabase Auth state changes if used
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    const accessToken = res.accessToken || (res as any).token;
    if (accessToken) {
      setToken(accessToken);
      setRole(res.role || 'customer');
      try {
        const profile = await authApi.getMe(accessToken);
        setCustomUser({
          uid: String(profile.id ?? 'custom-user'),
          name: profile.fullName || profile.username || res.user?.fullName || res.user?.username || email.split('@')[0],
          email: profile.email || res.user?.email || email,
          photo: profile.avatarUrl ?? res.user?.avatarUrl ?? null,
          role: res.role || 'customer',
        });
      } catch {
        const fallbackEmail = res.user?.email || email;
        setCustomUser({
          uid: 'custom-user',
          name: res.user?.fullName || res.user?.username || fallbackEmail.split('@')[0],
          email: fallbackEmail,
          photo: res.user?.avatarUrl ?? null,
          role: res.role || 'customer',
        });
      }
    }
  };

  const register = async (email: string, password: string) => {
    await authApi.register(email, password);
  };

  const logout = async () => {
    await authApi.logout();
    await supabase.auth.signOut().catch(() => undefined);
    setToken(null);
    setRole(null);
    setForceRole(null);
    setCustomUser(null);
    setSession(null);
  };

  // Compute combined app user (custom API user or Supabase user)
  const user: AppUser | null = customUser || (session?.user ? {
    uid: session.user.id,
    name: (session.user.user_metadata?.full_name as string) || session.user.email?.split('@')[0] || '',
    email: session.user.email || '',
    photo: (session.user.user_metadata?.avatar_url as string) || null,
  } : null);
  const currentRole: 'admin' | 'customer' = forceRole || user?.role || role || 'customer';

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        token,
        role,
        forceRole,
        currentRole,
        setForceRole,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be inside AuthProvider');
  return value;
}
