// ============================================
// Cleverer lernen - Quiz (Grundschule)
// Thema: Die 7 Power-Lerntechniken
// Basierend auf Hattie, Dunlosky, Bjork
// ============================================

import { ExtendedQuizQuestion, MultiSelectQuestion, MatchingQuestion, OrderingQuestion, QuizQuestion } from '@/types/legacy-ui';

// Welt-Konfiguration
export const QUIZ_WORLDS = [
  { id: 1, name: "WORLD 1: Lern-Mythen entlarven", color: "#e60012" },
  { id: 2, name: "WORLD 2: Power-Techniken", color: "#0ab9e6" },
  { id: 3, name: "WORLD 3: Anwenden!", color: "#7cb342" },
  { id: 4, name: "BONUS BOSS", color: "#f5a623" }
];

// Alle Fragen für das Werkzeuge-Quiz
export const WERKZEUGE_QUIZ_QUESTIONS: ExtendedQuizQuestion[] = [
  // ========== WORLD 1: Lern-Mythen entlarven (4 Fragen) ==========
  {
    world: 1,
    level: "1-1",
    type: "single",
    title: "Der Markier-Mythos",
    question: "Lea lernt für den Test. Sie markiert alle wichtigen Stellen im Buch gelb. Das sieht toll aus! Aber was sagt die Wissenschaft dazu?",
    options: [
      "Super! Gelb markieren ist die beste Lernmethode!",
      "Markieren sieht produktiv aus, bringt aber wenig. Effektstärke nur d = 0.36!",
      "Markieren funktioniert nur mit rotem Stift",
      "Man muss einfach MEHR markieren"
    ],
    correct: 1,
    explanation: "Überraschung! 🎯 Markieren fühlt sich gut an, aber die Wissenschaft sagt: Es bringt wenig! Es gibt viel cleverere Tricks."
  } as QuizQuestion,

  {
    world: 1,
    level: "1-2",
    type: "single",
    title: "Das Fluency-Problem",
    question: "Tim liest seine Notizen 5 Mal durch. Er denkt: 'Das kann ich alles!' Beim Test? Nur eine 4! Was ist passiert?",
    options: [
      "Tim ist einfach nicht schlau genug",
      "Der Test war unfair",
      "Nur lesen ist langweilig UND bringt wenig – aktive Tricks funktionieren besser!",
      "Er hätte 10 Mal lesen müssen"
    ],
    correct: 2,
    explanation: "Das ist das Fluency-Problem! 🧠 Nur lesen ist langweilig. Mit aktiven Techniken lernst du schneller UND es macht mehr Spaß!"
  } as QuizQuestion,

  {
    world: 1,
    level: "1-3",
    type: "multi-select",
    title: "Clevere Lern-Tricks",
    question: "Du hast geheime Informationen entdeckt! Welche Lernmethoden sind CLEVER und machen Spaß?",
    instruction: "Wähle genau 3 richtige!",
    options: [
      { id: "a", text: "📚 Text mehrmals durchlesen (langweilig...)", correct: false },
      { id: "b", text: "🧠 Buch zu, aus dem Kopf erzählen – wie ein Quiz!", correct: true },
      { id: "c", text: "🖍️ Alles gelb markieren (sieht nur produktiv aus)", correct: false },
      { id: "d", text: "📅 Clever wiederholen: heute, in 3 Tagen, in 1 Woche", correct: true },
      { id: "e", text: "🎓 Deinem Sofakissen erklären – du bist der Lehrer!", correct: true },
    ],
    correctCount: 3,
    explanation: "Richtig! 🏆 Diese Tricks sind clever: Du bist aktiv dabei, es macht Spaß und du merkst sofort, was du schon kannst!"
  } as MultiSelectQuestion,

  {
    world: 1,
    level: "1-4",
    type: "single",
    title: "Effektstärken verstehen",
    question: "In der Lernforschung gibt es 'Effektstärken' (d-Werte). Was bedeutet d = 0.40?",
    options: [
      "40 Punkte im Test",
      "Ein Jahr normaler Lernfortschritt – das ist der Durchschnitt",
      "40% der Schüler sind durchgefallen",
      "Man muss 40 Minuten lernen"
    ],
    correct: 1,
    explanation: "Genau! 📊 d = 0.40 ist normal. Loci-Methode (g = 0.65) und Retrieval Practice (d = 0.50–0.74) sind deutlich besser! Clever statt viel!"
  } as QuizQuestion,

  // ========== WORLD 2: Power-Techniken (6 Fragen) ==========
  {
    world: 2,
    level: "2-1",
    type: "matching",
    title: "Power-Techniken Zuordnung",
    question: "Ordne jede Technik dem richtigen Beispiel zu!",
    powerUps: [
      { id: 0, text: "🧠 Retrieval Practice", correctMatch: 1 },
      { id: 1, text: "📅 Spaced Repetition", correctMatch: 3 },
      { id: 2, text: "🎓 Feynman-Methode", correctMatch: 0 },
      { id: 3, text: "🔀 Interleaving", correctMatch: 2 },
    ],
    matches: [
      { id: 0, text: "Spiel Lehrer – erklär's deinem Sofakissen!" },
      { id: 1, text: "Mach ein Quiz mit dir selbst!" },
      { id: 2, text: "Abwechslung: Plus, Minus, Plus, Minus!" },
      { id: 3, text: "Clever timen: heute, in 3 Tagen, in 1 Woche" },
    ],
    explanation: "Super! 🌟 Jede Technik ist wie ein Spiel: Quiz spielen, Lehrer spielen, Aufgaben mischen – viel spannender als nur lesen!"
  } as MatchingQuestion,

  {
    world: 2,
    level: "2-2",
    type: "single",
    title: "Die Vergessenskurve",
    question: "Du lernst heute etwas Neues. Wie viel hast du morgen schon vergessen, wenn du NICHT clever wiederholst?",
    options: [
      "Nur 10% – das Gehirn vergisst langsam",
      "Etwa 30% – das ist normal",
      "Fast 70%! Aber mit dem richtigen Timing bleibt alles drin!",
      "0% – einmal gelernt, für immer gemerkt"
    ],
    correct: 2,
    explanation: "Keine Sorge! 🧠 Mit Spaced Repetition (cleveres Timing) bleibt alles gespeichert. Der Trick: Wiederholen, BEVOR du vergisst!"
  } as QuizQuestion,

  {
    world: 2,
    level: "2-3",
    type: "single",
    title: "Die Feynman-Methode",
    question: "Die Feynman-Methode (d = 0.54) ist eine der effektivsten Techniken! Was ist das Geheimnis?",
    options: [
      "Man liest besonders langsam",
      "Man schreibt alles 10 Mal ab",
      "Du spielst Lehrer und erklärst es so, dass ein 6-Jähriger es versteht!",
      "Man markiert mit 7 verschiedenen Farben"
    ],
    correct: 2,
    explanation: "Richard Feynman sagte: 'Wenn du es nicht einfach erklären kannst, hast du es nicht verstanden!' 🎯 Lehrer spielen macht Spaß!"
  } as QuizQuestion,

  {
    world: 2,
    level: "2-4",
    type: "single",
    title: "Interleaving-Challenge",
    question: "Tim macht 20 Plus-Aufgaben, dann 20 Minus-Aufgaben. Lisa mischt: Plus, Minus, Plus, Minus. Wer lernt BESSER?",
    options: [
      "Tim – er übt ja mehr vom Gleichen!",
      "Lisa – Abwechslung ist spannender UND trainiert das Gehirn besser!",
      "Beide gleich",
      "Keiner – Mathe lernt man nicht"
    ],
    correct: 1,
    explanation: "Lisa gewinnt! 🔀 Mischen ist wie ein Überraschungs-Spiel: Dein Gehirn bleibt wach und lernt, Aufgaben-Typen zu erkennen!"
  } as QuizQuestion,

  {
    world: 2,
    level: "2-5",
    type: "ordering",
    title: "Loci-Methode – Der Gedächtnispalast",
    question: "Die Loci-Methode nutzen Gedächtnis-Weltmeister! Bringe die Schritte in die richtige Reihenfolge:",
    items: [
      { id: "a", text: "🏠 Wähle einen bekannten Ort (z.B. dein Zimmer)", order: 1 },
      { id: "b", text: "🚶 Geh den Weg im Kopf ab – wie eine Schatzsuche!", order: 4 },
      { id: "c", text: "📍 Bestimme markante Punkte (Bett, Schrank, Fenster)", order: 2 },
      { id: "d", text: "🎭 'Hänge' Begriffe an diese Punkte – je verrückter, desto lustiger!", order: 3 },
    ],
    explanation: "Perfekt! 🏆 Du baust dir einen Gedächtnispalast! Je verrückter die Bilder, desto besser merkst du sie dir."
  } as OrderingQuestion,

  {
    world: 2,
    level: "2-6",
    type: "single",
    title: "Pomodoro-Power",
    question: "Die Pomodoro-Technik: 25 Minuten konzentriert lernen, dann Pause. Warum funktioniert das so gut?",
    options: [
      "Weil man dann Videos schauen darf",
      "Weil du in einen Flow kommst – konzentriert arbeiten fühlt sich richtig gut an!",
      "Weil die Pause so lang sein kann wie man will",
      "Weil 25 eine magische Zahl ist"
    ],
    correct: 1,
    explanation: "Genau! 🍅 Wenn du dich voll konzentrierst, kommst du in den Flow – das fühlt sich großartig an! Dann eine echte Pause (kein Handy!)."
  } as QuizQuestion,

  // ========== WORLD 3: Anwenden! (3 Fragen) ==========
  {
    world: 3,
    level: "3-1",
    type: "single",
    title: "Alltags-Quest 1",
    question: "Du musst für den Vokabeltest lernen. Welche Strategie ist am cleversten?",
    options: [
      "Alle Vokabeln am Abend vorher 20 Mal lesen (langweilig!)",
      "Clever timen + Quiz spielen: Montag lernen, Dienstag selbst testen, Freitag nochmal!",
      "Die Liste 3 Mal abschreiben",
      "Alles gelb markieren und hoffen"
    ],
    correct: 1,
    explanation: "Champion! 🏆 Du kombinierst Spaced Repetition (cleveres Timing) mit Retrieval Practice (Quiz spielen). So macht Lernen Spaß!"
  } as QuizQuestion,

  {
    world: 3,
    level: "3-2",
    type: "multi-select",
    title: "Alltags-Quest 2",
    question: "Dein kleiner Bruder fragt: 'Wie lerne ich am besten für Mathe?' Welche Tipps sind CLEVER?",
    instruction: "Wähle genau 3 richtige!",
    options: [
      { id: "a", text: "🔀 Misch verschiedene Aufgaben – wie ein Überraschungs-Paket!", correct: true },
      { id: "b", text: "📚 Mach alle gleichen Aufgaben nacheinander (langweilig...)", correct: false },
      { id: "c", text: "🎓 Spiel Lehrer: Erkläre die Lösung deinem Sofakissen!", correct: true },
      { id: "d", text: "👀 Lies die Lösung einfach mehrmals durch", correct: false },
      { id: "e", text: "🧠 Quiz-Zeit: Teste dich selbst, bevor du die Lösung anschaust!", correct: true },
    ],
    correctCount: 3,
    explanation: "Du bist ein echter Lern-Coach! 🌟 Mischen, Lehrer spielen, Quiz spielen – das sind die Geheim-Tricks der Profis!"
  } as MultiSelectQuestion,

  {
    world: 3,
    level: "3-3",
    type: "matching",
    title: "Welche Technik passt?",
    question: "Ordne jedes Problem der besten Lösung zu!",
    powerUps: [
      { id: 0, text: "📋 Ich muss 10 Begriffe auswendig lernen", correctMatch: 2 },
      { id: 1, text: "📖 Ich verstehe das Thema nicht richtig", correctMatch: 0 },
      { id: 2, text: "😴 Ich kann mich nicht konzentrieren", correctMatch: 1 },
      { id: 3, text: "🤔 Ich vergesse alles so schnell", correctMatch: 3 },
    ],
    matches: [
      { id: 0, text: "🎓 Feynman: Spiel Lehrer – erklär's deinem Sofakissen!" },
      { id: 1, text: "🍅 Pomodoro: 25 Min Flow, dann echte Pause!" },
      { id: 2, text: "🏰 Loci: Bau einen verrückten Gedächtnispalast!" },
      { id: 3, text: "📅 Spaced: Clever timen – heute, morgen, in 3 Tagen!" },
    ],
    explanation: "Meister-Level! 🎮 Du weißt jetzt, welche Technik wann hilft. Das sind echte Lern-Superkräfte!"
  } as MatchingQuestion,

  // ========== WORLD 4: BONUS BOSS (2 Fragen) ==========
  {
    world: 4,
    level: "BOSS-1",
    type: "ordering",
    title: "Boss-Challenge: Effektstärken-Ranking",
    question: "Ordne die Techniken nach ihrer Effektstärke – von der HÖCHSTEN zur niedrigsten!",
    items: [
      { id: "a", text: "🏰 Loci-Methode (g = 0.65)", order: 1 },
      { id: "b", text: "🖍️ Markieren (d = 0.36)", order: 4 },
      { id: "c", text: "📅 Spaced Repetition (d = 0.60)", order: 2 },
      { id: "d", text: "🎓 Feynman-Methode (d = 0.54)", order: 3 },
    ],
    explanation: "Wissenschafts-Experte! 🔬 Die Loci-Methode ist der Champion! Und Markieren? Fast am Ende... Clever lernen schlägt viel lernen!"
  } as OrderingQuestion,

  {
    world: 4,
    level: "BOSS-2",
    type: "single",
    title: "Final Boss: Das Lern-Geheimnis",
    question: "Du hast alle 7 Power-Techniken gemeistert! Was ist das GROSSE Geheimnis?",
    options: [
      "Man muss einfach länger lernen als alle anderen",
      "Clever lernen: Mit den richtigen Tricks lernst du schneller, besser – und es macht sogar Spaß!",
      "Nur Genies können gut lernen",
      "Markieren und Lesen reichen völlig aus"
    ],
    correct: 1,
    explanation: "🎉 BOSS BESIEGT! Du hast das Geheimnis entdeckt: Nicht MEHR lernen, sondern CLEVERER! Mit Quiz spielen, Lehrer spielen, cleverem Timing und Abwechslung kommst du in den Flow. Das fühlt sich großartig an – UND funktioniert!"
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
