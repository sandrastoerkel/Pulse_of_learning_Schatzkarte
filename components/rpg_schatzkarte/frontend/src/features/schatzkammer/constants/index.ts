/**
 * Constants - Zentrale Exports
 */

// Artefakt-Typen
export {
  ARTIFACT_CONFIGS,
  ARTIFACT_TYPES,
  DEFAULT_ARTIFACT_TYPE,
  ARTIFACT_ICON_SUGGESTIONS,
  getArtifactConfig,
} from './artifacts';

// Raum-Templates
export {
  ROOM_TEMPLATES,
  TEMPLATE_IDS,
  DEFAULT_TEMPLATE,
  getTemplate,
  getTemplateSlots,
  findSlot,
  getTemplatesByAgeGroup,
} from './templates';

// Theme & Styling
export {
  GOLD,
  DARK,
  STATUS_COLORS,
  COLOR_TAGS,
  COLOR_TAG_OPTIONS,
  XP_CONFIG,
  calculateJourneyXp,
  REVIEW_INTERVALS,
  REVIEW_THRESHOLD_DAYS,
  needsReview,
  ANIMATIONS,
  ANIMATION_DURATIONS,
  KEYFRAMES,
  ROOM_VIEWPORT,
  DEFAULT_SLOT_SIZE,
  MODAL_SIZES,
  Z_INDEX,
  STATUS_LABELS,
  STATUS_EMOJIS,
  getResultEmoji,
  getResultMessage,
} from './theme';
