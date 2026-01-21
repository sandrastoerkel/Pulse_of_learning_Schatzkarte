import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './reward-modal.css';

// ============================================
// TYPES
// ============================================

type MiniGameType = 'memory' | 'runner';

type RewardTrigger = 
  | 'bandura_complete' 
  | 'island_complete' 
  | 'level_up' 
  | 'achievement_unlocked';

interface TriggerDetails {
  banduraComplete?: boolean;
  islandName?: string;
  islandId?: string;
}

interface MiniGameSelectorProps {
  isOpen: boolean;
  trigger: RewardTrigger;
  triggerDetails?: TriggerDetails;
  availableGames: MiniGameType[];
  bonusMultiplier?: number;
  onSelectGame: (game: MiniGameType) => void;
  onSelectShop: () => void;
  onClose: () => void;
}

// ============================================
// CONSTANTS
// ============================================

const TRIGGER_TEXTS: Record<RewardTrigger, { title: string; description: string }> = {
  bandura_complete: {
    title: '🧠 Bandura-Challenge geschafft!',
    description: 'Du hast alle 4 Quellen der Selbstwirksamkeit erkundet.'
  },
  island_complete: {
    title: '📍 Station abgeschlossen!',
    description: 'Du hast alle Aufgaben auf dieser Station gemeistert.'
  },
  level_up: {
    title: '⬆️ Level Up!',
    description: 'Du bist aufgestiegen! Feiere mit einem Spiel.'
  },
  achievement_unlocked: {
    title: '🏆 Achievement freigeschaltet!',
    description: 'Großartig! Du hast dir eine Belohnung verdient.'
  }
};

interface GameCardInfo {
  icon: string;
  name: string;
  description: string;
  color: string;
}

const GAME_CARDS: Record<MiniGameType, GameCardInfo> = {
  memory: {
    icon: '🧠',
    name: 'Memory',
    description: 'Finde alle Paare und vervielfache deinen XP-Einsatz!',
    color: '#9b59b6'
  },
  runner: {
    icon: '🏃',
    name: 'Runner',
    description: 'Renne so weit du kannst und sammle Münzen!',
    color: '#3498db'
  }
};

// ============================================
// COMPONENT
// ============================================

export const MiniGameSelector: React.FC<MiniGameSelectorProps> = ({
  isOpen,
  trigger,
  triggerDetails,
  availableGames,
  bonusMultiplier,
  onSelectGame,
  onSelectShop,
  onClose
}) => {
  const triggerText = TRIGGER_TEXTS[trigger];
  
  // Custom description for island complete
  const getDescription = () => {
    if (trigger === 'island_complete' && triggerDetails?.islandName) {
      return `Du hast "${triggerDetails.islandName}" gemeistert!`;
    }
    return triggerText.description;
  };
  
  // Animation variants for staggered cards
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };
  
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring' as const,
        damping: 15
      }
    }
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
          <motion.div 
            className="game-selector"
            initial={{ scale: 0.8, y: 100, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <motion.div 
              className="selector-header"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="selector-title">{triggerText.title}</h2>
              <p className="selector-description">{getDescription()}</p>
              
              {bonusMultiplier && bonusMultiplier > 1 && (
                <motion.div 
                  className="bonus-badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring' }}
                >
                  🎁 {bonusMultiplier}× Bonus aktiv!
                </motion.div>
              )}
            </motion.div>
            
            <p className="choose-label">Wähle deine Belohnung:</p>
            
            {/* Game Cards */}
            <motion.div 
              className="game-cards"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {availableGames.map((game) => {
                const gameInfo = GAME_CARDS[game];
                return (
                  <motion.button
                    key={game}
                    className="game-card"
                    variants={cardVariants}
                    whileHover={{ 
                      scale: 1.05, 
                      y: -5,
                      boxShadow: `0 15px 40px ${gameInfo.color}40`
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelectGame(game)}
                    style={{
                      '--card-color': gameInfo.color
                    } as React.CSSProperties}
                  >
                    <span className="game-card-icon">{gameInfo.icon}</span>
                    <span className="game-card-name">{gameInfo.name}</span>
                    <span className="game-card-description">{gameInfo.description}</span>
                  </motion.button>
                );
              })}
            </motion.div>
            
            {/* Divider */}
            <motion.div 
              className="selector-divider"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.6 }}
            >
              <span className="divider-line" />
              <span className="divider-text">ODER</span>
              <span className="divider-line" />
            </motion.div>
            
            {/* Shop Option */}
            <motion.button 
              className="shop-option"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onSelectShop}
            >
              <span className="shop-icon">🛒</span>
              <div className="shop-text">
                <span className="shop-title">Zum Avatar-Shop</span>
                <span className="shop-subtitle">Verbessere deinen Avatar!</span>
              </div>
              <span className="shop-arrow">→</span>
            </motion.button>
            
            {/* Later Button */}
            <motion.button 
              className="later-btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              onClick={onClose}
            >
              ❌ Später
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MiniGameSelector;
