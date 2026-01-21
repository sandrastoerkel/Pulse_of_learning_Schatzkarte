// ============================================
// Fäden-Challenge - Interaktive Lernreise
// Basierend auf Vera F. Birkenbihl's Faden-Prinzip
// Für Grundschule (8-10 Jahre) und Unterstufe (10-14 Jahre)
// ============================================
//
// NAVIGATION:
// - Normal: User klickt auf Insel → Overview → Stationen
// - Vom Schiff: Props "startAtMission={true}" → Direkt zur 5-Tage-Mission
//
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import '../styles/FaedenChallenge.css';
import { AgeGroup } from '../types';

// ============================================
// TYPES
// ============================================

type StationKey = 'experiment' | 'gedankenjagd' | 'bleistift' | 'checker' | 'mission';
type StationStep = 'intro' | 'exercise' | 'complete';

interface DayProgress {
  completed: boolean;
  reflection: string;
  completedAt?: string;
}

export interface FaedenProgress {
  completedStations: StationKey[];
  experimentAssociations: Record<string, string>;
  gedankenjagdThoughts: Record<string, string>;
  bleistiftNotes: string[];
  checkerThoughts: string;
  checkerQuizAnswers: Record<number, string>;
  missionStartDate?: string;
  missionDays: Record<number, DayProgress>;
  totalXP: number;
  certificateEarned: boolean;
}

interface ChallengeState {
  currentView: 'overview' | 'station' | 'certificate';
  selectedStation: StationKey | null;
  stationStep: StationStep;
}

interface FaedenChallengeProps {
  onComplete?: (xp: number) => void;
  onClose: () => void;
  savedProgress?: FaedenProgress;
  onSaveProgress?: (progress: FaedenProgress) => void;
  startAtMission?: boolean;
  previewMode?: boolean;
  ageGroup?: AgeGroup;
}

interface StationData {
  key: StationKey;
  name: string;
  icon: string;
  color: string;
  description: string;
  xp: number;
}

// ============================================
// KONSTANTEN
// ============================================

const STATIONS_GRUNDSCHULE: StationData[] = [
  {
    key: 'experiment',
    name: 'Das Faden-Experiment',
    icon: '🧪',
    color: '#9c27b0',
    description: '5 Wörter, deine Gedanken!',
    xp: 30,
  },
  {
    key: 'gedankenjagd',
    name: 'Gedanken-Jagd',
    icon: '💭',
    color: '#7b1fa2',
    description: 'Fakten hören, Fäden knüpfen!',
    xp: 25,
  },
  {
    key: 'bleistift',
    name: 'Die Bleistift-Methode',
    icon: '✏️',
    color: '#6a1b9a',
    description: 'Dein Geheimtrick für die Schule!',
    xp: 30,
  },
  {
    key: 'checker',
    name: 'Checker Julian Challenge',
    icon: '🌋',
    color: '#e65100',
    description: 'Video schauen, Fäden knüpfen!',
    xp: 40,
  },
  {
    key: 'mission',
    name: '5-Tage-Mission',
    icon: '🚢',
    color: '#4a148c',
    description: 'Deine Alltags-Challenge!',
    xp: 50,
  },
];

const STATIONS_UNTERSTUFE: StationData[] = [
  {
    key: 'experiment',
    name: 'Das Birkenbihl-Experiment',
    icon: '🧪',
    color: '#9c27b0',
    description: '5 Begriffe, deine Assoziationen!',
    xp: 30,
  },
  {
    key: 'gedankenjagd',
    name: 'Der Gedanken-Test',
    icon: '💭',
    color: '#7b1fa2',
    description: 'Fakten hören, Fäden knüpfen!',
    xp: 25,
  },
  {
    key: 'bleistift',
    name: 'Die Anti-Mitschreib-Methode',
    icon: '✏️',
    color: '#6a1b9a',
    description: 'Dein Geheimtrick gegen Blackouts!',
    xp: 30,
  },
  {
    key: 'checker',
    name: 'Das Rätsel der Zeit',
    icon: '⏰',
    color: '#1565c0',
    description: 'Doku schauen, Fäden knüpfen!',
    xp: 40,
  },
  {
    key: 'mission',
    name: '5-Tage-Mission',
    icon: '🚀',
    color: '#4a148c',
    description: 'Dein Alltags-Training!',
    xp: 50,
  },
];

// Content-Getter basierend auf Altersgruppe
function getContent(ageGroup: AgeGroup = 'grundschule') {
  const isGrundschule = ageGroup === 'grundschule';
  const isUnterstufe = ageGroup === 'unterstufe';
  const isMittelstufe = ageGroup === 'mittelstufe' || ageGroup === 'oberstufe';

  if (isMittelstufe) {
    return {
      stations: STATIONS_MITTELSTUFE,
      experimentWords: EXPERIMENT_WORDS_MITTELSTUFE,
      gedankenjagdFacts: GEDANKENJAGD_FACTS_MITTELSTUFE,
      video: ZEIT_VIDEO,
      videoQuiz: ZEIT_VIDEO_QUIZ,
      bleistiftWorksheet: BLEISTIFT_WORKSHEET_MITTELSTUFE,
      missionDays: MISSION_DAYS_MITTELSTUFE,
      videoStationName: 'Das Rätsel der Zeit',
      isUnterstufe: false,
      isMittelstufe: true,
    };
  }

  if (isUnterstufe) {
    return {
      stations: STATIONS_UNTERSTUFE,
      experimentWords: EXPERIMENT_WORDS_UNTERSTUFE,
      gedankenjagdFacts: GEDANKENJAGD_FACTS_UNTERSTUFE,
      video: ZEIT_VIDEO,
      videoQuiz: ZEIT_VIDEO_QUIZ,
      bleistiftWorksheet: BLEISTIFT_WORKSHEET_UNTERSTUFE,
      missionDays: MISSION_DAYS_UNTERSTUFE,
      videoStationName: 'Das Rätsel der Zeit',
      isUnterstufe: true,
      isMittelstufe: false,
    };
  }

  // Default: Grundschule
  return {
    stations: STATIONS_GRUNDSCHULE,
    experimentWords: EXPERIMENT_WORDS_GRUNDSCHULE,
    gedankenjagdFacts: GEDANKENJAGD_FACTS_GRUNDSCHULE,
    video: CHECKER_JULIAN_VIDEO,
    videoQuiz: CHECKER_JULIAN_QUIZ,
    bleistiftWorksheet: BLEISTIFT_WORKSHEET_GRUNDSCHULE,
    missionDays: MISSION_DAYS_GRUNDSCHULE,
    videoStationName: 'Checker Julian Challenge',
    isUnterstufe: false,
    isMittelstufe: false,
  };
}

const XP_PER_DAY = 10;
const XP_BONUS_7_DAYS = 30;

// ============================================
// GRUNDSCHULE CONTENT
// ============================================

const EXPERIMENT_WORDS_GRUNDSCHULE = [
  { word: 'Eiscreme', icon: '🍦', hint: 'Sommer? Lieblingssorte? Wann hast du zuletzt eins gegessen?' },
  { word: 'Skateboard', icon: '🛹', hint: 'Tricks? Park? YouTube-Videos? Kennst du jemanden der skatet?' },
  { word: 'Regenbogen', icon: '🌈', hint: 'Farben? Nach dem Regen? Einhörner? Wo hast du einen gesehen?' },
  { word: 'Rakete', icon: '🚀', hint: 'Weltraum? Silvester? SpaceX? Mond?' },
  { word: 'Dinosaurier', icon: '🦖', hint: 'T-Rex? Jurassic Park? Museum? Ausgestorben?' },
];

// ============================================
// UNTERSTUFE CONTENT
// ============================================

const EXPERIMENT_WORDS_UNTERSTUFE = [
  { word: 'Emoji', icon: '😀', hint: 'Welches benutzt du am meisten? Wann schickst du welches?' },
  { word: 'Drohne', icon: '🚁', hint: 'Videos? Fliegen? Amazon-Lieferung? Verboten?' },
  { word: 'Bluetooth', icon: '🎧', hint: 'Kopfhörer? Verbinden? Warum heißt es so?' },
  { word: 'Streaming', icon: '📺', hint: 'Netflix? YouTube? Serien? Downloads?' },
  { word: 'Algorithmus', icon: '🤖', hint: 'TikTok? Vorgeschlagen? Werbung? KI?' },
];

const GEDANKENJAGD_FACTS_GRUNDSCHULE = [
  {
    id: 'delfine',
    fact: 'Delfine schlafen mit nur einer Gehirnhälfte. Die andere Hälfte bleibt wach, damit sie zum Atmen auftauchen können. Das nennt man "unihemisphärischen Schlaf".',
    icon: '🐬',
    prompt: 'Was fällt DIR zu Delfinen ein?',
    quizQuestions: [
      { question: 'Warum schlafen Delfine nur mit einer Gehirnhälfte?', correctAnswers: ['atmen', 'auftauchen', 'luft'] },
      { question: 'Wie heißt diese besondere Schlafart?', correctAnswers: ['unihemisphär', 'hemisphär'] },
    ],
  },
  {
    id: 'honig',
    fact: 'In ägyptischen Pyramiden fand man 3000 Jahre alten Honig – und er war noch essbar! Honig enthält so wenig Wasser und ist so sauer, dass Bakterien darin nicht überleben können.',
    icon: '🍯',
    prompt: 'Deine Honig-Gedanken?',
    quizQuestions: [
      { question: 'Wo wurde uralter Honig gefunden?', correctAnswers: ['pyramide', 'ägypt'] },
      { question: 'Wie alt war dieser Honig ungefähr?', correctAnswers: ['3000', 'dreitausend', 'drei tausend'] },
    ],
  },
  {
    id: 'oktopus',
    fact: 'Oktopusse haben drei Herzen, blaues Blut und neun Gehirne! Ein Hauptgehirn im Kopf und je ein Mini-Gehirn in jedem der acht Arme.',
    icon: '🐙',
    prompt: 'Was verbindest du mit Oktopus?',
    quizQuestions: [
      { question: 'Wie viele Gehirne hat ein Oktopus insgesamt?', correctAnswers: ['neun', '9'] },
      { question: 'Welche Farbe hat das Blut eines Oktopus?', correctAnswers: ['blau'] },
    ],
  },
];

