// src/hooks/useBanduraEntries.ts
// P1 — Bandura-Schiff + Streak-Berechnung
// Ersetzt: bandura_sources_widget.py:335-420 → mehrere SELECTs auf bandura_entries

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useLegacyUserId } from './useLegacyUserId';
import type { BanduraEntry, BanduraEntryInsert } from '../types/database';

// ─── Query: Letzte 90 Tage Einträge ────────────────────────────────────────

export function useBanduraEntries(days = 90) {
  const legacyId = useLegacyUserId();

  return useQuery({
    queryKey: ['bandura_entries', legacyId, days],
    queryFn: async (): Promise<BanduraEntry[]> => {
      const { data, error } = await supabase
        .from('bandura_entries')
        .select('*')
        .eq('user_id', legacyId!)
        .order('entry_date', { ascending: false })
        .limit(days);

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!legacyId,
    staleTime: 1000 * 60 * 2,
  });
}

// ─── Query: Heutige Einträge ────────────────────────────────────────────────

export function useTodaysBanduraEntries() {
  const legacyId = useLegacyUserId();
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  return useQuery({
    queryKey: ['bandura_entries', legacyId, 'today', today],
    queryFn: async (): Promise<BanduraEntry[]> => {
      const { data, error } = await supabase
        .from('bandura_entries')
        .select('*')
        .eq('user_id', legacyId!)
        .eq('entry_date', today);

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!legacyId,
    staleTime: 1000 * 60, // 1 Minute
  });
}

// ─── Derived: Bandura-Streak berechnen ──────────────────────────────────────

export function useBanduraStreak() {
  const { data: entries, ...rest } = useBanduraEntries();

  let streak = 0;
  if (entries && entries.length > 0) {
    // Unique Tage extrahieren (absteigend sortiert)
    const uniqueDates = [...new Set(entries.map((e) => e.entry_date))].sort().reverse();
    const today = new Date();

    for (let i = 0; i < uniqueDates.length; i++) {
      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);
      const expectedStr = expected.toISOString().slice(0, 10);

      if (uniqueDates[i] === expectedStr) {
        streak++;
      } else {
        break;
      }
    }
  }

  return { data: streak, ...rest };
}

// ─── Mutation: Neuer Bandura-Eintrag ────────────────────────────────────────

export function useCreateBanduraEntry() {
  const legacyId = useLegacyUserId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: Omit<BanduraEntryInsert, 'user_id'>) => {
      if (!legacyId) throw new Error('Nicht eingeloggt');

      const { data, error } = await supabase
        .from('bandura_entries')
        .insert({ ...entry, user_id: legacyId })
        .select()
        .single();

      if (error) throw error;
      return data as BanduraEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bandura_entries', legacyId] });
    },
  });
}
