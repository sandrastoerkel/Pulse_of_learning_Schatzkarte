// src/hooks/useArenaProgress.ts
// P2 — Einmaleins-Arena (bereits direkte Supabase-Calls, jetzt React Query Wrapper)
// Ersetzt: EinmaleinsArena.tsx:524 → sb.from('arena_progress').select/upsert

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useLegacyUserId } from './useLegacyUserId';
import type { ArenaProgress } from '../types/database';

// ─── Query: Arena-Fortschritt laden ─────────────────────────────────────────

export function useArenaProgress() {
  const legacyId = useLegacyUserId();

  return useQuery({
    queryKey: ['arena_progress', legacyId],
    queryFn: async (): Promise<ArenaProgress | null> => {
      const { data, error } = await supabase
        .from('arena_progress')
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

// ─── Mutation: Arena-Fortschritt speichern ──────────────────────────────────

export function useSaveArenaProgress() {
  const legacyId = useLegacyUserId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (progress: Partial<ArenaProgress>) => {
      if (!legacyId) throw new Error('Nicht eingeloggt');

      const { error } = await supabase
        .from('arena_progress')
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
      queryClient.invalidateQueries({ queryKey: ['arena_progress', legacyId] });
    },
  });
}
