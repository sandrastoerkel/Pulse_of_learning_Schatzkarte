// ============================================
// RPG Schatzkarte - Bandura Challenge Component
// 🎮 MIT ECHTEN WOW-EFFEKTEN!
// Using: framer-motion + react-confetti
// ============================================
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

// ============================================
// TYPES
// ============================================
export type BanduraSourceId = 'mastery' | 'vicarious' | 'persuasion' | 'physiological';

export interface BanduraEntry {
  id: string;
  source_type: BanduraSourceId;
  description: string;
  created_at: string;
  xp_earned: number;
}

export interface BanduraStats {
  total_entries: number;
  entries_per_source: Record<BanduraSourceId, number>;
  current_streak: number;
  longest_streak: number;
  total_xp: number;
  level: number;
  all_four_days: number;
}

interface BanduraSource {
  id: BanduraSourceId;
  name: string;
  name_de: string;
  icon: string;
  color: string;
  description: string;
  prompt: string;
  examples: string[];
  xp: number;
}

interface BanduraChallengeProps {
  entries: BanduraEntry[];
  stats: BanduraStats;
  userName?: string;
  onNewEntry: (sourceType: BanduraSourceId, description: string, xp: number) => void;
  onClose?: () => void;
}

// ============================================
// BANDURA SOURCES KONFIGURATION
// ============================================
const BANDURA_SOURCES: Record<BanduraSourceId, BanduraSource> = {
  mastery: {
    id: 'mastery',
    name: 'Mastery Experience',
    name_de: 'Eigener Erfolg',
    icon: '🏆',
    color: '#4CAF50',
    description: 'Der stärkste Weg! Erlebe selbst, dass du etwas schaffst.',
    prompt: 'Was hast du heute geschafft, worauf du stolz bist?',
    examples: ['Eine schwierige Mathe-Aufgabe gelöst', 'Einen Text fehlerfrei vorgelesen', 'Etwas Neues verstanden', 'Eine Präsentation gehalten'],
    xp: 15
  },
  vicarious: {
    id: 'vicarious',
    name: 'Vicarious Experience',
    name_de: 'Vorbild-Lernen',
    icon: '👀',
    color: '#2196F3',
    description: 'Sieh anderen zu, die es schaffen - besonders solchen, die dir ähnlich sind!',
    prompt: 'Von wem hast du heute gelernt oder wer hat dich inspiriert?',
    examples: ['Ein Mitschüler hat eine gute Lösung erklärt', 'Jemand hat trotz Schwierigkeiten nicht aufgegeben', 'Ein Video gesehen, das mir etwas beigebracht hat', 'Ein Vorbild gefunden'],
    xp: 12
  },
  persuasion: {
    id: 'persuasion',
    name: 'Social Persuasion',
    name_de: 'Ermutigung',
    icon: '💬',
    color: '#9C27B0',
    description: 'Ermutigende Worte von Menschen, denen du vertraust.',
    prompt: 'Welche ermutigenden Worte hast du bekommen oder gegeben?',
    examples: ['Jemand hat gesagt, dass ich das schaffen kann', 'Positives Feedback von einem Lehrer', 'Ich habe jemand anderen ermutigt', 'Ein Kompliment bekommen'],
    xp: 10
  },
  physiological: {
    id: 'physiological',
    name: 'Physiological States',
    name_de: 'Körper-Management',
    icon: '🧘',
    color: '#FF9800',
    description: 'Lerne, Aufregung als Energie zu nutzen statt als Hindernis.',
    prompt: 'Wie hast du heute mit Stress oder Nervosität umgegangen?',
    examples: ['Tief durchgeatmet vor einer Prüfung', 'Aufregung als positive Energie genutzt', 'Pause gemacht, als ich frustriert war', 'Sport/Bewegung gemacht'],
    xp: 12
  }
};

// Tab-Definitionen
type TabId = 'new' | 'overview' | 'portfolio' | 'history';

const TABS: { id: TabId; icon: string; label: string }[] = [
  { id: 'new', icon: '📝', label: 'Neuer Eintrag' },
  { id: 'overview', icon: '📊', label: 'Übersicht' },
  { id: 'portfolio', icon: '📋', label: 'Portfolio' },
  { id: 'history', icon: '📜', label: 'Verlauf' }
];

