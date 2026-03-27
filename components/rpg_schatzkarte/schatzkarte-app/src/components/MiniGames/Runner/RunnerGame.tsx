// ============================================
// BRICK BREAKER – MAIN COMPONENT
// Dateiname RunnerGame.tsx bleibt für App-Kompatibilität
// Props-Interface UNVERÄNDERT
// ============================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CustomAvatar } from '@/types/legacy-ui';
import { RunnerEngine, GameResult } from './RunnerEngine';
import { RunnerBettingPhase } from './RunnerBettingPhase';
import { RunnerSoundManager } from './RunnerSoundManager';
import './runner-game.css';

// === PROPS (DARF NICHT GEÄNDERT WERDEN) ===

interface RunnerGameProps {
  playerXP: number;
  playerGold?: number;
  playerAvatar: CustomAvatar;
  playerAgeGroup: 'grundschule' | 'unterstufe' | 'mittelstufe';
  onGameEnd: (result: GameResult) => void;
  onClose: () => void;
}

type Phase = 'betting' | 'playing' | 'result';

// ── RESULT SCREEN ────────────────────────────

const ResultScreen: React.FC<{
  result: GameResult;
  onPlayAgain: () => void;
  onClose: () => void;
}> = ({ result, onPlayAgain, onClose }) => {
  const { won, xpBet, xpWon, goldWon, distance, multiplier,
          coinsCollected, starsCollected, diamondsCollected } = result;

  return (
    <motion.div
      className="bb-result"
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', damping: 18 }}
    >
      {/* Confetti-like particles for win */}
      {won && (
        <div className="bb-result-sparkles" aria-hidden="true">
          {Array.from({ length: 16 }).map((_, i) => (
            <span key={i} className="bb-sparkle" style={{ '--i': i } as React.CSSProperties} />
          ))}
        </div>
      )}

      <div className={`bb-result-icon ${won ? 'won' : 'lost'}`}>
        {won ? '🏆' : '💀'}
      </div>

      <h2 className={`bb-result-title ${won ? 'won' : 'lost'}`}>
        {won ? 'Gewonnen!' : 'Verloren!'}
      </h2>

      {/* XP Result */}
      <div className={`bb-result-xp ${xpWon >= 0 ? 'positive' : 'negative'}`}>
        {xpWon >= 0 ? '+' : ''}{xpWon} XP
      </div>

      {/* Stats */}
      <div className="bb-result-stats">
        <div className="bb-stat-row">
          <span>Einsatz</span>
          <span className="bb-stat-val">{xpBet} XP</span>
        </div>
        <div className="bb-stat-row">
          <span>Bricks zerstört</span>
          <span className="bb-stat-val">{distance}</span>
        </div>
        <div className="bb-stat-row">
          <span>Multiplikator</span>
          <span className="bb-stat-val bb-stat-mult">×{multiplier.toFixed(1)}</span>
        </div>
        {goldWon > 0 && (
          <div className="bb-stat-row">
            <span>Gold</span>
            <span className="bb-stat-val bb-stat-gold">+{goldWon} 🪙</span>
          </div>
        )}
      </div>

      {/* Collectibles */}
      {(coinsCollected + starsCollected + diamondsCollected) > 0 && (
        <div className="bb-result-collectibles">
          {coinsCollected  > 0 && <span>🪙 ×{coinsCollected}</span>}
          {starsCollected  > 0 && <span>⭐ ×{starsCollected}</span>}
          {diamondsCollected > 0 && <span>💎 ×{diamondsCollected}</span>}
        </div>
      )}

      {!won && (
        <p className="bb-result-tip">
          💡 Tipp: {multiplier === 0
            ? 'Zerstöre mehr Bricks um deinen Einsatz zurückzubekommen!'
            : 'Nächstes Mal noch weiter kommen für höheren Multiplikator!'}
        </p>
      )}

      <div className="bb-result-buttons">
        <motion.button
          className="bb-btn bb-btn-secondary"
          onClick={onPlayAgain}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          🔁 Nochmal
        </motion.button>
        <motion.button
          className="bb-btn bb-btn-primary"
          onClick={onClose}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          ✅ Fertig
        </motion.button>
      </div>
    </motion.div>
  );
};

// ── HUD (ingame) ─────────────────────────────

