// ============================================
// Transferlernen - Transfer-Quiz (Unterstufe)
// Das Geheimnis der Überflieger
// ============================================

import { ExtendedQuizQuestion, MultiSelectQuestion, MatchingQuestion, OrderingQuestion, QuizQuestion } from '@/types/legacy-ui';

// Welt-Konfiguration
export const QUIZ_WORLDS = [
  { id: 1, name: "WORLD 1: Was ist Transfer?", color: "#81c784" },
  { id: 2, name: "WORLD 2: Transfer-Skills", color: "#fff176" },
  { id: 3, name: "BONUS BOSS", color: "#f5a623" }
];

// Alle Fragen für das Transfer-Quiz (Unterstufe)
export const BRUECKEN_QUIZ_QUESTIONS_UNTERSTUFE: ExtendedQuizQuestion[] = [
  // ========== WORLD 1: Was ist Transfer? ==========
  {
    world: 1,
    level: "1-1",
    type: "single",
    title: "Das Geheimnis",
    question: "Manche Leute verstehen einfach ALLES schnell - neue Themen, andere Fächer. Warum?",
    options: [
      "Sie sind halt schlauer geboren",
      "Sie haben einen Skill namens TRANSFER - sie übertragen Wissen auf neue Situationen",
      "Sie haben einfach mehr Glück"
    ],
    correct: 1,
    explanation: "Genau! Transfer ist kein Talent - es ist eine Technik. Und die kannst du lernen! 🧠"
  } as QuizQuestion,

  {
    world: 1,
    level: "1-2",
    type: "single",
    title: "Die Wissenschaft",
    question: "Forscher haben Transfer untersucht. Effektstärke d=0.86. Was bedeutet das?",
    options: [
      "Transfer funktioniert nur bei 86% der Schüler",
      "Transfer ist mehr als DOPPELT so effektiv wie durchschnittliche Lernmethoden (d=0.40)!",
      "Man braucht 86 Tage zum Lernen"
    ],
    correct: 1,
    explanation: "Krass, oder? d=0.86 ist Top 6 von 252 Lernfaktoren. Transfer ist ein echter Game-Changer! 📊"
  } as QuizQuestion,

  {
    world: 1,
    level: "1-3",
    type: "multi-select",
    title: "Transfer verstehen",
    question: "Was stimmt über Transfer?",
    instruction: "Wähle genau 3 richtige!",
    options: [
      { id: "a", text: "Transfer ist eine trainierbare Technik", correct: true },
      { id: "b", text: "Nur Hochbegabte können Transfer", correct: false },
      { id: "c", text: "Ein Prinzip kann in vielen Fächern helfen", correct: true },
      { id: "d", text: "Transfer passiert automatisch, wenn man viel lernt", correct: false },
      { id: "e", text: "Transfer muss aktiv trainiert werden", correct: true }
    ],
    correctCount: 3,
    explanation: "Richtig! Transfer ist trainierbar, fächerübergreifend - aber er passiert NICHT von selbst! 💪"
  } as MultiSelectQuestion,

  {
    world: 1,
    level: "1-4",
    type: "single",
    title: "Mathe trifft Physik",
    question: "In Mathe lernst du: 'Was ich links mache, muss ich rechts auch machen' (Gleichungen). In Physik sollst du Formeln umstellen. Was erkennst du?",
    options: [
      "Das hat nichts miteinander zu tun",
      "Das ist das GLEICHE Prinzip! Ich kann mein Mathe-Wissen übertragen!",
      "Physik ist viel schwerer als Mathe"
    ],
    correct: 1,
    explanation: "Exakt! Ohne Transfer lernst du beides neu. MIT Transfer erkennst du das Muster und sparst Zeit! ⚡"
  } as QuizQuestion,

  // ========== WORLD 2: Transfer-Skills ==========
  {
    world: 2,
    level: "2-1",
    type: "matching",
    title: "Gaming-Skills sind echte Skills",
    question: "Welcher Gaming-Skill hilft wo im echten Leben?",
    powerUps: [
      { id: 0, text: "🎮 Fortnite: Ressourcen einteilen", correctMatch: 1 },
      { id: 1, text: "⛏️ Minecraft: Erst erkunden, dann planen", correctMatch: 3 },
      { id: 2, text: "🎯 Shooter: Schnelle Entscheidungen treffen", correctMatch: 0 },
      { id: 3, text: "🧩 Puzzle-Games: Muster erkennen", correctMatch: 2 }
    ],
    matches: [
      { id: 0, text: "⏱️ Zeitdruck bei Klassenarbeiten" },
      { id: 1, text: "💰 Taschengeld/Zeit einteilen" },
      { id: 2, text: "🔢 Mathe: Zusammenhänge finden" },
      { id: 3, text: "📝 Referat: Erst recherchieren, dann schreiben" }
    ],
    explanation: "Nice! Deine Gaming-Skills sind echte Life-Skills. Du musst sie nur übertragen! 🎮➡️📚"
  } as MatchingQuestion,

  {
    world: 2,
    level: "2-2",
    type: "single",
    title: "Near vs. Far Transfer",
    question: "Near Transfer = ähnliche Situationen. Far Transfer = komplett andere Bereiche. Was ist ein Beispiel für FAR Transfer?",
    options: [
      "Gleichung 2x+5=15 lösen → andere Gleichung 3x+7=22 lösen",
      "In Geschichte lernen 'Wer die Vergangenheit nicht kennt, wiederholt Fehler' → Das gilt auch für DEINE persönlichen Fehler!",
      "Inhaltsangabe für ein Buch → Inhaltsangabe für einen Film"
    ],
    correct: 1,
    explanation: "Genau! Far Transfer geht über Fächergrenzen hinaus - Geschichte wird zu Lebensweisheit! 🚀"
  } as QuizQuestion,

  {
    world: 2,
    level: "2-3",
    type: "ordering",
    title: "Toms Minecraft-Strategie",
    question: "Tom nutzt seine Minecraft-Strategie für eine Erdkunde-Aufgabe (Karte analysieren). Bringe seine Schritte in die richtige Reihenfolge!",
    items: [
      { id: "a", text: "📝 Antwort aufschreiben", order: 4 },
      { id: "b", text: "🗺️ Systematisch erkunden: Flüsse, Berge, Städte", order: 2 },
      { id: "c", text: "💡 Denken: 'Das ist wie eine neue Minecraft-Welt!'", order: 1 },
      { id: "d", text: "📋 Antwort planen und strukturieren", order: 3 }
    ],
    explanation: "Perfect! Erkennen → Erkunden → Planen → Handeln. Das Prinzip funktioniert überall! 🏆"
  } as OrderingQuestion,

  {
    world: 2,
    level: "2-4",
    type: "multi-select",
    title: "Transfer-Fragen",
    question: "Mit welchen Fragen aktivierst du Transfer beim Lernen?",
    instruction: "Wähle genau 2 richtige!",
    options: [
      { id: "a", text: "Wo habe ich dieses Prinzip schon mal gesehen?", correct: true },
      { id: "b", text: "Wann ist endlich Pause?", correct: false },
      { id: "c", text: "In welchem anderen Fach gilt das auch?", correct: true },
      { id: "d", text: "Wie viele Seiten muss ich noch lesen?", correct: false }
    ],
    correctCount: 2,
    explanation: "Diese Fragen sind dein Transfer-Aktivator! Frag sie bei JEDEM neuen Thema! 🔑"
  } as MultiSelectQuestion,

  // ========== WORLD 3: BONUS BOSS ==========
  {
    world: 3,
    level: "BOSS",
    type: "single",
    title: "Der Transfer-Check",
    question: "Was ist der wichtigste Unterschied zwischen 'viel lernen' und 'smart lernen'?",
    options: [
      "Smart lernen bedeutet weniger Aufwand",
      "Smart lernen nutzt Transfer: Du erkennst Muster und wendest Prinzipien überall an",
      "Es gibt keinen Unterschied",
      "Smart lernen funktioniert nur für Genies"
    ],
    correct: 1,
    explanation: "🎉 BOSS BESIEGT! Du hast es verstanden: Die Frage ist nicht 'Wie viel weißt du?' sondern 'Wie gut kannst du es anwenden?' Das ist Transfer! 🧠✨"
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
