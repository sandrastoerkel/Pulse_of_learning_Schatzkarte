// ============================================
// QuestModal - QuestGrid Component
// Pfad: src/components/QuestModal/components/QuestGrid.tsx
// ============================================

import type { QuestType } from '../../../types';
import type { ExtendedIsland } from '../QuestModalTypes';
import { QUEST_TYPES } from '../QuestModalConstants';
import { QuestCard } from './QuestCard';

interface QuestGridProps {
  island: ExtendedIsland;
  isQuestComplete: (questType: keyof typeof QUEST_TYPES) => boolean;
  onStartQuest: (questType: QuestType) => void;
}

/**
 * Grid aller verfügbaren Quest-Karten
 */
export function QuestGrid({ island, isQuestComplete, onStartQuest }: QuestGridProps) {
  const questTypes = (Object.keys(QUEST_TYPES) as QuestType[]).filter(questType => {
    // Filter basierend auf has_quiz und has_challenge
    if (questType === 'battle' && island.has_quiz === false) return false;
    if (questType === 'challenge' && island.has_challenge === false) return false;
    return true;
  });

  return (
    <div className="quests-grid">
      {questTypes.map(questType => {
        const quest = QUEST_TYPES[questType];
        const completed = isQuestComplete(questType);

        return (
          <QuestCard
            key={questType}
            questType={questType}
            quest={quest}
            completed={completed}
            onStart={onStartQuest}
          />
        );
      })}
    </div>
  );
}

export default QuestGrid;
