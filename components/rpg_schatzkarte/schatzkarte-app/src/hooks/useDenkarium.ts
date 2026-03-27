// ============================================
// Denkarium Hooks
// For: Denkarium Brain Gym component
// Tables: denkarium_progress, denkarium_exercises, denkarium_sessions
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useLegacyUserId } from './useLegacyUserId';
import { useAuth } from '@/contexts/AuthContext';
import { useAwardXP } from './useAwardXP';

// ─── Types ───────────────────────────────────────────────────────────────────

export type DenkariumStation = 'loci' | 'association' | 'focus' | 'chunking' | 'visual';
export type ChildRating = 'blackout' | 'hard' | 'okay' | 'good' | 'perfect';

const RATING_TO_QUALITY: Record<ChildRating, number> = {
  blackout: 0, hard: 2, okay: 3, good: 4, perfect: 5,
};

const XP_PER_RATING: Record<ChildRating, number> = {
  blackout: 5, hard: 10, okay: 20, good: 35, perfect: 50,
};

export interface DenkariumProgress {
  id: string;
  user_id: string;
  station: DenkariumStation;
  max_level: number;
  total_xp: number;
  sessions_completed: number;
  last_session_at: string | null;
}

export interface DenkariumExercise {
  id: string;
  user_id: string;
  station: DenkariumStation;
  level: number;
  exercise_title: string;
  interval_days: number;
  repetitions: number;
  ease_factor: number;
  next_review: string;
  last_review: string | null;
  total_xp: number;
  times_practiced: number;
  best_score: number | null;
}

export interface DenkariumSession {
  id: string;
  user_id: string;
  station: DenkariumStation;
  level: number;
  exercise_title: string;
  rating: ChildRating;
  quality: number;
  xp_earned: number;
  score: number | null;
  completed_at: string;
}

// ─── SM-2 Algorithm ──────────────────────────────────────────────────────────

