// ============================================
// Berg der Meisterschaft Island Experience
// Das Finale der Lernreise!
// ============================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AgeGroup } from '../types';
import { MeisterBergIcon } from './icons';
import '../styles/meister-berg-island.css';

type QuestKey = 'video' | 'scroll' | 'quiz' | 'challenge';

interface MeisterBergProgress {
  completedQuests: QuestKey[];
  totalXP: number;
}

interface MeisterBergIslandProps {
  ageGroup: AgeGroup;
  onClose: () => void;
  onQuestComplete: (questType: string, xp: number, gold?: number) => void;
}

const QUEST_INFO: Record<QuestKey, { name: string; icon: string; color: string; description: string; xp: number; }> = {
  video: { name: "Finale Weisheit", icon: "📜", color: "#ffd54f", description: "Das letzte Lernvideo!", xp: 50 },
  scroll: { name: "Meister-Schriftrolle", icon: "📖", color: "#ffca28", description: "Die finale Zusammenfassung!", xp: 40 },
  quiz: { name: "Meister-Prüfung", icon: "⚔️", color: "#ffc107", description: "Die ultimative Prüfung!", xp: 100 },
  challenge: { name: "Meister-Krone", icon: "👑", color: "#ffb300", description: "Verdiene die Meister-Krone!", xp: 100 },
};

export function MeisterBergIslandExperience({ ageGroup, onClose, onQuestComplete }: MeisterBergIslandProps) {
  const [currentView, setCurrentView] = useState<'overview' | QuestKey>('overview');
  const [progress, setProgress] = useState<MeisterBergProgress>({ completedQuests: [], totalXP: 0 });
  const [showXPReward, setShowXPReward] = useState<number | null>(null);

  const completeQuest = (quest: QuestKey, xp: number) => {
    if (!progress.completedQuests.includes(quest)) {
      setProgress(prev => ({ completedQuests: [...prev.completedQuests, quest], totalXP: prev.totalXP + xp }));
      setShowXPReward(xp);
      setTimeout(() => setShowXPReward(null), 2500);
      onQuestComplete(quest, xp, quest === 'quiz' ? 50 : 25);
    }
    setCurrentView('overview');
  };

  return (
    <div className="meister-berg-island">
      <div className="island-header">
        <button className="back-btn" onClick={onClose}>← Zurück</button>
        <h1 className="island-title">
          <motion.div className="title-icon" animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2.5 }}><MeisterBergIcon size={40} animated={true} /></motion.div>
          Berg der Meisterschaft
        </h1>
        <div className="xp-badge">
          <motion.span className="xp-icon" animate={{ scale: [1, 1.3, 1], rotate: [0, 360] }} transition={{ repeat: Infinity, duration: 3 }}>⭐</motion.span>
          <span className="xp-amount">{progress.totalXP} XP</span>
        </div>
      </div>

      <motion.div className="island-subtitle-bar" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <span className="subtitle-text">(Das Finale - Werde zum Lern-Meister!)</span>
        <motion.span className="finale-badge" animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>🏆 FINALE</motion.span>
      </motion.div>

      <div className="progress-container">
        <div className="progress-bar">
          <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${(progress.completedQuests.length / 4) * 100}%` }} transition={{ duration: 0.5 }} />
        </div>
        <span className="progress-text">{progress.completedQuests.length}/4 Quests abgeschlossen</span>
      </div>

      <AnimatePresence>
        {showXPReward && (
          <motion.div className="xp-reward-popup" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}>
            <span className="xp-reward-amount">+{showXPReward} XP!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {currentView === 'overview' ? (
          <motion.div key="overview" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className="quest-overview">
            <motion.div className="coming-soon-banner finale-banner" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <motion.span className="coming-soon-icon" animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 3 }}>👑</motion.span>
              <h3>Das große Finale!</h3>
              <p>Hier wartet die ultimative Prüfung auf dich. Inhalte kommen bald!</p>
            </motion.div>
            <div className="quests-grid">
              {(Object.keys(QUEST_INFO) as QuestKey[]).map((questKey, index) => (
                <QuestCard key={questKey} questKey={questKey} info={QUEST_INFO[questKey]} isCompleted={progress.completedQuests.includes(questKey)} onClick={() => setCurrentView(questKey)} delay={index * 0.1} disabled={true} />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key={currentView} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
            <PlaceholderPhase info={QUEST_INFO[currentView]} onBack={() => setCurrentView('overview')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function QuestCard({ questKey, info, isCompleted, onClick, delay, disabled }: { questKey: QuestKey; info: typeof QUEST_INFO[QuestKey]; isCompleted: boolean; onClick: () => void; delay: number; disabled?: boolean }) {
  return (
    <motion.button className={`quest-card ${isCompleted ? 'completed' : ''} ${disabled ? 'disabled' : ''}`} onClick={disabled ? undefined : onClick} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} style={{ '--quest-color': info.color } as React.CSSProperties}>
      <div className="card-glow" />
      <span className="quest-icon">{info.icon}</span>
      <span className="quest-name">{info.name}</span>
      <span className="quest-description">{info.description}</span>
      {isCompleted && <div className="completed-badge">✓</div>}
      {disabled && <div className="disabled-overlay"><span>🔜</span></div>}
      <div className="xp-preview"><span>+{info.xp} XP</span></div>
    </motion.button>
  );
}

function PlaceholderPhase({ info, onBack }: { info: typeof QUEST_INFO[QuestKey]; onBack: () => void }) {
  return (
    <div className="phase-container placeholder-phase">
      <div className="phase-header" style={{ background: info.color }}>
        <button className="phase-back-btn" onClick={onBack}>← Zurück</button>
        <span className="phase-header-icon">{info.icon}</span>
        <h2 className="phase-header-title">{info.name}</h2>
      </div>
      <div className="phase-content">
        <div className="placeholder-message">
          <span className="placeholder-icon">🚧</span>
          <h3>Inhalt in Arbeit</h3>
          <p>Das große Finale wird bald verfügbar sein!</p>
        </div>
        <button className="back-btn-large" onClick={onBack}>← Zurück zur Übersicht</button>
      </div>
    </div>
  );
}

export default MeisterBergIslandExperience;
