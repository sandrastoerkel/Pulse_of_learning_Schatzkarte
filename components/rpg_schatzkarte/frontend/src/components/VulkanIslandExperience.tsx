// ============================================
// Was dich antreibt Island Experience
// Schöne Animationen wie die anderen Inseln
// ============================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AgeGroup } from '../types';
import { VulkanIcon } from './icons';
import '../styles/vulkan-island.css';

// ============================================
// TYPES
// ============================================

type QuestKey = 'video' | 'scroll' | 'quiz' | 'challenge';

interface VulkanProgress {
  completedQuests: QuestKey[];
  totalXP: number;
}

interface VulkanIslandProps {
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
    color: "#ff7043",
    description: "Schau dir das Lernvideo an!",
    xp: 25,
  },
  scroll: {
    name: "Schriftrolle studieren",
    icon: "📖",
    color: "#f4511e",
    description: "Lerne über Motivation!",
    xp: 20,
  },
  quiz: {
    name: "Wissen testen",
    icon: "⚔️",
    color: "#e64a19",
    description: "Teste dein Wissen!",
    xp: 50,
  },
  challenge: {
    name: "Motivations-Feuer",
    icon: "🔥",
    color: "#bf360c",
    description: "Entfache dein inneres Feuer!",
    xp: 40,
  },
};

// ============================================
// HAUPT-KOMPONENTE
// ============================================

export function VulkanIslandExperience({
  ageGroup,
  onClose,
  onQuestComplete,
}: VulkanIslandProps) {
  const [currentView, setCurrentView] = useState<'overview' | QuestKey>('overview');
  const [progress, setProgress] = useState<VulkanProgress>({
    completedQuests: [],
    totalXP: 0,
  });
  const [showXPReward, setShowXPReward] = useState<number | null>(null);

  const allQuestsComplete = progress.completedQuests.length === 4;

  const completeQuest = (quest: QuestKey, xp: number) => {
    if (!progress.completedQuests.includes(quest)) {
      setProgress(prev => ({
        completedQuests: [...prev.completedQuests, quest],
        totalXP: prev.totalXP + xp,
      }));
      setShowXPReward(xp);
      setTimeout(() => setShowXPReward(null), 2500);
      onQuestComplete(quest, xp, quest === 'quiz' ? 15 : 5);
    }
    setCurrentView('overview');
  };

  return (
    <div className="vulkan-island">
      {/* Header */}
      <div className="island-header">
        <button className="back-btn" onClick={onClose}>← Zurück</button>
        <h1 className="island-title">
          <motion.div
            className="title-icon"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <VulkanIcon size={40} animated={true} />
          </motion.div>
          Was dich antreibt
        </h1>
        <div className="xp-badge">
          <motion.span className="xp-icon" animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>⭐</motion.span>
          <span className="xp-amount">{progress.totalXP} XP</span>
        </div>
      </div>

      <motion.div className="island-subtitle-bar" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <span className="subtitle-text">(Intrinsische Motivation - Das innere Feuer)</span>
      </motion.div>

      <div className="progress-container">
        <div className="progress-bar">
          <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${(progress.completedQuests.length / 4) * 100}%` }} transition={{ duration: 0.5 }} />
        </div>
        <span className="progress-text">{progress.completedQuests.length}/4 Quests abgeschlossen</span>
      </div>

      <AnimatePresence>
        {showXPReward && (
          <motion.div className="xp-reward-popup" initial={{ scale: 0, y: 50, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0, y: -50, opacity: 0 }}>
            <motion.span className="xp-reward-amount" animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: 2, duration: 0.3 }}>+{showXPReward} XP!</motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {currentView === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className="quest-overview">
            <motion.div className="coming-soon-banner" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
              <motion.span className="coming-soon-icon" animate={{ y: [0, -5, 0], scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>🌋</motion.span>
              <h3>Inhalte in Arbeit</h3>
              <p>Diese Station wird bald mit spannenden Inhalten gefüllt!</p>
            </motion.div>
            <div className="quests-grid">
              {(Object.keys(QUEST_INFO) as QuestKey[]).map((questKey, index) => (
                <QuestCard key={questKey} questKey={questKey} info={QUEST_INFO[questKey]} isCompleted={progress.completedQuests.includes(questKey)} onClick={() => setCurrentView(questKey)} delay={index * 0.1} disabled={true} />
              ))}
            </div>
            {allQuestsComplete && (
              <motion.div className="all-complete-banner" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <span className="banner-text">🎊 Alle Quests abgeschlossen!</span>
              </motion.div>
            )}
          </motion.div>
        )}
        {currentView !== 'overview' && (
          <motion.div key={currentView} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
            <PlaceholderPhase questKey={currentView} info={QUEST_INFO[currentView]} onBack={() => setCurrentView('overview')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface QuestCardProps {
  questKey: QuestKey;
  info: typeof QUEST_INFO[QuestKey];
  isCompleted: boolean;
  onClick: () => void;
  delay: number;
  disabled?: boolean;
}

function QuestCard({ questKey, info, isCompleted, onClick, delay, disabled }: QuestCardProps) {
  return (
    <motion.button
      className={`quest-card ${isCompleted ? 'completed' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={disabled ? undefined : onClick}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", bounce: 0.4 }}
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      style={{ '--quest-color': info.color } as React.CSSProperties}
    >
      <div className="card-glow" />
      <motion.span className="quest-icon">{info.icon}</motion.span>
      <span className="quest-name">{info.name}</span>
      <span className="quest-description">{info.description}</span>
      {isCompleted && <motion.div className="completed-badge" initial={{ scale: 0 }} animate={{ scale: 1 }}>✓</motion.div>}
      {disabled && <div className="disabled-overlay"><span>🔜</span></div>}
      <div className="xp-preview"><span>+{info.xp} XP</span></div>
    </motion.button>
  );
}

interface PlaceholderPhaseProps {
  questKey: QuestKey;
  info: typeof QUEST_INFO[QuestKey];
  onBack: () => void;
}

function PlaceholderPhase({ questKey, info, onBack }: PlaceholderPhaseProps) {
  return (
    <div className="phase-container placeholder-phase">
      <div className="phase-header" style={{ background: info.color }}>
        <button className="phase-back-btn" onClick={onBack}>← Zurück</button>
        <motion.span className="phase-header-icon" animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>{info.icon}</motion.span>
        <h2 className="phase-header-title">{info.name}</h2>
      </div>
      <motion.div className="phase-content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="placeholder-message">
          <motion.span className="placeholder-icon" animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }}>🚧</motion.span>
          <h3>Inhalt in Arbeit</h3>
          <p>Dieser Bereich wird bald mit spannenden Inhalten gefüllt!</p>
        </div>
        <motion.button className="back-btn-large" onClick={onBack} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>← Zurück zur Übersicht</motion.button>
      </motion.div>
    </div>
  );
}

export default VulkanIslandExperience;
