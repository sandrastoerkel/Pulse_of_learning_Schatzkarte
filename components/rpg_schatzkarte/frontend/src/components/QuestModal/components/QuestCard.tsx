// ============================================
// QuestModal - QuestCard Component
// Pfad: src/components/QuestModal/components/QuestCard.tsx
// ============================================

import type { QuestType } from '../../../types';
import type { QuestTypeDefinition } from '../QuestModalTypes';

interface QuestCardProps {
  questType: QuestType;
  quest: QuestTypeDefinition;
  completed: boolean;
  onStart: (questType: QuestType) => void;
}

/**
 * Einzelne Quest-Karte
 */
export function QuestCard({ questType, quest, completed, onStart }: QuestCardProps) {
  return (
    <div
      className={`quest-type-card ${completed ? 'completed' : 'available'}`}
      onClick={() => onStart(questType)}
    >
      <div className="quest-icon-wrapper">
        <span className="quest-icon">{quest.icon}</span>
        {completed && <div className="check-mark">✓</div>}
      </div>
      <h4>{quest.name}</h4>
      <p>{quest.description}</p>
      <div className="quest-rewards">
        <span className="xp-reward">⭐ {quest.xp} XP</span>
        <span className="gold-reward">🪙 {quest.gold}</span>
      </div>
      <button className="quest-action-btn">
        {completed ? '🔄 Wiederholen' : quest.action}
      </button>
    </div>
  );
}

export default QuestCard;
