// ============================================
// Wortschmiede Types
// Extracted from WortschmiedeBattle.jsx, StimmenBattle.jsx, wortschmiede_data.js
// ============================================

// ─── Difficulty ──────────────────────────────────────────────────────────────

export type Difficulty = 'leicht' | 'mittel' | 'hart';
export type Klasse = '5' | '6' | '7' | '8' | '9+';

// ─── Word Bank ───────────────────────────────────────────────────────────────

/** [word, categoryId, typicalError | 0, starRating] */
export type WordEntry = [string, number, string | 0, number];

// ─── SM-2 Spaced Repetition ─────────────────────────────────────────────────

export interface WordStat {
  interval: number;
  repetition: number;
  efactor: number;
  dueDate: string;
  totalCorrect: number;
  totalWrong: number;
}

export type WordStats = Record<string, WordStat>;

// ─── Monster ─────────────────────────────────────────────────────────────────

export interface Monster {
  id: string;
  name: string;
  title: string;
  zone: string;
  zoneEmoji: string;
  type: string;
  level: number;
  maxHp: number;
  attack: number;
  color: string;
  darkColor: string;
  bgFrom: string;
  bgTo: string;
  battleCry: string;
  weakMsg: string;
  defeatMsg: string;
  lore: string;
}

// ─── Challenges ──────────────────────────────────────────────────────────────

export interface Challenge {
  q: string;
  word: string;
  type: 'input' | 'choice';
  audio?: boolean;
  sentence?: string | null;
  options?: string[];
  correct?: string;
}

export interface PruferQuestion extends Challenge {
  diff: Difficulty;
  hint: string;
}

// ─── Sprite Data ─────────────────────────────────────────────────────────────

export interface SpriteAnim {
  src?: string;
  row?: number;
  frames: number;
  dur: number;
}

export interface SpriteData {
  frameW: number;
  frameH: number;
  scale: number;
  sheet?: string;
  sheetW?: number;
  sheetH?: number;
  idle: SpriteAnim;
  attack: SpriteAnim;
  hurt: SpriteAnim;
  death: SpriteAnim;
}

export interface PlayerSpriteData {
  frameW: number;
  frameH: number;
  scale: number;
  idle: SpriteAnim;
  attack: SpriteAnim;
  hurt: SpriteAnim;
}

// ─── Battle State ────────────────────────────────────────────────────────────

export type Screen =
  | 'diagnose' | 'difficulty' | 'map'
  | 'round' | 'roundResult'
  | 'session_pause' | 'session_end'
  | 'stimmen_battle' | 'stimmen_battle_end';

export interface RoundStats {
  correct: number;
  wrong: number;
  wrongWords: Record<string, number>;
}

export interface SessionTotalStats {
  correct: number;
  wrong: number;
  rounds: Array<{
    monster: Monster;
    correct: number;
    wrong: number;
    victory: boolean;
  }>;
}

export interface StimmenBattleResult {
  word: string;
  wOk: boolean;
  sOk: boolean;
  pts: number;
}

export interface StimmenBattleResults {
  results: StimmenBattleResult[];
  totalPts: number;
  compPts: number;
}

// ─── Save Data ───────────────────────────────────────────────────────────────

export interface WortschmiedeSave {
  defeatedIds: string[];
  xp: number;
  difficulty: Difficulty;
  autoLevel: Difficulty;
  wordStats: WordStats;
  streak: number;
  lastPlayedDate: string | null;
  firstDefeatedDates: Record<string, string>;
  monsterStars: Record<string, boolean>;
}

// ─── Component Props ─────────────────────────────────────────────────────────

export interface WortschmiedeBattleProps {
  onClose?: () => void;
  onXPEarned?: (xp: number) => void;
}

export interface BattleScreenProps {
  monster: Monster;
  onMonsterDefeated: (monsterId: string) => void;
  onBack: () => void;
  difficulty: Difficulty;
  wordStats: WordStats;
  onUpdateWordStats: (word: string, correct: boolean) => void;
  timeLeft: number;
  onCorrectAnswer: (word: string | null) => void;
  onWrongAnswer: (word: string | null) => void;
  threshold: number;
}

export interface ChallengePanelProps {
  challenge: Challenge;
  onCorrect: () => void;
  onWrong: () => void;
  monsterColor: string;
}

export interface HPBarProps {
  current: number;
  max: number;
  color: string;
  label: string;
  small?: boolean;
}

export interface WorldMapProps {
  onBattle: (monster: Monster) => void;
  onStartSession: () => void;
  onStartStimmenBattle: (monsterId?: string | null) => void;
  defeatedIds: string[];
  xp: number;
  streak: number;
  difficulty: Difficulty;
  onChangeDifficulty: () => void;
  onReset: () => void;
  wordStats: WordStats;
  firstDefeatedDates: Record<string, string>;
  monsterStars: Record<string, boolean>;
}

export interface StimmenBattleScreenProps {
  words: WordEntry[];
  difficulty: Difficulty;
  onUpdateWordStats: (word: string, correct: boolean) => void;
  onComplete: (data: StimmenBattleResults) => void;
  onBack: () => void;
}

export interface StimmenBattleEndScreenProps {
  results: StimmenBattleResult[];
  totalPts: number;
  compPts: number;
  isLevelUp: boolean;
  monsterName: string | null;
  passed: boolean;
  onBack: () => void;
}

// ─── TTS ─────────────────────────────────────────────────────────────────────

export type VoicePreference = 'any' | 'clear' | 'monster' | 'deep';

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voiceType?: VoicePreference;
}
