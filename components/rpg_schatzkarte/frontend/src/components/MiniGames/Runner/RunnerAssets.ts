// ============================================
// RUNNER GAME ASSETS
// Hindernisse, Collectibles, Hintergründe, Sounds
// ============================================

// === RARITY ===

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

// === ALTERSSTUFEN ===

export type AgeGroup = 'grundschule' | 'unterstufe' | 'mittelstufe';

// === SCHWIERIGKEITS-KONFIGURATION ===

export interface DifficultyConfig {
  // Geschwindigkeit
  initialSpeed: number;        // Pixel pro Frame
  maxSpeed: number;
  speedIncrement: number;      // Pro 100m
  
  // Leben
  startLives: number;
  maxLives: number;
  
  // Spawning
  minObstacleGap: number;      // Mindestabstand zwischen Hindernissen
  maxObstacleGap: number;
  collectibleDensity: number;  // 0-1, wie oft Collectibles spawnen
  heartSpawnRate: number;      // 0-1, Wahrscheinlichkeit für Herzen
  
  // Distanz-Multiplikatoren
  distanceMultipliers: Record<number, number>;
  
  // Timing
  reactionBuffer: number;      // Zusätzliche Pixel vor Hindernissen
}

export const DIFFICULTY_CONFIGS: Record<AgeGroup, DifficultyConfig> = {
  grundschule: {
    initialSpeed: 3,
    maxSpeed: 8,
    speedIncrement: 0.3,
    startLives: 5,
    maxLives: 7,
    minObstacleGap: 400,
    maxObstacleGap: 600,
    collectibleDensity: 0.7,
    heartSpawnRate: 0.08,
    distanceMultipliers: {
      50: 1.0,
      100: 1.5,
      200: 2.0,
      400: 3.0
    },
    reactionBuffer: 100
  },
  unterstufe: {
    initialSpeed: 4,
    maxSpeed: 12,
    speedIncrement: 0.4,
    startLives: 4,
    maxLives: 6,
    minObstacleGap: 300,
    maxObstacleGap: 500,
    collectibleDensity: 0.5,
    heartSpawnRate: 0.05,
    distanceMultipliers: {
      100: 1.0,
      250: 1.5,
      500: 2.0,
      1000: 3.0
    },
    reactionBuffer: 80
  },
  mittelstufe: {
    initialSpeed: 5,
    maxSpeed: 16,
    speedIncrement: 0.5,
    startLives: 3,
    maxLives: 5,
    minObstacleGap: 250,
    maxObstacleGap: 400,
    collectibleDensity: 0.4,
    heartSpawnRate: 0.03,
    distanceMultipliers: {
      150: 1.0,
      300: 1.5,
      600: 2.0,
      1200: 3.0
    },
    reactionBuffer: 60
  }
};

// === HINDERNIS-TYPEN ===

export type ObstacleType = 'rock' | 'cactus' | 'box' | 'beam' | 'gap' | 'monster' | 'bird';

export type AvoidMethod = 'jump' | 'duck' | 'both';

export interface ObstacleDefinition {
  type: ObstacleType;
  width: number;
  height: number;
  avoidBy: AvoidMethod;
  emoji: string;
  color: string;              // Fallback-Farbe
  spawnY: 'ground' | 'air';
  animated?: boolean;
  minDistance?: number;       // Ab welcher Distanz spawnt dieses Hindernis
  rarity: number;             // 0-1, je niedriger desto seltener
}

export const OBSTACLE_DEFINITIONS: Record<ObstacleType, ObstacleDefinition> = {
  rock: {
    type: 'rock',
    width: 45,
    height: 40,
    avoidBy: 'jump',
    emoji: '🪨',
    color: '#6B7280',
    spawnY: 'ground',
    minDistance: 0,
    rarity: 0.3
  },
  cactus: {
    type: 'cactus',
    width: 35,
    height: 65,
    avoidBy: 'jump',
    emoji: '🌵',
    color: '#22C55E',
    spawnY: 'ground',
    minDistance: 0,
    rarity: 0.25
  },
  box: {
    type: 'box',
    width: 50,
    height: 50,
    avoidBy: 'both',
    emoji: '📦',
    color: '#D97706',
    spawnY: 'ground',
    minDistance: 100,
    rarity: 0.2
  },
  beam: {
    type: 'beam',
    width: 90,
    height: 25,
    avoidBy: 'duck',
    emoji: '⚡',
    color: '#FBBF24',
    spawnY: 'air',
    minDistance: 150,
    rarity: 0.15
  },
  gap: {
    type: 'gap',
    width: 70,
    height: 150,
    avoidBy: 'jump',
    emoji: '🕳️',
    color: '#1F2937',
    spawnY: 'ground',
    minDistance: 200,
    rarity: 0.1
  },
  monster: {
    type: 'monster',
    width: 55,
    height: 55,
    avoidBy: 'jump',
    emoji: '👾',
    color: '#8B5CF6',
    spawnY: 'ground',
    animated: true,
    minDistance: 300,
    rarity: 0.1
  },
  bird: {
    type: 'bird',
    width: 45,
    height: 35,
    avoidBy: 'duck',
    emoji: '🦅',
    color: '#78350F',
    spawnY: 'air',
    animated: true,
    minDistance: 250,
    rarity: 0.1
  }
};

