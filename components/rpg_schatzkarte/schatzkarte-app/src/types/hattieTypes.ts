// ============================================
// RPG Schatzkarte - Hattie Challenge Types
// 🎯 "Student Expectations" nach John Hattie
// ============================================

// Fächer-IDs
export type HattieSubjectId =
  | 'math'
  | 'german'
  | 'english'
  | 'science'
  | 'history'
  | 'art'
  | 'sport'
  | 'music'
  | 'other';

// Vorhersage-Typ (Note, Punkte oder Prozent)
export type PredictionType = 'note' | 'punkte' | 'prozent';

// Status eines Eintrags
export type HattieEntryStatus = 'pending' | 'completed';

// Fach-Konfiguration
export interface HattieSubject {
  id: HattieSubjectId;
  name: string;
  icon: string;
  color: string;
}

// Ein einzelner Hattie-Eintrag
export interface HattieEntry {
  id: string;
  subject: HattieSubjectId;
  task: string;
  predictionType: PredictionType;
  prediction: number;
  status: HattieEntryStatus;
  // Optional - werden erst bei Abschluss gesetzt
  result?: number;
  exceeded?: boolean;
  difference?: number;  // result - prediction (bei Note invertiert)
  reflection?: string;
  xp_earned?: number;
  completed_at?: string;
  // Datum der Prüfung (optional)
  test_date?: string;
  created_at: string;
}

// Statistiken
export interface HattieStats {
  total_entries: number;
  pending_entries: number;
  completed_entries: number;
  exceeded_count: number;
  exact_count: number;
  success_rate: number;
  accuracy_rate: number;  // Wie oft war die Schätzung genau?
  avg_difference: number;
  current_streak: number;
  longest_streak: number;
  best_subject: HattieSubjectId | null;
  entries_per_subject: Partial<Record<HattieSubjectId, number>>;
  total_xp: number;
  level: number;
}

// Props für die Hauptkomponente
export interface HattieChallengeProps {
  entries: HattieEntry[];
  stats: HattieStats;
  userName?: string;
  onNewPrediction: (entry: Omit<HattieEntry, 'id' | 'created_at'>) => void;
  onCompleteEntry: (entryId: string, result: number, reflection?: string) => void;
  onClose?: () => void;
}

// Schritte im Challenge-Flow (reduziert für Vorhersage)
export type HattieStep = 1 | 2 | 3 | 4;

// Form-State während der Eingabe
export interface HattieFormState {
  subject: HattieSubjectId | null;
  task: string;
  predictionType: PredictionType;
  prediction: number;
  testDate: string;
  // Für Ergebnis-Eintragung
  result: number;
  reflection: string;
}

// XP-System
export interface HattieXpConfig {
  base: number;           // Basis-XP für jeden Eintrag
  exceeded_bonus: number; // Bonus wenn übertroffen
  exact_bonus: number;    // Bonus wenn genau richtig
  long_task_bonus: number; // Bonus für ausführliche Aufgabenbeschreibung
  reflection_bonus: number; // Bonus für Reflexion
}

// Tab-IDs für die Navigation
export type HattieTabId = 'new' | 'pending' | 'history' | 'stats';

// Level-Info
export interface LevelInfo {
  icon: string;
  name: string;
  xpRequired: number;
}

// Default Stats
export const DEFAULT_HATTIE_STATS: HattieStats = {
  total_entries: 0,
  pending_entries: 0,
  completed_entries: 0,
  exceeded_count: 0,
  exact_count: 0,
  success_rate: 0,
  accuracy_rate: 0,
  avg_difference: 0,
  current_streak: 0,
  longest_streak: 0,
  best_subject: null,
  entries_per_subject: {},
  total_xp: 0,
  level: 1
};
