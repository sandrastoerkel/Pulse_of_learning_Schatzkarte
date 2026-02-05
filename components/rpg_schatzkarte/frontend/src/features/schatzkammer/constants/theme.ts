/**
 * Theme & Styling Konstanten
 * 
 * Zentrale Definition aller Farben, Animationen und Konfigurationswerte
 * für konsistentes Schatzkarte-Design.
 */

import type { RecallStatus, ColorTag, StatusColors, XpConfig } from '../types';

// =============================================================================
// FARBEN
// =============================================================================

/**
 * Primäre Gold-Palette (Schatzkarte-Branding)
 */
export const GOLD = {
  light: '#FFE066',
  primary: '#FFD700',
  dark: '#FFA500',
  darker: '#CC8400',
  gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
  gradientReverse: 'linear-gradient(135deg, #FFA500 0%, #FFD700 100%)',
  glow: '0 0 20px rgba(255, 215, 0, 0.5)',
  glowStrong: '0 0 30px rgba(255, 215, 0, 0.7)',
} as const;

/**
 * Dunkle Hintergrund-Palette
 */
export const DARK = {
  deepest: '#0a0a14',
  deep: '#12121e',
  base: '#1a1a2e',
  elevated: '#2a2a4e',
  surface: '#3a3a5e',
  border: '#4a4a6e',
} as const;

/**
 * Status-Farben für Recall-Ergebnisse
 */
export const STATUS_COLORS: StatusColors = {
  mastered: '#22c55e',      // Grün
  almost: '#f59e0b',        // Orange/Gold
  needsPractice: '#ef4444', // Rot
  neutral: '#6b7280',       // Grau
} as const;

/**
 * Farben für Raum-Tags
 */
export const COLOR_TAGS: Record<ColorTag, { bg: string; border: string; text: string }> = {
  gold: {
    bg: 'rgba(255, 215, 0, 0.15)',
    border: '#FFD700',
    text: '#FFD700',
  },
  ruby: {
    bg: 'rgba(220, 38, 38, 0.15)',
    border: '#dc2626',
    text: '#f87171',
  },
  emerald: {
    bg: 'rgba(16, 185, 129, 0.15)',
    border: '#10b981',
    text: '#34d399',
  },
  sapphire: {
    bg: 'rgba(59, 130, 246, 0.15)',
    border: '#3b82f6',
    text: '#60a5fa',
  },
  amethyst: {
    bg: 'rgba(139, 92, 246, 0.15)',
    border: '#8b5cf6',
    text: '#a78bfa',
  },
  copper: {
    bg: 'rgba(180, 83, 9, 0.15)',
    border: '#b45309',
    text: '#d97706',
  },
} as const;

/**
 * Alle verfügbaren Farb-Tags
 */
export const COLOR_TAG_OPTIONS: ColorTag[] = [
  'gold',
  'ruby',
  'emerald',
  'sapphire',
  'amethyst',
  'copper',
];

// =============================================================================
// XP & GAMIFICATION
// =============================================================================

/**
 * XP-Konfiguration für Selbsteinschätzung
 */
export const XP_CONFIG: XpConfig = {
  mastered: 10,
  almost: 5,
  needsPractice: 2,
  perfectBonus: 25,
  streakBonus: 10,
} as const;

/**
 * Berechnet XP für einen Rundgang
 */
export function calculateJourneyXp(
  results: { status: RecallStatus }[]
): { total: number; breakdown: Record<RecallStatus, number>; isPerfect: boolean } {
  const breakdown: Record<RecallStatus, number> = {
    mastered: 0,
    almost: 0,
    needs_practice: 0,
  };

  results.forEach(r => {
    breakdown[r.status]++;
  });

  const baseXp = 
    breakdown.mastered * XP_CONFIG.mastered +
    breakdown.almost * XP_CONFIG.almost +
    breakdown.needs_practice * XP_CONFIG.needsPractice;

  const isPerfect = results.length > 0 && breakdown.mastered === results.length;
  const total = baseXp + (isPerfect ? XP_CONFIG.perfectBonus : 0);

  return { total, breakdown, isPerfect };
}

// =============================================================================
// SPACED REPETITION
// =============================================================================

