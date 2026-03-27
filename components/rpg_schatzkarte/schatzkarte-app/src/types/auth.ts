// src/types/auth.ts
// Type-Definitionen für das Auth-System

export type UserRole = 'student' | 'coach' | 'admin';

export type AgeGroup =
  | 'grundschule'
  | 'unterstufe'
  | 'mittelstufe'
  | 'oberstufe'
  | 'paedagoge'
  | 'coach';

export interface Profile {
  id: string;                    // UUID aus Supabase Auth
  legacy_user_id: string | null; // md5(name)[:16] aus der alten App
  display_name: string;
  username: string;              // lowercase, = Email-Prefix
  age_group: AgeGroup;
  role: UserRole;
  avatar_settings: Record<string, unknown>;
  xp_total: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: import('@supabase/supabase-js').User | null;
  profile: Profile | null;
  role: UserRole;
  loading: boolean;
  initialized: boolean;
}

// Für den Login: Username wird zu pseudo-email
export function usernameToEmail(username: string): string {
  return `${username.trim().toLowerCase()}@schatzkarte.app`;
}

export function emailToUsername(email: string): string {
  return email.split('@')[0];
}
