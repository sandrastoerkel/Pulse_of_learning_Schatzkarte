// src/hooks/useHeroData.ts
// Ersetzt: hero_to_react_format() aus __init__.py
// Berechnet Level, XP, Streak client-seitig aus dem Profil.

import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';

export interface HeroData {
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  xpProgress: number; // 0-1 Fortschritt zum nächsten Level
  currentStreak: number;
  longestStreak: number;
}

// XP-Tabelle: Level N braucht N*100 XP (kumulativ)
// Level 1: 0 XP, Level 2: 100 XP, Level 3: 300 XP, Level 4: 600 XP, ...
function calculateLevel(totalXp: number): {
  level: number;
  xpInCurrentLevel: number;
  xpToNextLevel: number;
} {
  let level = 1;
  let xpNeeded = 100;
  let xpRemaining = totalXp;

  while (xpRemaining >= xpNeeded) {
    xpRemaining -= xpNeeded;
    level++;
    xpNeeded = level * 100;
  }

  return {
    level,
    xpInCurrentLevel: xpRemaining,
    xpToNextLevel: xpNeeded,
  };
}

export function useHeroData(): HeroData | null {
  const { profile } = useAuth();

  return useMemo(() => {
    if (!profile) return null;

    const { level, xpInCurrentLevel, xpToNextLevel } = calculateLevel(
      profile.xp_total
    );

    return {
      name: profile.display_name,
      level,
      xp: profile.xp_total,
      xpToNextLevel,
      xpProgress: xpToNextLevel > 0 ? xpInCurrentLevel / xpToNextLevel : 0,
      currentStreak: profile.current_streak,
      longestStreak: profile.longest_streak,
    };
  }, [profile]);
}
