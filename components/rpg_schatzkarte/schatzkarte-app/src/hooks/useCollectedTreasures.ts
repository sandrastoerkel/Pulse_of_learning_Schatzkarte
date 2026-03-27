// src/hooks/useCollectedTreasures.ts
// P0 — Zusammen mit useIslandProgress bei jedem Karte-Render.
// Ersetzt: map_db.py:65 → db.table("user_treasures").select("island_id, treasure_id").eq("user_id", user_id)

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useLegacyUserId } from './useLegacyUserId';
import type { UserTreasure } from '../types/database';

// ─── Query: Alle gesammelten Schätze ────────────────────────────────────────

export function useCollectedTreasures() {
  const legacyId = useLegacyUserId();

  return useQuery({
    queryKey: ['user_treasures', legacyId],
    queryFn: async (): Promise<UserTreasure[]> => {
      const { data, error } = await supabase
        .from('user_treasures')
        .select('*')
        .eq('user_id', legacyId!)
        .order('collected_at', { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!legacyId,
    staleTime: 1000 * 60 * 2,
  });
}

// ─── Derived: Schätze gruppiert nach Insel ──────────────────────────────────

export function useTreasuresByIsland() {
  const { data: treasures, ...rest } = useCollectedTreasures();

  const byIsland = (treasures ?? []).reduce<Record<string, string[]>>(
    (acc, t) => {
      if (!acc[t.island_id]) acc[t.island_id] = [];
      acc[t.island_id].push(t.treasure_id);
      return acc;
    },
    {}
  );

  return { data: byIsland, ...rest };
}

// ─── Mutation: Schatz einsammeln ────────────────────────────────────────────

interface CollectTreasureParams {
  islandId: string;
  treasureId: string;
  xpEarned?: number;
}

export function useCollectTreasure() {
  const legacyId = useLegacyUserId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ islandId, treasureId, xpEarned = 0 }: CollectTreasureParams) => {
      if (!legacyId) throw new Error('Nicht eingeloggt');

      const { error } = await supabase
        .from('user_treasures')
        .insert({
          user_id: legacyId,
          island_id: islandId,
          treasure_id: treasureId,
          xp_earned: xpEarned,
        });

      if (error) {
        // Duplicate key = schon gesammelt → kein Fehler
        if (error.code === '23505') return;
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_treasures', legacyId] });
    },
  });
}
