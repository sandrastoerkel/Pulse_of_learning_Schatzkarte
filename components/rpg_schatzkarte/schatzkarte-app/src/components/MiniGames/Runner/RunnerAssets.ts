// ============================================
// BRICK BREAKER – ASSETS & CONFIG
// Ersetzt RunnerAssets.ts – Dateiname bleibt für App-Kompatibilität
// ============================================

// === ALTERSSTUFEN ===

export type AgeGroup = 'grundschule' | 'unterstufe' | 'mittelstufe';

// === SCHWIERIGKEITS-KONFIGURATION ===

export interface DifficultyConfig {
  startLives: number;
  ballSpeed: number;          // Basis-Ballgeschwindigkeit px/frame
  paddleWidth: number;        // Paddle-Breite in px (von Canvas-Breite)
  paddleWidthPct: number;     // als Prozent (0–1) für responsive
  brickRows: number;
  brickHpMax: number;         // Max HP einer Brick (obere Reihen)
  powerUpRate: number;        // 0–1 Wahrscheinlichkeit PowerUp aus Brick
  ballSpeedIncrement: number; // Pro Level
  // Distanz-Äquivalent: Anzahl zerstörter Bricks → Multiplikator
  brickMultipliers: Record<number, number>;
}

export const DIFFICULTY_CONFIGS: Record<AgeGroup, DifficultyConfig> = {
  grundschule: {
    startLives: 5,
    ballSpeed: 4.5,
    paddleWidth: 110,
    paddleWidthPct: 0.28,
    brickRows: 5,
    brickHpMax: 1,
    powerUpRate: 0.18,
    ballSpeedIncrement: 0.25,
    brickMultipliers: {
      10:  1.0,
      20:  1.5,
      35:  2.0,
      48:  3.0,
    },
  },
  unterstufe: {
    startLives: 3,
    ballSpeed: 5.5,
    paddleWidth: 90,
    paddleWidthPct: 0.23,
    brickRows: 6,
    brickHpMax: 2,
    powerUpRate: 0.12,
    ballSpeedIncrement: 0.35,
    brickMultipliers: {
      12:  1.0,
      24:  1.5,
      42:  2.0,
      56:  3.0,
    },
  },
  mittelstufe: {
    startLives: 2,
    ballSpeed: 6.5,
    paddleWidth: 75,
    paddleWidthPct: 0.19,
    brickRows: 7,
    brickHpMax: 3,
    powerUpRate: 0.08,
    ballSpeedIncrement: 0.5,
    brickMultipliers: {
      15:  1.0,
      30:  1.5,
      50:  2.0,
      65:  3.0,
    },
  },
};

// === BRICK-REIHEN KONFIGURATION ===

export interface BrickRowConfig {
  color: string;
  glowColor: string;
  basePoints: number;
  emoji: string;       // Dekorativ auf der Brick
}

// 7 mögliche Reihen – je nach Schwierigkeit werden die oberen genutzt
export const BRICK_ROW_CONFIGS: BrickRowConfig[] = [
  { color: '#c084fc', glowColor: 'rgba(192,132,252,.7)', basePoints: 50, emoji: '💎' },
  { color: '#f87171', glowColor: 'rgba(248,113,113,.7)', basePoints: 40, emoji: '❤️' },
  { color: '#fb923c', glowColor: 'rgba(251,146,60,.7)',  basePoints: 30, emoji: '🔥' },
  { color: '#fbbf24', glowColor: 'rgba(251,191,36,.7)',  basePoints: 25, emoji: '⭐' },
  { color: '#4ade80', glowColor: 'rgba(74,222,128,.7)',  basePoints: 20, emoji: '🌿' },
  { color: '#22d3ee', glowColor: 'rgba(34,211,238,.7)',  basePoints: 15, emoji: '💧' },
  { color: '#818cf8', glowColor: 'rgba(129,140,248,.7)', basePoints: 10, emoji: '🌀' },
];

// === POWER-UP TYPEN ===

export type PowerUpType = 'wide' | 'multiball' | 'laser' | 'slow' | 'fireball';

export interface PowerUpDefinition {
  type: PowerUpType;
  emoji: string;
  color: string;
  label: string;
  duration: number;   // Frames (60 = 1s)
  spawnWeight: number;
}

