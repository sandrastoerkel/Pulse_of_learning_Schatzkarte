// ============================================
// Transferlernen - Transfer-Quiz (Grundschule)
// Das Geheimnis der Überflieger
// ============================================

import { ExtendedQuizQuestion, MultiSelectQuestion, MatchingQuestion, OrderingQuestion, QuizQuestion } from '@/types/legacy-ui';

// Welt-Konfiguration
export const QUIZ_WORLDS = [
  { id: 1, name: "WORLD 1: Was ist Transfer?", color: "#81c784" },
  { id: 2, name: "WORLD 2: Transfer-Tricks", color: "#fff176" },
  { id: 3, name: "BONUS BOSS", color: "#f5a623" }
];

// Alle Fragen für das Transfer-Quiz
export const BRUECKEN_QUIZ_QUESTIONS: ExtendedQuizQuestion[] = [
  // ========== WORLD 1: Was ist Transfer? ==========
  {
    world: 1,
    level: "1-1",
    type: "single",
    title: "Das Geheimnis",
    question: "Manche Kinder sind in vielen Fächern gut. Warum?",
    options: [
      "Sie sind schlauer geboren",
      "Sie können Tricks von einem Fach auch in anderen benutzen!",
      "Sie haben einfach Glück"
    ],
    correct: 1,
    explanation: "Genau! Das Geheimnis heißt TRANSFER. Man benutzt Tricks, die man schon kennt! 🌟"
  } as QuizQuestion,

  {
    world: 1,
    level: "1-2",
    type: "single",
    title: "Lisa lernt Radfahren",
    question: "Lisa konnte schon Schwimmen. Beim Radfahren-Lernen dachte sie: 'Das ist ja wie beim Schwimmen!' Was meinte sie damit?",
    options: [
      "Beides macht man im Sommer",
      "Bei beidem muss man nicht aufgeben und jeden Tag üben!",
      "Beides ist nass"
    ],
    correct: 1,
    explanation: "Super! Lisa hat gemerkt: Der gleiche Trick hilft! Nicht aufgeben + üben = Erfolg! 🚴‍♀️"
  } as QuizQuestion,

  {
    world: 1,
    level: "1-3",
    type: "single",
    title: "Tims Lego-Trick",
    question: "Tim baut gerne Lego. Er schaut erst die Anleitung an, dann baut er Schritt für Schritt. In Sachkunde soll er aufschreiben, wie eine Pflanze wächst. Wie hilft ihm sein Lego-Trick?",
    options: [
      "Er baut die Pflanze aus Lego",
      "Er schreibt Schritt für Schritt auf: Erst Samen, dann Wurzel, dann Stängel, dann Blüte!",
      "Er spielt lieber mit Lego"
    ],
    correct: 1,
    explanation: "Klasse! Tim macht es wie bei Lego: Schritt für Schritt. Das ist Transfer! 🧱➡️🌱"
  } as QuizQuestion,

  {
    world: 1,
    level: "1-4",
    type: "multi-select",
    title: "Was stimmt über Transfer?",
    question: "Was ist richtig? Wähle alle richtigen Antworten!",
    instruction: "Wähle genau 2 richtige!",
    options: [
      { id: "a", text: "Transfer kann jedes Kind lernen", correct: true },
      { id: "b", text: "Nur schlaue Kinder können Transfer", correct: false },
      { id: "c", text: "Ein Trick kann in vielen Fächern helfen", correct: true },
      { id: "d", text: "Man muss immer alles ganz neu lernen", correct: false }
    ],
    correctCount: 2,
    explanation: "Richtig! JEDER kann Transfer lernen. Und ein guter Trick hilft überall! 💪"
  } as MultiSelectQuestion,

  // ========== WORLD 2: Transfer-Tricks ==========
  {
    world: 2,
    level: "2-1",
    type: "single",
    title: "Rechnen mit Transfer",
    question: "Du kannst schon 3 + 4 = 7 rechnen. Jetzt kommt die Aufgabe 30 + 40. Was denkst du?",
    options: [
      "Das ist viel zu schwer!",
      "Das ist ja fast das Gleiche! 30 + 40 = 70",
      "Das habe ich noch nie gesehen"
    ],
    correct: 1,
    explanation: "Perfekt! Das Prinzip ist gleich, nur die Zahlen sind größer. Das ist Near Transfer! 🔢"
  } as QuizQuestion,

  {
    world: 2,
    level: "2-2",
    type: "matching",
    title: "Transfer-Brücken bauen",
    question: "Was hat Lisa aus ihren Hobbys gelernt? Finde die passende Schul-Situation!",
    powerUps: [
      { id: 0, text: "🏊 Beim Schwimmen: Jeden Tag ein bisschen üben", correctMatch: 2 },
      { id: 1, text: "🧱 Beim Lego: Erst Anleitung lesen, dann bauen", correctMatch: 0 },
      { id: 2, text: "🎮 Beim Spielen: Nach Fehlern nochmal probieren", correctMatch: 3 },
      { id: 3, text: "⚽ Beim Fußball: Im Team zusammenarbeiten", correctMatch: 1 }
    ],
    matches: [
      { id: 0, text: "📚 Textaufgabe: Erst lesen, dann rechnen" },
      { id: 1, text: "👥 Gruppenprojekt in der Schule" },
      { id: 2, text: "📝 Vokabeln: Regelmäßig wiederholen" },
      { id: 3, text: "❌ Mathe-Fehler: Nochmal versuchen!" }
    ],
    explanation: "Super! Du hast echte Transfer-Brücken gebaut! Hobby-Tricks helfen in der Schule! 🌉"
  } as MatchingQuestion,

  {
    world: 2,
    level: "2-3",
    type: "ordering",
    title: "Vom Kleinen zum Großen",
    question: "Transfer funktioniert auch von KLEIN nach GROSS. Sortiere vom Kleinsten zum Größten!",
    items: [
      { id: "a", text: "🇩🇪 Deutschland hat einen Bundeskanzler", order: 4 },
      { id: "b", text: "🏠 Die Gemeinde hat einen Bürgermeister", order: 1 },
      { id: "c", text: "🇪🇺 Europa hat eine Kommissionspräsidentin", order: 5 },
      { id: "d", text: "🏛️ Bayern hat einen Ministerpräsidenten", order: 3 },
      { id: "e", text: "🏘️ Der Landkreis hat einen Landrat", order: 2 }
    ],
    explanation: "Perfekt! Gemeinde → Landkreis → Bayern → Deutschland → Europa. Das Prinzip ist immer gleich: Es gibt einen Chef! 🏆"
  } as OrderingQuestion,

  {
    world: 2,
    level: "2-4",
    type: "single",
    title: "Fit für die neue Schule",
    question: "Bald kommst du auf eine neue Schule mit neuen Fächern. Was hilft dir dort am meisten?",
    options: [
      "Alles vergessen und ganz neu anfangen",
      "Die Tricks, die du jetzt schon kannst: gut zuhören, genau lesen, ordentlich schreiben!",
      "Hoffen, dass alles leicht ist"
    ],
    correct: 1,
    explanation: "Genau! Du fängst nicht bei Null an. Deine Tricks helfen dir auch in der neuen Schule! 🚀"
  } as QuizQuestion,

  // ========== WORLD 3: BONUS BOSS ==========
  {
    world: 3,
    level: "BOSS",
    type: "single",
    title: "Der Transfer-Meister",
    question: "Was ist das WICHTIGSTE, was du über Transfer gelernt hast?",
    options: [
      "Überflieger sind einfach schlauer als andere",
      "Man muss jedes Fach komplett neu lernen",
      "Gute Tricks funktionieren überall – und JEDER kann das lernen!",
      "Transfer ist nur was für Erwachsene"
    ],
    correct: 2,
    explanation: "🎉 BOSS BESIEGT! Du hast es verstanden: Überflieger sind nicht schlauer – sie benutzen ihre Tricks überall. Und DU kannst das jetzt auch! 🌟🏆"
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
