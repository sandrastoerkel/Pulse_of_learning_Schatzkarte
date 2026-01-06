// ============================================
// RPG Schatzkarte - Quest Card Component
// ============================================
import { Island, IslandProgress, QuestStatus } from '../types';

interface QuestCardProps {
  island: Island;
  progress?: IslandProgress;
  status: QuestStatus;
  position: { x: number; y: number };
  onClick: () => void;
}

// Bestimme Quest-Status basierend auf Fortschritt
function getQuestStatus(progress?: IslandProgress): QuestStatus {
  if (!progress) return 'available';

  const completed =
    progress.video_watched &&
    progress.explanation_read &&
    progress.quiz_passed &&
    progress.challenge_completed;

  if (completed) return 'completed';

  const started =
    progress.video_watched ||
    progress.explanation_read ||
    progress.quiz_passed ||
    progress.challenge_completed;

  if (started) return 'in_progress';

  return 'available';
}

// Berechne Fortschritt in Prozent
function getProgressPercent(progress?: IslandProgress): number {
  if (!progress) return 0;

  let count = 0;
  if (progress.video_watched) count++;
  if (progress.explanation_read) count++;
  if (progress.quiz_passed) count++;
  if (progress.challenge_completed) count++;

  return (count / 4) * 100;
}

// Location Icons basierend auf Insel-Typ
const LOCATION_ICONS: Record<string, string> = {
  default: '🏰',
  forest: '🌲',
  mountain: '⛰️',
  castle: '🏰',
  village: '🏘️',
  cave: '🕳️',
  tower: '🗼',
  temple: '⛩️',
  library: '📚',
  arena: '🏟️'
};

export function QuestCard({
  island,
  progress,
  status,
  position,
  onClick
}: QuestCardProps) {
  const actualStatus = status === 'locked' ? 'locked' : getQuestStatus(progress);
  const progressPercent = getProgressPercent(progress);
  const treasuresCollected = progress?.treasures_collected?.length || 0;
  const totalTreasures = island.treasures.length;

  return (
    <div
      className={`quest-card status-${actualStatus}`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`
      }}
      onClick={actualStatus !== 'locked' ? onClick : undefined}
    >
      {/* Glow Effect für verfügbare Quests */}
      {actualStatus === 'available' && (
        <div className="quest-glow pulse"></div>
      )}

      {/* Location Marker */}
      <div className="quest-marker">
        <span className="location-icon">{island.icon || '🏰'}</span>
        {actualStatus === 'completed' && (
          <div className="completion-badge">✓</div>
        )}
        {actualStatus === 'locked' && (
          <div className="lock-overlay">🔒</div>
        )}
      </div>

      {/* Quest Info */}
      <div className="quest-info">
        <h4 className="quest-name">{island.name}</h4>
        <div className="quest-week">Woche {island.week}</div>

        {/* Progress Bar (nur wenn gestartet) */}
        {actualStatus === 'in_progress' && (
          <div className="quest-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <span className="progress-text">{Math.round(progressPercent)}%</span>
          </div>
        )}

        {/* Treasures Preview */}
        {actualStatus !== 'locked' && totalTreasures > 0 && (
          <div className="treasures-preview">
            <span className="treasure-icon">💎</span>
            <span>{treasuresCollected}/{totalTreasures}</span>
          </div>
        )}
      </div>

      {/* Status Indicator */}
      <div className={`status-indicator ${actualStatus}`}>
        {actualStatus === 'available' && '⚔️ Bereit'}
        {actualStatus === 'in_progress' && '🔥 Aktiv'}
        {actualStatus === 'completed' && '🏆 Abgeschlossen'}
        {actualStatus === 'locked' && '🔒 Gesperrt'}
      </div>
    </div>
  );
}

// Kompakte Version für die Weltkarte
interface QuestMarkerProps {
  island: Island;
  progress?: IslandProgress;
  isUnlocked: boolean;
  position: { x: number; y: number };
  onClick: () => void;
}

export function QuestMarker({
  island,
  progress,
  isUnlocked,
  position,
  onClick
}: QuestMarkerProps) {
  const status = !isUnlocked ? 'locked' : getQuestStatus(progress);
  const progressPercent = getProgressPercent(progress);

  return (
    <div
      className={`quest-marker-compact status-${status}`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`
      }}
      onClick={isUnlocked ? onClick : undefined}
    >
      {/* Pulsierender Ring für verfügbare Quests */}
      {status === 'available' && (
        <div className="marker-pulse"></div>
      )}

      {/* Icon */}
      <div className="marker-icon">
        {status === 'locked' ? '🔒' : island.icon || '🏰'}
      </div>

      {/* Progress Ring */}
      {status === 'in_progress' && (
        <svg className="progress-ring" viewBox="0 0 36 36">
          <path
            className="progress-ring-bg"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className="progress-ring-fill"
            strokeDasharray={`${progressPercent}, 100`}
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
      )}

      {/* Completion Star */}
      {status === 'completed' && (
        <div className="completion-star">⭐</div>
      )}

      {/* Tooltip */}
      <div className="marker-tooltip">
        <strong>{island.name}</strong>
        <span>Woche {island.week}</span>
        {status === 'in_progress' && (
          <span>{Math.round(progressPercent)}% abgeschlossen</span>
        )}
      </div>
    </div>
  );
}

export { getQuestStatus, getProgressPercent };
