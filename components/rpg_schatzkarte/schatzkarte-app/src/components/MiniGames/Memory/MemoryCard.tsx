import React from 'react';
import { motion } from 'framer-motion';
import type { MemoryCardProps } from '../../../types/games';

const MemoryCard: React.FC<MemoryCardProps> = ({
  card,
  onClick,
  disabled,
  size = 'medium'
}) => {
  const isRevealed = card.isFlipped || card.isMatched;
  
  const sizeClasses = {
    small: 'card-small',
    medium: 'card-medium',
    large: 'card-large'
  };

  return (
    <motion.div
      className={`memory-card ${sizeClasses[size]} ${isRevealed ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}`}
      onClick={() => !disabled && !isRevealed && onClick()}
      whileHover={!disabled && !isRevealed ? { scale: 1.05 } : {}}
      whileTap={!disabled && !isRevealed ? { scale: 0.95 } : {}}
      initial={{ rotateY: 0, scale: 0 }}
      animate={{ 
        rotateY: isRevealed ? 180 : 0,
        scale: 1
      }}
      transition={{ 
        rotateY: { duration: 0.5, ease: 'easeInOut' },
        scale: { duration: 0.3, ease: 'backOut' }
      }}
      style={{ 
        cursor: disabled || isRevealed ? 'default' : 'pointer',
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
      role="button"
      aria-label={isRevealed ? `Karte: ${card.symbol}` : 'Verdeckte Karte'}
      tabIndex={disabled || isRevealed ? -1 : 0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled && !isRevealed) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Card Back (Question Mark Side) */}
      <motion.div 
        className="card-face card-back"
        style={{ backfaceVisibility: 'hidden' }}
      >
        <span className="card-question">?</span>
        <div className="card-pattern">
          <div className="pattern-dot" />
          <div className="pattern-dot" />
          <div className="pattern-dot" />
          <div className="pattern-dot" />
        </div>
      </motion.div>
      
      {/* Card Front (Symbol Side) */}
      <motion.div 
        className="card-face card-front"
        style={{ 
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)'
        }}
      >
        <motion.span 
          className="card-symbol"
          animate={card.isMatched ? {
            scale: [1, 1.2, 1],
          } : {}}
          transition={{ duration: 0.4 }}
        >
          {card.symbol}
        </motion.span>
        
        {/* Match Glow Effect */}
        {card.isMatched && (
          <motion.div 
            className="match-glow"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 1, 0.6], scale: [0.5, 1.2, 1] }}
            transition={{ duration: 0.5 }}
          />
        )}
      </motion.div>

      {/* Sparkle Effects on Match */}
      {card.isMatched && (
        <>
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="sparkle"
              initial={{ 
                opacity: 1, 
                scale: 0,
                x: 0,
                y: 0
              }}
              animate={{ 
                opacity: [1, 1, 0],
                scale: [0, 1, 0.5],
                x: [0, (i % 2 === 0 ? 1 : -1) * (20 + Math.random() * 15)],
                y: [0, (i < 2 ? -1 : 1) * (20 + Math.random() * 15)]
              }}
              transition={{ 
                duration: 0.6,
                delay: i * 0.05,
                ease: 'easeOut'
              }}
            >
              ✨
            </motion.div>
          ))}
        </>
      )}
    </motion.div>
  );
};

// Shake Animation for Wrong Match
export const ShakeAnimation = {
  shake: {
    x: [-8, 8, -8, 8, -4, 4, 0],
    transition: { duration: 0.5 }
  }
};

export default MemoryCard;
