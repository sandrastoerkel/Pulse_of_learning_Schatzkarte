// ============================================
// QuestModal - ProgressFooter Component
// Pfad: src/components/QuestModal/components/ProgressFooter.tsx
// ============================================

import { QUEST_TYPES } from '../QuestModalConstants';

interface ProgressFooterProps {
  isQuestComplete: (questType: keyof typeof QUEST_TYPES) => boolean;
  allQuestsComplete: boolean;
}

/**
 * Fortschrittsanzeige im Footer des Modals
 */
export function ProgressFooter({ isQuestComplete, allQuestsComplete }: ProgressFooterProps) {
  return (
    <div className="modal-footer">
      <div className="quest-progress-summary">
        <span>Fortschritt:</span>
        <div className="progress-icons">
          <span className={isQuestComplete('wisdom') ? 'done' : ''}>📜</span>
          <span className={isQuestComplete('scroll') ? 'done' : ''}>📖</span>
          <span className={isQuestComplete('battle') ? 'done' : ''}>⚔️</span>
          <span className={isQuestComplete('challenge') ? 'done' : ''}>🏆</span>
        </div>
        {allQuestsComplete && (
          <span className="all-complete">🎊 Alle Quests abgeschlossen!</span>
        )}
      </div>
    </div>
  );
}

export default ProgressFooter;
