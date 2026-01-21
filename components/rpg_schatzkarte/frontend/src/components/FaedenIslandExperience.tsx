// ============================================
// Fäden Island Experience - Grundstruktur
// Thema: Birkenbihl's Faden-Prinzip
// ============================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AgeGroup } from '../types';
import { FAEDEN_CONTENT, ContentSection, IslandContent } from '../content/faedenContent';
import { FaedenChallenge, FaedenProgress as ChallengeProgress, DEFAULT_FAEDEN_PROGRESS } from './FaedenChallenge';
import { FaedenIcon } from './icons';
import '../styles/faeden-island.css';

// ============================================
// TYPES
// ============================================

type QuestKey = 'video' | 'scroll' | 'challenge';

interface FaedenProgress {
  completedQuests: QuestKey[];
  totalXP: number;
}

interface FaedenIslandProps {
  ageGroup: AgeGroup;
  onClose: () => void;
  onQuestComplete: (questType: string, xp: number, gold?: number) => void;
  startWithChallenge?: boolean;
  previewMode?: boolean;
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
    color: "#8e44ad",
    description: "Lerne das Faden-Prinzip!",
    xp: 20,
  },
  challenge: {
    name: "Fäden-Challenge",
    icon: "🧵",
    color: "#7b1fa2",
    description: "Die interaktive Lernreise!",
    xp: 135, // Total XP from challenge
  },
};

// ============================================
// HAUPT-KOMPONENTE
// ============================================

