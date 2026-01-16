// ============================================
// RPG Schatzkarte - Companion Selector Component
// ============================================
import { useState } from 'react';
import { CompanionType, CompanionInfo } from '../types';

// Import companion images
import drakiImg from '../assets/companions/draki.png';
import shadowImg from '../assets/companions/shadow.png';
import phoenixImg from '../assets/companions/phoenix.png';
import knightImg from '../assets/companions/knight.png';
import brainyImg from '../assets/companions/brainy.png';

// Companion-Daten
export const COMPANIONS: CompanionInfo[] = [
  {
    id: 'draki',
    name: 'Draki',
    description: 'Ein kluger Drache mit Brille - der perfekte Lernpartner!',
    image: drakiImg
  },
  {
    id: 'shadow',
    name: 'Shadow',
    description: 'Eine geheimnisvolle Schattenkatze in Ritterrüstung',
    image: shadowImg
  },
  {
    id: 'phoenix',
    name: 'Phoenix',
    description: 'Eine majestätische Katze mit goldenen Flügeln',
    image: phoenixImg
  },
  {
    id: 'knight',
    name: 'Sir Whiskers',
    description: 'Ein tapferer Katzenritter bereit für jedes Abenteuer',
    image: knightImg
  },
  {
    id: 'brainy',
    name: 'Brainy',
    description: 'Das klassische Gehirn - schlau und neugierig',
    image: brainyImg
  }
];

// Hilfsfunktion um Companion-Bild zu bekommen
export function getCompanionImage(companionId: CompanionType | undefined): string {
  const companion = COMPANIONS.find(c => c.id === companionId);
  return companion?.image || drakiImg; // Default to Draki
}

export function getCompanionInfo(companionId: CompanionType | undefined): CompanionInfo {
  return COMPANIONS.find(c => c.id === companionId) || COMPANIONS[0];
}

interface CompanionSelectorProps {
  currentCompanion?: CompanionType;
  onSelect: (companionId: CompanionType) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function CompanionSelector({
  currentCompanion,
  onSelect,
  isOpen,
  onClose
}: CompanionSelectorProps) {
  const [selectedId, setSelectedId] = useState<CompanionType>(currentCompanion || 'draki');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onSelect(selectedId);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="companion-selector-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Wähle deinen Lernbegleiter</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <p className="companion-intro">
          Dein Lernbegleiter wird dich auf deiner gesamten Reise begleiten!
        </p>

        <div className="companions-grid">
          {COMPANIONS.map(companion => (
            <div
              key={companion.id}
              className={`companion-card ${selectedId === companion.id ? 'selected' : ''}`}
              onClick={() => setSelectedId(companion.id)}
            >
              <div className="companion-image-container">
                <img
                  src={companion.image}
                  alt={companion.name}
                  className="companion-image"
                />
              </div>
              <div className="companion-info">
                <h3 className="companion-name">{companion.name}</h3>
                <p className="companion-description">{companion.description}</p>
              </div>
              {selectedId === companion.id && (
                <div className="selected-badge">Ausgewählt</div>
              )}
            </div>
          ))}
        </div>

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>
            Abbrechen
          </button>
          <button className="confirm-btn" onClick={handleConfirm}>
            Bestätigen
          </button>
        </div>
      </div>
    </div>
  );
}
