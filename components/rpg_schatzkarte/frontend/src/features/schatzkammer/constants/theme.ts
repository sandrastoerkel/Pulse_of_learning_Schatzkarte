/**
 * Theme & Styling Konstanten
 * 
 * Redesigned: Synced with design-tokens.css
 * Three-layer token system: UI (chrome), Feedback (rewards), Map (world)
 */

import type { RecallStatus, ColorTag, StatusColors, XpConfig } from '../types';

// =============================================================================
// FARBEN — Synced with design-tokens.css
// =============================================================================

/**
 * UI Chrome Palette (petrol/dark blue)
 * Maps to --ui-* CSS custom properties
 */
export const UI = {
  base: '#0c1a2a',
  surface: '#163045',
  surfaceHover: '#1c3a55',
  border: '#1e3a52',
  text: '#e2e8f0',
  textMuted: '#8899aa',
  textDisabled: '#556677',
  action: '#0ea5e9',
  actionHover: '#38bdf8',
  actionActive: '#0284c7',
  actionSubtle: 'rgba(14, 165, 233, 0.12)',
} as const;

/**
 * Feedback & Reward Palette
 * Maps to --fb-* CSS custom properties
 * IMPORTANT: These colors are EARNED, not decorative
 */
export const FEEDBACK = {
  success: '#34d399',       // emerald — correct, completed
  successSubtle: 'rgba(52, 211, 153, 0.1)',
  reward: '#f59e0b',        // amber — gold earned, XP
  rewardSubtle: 'rgba(245, 158, 11, 0.1)',
  epic: '#a855f7',          // purple — rarest achievements
  epicSubtle: 'rgba(168, 85, 247, 0.12)',
  error: '#ef4444',         // red — wrong, danger
  errorSubtle: 'rgba(239, 68, 68, 0.1)',
} as const;

/**
 * @deprecated Use UI and FEEDBACK instead.
 * Kept for backward compatibility during migration.
 */
export const GOLD = {
  light: FEEDBACK.reward,
  primary: FEEDBACK.reward,
  dark: FEEDBACK.reward,
  darker: '#CC8400',
  gradient: `linear-gradient(135deg, ${FEEDBACK.reward} 0%, ${UI.action} 100%)`,
  gradientReverse: `linear-gradient(135deg, ${UI.action} 0%, ${FEEDBACK.reward} 100%)`,
  glow: `0 0 12px rgba(14, 165, 233, 0.3)`,
  glowStrong: `0 0 20px rgba(14, 165, 233, 0.5)`,
} as const;

/**
 * @deprecated Use UI instead.
 * Kept for backward compatibility during migration.
 */
export const DARK = {
  deepest: UI.base,
  deep: UI.base,
  base: UI.base,
  elevated: UI.surface,
  surface: UI.surfaceHover,
  border: UI.border,
} as const;

/**
 * Status-Farben für Recall-Ergebnisse
 * Synced with --fb-* tokens
 */
export const STATUS_COLORS: StatusColors = {
  mastered: FEEDBACK.success,       // --fb-success
  almost: FEEDBACK.reward,          // --fb-reward
  needsPractice: FEEDBACK.error,    // --fb-error
  neutral: UI.textMuted,            // --ui-text-muted
} as const;

/**
 * Farben für Raum-Tags
 */
export const COLOR_TAGS: Record<ColorTag, { bg: string; border: string; text: string }> = {
  gold: {
    bg: FEEDBACK.rewardSubtle,
    border: FEEDBACK.reward,
    text: FEEDBACK.reward,
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
// ANIMATIONEN — Redesigned: no infinite decorative loops
// =============================================================================

/**
 * CSS Keyframe-Namen
 * REMOVED: pulse, float, glow (were infinite decorative loops)
 * KEPT: triggered transitions only
 */
export const ANIMATIONS = {
  shimmer: 'shimmer',
  fadeIn: 'fadeIn',
  slideUp: 'slideUp',
  scaleIn: 'scaleIn',
} as const;

/**
 * Animation Durations (in ms)
 * Synced with --transition-* tokens
 */
export const ANIMATION_DURATIONS = {
  fast: 150,       // --transition-fast
  normal: 300,     // --transition-base
  slow: 500,       // --transition-slow
} as const;

/**
 * CSS Keyframes für Inline-Styles
 * Only triggered transitions — no infinite loops
 */
export const KEYFRAMES = `
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
  
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
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
