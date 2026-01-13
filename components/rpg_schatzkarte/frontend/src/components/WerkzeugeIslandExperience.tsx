// ============================================
// Werkzeuge Island Experience - Vollständige Insel
// Schöne Animationen wie TransferChallenge
// Für alle Altersstufen
// ============================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AgeGroup, ExtendedQuiz } from '../types';
import { WERKZEUGE_CONTENT, ContentSection, IslandContent } from '../content/werkzeugeContent';
import { WERKZEUGE_QUIZ_QUESTIONS } from '../content/werkzeugeQuizContent';
import { BattleQuiz } from './BattleQuiz';
import { PowertechnikenChallenge } from './PowertechnikenChallenge';
import '../styles/werkzeuge-island.css';

// ============================================
// TYPES
// ============================================

type QuestKey = 'video' | 'scroll' | 'quiz' | 'challenge';

interface WerkzeugeProgress {
  completedQuests: QuestKey[];
  totalXP: number;
}

interface WerkzeugeIslandProps {
  ageGroup: AgeGroup;
  onClose: () => void;
  onQuestComplete: (questType: string, xp: number, gold?: number) => void;
  startWithChallenge?: boolean; // Direkt zur Challenge-Phase springen (für Lerntechniken-Widget)
}

// ============================================
// QUEST INFO
// ============================================

const QUEST_INFO: Record<QuestKey, {
  name: string;
  icon: string;
  color: string;
  description: string;
  xp: number;
}> = {
  video: {
    name: "Weisheit erlangen",
    icon: "📜",
    color: "#9b59b6",
    description: "Schau dir das Lernvideo an!",
    xp: 25,
  },
  scroll: {
    name: "Schriftrolle studieren",
    icon: "📖",
    color: "#3498db",
    description: "Lerne die 7 Power-Techniken!",
    xp: 20,
  },
  quiz: {
    name: "Wissen testen",
    icon: "⚔️",
    color: "#e74c3c",
    description: "Teste dein Wissen im Power-Quiz!",
    xp: 50,
  },
  challenge: {
    name: "7 Powertechniken",
    icon: "🛠️",
    color: "#4caf50",
    description: "Entdecke alle 7 Lerntechniken!",
    xp: 40,
  },
};

// ============================================
// HAUPT-KOMPONENTE
// ============================================