// Level-System
const LEVEL_INFO: Record<number, { icon: string; name: string; xpRequired: number }> = {
  1: { icon: '🌱', name: 'Anfänger', xpRequired: 0 },
  2: { icon: '🔍', name: 'Entdecker', xpRequired: 50 },
  3: { icon: '📚', name: 'Lernender', xpRequired: 150 },
  4: { icon: '📈', name: 'Aufsteiger', xpRequired: 300 },
  5: { icon: '🚀', name: 'Übertreffer', xpRequired: 500 },
  6: { icon: '🏆', name: 'Meister', xpRequired: 750 },
  7: { icon: '⭐', name: 'Experte', xpRequired: 1000 },
  8: { icon: '👑', name: 'Champion', xpRequired: 1500 }
};

// Konfetti-Farben
const CONFETTI_COLORS = ['#667eea', '#764ba2', '#f093fb', '#FFD700', '#00ff88', '#ff6b6b', '#4ecdc4'];

// ============================================
// ANIMATION VARIANTS
// ============================================

// Karten-Animation (wie Spielkarten austeilen)
const cardContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, rotateX: -15, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 20 }
  }
};

// Quellen-Karten Hover
const sourceCardVariants = {
  idle: { scale: 1, boxShadow: '0 4px 15px rgba(0,0,0,0.2)' },
  hover: {
    scale: 1.05,
    rotate: [0, -1, 1, 0],
    boxShadow: '0 15px 40px rgba(102, 126, 234, 0.4)',
    transition: { type: 'spring' as const, stiffness: 400, damping: 17 }
  },
  tap: { scale: 0.95 },
  selected: {
    scale: 1.02,
    boxShadow: '0 0 30px rgba(102, 126, 234, 0.6)',
    transition: { type: 'spring' as const, stiffness: 300 }
  }
};

// Tab-Wechsel
const tabContentVariants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 25 } },
  exit: { opacity: 0, scale: 0.95, y: -20, transition: { duration: 0.2 } }
};

// Fortschrittsbalken
const progressVariants = {
  initial: { width: 0 },
  animate: (progress: number) => ({
    width: `${progress}%`,
    transition: { duration: 1.2, ease: 'easeOut' as const }
  })
};

// Timeline-Einträge
const timelineVariants = {
  hidden: { opacity: 0, x: -50, rotateY: -20 },
  visible: {
    opacity: 1,
    x: 0,
    rotateY: 0,
    transition: { type: 'spring' as const, stiffness: 150, damping: 15 }
  }
};

// Success Animation
const successVariants = {
  initial: { scale: 0, rotate: -180 },
  animate: {
    scale: [0, 1.4, 1],
    rotate: [0, 10, -10, 0],
    transition: { type: 'spring' as const, stiffness: 200, damping: 15 }
  }
};

// XP Pop Animation
const xpPopVariants = {
  initial: { opacity: 0, y: 20, scale: 0.5 },
  animate: {
    opacity: 1,
    y: 0,
    scale: [1, 1.2, 1],
    transition: { delay: 0.3, type: 'spring' as const, stiffness: 300 }
  }
};

// ============================================
// SPARKLE COMPONENT (Glitzer-Partikel)
// ============================================
function Sparkles({ color }: { color: string }) {
  return (
    <div className="sparkles-container">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="sparkle"
          style={{ backgroundColor: color }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            x: [0, (Math.random() - 0.5) * 40],
            y: [0, (Math.random() - 0.5) * 40]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeOut' as const
          }}
        />
      ))}
    </div>
  );
}

