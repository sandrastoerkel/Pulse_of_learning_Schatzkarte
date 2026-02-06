// ============================================
// 7 Powertechniken Challenge - Hauptkomponente
// Interaktive Lernreise durch die 7 Powertechniken
// Für Grundschule (8-10 Jahre)
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import { VoiceButton } from './VoiceTextInput';
import {
  PowertechnikenChallengeProps,
  PowertechnikenProgress,
  TechniqueKey,
  TechniqueData,
  ChallengeState,
  PomodoroState,
  MemoryGameState,
  LociState,
  InterleavingState,
  TeachingState,
  SpacedRepState,
  MathProblem,
  TECHNIQUES_DATA,
  MEMORY_WORDS,
  LOCI_LOCATIONS,
  generateMathProblems,
  XP_REWARDS,
} from './powertechnikenTypes';
import '../styles/powertechniken-challenge.css';

// ============================================
// HAUPT-KOMPONENTE
// ============================================

export function PowertechnikenChallenge({
  onComplete,
  onClose,
  savedProgress,
  onSaveProgress,
}: PowertechnikenChallengeProps) {
  // Progress State
  const [progress, setProgress] = useState<PowertechnikenProgress>(
    savedProgress || {
      completedTechniques: [],
      applications: {} as Record<TechniqueKey, string>,
    }
  );

  // Navigation State
  const [challengeState, setChallengeState] = useState<ChallengeState>({
    currentView: 'overview',
    selectedTechnique: null,
    techniqueStep: 'intro',
  });

  // XP Animation
  const [showXPReward, setShowXPReward] = useState<number | null>(null);
  const [totalXP, setTotalXP] = useState(0);

  // Konfetti bei Abschluss
  const [showConfetti, setShowConfetti] = useState(false);

  // Application Input
  const [applicationInput, setApplicationInput] = useState('');

  // Speichern bei Änderungen
  useEffect(() => {
    onSaveProgress?.(progress);
  }, [progress, onSaveProgress]);

  // Berechne Fortschritt
  const completionCount = progress.completedTechniques.length;
  const isAllComplete = completionCount === 7;

  // Technik auswählen
  const selectTechnique = (key: TechniqueKey) => {
    setChallengeState({
      currentView: 'technique',
      selectedTechnique: key,
      techniqueStep: 'intro',
    });
  };

  // Zum nächsten Schritt
  const nextStep = () => {
    const steps: ChallengeState['techniqueStep'][] = [
      'intro',
      'exercise',
      'application',
      'funfact',
      'complete',
    ];
    const currentIndex = steps.indexOf(challengeState.techniqueStep);
    if (currentIndex < steps.length - 1) {
      setChallengeState((prev) => ({
        ...prev,
        techniqueStep: steps[currentIndex + 1],
      }));
    }
  };

  // Technik abschließen
  const completeTechnique = () => {
    const key = challengeState.selectedTechnique!;
    
    if (!progress.completedTechniques.includes(key)) {
      const newProgress = {
        ...progress,
        completedTechniques: [...progress.completedTechniques, key],
        applications: {
          ...progress.applications,
          [key]: applicationInput,
        },
      };
      setProgress(newProgress);

      // XP Belohnung
      const xp = XP_REWARDS.TECHNIQUE_COMPLETE;
      setShowXPReward(xp);
      setTotalXP((prev) => prev + xp);

      setTimeout(() => setShowXPReward(null), 2000);

      // Check auf alle fertig
      if (newProgress.completedTechniques.length === 7) {
        setTotalXP((prev) => prev + XP_REWARDS.ALL_TECHNIQUES_BONUS);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    }

    // Zurück zur Übersicht
    setApplicationInput('');
    setChallengeState({
      currentView: 'overview',
      selectedTechnique: null,
      techniqueStep: 'intro',
    });
  };

  // Zurück zur Übersicht
  const backToOverview = () => {
    setApplicationInput('');
    setChallengeState({
      currentView: 'overview',
      selectedTechnique: null,
      techniqueStep: 'intro',
    });
  };

  // Zertifikat anzeigen
  const showCertificate = () => {
    if (isAllComplete) {
      setChallengeState({
        currentView: 'certificate',
        selectedTechnique: null,
        techniqueStep: 'intro',
      });
    }
  };

  // Aktuelle Technik holen
  const currentTechnique = challengeState.selectedTechnique
    ? TECHNIQUES_DATA.find((t) => t.key === challengeState.selectedTechnique)
    : null;

  return (
    <div className="powertechniken-challenge">
      {/* Header */}
      <div className="challenge-header">
        <button className="back-btn" onClick={onClose}>
          ← Zurück
        </button>
        <h1 className="challenge-title">
          <span className="title-icon">🛠️</span>
          Cleverer lernen
        </h1>
        <div className="progress-badge">
          <span className="xp-icon">⭐</span>
          <span className="xp-amount">{totalXP} XP</span>
        </div>
      </div>

      {/* Fortschrittsbalken */}
      <div className="progress-bar-container">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${(completionCount / 7) * 100}%` }}
          />
        </div>
        <span className="progress-text">{completionCount}/7 Techniken entdeckt</span>
      </div>

      {/* XP Belohnung Animation */}
      <AnimatePresence>
        {showXPReward && (
          <motion.div
            className="xp-reward-popup"
            initial={{ scale: 0, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0, y: -50, opacity: 0 }}
          >
            <span className="xp-amount">+{showXPReward} XP!</span>
            <span className="xp-stars">⭐✨⭐</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Konfetti */}
      {showConfetti && <ConfettiEffect />}

      {/* Hauptinhalt */}
      <AnimatePresence mode="wait">
        {challengeState.currentView === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="techniques-overview"
          >
            <p className="overview-intro">
              Entdecke die 7 magischen Werkzeuge, die dir beim Lernen helfen! 
              Tippe auf eine Karte, um loszulegen. 🎮
            </p>

            <div className="techniques-grid">
              {TECHNIQUES_DATA.map((technique) => (
                <TechniqueCard
                  key={technique.key}
                  technique={technique}
                  isCompleted={progress.completedTechniques.includes(technique.key)}
                  onClick={() => selectTechnique(technique.key)}
                />
              ))}
            </div>

            {/* Alle fertig Bonus */}
            {isAllComplete && (
              <motion.div
                className="all-complete-banner"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <span className="banner-icon">🏆</span>
                <span className="banner-text">
                  SUPER! Du hast alle 7 Techniken entdeckt!
                </span>
                <button className="certificate-btn" onClick={showCertificate}>
                  🎓 Zertifikat ansehen
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {challengeState.currentView === 'technique' && currentTechnique && (
          <motion.div
            key="technique"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="technique-detail"
          >
            <TechniqueDetailView
              technique={currentTechnique}
              step={challengeState.techniqueStep}
              onNext={nextStep}
              onComplete={completeTechnique}
              onBack={backToOverview}
              applicationInput={applicationInput}
              setApplicationInput={setApplicationInput}
            />
          </motion.div>
        )}

        {challengeState.currentView === 'certificate' && (
          <motion.div
            key="certificate"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
          >
            <CertificatePreview
              progress={progress}
              onBack={backToOverview}
              totalXP={totalXP}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// TECHNIK-KARTE
// ============================================

interface TechniqueCardProps {
  technique: TechniqueData;
  isCompleted: boolean;
  onClick: () => void;
}

function TechniqueCard({ technique, isCompleted, onClick }: TechniqueCardProps) {
  return (
    <motion.button
      className={`technique-card ${isCompleted ? 'completed' : ''}`}
      onClick={onClick}
      whileHover={{ scale: 1.05, rotate: [-1, 1, -1, 0] }}
      whileTap={{ scale: 0.95 }}
      style={{ '--technique-color': technique.color } as React.CSSProperties}
    >
      <div className="card-glow" />
      
      <span className="technique-icon">{technique.icon}</span>
      <span className="technique-name">{technique.name}</span>
      
      {isCompleted && (
        <motion.div
          className="completed-badge"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          ✓
        </motion.div>
      )}

      <div className="xp-preview">
        <span>+{technique.xp} XP</span>
      </div>
    </motion.button>
  );
}

// ============================================
// TECHNIK-DETAIL-ANSICHT
// ============================================

interface TechniqueDetailProps {
  technique: TechniqueData;
  step: ChallengeState['techniqueStep'];
  onNext: () => void;
  onComplete: () => void;
  onBack: () => void;
  applicationInput: string;
  setApplicationInput: (value: string) => void;
}

function TechniqueDetailView({
  technique,
  step,
  onNext,
  onComplete,
  onBack,
  applicationInput,
  setApplicationInput,
}: TechniqueDetailProps) {
  const [exerciseComplete, setExerciseComplete] = useState(false);

  const handleExerciseComplete = () => {
    setExerciseComplete(true);
  };

  return (
    <div className="technique-detail-container">
      {/* Header mit Icon und Name */}
      <div
        className="detail-header"
        style={{ background: technique.color }}
      >
        <button className="detail-back-btn" onClick={onBack}>
          ← Zurück
        </button>
        <span className="detail-icon">{technique.icon}</span>
        <h2 className="detail-name">{technique.name}</h2>
      </div>

      {/* Step Indicator */}
      <div className="step-indicator">
        {['intro', 'exercise', 'application', 'funfact'].map((s, i) => (
          <div
            key={s}
            className={`step-dot ${
              step === s ? 'active' : 
              ['intro', 'exercise', 'application', 'funfact'].indexOf(step) > i ? 'done' : ''
            }`}
          />
        ))}
      </div>

      {/* Content basierend auf Step */}
      <div className="detail-content">
        <AnimatePresence mode="wait">
          {step === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="step-content intro-step"
            >
              <div className="speech-bubble">
                <p>{technique.intro}</p>
              </div>
              
              <div className="kurzanleitung-box">
                <h4>📋 So geht's:</h4>
                <p>{technique.kurzanleitung}</p>
              </div>

              <button className="next-btn" onClick={onNext}>
                Los geht's! 🚀
              </button>
            </motion.div>
          )}

          {step === 'exercise' && (
            <motion.div
              key="exercise"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="step-content exercise-step"
            >
              <h3 className="exercise-title">
                <span className="exercise-icon">🎮</span>
                {technique.exercise.title}
              </h3>
              
              <p className="exercise-instruction">
                {technique.exercise.instruction}
              </p>

              {/* Spezifische Übung pro Technik */}
              <div className="interactive-exercise">
                {technique.key === 'pomodoro' && (
                  <PomodoroExercise onComplete={handleExerciseComplete} />
                )}
                {technique.key === 'active_recall' && (
                  <MemoryExercise onComplete={handleExerciseComplete} />
                )}
                {technique.key === 'feynman' && (
                  <FeynmanExercise onComplete={handleExerciseComplete} />
                )}
                {technique.key === 'spaced_repetition' && (
                  <SpacedRepExercise onComplete={handleExerciseComplete} />
                )}
                {technique.key === 'teaching' && (
                  <TeachingExercise onComplete={handleExerciseComplete} />
                )}
                {technique.key === 'loci' && (
                  <LociExercise onComplete={handleExerciseComplete} />
                )}
                {technique.key === 'interleaving' && (
                  <InterleavingExercise onComplete={handleExerciseComplete} />
                )}
              </div>

              {exerciseComplete && (
                <motion.button
                  className="next-btn success"
                  onClick={onNext}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  Super gemacht! Weiter →
                </motion.button>
              )}
            </motion.div>
          )}

          {step === 'application' && (
            <motion.div
              key="application"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="step-content application-step"
            >
              <h3 className="application-title">
                <span className="application-icon">📝</span>
                Wann willst du das ausprobieren?
              </h3>

              <div className="ideal-for-box">
                <p>Diese Technik ist super für:</p>
                <div className="ideal-tags">
                  {technique.idealFuer.map((item, i) => (
                    <span key={i} className="ideal-tag">{item}</span>
                  ))}
                </div>
              </div>

              <div className="application-input-box">
                <label>Bei welcher Lernaufgabe willst du das ausprobieren?</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <textarea
                    value={applicationInput}
                    onChange={(e) => setApplicationInput(e.target.value)}
                    placeholder="z.B. Mathe-Hausaufgaben, Vokabeln lernen..."
                    rows={3}
                    style={{ flex: 1 }}
                  />
                  <VoiceButton
                    onResult={(text) => setApplicationInput(applicationInput + (applicationInput && !applicationInput.endsWith(' ') ? ' ' : '') + text)}
                    size="medium"
                  />
                </div>
              </div>

              <button 
                className="next-btn"
                onClick={onNext}
                disabled={!applicationInput.trim()}
              >
                Weiter →
              </button>
            </motion.div>
          )}

          {step === 'funfact' && (
            <motion.div
              key="funfact"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="step-content funfact-step"
            >
              <div className="funfact-box">
                <span className="funfact-icon">🤓</span>
                <h3>Wusstest du schon?</h3>
                <p>{technique.funFact}</p>
              </div>

              <button className="complete-btn" onClick={onComplete}>
                <span className="btn-icon">🎉</span>
                Technik abschließen (+{technique.xp} XP)
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================
// INTERAKTIVE ÜBUNGEN
// ============================================

// 🍅 POMODORO TIMER MIT ZYKLUS-SYSTEM
function PomodoroExercise({ onComplete }: { onComplete: () => void }) {
  // DEMO Mode: kürzere Zeiten zum Testen
  const DEMO_MODE = true;
  const LEARN_TIME = DEMO_MODE ? 30 : 15 * 60;  // 30 Sek Demo / 15 Min echt
  const BREAK_TIME = DEMO_MODE ? 10 : 5 * 60;   // 10 Sek Demo / 5 Min echt

  const [state, setState] = useState<PomodoroState>({
    timeLeft: LEARN_TIME,
    isRunning: false,
    isComplete: false,
    phase: 'learn',
    cycleCount: 0,
    canContinue: false,
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasCompletedOnce = useRef(false);

  useEffect(() => {
    if (state.isRunning && state.timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setState((prev) => {
          if (prev.timeLeft <= 1) {
            clearInterval(timerRef.current!);

            if (prev.phase === 'learn') {
              // Lernphase beendet -> Pause starten
              return {
                ...prev,
                timeLeft: 0,
                isRunning: false,
                phase: 'learn',
                canContinue: true, // Bereit für Pause
              };
            } else {
              // Pause beendet -> bereit für nächste Lernphase
              return {
                ...prev,
                timeLeft: 0,
                isRunning: false,
                cycleCount: prev.cycleCount + 1,
                canContinue: true, // Bereit für weiteres Lernen
              };
            }
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.isRunning]);

  // Nach erstem abgeschlossenen Zyklus als "complete" markieren
  useEffect(() => {
    if (state.phase === 'learn' && state.timeLeft === 0 && !hasCompletedOnce.current) {
      hasCompletedOnce.current = true;
      onComplete();
    }
  }, [state.phase, state.timeLeft, onComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setState((prev) => ({ ...prev, isRunning: !prev.isRunning }));
  };

  const startBreak = () => {
    setState((prev) => ({
      ...prev,
      timeLeft: BREAK_TIME,
      isRunning: true,
      phase: 'break',
      canContinue: false,
    }));
  };

  const startNextLearnPhase = () => {
    setState((prev) => ({
      ...prev,
      timeLeft: LEARN_TIME,
      isRunning: true,
      phase: 'learn',
      canContinue: false,
    }));
  };

  const resetTimer = () => {
    setState({
      timeLeft: LEARN_TIME,
      isRunning: false,
      isComplete: false,
      phase: 'learn',
      cycleCount: 0,
      canContinue: false,
    });
    hasCompletedOnce.current = false;
  };

  const currentMaxTime = state.phase === 'learn' ? LEARN_TIME : BREAK_TIME;
  const progress = ((currentMaxTime - state.timeLeft) / currentMaxTime) * 100;

  const isLearnPhase = state.phase === 'learn';
  const phaseColor = isLearnPhase ? '#e74c3c' : '#27ae60';

  return (
    <div className="pomodoro-exercise">
      {/* Zyklus-Zähler */}
      {state.cycleCount > 0 && (
        <div className="cycle-counter">
          <span className="cycle-label">Pomodoros geschafft:</span>
          <span className="cycle-tomatoes">
            {Array(state.cycleCount).fill('🍅').join(' ')}
          </span>
        </div>
      )}

      {/* Phase-Anzeige */}
      <div className={`phase-indicator ${isLearnPhase ? 'learn' : 'break'}`}>
        <span className="phase-icon">{isLearnPhase ? '🍅' : '☕'}</span>
        <span className="phase-text">
          {isLearnPhase ? 'LERNZEIT' : 'PAUSE'}
        </span>
      </div>

      <div className="tomato-timer">
        <motion.div
          className="tomato-icon"
          animate={state.isRunning ? { rotate: [0, 5, -5, 0] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          {isLearnPhase ? '🍅' : '☕'}
        </motion.div>

        <div className="timer-circle" style={{ '--phase-color': phaseColor } as React.CSSProperties}>
          <svg className="progress-ring" width="200" height="200">
            <circle
              className="progress-ring-bg"
              cx="100"
              cy="100"
              r="90"
            />
            <circle
              className="progress-ring-fill"
              cx="100"
              cy="100"
              r="90"
              strokeDasharray={565}
              strokeDashoffset={565 - (565 * progress) / 100}
              style={{ stroke: phaseColor }}
            />
          </svg>
          <span className="timer-display">{formatTime(state.timeLeft)}</span>
        </div>
      </div>

      {/* Timer-Kontrollen während des Laufens */}
      {!state.canContinue && (
        <div className="timer-controls">
          <button
            className={`timer-btn ${state.isRunning ? 'pause' : 'start'}`}
            onClick={toggleTimer}
          >
            {state.isRunning ? '⏸️ Pause' : '▶️ Start'}
          </button>
          <button className="timer-btn reset" onClick={resetTimer}>
            🔄 Reset
          </button>
        </div>
      )}

      {DEMO_MODE && !state.canContinue && (
        <p className="demo-hint">
          💡 Demo: {isLearnPhase ? '30 Sek' : '10 Sek'} statt {isLearnPhase ? '15 Min' : '5 Min'}
        </p>
      )}

      {/* Lernphase beendet -> Pause anbieten */}
      {state.canContinue && state.phase === 'learn' && state.timeLeft === 0 && (
        <motion.div
          className="phase-complete learn-complete"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          <span className="complete-icon">🎉</span>
          <span className="complete-text">Super! Lernzeit geschafft!</span>
          <p className="complete-hint">Jetzt hast du dir eine Pause verdient!</p>
          <div className="phase-buttons">
            <button className="phase-btn break-btn" onClick={startBreak}>
              ☕ Pause starten (5 Min)
            </button>
            <button className="phase-btn done-btn" onClick={() => setState(prev => ({ ...prev, isComplete: true }))}>
              ✅ Fertig für heute
            </button>
          </div>
        </motion.div>
      )}

      {/* Pause beendet -> Weiterlernen anbieten */}
      {state.canContinue && state.phase === 'break' && state.timeLeft === 0 && (
        <motion.div
          className="phase-complete break-complete"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          <span className="complete-icon">💪</span>
          <span className="complete-text">Pause vorbei!</span>
          <p className="complete-hint">Bereit für die nächste Runde?</p>
          <div className="phase-buttons">
            <button className="phase-btn learn-btn" onClick={startNextLearnPhase}>
              🍅 Weiter lernen!
            </button>
            <button className="phase-btn done-btn" onClick={() => setState(prev => ({ ...prev, isComplete: true }))}>
              ✅ Fertig für heute
            </button>
          </div>
        </motion.div>
      )}

      {/* Hilfe-Text */}
      <div className="pomodoro-help">
        <p>🍅 <strong>So funktioniert's:</strong></p>
        <p>Lernen → Pause → Lernen → Pause → ...</p>
        <p>Du kannst so viele Runden machen wie du möchtest!</p>
      </div>
    </div>
  );
}

// 🔄 ACTIVE RECALL MEMORY GAME
function MemoryExercise({ onComplete }: { onComplete: () => void }) {
  const [state, setState] = useState<MemoryGameState>({
    phase: 'show',
    words: MEMORY_WORDS,
    userInput: [],
    correctCount: 0,
  });

  const [currentInput, setCurrentInput] = useState('');
  const [countdown, setCountdown] = useState(10);

  // Countdown während Show-Phase
  useEffect(() => {
    if (state.phase === 'show' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (state.phase === 'show' && countdown === 0) {
      setState((prev) => ({ ...prev, phase: 'recall' }));
    }
  }, [state.phase, countdown]);

  const addWord = () => {
    if (currentInput.trim() && state.userInput.length < 5) {
      setState((prev) => ({
        ...prev,
        userInput: [...prev.userInput, currentInput.trim()],
      }));
      setCurrentInput('');
    }
  };

  const checkResult = () => {
    const correct = state.userInput.filter((word) =>
      state.words.some(
        (w) => w.toLowerCase() === word.toLowerCase()
      )
    ).length;

    setState((prev) => ({
      ...prev,
      phase: 'result',
      correctCount: correct,
    }));

    if (correct >= 3) {
      onComplete();
    }
  };

  return (
    <div className="memory-exercise">
      {state.phase === 'show' && (
        <motion.div
          className="show-phase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="memory-instruction">
            Präge dir diese 5 Wörter ein! ⏰ {countdown}s
          </p>
          <div className="words-display">
            {state.words.map((word, i) => (
              <motion.span
                key={word}
                className="memory-word"
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: i * 0.2 }}
              >
                {word}
              </motion.span>
            ))}
          </div>
          <button
            className="skip-btn"
            onClick={() => setState((prev) => ({ ...prev, phase: 'recall' }))}
          >
            Ich hab's! →
          </button>
        </motion.div>
      )}

      {state.phase === 'recall' && (
        <motion.div
          className="recall-phase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="memory-instruction">
            Welche Wörter waren es? 🤔
          </p>

          <div className="user-words">
            {state.userInput.map((word, i) => (
              <span key={i} className="user-word">{word}</span>
            ))}
          </div>

          {state.userInput.length < 5 && (
            <div className="word-input">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addWord()}
                placeholder="Wort eingeben..."
              />
              <button onClick={addWord}>+</button>
            </div>
          )}

          <button
            className="check-btn"
            onClick={checkResult}
            disabled={state.userInput.length === 0}
          >
            Prüfen! ✓
          </button>
        </motion.div>
      )}

      {state.phase === 'result' && (
        <motion.div
          className="result-phase"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
        >
          <div className={`result-box ${state.correctCount >= 3 ? 'success' : 'retry'}`}>
            <span className="result-icon">
              {state.correctCount >= 3 ? '🎉' : '💪'}
            </span>
            <p>
              Du hast <strong>{state.correctCount}</strong> von 5 Wörtern richtig!
            </p>
            {state.correctCount >= 3 ? (
              <p className="result-message">Super gemacht!</p>
            ) : (
              <p className="result-message">Beim nächsten Mal schaffst du mehr!</p>
            )}
          </div>

          <div className="word-comparison">
            <p>Die richtigen Wörter waren:</p>
            <div className="correct-words">
              {state.words.map((word) => (
                <span
                  key={word}
                  className={`compare-word ${
                    state.userInput.some(
                      (u) => u.toLowerCase() === word.toLowerCase()
                    )
                      ? 'found'
                      : 'missed'
                  }`}
                >
                  {word}
                </span>
              ))}
            </div>
          </div>

          {state.correctCount < 3 && (
            <button
              className="retry-btn"
              onClick={() => {
                setCountdown(10);
                setState({
                  phase: 'show',
                  words: MEMORY_WORDS,
                  userInput: [],
                  correctCount: 0,
                });
              }}
            >
              Nochmal versuchen 🔄
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
}

// 👶 FEYNMAN EXERCISE
function FeynmanExercise({ onComplete }: { onComplete: () => void }) {
  const [explained, setExplained] = useState(false);
  const [foundGap, setFoundGap] = useState(false);

  const handleComplete = () => {
    if (explained) {
      setFoundGap(true);
      onComplete();
    }
  };

  return (
    <div className="feynman-exercise">
      <div className="teddy-scene">
        <motion.div
          className="teddy"
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          🧸
        </motion.div>
        <div className="speech-arrow">💬</div>
      </div>

      <div className="feynman-steps">
        <motion.div
          className={`feynman-step ${explained ? 'done' : 'active'}`}
          whileTap={{ scale: 0.95 }}
        >
          <label>
            <input
              type="checkbox"
              checked={explained}
              onChange={(e) => setExplained(e.target.checked)}
            />
            <span className="checkbox-icon">{explained ? '✅' : '⬜'}</span>
            <span className="step-text">
              Ich habe LAUT erklärt (mindestens 1 Minute!)
            </span>
          </label>
        </motion.div>

        {explained && !foundGap && (
          <motion.div
            className="feynman-question"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p>🤔 Bist du irgendwo hängen geblieben oder unsicher geworden?</p>
            <div className="feynman-buttons">
              <button onClick={() => { setFoundGap(true); onComplete(); }}>
                Ja, bei... 📝
              </button>
              <button onClick={handleComplete}>
                Nein, alles klar! 💪
              </button>
            </div>
          </motion.div>
        )}

        {foundGap && (
          <motion.div
            className="feynman-result"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <span className="result-icon">🌟</span>
            <p>Super! Du hast die Feynman-Methode angewendet!</p>
          </motion.div>
        )}
      </div>

      <div className="feynman-tip">
        💡 Tipp: Sprich wirklich LAUT! Dein Kuscheltier hört zu! 🧸
      </div>
    </div>
  );
}

// 📅 SPACED REPETITION CALENDAR
function SpacedRepExercise({ onComplete }: { onComplete: () => void }) {
  const [state, setState] = useState<SpacedRepState>({
    selectedDays: [],
    topic: '',
  });

  const today = new Date();
  const schedule = [
    { label: 'Morgen', date: new Date(today.getTime() + 86400000), icon: '1️⃣' },
    { label: 'In 3 Tagen', date: new Date(today.getTime() + 3 * 86400000), icon: '2️⃣' },
    { label: 'In 1 Woche', date: new Date(today.getTime() + 7 * 86400000), icon: '3️⃣' },
    { label: 'In 2 Wochen', date: new Date(today.getTime() + 14 * 86400000), icon: '4️⃣' },
  ];

  const toggleDay = (dateStr: string) => {
    setState((prev) => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(dateStr)
        ? prev.selectedDays.filter((d) => d !== dateStr)
        : [...prev.selectedDays, dateStr],
    }));
  };

  const isComplete = state.selectedDays.length >= 3 && state.topic.trim();

  useEffect(() => {
    if (isComplete) {
      onComplete();
    }
  }, [isComplete, onComplete]);

  return (
    <div className="spaced-rep-exercise">
      <div className="topic-input">
        <label>Was möchtest du lernen?</label>
        <input
          type="text"
          value={state.topic}
          onChange={(e) => setState((prev) => ({ ...prev, topic: e.target.value }))}
          placeholder="z.B. 7er-Einmaleins, Vokabeln..."
        />
      </div>

      <div className="schedule-calendar">
        <p className="calendar-label">Wann willst du wiederholen? (Wähle mindestens 3)</p>
        <div className="schedule-days">
          {schedule.map((day) => {
            const dateStr = day.date.toISOString().split('T')[0];
            const isSelected = state.selectedDays.includes(dateStr);
            
            return (
              <motion.button
                key={dateStr}
                className={`schedule-day ${isSelected ? 'selected' : ''}`}
                onClick={() => toggleDay(dateStr)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="day-icon">{day.icon}</span>
                <span className="day-label">{day.label}</span>
                <span className="day-date">
                  {day.date.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })}
                </span>
                {isSelected && <span className="checkmark">✓</span>}
              </motion.button>
            );
          })}
        </div>
      </div>

      {isComplete && (
        <motion.div
          className="schedule-complete"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          <span className="complete-icon">📅✨</span>
          <p>Perfekt! Du hast deinen Wiederholungsplan erstellt!</p>
        </motion.div>
      )}

      {/* Anki-Hinweis für Eltern */}
      <div className="anki-hint">
        <div className="anki-hint-header">
          <span className="anki-icon">💡</span>
          <span className="anki-label">Tipp für Eltern:</span>
        </div>
        <p className="anki-text">
          Die kostenlose App <strong>„Anki"</strong> macht Spaced Repetition automatisch!
          Sie erinnert euer Kind genau zum richtigen Zeitpunkt ans Wiederholen.
        </p>
        <p className="anki-link">
          📱 Kostenlos für Computer & Android: <strong>apps.ankiweb.net</strong>
        </p>
      </div>
    </div>
  );
}

// 👥 TEACHING EXERCISE
function TeachingExercise({ onComplete }: { onComplete: () => void }) {
  const [state, setState] = useState<TeachingState>({
    foundPartner: false,
    explained: false,
    answeredQuestions: false,
    partnerName: '',
  });

  const allDone = state.foundPartner && state.explained && state.answeredQuestions;

  useEffect(() => {
    if (allDone) {
      onComplete();
    }
  }, [allDone, onComplete]);

  return (
    <div className="teaching-exercise">
      <div className="partner-scene">
        <motion.div
          className="partner-icons"
          animate={{ x: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          👨‍👩‍👧
        </motion.div>
      </div>

      <div className="teaching-checklist">
        <motion.div
          className={`checklist-item ${state.foundPartner ? 'done' : ''}`}
          whileTap={{ scale: 0.98 }}
        >
          <label>
            <input
              type="checkbox"
              checked={state.foundPartner}
              onChange={(e) =>
                setState((prev) => ({ ...prev, foundPartner: e.target.checked }))
              }
            />
            <span className="checkbox-custom">{state.foundPartner ? '✅' : '⬜'}</span>
            <span>Ich habe jemanden gefunden (Mama, Papa, Geschwister...)</span>
          </label>
          {state.foundPartner && (
            <input
              type="text"
              className="partner-name"
              placeholder="Wer war es?"
              value={state.partnerName}
              onChange={(e) =>
                setState((prev) => ({ ...prev, partnerName: e.target.value }))
              }
            />
          )}
        </motion.div>

        <motion.div
          className={`checklist-item ${state.explained ? 'done' : ''}`}
          whileTap={{ scale: 0.98 }}
        >
          <label>
            <input
              type="checkbox"
              checked={state.explained}
              onChange={(e) =>
                setState((prev) => ({ ...prev, explained: e.target.checked }))
              }
            />
            <span className="checkbox-custom">{state.explained ? '✅' : '⬜'}</span>
            <span>Ich habe mein Thema erklärt</span>
          </label>
        </motion.div>

        <motion.div
          className={`checklist-item ${state.answeredQuestions ? 'done' : ''}`}
          whileTap={{ scale: 0.98 }}
        >
          <label>
            <input
              type="checkbox"
              checked={state.answeredQuestions}
              onChange={(e) =>
                setState((prev) => ({ ...prev, answeredQuestions: e.target.checked }))
              }
            />
            <span className="checkbox-custom">{state.answeredQuestions ? '✅' : '⬜'}</span>
            <span>Ich habe mindestens 3 Fragen beantwortet</span>
          </label>
        </motion.div>
      </div>

      {allDone && (
        <motion.div
          className="teaching-complete"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          <span className="complete-icon">🎉</span>
          <p>Großartig! Du bist jetzt ein kleiner Lehrer!</p>
        </motion.div>
      )}
    </div>
  );
}

// 🏰 LOCI METHOD EXERCISE
function LociExercise({ onComplete }: { onComplete: () => void }) {
  // LOCI_LOCATIONS ist jetzt ein Array von {name, artikel}
  const locations = LOCI_LOCATIONS.map(loc => loc.name);

  const [state, setState] = useState<LociState>({
    locations: locations,
    items: {},
  });

  const [currentItem, setCurrentItem] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);

  const placeItem = () => {
    if (selectedLocation !== null && currentItem.trim()) {
      setState((prev) => ({
        ...prev,
        items: { ...prev.items, [selectedLocation]: currentItem.trim() },
      }));
      setCurrentItem('');
      setSelectedLocation(null);
    }
  };

  const filledCount = Object.keys(state.items).length;
  const isComplete = filledCount >= 5;

  useEffect(() => {
    if (isComplete) {
      onComplete();
    }
  }, [isComplete, onComplete]);

  // Hilfsfunktion für korrekte Grammatik
  const getLocationPhrase = (index: number) => {
    const loc = LOCI_LOCATIONS[index];
    return `${loc.artikel} ${loc.name}`;
  };

  return (
    <div className="loci-exercise">
      <div className="room-visualization">
        <div className="room-icon">🏠</div>
        <div className="locations-grid">
          {state.locations.map((loc, i) => (
            <motion.button
              key={i}
              className={`location-slot ${selectedLocation === i ? 'selected' : ''} ${
                state.items[i] ? 'filled' : ''
              }`}
              onClick={() => !state.items[i] && setSelectedLocation(i)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="location-name">{loc}</span>
              {state.items[i] ? (
                <span className="placed-item">📦 {state.items[i]}</span>
              ) : (
                <span className="empty-slot">?</span>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {selectedLocation !== null && !state.items[selectedLocation] && (
        <motion.div
          className="item-input"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p>Was legst du auf <strong>{getLocationPhrase(selectedLocation)}</strong>?</p>
          <div className="input-row">
            <input
              type="text"
              value={currentItem}
              onChange={(e) => setCurrentItem(e.target.value)}
              placeholder="z.B. Vokabel, Begriff..."
              onKeyPress={(e) => e.key === 'Enter' && placeItem()}
            />
            <button onClick={placeItem} disabled={!currentItem.trim()}>
              Ablegen 📍
            </button>
          </div>
        </motion.div>
      )}

      <div className="loci-progress">
        <span>{filledCount}/5 Orte belegt</span>
        <div className="loci-progress-bar">
          <div
            className="loci-progress-fill"
            style={{ width: `${(filledCount / 5) * 100}%` }}
          />
        </div>
      </div>

      {isComplete && (
        <motion.div
          className="loci-complete"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          <span className="complete-icon">🏰✨</span>
          <p>Dein Gedächtnispalast ist fertig!</p>
          <p className="recall-prompt">
            Geh jetzt im Kopf durch dein Zimmer – kannst du alles finden?
          </p>
        </motion.div>
      )}
    </div>
  );
}

// 🔀 INTERLEAVING EXERCISE
function InterleavingExercise({ onComplete }: { onComplete: () => void }) {
  const [problems, setProblems] = useState<MathProblem[]>(() =>
    generateMathProblems().slice(0, 9) // 9 Aufgaben: 3x Plus, 3x Minus, 3x Mal
  );
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const handleAnswer = (id: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const checkAnswers = () => {
    let correct = 0;
    problems.forEach((p) => {
      if (parseInt(answers[p.id]) === p.answer) {
        correct++;
      }
    });
    setCorrectCount(correct);
    setChecked(true);

    if (correct >= 6) {
      onComplete();
    }
  };

  const allAnswered = problems.every((p) => answers[p.id]?.trim());

  // Operator-Klasse für CSS
  const getOperatorClass = (op: string) => {
    if (op === '+') return 'plus';
    if (op === '-') return 'minus';
    return 'times';
  };

  return (
    <div className="interleaving-exercise">
      <div className="mixer-icon">
        <motion.span
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          🔀
        </motion.span>
      </div>

      {/* Erklärung des Prinzips */}
      <div className="interleaving-explanation">
        <p className="explanation-title">🎯 Was ist Interleaving?</p>
        <p className="explanation-text">
          Statt 10× Plus, dann 10× Minus zu üben, <strong>mischen wir alles durch</strong>!
          Das fühlt sich schwerer an, aber du lernst VIEL mehr dabei.
        </p>
      </div>

      <p className="mixer-hint">
        ⚡ Plus, Minus und Mal sind durchgemischt!
      </p>

      <div className="problems-grid">
        {problems.map((problem, index) => (
          <motion.div
            key={problem.id}
            className={`problem-card ${
              checked
                ? parseInt(answers[problem.id]) === problem.answer
                  ? 'correct'
                  : 'wrong'
                : ''
            }`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <span className="problem-number">#{index + 1}</span>
            <div className="problem-equation">
              <span className="operand">{problem.left}</span>
              <span className={`operator ${getOperatorClass(problem.operator)}`}>
                {problem.operator}
              </span>
              <span className="operand">{problem.right}</span>
              <span className="equals">=</span>
              <input
                type="number"
                className="answer-input"
                value={answers[problem.id] || ''}
                onChange={(e) => handleAnswer(problem.id, e.target.value)}
                disabled={checked}
              />
            </div>
            {checked && (
              <span className="result-badge">
                {parseInt(answers[problem.id]) === problem.answer ? '✓' : `✗ (${problem.answer})`}
              </span>
            )}
          </motion.div>
        ))}
      </div>

      {!checked ? (
        <button
          className="check-all-btn"
          onClick={checkAnswers}
          disabled={!allAnswered}
        >
          Alle prüfen! ✓
        </button>
      ) : (
        <motion.div
          className="interleaving-result"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          <div className={`result-box ${correctCount >= 6 ? 'success' : 'retry'}`}>
            <span className="result-score">
              {correctCount}/{problems.length} richtig!
            </span>
            {correctCount >= 6 ? (
              <p>🎉 Super! Du hast den Mathe-Mixer gemeistert!</p>
            ) : (
              <>
                <p>💪 Gut versucht! Probier's nochmal!</p>
                <button
                  className="retry-btn"
                  onClick={() => {
                    setProblems(generateMathProblems().slice(0, 9));
                    setAnswers({});
                    setChecked(false);
                  }}
                >
                  Neue Aufgaben 🔄
                </button>
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* Hinweis: Nicht nur Mathe */}
      <div className="interleaving-hint">
        <p className="hint-title">💡 Das geht auch mit:</p>
        <div className="hint-examples">
          <span className="hint-tag">📚 Vokabeln mischen</span>
          <span className="hint-tag">🌍 Sachkunde-Themen</span>
          <span className="hint-tag">✏️ Rechtschreibung</span>
          <span className="hint-tag">🎵 Musiknoten</span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// ZERTIFIKAT VORSCHAU
// ============================================

interface CertificatePreviewProps {
  progress: PowertechnikenProgress;
  onBack: () => void;
  totalXP: number;
}

function CertificatePreview({ progress, onBack, totalXP }: CertificatePreviewProps) {
  const [top3, setTop3] = useState<TechniqueKey[]>(progress.top3 || []);
  const [studentName, setStudentName] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  // Als Bild speichern
  const handleDownload = async () => {
    if (!certificateRef.current) return;

    setIsDownloading(true);
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2, // Höhere Auflösung
        backgroundColor: '#fff8e1',
        useCORS: true,
      });

      const link = document.createElement('a');
      link.download = `Lerntechniken-Zertifikat-${studentName.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      alert('Beim Speichern ist ein Fehler aufgetreten. Bitte versuche es erneut.');
    }
    setIsDownloading(false);
  };

  // Drucken
  const handlePrint = () => {
    window.print();
  };

  const toggleTop3 = (key: TechniqueKey) => {
    if (top3.includes(key)) {
      setTop3(top3.filter((k) => k !== key));
    } else if (top3.length < 3) {
      setTop3([...top3, key]);
    }
  };

  const today = new Date().toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="certificate-preview">
      <button className="back-btn" onClick={onBack}>
        ← Zurück zur Übersicht
      </button>

      <div className="certificate-setup">
        <h2>🎓 Dein Zertifikat</h2>

        <div className="name-input-section">
          <label>Dein Name:</label>
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Schreibe deinen Namen..."
          />
        </div>

        <div className="top3-selection">
          <h3>Wähle deine Top 3 Lieblingstechniken:</h3>
          <div className="top3-grid">
            {TECHNIQUES_DATA.map((tech) => (
              <button
                key={tech.key}
                className={`top3-btn ${top3.includes(tech.key) ? 'selected' : ''}`}
                onClick={() => toggleTop3(tech.key)}
              >
                <span className="tech-icon">{tech.icon}</span>
                <span className="tech-name">{tech.name}</span>
                {top3.includes(tech.key) && (
                  <span className="selection-number">
                    #{top3.indexOf(tech.key) + 1}
                  </span>
                )}
              </button>
            ))}
          </div>
          <p className="selection-hint">
            Ausgewählt: {top3.length}/3
          </p>
        </div>
      </div>

      {studentName && top3.length === 3 && (
        <motion.div
          className="certificate-document"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="certificate-frame" ref={certificateRef}>
            <div className="certificate-border">
              <div className="certificate-inner">
                <div className="certificate-seal">🏆</div>
                
                <h1 className="certificate-title">URKUNDE</h1>
                <h2 className="certificate-subtitle">Lerntechniken-Entdecker</h2>

                <div className="certificate-name">{studentName}</div>

                <p className="certificate-text">
                  hat erfolgreich die <strong>7 Powertechniken</strong> kennengelernt
                  und ist nun ein echter Lernprofi!
                </p>

                <div className="certificate-top3">
                  <h3>Meine Top 3 Techniken:</h3>
                  <div className="top3-badges">
                    {top3.map((key, i) => {
                      const tech = TECHNIQUES_DATA.find((t) => t.key === key)!;
                      return (
                        <div key={key} className="top3-badge">
                          <span className="badge-medal">
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                          </span>
                          <span className="badge-icon">{tech.icon}</span>
                          <span className="badge-name">{tech.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Alle Techniken mit Anwendungen */}
                <div className="certificate-all-techniques">
                  <h4>📋 Meine Lerntechniken-Übersicht:</h4>
                  <div className="all-techniques-list">
                    {TECHNIQUES_DATA.map((tech) => {
                      const application = progress.applications[tech.key];
                      return (
                        <div key={tech.key} className="technique-row">
                          <span className="technique-icon-small">{tech.icon}</span>
                          <span className="technique-name-small">{tech.name}</span>
                          {application && (
                            <span className="technique-application">→ {application}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="certificate-xp">
                  ⭐ {totalXP + XP_REWARDS.CERTIFICATE_EARNED} XP gesammelt ⭐
                </div>

                <div className="certificate-date">{today}</div>

                <div className="certificate-signature">
                  <span className="signature-icon">✨</span>
                  <span className="signature-text">Pulse of Learning</span>
                </div>
              </div>
            </div>
          </div>

          <div className="certificate-actions">
            <button
              className="action-btn download"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? '⏳ Speichern...' : '📥 Als Bild speichern'}
            </button>
            <button className="action-btn print" onClick={handlePrint}>
              🖨️ Drucken
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ============================================
// KONFETTI EFFEKT
// ============================================

function ConfettiEffect() {
  const colors = ['var(--fb-reward)', '#ff6b6b', '#4ecdc4', '#9b59b6', '#3498db', '#2ecc71'];
  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));

  return (
    <div className="confetti-container">
      {confettiPieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="confetti-piece"
          style={{
            left: `${piece.left}%`,
            backgroundColor: piece.color,
          }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{
            y: '100vh',
            opacity: 0,
            rotate: 720,
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}