export function WerkzeugeIslandExperience({
  ageGroup,
  onClose,
  onQuestComplete,
  startWithChallenge = false,
}: WerkzeugeIslandProps) {
  // Wenn startWithChallenge true ist, direkt zur Challenge-Phase
  const [currentView, setCurrentView] = useState<'overview' | QuestKey>(
    startWithChallenge ? 'challenge' : 'overview'
  );
  const [progress, setProgress] = useState<WerkzeugeProgress>({
    completedQuests: [],
    totalXP: 0,
  });
  const [showXPReward, setShowXPReward] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const content = WERKZEUGE_CONTENT[ageGroup] || WERKZEUGE_CONTENT.unterstufe;
  const allQuestsComplete = progress.completedQuests.length === 4;

  // Quest abschließen
  const completeQuest = (quest: QuestKey, xp: number) => {
    if (!progress.completedQuests.includes(quest)) {
      setProgress(prev => ({
        completedQuests: [...prev.completedQuests, quest],
        totalXP: prev.totalXP + xp,
      }));

      setShowXPReward(xp);
      setTimeout(() => setShowXPReward(null), 2500);

      onQuestComplete(quest, xp, quest === 'quiz' ? 15 : 5);

      // Alle fertig? Konfetti!
      if (progress.completedQuests.length === 3) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    }
    setCurrentView('overview');
  };

  return (
    <div className="werkzeuge-island">
      {/* Header */}
      <div className="island-header">
        <button className="back-btn" onClick={onClose}>
          ← Zurück
        </button>
        <h1 className="island-title">
          <motion.span
            className="title-icon"
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            🛠️
          </motion.span>
          Insel der 7 Werkzeuge
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

      {/* Subtitle */}
      <motion.div
        className="island-subtitle-bar"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="subtitle-text">(Effektstärke - Lerne clever!)</span>
        <span className="effect-badge">d=0.50-0.74</span>
      </motion.div>

      {/* Fortschrittsbalken */}
      <div className="progress-container">
        <div className="progress-bar">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${(progress.completedQuests.length / 4) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <span className="progress-text">
          {progress.completedQuests.length}/4 Quests abgeschlossen
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
        {currentView === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="quest-overview"
          >
            <p className="overview-intro">
              Entdecke die 7 wissenschaftlich bewiesenen Power-Techniken!
            </p>

            <div className="quests-grid">
              {(Object.keys(QUEST_INFO) as QuestKey[]).map((questKey, index) => (
                <QuestCard
                  key={questKey}
                  questKey={questKey}
                  info={QUEST_INFO[questKey]}
                  isCompleted={progress.completedQuests.includes(questKey)}
                  onClick={() => setCurrentView(questKey)}
                  delay={index * 0.1}
                />
              ))}
            </div>

            {/* Alle fertig Banner */}
            {allQuestsComplete && (
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
                  🎊
                </motion.span>
                <span className="banner-text">
                  SUPER! Du bist ein Lern-Profi!
                </span>
              </motion.div>
            )}
          </motion.div>
        )}

        {currentView === 'video' && (
          <motion.div
            key="video"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <VideoPhase
              content={content}
              onComplete={() => completeQuest('video', QUEST_INFO.video.xp)}
              onBack={() => setCurrentView('overview')}
            />
          </motion.div>
        )}

        {currentView === 'scroll' && (
          <motion.div
            key="scroll"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <ScrollPhase
              content={content}
              ageGroup={ageGroup}
              onComplete={() => completeQuest('scroll', QUEST_INFO.scroll.xp)}
              onBack={() => setCurrentView('overview')}
            />
          </motion.div>
        )}

        {currentView === 'quiz' && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <QuizPhase
              ageGroup={ageGroup}
              onComplete={(victory) => {
                if (victory) {
                  completeQuest('quiz', QUEST_INFO.quiz.xp);
                } else {
                  setCurrentView('overview');
                }
              }}
              onBack={() => setCurrentView('overview')}
            />
          </motion.div>
        )}

        {currentView === 'challenge' && (
          <motion.div
            key="challenge"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <ChallengePhase
              onComplete={() => completeQuest('challenge', QUEST_INFO.challenge.xp)}
              onBack={() => setCurrentView('overview')}
              startDirectly={startWithChallenge}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// QUEST CARD
// ============================================

interface QuestCardProps {
  questKey: QuestKey;
  info: typeof QUEST_INFO[QuestKey];
  isCompleted: boolean;
  onClick: () => void;
  delay: number;
}

function QuestCard({ questKey, info, isCompleted, onClick, delay }: QuestCardProps) {
  return (
    <motion.button
      className={`quest-card ${isCompleted ? 'completed' : ''}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", bounce: 0.4 }}
      whileHover={{ scale: 1.05, rotate: [-1, 1, -1, 0] }}
      whileTap={{ scale: 0.95 }}
      style={{ '--quest-color': info.color } as React.CSSProperties}
    >
      <div className="card-glow" />

      <motion.span
        className="quest-icon"
        animate={isCompleted ? { rotate: [0, 360] } : {}}
        transition={{ duration: 0.5 }}
      >
        {info.icon}
      </motion.span>
      <span className="quest-name">{info.name}</span>
      <span className="quest-description">{info.description}</span>

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
// VIDEO PHASE
// ============================================

interface VideoPhaseProps {
  content: IslandContent;
  onComplete: () => void;
  onBack: () => void;
}

function VideoPhase({ content, onComplete, onBack }: VideoPhaseProps) {
  return (
    <div className="phase-container video-phase">
      <PhaseHeader
        icon="📜"
        title="Weisheit erlangen"
        color={QUEST_INFO.video.color}
        onBack={onBack}
      />

      <motion.div
        className="phase-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="video-container">
          {content.video.placeholder ? (
            <motion.div
              className="video-placeholder"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <motion.div
                className="play-icon-wrapper"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <span className="play-icon">▶️</span>
              </motion.div>
              <h3>Video kommt bald!</h3>
              <p>Das Erklärvideo zu den 7 Power-Techniken ist in Arbeit.</p>
            </motion.div>
          ) : (
            <div className="video-embed">
              <iframe
                src={content.video.url
                  .replace('watch?v=', 'embed/')
                  .replace('youtu.be/', 'youtube.com/embed/')}
                title="Lernvideo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </div>

        <motion.button
          className="complete-btn"
          onClick={onComplete}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {content.video.placeholder ? 'Verstanden! ✓' : 'Video abgeschlossen ✓'}
        </motion.button>
      </motion.div>
    </div>
  );
}

// ============================================
// SCROLL PHASE
// ============================================

interface ScrollPhaseProps {
  content: IslandContent;
  ageGroup: AgeGroup;
  onComplete: () => void;
  onBack: () => void;
}

function ScrollPhase({ content, ageGroup, onComplete, onBack }: ScrollPhaseProps) {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(() => {
    const initial = new Set<number>();
    content.explanation.sections.forEach((s, i) => {
      if (s.type === 'expander' && s.expanded) initial.add(i);
    });
    return initial;
  });

  const toggleSection = (idx: number) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div className="phase-container scroll-phase">
      <PhaseHeader
        icon="📖"
        title="Schriftrolle studieren"
        color={QUEST_INFO.scroll.color}
        onBack={onBack}
      />

      <motion.div
        className="phase-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="scroll-container">
          {/* Titel */}
          <motion.h3
            className="scroll-title"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {content.title}
          </motion.h3>

          {/* Intro */}
          <motion.div
            className="scroll-intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            dangerouslySetInnerHTML={{ __html: markdownToHtml(content.explanation.intro) }}
          />

          {/* Sections */}
          <div className="scroll-sections">
            {content.explanation.sections.map((section, idx) => (
              <ScrollSection
                key={idx}
                section={section}
                index={idx}
                isExpanded={expandedSections.has(idx)}
                onToggle={() => toggleSection(idx)}
              />
            ))}
          </div>

          {/* Summary */}
          {content.summary && (
            <motion.div
              className="scroll-summary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              dangerouslySetInnerHTML={{ __html: markdownToHtml(content.summary) }}
            />
          )}
        </div>

        <motion.button
          className="complete-btn"
          onClick={onComplete}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Gelesen ✓
        </motion.button>
      </motion.div>
    </div>
  );
}

// ============================================
// SCROLL SECTION
// ============================================

interface ScrollSectionProps {
  section: ContentSection;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}

function ScrollSection({ section, index, isExpanded, onToggle }: ScrollSectionProps) {
  const isExpander = section.type === 'expander';
  const sectionType = section.type || 'default';

  const getTypeColor = () => {
    switch (sectionType) {
      case 'info': return '#3498db';
      case 'success': return '#27ae60';
      case 'warning': return '#f39c12';
      default: return '#4caf50';
    }
  };

  const getTypeIcon = () => {
    switch (sectionType) {
      case 'info': return '💡';
      case 'success': return '✨';
      case 'warning': return '⚠️';
      case 'expander': return isExpanded ? '📖' : '📕';
      default: return '🛠️';
    }
  };

  return (
    <motion.div
      className={`scroll-section section-${sectionType} ${isExpanded ? 'expanded' : ''}`}
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      style={{ '--section-color': getTypeColor() } as React.CSSProperties}
    >
      <motion.div
        className={`section-header ${isExpander ? 'clickable' : ''}`}
        onClick={isExpander ? onToggle : undefined}
        whileHover={isExpander ? { x: 5 } : {}}
      >
        <span className="section-icon">{getTypeIcon()}</span>
        <h4>{section.title}</h4>
        {isExpander && (
          <motion.span
            className="expander-arrow"
            animate={{ rotate: isExpanded ? 180 : 0 }}
          >
            ▼
          </motion.span>
        )}
      </motion.div>

      <AnimatePresence>
        {(!isExpander || isExpanded) && (
          <motion.div
            className="section-content"
            initial={isExpander ? { height: 0, opacity: 0 } : { opacity: 1 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={isExpander ? { height: 0, opacity: 0 } : {}}
            transition={{ duration: 0.3 }}
            dangerouslySetInnerHTML={{ __html: markdownToHtml(section.content) }}
          />
        )}
      </AnimatePresence>

      {/* Effektstärke Badge */}
      {section.effectSize && (
        <motion.div
          className="effect-size-badge"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="effect-value">d = {section.effectSize.value}</span>
          <span className="effect-stars">{'⭐'.repeat(section.effectSize.stars)}</span>
        </motion.div>
      )}

      {/* Fun Fact */}
      {section.funFact && (
        <motion.div
          className="fun-fact-box"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <span className="fun-fact-emoji">{section.funFact.emoji}</span>
          <span className="fun-fact-text">{section.funFact.text}</span>
        </motion.div>
      )}

      {/* Pro Tip */}
      {section.proTip && (
        <motion.div
          className="pro-tip-box"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <span className="pro-tip-icon">💡</span>
          <span className="pro-tip-text">{section.proTip}</span>
        </motion.div>
      )}
    </motion.div>
  );
}

// ============================================
// QUIZ PHASE
// ============================================

interface QuizPhaseProps {
  ageGroup: AgeGroup;
  onComplete: (victory: boolean) => void;
  onBack: () => void;
}

function QuizPhase({ ageGroup, onComplete, onBack }: QuizPhaseProps) {
  const [quizStarted, setQuizStarted] = useState(false);

  // TODO: Unterschiedliche Quiz für verschiedene Altersstufen
  const getQuizQuestions = () => {
    return WERKZEUGE_QUIZ_QUESTIONS;
  };

  if (quizStarted) {
    return (
      <BattleQuiz
        quiz={{ questions: getQuizQuestions() } as ExtendedQuiz}
        islandName="Insel der 7 Werkzeuge"
        enableLives={true}
        maxLives={3}
        onComplete={(victory, score, streak) => {
          onComplete(victory);
        }}
        onClose={onBack}
      />
    );
  }

  return (
    <div className="phase-container quiz-phase">
      <PhaseHeader
        icon="⚔️"
        title="Wissen testen"
        color={QUEST_INFO.quiz.color}
        onBack={onBack}
      />

      <motion.div
        className="phase-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="quiz-intro">
          <motion.div
            className="quiz-monster"
            animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            🧠
          </motion.div>

          <h3>Power-Techniken Quiz</h3>
          <p>Teste dein Wissen über die 7 cleveren Lerntechniken!</p>

          <div className="quiz-info">
            <div className="info-item">
              <span className="info-icon">❤️</span>
              <span>3 Leben</span>
            </div>
            <div className="info-item">
              <span className="info-icon">⭐</span>
              <span>+50 XP bei Sieg</span>
            </div>
            <div className="info-item">
              <span className="info-icon">🔥</span>
              <span>Streak-Bonus!</span>
            </div>
          </div>

          <motion.button
            className="start-quiz-btn"
            onClick={() => setQuizStarted(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🎮 Quiz starten!
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// ============================================
// CHALLENGE PHASE - 7 Powertechniken
// ============================================

interface ChallengePhaseProps {
  onComplete: () => void;
  onBack: () => void;
  startDirectly?: boolean; // Direkt Challenge starten ohne Teaser
}

function ChallengePhase({ onComplete, onBack, startDirectly = false }: ChallengePhaseProps) {
  // Wenn startDirectly true, direkt zur Challenge
  const [challengeStarted, setChallengeStarted] = useState(startDirectly);

  if (challengeStarted) {
    return (
      <PowertechnikenChallenge
        onComplete={(xp) => {
          onComplete();
        }}
        onClose={onBack}
      />
    );
  }

  return (
    <div className="phase-container challenge-phase">
      <PhaseHeader
        icon="🛠️"
        title="7 Powertechniken"
        color={QUEST_INFO.challenge.color}
        onBack={onBack}
      />

      <motion.div
        className="phase-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="challenge-intro">
          <motion.div
            className="challenge-icon-large"
            animate={{ y: [0, -5, 0], rotate: [0, -3, 3, 0] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
          >
            🛠️
          </motion.div>

          <h3>Die 7 Powertechniken Challenge!</h3>
          <p>
            Entdecke 7 wissenschaftlich bewiesene Lerntechniken und probiere sie direkt aus!
          </p>

          <div className="techniques-preview">
            <motion.div
              className="technique-item"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <span>🍅</span> Pomodoro - Timer
            </motion.div>
            <motion.div
              className="technique-item"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <span>🔄</span> Active Recall - Quiz
            </motion.div>
            <motion.div
              className="technique-item"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span>👶</span> Feynman - Erklären
            </motion.div>
            <motion.div
              className="technique-item"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <span>📅</span> Spaced Repetition
            </motion.div>
            <motion.div
              className="technique-item"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span>👥</span> Lernen durch Lehren
            </motion.div>
            <motion.div
              className="technique-item"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
            >
              <span>🏰</span> Loci - Gedächtnispalast
            </motion.div>
            <motion.div
              className="technique-item"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <span>🔀</span> Interleaving - Mixen
            </motion.div>
          </div>

          <div className="challenge-rewards">
            <span className="reward-item">⭐ +15 XP pro Technik</span>
            <span className="reward-item">🏆 Zertifikat am Ende!</span>
          </div>

          <motion.button
            className="start-challenge-btn"
            onClick={() => setChallengeStarted(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🚀 Challenge starten!
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// ============================================
// HELPER: Markdown to HTML
// ============================================

function markdownToHtml(text: string): string {
  // HTML-Blöcke temporär extrahieren
  const htmlBlocks: string[] = [];
  let processedText = text.replace(/<div[\s\S]*?<\/div>/g, (match) => {
    htmlBlocks.push(match);
    return `__HTML_BLOCK_${htmlBlocks.length - 1}__`;
  });

  let html = processedText
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^>\s*(.*)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^- (.*)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/\n/g, '<br/>');

  // Tabellen parsen
  const tableRegex = /\|(.+)\|[\r\n]*<br\/>*\|[-:\s|]+\|[\r\n]*<br\/>*((?:\|.+\|[\r\n]*<br\/>*)+)/g;
  html = html.replace(tableRegex, (match, headerRow, bodyRows) => {
    const headers = headerRow.split('|').map((h: string) => h.trim()).filter((h: string) => h);
    const rows = bodyRows.trim().split('<br/>').filter((r: string) => r.includes('|'));

    let table = '<table><thead><tr>';
    headers.forEach((h: string) => { table += `<th>${h}</th>`; });
    table += '</tr></thead><tbody>';

    rows.forEach((row: string) => {
      const cells = row.split('|').map((c: string) => c.trim()).filter((c: string) => c);
      if (cells.length > 0) {
        table += '<tr>';
        cells.forEach((c: string) => { table += `<td>${c}</td>`; });
        table += '</tr>';
      }
    });

    table += '</tbody></table>';
    return table;
  });

  // HTML-Blöcke wieder einfügen
  htmlBlocks.forEach((block, idx) => {
    html = html.replace(`__HTML_BLOCK_${idx}__`, block);
  });

  return html;
}

// ============================================
// KONFETTI EFFEKT
// ============================================

function ConfettiEffect() {
  const colors = ['#81c784', '#4caf50', '#66bb6a', '#a5d6a7', '#c8e6c9', '#2e7d32'];
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

export default WerkzeugeIslandExperience;