const GEDANKENJAGD_FACTS_UNTERSTUFE = [
  {
    id: 'sonnensystem',
    fact: 'Die Sonne macht 99,86% der gesamten Masse unseres Sonnensystems aus. Jupiter ist so groß, dass alle anderen Planeten zusammen reinpassen würden – und trotzdem Platz übrig wäre.',
    icon: '☀️',
    prompt: 'Was fällt dir zum Sonnensystem ein?',
    quizQuestions: [
      { question: 'Wie viel Prozent der Masse des Sonnensystems macht die Sonne aus?', correctAnswers: ['99', '99,86', '99.86'] },
      { question: 'Welcher Planet ist so groß, dass alle anderen reinpassen würden?', correctAnswers: ['jupiter'] },
    ],
  },
  {
    id: 'musik',
    fact: 'Musik aktiviert mehr Hirnareale gleichzeitig als jede andere menschliche Aktivität. Musiker haben ein größeres Corpus Callosum – das ist die Brücke zwischen den Gehirnhälften.',
    icon: '🎵',
    prompt: 'Was verbindest du mit Musik?',
    quizQuestions: [
      { question: 'Was aktiviert Musik im Vergleich zu anderen Aktivitäten?', correctAnswers: ['mehr', 'hirnareale', 'gehirn'] },
      { question: 'Wie heißt die Brücke zwischen den Gehirnhälften?', correctAnswers: ['corpus callosum', 'corpus', 'callosum'] },
    ],
  },
  {
    id: 'sprachen',
    fact: 'Kinder können bis zu 7 Sprachen gleichzeitig lernen, ohne sie durcheinander zu bringen. Nach der Pubertät wird das Sprachenlernen schwieriger, weil sich das Gehirn verändert.',
    icon: '🗣️',
    prompt: 'Was denkst du über Sprachen lernen?',
    quizQuestions: [
      { question: 'Wie viele Sprachen können Kinder gleichzeitig lernen?', correctAnswers: ['7', 'sieben'] },
      { question: 'Wann wird Sprachen lernen schwieriger?', correctAnswers: ['pubertät', 'teenager', 'älter'] },
    ],
  },
];

// ============================================
// MITTELSTUFE CONTENT
// ============================================

const STATIONS_MITTELSTUFE: StationData[] = [
  {
    key: 'experiment',
    name: 'Das Original-Experiment',
    icon: '🔬',
    color: '#9c27b0',
    description: 'Birkenbihls 30.000-Teilnehmer-Test',
    xp: 30,
  },
  {
    key: 'gedankenjagd',
    name: 'Levels of Processing',
    icon: '🧠',
    color: '#7b1fa2',
    description: 'Tiefe Verarbeitung vs. Oberflächlich',
    xp: 25,
  },
  {
    key: 'bleistift',
    name: 'Elaboratives Notieren',
    icon: '📝',
    color: '#6a1b9a',
    description: 'Nie wieder Bulimielernen!',
    xp: 30,
  },
  {
    key: 'checker',
    name: 'Das Rätsel der Zeit',
    icon: '⏰',
    color: '#1565c0',
    description: 'Doku analysieren mit Faden-Methode',
    xp: 40,
  },
  {
    key: 'mission',
    name: '5-Tage-Experiment',
    icon: '📊',
    color: '#4a148c',
    description: 'Wissenschaftliches Selbst-Experiment',
    xp: 50,
  },
];

const EXPERIMENT_WORDS_MITTELSTUFE = [
  { word: 'Prokrastination', icon: '⏰', hint: 'Wann schiebst du Dinge auf? Warum?' },
  { word: 'Neurotransmitter', icon: '🧬', hint: 'Dopamin? Serotonin? Gehirnchemie?' },
  { word: 'Kryptowährung', icon: '💰', hint: 'Bitcoin? Blockchain? Hype oder Zukunft?' },
  { word: 'Quantencomputer', icon: '💻', hint: 'Was weißt du darüber? Science-Fiction?' },
  { word: 'Metaverse', icon: '🥽', hint: 'VR? Zuckerberg? Gaming? Zukunft?' },
];

const GEDANKENJAGD_FACTS_MITTELSTUFE = [
  {
    id: 'gedaechtnis',
    fact: 'Das Gehirn speichert Informationen auf verschiedenen "Ebenen". Oberflächliche Verarbeitung (wie sieht das Wort aus?) wird schnell vergessen. Tiefe Verarbeitung (was bedeutet es für MICH?) bleibt. Das nennt man "Levels of Processing" - entdeckt von Craik & Lockhart 1972.',
    icon: '🧠',
    prompt: 'Was bedeutet "tiefe Verarbeitung" für dich?',
    quizQuestions: [
      { question: 'Wie heißt das Konzept der verschiedenen Verarbeitungsebenen?', correctAnswers: ['levels of processing', 'levels', 'verarbeitungsebenen'] },
      { question: 'Welche Verarbeitung führt zu besserem Behalten: oberflächlich oder tief?', correctAnswers: ['tief', 'tiefe'] },
    ],
  },
  {
    id: 'vergessenskurve',
    fact: 'Hermann Ebbinghaus entdeckte 1885 die "Vergessenskurve": Ohne Wiederholung vergessen wir 50% nach 20 Minuten, 70% nach 24 Stunden und 90% nach einer Woche. Aber: Jede Wiederholung "flacht" die Kurve ab!',
    icon: '📉',
    prompt: 'Kennst du das Gefühl, alles vergessen zu haben?',
    quizQuestions: [
      { question: 'Wie viel Prozent vergessen wir ohne Wiederholung nach 24 Stunden?', correctAnswers: ['70', 'siebzig'] },
      { question: 'Wie heißt der Entdecker dieser Kurve?', correctAnswers: ['ebbinghaus', 'hermann ebbinghaus'] },
    ],
  },
  {
    id: 'selbstreferenz',
    fact: 'Der "Self-Reference Effect": Informationen, die wir auf uns selbst beziehen, merken wir uns 2-3x besser. Frage "Was bedeutet das für MICH?" aktiviert andere Hirnareale als "Was steht da?". Das ist die wissenschaftliche Basis der Faden-Methode!',
    icon: '🪞',
    prompt: 'Wie beziehst du Lernstoff auf dich selbst?',
    quizQuestions: [
      { question: 'Wie viel mal besser merken wir uns selbstbezogene Infos?', correctAnswers: ['2', '3', '2-3', 'zwei', 'drei'] },
      { question: 'Wie heißt dieser psychologische Effekt?', correctAnswers: ['self-reference', 'selbstreferenz', 'self reference'] },
    ],
  },
];

const BLEISTIFT_WORKSHEET_MITTELSTUFE = {
  title: 'Kognitive Verzerrungen',
  content: [
    {
      id: 'absatz1',
      text: 'Der "Confirmation Bias" beschreibt unsere Tendenz, Informationen zu bevorzugen, die unsere bestehenden Überzeugungen bestätigen. Wir suchen aktiv nach Bestätigung und ignorieren Widersprüche.',
      placeholder: 'Dein Faden: Wann hast du das bei dir selbst bemerkt?',
    },
    {
      id: 'absatz2',
      text: 'Die "Verfügbarkeitsheuristik" lässt uns Ereignisse für wahrscheinlicher halten, wenn wir uns leicht an Beispiele erinnern können. Nach einem Flugzeugabsturz in den Nachrichten überschätzen viele die Gefahr des Fliegens.',
      placeholder: 'Dein Faden: Welche Beispiele fallen dir ein?',
    },
    {
      id: 'absatz3',
      text: 'Der "Dunning-Kruger-Effekt" zeigt: Menschen mit wenig Wissen überschätzen ihre Kompetenz, während Experten sich oft unterschätzen. Je mehr man lernt, desto mehr erkennt man, was man nicht weiß.',
      placeholder: 'Dein Faden: In welchen Bereichen könntest du dich überschätzen?',
    },
  ],
};

