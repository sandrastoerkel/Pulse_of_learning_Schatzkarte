// ============================================
// RPG Schatzkarte - Bandura Ship Modal
// Öffnet die vollständige BanduraChallenge mit WOW-Effekten
// ============================================
import { BanduraChallenge } from './BanduraChallenge';
import { BanduraEntry, BanduraStats, DEFAULT_BANDURA_STATS, BanduraSourceId } from '../banduraTypes';

interface BanduraShipModalProps {
  isOpen: boolean;
  completedToday: BanduraSourceId[];
  onClose: () => void;
  onEntrySubmit: (sourceId: BanduraSourceId, description: string, xp: number) => void;
  // Neue Props für die vollständige Challenge
  banduraEntries?: BanduraEntry[];
  banduraStats?: BanduraStats;
  userName?: string;
}

export function BanduraShipModal({
  isOpen,
  onClose,
  onEntrySubmit,
  banduraEntries = [],
  banduraStats,
  userName = 'Lern-Held'
}: BanduraShipModalProps) {

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="ship-modal bandura fullscreen-challenge"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '900px',
          width: '95%',
          maxHeight: '90vh',
          overflow: 'auto'
        }}
      >
        {/* BanduraChallenge mit WOW-Effekten */}
        <BanduraChallenge
          entries={banduraEntries}
          stats={banduraStats || DEFAULT_BANDURA_STATS}
          userName={userName}
          onNewEntry={(sourceType, description, xp) => {
            onEntrySubmit(sourceType as BanduraSourceId, description, xp);
          }}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