const GameHUD: React.FC<{
  score: number;
  lives: number;
  maxLives: number;
  level: number;
  bricksDestroyed: number;
  ageGroup: 'grundschule' | 'unterstufe' | 'mittelstufe';
  isMuted: boolean;
  isPaused: boolean;
  onToggleMute: () => void;
  onTogglePause: () => void;
  onQuit: () => void;
}> = ({ score, lives, maxLives, level, bricksDestroyed, ageGroup, isMuted, isPaused, onToggleMute, onTogglePause, onQuit }) => {

  const DIFFICULTY_CONFIGS = {
    grundschule: { brickMultipliers: { 10:1.0,20:1.5,35:2.0,48:3.0 } },
    unterstufe:  { brickMultipliers: { 12:1.0,24:1.5,42:2.0,56:3.0 } },
    mittelstufe: { brickMultipliers: { 15:1.0,30:1.5,50:2.0,65:3.0 } },
  };

  const thresholds = Object.keys(DIFFICULTY_CONFIGS[ageGroup].brickMultipliers).map(Number).sort((a,b)=>a-b);
  const nextThreshold = thresholds.find(t => bricksDestroyed < t);
  const pct = nextThreshold
    ? (bricksDestroyed / nextThreshold) * 100
    : 100;

  return (
    <div className="bb-hud">
      <div className="bb-hud-left">
        <div className="bb-hud-score">{score.toLocaleString()}</div>
        <div className="bb-hud-label">SCORE</div>
      </div>

      <div className="bb-hud-center">
        <div className="bb-hud-progress-bar">
          <div className="bb-hud-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        {nextThreshold && (
          <div className="bb-hud-progress-label">
            {bricksDestroyed}/{nextThreshold} Bricks
          </div>
        )}
        <div className="bb-hud-level">LVL {level}</div>
      </div>

      <div className="bb-hud-right">
        <div className="bb-hud-lives">
          {Array.from({ length: maxLives }).map((_, i) => (
            <span key={i} className={i < lives ? 'bb-life-full' : 'bb-life-empty'}>
              {i < lives ? '❤️' : '🖤'}
            </span>
          ))}
        </div>
        <div className="bb-hud-controls">
          <button className="bb-hud-btn" onClick={onToggleMute} title={isMuted ? 'Ton an' : 'Ton aus'}>
            {isMuted ? '🔇' : '🔊'}
          </button>
          <button className="bb-hud-btn" onClick={onTogglePause} title="Pause">
            {isPaused ? '▶' : '⏸'}
          </button>
          <button className="bb-hud-btn bb-hud-quit" onClick={onQuit} title="Beenden">✕</button>
        </div>
      </div>
    </div>
  );
};

// ── TOUCH CONTROLS ───────────────────────────

const TouchControls: React.FC<{
  onLeft: () => void;
  onRight: () => void;
  onStop: () => void;
}> = ({ onLeft, onRight, onStop }) => (
  <div className="bb-touch-controls">
    <button
      className="bb-touch-btn"
      onTouchStart={onLeft}
      onTouchEnd={onStop}
      onMouseDown={onLeft}
      onMouseUp={onStop}
      aria-label="Links"
    >◀</button>
    <button
      className="bb-touch-btn"
      onTouchStart={onRight}
      onTouchEnd={onStop}
      onMouseDown={onRight}
      onMouseUp={onStop}
      aria-label="Rechts"
    >▶</button>
  </div>
);

// ── MAIN COMPONENT ───────────────────────────