export function FaedenIslandExperience({
  ageGroup,
  onClose,
  onQuestComplete,
  startWithChallenge = false,
  previewMode = false,
}: FaedenIslandProps) {
  const [currentView, setCurrentView] = useState<'overview' | QuestKey>(
    startWithChallenge && ageGroup === 'grundschule' ? 'challenge' : 'overview'
  );
  const [progress, setProgress] = useState<FaedenProgress>({
    completedQuests: [],
    totalXP: 0,
  });
  const [showXPReward, setShowXPReward] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [challengeProgress, setChallengeProgress] = useState<ChallengeProgress>(DEFAULT_FAEDEN_PROGRESS);

  const content = FAEDEN_CONTENT[ageGroup] || FAEDEN_CONTENT.unterstufe;
  const isGrundschule = ageGroup === 'grundschule';
  const isUnterstufe = ageGroup === 'unterstufe' || ageGroup === 'mittelstufe' || ageGroup === 'oberstufe';
  // Challenge ist für Grundschule und Unterstufe verfügbar
  const hasChallengeAccess = isGrundschule || isUnterstufe;
  const questKeys: QuestKey[] = hasChallengeAccess ? ['video', 'scroll', 'challenge'] : ['video', 'scroll'];
  const allQuestsComplete = progress.completedQuests.length === questKeys.length;

  // Quest abschließen
  const completeQuest = (quest: QuestKey, xp: number) => {
    if (!progress.completedQuests.includes(quest)) {
      setProgress(prev => ({
        completedQuests: [...prev.completedQuests, quest],
        totalXP: prev.totalXP + xp,
      }));

      setShowXPReward(xp);
      setTimeout(() => setShowXPReward(null), 2500);

      onQuestComplete(quest, xp, quest === 'challenge' ? 20 : 5);

      // Alle fertig? Konfetti!
      if (progress.completedQuests.length === questKeys.length - 1) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    }
    setCurrentView('overview');
  };

  // Challenge close handler
  const handleChallengeClose = () => {
    // Check if challenge was completed (all stations + all days)
    const baseStationsComplete = ['experiment', 'gedankenjagd', 'bleistift'].every(
      s => challengeProgress.completedStations.includes(s as any)
    );
    const allDaysComplete = Object.values(challengeProgress.missionDays).filter(d => d.completed).length === 5;

    if (baseStationsComplete && allDaysComplete && !progress.completedQuests.includes('challenge')) {
      completeQuest('challenge', challengeProgress.totalXP);
    } else {
      setCurrentView('overview');
    }
  };

  // If showing challenge, render it fullscreen
  if (currentView === 'challenge' && hasChallengeAccess) {
    return (
      <FaedenChallenge
        onClose={handleChallengeClose}
        savedProgress={challengeProgress}
        onSaveProgress={setChallengeProgress}
        previewMode={previewMode}
        ageGroup={ageGroup}
      />
    );
  }

  return (
    <div className="faeden-island">
      {/* Header */}
      <div className="island-header">
        <button className="back-btn" onClick={onClose}>
          ← Zurück
        </button>
        <h1 className="island-title">
          <motion.div
            className="title-icon"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            <FaedenIcon size={40} animated={true} />
          </motion.div>
          Station der Fäden
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
        <span className="subtitle-text">(Das Faden-Prinzip nach Birkenbihl)</span>
        <span className="effect-badge">Assoziatives Lernen</span>
      </motion.div>

      {/* Fortschrittsbalken */}
      <div className="progress-container">
        <div className="progress-bar">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${(progress.completedQuests.length / questKeys.length) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <span className="progress-text">
          {progress.completedQuests.length}/{questKeys.length} Quests abgeschlossen
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
              Entdecke das Geheimnis der Fäden - warum manche Sachen "hängenbleiben" und andere nicht!
            </p>

            <div className="quests-grid">
              {questKeys.map((questKey, index) => (
                <QuestCard
                  key={questKey}
                  questKey={questKey}
                  info={QUEST_INFO[questKey]}
                  isCompleted={progress.completedQuests.includes(questKey)}
                  onClick={() => setCurrentView(questKey)}
                  delay={index * 0.1}
                  isChallenge={questKey === 'challenge'}
                  challengeProgress={questKey === 'challenge' ? challengeProgress : undefined}
                />
              ))}
            </div>

            {/* Birkenbihl Quote */}
            <motion.div
              className="birkenbihl-quote"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <span className="quote-icon">💬</span>
              <blockquote>
                "Ob etwas leicht oder schwer ist, hat NUR damit zu tun, ob Sie einen Faden haben!"
              </blockquote>
              <cite>— Vera F. Birkenbihl</cite>
            </motion.div>

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
                  🕸️
                </motion.span>
                <span className="banner-text">
                  Dein Wissensnetz wächst!
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
  isChallenge?: boolean;
  challengeProgress?: ChallengeProgress;
}

function QuestCard({ questKey, info, isCompleted, onClick, delay, isChallenge, challengeProgress }: QuestCardProps) {
  const missionActive = isChallenge && challengeProgress?.missionStartDate;
  const completedDays = isChallenge && challengeProgress
    ? Object.values(challengeProgress.missionDays).filter(d => d.completed).length
    : 0;

  return (
    <motion.button
      className={`quest-card ${isCompleted ? 'completed' : ''} ${isChallenge ? 'challenge-card' : ''}`}
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

      {missionActive && !isCompleted && (
        <motion.div
          className="mission-progress-badge"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          {completedDays}/7
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
              <p>Das Erklärvideo zum Faden-Prinzip ist in Arbeit.</p>
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
      case 'info': return '#9b59b6';
      case 'success': return '#27ae60';
      case 'warning': return '#f39c12';
      default: return '#ba68c8';
    }
  };

  const getTypeIcon = () => {
    switch (sectionType) {
      case 'info': return '💡';
      case 'success': return '✨';
      case 'warning': return '⚠️';
      case 'expander': return isExpanded ? '📖' : '📕';
      default: return '🧵';
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
    </motion.div>
  );
}

// ============================================
// HELPER: Markdown to HTML
// ============================================

function markdownToHtml(text: string): string {
  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^>\s*(.*)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^- (.*)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/❌/g, '<span class="icon-bad">❌</span>')
    .replace(/✅/g, '<span class="icon-good">✅</span>')
    .replace(/\n/g, '<br/>');

  return html;
}

// ============================================
// KONFETTI EFFEKT
// ============================================

function ConfettiEffect() {
  const colors = ['#ba68c8', '#9b59b6', '#8e44ad', '#ce93d8', '#e1bee7', '#7b1fa2'];
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

export default FaedenIslandExperience;
