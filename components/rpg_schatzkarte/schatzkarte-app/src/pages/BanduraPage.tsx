// src/pages/BanduraPage.tsx
// Page-Wrapper: Hooks → BanduraChallenge (presentational)

import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBanduraEntries, useBanduraStreak, useCreateBanduraEntry } from '@/hooks';
import { BanduraChallenge } from '@/components/challenges/BanduraChallenge';
import type { BanduraSourceId, BanduraEntry as UIBanduraEntry, BanduraStats } from '@/types/banduraTypes';
import { DEFAULT_BANDURA_STATS } from '@/types/banduraTypes';
import type { BanduraEntry as DBBanduraEntry } from '@/types/database';

// ─── Mapper: database.BanduraEntry[] → banduraTypes.BanduraEntry[] ──────────
//
// Field mapping summary:
//   DIRECT:   source_type, description, xp_earned
//   COMPUTED: id (number→string), created_at (from entry_date)
//   DROPPED:  user_id (not needed in UI)
//
function mapEntries(dbEntries: DBBanduraEntry[]): UIBanduraEntry[] {
  return dbEntries.map(e => ({
    id: String(e.id),                       // COMPUTED: DB id (number) → string
    source_type: e.source_type as BanduraSourceId, // DIRECT: string → typed union
    description: e.description,             // DIRECT
    created_at: e.entry_date,               // COMPUTED: DB uses entry_date, UI uses created_at
    xp_earned: e.xp_earned,                 // DIRECT
  }));
}

// ─── Mapper: entries + streak → BanduraStats ────────────────────────────────
//
// Field mapping summary:
//   COMPUTED: total_entries, entries_per_source, total_xp, level, all_four_days
//   DIRECT:  current_streak (from useBanduraStreak hook)
//   DEFAULT: longest_streak (hook only tracks current; longest needs separate tracking)
//
function computeStats(entries: UIBanduraEntry[], streak: number): BanduraStats {
  const entriesBySource: Record<BanduraSourceId, number> = {
    mastery: 0, vicarious: 0, persuasion: 0, physiological: 0,
  };
  let totalXp = 0;

  entries.forEach(e => {
    if (entriesBySource[e.source_type] !== undefined) {
      entriesBySource[e.source_type]++;       // COMPUTED: count per source
    }
    totalXp += e.xp_earned;                   // COMPUTED: sum of xp_earned
  });

  // COMPUTED: level from XP thresholds (mirrors BanduraChallenge LEVEL_INFO)
  let level = 1;
  const thresholds = [0, 50, 150, 300, 500, 750, 1000, 1500];
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (totalXp >= thresholds[i]) { level = i + 1; break; }
  }

  // COMPUTED: count days where all 4 sources were used
  const dateSourceMap: Record<string, Set<string>> = {};
  entries.forEach(e => {
    const date = e.created_at.split('T')[0];
    if (!dateSourceMap[date]) dateSourceMap[date] = new Set();
    dateSourceMap[date].add(e.source_type);
  });
  const allFourDays = Object.values(dateSourceMap).filter(s => s.size >= 4).length;

  return {
    total_entries: entries.length,             // COMPUTED: array length
    entries_per_source: entriesBySource,       // COMPUTED: counted above
    current_streak: streak,                   // DIRECT: from useBanduraStreak
    longest_streak: streak,                   // DEFAULT: streak hook only returns current
    total_xp: totalXp,                        // COMPUTED: sum above
    level,                                    // COMPUTED: from thresholds
    all_four_days: allFourDays,               // COMPUTED: counted above
  };
}

export default function BanduraPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: rawEntries = [] } = useBanduraEntries();
  const { data: streak = 0 } = useBanduraStreak();
  const createEntry = useCreateBanduraEntry();

  const entries = rawEntries.length > 0
    ? mapEntries(rawEntries)
    : [];
  const stats = entries.length > 0
    ? computeStats(entries, streak)
    : DEFAULT_BANDURA_STATS;

  return (
    <BanduraChallenge
      entries={entries}
      stats={stats}
      userName={profile?.display_name ?? 'Lern-Held'}
      onNewEntry={(sourceType, description, xp) => {
        createEntry.mutate({
          entry_date: new Date().toISOString().split('T')[0],
          source_type: sourceType,
          description,
          xp_earned: xp,
        });
      }}
      onClose={() => navigate('/karte')}
    />
  );
}
