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
  world?: number;  // Optional: für Weltanzeige (1, 2, 3...)
}

// Fragetypen für erweitertes Quiz
export type QuestionType = 'single' | 'multi-select' | 'matching' | 'ordering';

// Basis-Frage Interface
export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
  type?: QuestionType;  // Standard: 'single'
  world?: number;       // Welt-Nummer (1, 2, 3...)
  level?: string;       // Level-Anzeige ("1-1", "2-3", "BOSS")
  title?: string;       // Titel der Frage
}

// Multi-Select Frage
export interface MultiSelectQuestion extends Omit<QuizQuestion, 'correct' | 'options'> {
  type: 'multi-select';
  options: MultiSelectOption[];
  correctCount: number;  // Anzahl der richtigen Antworten
  instruction?: string;  // z.B. "Wähle genau 4 richtige!"
}

export interface MultiSelectOption {
  id: string;
  text: string;
  correct: boolean;
}

// Matching/Zuordnungs-Frage
export interface MatchingQuestion extends Omit<QuizQuestion, 'correct' | 'options'> {
  type: 'matching';
  powerUps: MatchingItem[];
  matches: MatchingTarget[];
}

export interface MatchingItem {
  id: number;
  text: string;
  correctMatch: number;  // ID des richtigen Match
}

export interface MatchingTarget {
  id: number;
  text: string;
}

// Ordering/Reihenfolge-Frage
export interface OrderingQuestion extends Omit<QuizQuestion, 'correct' | 'options'> {
  type: 'ordering';
  items: OrderingItem[];
}

export interface OrderingItem {
  id: string;
  text: string;
  order: number;  // Richtige Position (1, 2, 3...)
}

// Union Type für alle Fragetypen
export type ExtendedQuizQuestion = QuizQuestion | MultiSelectQuestion | MatchingQuestion | OrderingQuestion;

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
  action: 'quest_completed' | 'treasure_collected' | 'xp_earned' | 'item_received' | 'bandura_entry' | 'hattie_entry' | 'hattie_prediction' | 'hattie_complete';
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
  // Spieler-Leben System
  playerLives: number;
  maxPlayerLives: number;
  isGameOver: boolean;
}

// Erweitertes Quiz mit allen Fragetypen
export interface ExtendedQuiz {
  questions: ExtendedQuizQuestion[];
  title?: string;
  worlds?: { id: number; name: string; color: string }[];
}

// Animation States
export type AnimationState = 'idle' | 'attack' | 'damage' | 'victory' | 'defeat';
