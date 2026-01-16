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
  companion?: CompanionType;  // Ausgewählter Lernbegleiter
  level: number;
  xp: number;
  xp_to_next_level: number;
  gold: number;
  items: Item[];
  titles: string[];
}

export type HeroAvatar = 'warrior' | 'mage' | 'ranger' | 'healer';

// Lernbegleiter (auswählbar)
export type CompanionType = 'draki' | 'shadow' | 'phoenix' | 'knight' | 'brainy';

export interface CompanionInfo {
  id: CompanionType;
  name: string;
  description: string;
  image: string;
}

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

// Superhelden-Tagebuch (nur Grundschule)
export interface TagebuchEintrag {
  id: string;
  datum: string; // ISO date
  wasGeschafft: string; // z.B. "Das 3er-Einmaleins gelernt"
  warEsSchwer: 'leicht' | 'mittel' | 'schwer';
  gefuehl: string; // Emoji: 💪, 😊, 🎉, 😅, 🌟, 🦸
}

// Aktionen die an Python zurueckgegeben werden
export interface SchatzkartAction {
  action: 'quest_completed' | 'treasure_collected' | 'xp_earned' | 'item_received' | 'bandura_entry' | 'hattie_entry' | 'hattie_prediction' | 'hattie_complete' | 'tagebuch_entry' | 'polarstern_clicked' | 'companion_selected' | 'minigame_completed';
  companionId?: CompanionType;
  islandId?: string;
  questType?: QuestType;
  treasureId?: string;
  xpEarned?: number;
  itemId?: string;
  goldEarned?: number;
  // Bandura-Challenge spezifisch
  banduraSource?: 'mastery' | 'vicarious' | 'persuasion' | 'physiological';
  description?: string;
  // Tagebuch spezifisch
  tagebuchEntry?: TagebuchEintrag;
  // MiniGame spezifisch
  minigameType?: string;
  score?: number;
  maxScore?: number;
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

// ============================================
// AVATAAARS AVATAR TYPES
// ============================================

// Visuelle Teile des Avatars (Avataaars-kompatibel)
export interface AvatarVisuals {
  // Stil
  avatarStyle: AvatarStyle;

  // Kopf/Haare
  topType: TopType;
  hairColor: HairColor;

  // Accessoires
  accessoriesType: AccessoriesType;

  // Gesichtsbehaarung (optional, eher für Erwachsene)
  facialHairType: FacialHairType;
  facialHairColor: HairColor;

  // Gesicht
  eyeType: EyeType;
  eyebrowType: EyebrowType;
  mouthType: MouthType;

  // Haut
  skinColor: SkinColor;

