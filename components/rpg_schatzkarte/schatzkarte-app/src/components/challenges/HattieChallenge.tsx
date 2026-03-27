// ============================================
// RPG Schatzkarte - Hattie Challenge Component
// 🎯 MIT ECHTEN WOW-EFFEKTEN!
// NEU: Vorhersagen anlegen & später Ergebnis eintragen
// ============================================
import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { VoiceButton } from '@/components/VoiceTextInput';
import { HattieWaageIcon } from '@/components/icons';

import type {
  HattieSubjectId,
  HattieEntry,
  HattieStats,
  HattieChallengeProps,
  HattieStep,
  HattieFormState,
  PredictionType,
  HattieSubject,
  HattieTabId,
  LevelInfo
} from '@/types/hattieTypes';

// ============================================
// KONFIGURATION
// ============================================

// Fächer mit Icons und Farben
const HATTIE_SUBJECTS: Record<HattieSubjectId, HattieSubject> = {
  math: { id: 'math', name: 'Mathematik', icon: '🔢', color: '#2196F3' },
  german: { id: 'german', name: 'Deutsch', icon: '📝', color: '#4CAF50' },
  english: { id: 'english', name: 'Englisch', icon: '🇬🇧', color: '#F44336' },
  science: { id: 'science', name: 'Naturwissenschaften', icon: '🔬', color: '#9C27B0' },
  history: { id: 'history', name: 'Geschichte', icon: '📜', color: '#FF9800' },
  art: { id: 'art', name: 'Kunst', icon: '🎨', color: '#E91E63' },
  sport: { id: 'sport', name: 'Sport', icon: '⚽', color: '#00BCD4' },
  music: { id: 'music', name: 'Musik', icon: '🎵', color: '#673AB7' },
  other: { id: 'other', name: 'Sonstiges', icon: '📚', color: '#607D8B' }
};

// Schritte für neue Vorhersage
const PREDICTION_STEPS: { step: HattieStep; title: string; icon: string }[] = [
  { step: 1, title: 'Fach', icon: '📚' },
  { step: 2, title: 'Prüfung', icon: '📝' },
  { step: 3, title: 'Vorhersage', icon: '🎯' },
  { step: 4, title: 'Fertig', icon: '✅' }
];

// Tabs
const TABS: { id: HattieTabId; icon: string; label: string }[] = [
  { id: 'new', icon: '🎯', label: 'Neue Vorhersage' },
  { id: 'pending', icon: '⏳', label: 'Offen' },
  { id: 'history', icon: '📜', label: 'Verlauf' },
  { id: 'stats', icon: '📊', label: 'Statistik' }
];

// Level-System
const LEVEL_INFO: Record<number, LevelInfo> = {
  1: { icon: '🌱', name: 'Anfänger', xpRequired: 0 },
  2: { icon: '🔍', name: 'Beobachter', xpRequired: 50 },
  3: { icon: '📏', name: 'Einschätzer', xpRequired: 150 },
  4: { icon: '🎯', name: 'Zielsetzer', xpRequired: 300 },
  5: { icon: '📈', name: 'Übertreffer', xpRequired: 500 },
  6: { icon: '🏆', name: 'Experte', xpRequired: 750 },
  7: { icon: '⭐', name: 'Meister', xpRequired: 1000 },
  8: { icon: '👑', name: 'Champion', xpRequired: 1500 }
};

// XP-Konfiguration
const XP_CONFIG = {
  base: 15,
  exceeded_bonus: 25,
  exact_bonus: 15,
  long_task_bonus: 5,
  reflection_bonus: 5
};

// Konfetti-Farben
const CONFETTI_COLORS = ['#667eea', '#764ba2', '#f093fb', 'var(--fb-reward)', '#00ff88', '#4CAF50', '#4ecdc4'];

// ============================================
// ANIMATION VARIANTS
// ============================================

const cardContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 20 }
  }
};

