// src/hooks/index.ts
// Barrel-Export aller Daten-Hooks (Phase 3)

// P0 — Karte-Core
export {
  useIslandProgress,
  useIslandProgressById,
  useCompleteIslandAction,
} from './useIslandProgress';

export {
  useCollectedTreasures,
  useTreasuresByIsland,
  useCollectTreasure,
} from './useCollectedTreasures';

// P1 — Inseln + Schiffe
export {
  useChallenges,
  useOpenChallenges,
  useCreateChallenge,
  useUpdateChallenge,
} from './useChallenges';

export {
  usePolarsternGoals,
  useActiveGoals,
  useCreateGoal,
  useUpdateGoal,
  useAchieveGoal,
} from './usePolarsternGoals';

export {
  useBanduraEntries,
  useTodaysBanduraEntries,
  useBanduraStreak,
  useCreateBanduraEntry,
} from './useBanduraEntries';

// P2 — Gamification
export {
  useArenaProgress,
  useSaveArenaProgress,
} from './useArenaProgress';

export { useUserBadges } from './useUserBadges';

export {
  useActivityLog,
  useActivityHeatmap,
  useLogActivity,
} from './useActivityLog';

export {
  useWortschmiedeProgress,
  useSaveWortschmiedeProgress,
  useWordStats,
  useDueWords,
  useSaveWordStat,
} from './useWortschmiede';

// Phase 4a — Hero + Hattie
export { useHeroData } from './useHeroData';
export type { HeroData } from './useHeroData';

export {
  useHattieEntries,
  useHattieStats,
  useCreateHattieEntry,
  useUpdateHattieEntry,
} from './useHattieEntries';
export type { HattieEntry, HattieStats } from './useHattieEntries';

// Phase 4b — Lerngruppen + Meetings
export { useMyGroup, useLearningGroups, useGroupMembers, useGroupMessages, useSendMessage } from './useLearningGroups';
export type { LearningGroup, GroupMember, GroupMessage } from './useLearningGroups';

export { useScheduledMeetings, useNextMeeting, useMeetingParticipants, useJitsiJwt, useJoinMeeting, useLeaveMeeting } from './useMeetingData';
export type { ScheduledMeeting, MeetingParticipant } from './useMeetingData';

// Phase 4c — Lerntechniken
export { useLearnstratProgress } from './useLearnstratProgress';

// Phase 4d — Lernkarten
export {
  useLernkartenDecks,
  useCreateDeck,
  useRenameDeck,
  useDeleteDeck,
  useLernkartenCards,
  useAddCard,
  useAddCardsBulk,
  useDeleteCard,
  useReviewCard,
  useDueCards,
  useLernkartenDueCount,
} from './useLernkarten';
export type { LernkartenDeck, LernkartenCard } from './useLernkarten';

// Auth (Phase 2)
export { useLegacyUserId } from './useLegacyUserId';
