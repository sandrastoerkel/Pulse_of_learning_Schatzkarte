// Länger dranbleiben können Island Experience
// Refactored: Streamlit-Props → useAuth + useNavigate + useCompleteIslandAction

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useCompleteIslandAction } from '@/hooks';
import { AusdauerGipfelIcon } from '@/components/icons';
import '@/styles/ausdauer-gipfel-island.css';

type QuestKey = 'video' | 'scroll' | 'quiz' | 'challenge';

interface AusdauerGipfelProgress {
  completedQuests: QuestKey[];
  totalXP: number;
}

const ISLAND_ID = 'ausdauer_gipfel';

const QUEST_TO_ACTION: Record<QuestKey, 'video_watched' | 'explanation_read' | 'quiz_passed' | 'challenge_completed'> = {
  video: 'video_watched',
  scroll: 'explanation_read',
  quiz: 'quiz_passed',
  challenge: 'challenge_completed',
};

const QUEST_INFO: Record<QuestKey, { name: string; icon: string; color: string; description: string; xp: number }> = {
  video: { name: 'Weisheit erlangen', icon: '📜', color: '#ffcc80', description: 'Schau dir das Lernvideo an!', xp: 25 },
  scroll: { name: 'Schriftrolle studieren', icon: '📖', color: '#ffb74d', description: 'Lerne über Durchhalten!', xp: 20 },
  quiz: { name: 'Wissen testen', icon: '⚔️', color: '#ffa726', description: 'Teste dein Wissen!', xp: 50 },
  challenge: { name: 'Gipfel-Challenge', icon: '🧗', color: '#ff9800', description: 'Zeige deine Ausdauer!', xp: 40 },
};

export function AusdauerGipfelIslandExperience() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const _ageGroup = profile?.age_group ?? 'grundschule';
  const completeAction = useCompleteIslandAction();

  const [currentView, setCurrentView] = useState<'overview' | QuestKey>('overview');
  const [progress, setProgress] = useState<AusdauerGipfelProgress>({ completedQuests: [], totalXP: 0 });
  const [showXPReward, setShowXPReward] = useState<number | null>(null);

  const completeQuest = (quest: QuestKey, xp: number) => {
    if (!progress.completedQuests.includes(quest)) {
      setProgress(prev => ({ completedQuests: [...prev.completedQuests, quest], totalXP: prev.totalXP + xp }));
      setShowXPReward(xp);
      setTimeout(() => setShowXPReward(null), 2500);
      completeAction.mutate({ islandId: ISLAND_ID, action: QUEST_TO_ACTION[quest] });
    }
    setCurrentView('overview');
  };

  return (
    <div className="ausdauer-gipfel-island">
      <div className="island-header">
        <button className="back-btn" onClick={() => navigate('/karte')}>← Zurück</button>
        <h1 className="island-title">
          <motion.div className="title-icon" animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 3 }}><AusdauerGipfelIcon size={40} animated /></motion.div>
          Länger dranbleiben können
        </h1>
        <div className="xp-badge">
          <motion.span className="xp-icon" animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>⭐</motion.span>
          <span className="xp-amount">{progress.totalXP} XP</span>
        </div>
      </div>

      <motion.div className="island-subtitle-bar" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <span className="subtitle-text">(Durchhaltevermögen &amp; Ausdauer)</span>
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
            <motion.div className="coming-soon-banner" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <motion.span className="coming-soon-icon" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 3 }}>🧗</motion.span>
              <h3>Inhalte in Arbeit</h3>
              <p>Diese Station wird bald mit spannenden Inhalten gefüllt!</p>
            </motion.div>
            <div className="quests-grid">
              {(Object.keys(QUEST_INFO) as QuestKey[]).map((questKey, index) => (
                <QuestCard key={questKey} info={QUEST_INFO[questKey]} isCompleted={progress.completedQuests.includes(questKey)} onClick={() => setCurrentView(questKey)} delay={index * 0.1} disabled />
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

function QuestCard({ info, isCompleted, onClick, delay, disabled }: { info: (typeof QUEST_INFO)[QuestKey]; isCompleted: boolean; onClick: () => void; delay: number; disabled?: boolean }) {
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

function PlaceholderPhase({ info, onBack }: { info: (typeof QUEST_INFO)[QuestKey]; onBack: () => void }) {
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
          <p>Dieser Bereich wird bald mit spannenden Inhalten gefüllt!</p>
        </div>
        <button className="back-btn-large" onClick={onBack}>← Zurück zur Übersicht</button>
      </div>
    </div>
  );
}

export default AusdauerGipfelIslandExperience;
