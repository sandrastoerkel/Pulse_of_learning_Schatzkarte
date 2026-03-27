// src/hooks/usePolarsternGoals.ts
// P1 — Polarstern-Insel
// Ersetzt: polarstern_widget.py:315 → db.table("polarstern_goals").select("*").eq("user_id", user_id).order("created_at", desc=True)

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useLegacyUserId } from './useLegacyUserId';
import type { PolarsternGoal, PolarsternGoalInsert } from '../types/database';

// ─── Query: Alle Ziele laden ────────────────────────────────────────────────

export function usePolarsternGoals() {
  const legacyId = useLegacyUserId();

  return useQuery({
    queryKey: ['polarstern_goals', legacyId],
    queryFn: async (): Promise<PolarsternGoal[]> => {
      const { data, error } = await supabase
        .from('polarstern_goals')
        .select('*')
        .eq('user_id', legacyId!)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!legacyId,
    staleTime: 1000 * 60 * 2,
  });
}

// ─── Derived: Nur aktive Ziele ──────────────────────────────────────────────

export function useActiveGoals() {
  const { data: goals, ...rest } = usePolarsternGoals();
  const active = (goals ?? []).filter((g) => g.is_active && !g.is_achieved);
  return { data: active, ...rest };
}

// ─── Mutation: Neues Ziel erstellen ─────────────────────────────────────────

export function useCreateGoal() {
  const legacyId = useLegacyUserId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goal: Omit<PolarsternGoalInsert, 'user_id'>) => {
      if (!legacyId) throw new Error('Nicht eingeloggt');

      const { data, error } = await supabase
        .from('polarstern_goals')
        .insert({ ...goal, user_id: legacyId })
        .select()
        .single();

      if (error) throw error;
      return data as PolarsternGoal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polarstern_goals', legacyId] });
    },
  });
}

// ─── Mutation: Ziel updaten ─────────────────────────────────────────────────

export function useUpdateGoal() {
  const legacyId = useLegacyUserId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...update
    }: Partial<PolarsternGoal> & { id: number }) => {
      const { error } = await supabase
        .from('polarstern_goals')
        .update({ ...update, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polarstern_goals', legacyId] });
    },
  });
}

// ─── Mutation: Ziel als erreicht markieren ──────────────────────────────────

export function useAchieveGoal() {
  const legacyId = useLegacyUserId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      reflection,
      xpEarned = 50,
    }: {
      id: number;
      reflection?: string;
      xpEarned?: number;
    }) => {
      const { error } = await supabase
        .from('polarstern_goals')
        .update({
          is_achieved: true,
          achieved_at: new Date().toISOString(),
          achievement_reflection: reflection ?? null,
          xp_earned: xpEarned,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polarstern_goals', legacyId] });
    },
  });
}
