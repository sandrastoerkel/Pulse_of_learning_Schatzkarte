// ============================================
// RPG Schatzkarte - Hattie Ship Modal
// Öffnet die vollständige HattieChallenge mit WOW-Effekten
// ============================================
import { HattieChallenge } from './HattieChallenge';
import { HattieEntry, HattieStats, DEFAULT_HATTIE_STATS } from '../hattieTypes';

interface HattieShipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNewPrediction: (entry: Omit<HattieEntry, 'id' | 'created_at'>) => void;
  onCompleteEntry: (entryId: string, result: number, reflection?: string) => void;
  hattieEntries?: HattieEntry[];
  hattieStats?: HattieStats;
  userName?: string;
}

export function HattieShipModal({
  isOpen,
  onClose,
  onNewPrediction,
  onCompleteEntry,
  hattieEntries = [],
  hattieStats,
  userName = 'Lern-Held'
}: HattieShipModalProps) {

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="ship-modal hattie fullscreen-challenge"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '96vw',
          width: '96%',
          maxHeight: '94vh',
          overflow: 'auto'
        }}
      >
        {/* HattieChallenge mit WOW-Effekten */}
        <HattieChallenge
          entries={hattieEntries}
          stats={hattieStats || DEFAULT_HATTIE_STATS}
          userName={userName}
          onNewPrediction={onNewPrediction}
          onCompleteEntry={onCompleteEntry}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
