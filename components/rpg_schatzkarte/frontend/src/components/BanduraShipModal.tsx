// ============================================
// RPG Schatzkarte - Bandura Ship Modal
// Die 4 Quellen der Selbstwirksamkeit
// ============================================
import { useState } from 'react';
import { BANDURA_SOURCES, BANDURA_INFO, BanduraSourceId } from '../content/banduraContent';

interface BanduraShipModalProps {
  isOpen: boolean;
  completedToday: BanduraSourceId[];
  onClose: () => void;
  onEntrySubmit: (sourceId: BanduraSourceId, description: string, xp: number) => void;
}

export function BanduraShipModal({
  isOpen,
  completedToday,
  onClose,
  onEntrySubmit
}: BanduraShipModalProps) {
  const [selectedSource, setSelectedSource] = useState<BanduraSourceId | null>(null);
  const [description, setDescription] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);

  if (!isOpen) return null;

  const sourceKeys = Object.keys(BANDURA_SOURCES) as BanduraSourceId[];
  const allCompleted = completedToday.length >= 4;

  const handleSourceSelect = (sourceId: BanduraSourceId) => {
    if (completedToday.includes(sourceId)) return;
    setSelectedSource(sourceId);
    setDescription('');
  };

  const handleSubmit = () => {
    if (!selectedSource || description.trim().length < 10) return;

    const source = BANDURA_SOURCES[selectedSource];
    let xp = source.xp;

    // Bonus fuer ausfuehrliche Beschreibung
    if (description.length > 50) {
      xp += BANDURA_INFO.xp.detailed_bonus;
    }

    // Bonus wenn alle 4 Quellen heute abgeschlossen
    const newCompletedCount = completedToday.length + 1;
    if (newCompletedCount >= 4) {
      xp += BANDURA_INFO.xp.all_four_bonus;
    }

    setEarnedXp(xp);
    setShowSuccess(true);
    onEntrySubmit(selectedSource, description, xp);

    setTimeout(() => {
      setShowSuccess(false);
      setSelectedSource(null);
      setDescription('');
    }, 2000);
  };

  const currentSource = selectedSource ? BANDURA_SOURCES[selectedSource] : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="ship-modal bandura" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="ship-modal-header">
          <h2>
            <span>🚢</span>
            {BANDURA_INFO.title}
          </h2>
          <p>{BANDURA_INFO.subtitle}</p>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="ship-modal-body">
          {/* Intro */}
          <div className="bandura-intro">
            <p style={{ color: 'var(--text-light)', marginBottom: '20px', lineHeight: 1.6 }}>
              {BANDURA_INFO.description}
            </p>
          </div>

          {/* Die 4 Quellen */}
          <div className="bandura-sources">
            {sourceKeys.map(sourceId => {
              const source = BANDURA_SOURCES[sourceId];
              const isCompleted = completedToday.includes(sourceId);
              const isSelected = selectedSource === sourceId;

              return (
                <div
                  key={sourceId}
                  className={`bandura-source-card ${isSelected ? 'selected' : ''} ${isCompleted ? 'completed' : ''}`}
                  onClick={() => handleSourceSelect(sourceId)}
                  style={{ borderColor: isSelected ? source.color : undefined }}
                >
                  <div className="bandura-source-icon">{source.icon}</div>
                  <div className="bandura-source-name">{source.name_de}</div>
                  <div className="bandura-source-xp">+{source.xp} XP</div>
                  {isCompleted && <div className="check-mark">✓</div>}
                </div>
              );
            })}
          </div>

          {/* Eingabe-Formular */}
          {selectedSource && currentSource && !showSuccess && (
            <div className="entry-form">
              <div className="entry-prompt">
                <span style={{ fontSize: '24px', marginRight: '10px' }}>{currentSource.icon}</span>
                {currentSource.prompt}
              </div>
              <div className="entry-examples">
                Beispiele: {currentSource.examples.join(' • ')}
              </div>
              <textarea
                className="entry-textarea"
                placeholder="Beschreibe deine Erfahrung..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                autoFocus
              />
              <button
                className="submit-entry-btn"
                onClick={handleSubmit}
                disabled={description.trim().length < 10}
              >
                {description.trim().length < 10
                  ? `Mindestens ${10 - description.trim().length} Zeichen...`
                  : '✓ Eintrag speichern'
                }
              </button>
            </div>
          )}

          {/* Success Animation */}
          {showSuccess && (
            <div className="reward-popup" style={{ position: 'relative', background: 'transparent' }}>
              <div className="reward-content">
                <h3>🎉 Super gemacht!</h3>
                <div className="reward-items">
                  <div className="reward-xp">
                    <span className="reward-icon">⭐</span>
                    <span className="reward-value">+{earnedXp} XP</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tages-Fortschritt */}
          <div className="progress-today">
            <h4>Heute geschafft: {completedToday.length}/4</h4>
            <div className="progress-dots">
              {sourceKeys.map(sourceId => {
                const source = BANDURA_SOURCES[sourceId];
                const isCompleted = completedToday.includes(sourceId);
                return (
                  <div
                    key={sourceId}
                    className={`progress-dot ${isCompleted ? 'completed' : ''}`}
                    title={source.name_de}
                  >
                    {source.icon}
                  </div>
                );
              })}
            </div>
            {allCompleted && (
              <div className="all-complete-bonus">
                🎊 Alle 4 Quellen! +{BANDURA_INFO.xp.all_four_bonus} Bonus-XP!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
