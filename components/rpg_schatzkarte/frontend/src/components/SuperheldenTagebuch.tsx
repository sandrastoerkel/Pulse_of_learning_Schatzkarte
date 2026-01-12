// ============================================
// RPG Schatzkarte - Superhelden-Tagebuch
// 🦸 Für kleine Helden in der Grundschule!
// Using: framer-motion + react-confetti
// ============================================
import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

// ============================================
// TYPES
// ============================================
export interface TagebuchEintrag {
  id: string;
  datum: string;
  wasGeschafft: string;
  warEsSchwer: 'leicht' | 'mittel' | 'schwer';
  gefuehl: string;
}

interface SuperheldenTagebuchProps {
  entries: TagebuchEintrag[];
  onNewEntry: (entry: TagebuchEintrag) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

// ============================================
// KONSTANTEN
// ============================================
const GEFUEHLE = [
  { emoji: '💪', label: 'Stark' },
  { emoji: '😊', label: 'Glücklich' },
  { emoji: '🎉', label: 'Party' },
  { emoji: '😅', label: 'Erleichtert' },
  { emoji: '🌟', label: 'Super' },
  { emoji: '🦸', label: 'Heldenhaft' }
];

const SCHWIERIGKEITS_OPTIONEN = [
  { value: 'leicht' as const, label: 'Leicht', emoji: '😊', color: '#4CAF50' },
  { value: 'mittel' as const, label: 'Mittel', emoji: '🤔', color: '#FF9800' },
  { value: 'schwer' as const, label: 'Schwer', emoji: '💪', color: '#9C27B0' }
];

const KONFETTI_FARBEN = ['#FFD700', '#9C27B0', '#4169E1', '#FF6B6B', '#4CAF50', '#FF9800'];

// ============================================
// ANIMATION VARIANTS
// ============================================
const widgetVariants = {
  initial: { scale: 0, rotate: -180 },
  animate: {
    scale: 1,
    rotate: 0,
    transition: { type: 'spring' as const, stiffness: 260, damping: 20 }
  },
  hover: {
    scale: 1.1,
    rotate: [0, -5, 5, 0],
    transition: { duration: 0.3 }
  },
  tap: { scale: 0.9 }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 50 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 25 }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 50,
    transition: { duration: 0.2 }
  }
};

const listItemVariants = {
  hidden: { opacity: 0, x: -30, rotateY: -15 },
  visible: {
    opacity: 1,
    x: 0,
    rotateY: 0,
    transition: { type: 'spring' as const, stiffness: 200, damping: 20 }
  }
};

const buttonPulseVariants = {
  idle: { scale: 1 },
  pulse: {
    scale: [1, 1.05, 1],
    transition: { duration: 2, repeat: Infinity }
  }
};

const starBurstVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: [0, 1.5, 0],
    opacity: [0, 1, 0],
    rotate: [0, 180, 360],
    transition: { duration: 0.8 }
  }
};

