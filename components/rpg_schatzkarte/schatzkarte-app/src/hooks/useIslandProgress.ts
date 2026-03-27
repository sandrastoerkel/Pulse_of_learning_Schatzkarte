// src/hooks/useIslandProgress.ts
// P0 — Wird bei JEDEM Karte-Render gebraucht.
// Ersetzt: map_db.py:146 → db.table("island_progress").select("*").eq("user_id", user_id)

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useLegacyUserId } from './useLegacyUserId';
import { useAuth } from '../contexts/AuthContext';
import { useAwardXP } from './useAwardXP';
import { XP_REWARDS } from '../config/xpRewards';
import type { IslandProgress, IslandAction } from '../types/database';

// ─── Query: Alle Insel-Fortschritte laden ───────────────────────────────────

export function useIslandProgress() {
  const legacyId = useLegacyUserId();

  return useQuery({
    queryKey: ['island_progress', legacyId],
    queryFn: async (): Promise<IslandProgress[]> => {
      const { data, error } = await supabase
        .from('island_progress')
        .select('*')
        .eq('user_id', legacyId!);

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!legacyId,
    staleTime: 1000 * 60 * 2, // 2 Minuten (wie @st.cache_data(ttl=120))
  });
}

// ─── Query: Fortschritt einer bestimmten Insel ──────────────────────────────

export function useIslandProgressById(islandId: string | undefined) {
  const legacyId = useLegacyUserId();

  return useQuery({
    queryKey: ['island_progress', legacyId, islandId],
    queryFn: async (): Promise<IslandProgress | null> => {
      const { data, error } = await supabase
        .from('island_progress')
        .select('*')
        .eq('user_id', legacyId!)
        .eq('island_id', islandId!)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!legacyId && !!islandId,
    staleTime: 1000 * 60 * 2,
  });
}

// ─── Mutation: Insel-Aktion abschließen ─────────────────────────────────────
// Ersetzt: map_db.py:174-196 → complete_island_action()

interface CompleteActionParams {
  islandId: string;
  action: IslandAction;
  quizScore?: number;
}

export function useCompleteIslandAction() {
  const legacyId = useLegacyUserId();
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const { awardXP } = useAwardXP();

  return useMutation({
    mutationFn: async ({ islandId, action, quizScore }: CompleteActionParams) => {
      if (!legacyId) throw new Error('Nicht eingeloggt');

      const now = new Date().toISOString();
      const actionAtField = `${action}_at` as const;

      // Prüfen ob Eintrag existiert
      const { data: existing } = await supabase
        .from('island_progress')
        .select('user_id')
        .eq('user_id', legacyId)
        .eq('island_id', islandId)
        .maybeSingle();

      if (existing) {
        // UPDATE
        const updateData: Record<string, unknown> = {
          [action]: true,
          [actionAtField]: now,
          updated_at: now,
        };
        if (action === 'quiz_passed' && quizScore !== undefined) {
          updateData.quiz_score = quizScore;
        }

        const { error } = await supabase
          .from('island_progress')
          .update(updateData)
          .eq('user_id', legacyId)
          .eq('island_id', islandId);

        if (error) throw error;
      } else {
        // INSERT
        const insertData: Record<string, unknown> = {
          user_id: legacyId,
          island_id: islandId,
          [action]: true,
          [actionAtField]: now,
        };
        if (action === 'quiz_passed' && quizScore !== undefined) {
          insertData.quiz_score = quizScore;
        }

        const { error } = await supabase
          .from('island_progress')
          .insert(insertData);

        if (error) throw error;
      }
    },
    onSuccess: (_data, variables) => {
      // Cache invalidieren → Karte wird neu gerendert
      queryClient.invalidateQueries({ queryKey: ['island_progress', legacyId] });
      // XP vergeben (wie map_db.py:198-203)
      if (profile?.id) {
        awardXP(profile.id, XP_REWARDS[variables.action]);
      }
    },
  });
}
