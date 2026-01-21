// ============================================
// QuestModal - TreasureSection Component
// Pfad: src/components/QuestModal/components/TreasureSection.tsx
// ============================================

import type { Treasure } from '../../../types';

interface TreasureSectionProps {
  treasures: Treasure[];
  collectedTreasures: string[];
  allQuestsComplete: boolean;
  onCollect: (treasureIndex: number) => void;
}

/**
 * Schätze-Bereich des Quest-Modals
 */
export function TreasureSection({
  treasures,
  collectedTreasures,
  allQuestsComplete,
  onCollect
}: TreasureSectionProps) {
  return (
    <div className="treasures-section">
      <h3>💎 Verfügbare Schätze</h3>
      <div className="treasures-grid">
        {treasures.map((treasure, index) => {
          const collected = collectedTreasures.includes(treasure.name);
          return (
            <div
              key={index}
              className={`treasure-item ${collected ? 'collected' : 'available'}`}
              onClick={() => !collected && allQuestsComplete && onCollect(index)}
            >
              <span className="treasure-icon">{treasure.icon}</span>
              <span className="treasure-name">{treasure.name}</span>
              <span className="treasure-xp">+{treasure.xp} XP</span>
              {collected && <div className="collected-badge">✓</div>}
              {!collected && !allQuestsComplete && (
                <div className="treasure-locked">
                  🔒 Schließe alle Quests ab
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TreasureSection;
