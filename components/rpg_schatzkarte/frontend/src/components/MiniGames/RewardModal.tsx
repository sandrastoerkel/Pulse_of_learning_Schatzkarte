import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type {
  Achievement,
  ShopItem
} from '../../types';
import type { GameResult } from '../../types/games';
import './reward-modal.css';

// ============================================
// TYPES
// ============================================

type RewardType = 'game_won' | 'game_lost' | 'achievement' | 'level_up' | 'island_complete';

interface LevelUpInfo {
  oldLevel: number;
  newLevel: number;
  newTitle?: string;
  goldBonus?: number;
}

interface IslandReward {
  islandName: string;
  xpEarned: number;
  goldEarned: number;
  itemUnlocked?: ShopItem;
}

interface RewardModalProps {
  isOpen: boolean;
  type: RewardType;
  
  // Für Spiele
  gameResult?: GameResult;
  
  // Für Achievements
  achievement?: Achievement;
  
  // Für Level-Up
  levelUp?: LevelUpInfo;
  
  // Für Insel-Abschluss
  islandReward?: IslandReward;
  
  onPlayAgain?: () => void;
  onClose: () => void;
}

// ============================================
// KONFETTI COMPONENT
// ============================================

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  rotation: number;
  scale: number;
}

const Confetti: React.FC<{ active: boolean }> = ({ active }) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  
  useEffect(() => {
    if (active) {
      const colors = ['#FFD700', '#4ade80', '#3498db', '#9b59b6', '#ef4444', '#f59e0b'];
      const newPieces: ConfettiPiece[] = [];
      
      for (let i = 0; i < 50; i++) {
        newPieces.push({
          id: i,
          x: Math.random() * 100,
          color: colors[Math.floor(Math.random() * colors.length)],
          delay: Math.random() * 0.5,
          rotation: Math.random() * 360,
          scale: 0.5 + Math.random() * 0.5
        });
      }
      
      setPieces(newPieces);
      
      // Clear after animation
      const timer = setTimeout(() => setPieces([]), 3000);
      return () => clearTimeout(timer);
    }
  }, [active]);
  
  if (!active || pieces.length === 0) return null;
  
  return (
    <div className="confetti-container">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="confetti-piece"
          style={{
            left: `${piece.x}%`,
            backgroundColor: piece.color,
            scale: piece.scale
          }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{ 
            y: '100vh', 
            opacity: 0, 
            rotate: piece.rotation + 720,
            x: Math.sin(piece.id) * 100
          }}
          transition={{ 
            duration: 2.5 + Math.random(), 
            delay: piece.delay,
            ease: 'easeOut'
          }}
        />
      ))}
    </div>
  );
};

// ============================================
// ANIMATED COUNTER
// ============================================

const AnimatedCounter: React.FC<{ 
  value: number; 
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
}> = ({ value, prefix = '', suffix = '', className = '', duration = 1.5 }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const startTime = Date.now();
    const startValue = 0;
    
    const animate = () => {
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease out cubic)
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (value - startValue) * eased);
      
      setDisplayValue(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value, duration]);
  
  return (
    <span className={className}>
      {prefix}{displayValue}{suffix}
    </span>
  );
};

// ============================================
// REWARD MODAL COMPONENT
// ============================================