const MISSION_DAYS_MITTELSTUFE = [
  { day: 1, name: 'Tag 1', task: 'Führe in einer Schulstunde ein "Parallel-Protokoll": Links Stichworte vom Lehrer, rechts NUR deine Gedanken. Vergleiche abends: Was erinnerst du besser?', icon: '📝', prompt: 'Was hast du besser erinnert - links oder rechts?' },
  { day: 2, name: 'Tag 2', task: 'Erkläre jemandem die wissenschaftliche Basis: Levels of Processing, Self-Reference Effect, Vergessenskurve.', icon: '🎓', prompt: 'Konntest du es erklären? Was war schwierig?' },
  { day: 3, name: 'Tag 3', task: 'Beim Lernen für eine Arbeit: Formuliere zu jedem Abschnitt eine persönliche Frage ("Was bedeutet das für MICH?") und beantworte sie schriftlich.', icon: '❓', prompt: 'Hat die Selbst-Bezug-Methode funktioniert?' },
  { day: 4, name: 'Tag 4', task: 'Reflexion: Vergleiche Bulimielernen (reinprügeln-auskotzen-vergessen) mit der Faden-Methode. Was funktioniert für DICH besser und warum?', icon: '🔬', prompt: 'Welche Methode funktioniert für dich und warum?' },
  { day: 5, name: 'Tag 5', task: 'Dokumentiere dein Fazit: Wie wirst du die Erkenntnisse in deinen Lernalltag integrieren? Erstelle einen konkreten Plan.', icon: '📋', prompt: 'Was ist dein konkreter Plan für die Zukunft?' },
];

const CHECKER_JULIAN_VIDEO = {
  url: 'https://www.youtube.com/watch?v=-ejbEAT8R_Q',
  embedUrl: 'https://www.youtube.com/embed/-ejbEAT8R_Q',
  title: 'Der Vulkan-Check',
  duration: '15 Minuten',
};

const CHECKER_JULIAN_QUIZ = [
  {
    question: 'Wie heißt die Vulkanforscherin, die Julian getroffen hat?',
    correctAnswers: ['ulla', 'lohmann', 'ulla lohmann'],
    icon: '👩‍🔬',
  },
  {
    question: 'Wie viele Meter tief ist sie in einen aktiven Vulkan abgestiegen?',
    correctAnswers: ['600', 'sechshundert'],
    icon: '⬇️',
  },
  {
    question: 'Vor wie vielen Jahren ist der Moosenberg ausgebrochen?',
    correctAnswers: ['30000', '30.000', 'dreißigtausend'],
    icon: '🌋',
  },
  {
    question: 'Wie heiß ist Lava (in Grad)?',
    correctAnswers: ['1000', 'tausend', 'über 1000'],
    icon: '🔥',
  },
  {
    question: 'Wie viele aktive Vulkane gibt es weltweit?',
    correctAnswers: ['1500', '1.500', 'fünfzehnhundert'],
    icon: '🌍',
  },
  {
    question: 'Wann war der letzte Vulkanausbruch in Deutschland (vor wie vielen Jahren)?',
    correctAnswers: ['12000', '12.000', 'zwölftausend'],
    icon: '🇩🇪',
  },
  {
    question: 'Um wie viel Grad wurde die Erde nach dem Pinatubo-Ausbruch kälter?',
    correctAnswers: ['0,5', '0.5', 'halb', 'ein halb'],
    icon: '🥶',
  },
  {
    question: 'Wie hoch spritzt der Geysir (in Metern)?',
    correctAnswers: ['40', '50', '60', '40-60', '40 bis 60'],
    icon: '💦',
  },
];

// UNTERSTUFE: Zeit-Video
const ZEIT_VIDEO = {
  url: 'https://www.youtube.com/watch?v=E98Ni7jh9wY',
  embedUrl: 'https://www.youtube.com/embed/E98Ni7jh9wY',
  title: 'Das Rätsel der Zeit',
  duration: '15 Minuten',
};

const ZEIT_VIDEO_QUIZ = [
  {
    question: 'Welcher Philosoph hat im 5. Jahrhundert als einer der Ersten auf das Mysterium der Zeit hingewiesen?',
    correctAnswers: ['augustinus', 'augustin', 'hippo'],
    icon: '📜',
  },
  {
    question: 'Laut dem französischen Philosophen Paul Janet: Mit welchem Alter haben wir bereits "das meiste wahrgenommen"?',
    correctAnswers: ['18', 'achtzehn'],
    icon: '🧠',
  },
  {
    question: 'Wie lange dauert laut Forschung die "Gegenwart"?',
    correctAnswers: ['3', 'drei', '3 sekunden', 'drei sekunden'],
    icon: '⏱️',
  },
  {
    question: 'Wer brachte im Jahr 263 v. Chr. die erste Sonnenuhr nach Rom?',
    correctAnswers: ['messalla', 'konsul messalla'],
    icon: '☀️',
  },
  {
    question: 'Im Jahr 46 v. Chr. ließ Julius Cäsar 90 Tage anhängen. Wie viele Tage hatte dieses Jahr insgesamt?',
    correctAnswers: ['445', 'vierhundertfünfundvierzig'],
    icon: '📅',
  },
  {
    question: 'Was entdeckte Hudson Hoagland, als seine Frau Fieber hatte?',
    correctAnswers: ['zeit', 'zeitwahrnehmung', 'temperatur', 'körpertemperatur'],
    icon: '🤒',
  },
  {
    question: 'Wie viele Minuten zählte der Taucher Lars im 3-Grad-Wasser, obwohl real 3:43 vergangen waren?',
    correctAnswers: ['3', 'drei', '3 minuten'],
    icon: '🥶',
  },
  {
    question: 'Wie alt ist die Erde laut NASA (durch Mondgestein bestätigt)?',
    correctAnswers: ['4,5', '4.5', '4,5 milliarden', '4.5 milliarden'],
    icon: '🌍',
  },
];

const BLEISTIFT_WORKSHEET_GRUNDSCHULE = {
  title: 'Schmetterlinge',
  content: [
    {
      id: 'absatz1',
      text: 'Schmetterlinge haben vier Flügel, die mit winzigen Schuppen bedeckt sind. Diese Schuppen geben ihnen ihre bunten Farben.',
      placeholder: 'Dein Faden: Was fällt dir dazu ein?',
    },
    {
      id: 'absatz2',
      text: 'Bevor ein Schmetterling fliegen kann, war er eine Raupe. Diese Verwandlung nennt man Metamorphose.',
      placeholder: 'Dein Faden: Woran erinnert dich das?',
    },
    {
      id: 'absatz3',
      text: 'Schmetterlinge schmecken mit ihren Füßen! Wenn sie auf einer Blume landen, wissen sie sofort, ob sie lecker ist.',
      placeholder: 'Dein Faden: Was denkst du dazu?',
    },
  ],
};

const BLEISTIFT_WORKSHEET_UNTERSTUFE = {
  title: 'Zeitwahrnehmung',
  content: [
    {
      id: 'absatz1',
      text: 'Je älter wir werden, desto schneller scheint die Zeit zu vergehen. Das liegt daran, dass wir weniger "neue" Erfahrungen machen und unser Gehirn weniger Erinnerungen speichert.',
      placeholder: 'Dein Faden: Kennst du das Gefühl? Wann verging Zeit für dich schnell/langsam?',
    },
    {
      id: 'absatz2',
      text: 'Bei Langeweile tickt unsere innere Uhr langsamer, weil das Gehirn wenig zu verarbeiten hat. Bei spannenden Aktivitäten vergeht die Zeit "wie im Flug".',
      placeholder: 'Dein Faden: Welche Situationen fallen dir ein?',
    },
    {
      id: 'absatz3',
      text: 'Körpertemperatur beeinflusst die Zeitwahrnehmung: Bei Fieber tickt die innere Uhr schneller (Zeit fühlt sich länger an), bei Kälte langsamer.',
      placeholder: 'Dein Faden: Überrascht dich das? Was verbindest du damit?',
    },
  ],
};

const MISSION_DAYS_GRUNDSCHULE = [
  { day: 1, name: 'Tag 1', task: 'Probiere im HSU-Unterricht genau 10 Minuten lang die Fadenmethode aus. Schreibe nur DEINE Gedanken auf!', icon: '🏫', prompt: 'Wie hat es geklappt? Was ist dir eingefallen?' },
  { day: 2, name: 'Tag 2', task: 'Erkläre jemandem das Faden-Prinzip! (Eltern, Geschwister, Freund)', icon: '🗣️', prompt: 'Wem hast du es erklärt? Hat die Person es verstanden?' },
  { day: 3, name: 'Tag 3', task: 'Wenn du ein Arbeitsblatt lernst: Schreibe bei jedem Abschnitt deinen Faden mit Bleistift dazu!', icon: '✏️', prompt: 'Bei welchem Arbeitsblatt hast du Fäden notiert? Hat es geholfen?' },
  { day: 4, name: 'Tag 4', task: 'Reflexion: In der Challenge hast du die Fadenmethode bei Wörtern, Fakten, Video und Arbeitsblatt getestet. Was hat für DICH am besten funktioniert?', icon: '🤔', prompt: 'Was hat am besten funktioniert? Warum glaubst du?' },
  { day: 5, name: 'Tag 5', task: 'Feiere deine Fäden! Du hast eine neue Lernmethode gelernt!', icon: '🎉', prompt: 'Was war dein größter Aha-Moment? Wirst du die Fadenmethode weiter nutzen?' },
];

