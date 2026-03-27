// src/hooks/useHattieEntries.ts
// Fehlender Hook aus Phase-4-Analyse.
// HattieChallenge.tsx braucht "HattieEntries" — das sind challenges
// mit prediction/actual_result (Hattie = Selbsteinschätzung vs. Ergebnis).
// Die Daten kommen aus der challenges-Tabelle.

import { useMemo } from 'react';
import { useChallenges, useCreateChallenge, useUpdateChallenge } from './useChallenges';

export interface HattieEntry {
  id: number;
  date: string;
  subject: string;
  task: string;
  prediction: number;
  actualResult: number | null;
  outcome: string | null;
  reflection: string | null;
  completed: boolean;
  xpEarned: number;
}

export interface HattieStats {
  totalEntries: number;
  completedEntries: number;
  averagePrediction: number;
  averageResult: number;
  accuracy: number; // Wie nah Prediction an Result (0-100%)
}

export function useHattieEntries() {
  const { data: challenges, ...rest } = useChallenges();

  const entries = useMemo((): HattieEntry[] => {
    if (!challenges) return [];
    return challenges.map((c) => ({
      id: c.id,
      date: c.challenge_date,
      subject: c.subject,
      task: c.task_description ?? '',
      prediction: c.prediction,
      actualResult: c.actual_result,
      outcome: c.outcome,
      reflection: c.reflection,
      completed: c.completed,
      xpEarned: c.xp_earned,
    }));
  }, [challenges]);

  return { data: entries, ...rest };
}

export function useHattieStats() {
  const { data: entries, ...rest } = useHattieEntries();

  const stats = useMemo((): HattieStats => {
    if (!entries || entries.length === 0) {
      return {
        totalEntries: 0,
        completedEntries: 0,
        averagePrediction: 0,
        averageResult: 0,
        accuracy: 0,
      };
    }

    const completed = entries.filter((e) => e.completed && e.actualResult !== null);
    const avgPrediction =
      completed.length > 0
        ? completed.reduce((sum, e) => sum + e.prediction, 0) / completed.length
        : 0;
    const avgResult =
      completed.length > 0
        ? completed.reduce((sum, e) => sum + (e.actualResult ?? 0), 0) / completed.length
        : 0;

    // Accuracy: 100% wenn prediction == actual, weniger bei Abweichung
    const accuracy =
      completed.length > 0
        ? completed.reduce((sum, e) => {
            const diff = Math.abs(e.prediction - (e.actualResult ?? 0));
            const maxDiff = 10; // Skala 1-10
            return sum + Math.max(0, 100 - (diff / maxDiff) * 100);
          }, 0) / completed.length
        : 0;

    return {
      totalEntries: entries.length,
      completedEntries: completed.length,
      averagePrediction: Math.round(avgPrediction * 10) / 10,
      averageResult: Math.round(avgResult * 10) / 10,
      accuracy: Math.round(accuracy),
    };
  }, [entries]);

  return { data: stats, ...rest };
}

// Re-Export der Mutations aus useChallenges
export { useCreateChallenge as useCreateHattieEntry } from './useChallenges';
export { useUpdateChallenge as useUpdateHattieEntry } from './useChallenges';
