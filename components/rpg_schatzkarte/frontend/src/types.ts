// ============================================
// RPG Schatzkarte - TypeScript Types
// ============================================

// Altersstufen
export type AgeGroup = 'grundschule' | 'unterstufe' | 'mittelstufe' | 'oberstufe' | 'paedagoge';

// Insel/Quest Daten (von Python)
export interface Island {
  id: string;
  name: string;
  icon: string;
  color: string;
  week: number;
  treasures: Treasure[];
  quiz?: Quiz;
}

export interface Treasure {
  name: string;
  icon: string;
  xp: number;
}

export interface Quiz {
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
}

// User-Fortschritt
export interface UserProgress {
  [islandId: string]: IslandProgress;
}

export interface IslandProgress {
  video_watched: boolean;
  explanation_read: boolean;
  quiz_passed: boolean;
  challenge_completed: boolean;
  treasures_collected: string[];
}

// RPG-spezifische Types
export interface HeroData {
  name: string;
  avatar: HeroAvatar;
  level: number;
  xp: number;
  xp_to_next_level: number;
  gold: number;
  items: Item[];
  titles: string[];
}

export type HeroAvatar = 'warrior' | 'mage' | 'ranger' | 'healer';

export interface Item {
  id: string;
  name: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  description: string;
}

// Quest-Status
export type QuestStatus = 'locked' | 'available' | 'in_progress' | 'completed';

// Quest-Typen (entsprechen den Aktionen)
export type QuestType = 'wisdom' | 'scroll' | 'battle' | 'challenge';

// Props fuer die Hauptkomponente
export interface SchatzkarteProp {
  islands: Island[];
  userProgress: UserProgress;
  heroData: HeroData;
  unlockedIslands: string[];
  currentIsland: string | null;
  ageGroup: AgeGroup;
}

// Aktionen die an Python zurueckgegeben werden
export interface SchatzkartAction {
  action: 'quest_completed' | 'treasure_collected' | 'xp_earned' | 'item_received' | 'bandura_entry' | 'hattie_entry';
  islandId?: string;
  questType?: QuestType;
  treasureId?: string;
  xpEarned?: number;
  itemId?: string;
  goldEarned?: number;
  // Bandura-Challenge spezifisch
  banduraSource?: 'mastery' | 'vicarious' | 'persuasion' | 'physiological';
  description?: string;
}

// Bandura-Quellen Konfiguration
export interface BanduraSource {
  id: string;
  name_de: string;
  icon: string;
  color: string;
  prompt: string;
  examples: string[];
  xp: number;
}

// Hattie-Challenge Daten
export interface HattieEntry {
  subject: string;
  task: string;
  expected: number;
  actual?: number;
}

// Battle-Quiz State
export interface BattleState {
  currentQuestion: number;
  correctAnswers: number;
  streak: number;
  monsterHp: number;
  maxMonsterHp: number;
  playerDamage: number;
  isFinished: boolean;
  isVictory: boolean;
}

// Animation States
export type AnimationState = 'idle' | 'attack' | 'damage' | 'victory' | 'defeat';
