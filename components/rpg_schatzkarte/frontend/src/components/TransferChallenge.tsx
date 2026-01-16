// ============================================
// Transfer Challenge - Hauptkomponente
// Transferlernen - Interaktive Lernreise
// NEUE VERSION: Kreative, handlungsorientierte Übungen
// Für Grundschule (8-10 Jahre)
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TransferChallengeProps,
  TransferProgress,
  ChallengeState,
  PhaseKey,
  DiscoveredTrick,
  JournalEntry,
  HobbyOption,
  SchoolSubject,
  ConnectionChallenge,
  // Daten
  PHASES_INFO,
  XP_REWARDS,
  EFFECT_SIZE,
  CONNECTIONS_INTRO,
  CONNECTION_CHALLENGES,
  CONNECTIONS_SUCCESS_MESSAGES,
  MY_TRICK_INTRO,
  HOBBY_OPTIONS,
  SCHOOL_SUBJECTS,
  MISSION_INTRO,
  MISSION_CONTRACT,
  JOURNAL_INTRO,
  JOURNAL_PROMPTS,
  JOURNAL_BADGES,
  CERTIFICATE_DATA,
  // Helper
  getDefaultProgress,
  shuffleArray,
  getRandomItems,
  formatDate,
  getCurrentBadge,
  getNextBadge,
} from './transferChallengeTypes';
import '../styles/transfer-challenge.css';

// ============================================
// HAUPT-KOMPONENTE
// ============================================

