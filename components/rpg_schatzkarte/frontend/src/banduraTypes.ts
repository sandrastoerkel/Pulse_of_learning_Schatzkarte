// ============================================
// BANDURA CHALLENGE - TypeScript Types
// Ergänzung zu types.ts
// ============================================

// Bandura Source IDs
export type BanduraSourceId = 'mastery' | 'vicarious' | 'persuasion' | 'physiological';

// Einzelner Bandura-Eintrag
export interface BanduraEntry {
  id: string;
  source_type: BanduraSourceId;
  description: string;
  created_at: string;
  xp_earned: number;
}

// Bandura-Statistiken
export interface BanduraStats {
  total_entries: number;
  entries_per_source: Record<BanduraSourceId, number>;
  current_streak: number;
  longest_streak: number;
  total_xp: number;
  level: number;
  all_four_days: number;
}

// Bandura-Quelle Konfiguration
export interface BanduraSourceConfig {
  id: BanduraSourceId;
  name: string;
  name_de: string;
  icon: string;
  color: string;
  description: string;
  prompt: string;
  examples: string[];
  xp: number;
}

// Props für BanduraChallenge Komponente
export interface BanduraChallengeProps {
  entries: BanduraEntry[];
  stats: BanduraStats;
  userName?: string;
  onNewEntry: (sourceType: BanduraSourceId, description: string, xp: number) => void;
  onClose?: () => void;
}

// Action für Streamlit-Kommunikation
export interface BanduraAction {
  action: 'bandura_entry';
  sourceType: BanduraSourceId;
  description: string;
  xpEarned: number;
  timestamp: string;
}

// Default/Initial Stats
export const DEFAULT_BANDURA_STATS: BanduraStats = {
  total_entries: 0,
  entries_per_source: {
    mastery: 0,
    vicarious: 0,
    persuasion: 0,
    physiological: 0
  },
  current_streak: 0,
  longest_streak: 0,
  total_xp: 0,
  level: 1,
  all_four_days: 0
};

// Bandura Sources Konfiguration (für Import)
export const BANDURA_SOURCES_CONFIG: Record<BanduraSourceId, BanduraSourceConfig> = {
  mastery: {
    id: 'mastery',
    name: 'Mastery Experience',
    name_de: 'Eigener Erfolg',
    icon: '🏆',
    color: '#4CAF50',
    description: 'Der stärkste Weg! Erlebe selbst, dass du etwas schaffst.',
    prompt: 'Was hast du heute geschafft, worauf du stolz bist?',
    examples: [
      'Eine schwierige Mathe-Aufgabe gelöst',
      'Einen Text fehlerfrei vorgelesen',
      'Etwas Neues verstanden',
      'Eine Präsentation gehalten'
    ],
    xp: 15
  },
  vicarious: {
    id: 'vicarious',
    name: 'Vicarious Experience',
    name_de: 'Vorbild-Lernen',
    icon: '👀',
    color: '#2196F3',
    description: 'Sieh anderen zu, die es schaffen - besonders solchen, die dir ähnlich sind!',
    prompt: 'Von wem hast du heute gelernt oder wer hat dich inspiriert?',
    examples: [
      'Ein Mitschüler hat eine gute Lösung erklärt',
      'Jemand hat trotz Schwierigkeiten nicht aufgegeben',
      'Ein Video gesehen, das mir etwas beigebracht hat',
      'Ein Vorbild gefunden'
    ],
    xp: 12
  },
  persuasion: {
    id: 'persuasion',
    name: 'Social Persuasion',
    name_de: 'Ermutigung',
    icon: '💬',
    color: '#9C27B0',
    description: 'Ermutigende Worte von Menschen, denen du vertraust.',
    prompt: 'Welche ermutigenden Worte hast du bekommen oder gegeben?',
    examples: [
      'Jemand hat gesagt, dass ich das schaffen kann',
      'Positives Feedback von einem Lehrer',
      'Ich habe jemand anderen ermutigt',
      'Ein Kompliment für meine Arbeit bekommen'
    ],
    xp: 10
  },
  physiological: {
    id: 'physiological',
    name: 'Physiological States',
    name_de: 'Körper-Management',
    icon: '🧘',
    color: '#FF9800',
    description: 'Lerne, Aufregung als Energie zu nutzen statt als Hindernis.',
    prompt: 'Wie hast du heute mit Stress oder Nervosität umgegangen?',
    examples: [
      'Tief durchgeatmet vor einer Prüfung',
      'Aufregung als positive Energie genutzt',
      'Pause gemacht, als ich frustriert war',
      'Sport/Bewegung zum Stressabbau'
    ],
    xp: 12
  }
};
