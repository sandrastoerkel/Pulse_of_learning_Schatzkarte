import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BettingPhase from './BettingPhase';
import MemoryCard from './MemoryCard';
import type {
  MemoryGameProps,
  MemoryGameState,
  MemoryCard as MemoryCardType,
  GameResult,
  Difficulty,
  GameStatus,
  MEMORY_CONFIGS,
  GRID_SIZES,
  CARD_SYMBOLS
} from '../../../types/games';
import './memory-game.css';

// Re-import constants (TypeScript kann keine Values aus type imports nehmen)
const MEMORY_CONFIGS_DATA = {
  easy: { pairs: 6, lives: 5, time: 90, multiplier: 1.5 },
  medium: { pairs: 8, lives: 4, time: 60, multiplier: 2.0 },
  hard: { pairs: 10, lives: 3, time: 45, multiplier: 3.0 }
};

const GRID_SIZES_DATA = {
  easy: { rows: 3, cols: 4 },
  medium: { rows: 4, cols: 4 },
  hard: { rows: 4, cols: 5 }
};

const SYMBOLS = [
  '🐉', '🐱', '🦅', '⚔️', '🧠',
  '📚', '💡', '🎯', '⭐', '🔮',
  '🔢', '📐', '🌍', '🔬', '📝',
  '💎', '👑', '🏆', '🎁', '🌟'
];

// ============================================
// Utility Functions
// ============================================

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const createCards = (pairCount: number): MemoryCardType[] => {
  const selectedSymbols = shuffleArray(SYMBOLS).slice(0, pairCount);
  const cardPairs = selectedSymbols.flatMap((symbol, index) => [
    { id: index * 2, symbol, isFlipped: false, isMatched: false },
    { id: index * 2 + 1, symbol, isFlipped: false, isMatched: false }
  ]);
  return shuffleArray(cardPairs);
};

// ============================================
// Main Component
// ============================================

