// ============================================
// QuestModal - Type Definitions
// Pfad: src/components/QuestModal/QuestModalTypes.ts
// ============================================

import { Island, IslandProgress, QuestType, AgeGroup } from '../../types';

// Tutorial Step für Tutorial-Inseln
export interface TutorialStep {
  id: string;
  title: string;
  type: 'video' | 'explanation' | 'link';
  description?: string;
  content?: string;
  placeholder?: boolean;
}

// Extended Island mit optionalen Quest-Eigenschaften
export interface ExtendedIsland extends Island {
  type?: string;
  tutorial_steps?: TutorialStep[];
  has_quiz?: boolean;
  has_challenge?: boolean;
}

// Props für die Hauptkomponente
export interface QuestModalProps {
  island: ExtendedIsland;
  progress?: IslandProgress;
  isOpen: boolean;
  ageGroup: AgeGroup;
  onClose: () => void;
  onQuestComplete: (questType: string, xp: number, gold?: number, itemId?: string) => void;
  onTreasureCollected: (treasureId: string, xp: number) => void;
  // Superhelden-Tagebuch öffnen (nur Grundschule)
  onOpenTagebuch?: () => void;
  // Challenge-Schiffe öffnen (statt eingebetteter Challenges)
  onOpenBandura?: () => void;
  onOpenHattie?: () => void;
  // Direkt zur Challenge der 7 Werkzeuge springen (wenn von Lerntechniken-Widget geöffnet)
  startWerkzeugeWithChallenge?: boolean;
  // Lernkarten und Schatzkammer öffnen (für Werkzeuge/Lernpfad)
  onOpenLernkarten?: () => void;
  onOpenSchatzkammer?: () => void;
  // Polarstern-Widget öffnen (für Starthafen)
  onPolarsternClick?: () => void;
  // Lernbegleiter auswählen (für Starthafen)
  onOpenCompanionSelector?: () => void;
  selectedCompanion?: string;
  // Initiale Phase für Starthafen (z.B. 'ready' nach Rückkehr von Polarstern)
  initialPhase?: string | null;
}

// Quest-Type Definition
export interface QuestTypeDefinition {
  icon: string;
  name: string;
  description: string;
  action: string;
  xp: number;
  gold: number;
  progressKey: keyof IslandProgress;
}

// Quest Types Map
export type QuestTypesMap = {
  [K in QuestType]: QuestTypeDefinition;
};

// Earned Reward State
export interface EarnedReward {
  xp: number;
  gold: number;
}

// Island Subtitle Info
export interface IslandSubtitleInfo {
  subtitle: string;
  description: string;
}

// Re-export für einfachen Zugriff
export type { QuestType, AgeGroup, IslandProgress };