// === COLLECTIBLE-TYPEN ===

export type CollectibleType = 'coin' | 'star' | 'diamond' | 'heart';

export interface CollectibleDefinition {
  type: CollectibleType;
  emoji: string;
  color: string;
  glowColor: string;
  size: number;
  value: {
    gold?: number;
    xp?: number;
    lives?: number;
  };
  spawnWeight: number;        // Relative Spawn-Häufigkeit
  rarity: Rarity;
}

export const COLLECTIBLE_DEFINITIONS: Record<CollectibleType, CollectibleDefinition> = {
  coin: {
    type: 'coin',
    emoji: '🪙',
    color: '#FFD700',
    glowColor: 'rgba(255, 215, 0, 0.5)',
    size: 32,
    value: { gold: 10 },
    spawnWeight: 0.55,
    rarity: 'common'
  },
  star: {
    type: 'star',
    emoji: '⭐',
    color: '#FCD34D',
    glowColor: 'rgba(252, 211, 77, 0.6)',
    size: 36,
    value: { xp: 25 },
    spawnWeight: 0.25,
    rarity: 'rare'
  },
  diamond: {
    type: 'diamond',
    emoji: '💎',
    color: '#60A5FA',
    glowColor: 'rgba(96, 165, 250, 0.6)',
    size: 38,
    value: { gold: 100 },
    spawnWeight: 0.08,
    rarity: 'epic'
  },
  heart: {
    type: 'heart',
    emoji: '❤️',
    color: '#EF4444',
    glowColor: 'rgba(239, 68, 68, 0.6)',
    size: 34,
    value: { lives: 1 },
    spawnWeight: 0.05,        // Wird durch heartSpawnRate überschrieben
    rarity: 'legendary'
  }
};

// === HINTERGRUND-LAYER (Parallax) ===

export interface BackgroundLayer {
  id: string;
  speedMultiplier: number;    // Relativ zur Spielgeschwindigkeit
  yPosition: number;          // Von oben (0 = Himmel)
  elements: BackgroundElement[];
  color?: string;             // Optionale Hintergrundfarbe
}

export interface BackgroundElement {
  emoji: string;
  width: number;
  height: number;
  yOffset: number;            // Offset innerhalb des Layers
  frequency: number;          // Wie oft spawnen (0-1)
  animated?: boolean;
}

export const BACKGROUND_LAYERS: BackgroundLayer[] = [
  {
    id: 'sky',
    speedMultiplier: 0,
    yPosition: 0,
    color: 'linear-gradient(180deg, #1e3a5f 0%, #3b5998 50%, #87CEEB 100%)',
    elements: []
  },
  {
    id: 'clouds-far',
    speedMultiplier: 0.1,
    yPosition: 20,
    elements: [
      { emoji: '☁️', width: 80, height: 40, yOffset: 0, frequency: 0.3 },
      { emoji: '☁️', width: 60, height: 30, yOffset: 20, frequency: 0.2 }
    ]
  },
  {
    id: 'mountains',
    speedMultiplier: 0.2,
    yPosition: 80,
    elements: [
      { emoji: '🏔️', width: 120, height: 80, yOffset: 0, frequency: 0.15 },
      { emoji: '⛰️', width: 100, height: 60, yOffset: 10, frequency: 0.2 }
    ]
  },
  {
    id: 'trees-far',
    speedMultiplier: 0.4,
    yPosition: 140,
    elements: [
      { emoji: '🌲', width: 40, height: 60, yOffset: 0, frequency: 0.4 },
      { emoji: '🌳', width: 50, height: 55, yOffset: 5, frequency: 0.3 }
    ]
  },
  {
    id: 'trees-near',
    speedMultiplier: 0.6,
    yPosition: 170,
    elements: [
      { emoji: '🌲', width: 50, height: 70, yOffset: -10, frequency: 0.25 },
      { emoji: '🌴', width: 45, height: 75, yOffset: -15, frequency: 0.15 }
    ]
  }
];

