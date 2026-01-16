// ============================================
// Memory Game Types
// Konsistent mit 00_SHARED_TYPES.md
// ============================================

import type { CustomAvatar } from '../types';

// Verfügbare Spiele
export type MiniGameType = 'memory' | 'runner';

// Schwierigkeitsgrade
export type Difficulty = 'easy' | 'medium' | 'hard';

// Spiel-Status
export type GameStatus = 'idle' | 'betting' | 'playing' | 'paused' | 'won' | 'lost';

// Trigger für Belohnungen (aus rewards.ts)
export type RewardTrigger =
  | 'bandura_complete'
  | 'island_complete'
  | 'level_up'
  | 'achievement_unlocked'
  | 'game_won';

// ============================================
// MEMORY GAME
// ============================================

export interface MemoryCard {
  id: number;                // WICHTIG: number, nicht string
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface MemoryGameState {
  cards: MemoryCard[];
  flippedCards: number[];    // IDs der aktuell aufgedeckten Karten
  matchedPairs: number;
  totalPairs: number;
  moves: number;
  lives: number;
  maxLives: number;
  timeLeft: number;
  status: GameStatus;
  difficulty: Difficulty;

  // Einsatz
  betAmount: number;
  potentialWin: number;      // Vorberechneter möglicher Gewinn
}

export interface MemoryGameConfig {
  pairs: number;
  lives: number;
  time: number;
  multiplier: number;
}

export const MEMORY_CONFIGS: Record<Difficulty, MemoryGameConfig> = {
  easy: { pairs: 6, lives: 5, time: 90, multiplier: 1.5 },
  medium: { pairs: 8, lives: 4, time: 60, multiplier: 2.0 },
  hard: { pairs: 10, lives: 3, time: 45, multiplier: 3.0 }
};

// Grid-Größen basierend auf Paar-Anzahl
export const GRID_SIZES: Record<Difficulty, { rows: number; cols: number }> = {
  easy: { rows: 3, cols: 4 },    // 12 Karten = 6 Paare
  medium: { rows: 4, cols: 4 },  // 16 Karten = 8 Paare
  hard: { rows: 4, cols: 5 }     // 20 Karten = 10 Paare
};

// ============================================
// GAME PROPS & RESULT
// ============================================

export interface MiniGameProps {
  playerXP: number;
  playerGold: number;
  playerAvatar?: CustomAvatar;  // Optional für Avatar-Darstellung im Spiel
  onGameEnd: (result: GameResult) => void;
  onClose: () => void;
}

export interface GameResult {
  game: MiniGameType;
  won: boolean;
  xpBet: number;
  xpWon: number;               // Positiv bei Gewinn, negativ bei Verlust
  goldWon: number;             // Bonus-Gold (z.B. bei perfektem Spiel)
  stats: {
    // Memory
    moves?: number;
    timeUsed?: number;
    pairsFound?: number;
    // Runner (für später)
    distance?: number;
    coinsCollected?: number;
    starsCollected?: number;
  };
}

// ============================================
// COMPONENT PROPS
// ============================================

export interface MemoryGameProps extends MiniGameProps {}

export interface MemoryCardProps {
  card: MemoryCard;
  onClick: () => void;
  disabled: boolean;
  size?: 'small' | 'medium' | 'large';
}

export interface BettingPhaseProps {
  playerXP: number;
  onStartGame: (bet: number, difficulty: Difficulty) => void;
  onCancel: () => void;
}

// ============================================
// CONSTANTS
// ============================================

export const BET_OPTIONS = [25, 50, 100, 'all'] as const;
export type BetOption = typeof BET_OPTIONS[number];

export const CARD_SYMBOLS = [
  // Companions
  '🐉', '🐱', '🦅', '⚔️', '🧠',
  // Lern-Icons
  '📚', '💡', '🎯', '⭐', '🔮',
  // Schul-Themen
  '🔢', '📐', '🌍', '🔬', '📝',
  // Belohnungen
  '💎', '👑', '🏆', '🎁', '🌟'
];
