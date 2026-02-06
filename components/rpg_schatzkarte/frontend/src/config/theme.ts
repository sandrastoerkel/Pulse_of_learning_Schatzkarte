/**
 * Theme & Styling Konstanten
 *
 * Core design tokens synced with design-tokens.css
 * Three-layer token system: UI (chrome), Feedback (rewards), Map (world)
 *
 * NOTE: This is a simplified version for non-Schatzkammer components.
 * Schatzkammer components should import from '../../constants' or '../constants'
 */

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

// =============================================================================
// ANIMATIONEN — Redesigned: no infinite decorative loops
// =============================================================================

/**
 * CSS Keyframe-Namen
 */
export const ANIMATIONS = {
  shimmer: 'shimmer',
  fadeIn: 'fadeIn',
  slideUp: 'slideUp',
  scaleIn: 'scaleIn',
} as const;

/**
 * Animation Durations (in ms)
 */
export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;