// ============================================
// FLOATING EMOJI (schwebendes Emoji)
// ============================================
function FloatingEmoji({ emoji, delay = 0 }: { emoji: string; delay?: number }) {
  return (
    <motion.span
      className="floating-emoji"
      animate={{
        y: [0, -8, 0],
        rotate: [0, 5, -5, 0]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        delay,
        ease: 'easeInOut'
      }}
    >
      {emoji}
    </motion.span>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export function BanduraChallenge({
  entries,
  stats,
  userName = 'Lernender',
  onNewEntry,
  onClose
}: BanduraChallengeProps) {
  // State
  const [activeTab, setActiveTab] = useState<TabId>('new');
  const [selectedSource, setSelectedSource] = useState<BanduraSourceId | null>(null);
  const [description, setDescription] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [showCertificate, setShowCertificate] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 800, height: 600 });

  // Window Size für Konfetti
  useEffect(() => {
    const updateSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Gruppiere Einträge nach Quelle
  const entriesBySource = entries.reduce((acc, entry) => {
    if (!acc[entry.source_type]) acc[entry.source_type] = [];
    acc[entry.source_type].push(entry);
    return acc;
  }, {} as Record<BanduraSourceId, BanduraEntry[]>);

  // Berechne Level-Info
  const levelInfo = LEVEL_INFO[stats.level] || LEVEL_INFO[1];
  const nextLevel = LEVEL_INFO[stats.level + 1];
  const xpProgress = nextLevel
    ? ((stats.total_xp - levelInfo.xpRequired) / (nextLevel.xpRequired - levelInfo.xpRequired)) * 100
    : 100;

  // Eintrag speichern
  const handleSubmit = useCallback(() => {
    if (!selectedSource || description.trim().length < 10) return;

    const source = BANDURA_SOURCES[selectedSource];
    let xp = source.xp;
    if (description.length > 50) xp += 5;

    setEarnedXp(xp);
    setShowConfetti(true);
    setShowSuccess(true);

    onNewEntry(selectedSource, description, xp);

    // Check Level-Up (vereinfacht)
    const newTotalXp = stats.total_xp + xp;
    if (nextLevel && newTotalXp >= nextLevel.xpRequired) {
      setTimeout(() => setShowLevelUp(true), 1500);
      setTimeout(() => setShowLevelUp(false), 4500);
    }

    setTimeout(() => {
      setShowSuccess(false);
      setShowConfetti(false);
      setSelectedSource(null);
      setDescription('');
    }, 3000);
  }, [selectedSource, description, onNewEntry, stats.total_xp, nextLevel]);

  // Format Datum
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // ============================================
  // RENDER: TAB CONTENT
  // ============================================

  // TAB 1: Neuer Eintrag
  const renderNewEntryTab = () => (
    <div className="tab-content new-entry-tab">
      <AnimatePresence mode="wait">
        {showSuccess ? (
          // SUCCESS SCREEN 🎉
          <motion.div
            key="success"
            className="success-screen"
            initial="initial"
            animate="animate"
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <motion.div variants={successVariants} className="success-emoji">
              🎉
            </motion.div>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Fantastisch!
            </motion.h3>
            <motion.div variants={xpPopVariants} className="xp-earned">
              +{earnedXp} XP
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Dein Eintrag wurde gespeichert!
            </motion.p>
          </motion.div>
        ) : (
          // ENTRY FORM
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.p
              className="tab-intro"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Wähle eine der 4 Quellen der Selbstwirksamkeit:
            </motion.p>

            {/* Die 4 Quellen-Karten */}
            <motion.div
              className="sources-grid"
              variants={cardContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {(Object.keys(BANDURA_SOURCES) as BanduraSourceId[]).map((sourceId, index) => {
                const source = BANDURA_SOURCES[sourceId];
                const isSelected = selectedSource === sourceId;
                const entryCount = entriesBySource[sourceId]?.length || 0;

                return (
                  <motion.div
                    key={sourceId}
                    className={`source-card ${isSelected ? 'selected' : ''}`}
                    variants={cardVariants}
                    whileHover="hover"
                    whileTap="tap"
                    animate={isSelected ? 'selected' : 'idle'}
                    onClick={() => setSelectedSource(sourceId)}
                    style={{
                      '--source-color': source.color,
                      '--source-glow': `${source.color}66`
                    } as React.CSSProperties}
                  >
                    {/* Glow-Effekt bei Selection */}
                    {isSelected && (
                      <motion.div
                        className="glow-ring"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                          opacity: [0.5, 0.8, 0.5],
                          scale: [1, 1.05, 1]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ borderColor: source.color }}
                      />
                    )}

                    <div className="source-icon-wrapper">
                      <FloatingEmoji emoji={source.icon} delay={index * 0.2} />
                    </div>

                    <h4>{source.name_de}</h4>
                    <p className="source-desc">{source.description}</p>

                    <div className="source-footer">
                      <span className="source-xp">+{source.xp} XP</span>
                      <span className="source-count">{entryCount} ✓</span>
                    </div>

                    {isSelected && (
                      <motion.div
                        className="check-badge"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring' as const, stiffness: 500 }}
                      >
                        ✓
                      </motion.div>
                    )}

                    {/* Sparkles bei Hover */}
                    {isSelected && <Sparkles color={source.color} />}
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Eingabe-Formular */}
            <AnimatePresence>
              {selectedSource && (
                <motion.div
                  className="entry-form"
                  initial={{ opacity: 0, height: 0, y: 20 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: 20 }}
                  transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
                >
                  <div className="form-header">
                    <span className="form-icon">{BANDURA_SOURCES[selectedSource].icon}</span>
                    <span className="form-prompt">{BANDURA_SOURCES[selectedSource].prompt}</span>
                  </div>

                  <p className="form-examples">
                    <strong>Beispiele:</strong> {BANDURA_SOURCES[selectedSource].examples.join(' • ')}
                  </p>

                  <motion.textarea
                    className="entry-textarea"
                    placeholder="Beschreibe deine Erfahrung..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={4}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  />

                  <div className="form-footer">
                    <span className="char-count">
                      {description.trim().length}/10 Zeichen
                      {description.length > 50 && (
                        <motion.span
                          className="bonus-hint"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          +5 XP Bonus! ✨
                        </motion.span>
                      )}
                    </span>

                    {/* PULSIERENDER SAVE BUTTON */}
                    <motion.button
                      className={`save-btn ${description.trim().length >= 10 ? 'ready' : ''}`}
                      onClick={handleSubmit}
                      disabled={description.trim().length < 10}
                      animate={description.trim().length >= 10 ? {
                        scale: [1, 1.03, 1],
                        boxShadow: [
                          '0 0 0 0 rgba(102, 126, 234, 0.7)',
                          '0 0 0 12px rgba(102, 126, 234, 0)',
                          '0 0 0 0 rgba(102, 126, 234, 0)'
                        ]
                      } : {}}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                      whileHover={description.trim().length >= 10 ? { scale: 1.08 } : {}}
                      whileTap={description.trim().length >= 10 ? { scale: 0.95 } : {}}
                    >
                      {description.trim().length < 10
                        ? `Noch ${10 - description.trim().length} Zeichen...`
                        : '✨ Speichern!'
                      }
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // TAB 2: Übersicht
  const renderOverviewTab = () => (
    <div className="tab-content overview-tab">
      {/* Level-Header */}
      <motion.div
        className="stats-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="level-display">
          <motion.div
            className="level-icon"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {levelInfo.icon}
          </motion.div>
          <div className="level-info">
            <span className="level-name">Level {stats.level} - {levelInfo.name}</span>
            <div className="xp-bar-container">
              <motion.div
                className="xp-bar-fill"
                variants={progressVariants}
                initial="initial"
                animate="animate"
                custom={xpProgress}
              >
                {/* Glitzer am Ende des Balkens */}
                <motion.div
                  className="bar-sparkle"
                  animate={{ opacity: [0.5, 1, 0.5], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </motion.div>
            </div>
            <span className="xp-text">{stats.total_xp} / {nextLevel?.xpRequired || '∞'} XP</span>
          </div>
        </div>

        {/* Stats-Grid */}
        <motion.div
          className="stats-grid"
          variants={cardContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {[
            { icon: '📝', value: stats.total_entries, label: 'Einträge' },
            { icon: '🔥', value: stats.current_streak, label: 'Tage Streak' },
            { icon: '🏅', value: stats.longest_streak, label: 'Bester Streak' },
            { icon: '🌟', value: stats.all_four_days, label: 'Alle-4 Tage' }
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="stat-card"
              variants={cardVariants}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <span className="stat-icon">{stat.icon}</span>
              <motion.span
                className="stat-value"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1, type: 'spring' as const }}
              >
                {stat.value}
              </motion.span>
              <span className="stat-label">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Fortschritt pro Quelle */}
      <h4 className="section-title">📊 Fortschritt pro Quelle</h4>
      <motion.div
        className="progress-list"
        variants={cardContainerVariants}
        initial="hidden"
        animate="visible"
      >
        {(Object.keys(BANDURA_SOURCES) as BanduraSourceId[]).map((sourceId, index) => {
          const source = BANDURA_SOURCES[sourceId];
          const count = stats.entries_per_source[sourceId] || 0;
          const maxCount = 20;
          const progress = Math.min((count / maxCount) * 100, 100);

          return (
            <motion.div
              key={sourceId}
              className="progress-item"
              variants={cardVariants}
              whileHover={{ x: 5 }}
            >
              <div className="progress-header">
                <FloatingEmoji emoji={source.icon} delay={index * 0.1} />
                <span className="progress-name">{source.name_de}</span>
                <span className="progress-count">{count}/{maxCount}</span>
              </div>
              <div className="progress-bar-bg">
                <motion.div
                  className="progress-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ delay: 0.5 + index * 0.15, duration: 1, ease: 'easeOut' as const }}
                  style={{ background: `linear-gradient(90deg, ${source.color}, ${source.color}99)` }}
                >
                  {progress > 10 && (
                    <motion.div
                      className="bar-sparkle"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Badges Teaser */}
      <motion.div
        className="badges-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <h4 className="section-title">🏆 Nächste Badges</h4>
        <div className="badges-preview">
          {stats.total_entries < 1 && (
            <motion.div className="badge-item" whileHover={{ scale: 1.05 }}>
              <span className="badge-icon">🔬</span>
              <span className="badge-name">Bandura-Entdecker</span>
              <span className="badge-hint">1 Eintrag</span>
            </motion.div>
          )}
          {(stats.entries_per_source.mastery || 0) < 5 && (
            <motion.div className="badge-item" whileHover={{ scale: 1.05 }}>
              <span className="badge-icon">🏆</span>
              <span className="badge-name">Erfolgs-Sammler</span>
              <span className="badge-hint">{5 - (stats.entries_per_source.mastery || 0)} Mastery</span>
            </motion.div>
          )}
          {stats.longest_streak < 7 && (
            <motion.div className="badge-item" whileHover={{ scale: 1.05 }}>
              <span className="badge-icon">📅</span>
              <span className="badge-name">Bandura-Woche</span>
              <span className="badge-hint">7 Tage Streak</span>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );

  // TAB 3: Portfolio
  const renderPortfolioTab = () => (
    <div className="tab-content portfolio-tab">
      <div className="portfolio-header">
        <h4>📋 Dein Selbstwirksamkeits-Portfolio</h4>
        <motion.button
          className="certificate-btn"
          onClick={() => setShowCertificate(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🏆 Urkunde anzeigen
        </motion.button>
      </div>

      <motion.div
        variants={cardContainerVariants}
        initial="hidden"
        animate="visible"
      >
        {(Object.keys(BANDURA_SOURCES) as BanduraSourceId[]).map(sourceId => {
          const source = BANDURA_SOURCES[sourceId];
          const sourceEntries = entriesBySource[sourceId] || [];

          return (
            <motion.div
              key={sourceId}
              className="portfolio-section"
              variants={cardVariants}
            >
              <div className="portfolio-section-header" style={{ borderLeftColor: source.color }}>
                <span className="section-icon">{source.icon}</span>
                <span className="section-name">{source.name_de}</span>
                <span className="section-count">{sourceEntries.length} Einträge</span>
              </div>

              {sourceEntries.length > 0 ? (
                <motion.div className="portfolio-entries">
                  {sourceEntries.slice(0, 5).map((entry, i) => (
                    <motion.div
                      key={entry.id}
                      className="portfolio-entry"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.08)' }}
                    >
                      <p className="entry-text">{entry.description}</p>
                      <span className="entry-date">{formatDate(entry.created_at)}</span>
                    </motion.div>
                  ))}
                  {sourceEntries.length > 5 && (
                    <p className="more-entries">+{sourceEntries.length - 5} weitere...</p>
                  )}
                </motion.div>
              ) : (
                <p className="no-entries">Noch keine Einträge</p>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );

  // TAB 4: Verlauf
  const renderHistoryTab = () => {
    const sortedEntries = [...entries].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return (
      <div className="tab-content history-tab">
        <h4 className="section-title">📜 Dein Verlauf</h4>

        {sortedEntries.length > 0 ? (
          <motion.div
            className="timeline"
            variants={cardContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {sortedEntries.map((entry, index) => {
              const source = BANDURA_SOURCES[entry.source_type];
              return (
                <motion.div
                  key={entry.id}
                  className="timeline-item"
                  variants={timelineVariants}
                  whileHover={{ x: 10 }}
                >
                  <motion.div
                    className="timeline-marker"
                    style={{ backgroundColor: source.color }}
                    whileHover={{ scale: 1.2 }}
                  >
                    {source.icon}
                  </motion.div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <span className="timeline-source">{source.name_de}</span>
                      <motion.span
                        className="timeline-xp"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + index * 0.05 }}
                      >
                        +{entry.xp_earned} XP
                      </motion.span>
                    </div>
                    <p className="timeline-text">{entry.description}</p>
                    <span className="timeline-date">{formatDate(entry.created_at)}</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            className="empty-state"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.span
              className="empty-icon"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              📭
            </motion.span>
            <p>Noch keine Einträge vorhanden.</p>
            <p>Starte mit deinem ersten Eintrag!</p>
          </motion.div>
        )}
      </div>
    );
  };

  // ============================================
  // RENDER: CERTIFICATE MODAL
  // ============================================
  const renderCertificate = () => {
    const today = new Date().toLocaleDateString('de-DE');
    const counts = {
      mastery: stats.entries_per_source.mastery || 0,
      vicarious: stats.entries_per_source.vicarious || 0,
      persuasion: stats.entries_per_source.persuasion || 0,
      physiological: stats.entries_per_source.physiological || 0
    };

    return (
      <motion.div
        className="certificate-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowCertificate(false)}
      >
        <motion.div
          className="certificate-modal"
          initial={{ scale: 0.5, y: 100, rotateX: -30 }}
          animate={{ scale: 1, y: 0, rotateX: 0 }}
          exit={{ scale: 0.5, y: 100 }}
          transition={{ type: 'spring' as const, stiffness: 200, damping: 20 }}
          onClick={e => e.stopPropagation()}
        >
          <button className="cert-close" onClick={() => setShowCertificate(false)}>✕</button>

          <div className="certificate">
            {/* Siegel mit Animation */}
            <motion.div
              className="cert-seal"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: 'spring' as const, stiffness: 200 }}
            >
              🏆
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              URKUNDE
            </motion.h1>

            <motion.div
              className="cert-divider"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            />

            <motion.p
              className="cert-subtitle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Selbstwirksamkeits-Portfolio
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <p className="cert-intro">Hiermit wird bestätigt, dass</p>
              <h2 className="cert-name">{userName}</h2>
              <p className="cert-intro">folgende Quellen gesammelt hat:</p>
            </motion.div>

            {/* Quellen-Stats mit tatsächlichen Einträgen */}
            <motion.div
              className="cert-sources"
              variants={cardContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {[
                { id: 'mastery', icon: '🏆', label: 'Eigene Erfolge', color: '#4CAF50' },
                { id: 'vicarious', icon: '👀', label: 'Vorbild-Erfahrungen', color: '#2196F3' },
                { id: 'persuasion', icon: '💬', label: 'Ermutigungen', color: '#9C27B0' },
                { id: 'physiological', icon: '🧘', label: 'Stress-Strategien', color: '#FF9800' }
              ].map((src) => {
                const sourceEntries = entriesBySource[src.id as BanduraSourceId] || [];
                return (
                  <motion.div
                    key={src.id}
                    className="cert-source"
                    variants={cardVariants}
                    style={{ borderColor: src.color }}
                  >
                    <div className="cert-src-header">
                      <span className="cert-src-icon">{src.icon}</span>
                      <span className="cert-src-label">{src.label}</span>
                    </div>
                    <div className="cert-src-entries">
                      {sourceEntries.length > 0 ? (
                        sourceEntries.slice(0, 5).map((entry, i) => (
                          <motion.p
                            key={entry.id}
                            className="cert-entry-text"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1 + i * 0.1 }}
                          >
                            • {entry.description}
                          </motion.p>
                        ))
                      ) : (
                        <p className="cert-no-entries">Noch keine Einträge</p>
                      )}
                      {sourceEntries.length > 5 && (
                        <p className="cert-more-entries">+{sourceEntries.length - 5} weitere...</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Stats-Bar */}
            <motion.div
              className="cert-stats-bar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <div className="cert-stat">
                <span className="cert-stat-icon">{levelInfo.icon}</span>
                <span className="cert-stat-value">Level {stats.level}</span>
              </div>
              <div className="cert-stat">
                <span className="cert-stat-icon">⭐</span>
                <span className="cert-stat-value">{stats.total_xp} XP</span>
              </div>
              <div className="cert-stat">
                <span className="cert-stat-icon">🔥</span>
                <span className="cert-stat-value">{stats.longest_streak} Tage</span>
              </div>
              <div className="cert-stat">
                <span className="cert-stat-icon">📝</span>
                <span className="cert-stat-value">{stats.total_entries}</span>
              </div>
            </motion.div>

            {/* Footer */}
            <motion.div
              className="cert-footer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
            >
              <motion.div
                className="cert-stamp"
                initial={{ scale: 0, rotate: 45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 1.5, type: 'spring' as const }}
              >
                🧠
              </motion.div>
              <p className="cert-date">Ausgestellt am {today}</p>
              <p className="cert-credit">Basierend auf Albert Bandura (1977)</p>
            </motion.div>
          </div>

          <motion.button
            className="print-btn"
            onClick={() => window.print()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🖨️ Urkunde drucken
          </motion.button>
        </motion.div>
      </motion.div>
    );
  };

  // ============================================
  // RENDER: LEVEL UP OVERLAY
  // ============================================
  const renderLevelUp = () => (
    <motion.div
      className="levelup-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Confetti
        width={windowSize.width}
        height={windowSize.height}
        recycle={false}
        numberOfPieces={500}
        colors={CONFETTI_COLORS}
        gravity={0.2}
      />
      <motion.div
        className="levelup-content"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: [0, 1.3, 1], rotate: [0, 360] }}
        transition={{ duration: 0.8 }}
      >
        <span className="levelup-emoji">⬆️</span>
        <h2>LEVEL UP!</h2>
        <p>Du bist jetzt Level {stats.level + 1}!</p>
      </motion.div>
    </motion.div>
  );

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div className="bandura-container">
      {/* ECHTE KONFETTI! 🎉 */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={300}
          colors={CONFETTI_COLORS}
          gravity={0.3}
          initialVelocityY={20}
        />
      )}

      {/* Header */}
      <motion.div
        className="bandura-header"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring' as const, stiffness: 300 }}
      >
        <div className="header-title">
          <motion.span
            className="header-icon"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            🧠
          </motion.span>
          <div>
            <h3>Bandura-Challenge</h3>
            <p>Die 4 Quellen der Selbstwirksamkeit</p>
          </div>
        </div>
        {onClose && (
          <motion.button
            className="close-btn"
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            ✕
          </motion.button>
        )}
      </motion.div>

      {/* Tab Navigation */}
      <div className="tab-nav">
        {TABS.map((tab, index) => (
          <motion.button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div
                className="tab-indicator"
                layoutId="tabIndicator"
                transition={{ type: 'spring' as const, stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* Tab Content mit AnimatePresence */}
      <div className="tab-content-wrapper">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={tabContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {activeTab === 'new' && renderNewEntryTab()}
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'portfolio' && renderPortfolioTab()}
            {activeTab === 'history' && renderHistoryTab()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Certificate Modal */}
      <AnimatePresence>
        {showCertificate && renderCertificate()}
      </AnimatePresence>

      {/* Level Up Overlay */}
      <AnimatePresence>
        {showLevelUp && renderLevelUp()}
      </AnimatePresence>
    </div>
  );
}

export default BanduraChallenge;
