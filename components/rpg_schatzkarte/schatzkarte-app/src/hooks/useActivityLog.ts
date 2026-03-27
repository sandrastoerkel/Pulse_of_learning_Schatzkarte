// src/hooks/useActivityLog.ts
// Aktivitäts-Log für XP-Tracking und Heatmap
// Ersetzt: gamification_db.py → db.table("activity_log").select/insert

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useLegacyUserId } from './useLegacyUserId';
import type { ActivityLogEntry, ActivityLogInsert } from '../types/database';

// ─── Query: Aktivitäten laden (für Heatmap) ─────────────────────────────────

export function useActivityLog(days = 365) {
  const legacyId = useLegacyUserId();

  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString();

  return useQuery({
    queryKey: ['activity_log', legacyId, days],
    queryFn: async (): Promise<ActivityLogEntry[]> => {
      const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .eq('user_id', legacyId!)
        .gte('created_at', sinceStr)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!legacyId,
    staleTime: 1000 * 60 * 5,
  });
}

// ─── Derived: Aktivitäts-Heatmap (Tage → XP) ───────────────────────────────

export function useActivityHeatmap(days = 365) {
  const { data: entries, ...rest } = useActivityLog(days);

  const heatmap = (entries ?? []).reduce<Record<string, number>>((acc, entry) => {
    const day = entry.created_at.slice(0, 10); // YYYY-MM-DD
    acc[day] = (acc[day] || 0) + (entry.xp_earned || 0);
    return acc;
  }, {});

  return { data: heatmap, ...rest };
}

// ─── Mutation: Aktivität loggen ─────────────────────────────────────────────

export function useLogActivity() {
  const legacyId = useLegacyUserId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: Omit<ActivityLogInsert, 'user_id'>) => {
      if (!legacyId) throw new Error('Nicht eingeloggt');

      const { error } = await supabase
        .from('activity_log')
        .insert({ ...entry, user_id: legacyId });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity_log', legacyId] });
    },
  });
}