  // Kleidung
  clotheType: ClotheType;
  clotheColor: ClotheColor;
  graphicType: GraphicType;
}

// Ausgerüstete Shop-Items (für spätere Erweiterung)
export interface AvatarEquipped {
  hat: string | null;
  glasses: string | null;
  accessory: string | null;
  cape: string | null;
  effect: string | null;
  frame: string | null;
}

// Kompletter Avatar
export interface CustomAvatar {
  visuals: AvatarVisuals;
  equipped: AvatarEquipped;
  createdAt: string;
  updatedAt: string;
}

// === AVATAAARS OPTION TYPES ===

export type AvatarStyle = 'Circle' | 'Transparent';

export type TopType =
  | 'NoHair' | 'Eyepatch' | 'Hat' | 'Hijab' | 'Turban'
  | 'WinterHat1' | 'WinterHat2' | 'WinterHat3' | 'WinterHat4'
  | 'LongHairBigHair' | 'LongHairBob' | 'LongHairBun' | 'LongHairCurly' | 'LongHairCurvy'
  | 'LongHairDreads' | 'LongHairFrida' | 'LongHairFro' | 'LongHairFroBand'
  | 'LongHairMiaWallace' | 'LongHairNotTooLong' | 'LongHairShavedSides'
  | 'LongHairStraight' | 'LongHairStraight2' | 'LongHairStraightStrand'
  | 'ShortHairDreads01' | 'ShortHairDreads02' | 'ShortHairFrizzle'
  | 'ShortHairShaggy' | 'ShortHairShaggyMullet' | 'ShortHairShortCurly'
  | 'ShortHairShortFlat' | 'ShortHairShortRound' | 'ShortHairShortWaved'
  | 'ShortHairSides' | 'ShortHairTheCaesar' | 'ShortHairTheCaesarSidePart';

export type HairColor =
  | 'Auburn' | 'Black' | 'Blonde' | 'BlondeGolden' | 'Brown'
  | 'BrownDark' | 'PastelPink' | 'Blue' | 'Platinum' | 'Red' | 'SilverGray';

export type AccessoriesType =
  | 'Blank' | 'Kurt' | 'Prescription01' | 'Prescription02'
  | 'Round' | 'Sunglasses' | 'Wayfarers';

export type FacialHairType =
  | 'Blank' | 'BeardMedium' | 'BeardLight' | 'BeardMajestic'
  | 'MoustacheFancy' | 'MoustacheMagnum';

export type EyeType =
  | 'Close' | 'Cry' | 'Default' | 'Dizzy' | 'EyeRoll'
  | 'Happy' | 'Hearts' | 'Side' | 'Squint' | 'Surprised'
  | 'Wink' | 'WinkWacky';

export type EyebrowType =
  | 'Angry' | 'AngryNatural' | 'Default' | 'DefaultNatural'
  | 'FlatNatural' | 'FrownNatural' | 'RaisedExcited' | 'RaisedExcitedNatural'
  | 'SadConcerned' | 'SadConcernedNatural' | 'UnibrowNatural' | 'UpDown' | 'UpDownNatural';

export type MouthType =
  | 'Concerned' | 'Default' | 'Disbelief' | 'Eating' | 'Grimace'
  | 'Sad' | 'ScreamOpen' | 'Serious' | 'Smile' | 'Tongue' | 'Twinkle' | 'Vomit';

export type SkinColor =
  | 'Tanned' | 'Yellow' | 'Pale' | 'Light' | 'Brown' | 'DarkBrown' | 'Black';

export type ClotheType =
  | 'BlazerShirt' | 'BlazerSweater' | 'CollarSweater' | 'GraphicShirt'
  | 'Hoodie' | 'Overall' | 'ShirtCrewNeck' | 'ShirtScoopNeck' | 'ShirtVNeck';

export type ClotheColor =
  | 'Black' | 'Blue01' | 'Blue02' | 'Blue03' | 'Gray01' | 'Gray02'
  | 'Heather' | 'PastelBlue' | 'PastelGreen' | 'PastelOrange'
  | 'PastelRed' | 'PastelYellow' | 'Pink' | 'Red' | 'White';

export type GraphicType =
  | 'Bat' | 'Cumbia' | 'Deer' | 'Diamond' | 'Hola' | 'Pizza'
  | 'Resist' | 'Selena' | 'Bear' | 'SkullOutline' | 'Skull';

// Avatar Part Option (für UI)
export interface AvatarPartOption {
  id: string;
  name: string;
  icon?: string;
  previewPath?: string;
}

export interface AvatarCategory {
  id: string;
  name: string;
  icon: string;
  options: AvatarPartOption[];
}

// ============================================
// AVATAR SHOP TYPES
// ============================================

// Seltenheit für Shop-Items
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

// Shop-Item Slot (welcher Ausrüstungsplatz)
export type ItemSlot = 'hat' | 'glasses' | 'accessory' | 'cape' | 'effect' | 'frame';

// Shop-Item Definition
export interface ShopItem {
  id: string;
  name: string;
  description: string;
  icon: string;              // Emoji
  slot: ItemSlot;
  price: number;             // In Gold
  rarity: Rarity;
  visualData?: {
    color?: string;          // Für Effekte/Auras
    borderColor?: string;    // Für Rahmen
  };
  // Mapping zu echten Avataaars-Eigenschaften
  avataaarsMapping?: {
    property: keyof AvatarVisuals;
    value: string;
  };
}

// ============================================
// REWARD & ACHIEVEMENT TYPES
// ============================================

// Achievement Interface
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  bonusXP?: number;
}

// Level-Up Info (für RewardModal)
export interface LevelUpInfo {
  oldLevel: number;
  newLevel: number;
  newTitle?: string;
  goldBonus?: number;
}

// Insel-Belohnung (für RewardModal)
export interface IslandReward {
  islandName: string;
  xpEarned: number;
  goldEarned: number;
  itemUnlocked?: ShopItem;
}
