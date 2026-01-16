// ============================================
// Brücken Island Experience - Vollständige Insel
// Schöne Animationen wie TransferChallenge
// Für alle Altersstufen
// ============================================

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AgeGroup, ExtendedQuiz } from '../types';
import { BRUECKEN_CONTENT, ContentSection, IslandContent } from '../content/brueckenContent';
import { BRUECKEN_QUIZ_QUESTIONS } from '../content/brueckenQuizContent';
import { BRUECKEN_QUIZ_QUESTIONS_UNTERSTUFE } from '../content/brueckenQuizContent_unterstufe';
import { BRUECKEN_QUIZ_QUESTIONS_MITTELSTUFE } from '../content/brueckenQuizContent_mittelstufe';
import { BattleQuiz } from './BattleQuiz';
import { TransferChallenge } from './TransferChallenge';
import '../styles/bruecken-island.css';

// ============================================
// TYPES
// ============================================

type QuestKey = 'video' | 'scroll' | 'quiz' | 'challenge';

interface BrueckenProgress {
  completedQuests: QuestKey[];
  totalXP: number;
}

interface BrueckenIslandProps {
  ageGroup: AgeGroup;
  onClose: () => void;
  onQuestComplete: (questType: string, xp: number, gold?: number) => void;
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
    description: "Lies die Erklärung zum Thema Transfer.",
    xp: 20,
  },
  quiz: {
    name: "Wissen testen",
    icon: "⚔️",
    color: "#e74c3c",
    description: "Teste dein Wissen im Quiz!",
    xp: 50,
  },
  challenge: {
    name: "Transfer-Challenge",
    icon: "🏆",
    color: "#f39c12",
    description: "Werde zum Transfer-Meister!",
    xp: 150,
  },
};

// ============================================
// HAUPT-KOMPONENTE
// ============================================

export function BrueckenIslandExperience({
  ageGroup,
  onClose,
  onQuestComplete,
}: BrueckenIslandProps) {
  const [currentView, setCurrentView] = useState<'overview' | QuestKey>('overview');
  const [progress, setProgress] = useState<BrueckenProgress>({
    completedQuests: [],
    totalXP: 0,
  });
  const [showXPReward, setShowXPReward] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const content = BRUECKEN_CONTENT[ageGroup] || BRUECKEN_CONTENT.unterstufe;
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
    <div className="bruecken-island">
      {/* Header */}
      <div className="island-header">
        <button className="back-btn" onClick={onClose}>
          ← Zurück
        </button>
        <h1 className="island-title">
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

      {/* Subtitle */}
      <motion.div
        className="island-subtitle-bar"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="subtitle-text">(Transfer - Das Geheimnis der Überflieger)</span>
        <span className="effect-badge">d=0.86</span>
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
              Entdecke das Transfer-Geheimnis und werde zum Überflieger!
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
                  SUPER! Alle Quests abgeschlossen!
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
            <TransferChallenge
              onComplete={(xp) => {
                completeQuest('challenge', xp);
              }}
              onClose={() => setCurrentView('overview')}
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
              <p>Das Erklärvideo zum Thema Transfer ist in Arbeit.</p>
              <p className="placeholder-hint">
                Lies in der Zwischenzeit die Schriftrolle!
              </p>
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
  onComplete: () => void;
  onBack: () => void;
}

function ScrollPhase({ content, onComplete, onBack }: ScrollPhaseProps) {
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
            >
              <span className="summary-icon">💡</span>
              <p>{content.summary}</p>
            </motion.div>
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
      default: return '#9b59b6';
    }
  };

  const getTypeIcon = () => {
    switch (sectionType) {
      case 'info': return '💡';
      case 'success': return '✨';
      case 'warning': return '⚠️';
      case 'expander': return isExpanded ? '📖' : '📕';
      default: return '📜';
    }
  };

  return (
    <motion.div
      className={`scroll-section section-${sectionType} ${isExpanded ? 'expanded' : ''}`}
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
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

  const getQuizQuestions = () => {
    switch (ageGroup) {
      case 'grundschule': return BRUECKEN_QUIZ_QUESTIONS;
      case 'unterstufe': return BRUECKEN_QUIZ_QUESTIONS_UNTERSTUFE;
      case 'mittelstufe': return BRUECKEN_QUIZ_QUESTIONS_MITTELSTUFE;
      default: return BRUECKEN_QUIZ_QUESTIONS_UNTERSTUFE;
    }
  };

  if (quizStarted) {
    return (
      <BattleQuiz
        quiz={{ questions: getQuizQuestions() } as ExtendedQuiz}
        islandName="Transferlernen"
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
            🌉
          </motion.div>

          <h3>Transfer-Quiz</h3>
          <p>Teste dein Wissen über das Transfer-Geheimnis!</p>

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
// HELPER: Markdown to HTML
// ============================================

function markdownToHtml(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^>\s*(.*)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^- (.*)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/\n/g, '<br/>');
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

export default BrueckenIslandExperience;
