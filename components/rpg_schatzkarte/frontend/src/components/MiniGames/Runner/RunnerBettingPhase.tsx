// ============================================
// RUNNER BETTING PHASE
// XP-Einsatz Auswahl UI
// ============================================

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AgeGroup, 
  DIFFICULTY_CONFIGS, 
  BET_OPTIONS 
} from './RunnerAssets';

// === PROPS ===

interface RunnerBettingPhaseProps {
  playerXP: number;
  ageGroup: AgeGroup;
  onStartGame: (betAmount: number) => void;
  onClose: () => void;
}

// === AGE GROUP LABELS ===

const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  grundschule: 'Grundschule',
  unterstufe: 'Unterstufe',
  mittelstufe: 'Mittelstufe'
};

const AGE_GROUP_ICONS: Record<AgeGroup, string> = {
  grundschule: '🌱',
  unterstufe: '🌿',
  mittelstufe: '🌳'
};

// === KOMPONENTE ===

export const RunnerBettingPhase: React.FC<RunnerBettingPhaseProps> = ({
  playerXP,
  ageGroup,
  onStartGame,
  onClose
}) => {
  const [selectedBet, setSelectedBet] = useState<number | null>(null);
  const [isHovering, setIsHovering] = useState<number | null>(null);

  const config = DIFFICULTY_CONFIGS[ageGroup];
  const milestones = Object.entries(config.distanceMultipliers)
    .map(([distance, multiplier]) => ({ 
      distance: parseInt(distance), 
      multiplier 
    }))
    .sort((a, b) => a.distance - b.distance);

  // Verfügbare Einsätze basierend auf Spieler-XP
  const availableBets = useMemo(() => {
    return BET_OPTIONS.map(bet => ({
      ...bet,
      actualAmount: bet.isAllIn ? playerXP : bet.amount,
      isAvailable: bet.isAllIn ? playerXP > 0 : playerXP >= bet.amount
    }));
  }, [playerXP]);

  // Potentieller Gewinn berechnen
  const calculatePotentialWin = (bet: number, multiplier: number): number => {
    return Math.floor(bet * multiplier);
  };

  const handleBetSelect = (betOption: typeof availableBets[0]) => {
    if (betOption.isAvailable) {
      setSelectedBet(betOption.actualAmount);
    }
  };

  const handleStart = () => {
    if (selectedBet !== null && selectedBet > 0) {
      onStartGame(selectedBet);
    }
  };

  return (
    <div className="runner-betting-phase">
      {/* Header */}
      <div className="betting-header">
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
        <div className="game-title">
          <span className="game-icon">🏃</span>
          <h2>Endless Runner</h2>
        </div>
        <div className="difficulty-badge">
          <span className="age-icon">{AGE_GROUP_ICONS[ageGroup]}</span>
          <span className="age-label">{AGE_GROUP_LABELS[ageGroup]}</span>
        </div>
      </div>

      {/* XP-Anzeige */}
      <motion.div 
        className="xp-display"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <span className="xp-label">Deine XP</span>
        <span className="xp-value">
          <span className="xp-icon">⭐</span>
          {playerXP.toLocaleString()}
        </span>
      </motion.div>

      {/* Einsatz-Auswahl */}
      <div className="betting-section">
        <h3>Wähle deinen Einsatz</h3>
        <p className="betting-hint">
          Setze XP für höhere Belohnungen! Je weiter du läufst, desto mehr gewinnst du.
        </p>

        <div className="bet-options">
          {availableBets.map((bet, index) => (
            <motion.button
              key={bet.label}
              className={`bet-option ${selectedBet === bet.actualAmount ? 'selected' : ''} ${!bet.isAvailable ? 'disabled' : ''}`}
              onClick={() => handleBetSelect(bet)}
              disabled={!bet.isAvailable}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              whileHover={bet.isAvailable ? { scale: 1.05 } : undefined}
              whileTap={bet.isAvailable ? { scale: 0.95 } : undefined}
              onMouseEnter={() => bet.isAvailable && setIsHovering(bet.actualAmount)}
              onMouseLeave={() => setIsHovering(null)}
            >
              <span className="bet-amount">
                {bet.isAllIn ? `${playerXP} XP` : bet.label}
              </span>
              {bet.isAllIn && (
                <span className="allin-badge">All-In!</span>
              )}
              {!bet.isAvailable && (
                <span className="not-enough">Nicht genug XP</span>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Distanz-Ziele */}
      <div className="milestones-section">
        <h3>Distanz-Ziele</h3>
        <div className="milestones-list">
          {milestones.map((milestone, index) => {
            const potentialWin = selectedBet 
              ? calculatePotentialWin(selectedBet, milestone.multiplier)
              : 0;
            const isHighlighted = isHovering !== null || selectedBet !== null;

            return (
              <motion.div
                key={milestone.distance}
                className={`milestone-item ${index === milestones.length - 1 ? 'legendary' : ''}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
              >
                <div className="milestone-distance">
                  <span className="distance-value">{milestone.distance}m</span>
                  {index === milestones.length - 1 && <span className="star-badge">⭐</span>}
                </div>
                <div className="milestone-multiplier">
                  ×{milestone.multiplier.toFixed(1)}
                </div>
                <AnimatePresence>
                  {isHighlighted && selectedBet && (
                    <motion.div
                      className="potential-win"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      +{potentialWin} XP
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
        <p className="milestone-hint">
          Erreiche mindestens {milestones[0]?.distance}m um deinen Einsatz zurück zu bekommen!
        </p>
      </div>

      {/* Spielinfo */}
      <div className="game-info-section">
        <h3>So funktioniert's</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-icon">👆</span>
            <span className="info-text">Tippen oder Leertaste = Springen</span>
          </div>
          <div className="info-item">
            <span className="info-icon">👇</span>
            <span className="info-text">Wischen oder S-Taste = Ducken</span>
          </div>
          <div className="info-item">
            <span className="info-icon">🪙</span>
            <span className="info-text">Sammle Münzen für Gold</span>
          </div>
          <div className="info-item">
            <span className="info-icon">⭐</span>
            <span className="info-text">Sammle Sterne für Bonus-XP</span>
          </div>
          <div className="info-item">
            <span className="info-icon">❤️</span>
            <span className="info-text">{config.startLives} Leben - bei 0 ist Game Over!</span>
          </div>
          <div className="info-item">
            <span className="info-icon">💎</span>
            <span className="info-text">Seltene Diamanten = 100 Gold!</span>
          </div>
        </div>
      </div>

      {/* Start-Button */}
      <motion.button
        className={`start-button ${selectedBet === null ? 'disabled' : ''}`}
        onClick={handleStart}
        disabled={selectedBet === null}
        whileHover={selectedBet !== null ? { scale: 1.05 } : undefined}
        whileTap={selectedBet !== null ? { scale: 0.95 } : undefined}
      >
        <span className="button-icon">🎮</span>
        <span className="button-text">
          {selectedBet === null 
            ? 'Wähle einen Einsatz' 
            : `Los geht's mit ${selectedBet} XP!`
          }
        </span>
      </motion.button>

      {/* Warnung bei niedrigen XP */}
      {playerXP < 25 && (
        <motion.div
          className="low-xp-warning"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="warning-icon">⚠️</span>
          <span>Du hast nur wenig XP. Sammle mehr durch Lern-Aktivitäten!</span>
        </motion.div>
      )}
    </div>
  );
};

export default RunnerBettingPhase;
