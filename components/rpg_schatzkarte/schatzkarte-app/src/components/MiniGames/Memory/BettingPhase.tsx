import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BettingPhaseProps, Difficulty } from '../../../types/games';

// Configs inline (konsistent mit SHARED_TYPES)
const MEMORY_CONFIGS = {
  easy: { pairs: 6, lives: 5, time: 90, multiplier: 1.5 },
  medium: { pairs: 8, lives: 4, time: 60, multiplier: 2.0 },
  hard: { pairs: 10, lives: 3, time: 45, multiplier: 3.0 }
};

const BET_OPTIONS = [25, 50, 100, 'all'] as const;

const BettingPhase: React.FC<BettingPhaseProps> = ({
  playerXP,
  onStartGame,
  onCancel
}) => {
  const [selectedBet, setSelectedBet] = useState<number | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');
  
  const config = MEMORY_CONFIGS[selectedDifficulty];
  
  const potentialWin = useMemo(() => {
    if (selectedBet === null) return 0;
    return Math.round(selectedBet * config.multiplier);
  }, [selectedBet, config.multiplier]);

  const handleBetSelect = (bet: number | 'all') => {
    if (bet === 'all') {
      setSelectedBet(playerXP);
    } else {
      setSelectedBet(bet);
    }
  };

  const canStartGame = selectedBet !== null && selectedBet <= playerXP && selectedBet > 0;

  const difficultyInfo: Record<Difficulty, { emoji: string; label: string }> = {
    easy: { emoji: '😊', label: 'Leicht' },
    medium: { emoji: '🎯', label: 'Mittel' },
    hard: { emoji: '🔥', label: 'Schwer' }
  };

  return (
    <motion.div 
      className="betting-phase"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <div className="betting-card">
        <motion.h2 
          className="betting-title"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          🧠 Memory Challenge
        </motion.h2>
        
        <motion.p 
          className="betting-question"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Wie viel XP möchtest du riskieren?
        </motion.p>

        <motion.div 
          className="xp-display"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="xp-label">Dein XP-Guthaben:</span>
          <span className="xp-amount">
            <span className="xp-value">{playerXP}</span>
            <span className="xp-unit">XP</span>
          </span>
        </motion.div>

        {/* Bet Options */}
        <motion.div 
          className="bet-options"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {BET_OPTIONS.map((bet, index) => {
            const betValue = bet === 'all' ? playerXP : bet;
            const isDisabled = betValue > playerXP;
            const isSelected = selectedBet === betValue;
            
            return (
              <motion.button
                key={bet}
                className={`bet-button ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                onClick={() => !isDisabled && handleBetSelect(bet)}
                disabled={isDisabled}
                whileHover={!isDisabled ? { scale: 1.05 } : {}}
                whileTap={!isDisabled ? { scale: 0.95 } : {}}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
              >
                {bet === 'all' ? (
                  <>
                    <span className="bet-label">All-In!</span>
                    <span className="bet-value">{playerXP} XP</span>
                  </>
                ) : (
                  <>
                    <span className="bet-value">{bet}</span>
                    <span className="bet-unit">XP</span>
                  </>
                )}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Difficulty Selection */}
        <motion.div 
          className="difficulty-section"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="section-label">Schwierigkeit:</p>
          <div className="difficulty-options">
            {(Object.keys(MEMORY_CONFIGS) as Difficulty[]).map((diff) => {
              const info = difficultyInfo[diff];
              const cfg = MEMORY_CONFIGS[diff];
              const isSelected = selectedDifficulty === diff;
              
              return (
                <motion.button
                  key={diff}
                  className={`difficulty-button ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedDifficulty(diff)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="diff-emoji">{info.emoji}</span>
                  <span className="diff-label">{info.label}</span>
                  <span className="diff-multiplier">×{cfg.multiplier}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Game Info */}
        <motion.div 
          className="game-info"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="info-row">
            <span className="info-label">❤️ Leben:</span>
            <span className="info-value">{config.lives}</span>
          </div>
          <div className="info-row">
            <span className="info-label">⏱️ Zeit:</span>
            <span className="info-value">{config.time}s</span>
          </div>
          <div className="info-row">
            <span className="info-label">🃏 Paare:</span>
            <span className="info-value">{config.pairs}</span>
          </div>
        </motion.div>

        {/* Potential Win */}
        <AnimatePresence mode="wait">
          {selectedBet !== null && (
            <motion.div 
              className="potential-win"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <span className="win-label">Möglicher Gewinn:</span>
              <motion.span 
                className="win-amount"
                key={potentialWin}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
              >
                {potentialWin} XP ✨
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Warning if not enough XP */}
        {playerXP < 25 && (
          <motion.div 
            className="warning-message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            ⚠️ Du brauchst mindestens 25 XP um zu spielen!
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div 
          className="action-buttons"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <motion.button
            className="cancel-button"
            onClick={onCancel}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            ← Zurück
          </motion.button>
          
          <motion.button
            className={`start-button ${!canStartGame ? 'disabled' : ''}`}
            onClick={() => canStartGame && onStartGame(selectedBet!, selectedDifficulty)}
            disabled={!canStartGame}
            whileHover={canStartGame ? { scale: 1.02 } : {}}
            whileTap={canStartGame ? { scale: 0.98 } : {}}
          >
            🎮 Spiel starten
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default BettingPhase;