export const RunnerGame: React.FC<RunnerGameProps> = ({
  playerXP,
  playerGold = 0,
  playerAvatar,
  playerAgeGroup,
  onGameEnd,
  onClose,
}) => {
  const [phase, setPhase]         = useState<Phase>('betting');
  const [betAmount, setBetAmount] = useState(0);
  const [result, setResult]       = useState<GameResult | null>(null);
  const [score, setScore]         = useState(0);
  const [lives, setLives]         = useState(3);
  const [level, setLevel]         = useState(1);
  const [bricksDestroyed, setBD]  = useState(0);
  const [isMuted, setMuted]       = useState(false);
  const [isPaused, setPausedUI]   = useState(false);
  const [isMobile, setMobile]     = useState(false);

  const canvasRef  = useRef<HTMLCanvasElement | null>(null);
  const engineRef  = useRef<RunnerEngine | null>(null);
  const soundRef   = useRef<RunnerSoundManager>(new RunnerSoundManager());
  const betRef     = useRef(0);    // Stabile Referenz fuer Callback-Ref

  // Detect touch device
  useEffect(() => {
    setMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Start game after bet
  const handleStartGame = useCallback(async (bet: number) => {
    setBetAmount(bet);
    betRef.current = bet;
    setPhase('playing');
    setScore(0);
    setLives(DIFFICULTY_CONFIGS_LIVES[playerAgeGroup]);
    setLevel(1);
    setBD(0);
    setPausedUI(false);
    await soundRef.current.initialize();
  }, [playerAgeGroup]);

  // Callback-Ref: wird aufgerufen wenn Canvas tatsaechlich im DOM ist
  // (umgeht das AnimatePresence mode="wait" Timing-Problem)
  const canvasCallbackRef = useCallback((canvas: HTMLCanvasElement | null) => {
    canvasRef.current = canvas;

    // Cleanup alter Engine
    if (engineRef.current) {
      engineRef.current.destroy();
      engineRef.current = null;
    }

    if (!canvas) return;

    // 1 Frame warten damit Flex-Layout berechnet ist
    requestAnimationFrame(() => {
      if (!canvasRef.current) return;

      const handleResult = (r: GameResult) => {
        setResult(r);
        setPhase('result');
        soundRef.current.play(r.won ? 'victory' : 'gameOver');
      };

      const engine = new RunnerEngine(
        canvasRef.current,
        playerAgeGroup,
        betRef.current,
        handleResult,
        (l) => setLives(l),
        (s) => { setScore(s); setBD(prev => prev + 1); },
        (lv) => setLevel(lv),
      );
      engineRef.current = engine;
      engine.start();
      soundRef.current.play('start');
    });
  }, [playerAgeGroup]);

  // Sync mute
  useEffect(() => {
    soundRef.current.setMuted(isMuted);
  }, [isMuted]);

  const handleTogglePause = () => {
    const next = !isPaused;
    setPausedUI(next);
    engineRef.current?.setPaused(next);
  };

  const handleQuit = () => {
    engineRef.current?.destroy();
    engineRef.current = null;
    onClose();
  };

  const handlePlayAgain = () => {
    setResult(null);
    setPhase('betting');
  };

  const handleFinish = () => {
    if (result) {
      onGameEnd(result);
    }
    onClose();
  };

  return (
    <div className="bb-game-modal">
      <AnimatePresence mode="wait">

        {/* ── BETTING PHASE ── */}
        {phase === 'betting' && (
          <motion.div
            key="betting"
            className="bb-phase-wrap"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <RunnerBettingPhase
              playerXP={playerXP}
              ageGroup={playerAgeGroup}
              onStartGame={handleStartGame}
              onClose={onClose}
            />
          </motion.div>
        )}

        {/* ── PLAYING PHASE ── */}
        {phase === 'playing' && (
          <motion.div
            key="playing"
            className="bb-phase-wrap bb-game-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GameHUD
              score={score}
              lives={lives}
              maxLives={DIFFICULTY_CONFIGS_LIVES[playerAgeGroup]}
              level={level}
              bricksDestroyed={bricksDestroyed}
              ageGroup={playerAgeGroup}
              isMuted={isMuted}
              isPaused={isPaused}
              onToggleMute={() => setMuted(m => !m)}
              onTogglePause={handleTogglePause}
              onQuit={handleQuit}
            />

            <div className="bb-canvas-wrap">
              <canvas
                ref={canvasCallbackRef}
                className="bb-canvas"
                style={{ width: '100%', height: '100%', display: 'block' }}
              />
              {isPaused && (
                <div className="bb-pause-overlay">
                  <div className="bb-pause-text">⏸ PAUSE</div>
                  <button
                    className="bb-btn bb-btn-primary"
                    onClick={handleTogglePause}
                  >▶ Weiter</button>
                </div>
              )}
            </div>

            {isMobile && (
              <TouchControls
                onLeft={() => engineRef.current?.handleTouchLeft()}
                onRight={() => engineRef.current?.handleTouchRight()}
                onStop={() => engineRef.current?.handleTouchStop()}
              />
            )}
          </motion.div>
        )}

        {/* ── RESULT PHASE ── */}
        {phase === 'result' && result && (
          <motion.div
            key="result"
            className="bb-phase-wrap bb-result-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ResultScreen
              result={result}
              onPlayAgain={handlePlayAgain}
              onClose={handleFinish}
            />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

// Lives per age group (also used in HUD without importing full config)
const DIFFICULTY_CONFIGS_LIVES: Record<string, number> = {
  grundschule: 5,
  unterstufe:  3,
  mittelstufe: 2,
};

export default RunnerGame;