export const POWERUP_DEFINITIONS: Record<PowerUpType, PowerUpDefinition> = {
  wide: {
    type: 'wide',
    emoji: '↔️',
    color: '#22d3ee',
    label: 'Breites Paddle',
    duration: 600,
    spawnWeight: 0.35,
  },
  multiball: {
    type: 'multiball',
    emoji: '⚡',
    color: '#fbbf24',
    label: 'Multi-Ball!',
    duration: 999,   // Bis Leben verloren
    spawnWeight: 0.20,
  },
  laser: {
    type: 'laser',
    emoji: '🔫',
    color: '#f87171',
    label: 'Laser!',
    duration: 480,
    spawnWeight: 0.20,
  },
  slow: {
    type: 'slow',
    emoji: '🐢',
    color: '#4ade80',
    label: 'Zeitlupe',
    duration: 360,
    spawnWeight: 0.15,
  },
  fireball: {
    type: 'fireball',
    emoji: '🔥',
    color: '#fb923c',
    label: 'Feuerball!',
    duration: 300,
    spawnWeight: 0.10,
  },
};

// === COLLECTIBLE-TYPEN ===

export type CollectibleType = 'coin' | 'star' | 'diamond' | 'heart';

export interface CollectibleDefinition {
  type: CollectibleType;
  emoji: string;
  color: string;
  glowColor: string;
  size: number;
  value: { gold?: number; xp?: number; lives?: number };
  spawnWeight: number;
}

export const COLLECTIBLE_DEFINITIONS: Record<CollectibleType, CollectibleDefinition> = {
  coin:    { type:'coin',    emoji:'🪙', color:'#fbbf24', glowColor:'rgba(251,191,36,.6)',   size:24, value:{gold:10},   spawnWeight:0.55 },
  star:    { type:'star',    emoji:'⭐', color:'#fde68a', glowColor:'rgba(253,230,138,.6)',  size:26, value:{xp:15},    spawnWeight:0.25 },
  diamond: { type:'diamond', emoji:'💎', color:'#60a5fa', glowColor:'rgba(96,165,250,.6)',   size:28, value:{gold:100}, spawnWeight:0.08 },
  heart:   { type:'heart',   emoji:'❤️', color:'#f87171', glowColor:'rgba(248,113,113,.6)',  size:26, value:{lives:1},  spawnWeight:0.05 },
};

// === SOUND-DEFINITIONEN (bleiben für SoundManager-Kompatibilität) ===

export type SoundType =
  | 'bounce_wall' | 'bounce_paddle' | 'brick_hit' | 'brick_break'
  | 'powerup' | 'coin' | 'star' | 'diamond' | 'heart'
  | 'levelup' | 'gameOver' | 'victory' | 'countdown' | 'start';

export interface SoundDefinition {
  id: SoundType;
  frequency?: number;
  duration?: number;
  type?: OscillatorType;
  volume: number;
  notes?: Array<{ frequency: number; duration: number; delay: number }>;
}

