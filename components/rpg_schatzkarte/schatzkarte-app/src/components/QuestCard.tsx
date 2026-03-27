// ============================================
// RPG Schatzkarte - Quest Card Component
// ============================================
import { Island, IslandProgress, QuestStatus } from '@/types/legacy-ui';

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
      {actualStatus === 'available' && (
        <div className="quest-glow pulse"></div>
      )}

      <div className="quest-marker">
        <span className="location-icon">{island.icon || '\u{1F3F0}'}</span>
        {actualStatus === 'completed' && (
          <div className="completion-badge">{'\u2713'}</div>
        )}
        {actualStatus === 'locked' && (
          <div className="lock-overlay">{'\uD83D\uDD12'}</div>
        )}
      </div>

      <div className="quest-info">
        <h4 className="quest-name">{island.name}</h4>
        <div className="quest-week">Woche {island.week}</div>

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

        {actualStatus !== 'locked' && totalTreasures > 0 && (
          <div className="treasures-preview">
            <span className="treasure-icon">{'\uD83D\uDC8E'}</span>
            <span>{treasuresCollected}/{totalTreasures}</span>
          </div>
        )}
      </div>

      <div className={`status-indicator ${actualStatus}`}>
        {actualStatus === 'available' && '\u2694\uFE0F Bereit'}
        {actualStatus === 'in_progress' && '\uD83D\uDD25 Aktiv'}
        {actualStatus === 'completed' && '\uD83C\uDFC6 Abgeschlossen'}
        {actualStatus === 'locked' && '\uD83D\uDD12 Gesperrt'}
      </div>
    </div>
  );
}

// Kompakte Version fuer die Weltkarte
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
      {status === 'available' && (
        <div className="marker-pulse"></div>
      )}

      <div className="marker-icon">
        {status === 'locked' ? '\uD83D\uDD12' : island.icon || '\u{1F3F0}'}
      </div>

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

      {status === 'completed' && (
        <div className="completion-star">{'\u2B50'}</div>
      )}

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
