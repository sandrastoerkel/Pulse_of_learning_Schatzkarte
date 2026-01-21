// ============================================
// QuestModal - Barrel Export
// Pfad: src/components/QuestModal/index.ts
// ============================================

// Main Component
export { QuestModal } from './QuestModal';
export { default } from './QuestModal';

// Types
export type {
  QuestModalProps,
  ExtendedIsland,
  TutorialStep,
  QuestTypeDefinition,
  QuestTypesMap,
  EarnedReward,
  IslandSubtitleInfo
} from './QuestModalTypes';

// Constants
export { QUEST_TYPES, ISLAND_SUBTITLES } from './QuestModalConstants';

// Hooks
export { useExpandableSections, useSelfcheck, useQuestProgress } from './hooks';

// Utils
export { markdownToHtml } from './utils';

// Sub-Components (für erweiterte Nutzung)
export {
  QuestHeader,
  QuestCard,
  QuestGrid,
  TreasureSection,
  RewardPopup,
  ProgressFooter,
  ScrollContent,
  SelfcheckSection,
  IslandRouter,
  ISLANDS_WITH_EXPERIENCE,
  hasIslandExperience
} from './components';
