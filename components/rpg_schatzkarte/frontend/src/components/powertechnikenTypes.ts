// ============================================
// 7 Powertechniken Challenge - TypeScript Types
// Für Grundschule (8-10 Jahre)
// ============================================

// Die 7 Technik-Schlüssel
export type TechniqueKey = 
  | 'pomodoro'
  | 'active_recall'
  | 'feynman'
  | 'spaced_repetition'
  | 'teaching'
  | 'loci'
  | 'interleaving';

// Fortschritts-Tracking
export interface PowertechnikenProgress {
  completedTechniques: TechniqueKey[];
  applications: Record<TechniqueKey, string>;
  top3?: TechniqueKey[];
  certificateEarned?: boolean;
  totalXP?: number;
}

// Einzelne Technik Daten
export interface TechniqueData {
  key: TechniqueKey;
  order: number;
  name: string;
  icon: string;
  color: string;
  intro: string;
  exercise: {
    title: string;
    instruction: string;
  };
  funFact: string;
  kurzanleitung: string;
  idealFuer: string[];
  xp: number;
}

// Props für Hauptkomponente
export interface PowertechnikenChallengeProps {
  onComplete: (xp: number) => void;
  onClose: () => void;
  savedProgress?: PowertechnikenProgress;
  onSaveProgress?: (progress: PowertechnikenProgress) => void;
}

// Props für Übersicht
export interface LerntechnikenUebersichtProps {
  progress: PowertechnikenProgress;
  techniques: TechniqueData[];
  onClose: () => void;
  onExport?: () => void;
}

// Props für Zertifikat
export interface LerntechnikenZertifikatProps {
  studentName: string;
  top3: TechniqueKey[];
  completionDate: string;
  onClose: () => void;
  onDownload?: () => void;
  onPrint?: () => void;
}

// Challenge State Management
export interface ChallengeState {
  currentView: 'overview' | 'technique' | 'certificate';
  selectedTechnique: TechniqueKey | null;
  techniqueStep: 'intro' | 'exercise' | 'application' | 'funfact' | 'complete';
}

// Pomodoro Timer State
export interface PomodoroState {
  timeLeft: number;
  isRunning: boolean;
  isComplete: boolean;
  phase: 'learn' | 'break';  // Lern- oder Pause-Phase
  cycleCount: number;        // Anzahl abgeschlossener Zyklen
  canContinue: boolean;      // Kann weitermachen nach Pause
}

// Active Recall Memory Game State
export interface MemoryGameState {
  phase: 'show' | 'recall' | 'result';
  words: string[];
  userInput: string[];
  correctCount: number;
}

// Loci Method State
export interface LociState {
  locations: string[];
  items: Record<number, string>;
}

// Interleaving Drag & Drop State
export interface InterleavingState {
  problems: MathProblem[];
  shuffled: boolean;
  solved: Record<number, number>;
  correctCount: number;
}

export interface MathProblem {
  id: number;
  left: number;
  right: number;
  operator: '+' | '-' | '×';
  answer: number;
}

// Spaced Repetition Calendar State
export interface SpacedRepState {
  selectedDays: string[];
  topic: string;
}

// Teaching Checklist State
export interface TeachingState {
  foundPartner: boolean;
  explained: boolean;
  answeredQuestions: boolean;
  partnerName: string;
}

// Animation Types
export type AnimationType = 
  | 'bounce'
  | 'pulse'
  | 'shake'
  | 'confetti'
  | 'sparkle'
  | 'float';

// XP Belohnungen
export const XP_REWARDS = {
  TECHNIQUE_COMPLETE: 15,
  ALL_TECHNIQUES_BONUS: 50,
  CERTIFICATE_EARNED: 20,
  EXERCISE_DONE: 10,
  APPLICATION_SET: 5,
} as const;

