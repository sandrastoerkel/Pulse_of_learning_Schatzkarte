// src/hooks/useWortschmiede.ts
// P2 — Wortschmiede Battle (bereits direkte Supabase-Calls, jetzt React Query Wrapper)
// Ersetzt: WortschmiedeBattle.jsx:1720-1771

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useLegacyUserId } from './useLegacyUserId';

// ─── Types (aus echtem Schema) ──────────────────────────────────────────────

export interface WortschmiedeProgress {
  id: string;               // UUID
  user_id: string;
  defeated_ids: unknown[];   // JSONB array
  xp: number;
  difficulty: string;        // Default: 'mittel'
  auto_level: string;        // Default: 'mittel'
  updated_at: string;
}

export interface WortschmiedeWordStat {
  id: string;               // UUID
  user_id: string;
  word: string;
  interval: number;          // SM-2 Intervall
  repetition: number;        // SM-2 Wiederholungen
  efactor: number;           // SM-2 E-Faktor, Default: 2.5
  due_date: string;          // DATE, Default: CURRENT_DATE
  total_correct: number;
  total_wrong: number;
  updated_at: string;
}

// ─── Query: Wortschmiede-Fortschritt ────────────────────────────────────────

export function useWortschmiedeProgress() {
  const legacyId = useLegacyUserId();

  return useQuery({
    queryKey: ['wortschmiede_progress', legacyId],
    queryFn: async (): Promise<WortschmiedeProgress | null> => {
      const { data, error } = await supabase
        .from('wortschmiede_progress')
        .select('*')
        .eq('user_id', legacyId!)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!legacyId,
    staleTime: 1000 * 60 * 5,
  });
}

// ─── Mutation: Wortschmiede-Fortschritt speichern ───────────────────────────

export function useSaveWortschmiedeProgress() {
  const legacyId = useLegacyUserId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (progress: Partial<WortschmiedeProgress>) => {
      if (!legacyId) throw new Error('Nicht eingeloggt');

      const { error } = await supabase
        .from('wortschmiede_progress')
        .upsert(
          {
            ...progress,
            user_id: legacyId,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wortschmiede_progress', legacyId] });
    },
  });
}

// ─── Query: Wort-Statistiken ────────────────────────────────────────────────

export function useWordStats() {
  const legacyId = useLegacyUserId();

  return useQuery({
    queryKey: ['wortschmiede_word_stats', legacyId],
    queryFn: async (): Promise<WortschmiedeWordStat[]> => {
      const { data, error } = await supabase
        .from('wortschmiede_word_stats')
        .select('*')
        .eq('user_id', legacyId!);

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!legacyId,
    staleTime: 1000 * 60 * 5,
  });
}

// ─── Query: Fällige Wörter (due_date <= heute) ──────────────────────────────

export function useDueWords() {
  const legacyId = useLegacyUserId();
  const today = new Date().toISOString().slice(0, 10);

  return useQuery({
    queryKey: ['wortschmiede_word_stats', legacyId, 'due', today],
    queryFn: async (): Promise<WortschmiedeWordStat[]> => {
      const { data, error } = await supabase
        .from('wortschmiede_word_stats')
        .select('*')
        .eq('user_id', legacyId!)
        .lte('due_date', today);

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!legacyId,
    staleTime: 1000 * 60,
  });
}

// ─── Mutation: Wort-Statistik updaten (nach Übung) ──────────────────────────

export function useSaveWordStat() {
  const legacyId = useLegacyUserId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (stat: Partial<WortschmiedeWordStat> & { word: string }) => {
      if (!legacyId) throw new Error('Nicht eingeloggt');

      const { error } = await supabase
        .from('wortschmiede_word_stats')
        .upsert(
          {
            ...stat,
            user_id: legacyId,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,word' }
        );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wortschmiede_word_stats', legacyId] });
    },
  });
}
