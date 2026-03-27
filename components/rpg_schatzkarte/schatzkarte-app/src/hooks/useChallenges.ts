// src/hooks/useChallenges.ts
// P1 — Hattie-Schiff + Statistiken
// Ersetzt: gamification_db.py:271 → db.table("challenges").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(50)

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useLegacyUserId } from './useLegacyUserId';
import type { Challenge, ChallengeInsert, ChallengeUpdate } from '../types/database';

// ─── Query: Challenges laden (letzte 50) ────────────────────────────────────

export function useChallenges(limit = 50) {
  const legacyId = useLegacyUserId();

  return useQuery({
    queryKey: ['challenges', legacyId, limit],
    queryFn: async (): Promise<Challenge[]> => {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('user_id', legacyId!)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!legacyId,
    staleTime: 1000 * 60 * 2,
  });
}

// ─── Query: Offene Challenges (nicht abgeschlossen) ─────────────────────────

export function useOpenChallenges() {
  const legacyId = useLegacyUserId();

  return useQuery({
    queryKey: ['challenges', legacyId, 'open'],
    queryFn: async (): Promise<Challenge[]> => {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('user_id', legacyId!)
        .eq('completed', false)
        .order('challenge_date', { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!legacyId,
  });
}

// ─── Mutation: Neue Challenge erstellen ─────────────────────────────────────

export function useCreateChallenge() {
  const legacyId = useLegacyUserId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (challenge: Omit<ChallengeInsert, 'user_id'>) => {
      if (!legacyId) throw new Error('Nicht eingeloggt');

      const { data, error } = await supabase
        .from('challenges')
        .insert({ ...challenge, user_id: legacyId })
        .select()
        .single();

      if (error) throw error;
      return data as Challenge;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges', legacyId] });
    },
  });
}

// ─── Mutation: Challenge updaten (Ergebnis eintragen) ───────────────────────

export function useUpdateChallenge() {
  const legacyId = useLegacyUserId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...update }: ChallengeUpdate & { id: number }) => {
      const { error } = await supabase
        .from('challenges')
        .update(update)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges', legacyId] });
    },
  });
}