// Die 7 Techniken Daten (für Grundschule)
export const TECHNIQUES_DATA: TechniqueData[] = [
  {
    key: 'pomodoro',
    order: 1,
    name: 'Pomodoro-Technik',
    icon: '🍅',
    color: '#e74c3c',
    intro: 'Stell dir vor, du hast eine magische Tomate! 🍅 Diese Tomate hilft dir, dich beim Lernen zu konzentrieren. So funktioniert\'s: Du stellst einen Timer auf 15 Minuten und lernst, bis er klingelt. Dann darfst du 5 Minuten Pause machen!',
    exercise: {
      title: 'Deine erste Tomate!',
      instruction: 'Nimm dir eine Hausaufgabe oder Lernaufgabe vor. Starte den Timer und arbeite konzentriert, bis er klingelt. Kein Handy, kein Aufstehen - du schaffst das!',
    },
    funFact: 'Die Technik heißt "Pomodoro", weil der Erfinder eine Küchenuhr in Form einer Tomate benutzt hat! 🍅',
    kurzanleitung: 'Timer auf 15 Min → fokussiert lernen → 5 Min Pause → wiederholen',
    idealFuer: ['Alle Lernaufgaben', 'Hausaufgaben', 'Prüfungsvorbereitung'],
    xp: 15,
  },
  {
    key: 'active_recall',
    order: 2,
    name: 'Active Recall',
    icon: '🔄',
    color: '#3498db',
    intro: 'Hier ist ein Geheimnis: Wenn du etwas lernst, mach das Buch zu und frag dich selbst ab! Das ist wie ein Spiel: "Kannst du dich erinnern?" Jedes Mal, wenn du\'s schaffst, wird dein Gehirn stärker! 💪',
    exercise: {
      title: 'Das Erinnerungs-Spiel',
      instruction: 'Du siehst gleich 5 Wörter. Präge sie dir gut ein! Dann werden sie verschwinden und du musst sie aufzählen.',
    },
    funFact: 'Dein Gehirn hat über 86 Milliarden Nervenzellen – mehr als Sterne in der Milchstraße! 🌟',
    kurzanleitung: 'Buch schließen → aufschreiben was du weißt → vergleichen → Lücken nochmal lernen',
    idealFuer: ['Vokabeln', 'Definitionen', 'Fakten', 'Formeln'],
    xp: 15,
  },
  {
    key: 'feynman',
    order: 3,
    name: 'Feynman-Methode',
    icon: '👶',
    color: '#9b59b6',
    intro: 'Stell dir vor, du erklärst deinem Kuscheltier etwas! 🧸 Das Kuscheltier stellt keine Fragen – du redest einfach drauflos. Wenn du nicht mehr weiterweißt, hast du eine Lücke gefunden! Dann musst du nochmal nachschauen.',
    exercise: {
      title: 'Teddy-Erklärer',
      instruction: 'Setz dich alleine hin und erkläre deinem Kuscheltier (oder dir selbst) dein aktuelles Schulthema. Sprich LAUT! Wo bleibst du hängen?',
    },
    funFact: 'Richard Feynman war ein berühmter Wissenschaftler, der sogar den Nobelpreis gewonnen hat! 🏆',
    kurzanleitung: 'Thema wählen → laut erklären → wo stockst du? → dort nochmal lernen',
    idealFuer: ['Komplexe Themen', 'Zusammenhänge verstehen', 'HSU-Themen'],
    xp: 15,
  },
  {
    key: 'spaced_repetition',
    order: 4,
    name: 'Spaced Repetition',
    icon: '📅',
    color: '#27ae60',
    intro: 'Stell dir vor, du pflanzt einen Sämling 🌱. Du gießt ihn nicht alles auf einmal, sondern jeden Tag ein bisschen. Beim Lernen ist es genauso! Lerne etwas heute, morgen wieder, dann in 3 Tagen. So wächst das Wissen!',
    exercise: {
      title: 'Wissens-Kalender',
      instruction: 'Wähle ein Thema und trage in den Kalender ein, wann du es wiederholen willst: Morgen, in 3 Tagen, in 1 Woche!',
    },
    funFact: 'Wissenschaftler nennen das die "Vergessenskurve" – aber du kannst sie besiegen! 💪',
    kurzanleitung: 'Heute lernen → morgen wiederholen → in 3 Tagen → in 1 Woche',
    idealFuer: ['Vokabeln', 'Einmaleins', 'Geschichtsdaten', 'HSU-Fakten'],
    xp: 15,
  },
  {
    key: 'teaching',
    order: 5,
    name: 'Lernen durch Lehren',
    icon: '👥',
    color: '#f39c12',
    intro: 'Diese Technik brauchst du mit jemand anderem zusammen! 👨‍👩‍👧 Erkläre Mama, Papa, Oma oder einem Freund, was du gelernt hast. Das Besondere: Sie dürfen Fragen stellen! Wenn du ihre Fragen beantworten kannst, hast du es richtig verstanden.',
    exercise: {
      title: 'Frage-Antwort-Spiel',
      instruction: 'Erkläre einem Familienmitglied dein Schulthema. Bitte sie, dir 3 Fragen dazu zu stellen! Kannst du alle beantworten?',
    },
    funFact: 'Lehrer lernen oft mehr als ihre Schüler – weil sie so viele Fragen beantworten müssen!',
    kurzanleitung: 'Partner finden → Thema erklären → Fragen beantworten → Lücken klären',
    idealFuer: ['Alle Themen', 'Prüfungsvorbereitung', 'Schwierige Konzepte'],
    xp: 15,
  },
  {
    key: 'loci',
    order: 6,
    name: 'Loci-Methode',
    icon: '🏰',
    color: '#e91e63',
    intro: 'Stell dir dein Kinderzimmer vor! 🏠 Jetzt leg an jeden Ort etwas, das du lernen willst: Die Vokabel "Hund" (dog) sitzt auf deinem Bett, "Katze" (cat) auf dem Schreibtisch. Wenn du durchs Zimmer gehst, erinnerst du dich!',
    exercise: {
      title: 'Zimmer-Spaziergang',
      instruction: 'Lerne 5 Wörter, indem du sie an 5 Orte in deinem Zimmer legst. Welches Wort liegt wo?',
    },
    funFact: 'Diese Methode nutzten schon die alten Griechen vor über 2000 Jahren! 🏛️',
    kurzanleitung: 'Bekannten Ort vorstellen → Lerninhalt an Orte "legen" → im Kopf durchgehen',
    idealFuer: ['Listen', 'Reihenfolgen', 'Vokabeln', 'Namen'],
    xp: 15,
  },
  {
    key: 'interleaving',
    order: 7,
    name: 'Interleaved Practice',
    icon: '🔀',
    color: '#00bcd4',
    intro: 'Hier ist ein Geheimtrick! 🎯 Wenn du Mathe übst, mach nicht 10 Plus-Aufgaben, dann 10 Minus-Aufgaben. Mische sie! Plus, Minus, Plus, Minus... Es fühlt sich schwerer an, aber du lernst VIEL mehr!',
    exercise: {
      title: 'Mathe-Mixer',
      instruction: 'Hier sind Plus- und Minus-Aufgaben durchgemischt. Löse sie alle! Das trainiert dein Gehirn.',
    },
    funFact: 'Forscher haben das mit Viertklässlern getestet: Die Misch-Gruppe war DOPPELT so gut! 🏆',
    kurzanleitung: 'Verschiedene Aufgabentypen mischen → nicht 10x Plus, dann 10x Minus → abwechselnd',
    idealFuer: ['Mathe-Übungen', 'Verschiedene Aufgabentypen', 'Prüfungsvorbereitung'],
    xp: 15,
  },
];