const MISSION_DAYS_UNTERSTUFE = [
  { day: 1, name: 'Tag 1', task: 'Teste die Faden-Methode in einer Schulstunde: Schreib NICHT mit was der Lehrer sagt, sondern nur deine eigenen Gedanken und Assoziationen dazu.', icon: '🏫', prompt: 'Wie viel hast du behalten? War es mehr oder weniger als sonst?' },
  { day: 2, name: 'Tag 2', task: 'Erkläre jemandem das Faden-Prinzip und warum "Bulimielernen" nicht funktioniert.', icon: '🗣️', prompt: 'Wem hast du es erklärt? Wie hat die Person reagiert?' },
  { day: 3, name: 'Tag 3', task: 'Lies einen Text für die Schule und mache Randnotizen mit Bleistift: Nur DEINE Gedanken, nicht den Inhalt!', icon: '✏️', prompt: 'Welchen Text hast du gelesen? Wie viel ist hängengeblieben?' },
  { day: 4, name: 'Tag 4', task: 'Reflexion: Du hast die Fadenmethode bei Wörtern, Fakten, Video und Text getestet. Bei welcher Methode waren deine "Fäden" am stärksten?', icon: '🤔', prompt: 'Was funktioniert für dich am besten? Warum glaubst du ist das so?' },
  { day: 5, name: 'Tag 5', task: 'Abschluss: Du hast das Faden-Prinzip gemeistert! Ab jetzt weißt du: Nicht der Stoff ist schwer – es fehlt nur der richtige Faden.', icon: '🎓', prompt: 'Was nimmst du mit? Wirst du die Methode weiter nutzen?' },
];

const BIRKENBIHL_QUOTES = [
  '"Ob etwas leicht oder schwer ist, hat NUR damit zu tun, ob du einen Faden hast!"',
  '"Nicht aufschreiben was der andere sagt – sondern was DU denkst!"',
  '"Wer einen Faden hat, vergisst nie wieder!"',
];

export const DEFAULT_FAEDEN_PROGRESS: FaedenProgress = {
  completedStations: [],
  experimentAssociations: {},
  gedankenjagdThoughts: {},
  bleistiftNotes: [],
  checkerThoughts: '',
  checkerQuizAnswers: {},
  missionDays: {},
  totalXP: 0,
  certificateEarned: false,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function getCurrentMissionDay(startDate?: string): number {
  if (!startDate) return 0;
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffTime = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.min(Math.max(diffDays + 1, 1), 7);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
  });
}

// ============================================
// HAUPT-KOMPONENTE
// ============================================