function sm2Review(exercise: DenkariumExercise, quality: number): Partial<DenkariumExercise> {
  let interval = exercise.interval_days;
  let repetitions = exercise.repetitions;
  let easeFactor = exercise.ease_factor;

  if (quality >= 3) {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions++;
  } else {
    repetitions = 0;
    interval = 1;
  }

  easeFactor = Math.max(1.5, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

  const next = new Date();
  next.setDate(next.getDate() + interval);

  return {
    interval_days: interval,
    repetitions,
    ease_factor: Math.round(easeFactor * 100) / 100,
    next_review: next.toISOString(),
    last_review: new Date().toISOString(),
    times_practiced: exercise.times_practiced + 1,
  };
}

// ─── Progress Hooks ──────────────────────────────────────────────────────────

export function useDenkariumProgress() {
  const userId = useLegacyUserId();

  return useQuery({
    queryKey: ['denkarium-progress', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('denkarium_progress')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return (data ?? []) as DenkariumProgress[];
    },
    enabled: !!userId,
  });
}

export function useStationProgress(station: DenkariumStation | null) {
  const userId = useLegacyUserId();

  return useQuery({
    queryKey: ['denkarium-progress', userId, station],
    queryFn: async () => {
      if (!userId || !station) return null;

      const { data, error } = await supabase
        .from('denkarium_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('station', station)
        .maybeSingle();

      if (error) throw error;
      return data as DenkariumProgress | null;
    },
    enabled: !!userId && !!station,
  });
}

// ─── Exercise Hooks ──────────────────────────────────────────────────────────

export function useDueExercises(station?: DenkariumStation) {
  const userId = useLegacyUserId();

  return useQuery({
    queryKey: ['denkarium-due', userId, station],
    queryFn: async () => {
      if (!userId) return [];

      let query = supabase
        .from('denkarium_exercises')
        .select('*')
        .eq('user_id', userId)
        .lte('next_review', new Date().toISOString())
        .order('next_review', { ascending: true });

      if (station) {
        query = query.eq('station', station);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as DenkariumExercise[];
    },
    enabled: !!userId,
  });
}

export function useDenkariumDueCount() {
  const userId = useLegacyUserId();

  return useQuery({
    queryKey: ['denkarium-due-count', userId],
    queryFn: async () => {
      if (!userId) return 0;

      const { count, error } = await supabase
        .from('denkarium_exercises')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .lte('next_review', new Date().toISOString());

      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!userId,
  });
}

// ─── Complete Exercise (SM-2 review + session log + progress update) ─────────

export function useCompleteExercise() {
  const queryClient = useQueryClient();
  const userId = useLegacyUserId();
  const { profile } = useAuth();
  const { awardXP } = useAwardXP();

  return useMutation({
    mutationFn: async ({
      station,
      level,
      exerciseTitle,
      rating,
      score,
    }: {
      station: DenkariumStation;
      level: number;
      exerciseTitle: string;
      rating: ChildRating;
      score?: number;
    }) => {
      if (!userId) throw new Error('Not authenticated');

      const quality = RATING_TO_QUALITY[rating];
      const xpEarned = XP_PER_RATING[rating];

      // 1. Upsert exercise (create if first time, update SM-2 if existing)
      const { data: existing } = await supabase
        .from('denkarium_exercises')
        .select('*')
        .eq('user_id', userId)
        .eq('station', station)
        .eq('level', level)
        .eq('exercise_title', exerciseTitle)
        .maybeSingle();

      if (existing) {
        const updates = sm2Review(existing, quality);
        await supabase
          .from('denkarium_exercises')
          .update({
            ...updates,
            total_xp: existing.total_xp + xpEarned,
            best_score: score != null ? Math.max(existing.best_score ?? 0, score) : existing.best_score,
          })
          .eq('id', existing.id);
      } else {
        const next = new Date();
        next.setDate(next.getDate() + (quality >= 3 ? 1 : 0));

        await supabase
          .from('denkarium_exercises')
          .insert({
            user_id: userId,
            station,
            level,
            exercise_title: exerciseTitle,
            interval_days: quality >= 3 ? 1 : 0,
            repetitions: quality >= 3 ? 1 : 0,
            ease_factor: 2.5,
            next_review: next.toISOString(),
            last_review: new Date().toISOString(),
            total_xp: xpEarned,
            times_practiced: 1,
            best_score: score ?? null,
          });
      }

      // 2. Log session
      await supabase
        .from('denkarium_sessions')
        .insert({
          user_id: userId,
          station,
          level,
          exercise_title: exerciseTitle,
          rating,
          quality,
          xp_earned: xpEarned,
          score: score ?? null,
        });

      // 3. Upsert station progress
      const { data: progress } = await supabase
        .from('denkarium_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('station', station)
        .maybeSingle();

      if (progress) {
        await supabase
          .from('denkarium_progress')
          .update({
            max_level: Math.max(progress.max_level, level),
            total_xp: progress.total_xp + xpEarned,
            sessions_completed: progress.sessions_completed + 1,
            last_session_at: new Date().toISOString(),
          })
          .eq('id', progress.id);
      } else {
        await supabase
          .from('denkarium_progress')
          .insert({
            user_id: userId,
            station,
            max_level: level,
            total_xp: xpEarned,
            sessions_completed: 1,
            last_session_at: new Date().toISOString(),
          });
      }

      return { xpEarned, quality, rating };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['denkarium-progress'] });
      queryClient.invalidateQueries({ queryKey: ['denkarium-due'] });
      queryClient.invalidateQueries({ queryKey: ['denkarium-due-count'] });
      // XP in profiles.xp_total schreiben
      if (profile?.id && data.xpEarned) {
        awardXP(profile.id, data.xpEarned);
      }
    },
  });
}

// ─── Session History ─────────────────────────────────────────────────────────

export function useDenkariumSessions(station?: DenkariumStation, limit = 20) {
  const userId = useLegacyUserId();

  return useQuery({
    queryKey: ['denkarium-sessions', userId, station, limit],
    queryFn: async () => {
      if (!userId) return [];

      let query = supabase
        .from('denkarium_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(limit);

      if (station) {
        query = query.eq('station', station);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as DenkariumSession[];
    },
    enabled: !!userId,
  });
}
