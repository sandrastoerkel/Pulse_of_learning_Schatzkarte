// ============================================
// Transferlernen - Transfer-Quiz (Mittelstufe)
// Das Geheimnis der Überflieger
// ============================================

import { ExtendedQuizQuestion, MultiSelectQuestion, MatchingQuestion, OrderingQuestion, QuizQuestion } from '../types';

// Welt-Konfiguration
export const QUIZ_WORLDS = [
  { id: 1, name: "WORLD 1: Transfer-Theorie", color: "#81c784" },
  { id: 2, name: "WORLD 2: Transfer anwenden", color: "#fff176" },
  { id: 3, name: "BONUS BOSS", color: "#f5a623" }
];

// Alle Fragen für das Transfer-Quiz (Mittelstufe)
export const BRUECKEN_QUIZ_QUESTIONS_MITTELSTUFE: ExtendedQuizQuestion[] = [
  // ========== WORLD 1: Transfer-Theorie ==========
  {
    world: 1,
    level: "1-1",
    type: "single",
    title: "Die Forschung",
    question: "Transfer hat eine Effektstärke von d=0.86. Was bedeutet das konkret?",
    options: [
      "Transfer funktioniert bei 86% der Schüler",
      "Transfer entspricht einem Leistungsvorsprung von etwa 1,5 Schuljahren",
      "Man braucht 86 Stunden Training",
      "86% der Lehrer nutzen Transfer"
    ],
    correct: 1,
    explanation: "Korrekt! d=0.86 ist Top 6 von 252 Lernfaktoren. Das entspricht ca. 1,5 Jahren Vorsprung! 📊"
  } as QuizQuestion,

  {
    world: 1,
    level: "1-2",
    type: "ordering",
    title: "Hatties Drei-Ebenen-Modell",
    question: "John Hattie beschreibt drei Lernebenen. Bringe sie in die richtige Reihenfolge - von grundlegend bis anspruchsvoll!",
    items: [
      { id: "a", text: "🔄 Transfer: Wissen auf neue Kontexte anwenden", order: 3 },
      { id: "b", text: "📚 Surface Learning: Fakten und Prozeduren lernen", order: 1 },
      { id: "c", text: "🔍 Deep Learning: Zusammenhänge verstehen", order: 2 }
    ],
    explanation: "Surface → Deep → Transfer. Die meisten Prüfungen testen Ebene 1-2, aber im Leben brauchst du vor allem Ebene 3! 🎯"
  } as OrderingQuestion,

  {
    world: 1,
    level: "1-3",
    type: "single",
    title: "Near vs. Far Transfer",
    question: "Was unterscheidet Near Transfer von Far Transfer?",
    options: [
      "Near ist schneller, Far ist langsamer",
      "Near = zwischen ähnlichen Situationen, Far = zwischen völlig verschiedenen Domänen",
      "Near ist für Anfänger, Far ist für Profis",
      "Es gibt keinen Unterschied"
    ],
    correct: 1,
    explanation: "Genau! Near Transfer ist leichter (Gleichung → andere Gleichung), Far Transfer ist mächtiger (Geschichte → Lebensweisheit)! 🚀"
  } as QuizQuestion,

  {
    world: 1,
    level: "1-4",
    type: "multi-select",
    title: "Transfer-Mythen",
    question: "Welche Aussagen sind FALSCH (= Mythen)?",
    instruction: "Wähle genau 3 falsche Aussagen!",
    options: [
      { id: "a", text: "Manche Menschen sind einfach vielseitig begabt", correct: true },
      { id: "b", text: "Transfer muss aktiv trainiert werden", correct: false },
      { id: "c", text: "Jedes Fach braucht komplett anderes Wissen", correct: true },
      { id: "d", text: "Transfer passiert automatisch, wenn man genug lernt", correct: true },
      { id: "e", text: "Viele Prinzipien sind fächerübergreifend anwendbar", correct: false }
    ],
    correctCount: 3,
    explanation: "Diese drei sind Mythen! Realität: Transfer ist trainierbar, Prinzipien sind übertragbar, aber es passiert NICHT von selbst! 💡"
  } as MultiSelectQuestion,

  // ========== WORLD 2: Transfer anwenden ==========
  {
    world: 2,
    level: "2-1",
    type: "matching",
    title: "Das Gleichgewichts-Prinzip",
    question: "In Physik lernst du: 'Ein System ist im Gleichgewicht, wenn sich Kräfte ausgleichen.' Ordne das Prinzip anderen Fächern zu!",
    powerUps: [
      { id: 0, text: "⚗️ Chemie", correctMatch: 2 },
      { id: 1, text: "💰 Wirtschaft", correctMatch: 0 },
      { id: 2, text: "🏛️ Politik", correctMatch: 3 },
      { id: 3, text: "🧠 Psychologie", correctMatch: 1 }
    ],
    matches: [
      { id: 0, text: "Angebot und Nachfrage gleichen sich aus" },
      { id: 1, text: "Work-Life-Balance" },
      { id: 2, text: "Chemisches Gleichgewicht (Le Chatelier)" },
      { id: 3, text: "Gewaltenteilung - Macht wird aufgeteilt" }
    ],
    explanation: "Stark! Ein Prinzip aus Physik → 4 verschiedene Anwendungen. Das ist die Power von Far Transfer! ⚡"
  } as MatchingQuestion,

  {
    world: 2,
    level: "2-2",
    type: "ordering",
    title: "Metakognitive Kernprozesse",
    question: "Transfer erfordert Metakognition - das Nachdenken über dein Denken. Bringe die drei Kernprozesse in die richtige Reihenfolge!",
    items: [
      { id: "a", text: "📊 Evaluieren: Hat der Transfer funktioniert?", order: 3 },
      { id: "b", text: "🔍 Monitoring: Funktioniert mein Ansatz?", order: 2 },
      { id: "c", text: "📋 Planen: Welche Strategie könnte funktionieren?", order: 1 }
    ],
    explanation: "Planen → Monitoring → Evaluieren. Diese Prozesse unterscheiden 'über ein Problem nachdenken' von 'über dein DENKEN nachdenken'! 🧠"
  } as OrderingQuestion,

  {
    world: 2,
    level: "2-3",
    type: "multi-select",
    title: "Prüfungs-Strategien",
    question: "Wie nutzt du Transfer für Prüfungen?",
    instruction: "Wähle genau 2 richtige!",
    options: [
      { id: "a", text: "Aufgaben nach PRINZIPIEN kategorisieren, nicht nach Kapiteln", correct: true },
      { id: "b", text: "Nur bekannte Aufgabentypen üben", correct: false },
      { id: "c", text: "Bei jedem Thema fragen: 'Wo gilt dieses Prinzip noch?'", correct: true },
      { id: "d", text: "Jedes Fach komplett getrennt lernen", correct: false }
    ],
    correctCount: 2,
    explanation: "Top! Lerne Prinzipien statt Aufgabentypen, und frag immer nach Querverbindungen! 📝"
  } as MultiSelectQuestion,

  {
    world: 2,
    level: "2-4",
    type: "single",
    title: "Wissenschaftlicher Hintergrund",
    question: "Perkins & Salomon (1992) beschreiben zwei Strategien für Transfer: 'Hugging' und 'Bridging'. Was bedeutet 'Bridging'?",
    options: [
      "Lernsituationen der Anwendung möglichst ähnlich machen",
      "Explizit Verbindungen zwischen verschiedenen Kontexten herstellen",
      "Sich an den Lernstoff klammern",
      "Brücken zwischen Schülern bauen"
    ],
    correct: 1,
    explanation: "Genau! Hugging = ähnlich machen, Bridging = explizit Verbindungen herstellen. Beides fördert Transfer! 🌉"
  } as QuizQuestion,

  // ========== WORLD 3: BONUS BOSS ==========
  {
    world: 3,
    level: "BOSS",
    type: "single",
    title: "Die ultimative Erkenntnis",
    question: "Warum ist Transfer DIE Kompetenz der Zukunft?",
    options: [
      "Weil Schulen es fordern",
      "Weil es einfach ist",
      "Weil KI Fakten kann - aber Menschen können transferieren und Wissen flexibel anwenden",
      "Weil alle Experten es sagen"
    ],
    correct: 2,
    explanation: "🎉 BOSS BESIEGT! ChatGPT kann Fakten reproduzieren. Aber Transfer - Wissen flexibel auf neue Situationen anwenden - das ist menschlich. Das unterscheidet dich von einer KI! 🧠✨"
  } as QuizQuestion
];

// Punkte pro Fragetyp
export const POINTS_PER_TYPE = {
  'single': 100,
  'multi-select': 150,
  'matching': 200,
  'ordering': 150
};

// Helper: Welt-Name und Farbe abrufen
export function getWorldInfo(worldId: number) {
  return QUIZ_WORLDS.find(w => w.id === worldId) || QUIZ_WORLDS[0];
}