const stepperVariants = {
  inactive: { scale: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  active: {
    scale: 1.15,
    backgroundColor: '#667eea',
    transition: { type: 'spring' as const, stiffness: 400 }
  },
  completed: {
    scale: 1,
    backgroundColor: '#4CAF50',
    transition: { type: 'spring' as const, stiffness: 300 }
  }
};

const tabContentVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 25 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
};

const successVariants = {
  initial: { scale: 0, rotate: -180 },
  animate: {
    scale: [0, 1.4, 1],
    rotate: [0, 10, -10, 0],
    transition: { type: 'spring' as const, stiffness: 200, damping: 15 }
  }
};

const celebrationVariants = {
  initial: { opacity: 0, scale: 0.8, y: 50 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 200, damping: 20 }
  },
  exit: { opacity: 0, scale: 0.8, y: -50 }
};

// ============================================
// HELPER COMPONENTS
// ============================================

function FloatingEmoji({ emoji, delay = 0 }: { emoji: string; delay?: number }) {
  return (
    <motion.span
      className="hattie-floating-emoji"
      animate={{
        y: [0, -6, 0],
        rotate: [0, 3, -3, 0]
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

function Sparkles({ color }: { color: string }) {
  return (
    <div className="hattie-sparkles-container">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="hattie-sparkle"
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

function PulsingGlow({ color }: { color: string }) {
  return (
    <motion.div
      className="hattie-pulsing-glow"
      style={{ borderColor: color, boxShadow: `0 0 20px ${color}40` }}
      animate={{
        opacity: [0.5, 0.8, 0.5],
        scale: [1, 1.02, 1]
      }}
      transition={{ duration: 2, repeat: Infinity }}
    />
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export function HattieChallenge({
  entries,
  stats,
  userName = 'Lernender',
  onNewPrediction,
  onCompleteEntry,
  onClose
}: HattieChallengeProps) {
  // === STATE ===
  const [activeTab, setActiveTab] = useState<HattieTabId>('new');
  const [currentStep, setCurrentStep] = useState<HattieStep>(1);
  const [formState, setFormState] = useState<HattieFormState>({
    subject: null,
    task: '',
    predictionType: 'prozent',
    prediction: 70,
    testDate: '',
    result: 70,
    reflection: ''
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{
    exceeded: boolean;
    prediction: number;
    result: number;
    predictionType: PredictionType;
    xp: number;
  } | null>(null);
  const [selectedPendingEntry, setSelectedPendingEntry] = useState<HattieEntry | null>(null);
  const [windowSize, setWindowSize] = useState({ width: 800, height: 600 });

  // === EFFECTS ===
  useEffect(() => {
    const updateSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // === COMPUTED VALUES ===
  const pendingEntries = useMemo(() =>
    entries.filter(e => e.status === 'pending'),
    [entries]
  );

  const completedEntries = useMemo(() =>
    entries.filter(e => e.status === 'completed'),
    [entries]
  );

  const levelInfo = useMemo(() => LEVEL_INFO[stats.level] || LEVEL_INFO[1], [stats.level]);
  const nextLevel = useMemo(() => LEVEL_INFO[stats.level + 1], [stats.level]);
  const xpProgress = useMemo(() => {
    if (!nextLevel) return 100;
    return ((stats.total_xp - levelInfo.xpRequired) / (nextLevel.xpRequired - levelInfo.xpRequired)) * 100;
  }, [stats.total_xp, levelInfo, nextLevel]);

  // === HANDLERS ===
  const handleSubjectSelect = useCallback((subjectId: HattieSubjectId) => {
    setFormState(prev => ({ ...prev, subject: subjectId }));
  }, []);

  const handleNextStep = useCallback(() => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as HattieStep);
    }
  }, [currentStep]);

  const handlePrevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as HattieStep);
    }
  }, [currentStep]);

  // Neue Vorhersage speichern
  const handleSavePrediction = useCallback(() => {
    if (!formState.subject) return;

    const entry: Omit<HattieEntry, 'id' | 'created_at'> = {
      subject: formState.subject,
      task: formState.task,
      predictionType: formState.predictionType,
      prediction: formState.prediction,
      status: 'pending',
      test_date: formState.testDate || undefined
    };

    onNewPrediction(entry);

    // Reset und Bestätigung zeigen
    setCurrentStep(4);

    // Nach 2 Sekunden zurücksetzen
    setTimeout(() => {
      setCurrentStep(1);
      setFormState({
        subject: null,
        task: '',
        predictionType: 'prozent',
        prediction: 70,
        testDate: '',
        result: 70,
        reflection: ''
      });
      setActiveTab('pending');
    }, 2000);
  }, [formState, onNewPrediction]);

  // Ergebnis für offene Vorhersage eintragen
  const handleCompleteEntry = useCallback(() => {
    if (!selectedPendingEntry) return;

    const result = formState.result;
    const prediction = selectedPendingEntry.prediction;
    const predictionType = selectedPendingEntry.predictionType;

    // Berechne ob übertroffen
    let exceeded = false;
    if (predictionType === 'note') {
      exceeded = result < prediction; // Bei Noten: kleiner = besser
    } else {
      exceeded = result > prediction;
    }

    const wasExact = result === prediction;

    // XP berechnen
    let xp = XP_CONFIG.base;
    if (exceeded) xp += XP_CONFIG.exceeded_bonus;
    if (wasExact) xp += XP_CONFIG.exact_bonus;
    if (selectedPendingEntry.task.length > 50) xp += XP_CONFIG.long_task_bonus;
    if (formState.reflection.length > 20) xp += XP_CONFIG.reflection_bonus;

    // Celebration anzeigen
    setCelebrationData({
      exceeded,
      prediction,
      result,
      predictionType,
      xp
    });
    setShowConfetti(exceeded);
    setShowCelebration(true);

    // Entry abschließen
    onCompleteEntry(selectedPendingEntry.id, result, formState.reflection || undefined);

    // Nach Animation zurücksetzen
    setTimeout(() => {
      setShowCelebration(false);
      setShowConfetti(false);
      setCelebrationData(null);
      setSelectedPendingEntry(null);
      setFormState(prev => ({ ...prev, result: 70, reflection: '' }));
    }, 4000);
  }, [selectedPendingEntry, formState.result, formState.reflection, onCompleteEntry]);

  const formatDate = useCallback((dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  }, []);

  const formatPrediction = useCallback((value: number, type: PredictionType) => {
    switch (type) {
      case 'note': return `Note ${value}`;
      case 'punkte': return `${value} Punkte`;
      case 'prozent': return `${value}%`;
    }
  }, []);

  // === RENDER FUNCTIONS ===

  // Stepper Navigation
  const renderStepper = () => (
    <div className="hattie-stepper">
      {PREDICTION_STEPS.map((step, index) => {
        const isActive = currentStep === step.step;
        const isCompleted = currentStep > step.step;
        const isClickable = step.step < currentStep;

        return (
          <motion.div
            key={step.step}
            className={`hattie-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
            variants={stepperVariants}
            animate={isCompleted ? 'completed' : isActive ? 'active' : 'inactive'}
            onClick={() => isClickable && setCurrentStep(step.step)}
            style={{ cursor: isClickable ? 'pointer' : 'default' }}
            whileHover={isClickable ? { scale: 1.1 } : {}}
          >
            <motion.div className="step-number">
              {isCompleted ? (
                <motion.span
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                >
                  ✓
                </motion.span>
              ) : (
                step.step
              )}
            </motion.div>
            <span className="step-icon">{step.icon}</span>
            <span className="step-title">{step.title}</span>

            {index < PREDICTION_STEPS.length - 1 && (
              <motion.div
                className="step-connector"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: isCompleted ? 1 : 0 }}
                style={{ backgroundColor: isCompleted ? '#4CAF50' : 'rgba(255,255,255,0.2)' }}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );

  // Schritt 1: Fach wählen
  const renderStep1 = () => (
    <motion.div
      className="hattie-step-content"
      variants={tabContentVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <h3 className="step-headline">
        <FloatingEmoji emoji="📚" /> Wähle dein Fach
      </h3>
      <p className="step-description">
        In welchem Fach hast du eine Prüfung oder einen Test?
      </p>

      <motion.div
        className="hattie-subjects-grid"
        variants={cardContainerVariants}
        initial="hidden"
        animate="visible"
      >
        {(Object.keys(HATTIE_SUBJECTS) as HattieSubjectId[]).map((subjectId, index) => {
          const subject = HATTIE_SUBJECTS[subjectId];
          const isSelected = formState.subject === subjectId;

          return (
            <motion.div
              key={subjectId}
              className={`hattie-subject-card ${isSelected ? 'selected' : ''}`}
              variants={cardVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSubjectSelect(subjectId)}
              style={{
                '--subject-color': subject.color,
                '--subject-glow': `${subject.color}66`
              } as React.CSSProperties}
            >
              {isSelected && <PulsingGlow color={subject.color} />}

              <div className="subject-icon-wrapper">
                <FloatingEmoji emoji={subject.icon} delay={index * 0.1} />
              </div>

              <h4>{subject.name}</h4>

              {isSelected && (
                <motion.div
                  className="check-badge"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                  style={{ backgroundColor: subject.color }}
                >
                  ✓
                </motion.div>
              )}

              {isSelected && <Sparkles color={subject.color} />}
            </motion.div>
          );
        })}
      </motion.div>

      <div className="step-actions">
        <motion.button
          className={`hattie-next-btn ${formState.subject ? 'ready' : ''}`}
          onClick={handleNextStep}
          disabled={!formState.subject}
          whileHover={formState.subject ? { scale: 1.05 } : {}}
          whileTap={formState.subject ? { scale: 0.95 } : {}}
        >
          Weiter →
        </motion.button>
      </div>
    </motion.div>
  );

  // Schritt 2: Prüfung beschreiben
  const renderStep2 = () => (
    <motion.div
      className="hattie-step-content"
      variants={tabContentVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <h3 className="step-headline">
        <FloatingEmoji emoji="📝" /> Beschreibe die Prüfung
      </h3>
      <p className="step-description">
        Was für eine Prüfung oder Aufgabe ist es?
      </p>

      <div className="hattie-form-group">
        <label>Prüfung / Test / Aufgabe:</label>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <motion.textarea
            className="hattie-textarea"
            placeholder="z.B. 'Mathe-Klassenarbeit Brüche', 'Englisch-Vokabeltest Unit 5', 'Diktat'..."
            value={formState.task}
            onChange={(e) => setFormState(prev => ({ ...prev, task: e.target.value }))}
            rows={3}
            style={{ flex: 1 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          />
          <VoiceButton
            onResult={(text) => setFormState(prev => ({ ...prev, task: prev.task + (prev.task && !prev.task.endsWith(' ') ? ' ' : '') + text }))}
            size="medium"
          />
        </div>
      </div>

      <div className="hattie-form-group">
        <label>📅 Datum der Prüfung (optional):</label>
        <input
          type="date"
          className="hattie-date-input"
          value={formState.testDate}
          onChange={(e) => setFormState(prev => ({ ...prev, testDate: e.target.value }))}
        />
      </div>

      <div className="hattie-examples">
        <span className="examples-label">💡 Beispiele:</span>
        <div className="example-chips">
          {['Klassenarbeit', 'Vokabeltest', 'Diktat', 'Mündliche Prüfung', 'Referat'].map((example) => (
            <motion.button
              key={example}
              className="example-chip"
              onClick={() => setFormState(prev => ({ ...prev, task: example }))}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {example}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="step-actions">
        <motion.button
          className="hattie-back-btn"
          onClick={handlePrevStep}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ← Zurück
        </motion.button>
        <motion.button
          className={`hattie-next-btn ${formState.task.trim().length >= 3 ? 'ready' : ''}`}
          onClick={handleNextStep}
          disabled={formState.task.trim().length < 3}
          whileHover={formState.task.trim().length >= 3 ? { scale: 1.05 } : {}}
          whileTap={formState.task.trim().length >= 3 ? { scale: 0.95 } : {}}
        >
          Weiter →
        </motion.button>
      </div>
    </motion.div>
  );

  // Schritt 3: Vorhersage abgeben
  const renderStep3 = () => (
    <motion.div
      className="hattie-step-content"
      variants={tabContentVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <h3 className="step-headline">
        <FloatingEmoji emoji="🎯" /> Mache deine Vorhersage
      </h3>
      <p className="step-description">
        Sei ehrlich! Wie gut wirst du abschneiden?
      </p>

      {/* Prediction Type Auswahl */}
      <div className="hattie-prediction-type">
        <span className="type-label">Was möchtest du schätzen?</span>
        <div className="type-buttons">
          {([
            { type: 'prozent' as PredictionType, label: '📈 Prozent', desc: '0-100%' },
            { type: 'punkte' as PredictionType, label: '🎯 Punkte', desc: '0-15' },
            { type: 'note' as PredictionType, label: '📝 Note', desc: '1-6' }
          ]).map(({ type, label, desc }) => (
            <motion.button
              key={type}
              className={`type-btn ${formState.predictionType === type ? 'active' : ''}`}
              onClick={() => setFormState(prev => ({
                ...prev,
                predictionType: type,
                prediction: type === 'note' ? 3 : type === 'punkte' ? 10 : 70
              }))}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="type-label-text">{label}</span>
              <span className="type-desc">{desc}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Prediction Slider */}
      <div className="hattie-prediction-input">
        <motion.div
          className="prediction-display"
          key={formState.prediction}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500 }}
        >
          <span className="prediction-value">
            {formatPrediction(formState.prediction, formState.predictionType)}
          </span>
          <span className="prediction-label">Meine Vorhersage</span>
        </motion.div>

        <input
          type="range"
          className="hattie-slider"
          min={formState.predictionType === 'note' ? 1 : 0}
          max={formState.predictionType === 'note' ? 6 : formState.predictionType === 'punkte' ? 15 : 100}
          step={formState.predictionType === 'prozent' ? 5 : 1}
          value={formState.prediction}
          onChange={(e) => setFormState(prev => ({ ...prev, prediction: parseInt(e.target.value) }))}
        />

        <div className="slider-labels">
          <span>{formState.predictionType === 'note' ? 'Sehr gut (1)' : '0'}</span>
          <span>{formState.predictionType === 'note' ? 'Ungenügend (6)' : formState.predictionType === 'punkte' ? '15' : '100%'}</span>
        </div>
      </div>

      {/* Info Box */}
      <motion.div
        className="hattie-science-box"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <span className="science-icon">💡</span>
        <p>
          Nach der Prüfung kannst du hier dein <strong>echtes Ergebnis</strong> eintragen.
          Wenn du dich übertriffst, bekommst du <strong>Bonus-XP</strong>!
        </p>
      </motion.div>

      <div className="step-actions">
        <motion.button
          className="hattie-back-btn"
          onClick={handlePrevStep}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ← Zurück
        </motion.button>
        <motion.button
          className="hattie-complete-btn"
          onClick={handleSavePrediction}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(102, 126, 234, 0.7)',
              '0 0 0 12px rgba(102, 126, 234, 0)',
              '0 0 0 0 rgba(102, 126, 234, 0)'
            ]
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          ✨ Vorhersage speichern
        </motion.button>
      </div>
    </motion.div>
  );

  // Schritt 4: Bestätigung
  const renderStep4 = () => (
    <motion.div
      className="hattie-step-content"
      variants={tabContentVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.div
        className="hattie-success-message"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <motion.div
          className="success-icon"
          variants={successVariants}
          initial="initial"
          animate="animate"
        >
          ✅
        </motion.div>
        <h3>Vorhersage gespeichert!</h3>
        <p>
          Sobald du dein Ergebnis hast, trag es unter <strong>"Offen"</strong> ein.
        </p>
      </motion.div>
    </motion.div>
  );

  // Tab: Offene Vorhersagen
  const renderPendingTab = () => (
    <motion.div
      className="hattie-pending-tab"
      variants={tabContentVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {selectedPendingEntry ? (
        // Ergebnis-Eingabe für ausgewählten Eintrag
        <div className="hattie-result-entry">
          <h3 className="step-headline">
            <FloatingEmoji emoji="✅" /> Ergebnis eintragen
          </h3>

          <div className="hattie-summary-card">
            <div className="summary-row">
              <span className="summary-label">📚 Fach:</span>
              <span className="summary-value">
                {HATTIE_SUBJECTS[selectedPendingEntry.subject].icon} {HATTIE_SUBJECTS[selectedPendingEntry.subject].name}
              </span>
            </div>
            <div className="summary-row">
              <span className="summary-label">📝 Prüfung:</span>
              <span className="summary-value">{selectedPendingEntry.task}</span>
            </div>
            <div className="summary-row highlight">
              <span className="summary-label">🎯 Deine Vorhersage:</span>
              <span className="summary-value prediction">
                {formatPrediction(selectedPendingEntry.prediction, selectedPendingEntry.predictionType)}
              </span>
            </div>
          </div>

          <p className="step-description">Wie war dein tatsächliches Ergebnis?</p>

          <div className="hattie-result-input">
            <motion.div
              className="result-display"
              key={formState.result}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500 }}
            >
              <span className="result-value">
                {formatPrediction(formState.result, selectedPendingEntry.predictionType)}
              </span>
              <span className="result-label">Tatsächliches Ergebnis</span>
            </motion.div>

            <input
              type="range"
              className="hattie-slider result-slider"
              min={selectedPendingEntry.predictionType === 'note' ? 1 : 0}
              max={selectedPendingEntry.predictionType === 'note' ? 6 : selectedPendingEntry.predictionType === 'punkte' ? 15 : 100}
              step={selectedPendingEntry.predictionType === 'prozent' ? 5 : 1}
              value={formState.result}
              onChange={(e) => setFormState(prev => ({ ...prev, result: parseInt(e.target.value) }))}
            />
          </div>

          <div className="hattie-form-group reflection-group">
            <label>💭 Reflexion (optional):</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <motion.textarea
                className="hattie-textarea reflection-textarea"
                placeholder="Was lief gut? Was könntest du verbessern?"
                value={formState.reflection}
                onChange={(e) => setFormState(prev => ({ ...prev, reflection: e.target.value }))}
                rows={2}
                style={{ flex: 1 }}
              />
              <VoiceButton
                onResult={(text) => setFormState(prev => ({ ...prev, reflection: prev.reflection + (prev.reflection && !prev.reflection.endsWith(' ') ? ' ' : '') + text }))}
                size="medium"
              />
            </div>
          </div>

          <div className="step-actions">
            <motion.button
              className="hattie-back-btn"
              onClick={() => {
                setSelectedPendingEntry(null);
                setFormState(prev => ({ ...prev, result: 70, reflection: '' }));
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ← Abbrechen
            </motion.button>
            <motion.button
              className="hattie-complete-btn"
              onClick={handleCompleteEntry}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ✨ Auswerten!
            </motion.button>
          </div>
        </div>
      ) : (
        // Liste offener Vorhersagen
        <>
          <h3 className="tab-title">⏳ Offene Vorhersagen</h3>
          <p className="tab-description">
            Klicke auf eine Prüfung, um dein Ergebnis einzutragen.
          </p>

          {pendingEntries.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <p>Keine offenen Vorhersagen.</p>
              <motion.button
                className="hattie-next-btn ready"
                onClick={() => setActiveTab('new')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🎯 Neue Vorhersage anlegen
              </motion.button>
            </div>
          ) : (
            <motion.div
              className="pending-list"
              variants={cardContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {pendingEntries.map((entry) => {
                const subject = HATTIE_SUBJECTS[entry.subject];
                return (
                  <motion.div
                    key={entry.id}
                    className="pending-entry"
                    variants={cardVariants}
                    whileHover={{ scale: 1.02, y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedPendingEntry(entry);
                      setFormState(prev => ({
                        ...prev,
                        result: entry.predictionType === 'note' ? 3 : entry.predictionType === 'punkte' ? 10 : 70
                      }));
                    }}
                  >
                    <div className="entry-icon" style={{ backgroundColor: subject.color }}>
                      {subject.icon}
                    </div>
                    <div className="entry-details">
                      <div className="entry-task">{entry.task}</div>
                      <div className="entry-meta">
                        <span className="entry-subject">{subject.name}</span>
                        {entry.test_date && (
                          <span className="entry-date">📅 {formatDate(entry.test_date)}</span>
                        )}
                      </div>
                      <div className="entry-prediction">
                        🎯 Vorhersage: <strong>{formatPrediction(entry.prediction, entry.predictionType)}</strong>
                      </div>
                    </div>
                    <div className="entry-action">
                      <span className="action-icon">→</span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );

  // Tab: Verlauf
  const renderHistoryTab = () => (
    <motion.div
      className="hattie-history-tab"
      variants={tabContentVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <h3 className="tab-title">📜 Abgeschlossene Prüfungen</h3>

      {completedEntries.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <p>Noch keine abgeschlossenen Einträge.</p>
        </div>
      ) : (
        <motion.div
          className="history-list"
          variants={cardContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {completedEntries.slice(0, 10).map((entry) => {
            const subject = HATTIE_SUBJECTS[entry.subject];
            return (
              <motion.div
                key={entry.id}
                className={`history-entry ${entry.exceeded ? 'exceeded' : ''}`}
                variants={cardVariants}
              >
                <div className="entry-header">
                  <span className="entry-subject">
                    <span className="subject-emoji">{subject?.icon}</span>
                    {subject?.name}
                  </span>
                  <span className="entry-date">{formatDate(entry.created_at)}</span>
                </div>
                <div className="entry-task">{entry.task}</div>
                <div className="entry-results">
                  <span className="entry-prediction">
                    🎯 {formatPrediction(entry.prediction, entry.predictionType)}
                  </span>
                  <span className="entry-arrow">→</span>
                  <span className={`entry-result ${entry.exceeded ? 'exceeded' : ''}`}>
                    ✅ {formatPrediction(entry.result!, entry.predictionType)}
                  </span>
                  {entry.exceeded && <span className="exceeded-badge">🎉</span>}
                </div>
                <div className="entry-xp">+{entry.xp_earned} XP</div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );

  // Tab: Statistik
  const renderStatsTab = () => (
    <motion.div
      className="hattie-stats-tab"
      variants={tabContentVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <h3 className="tab-title">📊 Deine Statistik</h3>

      {/* Level Card */}
      <motion.div
        className="stats-level-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="level-info">
          <span className="level-icon">{levelInfo.icon}</span>
          <div className="level-text">
            <span className="level-name">{levelInfo.name}</span>
            <span className="level-number">Level {stats.level}</span>
          </div>
        </div>
        <div className="xp-progress">
          <div className="xp-bar-bg">
            <motion.div
              className="xp-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <div className="xp-text">
            <span>{stats.total_xp} XP</span>
            {nextLevel && <span>Nächstes Level: {nextLevel.xpRequired} XP</span>}
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <motion.div className="stat-card" variants={cardVariants}>
          <span className="stat-icon">⏳</span>
          <span className="stat-value">{stats.pending_entries}</span>
          <span className="stat-label">Offen</span>
        </motion.div>
        <motion.div className="stat-card" variants={cardVariants}>
          <span className="stat-icon">✅</span>
          <span className="stat-value">{stats.completed_entries}</span>
          <span className="stat-label">Abgeschlossen</span>
        </motion.div>
        <motion.div className="stat-card exceeded" variants={cardVariants}>
          <span className="stat-icon">🎉</span>
          <span className="stat-value">{stats.exceeded_count}</span>
          <span className="stat-label">Übertroffen</span>
        </motion.div>
        <motion.div className="stat-card streak" variants={cardVariants}>
          <span className="stat-icon">🔥</span>
          <span className="stat-value">{stats.current_streak}</span>
          <span className="stat-label">Streak</span>
        </motion.div>
      </div>

      {/* Hattie Info */}
      <motion.div
        className="hattie-info-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h4>🔬 Die Wissenschaft dahinter</h4>
        <p>
          <strong>John Hattie</strong> fand heraus: "Student Expectations" (Schüler-Erwartungen)
          haben eine Effektstärke von <strong>d = 1.33</strong> – einer der stärksten Lernfaktoren überhaupt!
        </p>
        <p>
          Wenn du deine Erwartung übertriffst, stärkt das nachhaltig deine <strong>Selbstwirksamkeit</strong>.
        </p>
      </motion.div>
    </motion.div>
  );

  // Celebration Screen
  const renderCelebration = () => {
    if (!celebrationData) return null;

    return (
      <motion.div
        className="hattie-celebration-overlay"
        variants={celebrationVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <motion.div className="celebration-content">
          <motion.div
            className="celebration-emoji"
            variants={successVariants}
          >
            {celebrationData.exceeded ? '🎉' : '📈'}
          </motion.div>

          <motion.h2
            className="celebration-headline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {celebrationData.exceeded ? 'DU HAST DICH ÜBERTROFFEN!' : 'Gut gemacht!'}
          </motion.h2>

          <motion.div
            className="celebration-comparison"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="compare-item prediction">
              <span className="compare-label">Erwartet</span>
              <span className="compare-value">
                {formatPrediction(celebrationData.prediction, celebrationData.predictionType)}
              </span>
            </div>
            <motion.div
              className="compare-arrow"
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              →
            </motion.div>
            <div className={`compare-item result ${celebrationData.exceeded ? 'exceeded' : ''}`}>
              <span className="compare-label">Erreicht</span>
              <span className="compare-value">
                {formatPrediction(celebrationData.result, celebrationData.predictionType)}
              </span>
            </div>
          </motion.div>

          <motion.div
            className="celebration-xp"
            initial={{ opacity: 0, y: 20, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: [1, 1.2, 1] }}
            transition={{ delay: 0.7, type: 'spring' }}
          >
            +{celebrationData.xp} XP
          </motion.div>

          {celebrationData.exceeded && (
            <motion.p
              className="celebration-message"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              Dein Gehirn speichert jetzt: <em>"Ich kann mehr als ich denke!"</em>
            </motion.p>
          )}
        </motion.div>
      </motion.div>
    );
  };

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div className="hattie-container">
      {/* KONFETTI 🎉 */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={400}
          colors={CONFETTI_COLORS}
          gravity={0.3}
          initialVelocityY={20}
        />
      )}

      {/* Header */}
      <motion.div
        className="hattie-header"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <div className="header-title">
          <motion.div
            className="header-icon"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <HattieWaageIcon size={40} animated={true} />
          </motion.div>
          <div>
            <h3>Selbsteinschätzung</h3>
            <p>Trainiere deine Fähigkeit, dich selbst einzuschätzen</p>
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
      <div className="hattie-tab-nav">
        {TABS.map((tab, index) => (
          <motion.button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(tab.id);
              setSelectedPendingEntry(null);
            }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
            {tab.id === 'pending' && pendingEntries.length > 0 && (
              <span className="tab-badge">{pendingEntries.length}</span>
            )}
            {activeTab === tab.id && (
              <motion.div
                className="tab-indicator"
                layoutId="hattieTabIndicator"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* Content */}
      <div className="hattie-content-wrapper">
        <AnimatePresence mode="wait">
          {activeTab === 'new' && !showCelebration && (
            <motion.div key="new-tab">
              {renderStepper()}
              <AnimatePresence mode="wait">
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
                {currentStep === 4 && renderStep4()}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === 'pending' && !showCelebration && renderPendingTab()}
          {activeTab === 'history' && renderHistoryTab()}
          {activeTab === 'stats' && renderStatsTab()}
        </AnimatePresence>

        {/* Celebration Overlay */}
        <AnimatePresence>
          {showCelebration && renderCelebration()}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default HattieChallenge;
