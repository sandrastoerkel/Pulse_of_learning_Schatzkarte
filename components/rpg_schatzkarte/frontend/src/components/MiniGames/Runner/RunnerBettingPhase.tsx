// ============================================
// BRICK BREAKER – BETTING PHASE
// XP-Einsatz Auswahl (ersetzt RunnerBettingPhase)
// ============================================

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AgeGroup,
  DIFFICULTY_CONFIGS,
  BET_OPTIONS,
} from './RunnerAssets';

interface RunnerBettingPhaseProps {
  playerXP: number;
  ageGroup: AgeGroup;
  onStartGame: (betAmount: number) => void;
  onClose: () => void;
}

const AGE_LABELS: Record<AgeGroup, string> = {
  grundschule: 'Grundschule',
  unterstufe:  'Unterstufe',
  mittelstufe: 'Mittelstufe',
};
const AGE_ICONS: Record<AgeGroup, string> = {
  grundschule: '🌱',
  unterstufe:  '🌿',
  mittelstufe: '🌳',
};

export const RunnerBettingPhase: React.FC<RunnerBettingPhaseProps> = ({
  playerXP,
  ageGroup,
  onStartGame,
  onClose,
}) => {
  const [selectedBet, setSelectedBet] = useState<number | null>(null);

  const cfg = DIFFICULTY_CONFIGS[ageGroup];

  const milestones = useMemo(() =>
    Object.entries(cfg.brickMultipliers)
      .map(([bricks, mult]) => ({ bricks: parseInt(bricks), mult }))
      .sort((a, b) => a.bricks - b.bricks),
    [cfg]
  );

  const availableBets = useMemo(() =>
    BET_OPTIONS.map(b => ({
      ...b,
      actual: b.isAllIn ? playerXP : b.amount,
      canAfford: b.isAllIn ? playerXP > 0 : playerXP >= b.amount,
    })),
    [playerXP]
  );

  const potWin = (bet: number, mult: number) => Math.floor(bet * mult);

  const handleStart = () => {
    if (selectedBet !== null && selectedBet > 0) onStartGame(selectedBet);
  };

  return (
    <div className="bb-betting">

      {/* Header */}
      <div className="bb-bet-header">
        <button className="bb-close-btn" onClick={onClose} aria-label="Schließen">✕</button>
        <div className="bb-bet-title-wrap">
          <span className="bb-bet-game-icon">🧱</span>
          <span className="bb-bet-game-name">Brick Breaker</span>
        </div>
        <div className="bb-difficulty-badge">
          <span>{AGE_ICONS[ageGroup]}</span>
          <span>{AGE_LABELS[ageGroup]}</span>
        </div>
      </div>

      {/* XP Display */}
      <motion.div
        className="bb-xp-display"
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.08 }}
      >
        <span className="bb-xp-label">Deine XP</span>
        <span className="bb-xp-value">⭐ {playerXP.toLocaleString()}</span>
      </motion.div>

      {/* Bet selection */}
      <div className="bb-section">
        <h3 className="bb-section-title">Wähle deinen Einsatz</h3>
        <p className="bb-section-hint">Je mehr Bricks du zerstörst, desto höher dein Gewinn!</p>
        <div className="bb-bet-grid">
          {availableBets.map((bet, i) => (
            <motion.button
              key={bet.label}
              className={[
                'bb-bet-btn',
                selectedBet === bet.actual ? 'selected' : '',
                !bet.canAfford ? 'disabled' : '',
              ].join(' ')}
              onClick={() => bet.canAfford && setSelectedBet(bet.actual)}
              disabled={!bet.canAfford}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 + i * 0.05 }}
              whileHover={bet.canAfford ? { scale: 1.06 } : undefined}
              whileTap={bet.canAfford ? { scale: 0.95 } : undefined}
            >
              <span className="bb-bet-amount">
                {bet.isAllIn ? `${playerXP} XP` : bet.label}
              </span>
              {bet.isAllIn && <span className="bb-allin-tag">ALL-IN</span>}
              {!bet.canAfford && <span className="bb-noxp-tag">Zu wenig XP</span>}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Milestones */}
      <div className="bb-section">
        <h3 className="bb-section-title">Brick-Ziele & Multiplikatoren</h3>
        <div className="bb-milestones">
          {milestones.map((m, i) => (
            <motion.div
              key={m.bricks}
              className={['bb-milestone', i === milestones.length - 1 ? 'legendary' : ''].join(' ')}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.18 + i * 0.05 }}
            >
              <span className="bb-ms-icon">
                {i === 0 ? '🥉' : i === 1 ? '🥈' : i === 2 ? '🥇' : '💎'}
              </span>
              <span className="bb-ms-bricks">{m.bricks} Bricks</span>
              <span className="bb-ms-mult">×{m.mult.toFixed(1)}</span>
              <AnimatePresence>
                {selectedBet !== null && (
                  <motion.span
                    className="bb-ms-win"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    +{potWin(selectedBet, m.mult) - selectedBet} XP
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
        <p className="bb-section-hint">
          Mindestens {milestones[0]?.bricks} Bricks → Einsatz zurück!
        </p>
      </div>

      {/* Power-ups info */}
      <div className="bb-section bb-powerups-info">
        <h3 className="bb-section-title">Power-Ups im Spiel</h3>
        <div className="bb-pu-grid">
          {[
            ['↔️','Breites Paddle'],
            ['⚡','Multi-Ball'],
            ['🔫','Laser-Paddel'],
            ['🐢','Zeitlupe'],
            ['🔥','Feuerball'],
          ].map(([emoji, label]) => (
            <div key={label} className="bb-pu-item">
              <span className="bb-pu-emoji">{emoji}</span>
              <span className="bb-pu-label">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="bb-section bb-controls-info">
        <div className="bb-ctrl-grid">
          <div className="bb-ctrl">🖱️ <span>Maus / Touch → Paddle bewegen</span></div>
          <div className="bb-ctrl">← → <span>Pfeiltasten</span></div>
          <div className="bb-ctrl">⏸ <span>ESC = Pause</span></div>
        </div>
      </div>

      {/* Start button */}
      <motion.button
        className={['bb-start-btn', selectedBet === null ? 'disabled' : ''].join(' ')}
        onClick={handleStart}
        disabled={selectedBet === null}
        whileHover={selectedBet !== null ? { scale: 1.04 } : undefined}
        whileTap={selectedBet !== null ? { scale: 0.96 } : undefined}
      >
        <span>🎮</span>
        <span>
          {selectedBet === null
            ? 'Wähle einen Einsatz'
            : `Spielen mit ${selectedBet} XP!`}
        </span>
      </motion.button>

      {playerXP < 25 && (
        <motion.p className="bb-lowxp-warning" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          ⚠️ Du hast wenig XP – sammle mehr durch Lernaktivitäten!
        </motion.p>
      )}

      {/* Zurück-Button */}
      <motion.button
        className="bb-back-btn"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        🗺️ Zurück zur Schatzkarte
      </motion.button>
    </div>
  );
};

export default RunnerBettingPhase;