const MemoryGame: React.FC<MemoryGameProps> = ({
  playerXP,
  playerGold,
  playerAvatar,
  onGameEnd,
  onClose
}) => {
  // Initial state
  const [gameState, setGameState] = useState<MemoryGameState>({
    status: 'betting',
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    totalPairs: 0,
    lives: 0,
    maxLives: 0,
    timeLeft: 0,
    moves: 0,
    betAmount: 0,
    potentialWin: 0,
    difficulty: 'medium'
  });

  const [showWrongMatch, setShowWrongMatch] = useState(false);
  const [wrongCardIds, setWrongCardIds] = useState<number[]>([]);

  // ============================================
  // Game Logic
  // ============================================

  const startGame = useCallback((bet: number, difficulty: Difficulty) => {
    const config = MEMORY_CONFIGS_DATA[difficulty];
    const cards = createCards(config.pairs);
    const potentialWin = Math.round(bet * config.multiplier);

    setGameState({
      status: 'playing',
      cards,
      flippedCards: [],
      matchedPairs: 0,
      totalPairs: config.pairs,
      lives: config.lives,
      maxLives: config.lives,
      timeLeft: config.time,
      moves: 0,
      betAmount: bet,
      potentialWin,
      difficulty
    });
  }, []);

  const handleCardClick = useCallback((cardId: number) => {
    if (gameState.status !== 'playing') return;
    if (gameState.flippedCards.length >= 2) return;
    if (gameState.flippedCards.includes(cardId)) return;
    
    const card = gameState.cards.find(c => c.id === cardId);
    if (!card || card.isMatched) return;

    const newFlippedCards = [...gameState.flippedCards, cardId];
    
    setGameState(prev => ({
      ...prev,
      cards: prev.cards.map(c => 
        c.id === cardId ? { ...c, isFlipped: true } : c
      ),
      flippedCards: newFlippedCards,
      moves: prev.moves + 1
    }));

    // Check for match when two cards are flipped
    if (newFlippedCards.length === 2) {
      const [firstId, secondId] = newFlippedCards;
      const firstCard = gameState.cards.find(c => c.id === firstId)!;
      const secondCard = gameState.cards.find(c => c.id === secondId)!;

      setTimeout(() => {
        if (firstCard.symbol === secondCard.symbol) {
          // Match found!
          setGameState(prev => {
            const newMatchedPairs = prev.matchedPairs + 1;
            const isWon = newMatchedPairs >= prev.totalPairs;
            
            return {
              ...prev,
              cards: prev.cards.map(c => 
                c.id === firstId || c.id === secondId
                  ? { ...c, isMatched: true }
                  : c
              ),
              flippedCards: [],
              matchedPairs: newMatchedPairs,
              status: isWon ? 'won' : prev.status
            };
          });
        } else {
          // No match - lose a life
          setWrongCardIds([firstId, secondId]);
          setShowWrongMatch(true);
          
          setTimeout(() => {
            setShowWrongMatch(false);
            setWrongCardIds([]);
            
            setGameState(prev => {
              const newLives = prev.lives - 1;
              const isLost = newLives <= 0;
              
              return {
                ...prev,
                cards: prev.cards.map(c => 
                  c.id === firstId || c.id === secondId
                    ? { ...c, isFlipped: false }
                    : c
                ),
                flippedCards: [],
                lives: newLives,
                status: isLost ? 'lost' : prev.status
              };
            });
          }, 800);
        }
      }, 700);
    }
  }, [gameState]);

  // Timer Effect
  useEffect(() => {
    if (gameState.status !== 'playing') return;

    const timer = setInterval(() => {
      setGameState(prev => {
        const newTimeLeft = prev.timeLeft - 1;
        if (newTimeLeft <= 0) {
          return { ...prev, timeLeft: 0, status: 'lost' };
        }
        return { ...prev, timeLeft: newTimeLeft };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.status]);

  // Calculate result
  const gameResult = useMemo((): GameResult | null => {
    if (gameState.status !== 'won' && gameState.status !== 'lost') return null;

    const config = MEMORY_CONFIGS_DATA[gameState.difficulty];
    const timeUsed = config.time - gameState.timeLeft;
    
    // Bonus-Gold bei perfektem Spiel (keine Leben verloren)
    const perfectGame = gameState.status === 'won' && gameState.lives === gameState.maxLives;
    const goldBonus = perfectGame ? Math.round(gameState.betAmount * 0.1) : 0;
    
    if (gameState.status === 'won') {
      return {
        game: 'memory',
        won: true,
        xpBet: gameState.betAmount,
        xpWon: gameState.potentialWin,
        goldWon: goldBonus,
        stats: {
          moves: gameState.moves,
          timeUsed,
          pairsFound: gameState.matchedPairs
        }
      };
    } else {
      return {
        game: 'memory',
        won: false,
        xpBet: gameState.betAmount,
        xpWon: -gameState.betAmount,
        goldWon: 0,
        stats: {
          moves: gameState.moves,
          timeUsed,
          pairsFound: gameState.matchedPairs
        }
      };
    }
  }, [gameState]);

  // Finish game
  const handleFinish = useCallback(() => {
    if (gameResult) {
      onGameEnd(gameResult);
    }
  }, [gameResult, onGameEnd]);

  const handlePlayAgain = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      status: 'betting'
    }));
  }, []);

  // ============================================
  // Render Helpers
  // ============================================

  const renderLives = () => (
    <div className="lives-display">
      {[...Array(gameState.maxLives)].map((_, i) => (
        <motion.span
          key={i}
          className={`heart ${i >= gameState.lives ? 'lost' : ''}`}
          animate={i === gameState.lives && showWrongMatch ? {
            scale: [1, 0.5, 0],
            y: [0, -10, 20],
            opacity: [1, 1, 0]
          } : {}}
          transition={{ duration: 0.5 }}
        >
          ❤️
        </motion.span>
      ))}
    </div>
  );

  const renderTimer = () => {
    const config = MEMORY_CONFIGS_DATA[gameState.difficulty];
    const percentage = (gameState.timeLeft / config.time) * 100;
    const isWarning = gameState.timeLeft <= 20 && gameState.timeLeft > 10;
    const isDanger = gameState.timeLeft <= 10;

    return (
      <div className="timer-container">
        <span className="timer-icon">⏱️</span>
        <div className="timer-bar">
          <motion.div
            className={`timer-fill ${isWarning ? 'warning' : ''} ${isDanger ? 'danger' : ''}`}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className={`timer-text ${isDanger ? 'danger' : ''}`}>
          {gameState.timeLeft}s
        </span>
      </div>
    );
  };

  const gridSize = GRID_SIZES_DATA[gameState.difficulty];
  const config = MEMORY_CONFIGS_DATA[gameState.difficulty];

  // ============================================
  // Render
  // ============================================

  return (
    <div className="memory-game">
      <AnimatePresence mode="wait">
        {/* BETTING PHASE */}
        {gameState.status === 'betting' && (
          <BettingPhase
            key="betting"
            playerXP={playerXP}
            onStartGame={startGame}
            onCancel={onClose}
          />
        )}

        {/* PLAYING PHASE */}
        {gameState.status === 'playing' && (
          <motion.div
            key="playing"
            className="game-playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Header */}
            <div className="game-header">
              <div className="header-left">
                {renderLives()}
                <span className="lives-text">
                  Leben: {gameState.lives}/{gameState.maxLives}
                </span>
              </div>
              {renderTimer()}
            </div>

            {/* Stats Bar */}
            <div className="stats-bar">
              <div className="stat">
                <span className="stat-label">Einsatz:</span>
                <span className="stat-value">{gameState.betAmount} XP</span>
              </div>
              <div className="stat">
                <span className="stat-label">Möglicher Gewinn:</span>
                <span className="stat-value highlight">
                  {gameState.potentialWin} XP
                </span>
              </div>
            </div>

            {/* Game Board */}
            <motion.div
              className="game-board"
              style={{
                gridTemplateColumns: `repeat(${gridSize.cols}, 1fr)`,
                gridTemplateRows: `repeat(${gridSize.rows}, 1fr)`
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {gameState.cards.map((card, index) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    x: wrongCardIds.includes(card.id) && showWrongMatch 
                      ? [-5, 5, -5, 5, 0] 
                      : 0
                  }}
                  transition={{ 
                    delay: index * 0.03,
                    x: { duration: 0.4 }
                  }}
                >
                  <MemoryCard
                    card={card}
                    onClick={() => handleCardClick(card.id)}
                    disabled={
                      gameState.flippedCards.length >= 2 ||
                      showWrongMatch
                    }
                    size={gridSize.cols > 4 ? 'small' : 'medium'}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Footer Stats */}
            <div className="game-footer">
              <span className="footer-stat">
                Züge: {gameState.moves}
              </span>
              <span className="footer-stat">
                Paare: {gameState.matchedPairs}/{gameState.totalPairs}
              </span>
            </div>

            {/* Wrong Match Flash */}
            <AnimatePresence>
              {showWrongMatch && (
                <motion.div
                  className="wrong-flash"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* RESULT PHASE - WON */}
        {gameState.status === 'won' && gameResult && (
          <motion.div
            key="won"
            className="game-result won"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Confetti */}
            <div className="confetti-container">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="confetti"
                  initial={{
                    y: -20,
                    x: Math.random() * 300 - 150,
                    rotate: 0,
                    opacity: 1
                  }}
                  animate={{
                    y: 400,
                    x: Math.random() * 300 - 150,
                    rotate: Math.random() * 720,
                    opacity: [1, 1, 0]
                  }}
                  transition={{
                    duration: 2 + Math.random(),
                    delay: Math.random() * 0.5,
                    ease: 'easeOut'
                  }}
                  style={{
                    background: ['#FFD700', '#9b59b6', '#4ade80', '#3498db'][i % 4],
                    width: 10 + Math.random() * 10,
                    height: 10 + Math.random() * 10
                  }}
                />
              ))}
            </div>

            <motion.h2
              className="result-title"
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              🎉 GEWONNEN! 🎉
            </motion.h2>

            <motion.p
              className="result-subtitle"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Alle Paare in {gameResult.stats.moves} Zügen gefunden!
              <br />
              Zeit: {gameResult.stats.timeUsed} Sekunden
            </motion.p>

            <motion.div
              className="result-card"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
            >
              <div className="result-row">
                <span>Einsatz:</span>
                <span>{gameResult.xpBet} XP</span>
              </div>
              <div className="result-row">
                <span>Multiplikator:</span>
                <span>×{config.multiplier}</span>
              </div>
              <div className="result-divider" />
              <div className="result-row total">
                <span>GEWINN:</span>
                <motion.span
                  className="win-amount"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.3, 1] }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  +{gameResult.xpWon} XP ✨
                </motion.span>
              </div>
              {gameResult.goldWon > 0 && (
                <div className="result-row bonus">
                  <span>Perfekt-Bonus:</span>
                  <span className="gold-amount">+{gameResult.goldWon} 🪙</span>
                </div>
              )}
            </motion.div>

            <motion.div
              className="result-actions"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <motion.button
                className="action-btn secondary"
                onClick={handlePlayAgain}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                🔄 Nochmal
              </motion.button>
              <motion.button
                className="action-btn primary"
                onClick={handleFinish}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                ✅ Fertig
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {/* RESULT PHASE - LOST */}
        {gameState.status === 'lost' && gameResult && (
          <motion.div
            key="lost"
            className="game-result lost"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.h2
              className="result-title"
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              💔 VERLOREN 💔
            </motion.h2>

            <motion.p
              className="result-subtitle"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {gameState.lives <= 0 
                ? 'Keine Leben mehr übrig!'
                : 'Die Zeit ist abgelaufen!'
              }
            </motion.p>

            <motion.div
              className="result-card lost"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="result-row">
                <span>Einsatz verloren:</span>
                <span className="loss-amount">-{gameResult.xpBet} XP</span>
              </div>
              <div className="result-row">
                <span>Paare gefunden:</span>
                <span>{gameResult.stats.pairsFound}/{gameState.totalPairs}</span>
              </div>
              <div className="result-tip">
                💡 Tipp: Versuche es mit weniger Einsatz!
              </div>
            </motion.div>

            <motion.div
              className="result-actions"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.button
                className="action-btn secondary"
                onClick={handlePlayAgain}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                🔄 Nochmal
              </motion.button>
              <motion.button
                className="action-btn primary"
                onClick={handleFinish}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                ✅ Aufhören
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MemoryGame;
