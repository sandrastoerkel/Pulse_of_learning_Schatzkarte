// ============================================
// Festung der Stärke - Superhelden-Quiz
// Unterstufe (5.-7. Klasse)
// Basierend auf Bandura & Hattie
// ============================================

import { ExtendedQuizQuestion, MultiSelectQuestion, MatchingQuestion, OrderingQuestion, QuizQuestion } from '@/types/legacy-ui';

// Welt-Konfiguration
export const QUIZ_WORLDS = [
  { id: 1, name: "WORLD 1: Banduras Power-Ups", color: "#e60012" },
  { id: 2, name: "WORLD 2: Hattie-Challenge", color: "#0ab9e6" },
  { id: 3, name: "BONUS BOSS", color: "#f5a623" }
];

// Alle Fragen für das Superhelden-Quiz (Unterstufe)
export const SUPERHELDEN_QUIZ_QUESTIONS: ExtendedQuizQuestion[] = [
  // ========== WORLD 1: Bandura's 4 Power-Ups ==========
  {
    world: 1,
    level: "1-1",
    type: "multi-select",
    title: "Die 4 Quellen der Selbstwirksamkeit",
    question: "Albert Bandura hat erforscht, woher das 'Ich-schaff-das-Gefühl' kommt. Welche sind die 4 echten Quellen der Selbstwirksamkeit?",
    instruction: "Wähle genau 4 richtige!",
    options: [
      { id: "a", text: "🏆 Echte Erfolgserlebnisse (selbst geschafft!)", correct: true },
      { id: "b", text: "🧠 Hohe Intelligenz von Geburt an", correct: false },
      { id: "c", text: "👀 Von anderen lernen (die mir ähnlich sind)", correct: true },
      { id: "d", text: "💰 Gute Noten durch Nachhilfe kaufen", correct: false },
      { id: "e", text: "💬 Was andere zu mir sagen + Selbstgespräch", correct: true },
      { id: "f", text: "💪 Mein Körper-Feeling richtig deuten", correct: true },
      { id: "g", text: "🎲 Einfach Glück haben", correct: false },
    ],
    correctCount: 4,
    explanation: "Richtig! Die 4 Quellen sind: Erfolgserlebnisse 🏆, Von anderen lernen 👀, Zuspruch 💬 und Körper-Feeling 💪. Das ist Wissenschaft, keine Glückssache!"
  } as MultiSelectQuestion,

  {
    world: 1,
    level: "1-2",
    type: "matching",
    title: "Power-Up Zuordnung",
    question: "Ordne jede Quelle der Selbstwirksamkeit dem passenden Beispiel zu!",
    powerUps: [
      { id: 0, text: "🏆 Echte Erfolgserlebnisse", correctMatch: 2 },
      { id: 1, text: "👀 Von anderen lernen", correctMatch: 0 },
      { id: 2, text: "💬 Zuspruch & Selbstgespräch", correctMatch: 3 },
      { id: 3, text: "💪 Körper-Feeling", correctMatch: 1 },
    ],
    matches: [
      { id: 0, text: "Dein Kumpel, der auch Probleme hatte, erklärt dir den Lösungsweg" },
      { id: 1, text: "Du deutest dein Herzklopfen vor dem Test als 'Mein Körper macht sich bereit!'" },
      { id: 2, text: "Du schaffst heute 10 Bruch-Aufgaben fehlerfrei" },
      { id: 3, text: "Du sagst dir: 'Das ist schwer. Aber schwer heißt nicht unmöglich.'" },
    ],
    explanation: "Perfekt zugeordnet! Jede Quelle stärkt deine Selbstwirksamkeit auf ihre eigene Weise. 🎯"
  } as MatchingQuestion,

  {
    world: 1,
    level: "1-3",
    type: "single",
    title: "Neuroplastizität verstehen",
    question: "Ein Mitschüler behauptet: 'Entweder man kann Mathe oder nicht – das ist angeboren.' Was würdest du ihm basierend auf der Gehirnforschung antworten?",
    options: [
      "Stimmt, manche Gehirne sind einfach besser für Mathe gebaut",
      "Dein Gehirn funktioniert wie ein Muskel – je mehr du übst, desto stärker wird es. Das nennt man Neuroplastizität.",
      "Man braucht einfach den richtigen Lehrer",
      "Es kommt nur auf die Gene an"
    ],
    correct: 1,
    explanation: "Genau! Neuroplastizität ist keine Motivations-Floskel – es ist Biologie. Beim Lernen bilden sich neue Verbindungen zwischen Nervenzellen. Dein Gehirn baut sich buchstäblich um! 🧠✨"
  } as QuizQuestion,

  {
    world: 1,
    level: "1-4",
    type: "single",
    title: "Die stärkste Quelle",
    question: "Welche der 4 Quellen der Selbstwirksamkeit ist laut Bandura die STÄRKSTE – und warum solltest du große Aufgaben in Mini-Aufgaben zerlegen?",
    options: [
      "Von anderen lernen – weil Abgucken immer hilft",
      "Echte Erfolgserlebnisse – weil nichts dein Gehirn mehr überzeugt als wenn DU ES SELBST geschafft hast. Mini-Aufgaben = mehr Erfolgserlebnisse!",
      "Körper-Feeling – weil Sport das Wichtigste ist",
      "Zuspruch von anderen – weil Lob immer motiviert"
    ],
    correct: 1,
    explanation: "Korrekt! Erfolgserlebnisse sind die stärkste Quelle. Mini-Aufgaben (z.B. '10 Bruch-Aufgaben' statt 'für Mathe lernen') geben dir mehr Chancen, Erfolge zu sammeln! 🏆"
  } as QuizQuestion,

  // ========== WORLD 2: Hattie Challenge ==========
  {
    world: 2,
    level: "2-1",
    type: "ordering",
    title: "Student Expectations",
    question: "Hattie nennt seine Methode 'Student Expectations'. Bringe die 3 Schritte in die richtige Reihenfolge!",
    items: [
      { id: "a", text: "📊 Schätze VORHER realistisch ein: 'Ich werde wahrscheinlich X schaffen'", order: 1 },
      { id: "b", text: "🎯 Vergleiche NACHHER: Habe ich meine Erwartung übertroffen?", order: 3 },
      { id: "c", text: "💪 Gib dein Bestes bei der Aufgabe/dem Test", order: 2 },
    ],
    explanation: "Erst schätzen → dann dein Bestes geben → dann vergleichen! Wenn du besser bist als erwartet: BOOM! Dein Selbstvertrauen steigt. 🚀"
  } as OrderingQuestion,

  {
    world: 2,
    level: "2-2",
    type: "single",
    title: "Die Effektstärke",
    question: "John Hattie hat über 80 Millionen Schüler untersucht. Selbstwirksamkeit hat eine Effektstärke von 0.63. Was bedeutet das konkret?",
    options: [
      "63% der Schüler haben Selbstwirksamkeit",
      "Schüler, die an sich glauben, lernen in derselben Zeit so viel wie andere in mehr als einem ganzen Schuljahr – bei 0.40 ist es schon ein normales Schuljahr!",
      "Man braucht 63 Tage zum Üben",
      "6 von 3 Schülern profitieren davon"
    ],
    correct: 1,
    explanation: "Stark! Eine Effektstärke von 0.63 = mehr als ein ganzes Schuljahr Lernfortschritt. Das ist wie ein permanentes Power-Up, das dich schneller leveln lässt! 📈"
  } as QuizQuestion,

  {
    world: 2,
    level: "2-3",
    type: "single",
    title: "Anwendungs-Quest",
    question: "Mia macht die Hattie-Challenge vor einem Vokabeltest. Sie schätzt ehrlich: 'Ich werde etwa 15 von 20 richtig haben.' Ergebnis: 18 richtig! Was passiert?",
    options: [
      "Nichts Besonderes – sie hat halt gut gelernt",
      "Sie ärgert sich, weil sie sich unterschätzt hat",
      "Ihr Gehirn speichert: 'Ich kann mehr als ich denke!' – ihr Selbstvertrauen wächst messbar",
      "Sie denkt, der Test war zu leicht"
    ],
    correct: 2,
    explanation: "Exakt! Wenn du deine eigene Erwartung übertriffst, passiert etwas Kraftvolles in deinem Gehirn: Es lernt, dir mehr zuzutrauen! 🧠💪"
  } as QuizQuestion,

  {
    world: 2,
    level: "2-4",
    type: "single",
    title: "Der Trick mit der Schätzung",
    question: "Jonas will die Hattie-Methode nutzen. Warum muss seine Schätzung VOR dem Test ehrlich sein – also weder zu niedrig noch zu hoch?",
    options: [
      "Damit der Lehrer zufrieden ist",
      "Zu niedrig (um sicher zu gehen) = der Erfolg zählt nicht richtig. Zu hoch (um cool zu wirken) = du lernst nichts über dich. Nur ehrliche Schätzung → echtes Lernen über dich selbst!",
      "Weil es sonst unfair gegenüber anderen ist",
      "Weil man immer pessimistisch sein sollte"
    ],
    correct: 1,
    explanation: "Genau das ist der Trick! Bei der Hattie-Methode geht es darum, dich SELBST besser kennenzulernen. Und das klappt nur mit ehrlicher Einschätzung. 🎯"
  } as QuizQuestion,

  // ========== WORLD 3: BONUS BOSS ==========
  {
    world: 3,
    level: "BOSS",
    type: "single",
    title: "Final Boss: Der Wissenschafts-Check",
    question: "Du hast schwitzige Hände vor einer wichtigen Präsentation. Wie nutzt ein echter Selbstwirksamkeits-Profi das Körper-Feeling?",
    options: [
      "😰 'Ich bin zu nervös, ich werde versagen!'",
      "🤷 'Ich ignoriere es einfach und hoffe, es geht weg'",
      "💪 'Ich bin aufgeregt – mein Körper macht sich bereit! Diese Energie hilft mir!'",
      "🏃 'Ich gehe lieber nach Hause'"
    ],
    correct: 2,
    explanation: "BOSS BESIEGT! 🎉 Fun Fact: Aufregung und Nervosität fühlen sich körperlich fast gleich an. Der Unterschied liegt nur in dem, was du dir sagst! Dein Gehirn glaubt, was du ihm oft genug sagst – also sag ihm das Richtige! 🧠✨"
  } as QuizQuestion,
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
