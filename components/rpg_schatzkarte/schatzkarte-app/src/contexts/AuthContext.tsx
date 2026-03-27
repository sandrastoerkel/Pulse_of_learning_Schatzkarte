// src/contexts/AuthContext.tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { AuthState, Profile, UserRole } from '../types/auth';
import { usernameToEmail } from '../types/auth';

// ─── Context ────────────────────────────────────────────────────────────────

interface AuthContextValue extends AuthState {
  /** Login mit Benutzername (wird intern zu pseudo-email) */
  signIn: (username: string, password: string) => Promise<{ error: string | null }>;
  /** Neuen Account erstellen */
  signUp: (
    username: string,
    password: string,
    displayName: string,
    ageGroup?: string
  ) => Promise<{ error: string | null }>;
  /** Ausloggen */
  signOut: () => Promise<void>;
  /** Passwort ändern (für must_change_password nach Migration) */
  changePassword: (newPassword: string) => Promise<{ error: string | null }>;
  /** Profil neu laden (z.B. nach XP-Vergabe) */
  refreshProfile: () => Promise<void>;
  /** Convenience: Coach oder Admin? */
  isCoach: boolean;
  /** Convenience: Admin? */
  isAdmin: boolean;
  /** Legacy-ID für Queries auf alte Tabellen */
  legacyUserId: string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ───────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Profil aus DB laden
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Profil laden fehlgeschlagen:', error.message);
      return null;
    }
    return data as Profile;
  }, []);

  // Session-State setzen
  const handleSession = useCallback(
    async (session: Session | null) => {
      if (session?.user) {
        setUser(session.user);
        const p = await fetchProfile(session.user.id);
        setProfile(p);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
      setInitialized(true);
    },
    [fetchProfile]
  );

  // Initiale Session + Listener
  useEffect(() => {
    // 1. Bestehende Session prüfen
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    // 2. Auth-State-Changes (Login, Logout, Token-Refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, [handleSession]);

  // ─── Actions ────────────────────────────────────────────────────────────

  const signIn = useCallback(
    async (username: string, password: string) => {
      setLoading(true);
      const email = usernameToEmail(username);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setLoading(false);
        // Benutzerfreundliche Fehlermeldung
        const message =
          error.message === 'Invalid login credentials'
            ? 'Benutzername oder Passwort falsch.'
            : error.message;
        return { error: message };
      }

      // handleSession wird vom onAuthStateChange-Listener aufgerufen
      return { error: null };
    },
    []
  );

  const signUp = useCallback(
    async (
      username: string,
      password: string,
      displayName: string,
      ageGroup: string = 'grundschule'
    ) => {
      setLoading(true);
      const email = usernameToEmail(username);

      // Prüfen ob Username schon vergeben ist
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username.trim().toLowerCase())
        .maybeSingle();

      if (existing) {
        setLoading(false);
        return { error: 'Dieser Benutzername ist schon vergeben.' };
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            age_group: ageGroup,
          },
        },
      });

      if (error) {
        setLoading(false);
        return { error: error.message };
      }

      // Auto-Confirm Workaround: Supabase Free Plan kann "Confirm email"
      // nicht deaktivieren. Ein DB-Trigger (auto_confirm_user) bestätigt
      // neue User sofort. Falls die Session nach signUp noch nicht aktiv
      // ist (weil Supabase auf Bestätigung wartet), loggen wir direkt ein.
      const { data: sessionCheck } = await supabase.auth.getSession();
      if (!sessionCheck.session) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          setLoading(false);
          return { error: signInError.message };
        }
      }

      return { error: null };
    },
    []
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    // State wird vom onAuthStateChange-Listener zurückgesetzt
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (data) setProfile(data as Profile);
  }, [user]);

  const changePassword = useCallback(async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  }, []);

  // ─── Derived State ────────────────────────────────────────────────────

  const role: UserRole = profile?.role ?? 'student';
  const isCoach = role === 'coach' || role === 'admin';
  const isAdmin = role === 'admin';
  const legacyUserId = profile?.legacy_user_id ?? null;

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      role,
      loading,
      initialized,
      signIn,
      signUp,
      signOut,
      changePassword,
      refreshProfile,
      isCoach,
      isAdmin,
      legacyUserId,
    }),
    [
      user,
      profile,
      role,
      loading,
      initialized,
      signIn,
      signUp,
      signOut,
      changePassword,
      refreshProfile,
      isCoach,
      isAdmin,
      legacyUserId,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth() muss innerhalb von <AuthProvider> verwendet werden.');
  }
  return ctx;
}