/**
 * Tage bis zur empfohlenen Wiederholung basierend auf Status
 */
export const REVIEW_INTERVALS: Record<RecallStatus, number> = {
  mastered: 7,       // 1 Woche
  almost: 3,         // 3 Tage
  needs_practice: 1, // 1 Tag
} as const;

/**
 * Tage nach denen eine Station als "review needed" markiert wird
 */
export const REVIEW_THRESHOLD_DAYS = 3;

/**
 * Prüft ob eine Station wiederholt werden sollte
 */
export function needsReview(
  lastReviewedAt: string | null,
  recallStatus: RecallStatus | null
): boolean {
  if (!lastReviewedAt) return false; // Noch nie geübt = kein Review nötig (erst anlegen)
  if (recallStatus === 'mastered') return false; // Gemeistert = kein Review nötig

  const lastReview = new Date(lastReviewedAt);
  const now = new Date();
  const daysSince = Math.floor((now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24));

  if (!recallStatus) return daysSince >= REVIEW_THRESHOLD_DAYS;
  return daysSince >= REVIEW_INTERVALS[recallStatus];
}

// =============================================================================
// ANIMATIONEN
// =============================================================================

/**
 * CSS Keyframe-Namen
 */
export const ANIMATIONS = {
  shimmer: 'shimmer',
  pulse: 'pulse',
  float: 'float',
  glow: 'glow',
  fadeIn: 'fadeIn',
  slideUp: 'slideUp',
  scaleIn: 'scaleIn',
  flame: 'flame',
} as const;

/**
 * Animation Durations (in ms)
 */
export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
  shimmer: 2000,
  pulse: 1500,
  float: 3000,
} as const;

/**
 * CSS Keyframes für Inline-Styles
 */
export const KEYFRAMES = `
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.05); }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes glow {
    0%, 100% { filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.5)); }
    50% { filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.8)); }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
  
  @keyframes flame {
    0%, 100% { transform: scaleY(1) scaleX(1); }
    25% { transform: scaleY(1.1) scaleX(0.95); }
    50% { transform: scaleY(0.95) scaleX(1.05); }
    75% { transform: scaleY(1.05) scaleX(0.98); }
  }
`;

// =============================================================================
// LAYOUT & SIZING
// =============================================================================

/**
 * Viewport-Dimensionen für den Raum (normalisiert)
 */
export const ROOM_VIEWPORT = {
  width: 1000,
  height: 600,
} as const;

/**
 * Standard-Slot-Größen
 */
export const DEFAULT_SLOT_SIZE = {
  width: 80,
  height: 80,
} as const;

/**
 * Modal-Größen
 */
export const MODAL_SIZES = {
  small: { width: 400, maxHeight: '80vh' },
  medium: { width: 500, maxHeight: '85vh' },
  large: { width: 600, maxHeight: '90vh' },
} as const;

/**
 * Z-Index Schichten
 */
export const Z_INDEX = {
  background: 0,
  slots: 10,
  stations: 20,
  journeyPath: 15,
  selectedStation: 30,
  panel: 100,
  modal: 200,
  tooltip: 300,
} as const;

// =============================================================================
// TEXTE & LABELS
// =============================================================================

/**
 * Status-Labels für UI
 */
export const STATUS_LABELS: Record<RecallStatus, string> = {
  mastered: 'Gemeistert',
  almost: 'Fast',
  needs_practice: 'Üben',
} as const;

/**
 * Status-Emojis
 */
export const STATUS_EMOJIS: Record<RecallStatus, string> = {
  mastered: '😊',
  almost: '🤔',
  needs_practice: '😅',
} as const;

/**
 * Ergebnis-Emojis basierend auf Erfolgsrate
 */
export function getResultEmoji(successRate: number): string {
  if (successRate >= 0.8) return '🏆';
  if (successRate >= 0.5) return '🎉';
  return '💪';
}

/**
 * Ergebnis-Nachrichten
 */
export function getResultMessage(successRate: number): string {
  if (successRate >= 0.8) return 'Hervorragend! Du hast den Raum gemeistert!';
  if (successRate >= 0.5) return 'Gut gemacht! Weiter so!';
  return 'Übung macht den Meister! Versuch es nochmal.';
}
