// ============================================
// Festung der Stärke - Superhelden-Quiz
// Basierend auf Bandura & Hattie
// ============================================

import { ExtendedQuizQuestion, MultiSelectQuestion, MatchingQuestion, OrderingQuestion, QuizQuestion } from '../types';

// Welt-Konfiguration
export const QUIZ_WORLDS = [
  { id: 1, name: "WORLD 1: Banduras Power-Ups", color: "#e60012" },
  { id: 2, name: "WORLD 2: Hattie-Challenge", color: "#0ab9e6" },
  { id: 3, name: "BONUS BOSS", color: "#f5a623" }
];

// Alle Fragen für das Superhelden-Quiz
export const SUPERHELDEN_QUIZ_QUESTIONS: ExtendedQuizQuestion[] = [
  // ========== WORLD 1: Bandura's 4 Power-Ups ==========
  {
    world: 1,
    level: "1-1",
    type: "multi-select",
    title: "Power-Up Sammlung",
    question: "Du hast 4 geheime Power-Ups entdeckt! Welche gehören zu Banduras Superhelden-Kräften?",
    instruction: "Wähle genau 4 richtige!",
    options: [
      { id: "a", text: "🏆 Kleine Siege sammeln", correct: true },
      { id: "b", text: "💰 Viel Taschengeld haben", correct: false },
      { id: "c", text: "👀 Von anderen abgucken", correct: true },
      { id: "d", text: "🏃 Schnell rennen können", correct: false },
      { id: "e", text: "💬 Aufmunterung von anderen", correct: true },
      { id: "f", text: "😌 Ruhig bleiben", correct: true },
      { id: "g", text: "📺 Viel fernsehen", correct: false },
    ],
    correctCount: 4,
    explanation: "Die 4 Power-Ups sind: Kleine Siege 🏆, Abgucken 👀, Aufmunterung 💬 und Ruhig bleiben 😌!"
  } as MultiSelectQuestion,

  {
    world: 1,
    level: "1-2",
    type: "matching",
    title: "Power-Up Zuordnung",
    question: "Ordne jedes Power-Up dem richtigen Beispiel zu!",
    powerUps: [
      { id: 0, text: "🏆 Kleine Siege", correctMatch: 2 },
      { id: 1, text: "👀 Abgucken erlaubt", correctMatch: 0 },
      { id: 2, text: "💬 Aufmunterung", correctMatch: 3 },
      { id: 3, text: "😌 Ruhig bleiben", correctMatch: 1 },
    ],
    matches: [
      { id: 0, text: "Du schaust, wie dein Freund die Aufgabe löst" },
      { id: 1, text: "Du atmest tief durch vor der Arbeit" },
      { id: 2, text: "Du hast die 3er-Reihe geschafft!" },
      { id: 3, text: "Mama sagt: 'Du schaffst das!'" },
    ],
    explanation: "Jedes Power-Up hilft dir auf eine andere Art!"
  } as MatchingQuestion,

  {
    world: 1,
    level: "1-3",
    type: "single",
    title: "Erkläre das Power-Up!",
    question: "Dein Freund fragt: 'Was bedeutet Kleine Siege sammeln?' Welche Antwort ist richtig?",
    options: [
      "Man soll nur bei Spielen gewinnen",
      "Man macht große Aufgaben klein und feiert jeden Erfolg – so wird der 'Ich-schaff-das-Muskel' stärker!",
      "Man sammelt Pokale und Medaillen",
      "Man soll anderen zeigen, was man kann"
    ],
    correct: 1,
    explanation: "Genau! Jeder kleine Erfolg macht deinen 'Ich-schaff-das-Muskel' stärker! 💪"
  } as QuizQuestion,

  {
    world: 1,
    level: "1-4",
    type: "single",
    title: "Lückentext",
    question: "Wenn ich sehe, wie mein großer Bruder Fahrrad fährt, nutze ich das Power-Up ____. Wenn Oma sagt 'Du bist so fleißig!', ist das ____.",
    options: [
      "👀 Abgucken erlaubt / 💬 Aufmunterung",
      "🏆 Kleine Siege / 😌 Ruhig bleiben",
      "😌 Ruhig bleiben / 👀 Abgucken erlaubt"
    ],
    correct: 0,
    explanation: "Vom Bruder lernen = Abgucken 👀, Omas Lob = Aufmunterung 💬!"
  } as QuizQuestion,

  // ========== WORLD 2: Hattie Challenge ==========
  {
    world: 2,
    level: "2-1",
    type: "ordering",
    title: "Boss-Kampf Vorbereitung",
    question: "Die Hattie-Challenge hat 3 Schritte. Bringe sie in die richtige Reihenfolge!",
    items: [
      { id: "a", text: "🅰️ Schätze VOR der Aufgabe: Wie viel werde ich schaffen?", order: 1 },
      { id: "b", text: "🅱️ Vergleiche: Habe ich mehr geschafft als gedacht?", order: 3 },
      { id: "c", text: "🅲️ Mach die Aufgabe", order: 2 },
    ],
    explanation: "Erst schätzen → dann machen → dann vergleichen! So lernst du dich selbst kennen."
  } as OrderingQuestion,

  {
    world: 2,
    level: "2-2",
    type: "single",
    title: "Erkläre die Challenge!",
    question: "Deine kleine Schwester fragt: 'Was ist die Hattie-Challenge?' Welche Erklärung stimmt?",
    options: [
      "Ein Wettbewerb, wer der Beste ist",
      "Du schätzt vorher, wie viel du schaffst. Dann machst du die Aufgabe. Danach vergleichst du – wenn du MEHR geschafft hast, merkt dein Gehirn: 'Ich kann mehr als ich denke!'",
      "Du musst alle Aufgaben perfekt lösen",
      "Dein Lehrer sagt dir, was du schaffen musst"
    ],
    correct: 1,
    explanation: "Super erklärt! Bei der Hattie-Challenge geht es darum, sich selbst zu übertreffen! 🌟"
  } as QuizQuestion,

  {
    world: 2,
    level: "2-3",
    type: "single",
    title: "Anwendungs-Quest",
    question: "Max macht die Hattie-Challenge: Er schätzt 6 von 10 Aufgaben richtig. Ergebnis: 8 richtig! Was passiert jetzt in Max' Gehirn?",
    options: [
      "Nichts besonderes",
      "Sein Gehirn speichert: 'Ich kann mehr als ich denke!' – das macht ihn selbstbewusster",
      "Er ist nur froh, dass der Test vorbei ist",
      "Er denkt, er hatte nur Glück"
    ],
    correct: 1,
    explanation: "Genau! Wenn du mehr schaffst als gedacht, wird dein Selbstvertrauen stärker! 🧠✨"
  } as QuizQuestion,

  {
    world: 2,
    level: "2-4",
    type: "single",
    title: "Game Over? Nein!",
    question: "Lea macht die Hattie-Challenge. Sie schätzt: 5 richtig. Ergebnis: nur 3 richtig. Was ist der beste nächste Schritt?",
    options: [
      "😢 Aufgeben – sie kann es einfach nicht",
      "😠 Sauer sein auf den Test",
      "🤔 Sich fragen: 'Was kann ich beim nächsten Mal anders machen?' – und es nochmal versuchen!",
      "🙈 Nie wieder eine Challenge machen"
    ],
    correct: 2,
    explanation: "+1 UP! Fehler sind Teil des Lernens! Frag dich immer: Was kann ich besser machen? 🚀"
  } as QuizQuestion,

  // ========== WORLD 3: BONUS BOSS ==========
  {
    world: 3,
    level: "BOSS",
    type: "single",
    title: "Final Boss: Der Superhelden-Test",
    question: "Wenn du bei der Hattie-Challenge MEHR schaffst als du dachtest, aktivierst du welches Power-Up?",
    options: [
      "👀 Abgucken erlaubt",
      "🏆 Kleine Siege sammeln",
      "💬 Aufmunterung",
      "😌 Ruhig bleiben"
    ],
    correct: 1,
    explanation: "BOSS BESIEGT! 🎉 Jeder kleine Sieg stärkt deinen 'Ich-schaff-das-Muskel'!"
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
