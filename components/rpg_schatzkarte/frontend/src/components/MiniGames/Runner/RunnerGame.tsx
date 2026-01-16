// ============================================
// RUNNER GAME - HAUPTKOMPONENTE
// Verbindet alle Teile des Spiels
// ============================================

import React, { 
  useState, 
  useEffect, 
  useRef, 
  useCallback 
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Eigene Imports
import { AgeGroup, DIFFICULTY_CONFIGS } from './RunnerAssets';
import {
  GameState,
  GameResult,
  RunnerEngine
} from './RunnerEngine';
import { 
  AvatarSprites, 
  createAvatarSprites 
} from './RunnerAvatarRenderer';
import { 
  getSoundManager, 
  initializeSound 
} from './RunnerSoundManager';
import { RunnerBettingPhase } from './RunnerBettingPhase';
import type { CustomAvatar } from '../../../types';

// Styles
import './runner-game.css';

// === PROPS ===

interface RunnerGameProps {
  playerXP: number;
  playerGold: number;
  playerAvatar: CustomAvatar;
  playerAgeGroup: AgeGroup;
  onGameEnd: (result: GameResult) => void;
  onClose: () => void;
}

// === GAME PHASES ===

type GamePhase = 'betting' | 'loading' | 'playing' | 'result';

// === KOMPONENTE ===

export const RunnerGame: React.FC<RunnerGameProps> = ({
  playerXP,
  playerGold,
  playerAvatar,
  playerAgeGroup,
  onGameEnd,
  onClose
}) => {
  // === STATE ===
  const [phase, setPhase] = useState<GamePhase>('betting');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [avatarSprites, setAvatarSprites] = useState<AvatarSprites | null>(null);
  const [betAmount, setBetAmount] = useState<number>(0);
  const [canvasReady, setCanvasReady] = useState(false);

  // === DERIVED VALUES ===
  const config = DIFFICULTY_CONFIGS[playerAgeGroup];

  // === REFS ===
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<RunnerEngine | null>(null);
  const soundManager = getSoundManager();

  // Callback ref für Canvas - wird aufgerufen wenn Canvas ins DOM eingefügt wird
  const canvasCallbackRef = useCallback((node: HTMLCanvasElement | null) => {
    console.log('[RunnerGame] Canvas callback ref called:', !!node);
    if (node) {
      (canvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current = node;
      setCanvasReady(true);
    } else {
      setCanvasReady(false);
    }
  }, []);

  // === AVATAR SPRITES LADEN ===
  useEffect(() => {
    console.log('[RunnerGame] Loading avatar sprites...');
    const loadSprites = async () => {
      try {
        const sprites = await createAvatarSprites(playerAvatar);
        console.log('[RunnerGame] Avatar sprites loaded successfully:', sprites);
        setAvatarSprites(sprites);
      } catch (error) {
        console.error('[RunnerGame] Failed to load avatar sprites:', error);
      }
    };
    loadSprites();
  }, [playerAvatar]);

  // === KEYBOARD CONTROLS ===
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!engineRef.current || phase !== 'playing') return;

      switch (e.code) {
        case 'Space':
        case 'ArrowUp':
        case 'KeyW':
          e.preventDefault();
          engineRef.current.jump();
          break;
        case 'ArrowDown':
        case 'KeyS':
          e.preventDefault();
          engineRef.current.duck();
          break;
        case 'Escape':
        case 'KeyP':
          e.preventDefault();
          if (gameState?.status === 'playing') {
            engineRef.current.pause();
          } else if (gameState?.status === 'paused') {
            engineRef.current.resume();
          }
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!engineRef.current || phase !== 'playing') return;

      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        engineRef.current.stopDuck();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [phase, gameState?.status]);

  // === TOUCH CONTROLS ===
  const handleJump = useCallback(() => {
    if (engineRef.current && phase === 'playing') {
      engineRef.current.jump();
    }
  }, [phase]);

  const handleDuckStart = useCallback(() => {
    if (engineRef.current && phase === 'playing') {
      engineRef.current.duck();
    }
  }, [phase]);

  const handleDuckEnd = useCallback(() => {
    if (engineRef.current && phase === 'playing') {
      engineRef.current.stopDuck();
    }
  }, [phase]);

  // Canvas Touch
  const handleCanvasTouch = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    handleJump();
  }, [handleJump]);

  // === GAME START ===
  const handleStartGame = useCallback(async (bet: number) => {
    // Sprites müssen geladen sein
    if (!avatarSprites) {
      console.warn('Avatar sprites not loaded yet');
      return;
    }

    setBetAmount(bet);
    // Erst zu 'playing' wechseln damit das Canvas gerendert wird
    setPhase('playing');
  }, [avatarSprites]);

  // === ENGINE INITIALISIERUNG (nach Canvas-Render) ===
  useEffect(() => {
    console.log('[RunnerGame] useEffect triggered:', {
      phase,
      canvasReady,
      hasCanvas: !!canvasRef.current,
      hasAvatarSprites: !!avatarSprites,
      hasEngine: !!engineRef.current
    });

    // Nur initialisieren wenn phase='playing', canvas ready, sprites geladen und Engine noch nicht erstellt
    if (phase !== 'playing' || !canvasReady || !canvasRef.current || !avatarSprites || engineRef.current) {
      console.log('[RunnerGame] Skipping init - conditions not met');
      return;
    }

    console.log('[RunnerGame] All conditions met! Starting game initialization...');

    const initGame = async () => {
      try {
        // Sound initialisieren
        console.log('[RunnerGame] Initializing sound...');
        await initializeSound();
        console.log('[RunnerGame] Sound initialized');

        // Canvas sollte jetzt definitiv existieren
        if (!canvasRef.current) {
          console.error('[RunnerGame] Canvas unexpectedly null!');
          return;
        }
        console.log('[RunnerGame] Canvas confirmed:', canvasRef.current);

        // Engine erstellen
        console.log('[RunnerGame] Creating RunnerEngine...');
        const engine = new RunnerEngine(
          canvasRef.current,
          avatarSprites,
          playerAgeGroup,
          betAmount
        );
        console.log('[RunnerGame] RunnerEngine created');

        // Callbacks setzen
        engine.setCallbacks(
          (state) => {
            setGameState(state);
          },
          (result) => {
            console.log('[RunnerGame] Game ended:', result);
            setGameResult(result);
            setPhase('result');
          }
        );

        engineRef.current = engine;

        // Countdown starten
        console.log('[RunnerGame] Starting countdown...');
        setCountdown(3);
        const countdownInterval = setInterval(() => {
          setCountdown(prev => {
            if (prev === null || prev <= 1) {
              clearInterval(countdownInterval);
              return null;
            }
            return prev - 1;
          });
        }, 1000);

        // Spiel starten
        console.log('[RunnerGame] Calling engine.start()...');
        engine.start();
        console.log('[RunnerGame] engine.start() called');
      } catch (error) {
        console.error('[RunnerGame] Error during init:', error);
      }
    };

    initGame();
  }, [phase, canvasReady, avatarSprites, playerAgeGroup, betAmount]);

  // === PAUSE/RESUME ===
  const handlePause = useCallback(() => {
    if (engineRef.current && gameState?.status === 'playing') {
      engineRef.current.pause();
    }
  }, [gameState?.status]);

  const handleResume = useCallback(() => {
    if (engineRef.current && gameState?.status === 'paused') {
      engineRef.current.resume();
    }
  }, [gameState?.status]);

  // === SOUND TOGGLE ===
  const handleToggleSound = useCallback(() => {
    const newMuted = soundManager.toggleMute();
    setIsMuted(newMuted);
  }, [soundManager]);

  // === QUIT GAME ===
  const handleQuit = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.destroy();
      engineRef.current = null;
    }
    onClose();
  }, [onClose]);

  // === PLAY AGAIN ===
  const handlePlayAgain = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.destroy();
      engineRef.current = null;
    }
    setGameState(null);
    setGameResult(null);
    setCanvasReady(false);
    setPhase('betting');
  }, []);

  // === FINISH (Ergebnis speichern und schließen) ===
  const handleFinish = useCallback(() => {
    if (gameResult) {
      onGameEnd(gameResult);
    }
    handleQuit();
  }, [gameResult, onGameEnd, handleQuit]);

  // === CLEANUP ===
  useEffect(() => {
    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
      }
    };
  }, []);

  // === RENDER HELPERS ===

  const renderLives = () => {
    if (!gameState) return null;
    
    const hearts = [];
    for (let i = 0; i < gameState.maxLives; i++) {
      const isFilled = i < gameState.lives;
      hearts.push(
        <span 
          key={i} 
          className={`heart ${isFilled ? '' : 'empty'}`}
        >
          ❤️
        </span>
      );
    }
    return hearts;
  };

  const calculateProgress = () => {
    if (!gameState || !gameState.nextMilestone) return 100;
    
    const milestones = Object.keys(
      DIFFICULTY_CONFIGS[playerAgeGroup].distanceMultipliers
    ).map(Number).sort((a, b) => a - b);
    
    const currentMilestoneIndex = milestones.findIndex(m => m === gameState.nextMilestone);
    const prevMilestone = currentMilestoneIndex > 0 ? milestones[currentMilestoneIndex - 1] : 0;
    
    const progressInSegment = gameState.distance - prevMilestone;
    const segmentLength = gameState.nextMilestone - prevMilestone;
    
    return Math.min((progressInSegment / segmentLength) * 100, 100);
  };

  // === RENDER ===

  return (
    <div className="runner-game-container">
      <AnimatePresence mode="wait">
        {/* BETTING PHASE */}
        {phase === 'betting' && (
          <motion.div
            key="betting"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <RunnerBettingPhase
              playerXP={playerXP}
              ageGroup={playerAgeGroup}
              onStartGame={handleStartGame}
              onClose={onClose}
            />
          </motion.div>
        )}

        {/* LOADING PHASE */}
        {phase === 'loading' && (
          <motion.div
            key="loading"
            className="loading-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="loading-spinner">🏃</div>
            <p>Spiel wird geladen...</p>
          </motion.div>
        )}

        {/* PLAYING PHASE */}
        {(phase === 'playing' || phase === 'result') && (
          <motion.div
            key="playing"
            className="runner-game-wrapper"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Game Header */}
            <div className="game-header">
              <div className="game-stats">
                {/* Distanz */}
                <div className="stat-item">
                  <span className="stat-icon">📏</span>
                  <span className="stat-value distance">
                    {gameState?.distance || 0}m
                  </span>
                </div>

                {/* Einsatz */}
                <div className="stat-item">
                  <span className="stat-icon">⭐</span>
                  <span className="stat-value">
                    {betAmount} XP
                  </span>
                </div>

                {/* Leben */}
                <div className="stat-item lives-display">
                  {renderLives()}
                </div>
              </div>

              <div className="game-controls">
                <button
                  className={`control-button ${isMuted ? 'muted' : ''}`}
                  onClick={handleToggleSound}
                  title={isMuted ? 'Ton an' : 'Ton aus'}
                >
                  {isMuted ? '🔇' : '🔊'}
                </button>
                <button
                  className="control-button"
                  onClick={handlePause}
                  title="Pause"
                >
                  ⏸️
                </button>
              </div>
            </div>

            {/* Canvas Container */}
            <div className="canvas-container">
              <canvas
                ref={canvasCallbackRef}
                className="runner-canvas"
                onTouchStart={handleCanvasTouch}
              />

              {/* Countdown Overlay */}
              <AnimatePresence>
                {countdown !== null && (
                  <motion.div
                    className="countdown-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div
                      key={countdown}
                      className={countdown > 0 ? 'countdown-number' : 'countdown-go'}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {countdown > 0 ? countdown : 'LOS!'}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pause Overlay */}
              <AnimatePresence>
                {gameState?.status === 'paused' && (
                  <motion.div
                    className="pause-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="pause-title">
                      <span>⏸️</span>
                      <span>Pause</span>
                    </div>
                    <div className="pause-buttons">
                      <button 
                        className="pause-button resume"
                        onClick={handleResume}
                      >
                        ▶️ Weiterspielen
                      </button>
                      <button 
                        className="pause-button quit"
                        onClick={handleQuit}
                      >
                        🚪 Beenden
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* Controls Legend - immer sichtbar */}
            <div className="controls-legend">
              <div className="control-hint">
                <span className="key">⬆️</span>
                <span>Springen</span>
              </div>
              <div className="control-hint">
                <span className="key">⬇️</span>
                <span>Ducken</span>
              </div>
            </div>

            {/* Game Footer */}
            <div className="game-footer">
              <div className="collected-items">
                <div className="collected-item">
                  <span className="icon">🪙</span>
                  <span>{gameState?.goldEarned || 0}</span>
                </div>
                <div className="collected-item">
                  <span className="icon">⭐</span>
                  <span>+{gameState?.xpEarned || 0}</span>
                </div>
                {(gameState?.diamondsCollected || 0) > 0 && (
                  <div className="collected-item">
                    <span className="icon">💎</span>
                    <span>{gameState?.diamondsCollected}</span>
                  </div>
                )}
              </div>

              <div className="milestone-progress">
                {gameState?.currentMultiplier !== undefined && gameState.currentMultiplier > 0 && (
                  <span className="multiplier-badge">
                    ×{gameState.currentMultiplier.toFixed(1)}
                  </span>
                )}
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${calculateProgress()}%` }}
                  />
                </div>
                {gameState?.nextMilestone && (
                  <span className="next-milestone">
                    Nächstes Ziel: {gameState.nextMilestone}m
                  </span>
                )}
              </div>
            </div>

            {/* Touch Controls (nur auf Touch-Geräten sichtbar) */}
            <div className="touch-controls">
              <button 
                className="touch-button jump"
                onTouchStart={handleJump}
              >
                ⬆️ Springen
              </button>
              <button 
                className="touch-button duck"
                onTouchStart={handleDuckStart}
                onTouchEnd={handleDuckEnd}
              >
                ⬇️ Ducken
              </button>
            </div>
          </motion.div>
        )}

        {/* Result Overlay - außerhalb des Canvas Containers für korrektes Layout */}
        {phase === 'result' && gameResult && (
          <motion.div
            className="result-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="result-content"
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <h2 className={`result-title ${gameResult.won ? 'won' : 'lost'}`}>
                {gameResult.won ? '🎉 Geschafft!' : '💥 Game Over!'}
              </h2>

              <p className="result-distance">
                Du bist {gameResult.distance}m gelaufen
              </p>

              <div className="result-stats">
                {/* Einsatz */}
                <div className="result-stat">
                  <span className="label">Einsatz</span>
                  <span className="value">{gameResult.xpBet} XP</span>
                </div>

                {/* Multiplikator */}
                <div className="result-stat">
                  <span className="label">Multiplikator</span>
                  <span className="value">
                    {gameResult.multiplier > 0
                      ? `×${gameResult.multiplier.toFixed(1)}`
                      : '×0'
                    }
                  </span>
                </div>

                {/* Gesammelte Items */}
                {gameResult.coinsCollected > 0 && (
                  <div className="result-stat">
                    <span className="label">🪙 Münzen</span>
                    <span className="value positive">
                      +{gameResult.coinsCollected * 10} Gold
                    </span>
                  </div>
                )}

                {gameResult.diamondsCollected > 0 && (
                  <div className="result-stat">
                    <span className="label">💎 Diamanten</span>
                    <span className="value positive">
                      +{gameResult.diamondsCollected * 100} Gold
                    </span>
                  </div>
                )}

                {gameResult.starsCollected > 0 && (
                  <div className="result-stat">
                    <span className="label">⭐ Sterne</span>
                    <span className="value positive">
                      +{gameResult.starsCollected * 25} XP
                    </span>
                  </div>
                )}

                {/* Gesamt */}
                <div className="result-stat result-total">
                  <span className="label">XP Gewinn</span>
                  <span className={`value ${gameResult.xpWon >= 0 ? 'positive' : 'negative'}`}>
                    {gameResult.xpWon >= 0 ? '+' : ''}{gameResult.xpWon} XP
                  </span>
                </div>

                <div className="result-stat result-total">
                  <span className="label">Gold Gewinn</span>
                  <span className="value positive">
                    +{gameResult.goldWon} Gold
                  </span>
                </div>
              </div>

              <div className="result-buttons">
                <button
                  className="result-button primary"
                  onClick={handlePlayAgain}
                >
                  🔄 Nochmal spielen
                </button>
                <button
                  className="result-button secondary"
                  onClick={handleFinish}
                >
                  ✓ Fertig
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RunnerGame;