// ============================================
// HAUPTKOMPONENTE
// ============================================
export function SuperheldenTagebuch({
  entries,
  onNewEntry,
  isOpen = false,
  onToggle
}: SuperheldenTagebuchProps) {
  const [modalOpen, setModalOpen] = useState(isOpen);
  const [wasGeschafft, setWasGeschafft] = useState('');
  const [schwierigkeit, setSchwierigkeit] = useState<'leicht' | 'mittel' | 'schwer' | null>(null);
  const [gefuehl, setGefuehl] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Sync internal state with external isOpen prop
  useEffect(() => {
    setModalOpen(isOpen);
  }, [isOpen]);

  const handleToggle = useCallback(() => {
    setModalOpen(prev => !prev);
    onToggle?.();
  }, [onToggle]);

  const handleSave = useCallback(() => {
    if (!wasGeschafft.trim() || !schwierigkeit || !gefuehl) return;

    const newEntry: TagebuchEintrag = {
      id: `tagebuch-${Date.now()}`,
      datum: new Date().toISOString(),
      wasGeschafft: wasGeschafft.trim(),
      warEsSchwer: schwierigkeit,
      gefuehl
    };

    onNewEntry(newEntry);

    // Konfetti + Erfolgs-Animation
    setShowConfetti(true);
    setShowSuccess(true);
    setTimeout(() => setShowConfetti(false), 3000);
    setTimeout(() => setShowSuccess(false), 1500);

    // Formular zurücksetzen
    setWasGeschafft('');
    setSchwierigkeit(null);
    setGefuehl(null);
  }, [wasGeschafft, schwierigkeit, gefuehl, onNewEntry]);

  const isFormValid = wasGeschafft.trim() && schwierigkeit && gefuehl;

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('de-DE', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  };

  return (
    <>
      {/* ============================================
          MODAL (Widget wird in WorldMap.tsx gerendert)
          ============================================ */}
      <AnimatePresence>
        {modalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="tagebuch-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleToggle}
            />

            {/* Modal Content */}
            <motion.div
              className="tagebuch-modal"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Konfetti */}
              {showConfetti && (
                <Confetti
                  width={window.innerWidth}
                  height={window.innerHeight}
                  recycle={false}
                  numberOfPieces={200}
                  colors={KONFETTI_FARBEN}
                  style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999 }}
                />
              )}

              {/* Success Animation */}
              <AnimatePresence>
                {showSuccess && (
                  <motion.div
                    className="success-overlay"
                    variants={starBurstVariants}
                    initial="initial"
                    animate="animate"
                    exit="initial"
                  >
                    <span className="success-star">⭐</span>
                    <span className="success-text">Super gemacht!</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Header */}
              <div className="tagebuch-header">
                <div className="header-content">
                  <span className="header-icon">🦸</span>
                  <div>
                    <h2>Mein Superhelden-Tagebuch</h2>
                    <p>Schreib auf, was du heute geschafft hast!</p>
                  </div>
                </div>
                <motion.button
                  className="close-btn"
                  onClick={handleToggle}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ✕
                </motion.button>
              </div>

              {/* Content */}
              <div className="tagebuch-content">
                {/* Eingabeformular */}
                <div className="entry-form">
                  <div className="form-section">
                    <label className="form-label">
                      <span className="label-icon">✏️</span>
                      Was habe ich heute geschafft?
                    </label>
                    <motion.textarea
                      className="form-textarea"
                      placeholder="z.B. Das 3er-Einmaleins gelernt, einen Aufsatz geschrieben..."
                      value={wasGeschafft}
                      onChange={(e) => setWasGeschafft(e.target.value)}
                      maxLength={200}
                      whileFocus={{ scale: 1.02, boxShadow: '0 0 15px rgba(255, 215, 0, 0.4)' }}
                    />
                    <span className="char-count">{wasGeschafft.length}/200</span>
                  </div>

                  <div className="form-section">
                    <label className="form-label">
                      <span className="label-icon">💪</span>
                      War es schwer?
                    </label>
                    <div className="difficulty-buttons">
                      {SCHWIERIGKEITS_OPTIONEN.map((opt) => (
                        <motion.button
                          key={opt.value}
                          className={`difficulty-btn ${schwierigkeit === opt.value ? 'selected' : ''}`}
                          style={{ 
                            '--btn-color': opt.color 
                          } as React.CSSProperties}
                          onClick={() => setSchwierigkeit(opt.value)}
                          whileHover={{ scale: 1.05, y: -3 }}
                          whileTap={{ scale: 0.95 }}
                          animate={schwierigkeit === opt.value ? { 
                            boxShadow: `0 0 20px ${opt.color}60`
                          } : {}}
                        >
                          <span className="btn-emoji">{opt.emoji}</span>
                          <span className="btn-label">{opt.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="form-section">
                    <label className="form-label">
                      <span className="label-icon">😊</span>
                      Wie fühlst du dich?
                    </label>
                    <div className="emoji-picker">
                      {GEFUEHLE.map((g) => (
                        <motion.button
                          key={g.emoji}
                          className={`emoji-btn ${gefuehl === g.emoji ? 'selected' : ''}`}
                          onClick={() => setGefuehl(g.emoji)}
                          whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                          whileTap={{ scale: 0.9 }}
                          animate={gefuehl === g.emoji ? {
                            scale: [1, 1.2, 1],
                            transition: { duration: 0.3 }
                          } : {}}
                          title={g.label}
                        >
                          {g.emoji}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <motion.button
                    className="save-btn"
                    disabled={!isFormValid}
                    onClick={handleSave}
                    variants={buttonPulseVariants}
                    animate={isFormValid ? 'pulse' : 'idle'}
                    whileHover={isFormValid ? { scale: 1.05 } : {}}
                    whileTap={isFormValid ? { scale: 0.95 } : {}}
                  >
                    <span className="btn-icon">⭐</span>
                    <span>Eintrag speichern!</span>
                    <span className="btn-icon">⭐</span>
                  </motion.button>
                </div>

                {/* Einträge-Liste */}
                <div className="entries-section">
                  <h3 className="entries-title">
                    <span>📜</span> Meine Heldentaten
                    {entries.length > 0 && <span className="entries-count">({entries.length})</span>}
                  </h3>

                  {entries.length === 0 ? (
                    <motion.div 
                      className="empty-state"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <span className="empty-icon">📝</span>
                      <p>Noch keine Einträge. Schreib deinen ersten Superhelden-Moment auf!</p>
                    </motion.div>
                  ) : (
                    <motion.ul 
                      className="entries-list"
                      initial="hidden"
                      animate="visible"
                      variants={{
                        visible: { transition: { staggerChildren: 0.1 } }
                      }}
                    >
                      {entries.slice().reverse().map((entry, index) => (
                        <motion.li
                          key={entry.id}
                          className="entry-item"
                          variants={listItemVariants}
                          whileHover={{ scale: 1.02, x: 5 }}
                        >
                          <div className="entry-header">
                            <span className="entry-date">{formatDate(entry.datum)}</span>
                            <span className="entry-difficulty" data-level={entry.warEsSchwer}>
                              {entry.warEsSchwer === 'leicht' && '😊 Leicht'}
                              {entry.warEsSchwer === 'mittel' && '🤔 Mittel'}
                              {entry.warEsSchwer === 'schwer' && '💪 Schwer'}
                            </span>
                          </div>
                          <p className="entry-text">{entry.wasGeschafft}</p>
                          <div className="entry-footer">
                            <span className="entry-feeling">{entry.gefuehl}</span>
                            <span className="entry-badge">#{entries.length - index}</span>
                          </div>
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================
// EXPORT: Button für QuestModal
// ============================================
export function TagebuchStartButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      className="tagebuch-start-btn"
      onClick={onClick}
      whileHover={{ scale: 1.05, boxShadow: '0 5px 25px rgba(255, 215, 0, 0.5)' }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <span className="btn-icon">📓</span>
      <span>Mein Superhelden-Tagebuch starten</span>
      <motion.span 
        className="btn-sparkle"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      >
        ✨
      </motion.span>
    </motion.button>
  );
}

export default SuperheldenTagebuch;