// === BODEN-KONFIGURATION ===

export interface GroundConfig {
  color: string;
  patternColor: string;
  height: number;
  lineSpacing: number;
}

export const GROUND_CONFIG: GroundConfig = {
  color: '#4A5D23',
  patternColor: '#3D4F1C',
  height: 60,
  lineSpacing: 40
};

// === SOUND-DEFINITIONEN ===

export type SoundType = 
  | 'jump' 
  | 'coin' 
  | 'star' 
  | 'diamond' 
  | 'heart' 
  | 'hit' 
  | 'gameOver' 
  | 'victory' 
  | 'milestone'
  | 'countdown'
  | 'start';

export interface SoundDefinition {
  id: SoundType;
  frequency?: number;         // Für generierte Sounds
  duration?: number;
  type?: OscillatorType;
  volume: number;
  // Für komplexere Sounds
  notes?: Array<{
    frequency: number;
    duration: number;
    delay: number;
  }>;
}

// Generierte Sounds (keine externen Dateien nötig)
export const SOUND_DEFINITIONS: Record<SoundType, SoundDefinition> = {
  jump: {
    id: 'jump',
    frequency: 300,
    duration: 0.15,
    type: 'sine',
    volume: 0.3,
    notes: [
      { frequency: 300, duration: 0.08, delay: 0 },
      { frequency: 450, duration: 0.1, delay: 0.05 }
    ]
  },
  coin: {
    id: 'coin',
    volume: 0.4,
    notes: [
      { frequency: 987, duration: 0.1, delay: 0 },
      { frequency: 1319, duration: 0.15, delay: 0.1 }
    ]
  },
  star: {
    id: 'star',
    volume: 0.4,
    notes: [
      { frequency: 523, duration: 0.1, delay: 0 },
      { frequency: 659, duration: 0.1, delay: 0.08 },
      { frequency: 784, duration: 0.1, delay: 0.16 },
      { frequency: 1047, duration: 0.2, delay: 0.24 }
    ]
  },
  diamond: {
    id: 'diamond',
    volume: 0.5,
    notes: [
      { frequency: 880, duration: 0.15, delay: 0 },
      { frequency: 1108, duration: 0.15, delay: 0.1 },
      { frequency: 1318, duration: 0.15, delay: 0.2 },
      { frequency: 1760, duration: 0.3, delay: 0.3 }
    ]
  },
  heart: {
    id: 'heart',
    volume: 0.5,
    notes: [
      { frequency: 392, duration: 0.15, delay: 0 },
      { frequency: 523, duration: 0.15, delay: 0.12 },
      { frequency: 659, duration: 0.2, delay: 0.24 }
    ]
  },
  hit: {
    id: 'hit',
    frequency: 150,
    duration: 0.2,
    type: 'sawtooth',
    volume: 0.4,
    notes: [
      { frequency: 200, duration: 0.1, delay: 0 },
      { frequency: 100, duration: 0.15, delay: 0.08 }
    ]
  },
  gameOver: {
    id: 'gameOver',
    volume: 0.5,
    notes: [
      { frequency: 392, duration: 0.3, delay: 0 },
      { frequency: 349, duration: 0.3, delay: 0.25 },
      { frequency: 330, duration: 0.3, delay: 0.5 },
      { frequency: 262, duration: 0.5, delay: 0.75 }
    ]
  },
  victory: {
    id: 'victory',
    volume: 0.5,
    notes: [
      { frequency: 523, duration: 0.15, delay: 0 },
      { frequency: 659, duration: 0.15, delay: 0.12 },
      { frequency: 784, duration: 0.15, delay: 0.24 },
      { frequency: 1047, duration: 0.15, delay: 0.36 },
      { frequency: 784, duration: 0.15, delay: 0.48 },
      { frequency: 1047, duration: 0.4, delay: 0.6 }
    ]
  },
  milestone: {
    id: 'milestone',
    volume: 0.4,
    notes: [
      { frequency: 659, duration: 0.12, delay: 0 },
      { frequency: 784, duration: 0.12, delay: 0.1 },
      { frequency: 1047, duration: 0.25, delay: 0.2 }
    ]
  },
  countdown: {
    id: 'countdown',
    frequency: 440,
    duration: 0.15,
    type: 'sine',
    volume: 0.3
  },
  start: {
    id: 'start',
    volume: 0.4,
    notes: [
      { frequency: 523, duration: 0.1, delay: 0 },
      { frequency: 659, duration: 0.1, delay: 0.08 },
      { frequency: 784, duration: 0.2, delay: 0.16 }
    ]
  }
};