export const SOUND_DEFINITIONS: Record<SoundType, SoundDefinition> = {
  bounce_wall: {
    id: 'bounce_wall', type:'square', frequency:220, duration:.06, volume:.15
  },
  bounce_paddle: {
    id: 'bounce_paddle', volume:.25,
    notes: [
      {frequency:330, duration:.06, delay:0},
      {frequency:440, duration:.08, delay:.05},
    ]
  },
  brick_hit: {
    id: 'brick_hit', type:'sine', frequency:300, duration:.07, volume:.2
  },
  brick_break: {
    id: 'brick_break', volume:.3,
    notes: [
      {frequency:440, duration:.07, delay:0},
      {frequency:554, duration:.07, delay:.06},
      {frequency:659, duration:.12, delay:.12},
    ]
  },
  powerup: {
    id: 'powerup', volume:.45,
    notes: [
      {frequency:523, duration:.1, delay:0},
      {frequency:659, duration:.1, delay:.08},
      {frequency:784, duration:.1, delay:.16},
      {frequency:1047,duration:.2, delay:.24},
    ]
  },
  coin:    { id:'coin',    volume:.3, notes:[{frequency:987,duration:.08,delay:0},{frequency:1319,duration:.12,delay:.08}] },
  star:    { id:'star',    volume:.35,notes:[{frequency:659,duration:.08,delay:0},{frequency:784,duration:.08,delay:.07},{frequency:1047,duration:.15,delay:.14}] },
  diamond: { id:'diamond', volume:.4, notes:[{frequency:880,duration:.1,delay:0},{frequency:1108,duration:.1,delay:.09},{frequency:1318,duration:.1,delay:.18},{frequency:1760,duration:.25,delay:.27}] },
  heart:   { id:'heart',   volume:.4, notes:[{frequency:392,duration:.1,delay:0},{frequency:523,duration:.1,delay:.1},{frequency:659,duration:.18,delay:.2}] },
  levelup: {
    id:'levelup', volume:.5,
    notes:[
      {frequency:523, duration:.12,delay:0},
      {frequency:659, duration:.12,delay:.1},
      {frequency:784, duration:.12,delay:.2},
      {frequency:1047,duration:.25,delay:.3},
    ]
  },
  gameOver: {
    id:'gameOver', volume:.4,
    notes:[
      {frequency:392, duration:.25,delay:0},
      {frequency:349, duration:.25,delay:.22},
      {frequency:330, duration:.25,delay:.44},
      {frequency:262, duration:.4, delay:.66},
    ]
  },
  victory: {
    id:'victory', volume:.5,
    notes:[
      {frequency:523, duration:.12,delay:0},
      {frequency:659, duration:.12,delay:.1},
      {frequency:784, duration:.12,delay:.2},
      {frequency:1047,duration:.12,delay:.3},
      {frequency:784, duration:.12,delay:.4},
      {frequency:1047,duration:.35,delay:.5},
    ]
  },
  countdown: { id:'countdown', type:'sine', frequency:440, duration:.15, volume:.25 },
  start:     { id:'start', volume:.35, notes:[{frequency:523,duration:.08,delay:0},{frequency:659,duration:.08,delay:.07},{frequency:784,duration:.18,delay:.14}] },
};

// === CANVAS-KONFIGURATION ===

export interface CanvasConfig {
  designWidth: number;    // Referenzbreite für Skalierung
  designHeight: number;
  brickCols: number;
  brickGap: number;
  brickPadH: number;      // Horizontaler Rand
  brickTopOffset: number; // Abstand von oben bis zur ersten Brick-Reihe
  brickHeight: number;
  paddleY: number;        // Paddle Y als Anteil der Höhe (0–1)
  ballRadius: number;
}

export const CANVAS_CONFIG: CanvasConfig = {
  designWidth: 420,
  designHeight: 640,
  brickCols: 8,
  brickGap: 5,
  brickPadH: 14,
  brickTopOffset: 72,
  brickHeight: 20,
  paddleY: 0.91,
  ballRadius: 8,
};

// === EINSATZ-OPTIONEN ===

export interface BetOption {
  amount: number;
  label: string;
  isAllIn?: boolean;
}

export const BET_OPTIONS: BetOption[] = [
  { amount: 25,  label: '25 XP'  },
  { amount: 50,  label: '50 XP'  },
  { amount: 100, label: '100 XP' },
  { amount: -1,  label: 'All-In! 🎰', isAllIn: true },
];

// === HELPER FUNKTIONEN ===

/**
 * Multiplikator basierend auf zerstörten Bricks (analog zu Distanz beim Runner)
 */
export function calculateMultiplier(bricksDestroyed: number, ageGroup: AgeGroup): number {
  const config = DIFFICULTY_CONFIGS[ageGroup];
  const thresholds = Object.keys(config.brickMultipliers)
    .map(Number)
    .sort((a, b) => b - a);
  for (const t of thresholds) {
    if (bricksDestroyed >= t) return config.brickMultipliers[t];
  }
  return 0;
}

/**
 * Nächster Meilenstein (analog zu getNextMilestone beim Runner)
 */
export function getNextMilestone(bricksDestroyed: number, ageGroup: AgeGroup): number | null {
  const config = DIFFICULTY_CONFIGS[ageGroup];
  const thresholds = Object.keys(config.brickMultipliers)
    .map(Number)
    .sort((a, b) => a - b);
  for (const t of thresholds) {
    if (bricksDestroyed < t) return t;
  }
  return null;
}

/**
 * Zufälliger PowerUp-Typ nach Gewichtung
 */
export function getRandomPowerUpType(): PowerUpType {
  const defs = Object.values(POWERUP_DEFINITIONS);
  const total = defs.reduce((s, d) => s + d.spawnWeight, 0);
  let r = Math.random() * total;
  for (const d of defs) {
    r -= d.spawnWeight;
    if (r <= 0) return d.type;
  }
  return 'wide';
}