export function FaedenChallenge({
  onClose,
  savedProgress,
  onSaveProgress,
  startAtMission = false,
  previewMode = false,
  ageGroup = 'grundschule',
}: FaedenChallengeProps) {
  // Content basierend auf Altersgruppe
  const content = getContent(ageGroup);

  const [progress, setProgress] = useState<FaedenProgress>(
    savedProgress || DEFAULT_FAEDEN_PROGRESS
  );

  const [state, setState] = useState<ChallengeState>(() => {
    if (startAtMission && savedProgress?.missionStartDate) {
      return {
        currentView: 'station',
        selectedStation: 'mission',
        stationStep: 'exercise',
      };
    }
    return {
      currentView: 'overview',
      selectedStation: null,
      stationStep: 'intro',
    };
  });

  const [showXPReward, setShowXPReward] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    onSaveProgress?.(progress);
  }, [progress, onSaveProgress]);

  const completedDaysCount = Object.values(progress.missionDays).filter(d => d.completed).length;
  const allDaysComplete = completedDaysCount === 7;
  const baseStationsComplete = ['experiment', 'gedankenjagd', 'bleistift'].every(
    s => progress.completedStations.includes(s as StationKey)
  );
  const allComplete = baseStationsComplete && allDaysComplete;

  const showXP = (xp: number) => {
    setShowXPReward(xp);
    setTimeout(() => setShowXPReward(null), 2500);
  };

  const completeStation = useCallback((station: StationKey, xp: number) => {
    setProgress(prev => {
      if (prev.completedStations.includes(station)) return prev;
      return {
        ...prev,
        completedStations: [...prev.completedStations, station],
        totalXP: prev.totalXP + xp,
      };
    });
    showXP(xp);
    setState({ currentView: 'overview', selectedStation: null, stationStep: 'intro' });
  }, []);

  const startMission = useCallback(() => {
    setProgress(prev => {
      if (prev.missionStartDate) return prev;
      const newCompleted: StationKey[] = prev.completedStations.includes('mission')
        ? prev.completedStations
        : [...prev.completedStations, 'mission' as StationKey];
      return {
        ...prev,
        completedStations: newCompleted,
        missionStartDate: new Date().toISOString(),
      };
    });
  }, []);

  const completeDay = useCallback((dayNumber: number, reflection: string) => {
    setProgress(prev => {
      if (prev.missionDays[dayNumber]?.completed) return prev;

      const newMissionDays = {
        ...prev.missionDays,
        [dayNumber]: {
          completed: true,
          reflection,
          completedAt: new Date().toISOString(),
        },
      };

      let newXP = prev.totalXP + XP_PER_DAY;
      let certificateEarned = prev.certificateEarned;

      const allDone = Object.keys(newMissionDays).length === 7 &&
        Object.values(newMissionDays).every(d => d.completed);

      if (allDone && !prev.certificateEarned) {
        newXP += XP_BONUS_7_DAYS;
        certificateEarned = true;
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }

      return {
        ...prev,
        missionDays: newMissionDays,
        totalXP: newXP,
        certificateEarned,
      };
    });
    showXP(XP_PER_DAY);
  }, []);

  const selectStation = (key: StationKey) => {
    setState({ currentView: 'station', selectedStation: key, stationStep: 'intro' });
  };

  const goToExercise = () => {
    setState(prev => ({ ...prev, stationStep: 'exercise' }));
  };

  const backToOverview = () => {
    setState({ currentView: 'overview', selectedStation: null, stationStep: 'intro' });
  };

  const showCertificate = () => {
    setState({ currentView: 'certificate', selectedStation: null, stationStep: 'intro' });
  };

  const saveExperimentAssociation = (word: string, association: string) => {
    setProgress(prev => ({
      ...prev,
      experimentAssociations: { ...prev.experimentAssociations, [word]: association },
    }));
  };

  const saveGedankenjagdThought = (factId: string, thought: string) => {
    setProgress(prev => ({
      ...prev,
      gedankenjagdThoughts: { ...prev.gedankenjagdThoughts, [factId]: thought },
    }));
  };

  const saveBleistiftNote = (index: number, note: string) => {
    setProgress(prev => {
      const newNotes = [...prev.bleistiftNotes];
      newNotes[index] = note;
      return { ...prev, bleistiftNotes: newNotes };
    });
  };

  const saveCheckerThoughts = (thoughts: string) => {
    setProgress(prev => ({ ...prev, checkerThoughts: thoughts }));
  };

  const saveCheckerQuizAnswer = (index: number, answer: string) => {
    setProgress(prev => ({
      ...prev,
      checkerQuizAnswers: { ...prev.checkerQuizAnswers, [index]: answer },
    }));
  };

  const currentStation = state.selectedStation
    ? content.stations.find(s => s.key === state.selectedStation)
    : null;

  const currentMissionDay = getCurrentMissionDay(progress.missionStartDate);

  return (
    <div className="faeden-challenge">
      {/* Header */}
      <div className="challenge-header">
        <button className="back-btn" onClick={onClose}>← Zurück</button>
        <h1 className="challenge-title">
          <motion.span
            className="title-icon"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            🧵
          </motion.span>
          Station der Fäden
        </h1>
        <div className="xp-badge">
          <motion.span
            className="xp-icon"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            ⭐
          </motion.span>
          <span className="xp-amount">{progress.totalXP} XP</span>
        </div>
      </div>

      {/* Subtitle */}
      <motion.div
        className="subtitle-bar"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="subtitle-text">Das Faden-Prinzip nach Birkenbihl</span>
        <span className="effect-badge">Assoziatives Lernen</span>
      </motion.div>

      {/* Progress */}
      <div className="progress-container">
        <div className="progress-bar">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${((progress.completedStations.length + completedDaysCount) / 10) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <span className="progress-text">
          {progress.completedStations.length} Stationen + {completedDaysCount}/5 Tage
        </span>
      </div>

      {/* XP Reward */}
      <AnimatePresence>
        {showXPReward && (
          <motion.div
            className="xp-reward-popup"
            initial={{ scale: 0, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0, y: -50, opacity: 0 }}
          >
            <motion.span
              className="xp-reward-amount"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: 2, duration: 0.3 }}
            >
              +{showXPReward} XP!
            </motion.span>
            <span className="xp-reward-stars">⭐✨⭐</span>
          </motion.div>
        )}
      </AnimatePresence>

      {showConfetti && <ConfettiEffect />}

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {state.currentView === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="stations-overview"
          >
            <p className="overview-intro">
              Entdecke das Geheimnis der Fäden – warum manche Sachen "hängenbleiben"
              und andere nicht! Tippe auf eine Station, um loszulegen. 🧶
            </p>

            <div className="stations-grid">
              {content.stations.map((station, index) => {
                const isCompleted = progress.completedStations.includes(station.key);
                const isMission = station.key === 'mission';
                const missionActive = isMission && progress.missionStartDate;

                return (
                  <StationCard
                    key={station.key}
                    station={station}
                    index={index}
                    isCompleted={isCompleted}
                    isMissionActive={!!missionActive}
                    missionProgress={isMission ? `${completedDaysCount}/7` : undefined}
                    onClick={() => selectStation(station.key)}
                  />
                );
              })}
            </div>

            <motion.div
              className="birkenbihl-quote"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <span className="quote-icon">💬</span>
              <blockquote>
                {BIRKENBIHL_QUOTES[progress.completedStations.length % BIRKENBIHL_QUOTES.length]}
              </blockquote>
              <cite>— Vera F. Birkenbihl</cite>
            </motion.div>

            {allComplete && (
              <motion.div
                className="all-complete-banner"
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: 'spring', bounce: 0.5 }}
              >
                <motion.span
                  className="banner-icon"
                  animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  🎓
                </motion.span>
                <span className="banner-text">SUPER! Du bist jetzt ein Faden-Meister!</span>
                <button className="certificate-btn" onClick={showCertificate}>
                  🏆 Zertifikat ansehen
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {state.currentView === 'station' && currentStation && (
          <motion.div
            key="station"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            {state.selectedStation === 'experiment' && (
              <ExperimentStation
                station={currentStation}
                step={state.stationStep}
                associations={progress.experimentAssociations}
                experimentWords={content.experimentWords}
                onSaveAssociation={saveExperimentAssociation}
                onGoToExercise={goToExercise}
                onComplete={() => completeStation('experiment', currentStation.xp)}
                onBack={backToOverview}
              />
            )}
            {state.selectedStation === 'gedankenjagd' && (
              <GedankenjagdStation
                station={currentStation}
                step={state.stationStep}
                thoughts={progress.gedankenjagdThoughts}
                gedankenjagdFacts={content.gedankenjagdFacts}
                onSaveThought={saveGedankenjagdThought}
                onGoToExercise={goToExercise}
                onComplete={() => completeStation('gedankenjagd', currentStation.xp)}
                onBack={backToOverview}
              />
            )}
            {state.selectedStation === 'bleistift' && (
              <BleistiftStation
                station={currentStation}
                step={state.stationStep}
                notes={progress.bleistiftNotes}
                worksheet={content.bleistiftWorksheet}
                onSaveNote={saveBleistiftNote}
                onGoToExercise={goToExercise}
                onComplete={() => completeStation('bleistift', currentStation.xp)}
                onBack={backToOverview}
              />
            )}
            {state.selectedStation === 'checker' && (
              <VideoStation
                station={currentStation}
                step={state.stationStep}
                quizAnswers={progress.checkerQuizAnswers}
                video={content.video}
                videoQuiz={content.videoQuiz}
                isUnterstufe={content.isUnterstufe}
                onSaveQuizAnswer={saveCheckerQuizAnswer}
                onGoToExercise={goToExercise}
                onComplete={() => completeStation('checker', currentStation.xp)}
                onBack={backToOverview}
              />
            )}
            {state.selectedStation === 'mission' && (
              <MissionStation
                station={currentStation}
                step={state.stationStep}
                missionStartDate={progress.missionStartDate}
                missionDays={progress.missionDays}
                missionDaysData={content.missionDays}
                currentDay={currentMissionDay}
                previewMode={previewMode}
                onStartMission={startMission}
                onCompleteDay={completeDay}
                onGoToExercise={goToExercise}
                onBack={backToOverview}
              />
            )}
          </motion.div>
        )}

        {state.currentView === 'certificate' && (
          <motion.div
            key="certificate"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
          >
            <CertificateView progress={progress} onBack={backToOverview} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// STATION CARD
// ============================================

interface StationCardProps {
  station: StationData;
  index: number;
  isCompleted: boolean;
  isMissionActive?: boolean;
  missionProgress?: string;
  onClick: () => void;
}

function StationCard({
  station,
  index,
  isCompleted,
  isMissionActive,
  missionProgress,
  onClick
}: StationCardProps) {
  return (
    <motion.button
      className={`station-card ${isCompleted ? 'completed' : ''} ${isMissionActive ? 'mission-active' : ''}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.05, rotate: [-1, 1, -1, 0] }}
      whileTap={{ scale: 0.95 }}
      style={{ '--station-color': station.color } as React.CSSProperties}
    >
      <div className="card-glow" />
      <motion.span
        className="station-icon"
        animate={isCompleted ? {} : { y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 2, delay: index * 0.2 }}
      >
        {station.icon}
      </motion.span>
      <span className="station-name">{station.name}</span>
      <span className="station-description">{station.description}</span>

      {isCompleted && !isMissionActive && (
        <motion.div className="completed-badge" initial={{ scale: 0 }} animate={{ scale: 1 }}>
          ✓
        </motion.div>
      )}

      {isMissionActive && missionProgress && (
        <motion.div className="mission-progress-badge" initial={{ scale: 0 }} animate={{ scale: 1 }}>
          {missionProgress}
        </motion.div>
      )}

      <div className="xp-preview">
        <span>+{station.xp} XP</span>
      </div>
    </motion.button>
  );
}

// ============================================
// STATION 1: FADEN-EXPERIMENT
// ============================================

interface ExperimentStationProps {
  station: StationData;
  step: StationStep;
  associations: Record<string, string>;
  experimentWords: typeof EXPERIMENT_WORDS_GRUNDSCHULE;
  onSaveAssociation: (word: string, association: string) => void;
  onGoToExercise: () => void;
  onComplete: () => void;
  onBack: () => void;
}

function ExperimentStation({
  station, step, associations, experimentWords, onSaveAssociation, onGoToExercise, onComplete, onBack,
}: ExperimentStationProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showRecall, setShowRecall] = useState(false);
  const [typedWords, setTypedWords] = useState<string[]>(['', '', '', '', '']);

  const currentWord = experimentWords[currentWordIndex];
  const isLastWord = currentWordIndex === experimentWords.length - 1;

  const handleNext = () => {
    if (isLastWord) {
      setShowRecall(true);
    } else {
      setCurrentWordIndex(prev => prev + 1);
    }
  };

  const handleTypedWord = (index: number, value: string) => {
    setTypedWords(prev => {
      const newWords = [...prev];
      newWords[index] = value;
      return newWords;
    });
  };

  // Check which typed words match the experiment words (case-insensitive)
  const correctWords = typedWords.filter(typed =>
    typed.trim() !== '' &&
    experimentWords.some(w => w.word.toLowerCase() === typed.trim().toLowerCase())
  );
  const recalledCount = correctWords.length;

  return (
    <div className="station-container">
      <StationHeader station={station} onBack={onBack} />
      <div className="station-content">
        <AnimatePresence mode="wait">
          {step === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="intro-content"
            >
              <div className="intro-card">
                <span className="intro-icon">🧪</span>
                <h3>Das Original-Experiment!</h3>
                <p>Vera Birkenbihl hat dieses Experiment mit <strong>über 30.000 Menschen</strong> gemacht!</p>
                <p>Du wirst gleich 5 Wörter sehen. Aber Achtung – es gibt besondere Regeln!</p>
              </div>
              <div className="rules-card">
                <h4>📋 Die Regeln:</h4>
                <ul>
                  <li>❌ Du darfst die Wörter <strong>NICHT</strong> aufschreiben!</li>
                  <li>❌ Du darfst sie dir <strong>NICHT</strong> merken wollen!</li>
                  <li>✅ Du schreibst nur auf: <strong>Was fällt MIR dazu ein?</strong></li>
                </ul>
              </div>
              <motion.button className="start-btn" onClick={onGoToExercise} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                Los geht's! 🚀
              </motion.button>
            </motion.div>
          )}

          {step === 'exercise' && !showRecall && (
            <motion.div
              key={`word-${currentWordIndex}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="word-exercise"
            >
              <div className="word-counter">Wort {currentWordIndex + 1} von {experimentWords.length}</div>
              <motion.div className="word-card" initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.4 }}>
                <span className="word-icon">{currentWord.icon}</span>
                <span className="word-text">{currentWord.word}</span>
              </motion.div>
              <p className="word-hint">💡 {currentWord.hint}</p>
              <div className="association-input-container">
                <label>Deine Gedanken dazu:</label>
                <textarea
                  className="association-input"
                  placeholder="Was fällt DIR ein? (Nicht das Wort wiederholen!)"
                  value={associations[currentWord.word] || ''}
                  onChange={(e) => onSaveAssociation(currentWord.word, e.target.value)}
                  rows={3}
                />
              </div>
              <motion.button
                className="next-btn"
                onClick={handleNext}
                disabled={!associations[currentWord.word]?.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isLastWord ? 'Fertig! 🎉' : 'Nächstes Wort →'}
              </motion.button>
            </motion.div>
          )}

          {step === 'exercise' && showRecall && (
            <motion.div key="recall" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="recall-phase">
              <div className="recall-header">
                <span className="recall-icon">🧠</span>
                <h3>Überraschung!</h3>
                <p>An welche Wörter kannst du dich erinnern?</p>
                <p className="recall-hint">(Schreibe die Wörter, an die du dich erinnerst)</p>
              </div>
              <div className="recall-inputs">
                {[0, 1, 2, 3, 4].map((i) => {
                  const typedValue = typedWords[i];
                  const isCorrect = typedValue.trim() !== '' &&
                    experimentWords.some(w => w.word.toLowerCase() === typedValue.trim().toLowerCase());
                  return (
                    <motion.div
                      key={i}
                      className="recall-input-wrapper"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <input
                        type="text"
                        className={`recall-input ${isCorrect ? 'correct' : ''}`}
                        placeholder={`Wort ${i + 1}...`}
                        value={typedValue}
                        onChange={(e) => handleTypedWord(i, e.target.value)}
                      />
                      {isCorrect && <span className="correct-mark">✓</span>}
                    </motion.div>
                  );
                })}
              </div>
              <motion.div className="recall-result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                <p className="result-count">Du erinnerst dich an <strong>{recalledCount}</strong> von 5 Wörtern!</p>
                {recalledCount >= 3 && (
                  <p className="result-success">🎉 Super! Das ist mehr als beim normalen Auswendiglernen!</p>
                )}
                <p className="result-explanation">
                  <strong>Das ist das Geheimnis:</strong> Weil du deine eigenen Gedanken aufgeschrieben hast, haben sich die Wörter an deine "Fäden" gehängt!
                </p>
              </motion.div>
              <motion.button className="complete-btn" onClick={onComplete} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                Station abschließen ✓
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================
// STATION 2: GEDANKEN-JAGD
// ============================================

interface GedankenjagdStationProps {
  station: StationData;
  step: StationStep;
  thoughts: Record<string, string>;
  gedankenjagdFacts: typeof GEDANKENJAGD_FACTS_GRUNDSCHULE;
  onSaveThought: (factId: string, thought: string) => void;
  onGoToExercise: () => void;
  onComplete: () => void;
  onBack: () => void;
}

function GedankenjagdStation({
  station, step, thoughts, gedankenjagdFacts, onSaveThought, onGoToExercise, onComplete, onBack,
}: GedankenjagdStationProps) {
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});

  const currentFact = gedankenjagdFacts[currentFactIndex];
  const isLastFact = currentFactIndex === gedankenjagdFacts.length - 1;

  // Count total questions across all facts
  const totalQuestions = gedankenjagdFacts.reduce((sum, f) => sum + f.quizQuestions.length, 0);

  const handleNext = () => {
    if (isLastFact) {
      setShowQuiz(true);
    } else {
      setCurrentFactIndex(prev => prev + 1);
    }
  };

  const handleQuizAnswer = (questionKey: string, answer: string) => {
    setQuizAnswers(prev => ({ ...prev, [questionKey]: answer }));
  };

  const checkAnswer = (questionKey: string, correctAnswers: string[]): boolean => {
    const answer = quizAnswers[questionKey]?.toLowerCase().trim() || '';
    if (!answer) return false;
    return correctAnswers.some(correct => answer.includes(correct.toLowerCase()));
  };

  // Count correct answers across all questions
  const correctCount = gedankenjagdFacts.reduce((sum, fact) => {
    return sum + fact.quizQuestions.filter((q, idx) =>
      checkAnswer(`${fact.id}-${idx}`, q.correctAnswers)
    ).length;
  }, 0);

  return (
    <div className="station-container">
      <StationHeader station={station} onBack={onBack} />
      <div className="station-content">
        <AnimatePresence mode="wait">
          {step === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="intro-content">
              <div className="intro-card">
                <span className="intro-icon">💭</span>
                <h3>Gedanken-Jagd!</h3>
                <p>Jetzt lernst du die <strong>Anti-Mitschreib-Methode</strong>!</p>
                <p>Du hörst Fakten – aber schreibst <strong>NICHT</strong> den Fakt auf, sondern nur <strong>DEINE Gedanken</strong> dazu!</p>
              </div>
              <div className="example-card">
                <h4>Beispiel:</h4>
                <p><strong>Fakt:</strong> "Schmetterlinge haben vier Flügel."</p>
                <p>❌ Falsch: "Schmetterlinge haben 4 Flügel" aufschreiben</p>
                <p>✅ Richtig: "Erinnert mich an den bunten im Garten!" aufschreiben</p>
              </div>
              <motion.button className="start-btn" onClick={onGoToExercise} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                Auf die Jagd! 🎯
              </motion.button>
            </motion.div>
          )}

          {step === 'exercise' && !showQuiz && (
            <motion.div key={`fact-${currentFactIndex}`} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="fact-exercise">
              <div className="fact-counter">Fakt {currentFactIndex + 1} von {gedankenjagdFacts.length}</div>
              <motion.div className="fact-card" initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.4 }}>
                <span className="fact-icon">{currentFact.icon}</span>
                <p className="fact-text">{currentFact.fact}</p>
              </motion.div>
              <div className="thought-input-container">
                <label>{currentFact.prompt}</label>
                <textarea
                  className="thought-input"
                  placeholder="Schreib DEINE Gedanken – nicht den Fakt wiederholen!"
                  value={thoughts[currentFact.id] || ''}
                  onChange={(e) => onSaveThought(currentFact.id, e.target.value)}
                  rows={3}
                />
              </div>
              <motion.button
                className="next-btn"
                onClick={handleNext}
                disabled={!thoughts[currentFact.id]?.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isLastFact ? 'Weiter zum Quiz! 🎯' : 'Nächster Fakt →'}
              </motion.button>
            </motion.div>
          )}

          {step === 'exercise' && showQuiz && (
            <motion.div key="quiz" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="quiz-phase">
              <div className="quiz-header">
                <span className="quiz-icon">🎯</span>
                <h3>Überraschungs-Quiz!</h3>
                <p>Mal sehen, was du dir gemerkt hast...</p>
                <p className="quiz-hint">(Obwohl du nur deine Gedanken aufgeschrieben hast!)</p>
              </div>

              <div className="quiz-questions">
                {gedankenjagdFacts.map((fact, factIndex) => {
                  // Check if any question for this fact has been answered
                  const hasAnyAnswer = fact.quizQuestions.some((_, qIdx) =>
                    quizAnswers[`${fact.id}-${qIdx}`]?.trim()
                  );

                  return (
                    <motion.div
                      key={fact.id}
                      className="quiz-fact-group"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: factIndex * 0.2 }}
                    >
                      <div className="quiz-fact-header">
                        <span className="quiz-fact-icon">{fact.icon}</span>
                      </div>

                      {fact.quizQuestions.map((q, qIndex) => {
                        const questionKey = `${fact.id}-${qIndex}`;
                        const answer = quizAnswers[questionKey] || '';
                        const isCorrect = checkAnswer(questionKey, q.correctAnswers);
                        const hasAnswer = answer.trim() !== '';

                        return (
                          <div key={questionKey} className="quiz-question-item">
                            <span className="quiz-question-text">{q.question}</span>
                            <div className="quiz-answer-wrapper">
                              <input
                                type="text"
                                className={`quiz-answer-input ${hasAnswer ? (isCorrect ? 'correct' : '') : ''}`}
                                placeholder="Deine Antwort..."
                                value={answer}
                                onChange={(e) => handleQuizAnswer(questionKey, e.target.value)}
                              />
                              {hasAnswer && isCorrect && <span className="correct-mark">✓</span>}
                            </div>
                          </div>
                        );
                      })}

                      {hasAnyAnswer && (
                        <motion.div
                          className="your-thought"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <span className="thought-label">Dein Faden:</span> {thoughts[fact.id]}
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              <motion.div className="quiz-result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                <p className="result-count">
                  Du erinnerst dich an <strong>{correctCount}</strong> von {totalQuestions} Details!
                </p>
                {correctCount >= 4 && (
                  <p className="result-success">🎉 Wow! Deine eigenen Gedanken haben dir geholfen, dich an so viele Details zu erinnern!</p>
                )}
                {correctCount >= 2 && correctCount < 4 && (
                  <p className="result-success">👍 Gut gemacht! Deine Fäden haben funktioniert!</p>
                )}
                <p className="result-explanation">
                  <strong>Das Geheimnis:</strong> Weil du DEINE Gedanken aufgeschrieben hast, haben sich die Fakten an deine "Fäden" gehängt – ganz von alleine!
                </p>
              </motion.div>

              <motion.button className="complete-btn" onClick={onComplete} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                Station abschließen ✓
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================
// STATION 3: BLEISTIFT-METHODE
// ============================================

interface BleistiftStationProps {
  station: StationData;
  step: StationStep;
  notes: string[];
  worksheet: typeof BLEISTIFT_WORKSHEET_GRUNDSCHULE;
  onSaveNote: (index: number, note: string) => void;
  onGoToExercise: () => void;
  onComplete: () => void;
  onBack: () => void;
}

function BleistiftStation({
  station, step, notes, worksheet, onSaveNote, onGoToExercise, onComplete, onBack,
}: BleistiftStationProps) {
  const allNotesComplete = worksheet.content.every((_, i) => notes[i]?.trim());

  return (
    <div className="station-container">
      <StationHeader station={station} onBack={onBack} />
      <div className="station-content">
        <AnimatePresence mode="wait">
          {step === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="intro-content">
              <div className="intro-card">
                <span className="intro-icon">✏️</span>
                <h3>Dein Geheimtrick für die Schule!</h3>
                <p>In der Schule <strong>MUSST</strong> du ja mitschreiben – das ist Realität.</p>
                <p>Aber hier ist der Trick: Mit <strong>Bleistift</strong> schreibst du am Rand deine <strong>eigenen Fäden</strong> dazu!</p>
              </div>
              <div className="benefits-card">
                <h4>Vorteile:</h4>
                <ul>
                  <li>✅ Unauffällig (Bleistift kann radiert werden)</li>
                  <li>✅ Funktioniert in jedem Fach</li>
                  <li>✅ Sofort umsetzbar</li>
                  <li>✅ Dein Wissen bleibt hängen!</li>
                </ul>
              </div>
              <motion.button className="start-btn" onClick={onGoToExercise} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                Ausprobieren! ✏️
              </motion.button>
            </motion.div>
          )}

          {step === 'exercise' && (
            <motion.div key="worksheet" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="worksheet-simulation">
              <div className="worksheet-header">
                <span className="worksheet-icon">📄</span>
                <h3>Arbeitsblatt: {worksheet.title}</h3>
                <p className="worksheet-instruction">Lies jeden Abschnitt und schreibe mit "Bleistift" ✏️ deine Fäden daneben!</p>
              </div>
              <div className="worksheet-content">
                {worksheet.content.map((section, index) => (
                  <motion.div
                    key={section.id}
                    className="worksheet-section"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.15 }}
                  >
                    <div className="section-text"><p>{section.text}</p></div>
                    <div className="section-note">
                      <div className="pencil-indicator">✏️</div>
                      <textarea
                        className="pencil-note-input"
                        placeholder={section.placeholder}
                        value={notes[index] || ''}
                        onChange={(e) => onSaveNote(index, e.target.value)}
                        rows={2}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
              <motion.div className="worksheet-tip" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                <span className="tip-icon">💡</span>
                <p><strong>Tipp für die Schule:</strong> Mach das bei echten Arbeitsblättern und Hefteeinträgen – du wirst sehen, wie viel mehr hängenbleibt!</p>
              </motion.div>
              <motion.button
                className="complete-btn"
                onClick={onComplete}
                disabled={!allNotesComplete}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Station abschließen ✓
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================
// STATION 4: CHECKER JULIAN CHALLENGE
// ============================================

interface VideoStationProps {
  station: StationData;
  step: StationStep;
  quizAnswers: Record<number, string>;
  video: typeof CHECKER_JULIAN_VIDEO;
  videoQuiz: typeof CHECKER_JULIAN_QUIZ;
  isUnterstufe?: boolean;
  onSaveQuizAnswer: (index: number, answer: string) => void;
  onGoToExercise: () => void;
  onComplete: () => void;
  onBack: () => void;
}

function VideoStation({
  station, step, quizAnswers, video, videoQuiz, isUnterstufe, onSaveQuizAnswer, onGoToExercise, onComplete, onBack,
}: VideoStationProps) {
  const [showQuiz, setShowQuiz] = useState(false);

  const checkAnswer = (index: number): boolean => {
    const answer = quizAnswers[index]?.toLowerCase().trim() || '';
    if (!answer) return false;
    return videoQuiz[index].correctAnswers.some(correct =>
      answer.includes(correct.toLowerCase())
    );
  };

  const correctCount = videoQuiz.filter((_, idx) => checkAnswer(idx)).length;

  const handleVideoWatched = () => {
    setShowQuiz(true);
  };

  return (
    <div className="station-container checker-station">
      <StationHeader station={station} onBack={onBack} />
      <div className="station-content">
        <AnimatePresence mode="wait">
          {step === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="intro-content">
              <div className="intro-card">
                <span className="intro-icon">{isUnterstufe ? '⏰' : '🌋'}</span>
                <h3>{video.title}</h3>
                <p>{isUnterstufe
                  ? 'Eine spannende Doku über Zeit und Zeitwahrnehmung. Wende das Faden-Prinzip an!'
                  : 'Jetzt wird es spannend! Du schaust ein echtes Video und wendest das Faden-Prinzip an.'
                }</p>
              </div>
              <div className="example-card">
                <h4>So geht's:</h4>
                <p>1️⃣ Schau das Video ({video.duration})</p>
                <p>2️⃣ Hol dir ein <strong>leeres Blatt Papier</strong> und einen <strong>Bleistift</strong></p>
                <p>3️⃣ Schreibe <strong>auf Papier</strong> NUR deine eigenen Gedanken</p>
                <p>4️⃣ Dann kommt das Überraschungs-Quiz!</p>
              </div>
              <motion.button className="start-btn" onClick={onGoToExercise} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                Los geht's! 🎬
              </motion.button>
            </motion.div>
          )}

          {step === 'exercise' && !showQuiz && (
            <motion.div key="video" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="video-phase">
              <div className="video-with-instructions">
                <div className="video-side">
                  <div className="video-container">
                    <iframe
                      width="100%"
                      height="220"
                      src={video.embedUrl}
                      title={video.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <p className="video-duration">⏱️ {video.duration}</p>
                </div>
                <div className="writing-instructions">
                  <div className="writing-header">
                    <span className="writing-icon">✏️</span>
                    <h4>Schreib auf dein Papier!</h4>
                  </div>
                  <p>Während du schaust, notiere <strong>DEINE Gedanken</strong>:</p>
                  <ul>
                    <li>"Erinnert mich an..."</li>
                    <li>"Das kenne ich von..."</li>
                    <li>"Cool, weil..."</li>
                    <li>"Oma hat mal erzählt..."</li>
                  </ul>
                  <p className="writing-warning">⚠️ NICHT aufschreiben was Julian sagt!</p>
                </div>
              </div>
              <motion.button className="next-btn" onClick={handleVideoWatched} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                Video fertig! Weiter zum Quiz 🎯
              </motion.button>
            </motion.div>
          )}

          {step === 'exercise' && showQuiz && (
            <motion.div key="quiz" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="quiz-phase checker-quiz">
              <div className="quiz-header">
                <span className="quiz-icon">🎯</span>
                <h3>Überraschungs-Quiz!</h3>
                <p>Mal sehen, was du dir gemerkt hast...</p>
                <p className="quiz-hint">(Schau auf dein Papier – helfen dir deine Fäden?)</p>
              </div>

              <div className="quiz-questions checker-questions">
                {videoQuiz.map((q, idx) => {
                  const answer = quizAnswers[idx] || '';
                  const isCorrect = checkAnswer(idx);
                  const hasAnswer = answer.trim() !== '';

                  return (
                    <motion.div
                      key={idx}
                      className="quiz-question-item"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <div className="quiz-question-header">
                        <span className="quiz-question-icon">{q.icon}</span>
                        <span className="quiz-question-text">{q.question}</span>
                      </div>
                      <div className="quiz-answer-wrapper">
                        <input
                          type="text"
                          className={`quiz-answer-input ${hasAnswer ? (isCorrect ? 'correct' : '') : ''}`}
                          placeholder="Deine Antwort..."
                          value={answer}
                          onChange={(e) => onSaveQuizAnswer(idx, e.target.value)}
                        />
                        {hasAnswer && isCorrect && <span className="correct-mark">✓</span>}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <motion.div className="quiz-result checker-result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                <h4>📊 Dein Ergebnis</h4>

                <div className="result-comparison">
                  <div className="comparison-row">
                    <span className="comparison-label">Ohne Faden-Methode (Durchschnitt):</span>
                    <div className="comparison-bar-container">
                      <div className="comparison-bar average" style={{ width: '20%' }} />
                      <span className="comparison-percent">~20%</span>
                    </div>
                    <span className="comparison-value">1-2 Fakten</span>
                  </div>

                  <div className="comparison-row yours">
                    <span className="comparison-label">DU mit Faden-Methode:</span>
                    <div className="comparison-bar-container">
                      <motion.div
                        className="comparison-bar yours"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.round((correctCount / videoQuiz.length) * 100)}%` }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                      />
                      <span className="comparison-percent">{Math.round((correctCount / videoQuiz.length) * 100)}%</span>
                    </div>
                    <span className="comparison-value">{correctCount} Fakten</span>
                  </div>
                </div>

                {correctCount >= 4 && (
                  <motion.div
                    className="wow-banner"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.5, type: 'spring' }}
                  >
                    <span className="wow-icon">🎉</span>
                    <p>
                      <strong>{Math.round(((correctCount / videoQuiz.length) * 100) / 20)}x besser</strong> als ohne Faden-Methode!
                    </p>
                  </motion.div>
                )}

                {correctCount >= 6 && (
                  <p className="result-success">WAHNSINN! Du hast dir mega viel gemerkt!</p>
                )}
                {correctCount >= 4 && correctCount < 6 && (
                  <p className="result-success">Super! Deine Fäden haben richtig gut funktioniert!</p>
                )}
                {correctCount >= 2 && correctCount < 4 && (
                  <p className="result-success">Gut gemacht! Deine Fäden helfen dir beim Erinnern!</p>
                )}
                {correctCount < 2 && (
                  <p className="result-hint">Tipp: Schreib beim nächsten Mal mehr eigene Gedanken auf – das stärkt deine Fäden!</p>
                )}

                <p className="result-explanation">
                  <strong>Warum funktioniert das?</strong><br />
                  Normale Schüler hören nur zu und vergessen das meiste. DU hast deine eigenen Gedanken aufgeschrieben – dadurch haben sich die Fakten an deine "Fäden" gehängt!
                </p>
              </motion.div>

              <motion.button className="complete-btn" onClick={onComplete} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                Station abschließen ✓
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================
// STATION 5: 7-TAGE-MISSION
// ============================================

interface MissionStationProps {
  station: StationData;
  step: StationStep;
  missionStartDate?: string;
  missionDays: Record<number, DayProgress>;
  missionDaysData: typeof MISSION_DAYS_GRUNDSCHULE;
  currentDay: number;
  previewMode?: boolean;
  onStartMission: () => void;
  onCompleteDay: (dayNumber: number, reflection: string) => void;
  onGoToExercise: () => void;
  onBack: () => void;
}

function MissionStation({
  station, step, missionStartDate, missionDays, missionDaysData, currentDay, previewMode, onStartMission, onCompleteDay, onGoToExercise, onBack,
}: MissionStationProps) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [reflection, setReflection] = useState('');

  const missionStarted = !!missionStartDate;
  const completedDaysCount = Object.values(missionDays).filter(d => d.completed).length;
  const allDaysComplete = completedDaysCount === missionDaysData.length;

  // In preview mode, all days are available
  const effectiveCurrentDay = previewMode ? missionDaysData.length : currentDay;

  const handleStartMission = () => {
    onStartMission();
    onGoToExercise();
  };

  const handleSelectDay = (dayNumber: number) => {
    const existingReflection = missionDays[dayNumber]?.reflection || '';
    setReflection(existingReflection);
    setSelectedDay(dayNumber);
  };

  const handleCompleteDay = () => {
    if (selectedDay && reflection.trim()) {
      onCompleteDay(selectedDay, reflection);
      setSelectedDay(null);
      setReflection('');
    }
  };

  return (
    <div className="station-container">
      <StationHeader station={station} onBack={onBack} />
      <div className="station-content">
        <AnimatePresence mode="wait">
          {step === 'intro' && !missionStarted && (
            <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="intro-content">
              <div className="intro-card mission-intro">
                <span className="intro-icon">🚢</span>
                <h3>Deine 5-Tage-Mission!</h3>
                <p>Du hast jetzt alles gelernt – jetzt wird es <strong>ECHT</strong>!</p>
                <p>Die Faden-Methode wird nur dann zur Superkraft, wenn du sie <strong>jeden Tag</strong> übst.</p>
              </div>
              <div className="mission-preview">
                <h4>📋 Der Plan:</h4>
                <ul>
                  {missionDaysData.slice(0, 3).map(day => (
                    <li key={day.day}>{day.icon} {day.name}: {day.task.slice(0, 40)}...</li>
                  ))}
                  <li>... und 2 weitere Tage!</li>
                </ul>
              </div>
              <motion.button className="start-btn mission-start" onClick={handleStartMission} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                🚢 Mission starten!
              </motion.button>
            </motion.div>
          )}

          {(step === 'exercise' || missionStarted) && !selectedDay && (
            <motion.div key="mission-tracker" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mission-tracker">
              <div className="mission-header">
                <span className="mission-ship">🚢</span>
                <h3>Deine Faden-Reise</h3>
                <p className="mission-status">
                  {allDaysComplete ? `🎉 Alle ${missionDaysData.length} Tage geschafft!` : `Tag ${effectiveCurrentDay} von ${missionDaysData.length} • ${completedDaysCount} Tage erledigt`}
                </p>
                {previewMode && (
                  <span className="preview-mode-badge">👁️ Preview-Modus</span>
                )}
              </div>

              <div className="days-grid">
                {missionDaysData.map((day) => {
                  const dayProgress = missionDays[day.day];
                  const isCompleted = dayProgress?.completed;
                  const isCurrentDay = day.day === effectiveCurrentDay;
                  const isAvailable = day.day <= effectiveCurrentDay;
                  const isFuture = day.day > effectiveCurrentDay;

                  return (
                    <motion.button
                      key={day.day}
                      className={`day-card ${isCompleted ? 'completed' : ''} ${isCurrentDay ? 'current' : ''} ${isFuture ? 'future' : ''}`}
                      onClick={() => isAvailable && handleSelectDay(day.day)}
                      disabled={isFuture}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: day.day * 0.05 }}
                      whileHover={isAvailable ? { scale: 1.05 } : {}}
                      whileTap={isAvailable ? { scale: 0.95 } : {}}
                    >
                      <span className="day-icon">{day.icon}</span>
                      <span className="day-name">{day.name}</span>
                      <span className="day-number">Tag {day.day}</span>

                      {isCompleted && (
                        <motion.div className="day-check" initial={{ scale: 0 }} animate={{ scale: 1 }}>✓</motion.div>
                      )}

                      {isCurrentDay && !isCompleted && (
                        <motion.div className="current-indicator" animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                          HEUTE
                        </motion.div>
                      )}

                      {isFuture && <div className="lock-indicator">🔒</div>}
                    </motion.button>
                  );
                })}
              </div>

              {allDaysComplete && (
                <motion.div className="mission-complete-banner" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <span className="complete-icon">🎓</span>
                  <p>Du hast die 5-Tage-Mission gemeistert!</p>
                  <p className="bonus-xp">+{XP_BONUS_7_DAYS} Bonus-XP!</p>
                </motion.div>
              )}
            </motion.div>
          )}

          {selectedDay && (
            <motion.div key={`day-${selectedDay}`} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="day-detail">
              {(() => {
                const dayInfo = missionDaysData.find(d => d.day === selectedDay)!;
                const isAlreadyComplete = missionDays[selectedDay]?.completed;

                return (
                  <>
                    <button className="day-back-btn" onClick={() => setSelectedDay(null)}>← Zurück zur Übersicht</button>
                    <div className="day-header">
                      <span className="day-big-icon">{dayInfo.icon}</span>
                      <h3>Tag {selectedDay}: {dayInfo.name}</h3>
                    </div>
                    <div className="day-task-card">
                      <h4>📋 Deine Aufgabe:</h4>
                      <p>{dayInfo.task}</p>
                    </div>
                    <div className="reflection-section">
                      <label>{dayInfo.prompt}</label>
                      <textarea
                        className="reflection-input"
                        placeholder="Schreib hier deine Erfahrung..."
                        value={reflection}
                        onChange={(e) => setReflection(e.target.value)}
                        rows={4}
                        disabled={isAlreadyComplete}
                      />
                    </div>
                    {isAlreadyComplete ? (
                      <div className="already-complete">
                        <span className="check-icon">✓</span>
                        <p>Dieser Tag ist bereits erledigt!</p>
                        {missionDays[selectedDay]?.completedAt && (
                          <p className="complete-date">Erledigt am {formatDate(missionDays[selectedDay].completedAt!)}</p>
                        )}
                      </div>
                    ) : (
                      <motion.button
                        className="complete-day-btn"
                        onClick={handleCompleteDay}
                        disabled={!reflection.trim()}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Tag {selectedDay} abschließen ✓
                      </motion.button>
                    )}
                  </>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================
// STATION HEADER
// ============================================

function StationHeader({ station, onBack }: { station: StationData; onBack: () => void }) {
  return (
    <div className="station-header" style={{ background: station.color }}>
      <button className="station-back-btn" onClick={onBack}>← Zurück</button>
      <span className="station-header-icon">{station.icon}</span>
      <h2 className="station-header-title">{station.name}</h2>
    </div>
  );
}

// ============================================
// ZERTIFIKAT
// ============================================

function CertificateView({ progress, onBack }: { progress: FaedenProgress; onBack: () => void }) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(certificateRef.current, { scale: 2, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.download = 'Faden-Meister-Zertifikat.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Download failed:', error);
    }
    setDownloading(false);
  };

  const today = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });
  const completedDaysCount = Object.values(progress.missionDays).filter(d => d.completed).length;

  return (
    <div className="certificate-container">
      <div className="certificate-actions">
        <button className="back-btn" onClick={onBack}>← Zurück</button>
        <motion.button className="download-btn" onClick={downloadCertificate} disabled={downloading} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          {downloading ? '⏳ Lädt...' : '📥 Herunterladen'}
        </motion.button>
      </div>

      <motion.div ref={certificateRef} className="certificate" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.4 }}>
        <div className="certificate-border">
          <div className="certificate-inner">
            <div className="certificate-header">
              <span className="certificate-icon">🎓</span>
              <h2 className="certificate-title">Faden-Meister</h2>
              <span className="certificate-subtitle">Zertifikat</span>
            </div>
            <div className="certificate-body">
              <p className="certificate-text">Dies bestätigt, dass</p>
              <div className="certificate-name-line">____________________</div>
              <p className="certificate-achievement">
                alle 4 Stationen der <strong>Fäden-Challenge</strong> und die <strong>5-Tage-Mission</strong> erfolgreich abgeschlossen hat!
              </p>
              <div className="certificate-badges">
                <span className="cert-badge">🧪 Experiment</span>
                <span className="cert-badge">💭 Gedanken-Jagd</span>
                <span className="cert-badge">✏️ Bleistift-Methode</span>
                <span className="cert-badge">🚢 5-Tage-Mission</span>
              </div>
              <div className="certificate-stats">
                <div className="stat">
                  <span className="stat-value">⭐ {progress.totalXP}</span>
                  <span className="stat-label">XP verdient</span>
                </div>
                <div className="stat">
                  <span className="stat-value">📅 {completedDaysCount}</span>
                  <span className="stat-label">Tage geübt</span>
                </div>
              </div>
            </div>
            <div className="certificate-footer">
              <div className="certificate-date">
                <span className="date-label">Datum:</span>
                <span className="date-value">{today}</span>
              </div>
              <div className="certificate-signature">
                <span className="signature-line">________________</span>
                <span className="signature-label">Station der Fäden</span>
              </div>
            </div>
            <div className="certificate-quote">
              <blockquote>"Wer einen Faden hat, vergisst nie wieder!"</blockquote>
              <cite>— Vera F. Birkenbihl</cite>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ============================================
// KONFETTI
// ============================================

function ConfettiEffect() {
  const colors = ['#9c27b0', '#7b1fa2', '#ce93d8', '#e1bee7', '#f3e5f5', '#4a148c', '#ea80fc'];
  const confetti = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
    size: 8 + Math.random() * 8,
    rotation: Math.random() * 360,
  }));

  return (
    <div className="confetti-container">
      {confetti.map((c) => (
        <motion.div
          key={c.id}
          className="confetti-piece"
          style={{
            left: `${c.x}%`,
            width: c.size,
            height: c.size,
            background: c.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{ y: '100vh', opacity: 0, rotate: c.rotation * (Math.random() > 0.5 ? 1 : -1) }}
          transition={{ duration: c.duration, delay: c.delay, ease: 'linear' }}
        />
      ))}
    </div>
  );
}

export default FaedenChallenge;