export const RewardModal: React.FC<RewardModalProps> = ({
  isOpen,
  type,
  gameResult,
  achievement,
  levelUp,
  islandReward,
  onPlayAgain,
  onClose
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Trigger confetti for winning scenarios
  useEffect(() => {
    if (isOpen && (type === 'game_won' || type === 'achievement' || type === 'level_up' || type === 'island_complete')) {
      setShowConfetti(true);
    } else {
      setShowConfetti(false);
    }
  }, [isOpen, type]);
  
  // Get modal class based on type
  const getModalClass = useCallback(() => {
    switch (type) {
      case 'game_won':
      case 'island_complete':
        return 'won';
      case 'game_lost':
        return 'lost';
      case 'achievement':
        return 'achievement';
      case 'level_up':
        return 'level-up';
      default:
        return '';
    }
  }, [type]);
  
  // Render content based on type
  const renderContent = () => {
    switch (type) {
      case 'game_won':
        return renderGameWon();
      case 'game_lost':
        return renderGameLost();
      case 'achievement':
        return renderAchievement();
      case 'level_up':
        return renderLevelUp();
      case 'island_complete':
        return renderIslandComplete();
      default:
        return null;
    }
  };
  
  // ========== GAME WON ==========
  const renderGameWon = () => {
    if (!gameResult) return null;
    
    const gameName = gameResult.game === 'memory' ? 'Memory' : 'Runner';
    const multiplier = gameResult.xpBet > 0 
      ? (gameResult.xpWon / gameResult.xpBet).toFixed(1) 
      : '0';
    
    return (
      <>
        <motion.h2 
          className="reward-title won"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 10 }}
        >
          🎉 GEWONNEN! 🎉
        </motion.h2>
        
        <motion.div 
          className="game-stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="game-name">{gameName}</p>
          {gameResult.stats.moves && (
            <p className="stat-line">in {gameResult.stats.moves} Zügen</p>
          )}
          {gameResult.stats.timeUsed && (
            <p className="stat-line">Zeit: {gameResult.stats.timeUsed} Sekunden</p>
          )}
          {gameResult.stats.distance && (
            <p className="stat-line">Distanz: {gameResult.stats.distance}m</p>
          )}
          {gameResult.stats.coinsCollected !== undefined && (
            <p className="stat-line">Münzen: {gameResult.stats.coinsCollected}</p>
          )}
        </motion.div>
        
        <motion.div 
          className="reward-box"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
        >
          <div className="xp-display positive">
            ⭐ +<AnimatedCounter value={gameResult.xpWon} /> XP
          </div>
          {gameResult.goldWon > 0 && (
            <div className="gold-display">
              💰 +<AnimatedCounter value={gameResult.goldWon} /> Gold
            </div>
          )}
          <div className="multiplier-info">
            <span className="info-label">Einsatz:</span> {gameResult.xpBet} XP
          </div>
          <div className="multiplier-info">
            <span className="info-label">Multiplikator:</span> ×{multiplier}
          </div>
        </motion.div>
        
        <div className="button-row">
          {onPlayAgain && (
            <motion.button 
              className="btn btn-secondary"
              onClick={onPlayAgain}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🎮 Nochmal
            </motion.button>
          )}
          <motion.button 
            className="btn btn-primary"
            onClick={onClose}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ✅ Fertig
          </motion.button>
        </div>
      </>
    );
  };
  
  // ========== GAME LOST ==========
  const renderGameLost = () => {
    if (!gameResult) return null;
    
    return (
      <>
        <motion.h2 
          className="reward-title lost"
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ 
            scale: 1, 
            opacity: 1,
            x: [0, -10, 10, -10, 10, 0]
          }}
          transition={{ duration: 0.5 }}
        >
          💔 VERLOREN 💔
        </motion.h2>
        
        <motion.p 
          className="loss-reason"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Keine Leben mehr!
        </motion.p>
        
        <motion.div 
          className="reward-box lost"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="xp-display negative">
            ❌ -{gameResult.xpBet} XP
          </div>
          
          <div className="tip-box">
            <span className="tip-label">💡 Tipp:</span>
            <p>Starte mit einem kleineren Einsatz!</p>
          </div>
        </motion.div>
        
        <div className="button-row">
          {onPlayAgain && (
            <motion.button 
              className="btn btn-secondary"
              onClick={onPlayAgain}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🔄 Nochmal
            </motion.button>
          )}
          <motion.button 
            className="btn btn-primary"
            onClick={onClose}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ✅ Aufhören
          </motion.button>
        </div>
      </>
    );
  };
  
  // ========== ACHIEVEMENT ==========
  const renderAchievement = () => {
    if (!achievement) return null;
    
    return (
      <>
        <motion.h2 
          className="reward-title achievement"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ✨ NEUES ACHIEVEMENT! ✨
        </motion.h2>
        
        <motion.div 
          className="achievement-badge"
          initial={{ rotateY: 180, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 15, delay: 0.2 }}
        >
          <span className="badge-icon">{achievement.icon}</span>
        </motion.div>
        
        <motion.h3 
          className="achievement-name"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {achievement.name}
        </motion.h3>
        
        <motion.p 
          className="achievement-description"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          "{achievement.description}"
        </motion.p>
        
        {achievement.bonusXP && (
          <motion.div 
            className="reward-box"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="bonus-display">
              Bonus: +{achievement.bonusXP} XP
            </div>
          </motion.div>
        )}
        
        <div className="button-row center">
          <motion.button 
            className="btn btn-primary"
            onClick={onClose}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🎉 Super!
          </motion.button>
        </div>
      </>
    );
  };
  
  // ========== LEVEL UP ==========
  const renderLevelUp = () => {
    if (!levelUp) return null;
    
    return (
      <>
        <motion.h2 
          className="reward-title level-up"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 10 }}
        >
          ⬆️ LEVEL UP! ⬆️
        </motion.h2>
        
        <motion.div 
          className="level-display"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.span 
            className="level-old"
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0.5, scale: 0.8 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            Level {levelUp.oldLevel}
          </motion.span>
          <motion.span 
            className="level-arrow"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            →
          </motion.span>
          <motion.span 
            className="level-new"
            initial={{ opacity: 0, scale: 1.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, type: 'spring' }}
          >
            Level {levelUp.newLevel}
          </motion.span>
        </motion.div>
        
        <motion.div 
          className="glow-effect"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.8, 0] }}
          transition={{ delay: 0.5, duration: 1.5 }}
        />
        
        <motion.div 
          className="reward-box"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          {levelUp.newTitle && (
            <div className="new-title">
              <span className="title-label">Neuer Titel freigeschaltet:</span>
              <span className="title-value">🏆 "{levelUp.newTitle}"</span>
            </div>
          )}
          
          {levelUp.goldBonus && levelUp.goldBonus > 0 && (
            <div className="gold-bonus">
              +{levelUp.goldBonus} Gold Bonus
            </div>
          )}
        </motion.div>
        
        <div className="button-row center">
          <motion.button 
            className="btn btn-primary"
            onClick={onClose}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🎉 Weiter!
          </motion.button>
        </div>
      </>
    );
  };
  
  // ========== ISLAND COMPLETE ==========
  const renderIslandComplete = () => {
    if (!islandReward) return null;
    
    return (
      <>
        <motion.h2 
          className="reward-title island"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          🏝️ INSEL ABGESCHLOSSEN! 🏝️
        </motion.h2>
        
        <motion.p 
          className="island-name"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {islandReward.islandName}
        </motion.p>
        
        <motion.div 
          className="reward-box"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, type: 'spring' }}
        >
          <div className="xp-display positive">
            ⭐ +<AnimatedCounter value={islandReward.xpEarned} /> XP
          </div>
          <div className="gold-display">
            💰 +<AnimatedCounter value={islandReward.goldEarned} /> Gold
          </div>
          
          {islandReward.itemUnlocked && (
            <motion.div 
              className="item-unlocked"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <span className="unlock-label">🎁 Item freigeschaltet:</span>
              <div className="unlocked-item">
                <span className="item-icon">{islandReward.itemUnlocked.icon}</span>
                <span className="item-name">{islandReward.itemUnlocked.name}</span>
              </div>
            </motion.div>
          )}
        </motion.div>
        
        <div className="button-row center">
          <motion.button 
            className="btn btn-primary"
            onClick={onClose}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🎉 Weiter erkunden!
          </motion.button>
        </div>
      </>
    );
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="reward-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <Confetti active={showConfetti} />
          
          <motion.div 
            className={`reward-modal ${getModalClass()}`}
            initial={{ scale: 0.8, y: 100, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {renderContent()}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RewardModal;
