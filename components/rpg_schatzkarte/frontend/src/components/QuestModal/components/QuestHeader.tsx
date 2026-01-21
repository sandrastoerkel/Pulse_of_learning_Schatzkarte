// ============================================
// QuestModal - QuestHeader Component
// Pfad: src/components/QuestModal/components/QuestHeader.tsx
// ============================================

import type { ExtendedIsland } from '../QuestModalTypes';
import { ISLAND_SUBTITLES } from '../QuestModalConstants';

interface QuestHeaderProps {
  island: ExtendedIsland;
  showHeaderInfo: boolean;
  onToggleHeaderInfo: () => void;
  onClose: () => void;
}

/**
 * Header des Quest-Modals mit Insel-Info
 */
export function QuestHeader({
  island,
  showHeaderInfo,
  onToggleHeaderInfo,
  onClose
}: QuestHeaderProps) {
  const subtitleInfo = ISLAND_SUBTITLES[island.id];

  return (
    <div className="modal-header-wrapper">
      <div
        className="modal-header"
        style={{ background: `linear-gradient(135deg, ${island.color}, ${island.color}99)` }}
      >
        <div className="island-icon-large">{island.icon}</div>
        <div className="header-content">
          <h2>{island.name}</h2>
          {subtitleInfo && (
            <span className="island-subtitle">{subtitleInfo.subtitle}</span>
          )}
          <span className="week-badge">Woche {island.week}</span>
        </div>
        <button className="close-button" onClick={onClose}>✕</button>
      </div>

      {subtitleInfo && (
        <div className="header-info-section">
          <button
            className={`header-info-toggle ${showHeaderInfo ? 'expanded' : ''}`}
            onClick={onToggleHeaderInfo}
          >
            <span className="info-icon">ℹ️</span>
            <span>Was bedeutet {subtitleInfo.subtitle.replace(/[()]/g, '')}?</span>
            <span className={`toggle-arrow ${showHeaderInfo ? 'expanded' : ''}`}>▼</span>
          </button>
          {showHeaderInfo && (
            <div className="header-info-content">
              <p>{subtitleInfo.description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default QuestHeader;