// === CANVAS-KONFIGURATION ===

export interface CanvasConfig {
  width: number;
  height: number;
  groundY: number;            // Y-Position des Bodens
  playerX: number;            // Feste X-Position des Spielers
  gravity: number;
  jumpForce: number;
}

export const CANVAS_CONFIG: CanvasConfig = {
  width: 800,
  height: 400,
  groundY: 340,               // Boden bei y=340
  playerX: 120,               // Spieler steht links
  gravity: 0.8,
  jumpForce: 15
};

// === SPIELER-KONFIGURATION ===

export interface PlayerConfig {
  width: number;
  height: number;
  duckHeight: number;         // Höhe beim Ducken
  hitboxPadding: number;      // Hitbox kleiner als Sprite
}

export const PLAYER_CONFIG: PlayerConfig = {
  width: 60,
  height: 80,
  duckHeight: 45,
  hitboxPadding: 8
};

// === EINSATZ-OPTIONEN ===

export interface BetOption {
  amount: number;
  label: string;
  isAllIn?: boolean;
}

export const BET_OPTIONS: BetOption[] = [
  { amount: 25, label: '25 XP' },
  { amount: 50, label: '50 XP' },
  { amount: 100, label: '100 XP' },
  { amount: -1, label: 'All-In! 🎰', isAllIn: true }
];

// === HELPER FUNKTIONEN ===

/**
 * Berechnet den Multiplikator basierend auf Distanz und Altersstufe
 */
export function calculateMultiplier(distance: number, ageGroup: AgeGroup): number {
  const config = DIFFICULTY_CONFIGS[ageGroup];
  const milestones = Object.keys(config.distanceMultipliers)
    .map(Number)
    .sort((a, b) => b - a);
  
  for (const milestone of milestones) {
    if (distance >= milestone) {
      return config.distanceMultipliers[milestone];
    }
  }
  return 0; // Unter dem ersten Milestone = Einsatz verloren
}

/**
 * Gibt das nächste Distanz-Ziel zurück
 */
export function getNextMilestone(distance: number, ageGroup: AgeGroup): number | null {
  const config = DIFFICULTY_CONFIGS[ageGroup];
  const milestones = Object.keys(config.distanceMultipliers)
    .map(Number)
    .sort((a, b) => a - b);
  
  for (const milestone of milestones) {
    if (distance < milestone) {
      return milestone;
    }
  }
  return null; // Alle Milestones erreicht
}

/**
 * Wählt einen zufälligen Hindernis-Typ basierend auf Distanz
 */
export function getRandomObstacleType(distance: number): ObstacleType {
  const available = Object.values(OBSTACLE_DEFINITIONS)
    .filter(obs => obs.minDistance === undefined || distance >= obs.minDistance);
  
  const totalWeight = available.reduce((sum, obs) => sum + obs.rarity, 0);
  let random = Math.random() * totalWeight;
  
  for (const obs of available) {
    random -= obs.rarity;
    if (random <= 0) {
      return obs.type;
    }
  }
  
  return 'rock'; // Fallback
}

/**
 * Wählt einen zufälligen Collectible-Typ
 */
export function getRandomCollectibleType(heartSpawnRate: number): CollectibleType {
  // Herz-Spawn-Rate separat behandeln
  if (Math.random() < heartSpawnRate) {
    return 'heart';
  }
  
  // Andere Collectibles ohne Herz
  const available = Object.values(COLLECTIBLE_DEFINITIONS)
    .filter(c => c.type !== 'heart');
  
  const totalWeight = available.reduce((sum, c) => sum + c.spawnWeight, 0);
  let random = Math.random() * totalWeight;
  
  for (const collectible of available) {
    random -= collectible.spawnWeight;
    if (random <= 0) {
      return collectible.type;
    }
  }
  
  return 'coin'; // Fallback
}

/**
 * Berechnet die Spawn-Distanz basierend auf Geschwindigkeit und Schwierigkeit
 */
export function calculateObstacleGap(
  speed: number, 
  config: DifficultyConfig
): number {
  const baseGap = config.minObstacleGap + 
    Math.random() * (config.maxObstacleGap - config.minObstacleGap);
  
  // Bei höherer Geschwindigkeit etwas mehr Abstand
  const speedAdjustment = speed * 5;
  
  return baseGap + speedAdjustment;
}
