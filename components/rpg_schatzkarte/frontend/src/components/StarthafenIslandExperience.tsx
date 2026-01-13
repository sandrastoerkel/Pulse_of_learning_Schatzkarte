// ============================================
// Starthafen Island Experience - Tutorial & Einführung
// Schöne Animationen wie die anderen Inseln
// ============================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AgeGroup } from '../types';
import '../styles/starthafen-island.css';

// ============================================
// TYPES
// ============================================

interface StarthafenIslandProps {
  ageGroup: AgeGroup;
  onClose: () => void;
  onQuestComplete: (questType: string, xp: number, gold?: number) => void;
}

interface FeatureCard {
  id: string;
  icon: string;
  title: string;
  description: string;
  color: string;
  details: string[];
}

// ============================================
// CONTENT
// ============================================

const FEATURE_CARDS: FeatureCard[] = [
  {
    id: 'islands',
    icon: '🏝️',
    title: 'Die Inseln',
    description: 'Jede Insel hat ein Lernthema',
    color: '#81c784',
    details: [
      '📜 Lernvideo anschauen',
      '📖 Schriftrolle studieren',
      '⚔️ Quiz-Kampf bestehen',
      '🏆 Challenge meistern'
    ]
  },
  {
    id: 'ships',
    icon: '🚢',
    title: 'Die Schiffe',
    description: 'Zwei besondere Begleiter',
    color: '#ffb74d',
    details: [
      '🌟 Der goldene Schlüssel - Erfolge sammeln',
      '🎯 Superpower - Selbsteinschätzung trainieren'
    ]
  },
  {
    id: 'xp',
    icon: '⭐',
    title: 'XP & Level',
    description: 'Werde stärker mit jeder Quest',
    color: '#ba68c8',
    details: [
      '⭐ XP für jede abgeschlossene Aufgabe',
      '🏅 Level aufsteigen',
      '🪙 Gold für besondere Items'
    ]
  },
  {
    id: 'treasures',
    icon: '💎',
    title: 'Schätze',
    description: 'Sammle wertvolle Belohnungen',
    color: '#4fc3f7',
    details: [
      '💎 Jede Insel hat versteckte Schätze',
      '🧭 Der Kompass der Reise wartet hier auf dich!'
    ]
  }
];

const WELCOME_MESSAGES: Record<AgeGroup, { title: string; intro: string }> = {
  grundschule: {
    title: 'Willkommen, junger Abenteurer!',
    intro: 'Du stehst am Anfang einer aufregenden Lernreise! Hier im Starthafen erfährst du, wie alles funktioniert. Bist du bereit, die Welt des Wissens zu entdecken?'
  },
  unterstufe: {
    title: 'Willkommen an Bord!',
    intro: 'Der Starthafen ist dein Tor zu einer Reise durch die Welt des effektiven Lernens. Hier lernst du die wichtigsten Werkzeuge und Strategien kennen, die dich zum Lern-Meister machen.'
  },
  mittelstufe: {
    title: 'Willkommen, angehender Lern-Meister!',
    intro: 'Diese Schatzkarte führt dich durch evidenzbasierte Lernstrategien. Jede Insel repräsentiert ein wissenschaftlich fundiertes Konzept, das dein Lernen revolutionieren wird.'
  },
  oberstufe: {
    title: 'Willkommen zur Lernreise!',
    intro: 'Hier findest du die effektivsten Lernstrategien, basierend auf aktueller Forschung. Navigiere durch die Inseln und entdecke, wie du dein volles Potenzial entfalten kannst.'
  },
  paedagoge: {
    title: 'Willkommen, Lern-Experte!',
    intro: 'Diese Plattform vermittelt evidenzbasierte Lernstrategien auf spielerische Weise. Entdecken Sie die didaktischen Konzepte hinter jeder Insel.'
  }
};

// ============================================
// HAUPT-KOMPONENTE
// ============================================