export function TransferChallenge({
  onComplete,
  onClose,
  savedProgress,
  onSaveProgress,
}: TransferChallengeProps) {
  // Progress State
  const [progress, setProgress] = useState<TransferProgress>(
    savedProgress || getDefaultProgress()
  );

  // Navigation State
  const [state, setState] = useState<ChallengeState>({
    currentPhase: 'overview',
    phaseStep: 'intro',
  });

  // XP Animation
  const [showXPReward, setShowXPReward] = useState<number | null>(null);

  // Konfetti bei komplettem Abschluss
  const [showConfetti, setShowConfetti] = useState(false);

  // Speichern bei Änderungen
  useEffect(() => {
    onSaveProgress?.(progress);
  }, [progress, onSaveProgress]);

  // Prüfen ob alle Phasen fertig (erste 3 Phasen müssen abgeschlossen sein)
  const requiredPhases: PhaseKey[] = ['connections', 'myTrick', 'mission'];
  const allPhasesComplete = requiredPhases.every(p => progress.completedPhases.includes(p));

  // Phase abschließen
  const completePhase = useCallback((phase: PhaseKey, xp: number, bonusXP: number = 0) => {
    const totalXP = xp + bonusXP;

    setProgress(prev => {
      const newCompleted = prev.completedPhases.includes(phase)
        ? prev.completedPhases
        : [...prev.completedPhases, phase];

      const newProgress = {
        ...prev,
        completedPhases: newCompleted,
        totalXP: prev.totalXP + totalXP,
      };

      // Alle fertig? (erste 3 Phasen)
      const allDone = requiredPhases.every(p => newCompleted.includes(p));
      if (allDone && !prev.certificateEarned) {
        newProgress.certificateEarned = true;
        newProgress.totalXP += XP_REWARDS.ALL_PHASES_BONUS;
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }

      return newProgress;
    });

    // XP Animation
    setShowXPReward(totalXP);
    setTimeout(() => setShowXPReward(null), 2500);

    // Zurück zur Übersicht
    setState({ currentPhase: 'overview', phaseStep: 'intro' });
  }, []);

  // Phase auswählen
  const selectPhase = (phase: PhaseKey) => {
    setState({ currentPhase: phase, phaseStep: 'intro' });
  };

  // Zum Zertifikat
  const showCertificate = () => {
    setState({ currentPhase: 'certificate', phaseStep: 'intro' });
  };

  // Zurück zur Übersicht
  const backToOverview = () => {
    setState({ currentPhase: 'overview', phaseStep: 'intro' });
  };

  // Trick speichern
  const saveTrick = (trick: DiscoveredTrick) => {
    setProgress(prev => ({ ...prev, discoveredTrick: trick }));
  };

  // Journal-Eintrag hinzufügen
  const addJournalEntry = (entry: JournalEntry) => {
    setProgress(prev => ({
      ...prev,
      journalEntries: [...prev.journalEntries, entry],
      totalXP: prev.totalXP + XP_REWARDS.JOURNAL_ENTRY,
    }));
    setShowXPReward(XP_REWARDS.JOURNAL_ENTRY);
    setTimeout(() => setShowXPReward(null), 2500);
  };

  return (
    <div className="transfer-challenge">
      {/* Header */}
      <div className="challenge-header">
        <button className="back-btn" onClick={onClose}>
          ← Zurück
        </button>
        <h1 className="challenge-title">
          <motion.span
            className="title-icon"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            🌉
          </motion.span>
          Transferlernen
        </h1>
        <div className="xp-badge">
          <motion.span
            className="xp-icon"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            ⭐
          </motion.span>
          <span className="xp-amount">{progress.totalXP} XP</span>
        </div>
      </div>

      {/* Fortschrittsbalken */}
      <div className="progress-container">
        <div className="progress-bar">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${(progress.completedPhases.filter(p => requiredPhases.includes(p)).length / 3) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <span className="progress-text">
          {progress.completedPhases.filter(p => requiredPhases.includes(p)).length}/3 Hauptphasen
        </span>
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
            <motion.span
              className="xp-reward-amount"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: 2, duration: 0.3 }}
            >
              +{showXPReward} XP!
            </motion.span>
            <motion.span
              className="xp-reward-stars"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 1 }}
            >
              ⭐✨⭐
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Konfetti */}
      {showConfetti && <ConfettiEffect />}

      {/* Hauptinhalt */}
      <AnimatePresence mode="wait">
        {state.currentPhase === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="phase-overview"
          >
            <p className="overview-intro">
              Entdecke das Geheimnis der Überflieger! 🌟<br />
              Lerne, wie du dein Wissen übertragen kannst.
            </p>

            <div className="phases-grid">
              {(Object.keys(PHASES_INFO) as PhaseKey[]).map((phaseKey, index) => (
                <PhaseCard
                  key={phaseKey}
                  phaseKey={phaseKey}
                  info={PHASES_INFO[phaseKey]}
                  isCompleted={progress.completedPhases.includes(phaseKey)}
                  isBonus={phaseKey === 'journal'}
                  journalCount={phaseKey === 'journal' ? progress.journalEntries.length : undefined}
                  onClick={() => selectPhase(phaseKey)}
                  delay={index * 0.1}
                />
              ))}
            </div>

            {/* Alle fertig Banner */}
            {allPhasesComplete && (
              <motion.div
                className="all-complete-banner"
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", bounce: 0.5 }}
              >
                <motion.span
                  className="banner-icon"
                  animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  🏆
                </motion.span>
                <span className="banner-text">
                  SUPER! Du bist ein Transfer-Agent!
                </span>
                <button className="certificate-btn" onClick={showCertificate}>
                  🎓 Zertifikat ansehen
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {state.currentPhase === 'connections' && (
          <motion.div
            key="connections"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <ConnectionsPhase
              onComplete={(score) => {
                setProgress(prev => ({ ...prev, connectionsScore: score }));
                const bonus = score === 4 ? XP_REWARDS.PERFECT_BONUS : 0;
                completePhase('connections', XP_REWARDS.CONNECTIONS_COMPLETE, bonus);
              }}
              onBack={backToOverview}
            />
          </motion.div>
        )}

        {state.currentPhase === 'myTrick' && (
          <motion.div
            key="myTrick"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <MyTrickPhase
              onComplete={(trick) => {
                saveTrick(trick);
                completePhase('myTrick', XP_REWARDS.MY_TRICK_COMPLETE);
              }}
              onBack={backToOverview}
            />
          </motion.div>
        )}

        {state.currentPhase === 'mission' && (
          <motion.div
            key="mission"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <MissionPhase
              discoveredTrick={progress.discoveredTrick}
              onComplete={() => {
                completePhase('mission', XP_REWARDS.MISSION_COMPLETE);
              }}
              onBack={backToOverview}
            />
          </motion.div>
        )}

        {state.currentPhase === 'journal' && (
          <motion.div
            key="journal"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <JournalPhase
              entries={progress.journalEntries}
              onAddEntry={addJournalEntry}
              onBack={backToOverview}
            />
          </motion.div>
        )}

        {state.currentPhase === 'certificate' && (
          <motion.div
            key="certificate"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
          >
            <Certificate
              progress={progress}
              onBack={backToOverview}
              onComplete={() => onComplete(progress.totalXP)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// PHASEN-KARTE
// ============================================

interface PhaseCardProps {
  phaseKey: PhaseKey;
  info: typeof PHASES_INFO[PhaseKey];
  isCompleted: boolean;
  isBonus?: boolean;
  journalCount?: number;
  onClick: () => void;
  delay: number;
}

function PhaseCard({ phaseKey, info, isCompleted, isBonus, journalCount, onClick, delay }: PhaseCardProps) {
  return (
    <motion.button
      className={`phase-card ${isCompleted ? 'completed' : ''} ${isBonus ? 'bonus-phase' : ''}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", bounce: 0.4 }}
      whileHover={{ scale: 1.05, rotate: [-1, 1, -1, 0] }}
      whileTap={{ scale: 0.95 }}
      style={{ '--phase-color': info.color } as React.CSSProperties}
    >
      <div className="card-glow" />

      {isBonus && (
        <div className="bonus-badge">BONUS</div>
      )}

      <motion.span
        className="phase-icon"
        animate={isCompleted ? { rotate: [0, 360] } : {}}
        transition={{ duration: 0.5 }}
      >
        {info.icon}
      </motion.span>
      <span className="phase-name">{info.name}</span>
      <span className="phase-description">{info.description}</span>

      {isCompleted && (
        <motion.div
          className="completed-badge"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.6 }}
        >
          ✓
        </motion.div>
      )}

      {journalCount !== undefined && journalCount > 0 && (
        <div className="journal-count">{journalCount} Einträge</div>
      )}

      <div className="xp-preview">
        <span>+{info.xp} XP</span>
      </div>
    </motion.button>
  );
}

// ============================================
// PHASE HEADER
// ============================================

interface PhaseHeaderProps {
  icon: string;
  title: string;
  color: string;
  onBack: () => void;
}

function PhaseHeader({ icon, title, color, onBack }: PhaseHeaderProps) {
  return (
    <div className="phase-header" style={{ background: color }}>
      <button className="phase-back-btn" onClick={onBack}>
        ← Zurück
      </button>
      <motion.span
        className="phase-header-icon"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        {icon}
      </motion.span>
      <h2 className="phase-header-title">{title}</h2>
    </div>
  );
}

// ============================================
// PHASE 1: VERRÜCKTE VERBINDUNGEN
// ============================================

interface ConnectionsPhaseProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

function ConnectionsPhase({ onComplete, onBack }: ConnectionsPhaseProps) {
  const [step, setStep] = useState<'intro' | 'game' | 'result'>('intro');
  const [challenges] = useState(() => getRandomItems(CONNECTION_CHALLENGES, 4));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const currentChallenge = challenges[currentIndex];

  const handleAnswer = (optionId: string) => {
    setSelectedAnswer(optionId);
    setShowFeedback(true);

    const isCorrect = currentChallenge.options.find(o => o.id === optionId)?.isCorrect;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const nextChallenge = () => {
    setSelectedAnswer(null);
    setShowFeedback(false);

    if (currentIndex < challenges.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setStep('result');
    }
  };

  return (
    <div className="phase-container connections-phase">
      <PhaseHeader
        icon={PHASES_INFO.connections.icon}
        title={PHASES_INFO.connections.name}
        color={PHASES_INFO.connections.color}
        onBack={onBack}
      />

      <AnimatePresence mode="wait">
        {step === 'intro' && (
          <motion.div
            key="intro"
            className="phase-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="intro-card">
              <motion.div
                className="intro-icon"
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                🔗
              </motion.div>
              <h3>{CONNECTIONS_INTRO.title}</h3>
              <div className="intro-text story-text">
                <p><strong>Stell dir vor:</strong> Ein Koch und ein Mathelehrer treffen sich.</p>
                <p>Der Koch sagt: "Ich muss immer genau abmessen!"</p>
                <p>Der Mathelehrer lacht: "Ich auch!"</p>
                <p className="highlight">Komisch, oder? Kochen und Mathe haben etwas gemeinsam! 🤔</p>
                <p><strong>Das ist Transfer:</strong> Dinge sehen, die gleich funktionieren – auch wenn sie ganz verschieden aussehen.</p>
              </div>
              <motion.button
                className="next-btn"
                onClick={() => setStep('game')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Verbindungen finden! 🔍
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === 'game' && currentChallenge && (
          <motion.div
            key="game"
            className="phase-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="connection-game">
              {/* Progress */}
              <div className="game-progress">
                {challenges.map((_, i) => (
                  <motion.div
                    key={i}
                    className={`progress-dot ${i === currentIndex ? 'active' : ''} ${i < currentIndex ? 'done' : ''}`}
                    animate={i === currentIndex ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1 }}
                  />
                ))}
              </div>

              {/* Die zwei Dinge */}
              <motion.div
                className="connection-pair"
                key={currentChallenge.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="thing-card">
                  <span className="thing-icon">{currentChallenge.thing1.icon}</span>
                  <span className="thing-text">{currentChallenge.thing1.text}</span>
                </div>
                <motion.div
                  className="vs-badge"
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  &
                </motion.div>
                <div className="thing-card">
                  <span className="thing-icon">{currentChallenge.thing2.icon}</span>
                  <span className="thing-text">{currentChallenge.thing2.text}</span>
                </div>
              </motion.div>

              {/* Frage */}
              <div className="connection-question">
                <p><strong>Was haben diese beiden gemeinsam?</strong></p>
              </div>

              {/* Optionen */}
              <div className="connection-options">
                {currentChallenge.options.map((option, index) => {
                  const isSelected = selectedAnswer === option.id;
                  const showResult = showFeedback && isSelected;
                  const isCorrectOption = option.isCorrect;

                  return (
                    <motion.button
                      key={option.id}
                      className={`connection-option ${isSelected ? 'selected' : ''} ${showFeedback && isCorrectOption ? 'correct' : ''} ${showResult && !isCorrectOption ? 'wrong' : ''}`}
                      onClick={() => !showFeedback && handleAnswer(option.id)}
                      disabled={showFeedback}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={!showFeedback ? { scale: 1.02, x: 5 } : {}}
                      whileTap={!showFeedback ? { scale: 0.98 } : {}}
                    >
                      <span className="option-text">{option.text}</span>
                      {showFeedback && isCorrectOption && (
                        <motion.span
                          className="option-check"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          ✓
                        </motion.span>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Feedback */}
              <AnimatePresence>
                {showFeedback && (
                  <motion.div
                    className={`connection-feedback ${selectedAnswer && currentChallenge.options.find(o => o.id === selectedAnswer)?.isCorrect ? 'correct' : 'wrong'}`}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <p className="feedback-principle">
                      <strong>Das Prinzip:</strong> {currentChallenge.correctPrinciple}
                    </p>
                    <p>{currentChallenge.explanation}</p>
                    <motion.button
                      className="next-btn"
                      onClick={nextChallenge}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {currentIndex < challenges.length - 1 ? 'Nächste Verbindung →' : 'Ergebnis sehen →'}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {step === 'result' && (
          <motion.div
            key="result"
            className="phase-content"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="result-card">
              <motion.div
                className="result-icon"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                🔗
              </motion.div>
              <h3>{CONNECTIONS_SUCCESS_MESSAGES[Math.min(score, CONNECTIONS_SUCCESS_MESSAGES.length - 1)]}</h3>

              <div className="result-summary">
                <p>Du hast <strong>{score}/{challenges.length}</strong> Verbindungen erkannt!</p>
                {score === challenges.length && (
                  <motion.p
                    className="perfect-score"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    🌟 Perfekt! +{XP_REWARDS.PERFECT_BONUS} Bonus-XP! 🌟
                  </motion.p>
                )}
              </div>

              <div className="result-insight">
                <p>🧠 <strong>Das hast du gelernt:</strong></p>
                <p>Viele verschiedene Dinge funktionieren nach dem gleichen Prinzip. Wenn du das erkennst, kannst du dein Wissen überall nutzen!</p>
              </div>

              <motion.button
                className="complete-btn"
                onClick={() => onComplete(score)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Phase abschließen! 🎉
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// PHASE 2: MEIN GEHEIMER TRICK
// ============================================

interface MyTrickPhaseProps {
  onComplete: (trick: DiscoveredTrick) => void;
  onBack: () => void;
}

function MyTrickPhase({ onComplete, onBack }: MyTrickPhaseProps) {
  const [step, setStep] = useState<'intro' | 'hobby' | 'trick' | 'subject' | 'reveal'>('intro');
  const [selectedHobby, setSelectedHobby] = useState<HobbyOption | null>(null);
  const [selectedTrick, setSelectedTrick] = useState<string | null>(null);
  const [customTrick, setCustomTrick] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<SchoolSubject | null>(null);

  const stepIndex = ['intro', 'hobby', 'trick', 'subject', 'reveal'].indexOf(step);

  const handleComplete = () => {
    if (selectedHobby && (selectedTrick || customTrick) && selectedSubject) {
      onComplete({
        hobby: selectedHobby,
        trick: selectedTrick || customTrick,
        schoolSubject: selectedSubject,
        applicationIdea: `Ich nutze "${selectedTrick || customTrick}" aus ${selectedHobby.label} für ${selectedSubject.label}!`,
      });
    }
  };

  return (
    <div className="phase-container mytrick-phase">
      <PhaseHeader
        icon={PHASES_INFO.myTrick.icon}
        title={PHASES_INFO.myTrick.name}
        color={PHASES_INFO.myTrick.color}
        onBack={onBack}
      />

      {/* Step Progress */}
      {step !== 'intro' && (
        <div className="step-progress">
          {['hobby', 'trick', 'subject', 'reveal'].map((s, i) => (
            <motion.div
              key={s}
              className={`step-dot ${i <= stepIndex - 1 ? 'active' : ''} ${i < stepIndex - 1 ? 'done' : ''}`}
              animate={i === stepIndex - 1 ? { scale: [1, 1.2, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              {i < stepIndex - 1 ? '✓' : i + 1}
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 'intro' && (
          <motion.div
            key="intro"
            className="phase-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="intro-card">
              <motion.div
                className="intro-icon"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                🎯
              </motion.div>
              <h3>{MY_TRICK_INTRO.title}</h3>
              <div className="intro-text story-text">
                <p><strong>Jeder hat einen Geheimtrick!</strong></p>
                <p>Du auch! Du weißt es vielleicht nur noch nicht.</p>
                <p>Denk an etwas, das du richtig gut kannst. Irgendwas, das dir Spaß macht.</p>
                <p className="highlight"><strong>Dort steckt dein Geheimtrick versteckt!</strong></p>
                <p>Und der funktioniert auch in der Schule. 🎯</p>
              </div>
              <motion.button
                className="next-btn"
                onClick={() => setStep('hobby')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Meinen Trick entdecken! 🔍
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === 'hobby' && (
          <motion.div
            key="hobby"
            className="phase-content"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <div className="selection-container">
              <h3>Was kannst du richtig gut?</h3>
              <p className="selection-hint">Wähle etwas, das dir Spaß macht!</p>

              <div className="options-grid hobby-grid">
                {HOBBY_OPTIONS.map((hobby, index) => (
                  <motion.button
                    key={hobby.id}
                    className={`option-card ${selectedHobby?.id === hobby.id ? 'selected' : ''}`}
                    onClick={() => setSelectedHobby(hobby)}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="option-icon">{hobby.icon}</span>
                    <span className="option-label">{hobby.label}</span>
                  </motion.button>
                ))}
              </div>

              <motion.button
                className="next-btn"
                onClick={() => setStep('trick')}
                disabled={!selectedHobby}
                whileHover={selectedHobby ? { scale: 1.05 } : {}}
              >
                Weiter →
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === 'trick' && selectedHobby && (
          <motion.div
            key="trick"
            className="phase-content"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <div className="selection-container">
              <div className="context-badge">
                <span>{selectedHobby.icon}</span> {selectedHobby.label}
              </div>
              <h3>Was ist dein Geheimtrick bei {selectedHobby.label}?</h3>
              <p className="selection-hint">Was machst du, damit es gut klappt?</p>

              <div className="trick-options">
                {selectedHobby.suggestedTricks.map((trick, index) => (
                  <motion.button
                    key={trick}
                    className={`trick-option ${selectedTrick === trick ? 'selected' : ''}`}
                    onClick={() => { setSelectedTrick(trick); setCustomTrick(''); }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {trick}
                  </motion.button>
                ))}
              </div>

              <div className="custom-trick">
                <p>Oder schreib deinen eigenen Trick:</p>
                <input
                  type="text"
                  value={customTrick}
                  onChange={(e) => { setCustomTrick(e.target.value); setSelectedTrick(null); }}
                  placeholder="Mein eigener Trick..."
                  className="trick-input"
                />
              </div>

              <div className="btn-row">
                <button className="back-step-btn" onClick={() => setStep('hobby')}>
                  ← Zurück
                </button>
                <motion.button
                  className="next-btn"
                  onClick={() => setStep('subject')}
                  disabled={!selectedTrick && !customTrick}
                  whileHover={selectedTrick || customTrick ? { scale: 1.05 } : {}}
                >
                  Weiter →
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'subject' && (
          <motion.div
            key="subject"
            className="phase-content"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <div className="selection-container">
              <div className="context-badge">
                <span>{selectedHobby?.icon}</span> {selectedHobby?.label} →
                <span>💡</span> {selectedTrick || customTrick}
              </div>
              <h3>Wo in der Schule könnte dein Trick helfen?</h3>
              <p className="selection-hint">Wähle ein Fach oder eine Situation!</p>

              <div className="options-grid subject-grid">
                {SCHOOL_SUBJECTS.map((subject, index) => (
                  <motion.button
                    key={subject.id}
                    className={`option-card ${selectedSubject?.id === subject.id ? 'selected' : ''}`}
                    onClick={() => setSelectedSubject(subject)}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="option-icon">{subject.icon}</span>
                    <span className="option-label">{subject.label}</span>
                  </motion.button>
                ))}
              </div>

              <div className="btn-row">
                <button className="back-step-btn" onClick={() => setStep('trick')}>
                  ← Zurück
                </button>
                <motion.button
                  className="next-btn"
                  onClick={() => setStep('reveal')}
                  disabled={!selectedSubject}
                  whileHover={selectedSubject ? { scale: 1.05 } : {}}
                >
                  Trick enthüllen! ✨
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'reveal' && selectedHobby && selectedSubject && (
          <motion.div
            key="reveal"
            className="phase-content"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="trick-reveal">
              <h3>Dein persönlicher Geheimtrick!</h3>

              <motion.div
                className="trick-card"
                initial={{ rotateY: 180, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <div className="card-shine" />
                <div className="trick-card-header">
                  <span className="trick-card-icon">🎯</span>
                  <span>Mein Geheimtrick</span>
                </div>
                <div className="trick-card-body">
                  <div className="trick-row from">
                    <span className="trick-label">Ich kann:</span>
                    <span className="trick-value">{selectedHobby.icon} {selectedHobby.label}</span>
                  </div>
                  <div className="trick-row principle">
                    <span className="trick-label">Mein Trick:</span>
                    <span className="trick-value">💡 {selectedTrick || customTrick}</span>
                  </div>
                  <motion.div
                    className="trick-bridge"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    🌉
                  </motion.div>
                  <div className="trick-row to">
                    <span className="trick-label">Das hilft bei:</span>
                    <span className="trick-value">{selectedSubject.icon} {selectedSubject.label}</span>
                  </div>
                </div>
                <div className="trick-card-footer">
                  <span>Effektstärke d={EFFECT_SIZE} ⭐</span>
                </div>
              </motion.div>

              <p className="reveal-hint">
                🚀 Merk dir diesen Trick! Er ist deine geheime Superkraft!
              </p>

              <div className="btn-row">
                <button className="back-step-btn" onClick={() => setStep('subject')}>
                  ← Ändern
                </button>
                <motion.button
                  className="complete-btn"
                  onClick={handleComplete}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Trick speichern! 🎉
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// PHASE 3: TRANSFER-MISSION
// ============================================

interface MissionPhaseProps {
  discoveredTrick: DiscoveredTrick | null;
  onComplete: () => void;
  onBack: () => void;
}

function MissionPhase({ discoveredTrick, onComplete, onBack }: MissionPhaseProps) {
  const [step, setStep] = useState<'intro' | 'mission' | 'contract' | 'confirmed'>('intro');
  const [signed, setSigned] = useState(false);

  const hasTrick = discoveredTrick !== null;

  return (
    <div className="phase-container mission-phase">
      <PhaseHeader
        icon={PHASES_INFO.mission.icon}
        title={PHASES_INFO.mission.name}
        color={PHASES_INFO.mission.color}
        onBack={onBack}
      />

      <AnimatePresence mode="wait">
        {step === 'intro' && (
          <motion.div
            key="intro"
            className="phase-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="intro-card mission-intro">
              <motion.div
                className="intro-icon"
                animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                🕵️
              </motion.div>
              <h3>{MISSION_INTRO.title}</h3>
              <div className="intro-text story-text">
                <p><strong>Agent, dein Auftrag wartet!</strong></p>
                {hasTrick ? (
                  <>
                    <p>Du hast deinen Geheimtrick entdeckt:</p>
                    <div className="mission-trick-preview">
                      <span>{discoveredTrick.hobby.icon}</span>
                      <span>→</span>
                      <span>💡 {discoveredTrick.trick}</span>
                      <span>→</span>
                      <span>{discoveredTrick.schoolSubject.icon}</span>
                    </div>
                    <p className="highlight">Jetzt ist es Zeit für eine echte Mission!</p>
                    <p><strong>Morgen in der Schule:</strong> Du wendest deinen Trick an.</p>
                  </>
                ) : (
                  <>
                    <p>Du musst erst deinen Geheimtrick entdecken!</p>
                    <p className="highlight">Gehe zurück und schließe "Mein Geheimer Trick" ab.</p>
                  </>
                )}
              </div>
              {hasTrick ? (
                <motion.button
                  className="next-btn"
                  onClick={() => setStep('mission')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Mission annehmen! 🎯
                </motion.button>
              ) : (
                <button className="back-step-btn" onClick={onBack}>
                  ← Zurück zur Übersicht
                </button>
              )}
            </div>
          </motion.div>
        )}

        {step === 'mission' && discoveredTrick && (
          <motion.div
            key="mission"
            className="phase-content"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="mission-card">
              <motion.div
                className="mission-stamp"
                initial={{ rotate: -30, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                GEHEIM
              </motion.div>

              <div className="mission-header">
                <span className="mission-badge">🚀 MISSION</span>
                <h3>Transfer-Auftrag #{Math.floor(Math.random() * 900) + 100}</h3>
              </div>

              <div className="mission-content">
                <p className="mission-text">
                  <strong>Dein Auftrag:</strong>
                </p>
                <p className="mission-description">
                  Wenn du das nächste Mal <strong>{discoveredTrick.schoolSubject.label}</strong> hast,
                  denke an deinen Trick "<strong>{discoveredTrick.trick}</strong>"
                  aus <strong>{discoveredTrick.hobby.label}</strong>.
                </p>
                <p className="mission-objective">
                  <strong>Ziel:</strong> Beobachte, ob es dir hilft!
                </p>
              </div>

              <div className="mission-tips">
                <p>💡 <strong>Tipp:</strong> Niemand muss wissen, dass du einen Geheimtrick benutzt!</p>
              </div>

              <motion.button
                className="next-btn"
                onClick={() => setStep('contract')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Mission annehmen! ✍️
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === 'contract' && discoveredTrick && (
          <motion.div
            key="contract"
            className="phase-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="contract-card">
              <div className="contract-header">
                <span>📜</span>
                <h3>{MISSION_CONTRACT.title}</h3>
              </div>

              <div className="contract-body">
                <p><strong>Ich, Transfer-Agent, verspreche:</strong></p>
                <p>Ich werde in der Schule meinen Geheimtrick ausprobieren!</p>

                <div className="contract-details">
                  <div className="contract-row">
                    <span className="contract-label">Mein Trick:</span>
                    <span className="contract-value">{discoveredTrick.trick}</span>
                  </div>
                  <div className="contract-row">
                    <span className="contract-label">Bei:</span>
                    <span className="contract-value">{discoveredTrick.schoolSubject.icon} {discoveredTrick.schoolSubject.label}</span>
                  </div>
                </div>
              </div>

              <motion.button
                className={`signature-btn ${signed ? 'signed' : ''}`}
                onClick={() => setSigned(true)}
                whileHover={!signed ? { scale: 1.05 } : {}}
                whileTap={!signed ? { scale: 0.95 } : {}}
              >
                {signed ? (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    ✅ Unterschrieben!
                  </motion.span>
                ) : (
                  <span>✍️ Hier unterschreiben</span>
                )}
              </motion.button>

              {signed && (
                <motion.button
                  className="complete-btn"
                  onClick={() => setStep('confirmed')}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Mission bestätigen! 🚀
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {step === 'confirmed' && (
          <motion.div
            key="confirmed"
            className="phase-content"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="result-card confirmed-card">
              <motion.div
                className="result-icon"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
                transition={{ duration: 1 }}
              >
                🚀
              </motion.div>
              <h3>Mission angenommen!</h3>

              <div className="confirmed-message">
                <p>Super! Dein Geheimauftrag ist aktiv.</p>
                <p className="highlight">
                  Vergiss nicht: Bei der nächsten Gelegenheit in {discoveredTrick?.schoolSubject.label}
                  wendest du deinen Trick an!
                </p>
              </div>

              <div className="mission-reminder">
                <p>📔 <strong>Tipp:</strong> Schreib nachher im Transfer-Tagebuch auf, wie es gelaufen ist!</p>
              </div>

              <motion.button
                className="complete-btn"
                onClick={onComplete}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Phase abschließen! 🎉
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// PHASE 4: TRANSFER-TAGEBUCH
// ============================================

interface JournalPhaseProps {
  entries: JournalEntry[];
  onAddEntry: (entry: JournalEntry) => void;
  onBack: () => void;
}

function JournalPhase({ entries, onAddEntry, onBack }: JournalPhaseProps) {
  const [view, setView] = useState<'intro' | 'list' | 'new'>('intro');
  const [newEntry, setNewEntry] = useState({
    fromActivity: '',
    toActivity: '',
    trick: '',
    howItHelped: '',
    stars: 0,
  });

  const currentBadge = getCurrentBadge(entries.length);
  const nextBadge = getNextBadge(entries.length);

  const handleSaveEntry = () => {
    if (newEntry.fromActivity && newEntry.toActivity && newEntry.trick && newEntry.stars > 0) {
      onAddEntry({
        id: `entry-${Date.now()}`,
        date: new Date().toISOString(),
        ...newEntry,
      });
      setNewEntry({ fromActivity: '', toActivity: '', trick: '', howItHelped: '', stars: 0 });
      setView('list');
    }
  };

  const canSave = newEntry.fromActivity && newEntry.toActivity && newEntry.trick && newEntry.stars > 0;

  return (
    <div className="phase-container journal-phase">
      <PhaseHeader
        icon={PHASES_INFO.journal.icon}
        title={PHASES_INFO.journal.name}
        color={PHASES_INFO.journal.color}
        onBack={onBack}
      />

      <AnimatePresence mode="wait">
        {view === 'intro' && (
          <motion.div
            key="intro"
            className="phase-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="intro-card">
              <motion.div
                className="intro-icon"
                animate={{ rotate: [0, -5, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                📔
              </motion.div>
              <h3>{JOURNAL_INTRO.title}</h3>
              <div className="intro-text story-text">
                <p><strong>Echte Helden schreiben Tagebuch!</strong> 📔</p>
                <p>Hier sammelst du deine Transfer-Erfolge.</p>
                <p>Jedes Mal, wenn du einen Trick überträgst, schreibst du es auf.</p>
                <p className="highlight">Je mehr Einträge, desto mehr Superkraft! 🦸</p>
              </div>

              {currentBadge && (
                <div className="current-badge">
                  <span className="badge-icon">{currentBadge.icon}</span>
                  <span className="badge-name">{currentBadge.name}</span>
                </div>
              )}

              <motion.button
                className="next-btn"
                onClick={() => setView('list')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Tagebuch öffnen! 📖
              </motion.button>
            </div>
          </motion.div>
        )}

        {view === 'list' && (
          <motion.div
            key="list"
            className="phase-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="journal-container">
              {/* Badge Progress */}
              <div className="badge-progress">
                <div className="badge-current">
                  {currentBadge ? (
                    <>
                      <span className="badge-icon">{currentBadge.icon}</span>
                      <span>{currentBadge.name}</span>
                    </>
                  ) : (
                    <span>Noch kein Badge</span>
                  )}
                </div>
                {nextBadge && (
                  <div className="badge-next">
                    <span>Nächstes: {nextBadge.icon} {nextBadge.name}</span>
                    <span className="badge-progress-text">
                      ({entries.length}/{nextBadge.entries} Einträge)
                    </span>
                  </div>
                )}
              </div>

              {/* Einträge */}
              <div className="journal-entries">
                <div className="entries-header">
                  <h4>Deine Einträge ({entries.length})</h4>
                  <motion.button
                    className="add-entry-btn"
                    onClick={() => setView('new')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    + Neuer Eintrag
                  </motion.button>
                </div>

                {entries.length === 0 ? (
                  <div className="no-entries">
                    <p>📝 Noch keine Einträge</p>
                    <p>Schreibe deinen ersten Transfer-Erfolg auf!</p>
                  </div>
                ) : (
                  <div className="entries-list">
                    {[...entries].reverse().map((entry, index) => (
                      <motion.div
                        key={entry.id}
                        className="journal-entry"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="entry-header">
                          <span className="entry-date">{formatDate(entry.date)}</span>
                          <span className="entry-stars">
                            {'⭐'.repeat(entry.stars)}
                          </span>
                        </div>
                        <div className="entry-transfer">
                          <span>{entry.fromActivity}</span>
                          <span className="entry-arrow">→</span>
                          <span>{entry.toActivity}</span>
                        </div>
                        <div className="entry-trick">
                          💡 {entry.trick}
                        </div>
                        {entry.howItHelped && (
                          <div className="entry-reflection">
                            "{entry.howItHelped}"
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {view === 'new' && (
          <motion.div
            key="new"
            className="phase-content"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <div className="new-entry-form">
              <h3>Neuer Tagebuch-Eintrag</h3>

              <div className="form-group">
                <label>{JOURNAL_PROMPTS.fromActivity}</label>
                <input
                  type="text"
                  value={newEntry.fromActivity}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, fromActivity: e.target.value }))}
                  placeholder="z.B. Fußball, Minecraft, Lego..."
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>{JOURNAL_PROMPTS.toActivity}</label>
                <input
                  type="text"
                  value={newEntry.toActivity}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, toActivity: e.target.value }))}
                  placeholder="z.B. Mathe, Deutsch, Hausaufgaben..."
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>{JOURNAL_PROMPTS.trick}</label>
                <input
                  type="text"
                  value={newEntry.trick}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, trick: e.target.value }))}
                  placeholder="z.B. Schritt für Schritt vorgehen..."
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>{JOURNAL_PROMPTS.howItHelped}</label>
                <textarea
                  value={newEntry.howItHelped}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, howItHelped: e.target.value }))}
                  placeholder="Erzähl, wie es dir geholfen hat..."
                  className="form-textarea"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>{JOURNAL_PROMPTS.stars}</label>
                <div className="star-rating">
                  {[1, 2, 3].map((star) => (
                    <motion.button
                      key={star}
                      className={`star-btn ${newEntry.stars >= star ? 'active' : ''}`}
                      onClick={() => setNewEntry(prev => ({ ...prev, stars: star }))}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {newEntry.stars >= star ? '⭐' : '☆'}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="btn-row">
                <button className="back-step-btn" onClick={() => setView('list')}>
                  ← Abbrechen
                </button>
                <motion.button
                  className="complete-btn"
                  onClick={handleSaveEntry}
                  disabled={!canSave}
                  whileHover={canSave ? { scale: 1.05 } : {}}
                  whileTap={canSave ? { scale: 0.95 } : {}}
                >
                  Eintrag speichern! 📝
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// ZERTIFIKAT
// ============================================

interface CertificateProps {
  progress: TransferProgress;
  onBack: () => void;
  onComplete: () => void;
}

function Certificate({ progress, onBack, onComplete }: CertificateProps) {
  return (
    <div className="certificate-container">
      <motion.div
        className="certificate"
        initial={{ scale: 0.8, opacity: 0, rotateY: 90 }}
        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
        transition={{ duration: 0.8, type: "spring" }}
      >
        <div className="certificate-border">
          <div className="certificate-inner">
            {/* Header */}
            <div className="cert-header">
              <motion.div
                className="cert-badge"
                animate={{ rotate: [0, -5, 5, -5, 0], scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 3 }}
              >
                🏆
              </motion.div>
              <h2>Zertifikat</h2>
              <h3>{CERTIFICATE_DATA.title}</h3>
            </div>

            {/* Content */}
            <div className="cert-content">
              <p className="cert-subtitle">{CERTIFICATE_DATA.subtitle}</p>

              <div className="cert-skills">
                {CERTIFICATE_DATA.skills.map((skill, i) => (
                  <motion.div
                    key={skill}
                    className="cert-skill"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.2 }}
                  >
                    <span className="skill-check">✓</span>
                    <span>{skill}</span>
                  </motion.div>
                ))}
              </div>

              {progress.discoveredTrick && (
                <div className="cert-personal">
                  <p className="personal-label">Persönlicher Geheimtrick:</p>
                  <p className="personal-trick">
                    {progress.discoveredTrick.hobby.icon} {progress.discoveredTrick.hobby.label} →
                    💡 {progress.discoveredTrick.trick} →
                    {progress.discoveredTrick.schoolSubject.icon} {progress.discoveredTrick.schoolSubject.label}
                  </p>
                </div>
              )}

              <div className="cert-stats">
                <div className="stat">
                  <span className="stat-value">{progress.totalXP}</span>
                  <span className="stat-label">XP verdient</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{progress.completedPhases.length}/4</span>
                  <span className="stat-label">Phasen</span>
                </div>
                <div className="stat">
                  <span className="stat-value">d={EFFECT_SIZE}</span>
                  <span className="stat-label">Effektstärke</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="cert-footer">
              <p>{CERTIFICATE_DATA.effectNote}</p>
              <p className="cert-date">
                {new Date().toLocaleDateString('de-DE', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="certificate-actions">
        <button className="back-btn" onClick={onBack}>
          ← Zurück zur Übersicht
        </button>
        <motion.button
          className="complete-btn"
          onClick={onComplete}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Challenge abschließen! 🎉
        </motion.button>
      </div>
    </div>
  );
}

// ============================================
// KONFETTI EFFEKT
// ============================================

function ConfettiEffect() {
  const colors = ['#f093fb', '#f5576c', '#4facfe', '#43e97b', '#fa709a', '#fee140'];
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

export default TransferChallenge;
