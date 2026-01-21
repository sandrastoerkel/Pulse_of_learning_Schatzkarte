// ============================================
// QuestModal - useQuestProgress Hook
// Pfad: src/components/QuestModal/hooks/useQuestProgress.ts
// ============================================

import { useState, useCallback, useMemo } from 'react';
import type { QuestType, IslandProgress } from '../../../types';
import type { EarnedReward } from '../QuestModalTypes';
import { QUEST_TYPES } from '../QuestModalConstants';

interface UseQuestProgressProps {
  progress?: IslandProgress;
  onQuestComplete: (questType: string, xp: number, gold?: number, itemId?: string) => void;
}

interface UseQuestProgressReturn {
  activeQuest: QuestType | null;
  showReward: boolean;
  earnedReward: EarnedReward;
  quizActive: boolean;
  powertechnikenActive: boolean;
  transferChallengeActive: boolean;
  showHeaderInfo: boolean;
  setActiveQuest: (quest: QuestType | null) => void;
  setQuizActive: (active: boolean) => void;
  setPowertechnikenActive: (active: boolean) => void;
  setTransferChallengeActive: (active: boolean) => void;
  setShowHeaderInfo: (show: boolean) => void;
  handleStartQuest: (questType: QuestType) => void;
  handleCompleteQuest: (questType: QuestType) => void;
  isQuestComplete: (questType: keyof typeof QUEST_TYPES) => boolean;
  allQuestsComplete: boolean;
  collectedTreasures: string[];
}

/**
 * Hook für die Verwaltung des Quest-Fortschritts und -Zustands
 */
export function useQuestProgress({
  progress,
  onQuestComplete
}: UseQuestProgressProps): UseQuestProgressReturn {
  const [activeQuest, setActiveQuest] = useState<QuestType | null>(null);
  const [showReward, setShowReward] = useState(false);
  const [earnedReward, setEarnedReward] = useState<EarnedReward>({ xp: 0, gold: 0 });
  const [quizActive, setQuizActive] = useState(false);
  const [powertechnikenActive, setPowertechnikenActive] = useState(false);
  const [transferChallengeActive, setTransferChallengeActive] = useState(false);
  const [showHeaderInfo, setShowHeaderInfo] = useState(false);

  // Prüfen ob Quest abgeschlossen
  const isQuestComplete = useCallback((questType: keyof typeof QUEST_TYPES) => {
    if (!progress) return false;
    const key = QUEST_TYPES[questType].progressKey;
    return progress[key] === true;
  }, [progress]);

  // Alle Quests abgeschlossen?
  const allQuestsComplete = useMemo(() => {
    return (
      isQuestComplete('wisdom') &&
      isQuestComplete('scroll') &&
      isQuestComplete('battle') &&
      isQuestComplete('challenge')
    );
  }, [isQuestComplete]);

  // Gesammelte Schätze
  const collectedTreasures = useMemo(() => {
    return progress?.treasures_collected || [];
  }, [progress]);

  // Quest starten
  const handleStartQuest = useCallback((questType: QuestType) => {
    setActiveQuest(questType);
  }, []);

  // Quest abschließen
  const handleCompleteQuest = useCallback((questType: QuestType) => {
    const quest = QUEST_TYPES[questType];
    setEarnedReward({ xp: quest.xp, gold: quest.gold });
    setShowReward(true);
    onQuestComplete(questType, quest.xp, quest.gold);

    setTimeout(() => {
      setShowReward(false);
      setActiveQuest(null);
    }, 2000);
  }, [onQuestComplete]);

  return {
    activeQuest,
    showReward,
    earnedReward,
    quizActive,
    powertechnikenActive,
    transferChallengeActive,
    showHeaderInfo,
    setActiveQuest,
    setQuizActive,
    setPowertechnikenActive,
    setTransferChallengeActive,
    setShowHeaderInfo,
    handleStartQuest,
    handleCompleteQuest,
    isQuestComplete,
    allQuestsComplete,
    collectedTreasures
  };
}

export default useQuestProgress;
