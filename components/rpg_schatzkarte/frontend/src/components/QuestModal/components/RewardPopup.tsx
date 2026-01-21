// ============================================
// QuestModal - RewardPopup Component
// Pfad: src/components/QuestModal/components/RewardPopup.tsx
// ============================================

import type { EarnedReward } from '../QuestModalTypes';

interface RewardPopupProps {
  show: boolean;
  reward: EarnedReward;
}

/**
 * Belohnungs-Animation nach Quest-Abschluss
 */
export function RewardPopup({ show, reward }: RewardPopupProps) {
  if (!show) return null;

  return (
    <div className="reward-popup">
      <div className="reward-content">
        <h3>🎉 Quest abgeschlossen!</h3>
        <div className="reward-items">
          <div className="reward-xp">
            <span className="reward-icon">⭐</span>
            <span className="reward-value">+{reward.xp} XP</span>
          </div>
          <div className="reward-gold">
            <span className="reward-icon">🪙</span>
            <span className="reward-value">+{reward.gold} Gold</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RewardPopup;
