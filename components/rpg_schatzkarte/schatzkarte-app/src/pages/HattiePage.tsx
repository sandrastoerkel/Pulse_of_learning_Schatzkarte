// src/pages/HattiePage.tsx
// Page-Wrapper: Hooks → HattieChallenge (presentational)

import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useHattieEntries, useCreateHattieEntry, useUpdateHattieEntry, useAwardXP } from '@/hooks';
import { HattieChallenge } from '@/components/challenges/HattieChallenge';
import type { HattieSubjectId, HattieEntry as UIHattieEntry, HattieStats as UIHattieStats } from '@/types/hattieTypes';
import { DEFAULT_HATTIE_STATS } from '@/types/hattieTypes';
import type { HattieEntry as HookHattieEntry } from '@/hooks/useHattieEntries';

// ─── Mapper: hook HattieEntry[] → hattieTypes.HattieEntry[] ────────────────
//
// Field mapping summary:
//   DIRECT:   subject (cast), task, prediction, reflection, xp_earned
//   COMPUTED: id (number→string), status (from completed), result (null→undefined),
//             exceeded (actualResult vs prediction), difference (actualResult - prediction),
//             created_at (from date)
//   DEFAULT:  predictionType ('note'), completed_at (undefined), test_date (undefined)
//
function mapEntries(hookEntries: HookHattieEntry[]): UIHattieEntry[] {
  return hookEntries.map(e => {
    const completed = e.completed && e.actualResult !== null;
    return {
      id: String(e.id),                                     // COMPUTED: number → string
      subject: e.subject as HattieSubjectId,                // DIRECT: string → typed union
      task: e.task,                                         // DIRECT
      predictionType: 'note' as const,                      // DEFAULT: DB hat kein predictionType-Feld
      prediction: e.prediction,                             // DIRECT
      status: e.completed ? 'completed' as const : 'pending' as const, // COMPUTED: from boolean
      result: e.actualResult ?? undefined,                  // COMPUTED: null → undefined
      exceeded: completed                                   // COMPUTED: actualResult < prediction (Note: kleiner = besser)
        ? (e.actualResult! < e.prediction)
        : undefined,
      difference: completed                                 // COMPUTED: prediction - actualResult (bei Note)
        ? (e.prediction - e.actualResult!)
        : undefined,
      reflection: e.reflection ?? undefined,                // DIRECT: null → undefined
      xp_earned: e.xpEarned || undefined,                   // DIRECT: 0 → undefined
      completed_at: undefined,                              // DEFAULT: nicht in DB-Hook vorhanden
      test_date: undefined,                                 // DEFAULT: nicht in DB-Hook vorhanden
      created_at: e.date,                                   // COMPUTED: hook.date → ui.created_at
    };
  });
}

