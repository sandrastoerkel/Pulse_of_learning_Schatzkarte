// ============================================
// Transfer Challenge - TypeScript Types & Daten
// Insel der Brücken - Für Grundschule (8-10 Jahre)
// NEUE VERSION: Kreative, interaktive Übungen
// Wissenschaftlich fundiert: Effektstärke d=0.86 (Hattie)
// ============================================

// ============================================
// TYPES
// ============================================

// Phasen der Challenge
export type PhaseKey = 'connections' | 'myTrick' | 'mission' | 'journal';

// Fortschritts-Tracking
export interface TransferProgress {
  completedPhases: PhaseKey[];
  connectionsScore: number;
  discoveredTrick: DiscoveredTrick | null;
  activeMission: TransferMission | null;
  journalEntries: JournalEntry[];
  totalXP: number;
  certificateEarned: boolean;
}

// Verrückte Verbindungen (Phase 1)
export interface ConnectionChallenge {
  id: string;
  thing1: { text: string; icon: string };
  thing2: { text: string; icon: string };
  correctPrinciple: string;
  options: ConnectionOption[];
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ConnectionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

// Mein Geheimer Trick (Phase 2)
export interface DiscoveredTrick {
  hobby: HobbyOption;
  trick: string;
  schoolSubject: SchoolSubject;
  applicationIdea: string;
}

export interface HobbyOption {
  id: string;
  label: string;
  icon: string;
  suggestedTricks: string[];
}

export interface SchoolSubject {
  id: string;
  label: string;
  icon: string;
  challenges: string[];
}

// Transfer-Mission (Phase 3)
export interface TransferMission {
  id: string;
  fromHobby: string;
  toSubject: string;
  trick: string;
  missionText: string;
  completedAt?: Date;
  success?: boolean;
  reflection?: string;
}

// Transfer-Tagebuch (Phase 4)
export interface JournalEntry {
  id: string;
  date: string;
  fromActivity: string;
  toActivity: string;
  trick: string;
  howItHelped: string;
  stars: number; // 1-3
}

// Challenge State
export interface ChallengeState {
  currentPhase: PhaseKey | 'overview' | 'certificate';
  phaseStep: 'intro' | 'exercise' | 'result';
}

// Haupt-Props
export interface TransferChallengeProps {
  onComplete: (xp: number) => void;
  onClose: () => void;
  savedProgress?: TransferProgress;
  onSaveProgress?: (progress: TransferProgress) => void;
}

// SelectOption für wiederverwendbare Auswahl
export interface SelectOption {
  id: string;
  label: string;
  icon: string;
}

// Legacy PersonalTrick (für Kompatibilität)
export interface PersonalTrick {
  skillId: string;
  skillLabel: string;
  trickId: string;
  trickLabel: string;
  subjectId: string;
  subjectLabel: string;
}

// ============================================
// KONSTANTEN
// ============================================

export const EFFECT_SIZE = 0.86;

// XP Belohnungen
export const XP_REWARDS = {
  CONNECTIONS_COMPLETE: 25,
  MY_TRICK_COMPLETE: 30,
  MISSION_COMPLETE: 25,
  JOURNAL_ENTRY: 15,
  PERFECT_BONUS: 10,
  ALL_PHASES_BONUS: 50,
  STREAK_BONUS: 5, // pro Tag Streak
} as const;

// Phasen-Info
export const PHASES_INFO: Record<PhaseKey, {
  name: string;
  icon: string;
  color: string;
  description: string;
  xp: number;
}> = {
  connections: {
    name: "Verrückte Verbindungen",
    icon: "🔗",
    color: "#e74c3c",
    description: "Finde versteckte Gemeinsamkeiten!",
    xp: XP_REWARDS.CONNECTIONS_COMPLETE,
  },
  myTrick: {
    name: "Mein Geheimer Trick",
    icon: "🎯",
    color: "#9b59b6",
    description: "Entdecke DEINEN Transfer-Trick!",
    xp: XP_REWARDS.MY_TRICK_COMPLETE,
  },
  mission: {
    name: "Transfer-Mission",
    icon: "🚀",
    color: "#3498db",
    description: "Deine Mission für morgen!",
    xp: XP_REWARDS.MISSION_COMPLETE,
  },
  journal: {
    name: "Transfer-Tagebuch",
    icon: "📔",
    color: "#f39c12",
    description: "Sammle deine Erfolge!",
    xp: XP_REWARDS.JOURNAL_ENTRY,
  },
};

// ============================================
// PHASE 1: VERRÜCKTE VERBINDUNGEN
// ============================================

export const CONNECTIONS_INTRO = {
  title: "Verrückte Verbindungen",
  story: `**Stell dir vor:** Ein Koch und ein Mathelehrer treffen sich.

Der Koch sagt: "Ich muss immer genau abmessen!"
Der Mathelehrer lacht: "Ich auch!"

Komisch, oder? Kochen und Mathe haben etwas gemeinsam! 🤔

**Das ist Transfer:** Dinge sehen, die gleich funktionieren –
auch wenn sie ganz verschieden aussehen.`,
  challenge: "Findest du die versteckte Verbindung?",
};

export const CONNECTION_CHALLENGES: ConnectionChallenge[] = [
  {
    id: 'c1',
    thing1: { text: "Fahrradfahren lernen", icon: "🚴" },
    thing2: { text: "Lesen lernen", icon: "📖" },
    correctPrinciple: "Übung macht den Meister",
    options: [
      { id: 'a', text: "Beide brauchen viel Übung", isCorrect: true },
      { id: 'b', text: "Beide machen Lärm", isCorrect: false },
      { id: 'c', text: "Beide brauchen Sonnenlicht", isCorrect: false },
    ],
    explanation: "Ja! Beim Radfahren UND beim Lesen wird man durch Übung besser. Am Anfang wackelt man – später geht es automatisch!",
    difficulty: 'easy',
  },
  {
    id: 'c2',
    thing1: { text: "Puzzle zusammensetzen", icon: "🧩" },
    thing2: { text: "Aufsatz schreiben", icon: "✍️" },
    correctPrinciple: "Erst das Große, dann die Details",
    options: [
      { id: 'a', text: "Bei beiden sitzt man am Tisch", isCorrect: false },
      { id: 'b', text: "Erst das große Bild, dann die Einzelteile", isCorrect: true },
      { id: 'c', text: "Beide sind langweilig", isCorrect: false },
    ],
    explanation: "Genau! Beim Puzzle schaut man erst das Bild an. Beim Aufsatz überlegt man erst die Hauptidee. Dann kommen die Details!",
    difficulty: 'easy',
  },
  {
    id: 'c3',
    thing1: { text: "Videospiel spielen", icon: "🎮" },
    thing2: { text: "Mathe-Aufgaben lösen", icon: "📐" },
    correctPrinciple: "Aus Fehlern lernen",
    options: [
      { id: 'a', text: "Beide machen Spaß", isCorrect: false },
      { id: 'b', text: "Bei beiden lernt man aus Fehlern", isCorrect: true },
      { id: 'c', text: "Beide brauchen Strom", isCorrect: false },
    ],
    explanation: "Im Spiel probiert man neu, wenn man stirbt. In Mathe schaut man sich Fehler an und lernt. Beides macht schlauer!",
    difficulty: 'medium',
  },
  {
    id: 'c4',
    thing1: { text: "Fußball-Training", icon: "⚽" },
    thing2: { text: "Vokabeln lernen", icon: "🇬🇧" },
    correctPrinciple: "Regelmäßig kleine Portionen",
    options: [
      { id: 'a', text: "Beides findet in der Schule statt", isCorrect: false },
      { id: 'b', text: "Bei beiden braucht man einen Ball", isCorrect: false },
      { id: 'c', text: "Jeden Tag ein bisschen ist besser als alles auf einmal", isCorrect: true },
    ],
    explanation: "Super! Jeden Tag 10 Minuten trainieren bringt mehr als einmal 2 Stunden. Das gilt für Sport UND für Vokabeln!",
    difficulty: 'medium',
  },
  {
    id: 'c5',
    thing1: { text: "Lego nach Anleitung bauen", icon: "🧱" },
    thing2: { text: "Rezept nachkochen", icon: "👨‍🍳" },
    correctPrinciple: "Schritt für Schritt vorgehen",
    options: [
      { id: 'a', text: "Anleitung lesen und Schritt für Schritt machen", isCorrect: true },
      { id: 'b', text: "Beides ist teuer", isCorrect: false },
      { id: 'c', text: "Beides macht Erwachsene glücklich", isCorrect: false },
    ],
    explanation: "Richtig! Bei Lego wie beim Kochen: Anleitung lesen, Schritt 1 machen, dann Schritt 2... So klappt es!",
    difficulty: 'easy',
  },
  {
    id: 'c6',
    thing1: { text: "Detektiv spielen", icon: "🔍" },
    thing2: { text: "Textaufgaben in Mathe", icon: "🔢" },
    correctPrinciple: "Hinweise sammeln",
    options: [
      { id: 'a', text: "Beide suchen nach Hinweisen", isCorrect: true },
      { id: 'b', text: "Beide brauchen eine Lupe", isCorrect: false },
      { id: 'c', text: "Beide sind nur für Erwachsene", isCorrect: false },
    ],
    explanation: "Ja! Ein Detektiv sammelt Hinweise. Bei Textaufgaben suchst du auch die wichtigen Infos. Dann löst du das Rätsel!",
    difficulty: 'medium',
  },
];

export const CONNECTIONS_SUCCESS_MESSAGES = [
  "Wow! Du siehst Verbindungen wie ein Profi! 🌟",
  "Dein Gehirn baut gerade neue Brücken! 🌉",
  "Genial! So denken Überflieger! 🚀",
  "Du hast den Transfer-Blick! 👀",
];

// ============================================
// PHASE 2: MEIN GEHEIMER TRICK
// ============================================

export const MY_TRICK_INTRO = {
  title: "Mein Geheimer Trick",
  story: `**Jeder hat einen Geheimtrick!**

Du auch! Du weißt es vielleicht nur noch nicht.

Denk an etwas, das du richtig gut kannst.
Irgendwas, das dir Spaß macht.

**Dort steckt dein Geheimtrick versteckt!**
Und der funktioniert auch in der Schule. 🎯`,
};

export const HOBBY_OPTIONS: HobbyOption[] = [
  {
    id: 'soccer',
    label: "Fußball / Sport",
    icon: "⚽",
    suggestedTricks: [
      "Immer wieder üben, auch wenn es nicht klappt",
      "Auf das Ziel konzentrieren",
      "Im Team zusammenarbeiten",
      "Vor dem Spiel aufwärmen (= vorbereiten)",
    ],
  },
  {
    id: 'lego',
    label: "Lego / Bauen",
    icon: "🧱",
    suggestedTricks: [
      "Schritt für Schritt nach Plan vorgehen",
      "Erst sortieren, dann bauen",
      "Geduldig sein bei komplizierten Teilen",
      "Wenn was nicht passt: nochmal anschauen",
    ],
  },
  {
    id: 'gaming',
    label: "Videospiele",
    icon: "🎮",
    suggestedTricks: [
      "Aus jeder Niederlage lernen",
      "Schwierige Level mehrmals probieren",
      "Tutorials anschauen wenn man nicht weiterkommt",
      "Erst leichte Level, dann schwere",
    ],
  },
  {
    id: 'drawing',
    label: "Malen / Zeichnen",
    icon: "🎨",
    suggestedTricks: [
      "Erst skizzieren, dann ausmalen",
      "Genau hinschauen, was man zeichnet",
      "Fehler kann man übermalen",
      "Jeden Tag ein bisschen üben",
    ],
  },
  {
    id: 'music',
    label: "Musik / Instrument",
    icon: "🎵",
    suggestedTricks: [
      "Langsam anfangen, dann schneller werden",
      "Schwierige Stellen extra üben",
      "Jeden Tag kurz üben ist besser als einmal lang",
      "Sich selbst zuhören und verbessern",
    ],
  },
  {
    id: 'reading',
    label: "Bücher / Geschichten",
    icon: "📚",
    suggestedTricks: [
      "Sich die Geschichte im Kopf vorstellen",
      "Unbekannte Wörter nachschlagen",
      "Jeden Tag ein bisschen lesen",
      "Über das Gelesene nachdenken",
    ],
  },
  {
    id: 'cooking',
    label: "Kochen / Backen",
    icon: "🧁",
    suggestedTricks: [
      "Rezept erst ganz durchlesen",
      "Alle Zutaten vorher bereitstellen",
      "Genau abmessen",
      "Schritt für Schritt arbeiten",
    ],
  },
  {
    id: 'crafts',
    label: "Basteln",
    icon: "✂️",
    suggestedTricks: [
      "Erst planen, dann schneiden",
      "Ordnung halten beim Arbeiten",
      "Geduldig und vorsichtig sein",
      "Aus Fehlern lernen für nächstes Mal",
    ],
  },
  {
    id: 'animals',
    label: "Tiere / Haustiere",
    icon: "🐕",
    suggestedTricks: [
      "Geduldig sein und warten können",
      "Regelmäßig kümmern (nicht nur manchmal)",
      "Genau beobachten, was das Tier braucht",
      "Freundlich und ruhig bleiben",
    ],
  },
  {
    id: 'dance',
    label: "Tanzen",
    icon: "💃",
    suggestedTricks: [
      "Bewegungen in kleine Schritte zerlegen",
      "Erst langsam üben, dann schneller",
      "Sich nicht schämen bei Fehlern",
      "Rhythmus finden und dranbleiben",
    ],
  },
];

export const SCHOOL_SUBJECTS: SchoolSubject[] = [
  {
    id: 'math',
    label: "Mathe",
    icon: "📐",
    challenges: ["Textaufgaben verstehen", "Rechenwege merken", "Bei Fehlern nicht aufgeben"],
  },
  {
    id: 'german',
    label: "Deutsch",
    icon: "📖",
    challenges: ["Aufsätze schreiben", "Rechtschreibung üben", "Texte verstehen"],
  },
  {
    id: 'sachkunde',
    label: "Sachkunde / HSU",
    icon: "🌍",
    challenges: ["Viel Stoff merken", "Zusammenhänge verstehen", "Für Proben lernen"],
  },
  {
    id: 'english',
    label: "Englisch",
    icon: "🇬🇧",
    challenges: ["Vokabeln lernen", "Aussprache üben", "Grammatik verstehen"],
  },
  {
    id: 'homework',
    label: "Hausaufgaben allgemein",
    icon: "📝",
    challenges: ["Anfangen ohne Aufschub", "Konzentriert bleiben", "Alles fertig machen"],
  },
  {
    id: 'tests',
    label: "Proben / Tests",
    icon: "📋",
    challenges: ["Nicht nervös werden", "Richtig vorbereiten", "Zeit einteilen"],
  },
];

export const TRICK_TEMPLATES = [
  "Bei {hobby} hilft mir: {trick}. Das probiere ich jetzt auch bei {subject}!",
  "Mein Geheimtrick aus {hobby}: {trick} – funktioniert bestimmt auch bei {subject}!",
  "Wenn ich {hobby} mache, dann {trick}. Genau das mache ich jetzt auch bei {subject}!",
];

// ============================================
// PHASE 3: TRANSFER-MISSION
// ============================================

export const MISSION_INTRO = {
  title: "Deine Transfer-Mission",
  story: `**Agent, dein Auftrag wartet!** 🕵️

Du hast gerade deinen Geheimtrick entdeckt.
Jetzt ist es Zeit für eine echte Mission!

**Morgen in der Schule:** Du wendest deinen Trick an.
Danach berichtest du, wie es gelaufen ist.

Bist du bereit für deine erste Transfer-Mission?`,
};

export const MISSION_TEMPLATES = [
  {
    id: 'm1',
    template: "Wenn du morgen {subject} hast, denke an deinen Trick '{trick}' aus {hobby}. Beobachte: Hilft es dir?",
    successQuestion: "Hat dein Trick geholfen?",
  },
  {
    id: 'm2',
    template: "Deine Mission: Bei der nächsten {subject}-Aufgabe verwendest du '{trick}' – genau wie bei {hobby}!",
    successQuestion: "Hast du es geschafft?",
  },
  {
    id: 'm3',
    template: "Geheimauftrag: Übertrage '{trick}' von {hobby} auf {subject}. Niemand merkt es – aber du wirst besser!",
    successQuestion: "Wie ist es gelaufen?",
  },
];

export const MISSION_CONTRACT = {
  title: "Transfer-Vertrag",
  text: `Ich, Transfer-Agent, verspreche:

Ich werde morgen in der Schule meinen
Geheimtrick ausprobieren!

Mein Trick: {trick}
Bei: {subject}

Unterschrift: ✍️ (Tippe zum Unterschreiben)`,
};

export const MISSION_REWARDS = {
  tried: { xp: 15, message: "Du hast es versucht! Das ist das Wichtigste!" },
  success: { xp: 25, message: "Super! Dein Trick hat funktioniert!" },
  learned: { xp: 20, message: "Du hast etwas Neues gelernt!" },
};

// ============================================
// PHASE 4: TRANSFER-TAGEBUCH
// ============================================

export const JOURNAL_INTRO = {
  title: "Dein Transfer-Tagebuch",
  story: `**Echte Helden schreiben Tagebuch!** 📔

Hier sammelst du deine Transfer-Erfolge.
Jedes Mal, wenn du einen Trick überträgst,
schreibst du es auf.

So siehst du, wie viele Brücken du schon gebaut hast!

**Je mehr Einträge, desto mehr Superkraft! 🦸**`,
};

export const JOURNAL_PROMPTS = {
  fromActivity: "Von welcher Aktivität hast du etwas übertragen?",
  toActivity: "Wo hast du es angewendet?",
  trick: "Was war dein Trick?",
  howItHelped: "Wie hat es dir geholfen?",
  stars: "Wie gut hat es funktioniert?",
};

export const JOURNAL_BADGES = [
  { entries: 1, name: "Erste Brücke", icon: "🌉" },
  { entries: 3, name: "Brückenbauer", icon: "🏗️" },
  { entries: 5, name: "Transfer-Talent", icon: "⭐" },
  { entries: 10, name: "Transfer-Meister", icon: "🏆" },
  { entries: 20, name: "Transfer-Legende", icon: "👑" },
];

export const EXAMPLE_ENTRIES: JournalEntry[] = [
  {
    id: 'ex1',
    date: '2024-01-10',
    fromActivity: "Minecraft",
    toActivity: "Sachkunde-Projekt",
    trick: "Erst planen, dann bauen",
    howItHelped: "Ich hab erst eine Skizze gemacht wie beim Minecraft-Haus!",
    stars: 3,
  },
  {
    id: 'ex2',
    date: '2024-01-08',
    fromActivity: "Fußball",
    toActivity: "Mathe-Probe",
    trick: "Konzentriert aufs Ziel schauen",
    howItHelped: "Ich hab mich auf jede Aufgabe einzeln konzentriert.",
    stars: 2,
  },
];

// ============================================
// ZERTIFIKAT
// ============================================

export const CERTIFICATE_DATA = {
  title: "Transfer-Agent",
  subtitle: "hat das Geheimnis der Überflieger gemeistert!",
  skills: [
    "Verrückte Verbindungen erkannt",
    "Persönlichen Geheimtrick entdeckt",
    "Erste Transfer-Mission gemeistert",
  ],
  effectNote: `Effektstärke d=${EFFECT_SIZE} – eine der höchsten überhaupt!`,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getDefaultProgress(): TransferProgress {
  return {
    completedPhases: [],
    connectionsScore: 0,
    discoveredTrick: null,
    activeMission: null,
    journalEntries: [],
    totalXP: 0,
    certificateEarned: false,
  };
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function calculateStars(score: number, max: number): number {
  const percentage = score / max;
  if (percentage >= 1) return 3;
  if (percentage >= 0.66) return 2;
  if (percentage >= 0.33) return 1;
  return 0;
}

export function getRandomItems<T>(array: T[], count: number): T[] {
  return shuffleArray(array).slice(0, count);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function getCurrentBadge(entryCount: number): typeof JOURNAL_BADGES[0] | null {
  const earned = JOURNAL_BADGES.filter(b => entryCount >= b.entries);
  return earned.length > 0 ? earned[earned.length - 1] : null;
}

export function getNextBadge(entryCount: number): typeof JOURNAL_BADGES[0] | null {
  return JOURNAL_BADGES.find(b => entryCount < b.entries) || null;
}