export function StarthafenIslandExperience({
  ageGroup,
  onClose,
  onQuestComplete,
}: StarthafenIslandProps) {
  const [currentPhase, setCurrentPhase] = useState<'welcome' | 'features' | 'ready'>('welcome');
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);
  const [totalXP, setTotalXP] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [treasureCollected, setTreasureCollected] = useState(false);

  const welcomeContent = WELCOME_MESSAGES[ageGroup] || WELCOME_MESSAGES.grundschule;

  // Quest abschließen
  const completeIntro = () => {
    setTotalXP(prev => prev + 10);
    onQuestComplete('scroll', 10, 2);
    setCurrentPhase('features');
  };

  const completeFeatures = () => {
    setTotalXP(prev => prev + 15);
    onQuestComplete('wisdom', 15, 3);
    setCurrentPhase('ready');
  };

  const collectTreasure = () => {
    if (!treasureCollected) {
      setTreasureCollected(true);
      setTotalXP(prev => prev + 20);
      setShowConfetti(true);
      onQuestComplete('challenge', 20, 5);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  };

  const startAdventure = () => {
    onClose();
  };

  return (
    <div className="starthafen-island">
      {/* Header */}
      <div className="island-header">
        <button className="back-btn" onClick={onClose}>
          ← Zurück
        </button>
        <h1 className="island-title">
          <motion.span
            className="title-icon"
            animate={{ y: [0, -5, 0], rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            🚢
          </motion.span>
          Starthafen
        </h1>
        <div className="xp-badge">
          <motion.span
            className="xp-icon"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            ⭐
          </motion.span>
          <span className="xp-amount">{totalXP} XP</span>
        </div>
      </div>

      {/* Subtitle */}
      <motion.div
        className="island-subtitle-bar"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="subtitle-text">Dein Tor zur Lernreise</span>
        <span className="week-badge">Tutorial</span>
      </motion.div>

      {/* Progress Steps */}
      <div className="progress-steps">
        <motion.div
          className={`step ${currentPhase === 'welcome' ? 'active' : 'completed'}`}
          whileHover={{ scale: 1.05 }}
        >
          <span className="step-icon">👋</span>
          <span className="step-label">Willkommen</span>
        </motion.div>
        <div className="step-connector" />
        <motion.div
          className={`step ${currentPhase === 'features' ? 'active' : currentPhase === 'ready' ? 'completed' : ''}`}
          whileHover={{ scale: 1.05 }}
        >
          <span className="step-icon">🗺️</span>
          <span className="step-label">Entdecken</span>
        </motion.div>
        <div className="step-connector" />
        <motion.div
          className={`step ${currentPhase === 'ready' ? 'active' : ''}`}
          whileHover={{ scale: 1.05 }}
        >
          <span className="step-icon">🚀</span>
          <span className="step-label">Loslegen</span>
        </motion.div>
      </div>

      {/* Konfetti */}
      {showConfetti && <ConfettiEffect />}

      {/* Hauptinhalt */}
      <AnimatePresence mode="wait">
        {/* PHASE 1: Willkommen */}
        {currentPhase === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="phase-content welcome-phase"
          >
            <motion.div
              className="welcome-icon"
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              ⛵
            </motion.div>

            <h2 className="welcome-title">{welcomeContent.title}</h2>

            <motion.p
              className="welcome-intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {welcomeContent.intro}
            </motion.p>

            <motion.div
              className="captain-speech"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="captain-avatar">🧙‍♂️</div>
              <div className="speech-bubble">
                <p>
                  <strong>Kapitän Wissen:</strong> "Ahoi! Ich bin dein Begleiter auf dieser Reise.
                  Lass mich dir zeigen, was dich hier erwartet!"
                </p>
              </div>
            </motion.div>

            <motion.button
              className="action-btn primary"
              onClick={completeIntro}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Los geht's! +10 XP
            </motion.button>
          </motion.div>
        )}

        {/* PHASE 2: Features entdecken */}
        {currentPhase === 'features' && (
          <motion.div
            key="features"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="phase-content features-phase"
          >
            <h2 className="features-title">Was erwartet dich?</h2>
            <p className="features-subtitle">Tippe auf eine Karte, um mehr zu erfahren!</p>

            <div className="features-grid">
              {FEATURE_CARDS.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  className={`feature-card ${expandedFeature === feature.id ? 'expanded' : ''}`}
                  style={{ '--feature-color': feature.color } as React.CSSProperties}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setExpandedFeature(
                    expandedFeature === feature.id ? null : feature.id
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="feature-header">
                    <motion.span
                      className="feature-icon"
                      animate={expandedFeature === feature.id ? { rotate: [0, 10, -10, 0] } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      {feature.icon}
                    </motion.span>
                    <div className="feature-text">
                      <h3>{feature.title}</h3>
                      <p>{feature.description}</p>
                    </div>
                    <span className="expand-arrow">
                      {expandedFeature === feature.id ? '▲' : '▼'}
                    </span>
                  </div>

                  <AnimatePresence>
                    {expandedFeature === feature.id && (
                      <motion.div
                        className="feature-details"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <ul>
                          {feature.details.map((detail, i) => (
                            <motion.li
                              key={i}
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: i * 0.1 }}
                            >
                              {detail}
                            </motion.li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            <motion.button
              className="action-btn primary"
              onClick={completeFeatures}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Verstanden! +15 XP
            </motion.button>
          </motion.div>
        )}

        {/* PHASE 3: Bereit für die Reise */}
        {currentPhase === 'ready' && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="phase-content ready-phase"
          >
            <motion.div
              className="ready-icon"
              animate={{
                y: [0, -15, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              🎉
            </motion.div>

            <h2 className="ready-title">Du bist bereit!</h2>

            <p className="ready-text">
              Du hast den Starthafen erkundet. Bevor du in See stichst,
              sammle deinen ersten Schatz!
            </p>

            {/* Schatz */}
            <motion.div
              className={`treasure-card ${treasureCollected ? 'collected' : ''}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              onClick={collectTreasure}
              whileHover={!treasureCollected ? { scale: 1.05, rotate: [0, -2, 2, 0] } : {}}
              whileTap={!treasureCollected ? { scale: 0.95 } : {}}
            >
              <motion.span
                className="treasure-icon"
                animate={!treasureCollected ? {
                  y: [0, -5, 0],
                  rotate: [0, 5, -5, 0]
                } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                {treasureCollected ? '✨' : '🧭'}
              </motion.span>
              <div className="treasure-info">
                <h3>Kompass der Reise</h3>
                <p>{treasureCollected ? 'Gesammelt!' : 'Klicke um zu sammeln'}</p>
                <span className="treasure-xp">+20 XP</span>
              </div>
              {treasureCollected && (
                <motion.div
                  className="collected-badge"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                >
                  ✓
                </motion.div>
              )}
            </motion.div>

            {/* Reise-Tipps */}
            <motion.div
              className="journey-tips"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <h4>🗺️ Tipps für deine Reise</h4>
              <ul>
                <li>Beginne mit der <strong>Festung der Stärke</strong> (Woche 1)</li>
                <li>Schließe alle Quests einer Insel ab für Bonus-XP</li>
                <li>Besuche regelmäßig die Schiffe für Extra-Punkte</li>
              </ul>
            </motion.div>

            <motion.button
              className="action-btn start-adventure"
              onClick={startAdventure}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <span className="btn-icon">⛵</span>
              <span className="btn-text">Abenteuer starten!</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// KONFETTI EFFEKT
// ============================================

function ConfettiEffect() {
  const colors = ['#4fc3f7', '#29b6f6', '#03a9f4', '#039be5', '#0288d1', '#81d4fa'];
  const confetti = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
    size: 8 + Math.random() * 8,
  }));

  return (
    <div className="confetti-container">
      {confetti.map((c) => (
        <motion.div
          key={c.id}
          className="confetti-piece"
          style={{
            left: `${c.x}%`,
            width: c.size,
            height: c.size,
            background: c.color,
          }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{
            y: '100vh',
            opacity: 0,
            rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
          }}
          transition={{
            duration: c.duration,
            delay: c.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

export default StarthafenIslandExperience;