// ─── Mapper: UI entries → UIHattieStats ─────────────────────────────────────
//
// Field mapping summary:
//   COMPUTED: total_entries, pending_entries, completed_entries, exceeded_count,
//            exact_count, success_rate, accuracy_rate, avg_difference,
//            entries_per_subject, total_xp, level
//   DEFAULT: current_streak (0), longest_streak (0), best_subject (null)
//
// Note: Streak-Berechnung braucht Datumsinformationen, die der Hook nicht
// ausreichend liefert. Daher vorerst 0. best_subject wird aus entries berechnet.
//
function computeStats(entries: UIHattieEntry[]): UIHattieStats {
  if (entries.length === 0) return DEFAULT_HATTIE_STATS;

  const completed = entries.filter(e => e.status === 'completed' && e.result !== undefined);
  const pending = entries.filter(e => e.status === 'pending');

  // COMPUTED: exceeded = result < prediction (bei Noten: kleiner = besser)
  const exceeded = completed.filter(e => e.exceeded);

  // COMPUTED: exact = result === prediction
  const exact = completed.filter(e => e.result === e.prediction);

  // COMPUTED: average difference
  const avgDiff = completed.length > 0
    ? completed.reduce((sum, e) => sum + Math.abs(e.difference ?? 0), 0) / completed.length
    : 0;

  // COMPUTED: entries per subject
  const perSubject: Partial<Record<HattieSubjectId, number>> = {};
  entries.forEach(e => {
    perSubject[e.subject] = (perSubject[e.subject] ?? 0) + 1;
  });

  // COMPUTED: best subject (most entries)
  let bestSubject: HattieSubjectId | null = null;
  let maxCount = 0;
  for (const [subj, count] of Object.entries(perSubject)) {
    if ((count ?? 0) > maxCount) {
      maxCount = count ?? 0;
      bestSubject = subj as HattieSubjectId;
    }
  }

  // COMPUTED: total XP
  const totalXp = entries.reduce((sum, e) => sum + (e.xp_earned ?? 0), 0);

  // COMPUTED: level from XP thresholds (mirrors HattieChallenge LEVEL_INFO)
  let level = 1;
  const thresholds = [0, 30, 80, 150, 250, 400, 600, 1000];
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (totalXp >= thresholds[i]) { level = i + 1; break; }
  }

  return {
    total_entries: entries.length,                           // COMPUTED: array length
    pending_entries: pending.length,                         // COMPUTED: filtered count
    completed_entries: completed.length,                     // COMPUTED: filtered count
    exceeded_count: exceeded.length,                         // COMPUTED: filtered count
    exact_count: exact.length,                               // COMPUTED: filtered count
    success_rate: completed.length > 0                       // COMPUTED: exceeded / completed * 100
      ? Math.round((exceeded.length / completed.length) * 100)
      : 0,
    accuracy_rate: completed.length > 0                      // COMPUTED: exact / completed * 100
      ? Math.round((exact.length / completed.length) * 100)
      : 0,
    avg_difference: Math.round(avgDiff * 10) / 10,          // COMPUTED: average |difference|
    current_streak: 0,                                       // DEFAULT: braucht Datumslogik
    longest_streak: 0,                                       // DEFAULT: braucht Datumslogik
    best_subject: bestSubject,                               // COMPUTED: subject with most entries
    entries_per_subject: perSubject,                          // COMPUTED: counted above
    total_xp: totalXp,                                       // COMPUTED: sum of xp_earned
    level,                                                   // COMPUTED: from thresholds
  };
}

export default function HattiePage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: rawEntries = [] } = useHattieEntries();
  const createChallenge = useCreateHattieEntry();
  const updateChallenge = useUpdateHattieEntry();
  const { awardXP } = useAwardXP();

  const entries = rawEntries.length > 0
    ? mapEntries(rawEntries)
    : [];
  const stats = computeStats(entries);

  return (
    <HattieChallenge
      entries={entries}
      stats={stats}
      userName={profile?.display_name ?? 'Lern-Held'}
      onNewPrediction={(entry) => {
        // entry = Omit<HattieEntry, 'id' | 'created_at'>
        // → ChallengeInsert: { challenge_date, subject, task_description, prediction }
        createChallenge.mutate({
          challenge_date: new Date().toISOString().split('T')[0],
          subject: entry.subject,                // DIRECT: HattieSubjectId → string
          task_description: entry.task,           // DIRECT: task → task_description
          prediction: entry.prediction,           // DIRECT
        });
      }}
      onCompleteEntry={(entryId, result, reflection) => {
        // → ChallengeUpdate & { id }: { id, actual_result, reflection, completed }
        const xp = 50; // Base-XP fuer Challenge-Abschluss (wie gamification_db.py)
        updateChallenge.mutate({
          id: Number(entryId),                   // COMPUTED: string → number
          actual_result: result,                 // DIRECT
          reflection,                            // DIRECT
          completed: true,                       // HARDCODED: completing = true
          xp_earned: xp,
        }, {
          onSuccess: () => {
            if (profile?.id) awardXP(profile.id, xp);
          },
        });
      }}
      onClose={() => navigate('/karte')}
    />
  );
}
