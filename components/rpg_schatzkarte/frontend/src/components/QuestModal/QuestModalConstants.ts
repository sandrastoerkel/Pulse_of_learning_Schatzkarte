// ============================================
// QuestModal - Constants
// Pfad: src/components/QuestModal/QuestModalConstants.ts
// ============================================

import type { QuestTypesMap, IslandSubtitleInfo } from './QuestModalTypes';

// Quest-Typen mit ihren Details
export const QUEST_TYPES: QuestTypesMap = {
  wisdom: {
    icon: '📜',
    name: 'Weisheit erlangen',
    description: 'Schau dir das Lernvideo an und entdecke neues Wissen!',
    action: 'Video ansehen',
    xp: 25,
    gold: 5,
    progressKey: 'video_watched'
  },
  scroll: {
    icon: '📖',
    name: 'Schriftrolle studieren',
    description: 'Lies die Erklärung und verstehe die Zusammenhänge.',
    action: 'Erklärung lesen',
    xp: 20,
    gold: 3,
    progressKey: 'explanation_read'
  },
  battle: {
    icon: '⚔️',
    name: 'Monster besiegen',
    description: 'Teste dein Wissen im Quiz-Kampf!',
    action: 'Quiz starten',
    xp: 50,
    gold: 15,
    progressKey: 'quiz_passed'
  },
  challenge: {
    icon: '🏆',
    name: 'Quest abschließen',
    description: 'Meistere die finale Herausforderung!',
    action: 'Challenge starten',
    xp: 40,
    gold: 10,
    progressKey: 'challenge_completed'
  }
};

// Insel-Untertitel und Beschreibungen
export const ISLAND_SUBTITLES: Record<string, IslandSubtitleInfo> = {
  festung: {
    subtitle: '(Selbstwirksamkeit)',
    description: 'Selbstwirksamkeit ist das Vertrauen, eine bestimmte Aufgabe erfolgreich bewältigen zu können. Nicht allgemeines Selbstvertrauen, sondern aufgabenbezogen: "Ich kann diese Matheaufgabe lösen" oder "Ich kann dieses Referat halten". Kernbotschaft: Du kannst mehr, als du denkst - und jeder Erfolg beweist es dir!'
  },
  werkzeuge: {
    subtitle: '(Effektstärke)',
    description: 'Effektstärke (d) misst, wie viel eine Lernmethode bringt. d = 0.40 entspricht einem Jahr Lernfortschritt. d > 0.40 bedeutet: Mehr als ein Jahr Fortschritt! d = 0.80 entspricht sogar zwei Jahren in einem! John Hattie hat über 1.800 Meta-Studien mit 300 Millionen Schülern ausgewertet, um herauszufinden, welche Methoden wirklich funktionieren.'
  }
};

// Quiz-Fragen Helper - Importiert die korrekten Quiz-Fragen basierend auf Insel und Altersstufe
export type QuizQuestionsGetter = (islandId: string, ageGroup: string) => unknown[];