// Memory-Spiel Wörter für Active Recall
export const MEMORY_WORDS = ['Apfel', 'Hund', 'Sonne', 'Ball', 'Buch'];

// Loci Methode Standardorte (mit korrektem Artikel für Akkusativ)
export const LOCI_LOCATIONS = [
  { name: 'Bett', artikel: 'das' },
  { name: 'Schreibtisch', artikel: 'den' },
  { name: 'Schrank', artikel: 'den' },
  { name: 'Fenster', artikel: 'das' },
  { name: 'Tür', artikel: 'die' },
];

// Interleaving Mathe-Aufgaben Generator (3.-4. Klasse Niveau)
export function generateMathProblems(): MathProblem[] {
  const problems: MathProblem[] = [];
  let id = 0;

  // 4 Plus-Aufgaben (größere Zahlen für 3.-4. Klasse)
  for (let i = 0; i < 4; i++) {
    const left = Math.floor(Math.random() * 50) + 20;  // 20-69
    const right = Math.floor(Math.random() * 40) + 10; // 10-49
    problems.push({
      id: id++,
      left,
      right,
      operator: '+',
      answer: left + right,
    });
  }

  // 4 Minus-Aufgaben (größere Zahlen, Ergebnis positiv)
  for (let i = 0; i < 4; i++) {
    const left = Math.floor(Math.random() * 50) + 40;  // 40-89
    const right = Math.floor(Math.random() * 35) + 5;  // 5-39
    problems.push({
      id: id++,
      left,
      right,
      operator: '-',
      answer: left - right,
    });
  }

  // 4 Mal-Aufgaben (kleines Einmaleins)
  for (let i = 0; i < 4; i++) {
    const left = Math.floor(Math.random() * 8) + 2;   // 2-9
    const right = Math.floor(Math.random() * 8) + 2;  // 2-9
    problems.push({
      id: id++,
      left,
      right,
      operator: '×',
      answer: left * right,
    });
  }

  // Mischen
  return problems.sort(() => Math.random() - 0.5);
}

// Spaced Repetition Schedule berechnen
export function calculateSpacedSchedule(startDate: Date): string[] {
  const schedule: string[] = [];
  const days = [1, 3, 7, 14]; // Tag 1, 3, 7, 14
  
  days.forEach(dayOffset => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + dayOffset);
    schedule.push(date.toISOString().split('T')[0]);
  });
  
  return schedule;
}
