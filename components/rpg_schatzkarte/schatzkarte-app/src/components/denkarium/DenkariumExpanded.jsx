import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAuth } from '@/contexts/AuthContext';
import { useCompleteExercise, useDenkariumProgress } from '@/hooks';

// ═══════════════════════════════════════════════════════════════════════════
// SCHATZKARTE DESIGN SYSTEM
// ═══════════════════════════════════════════════════════════════════════════
const C = {
  base: "#0c1a2a", elevated: "#132538", surface: "#1a3048",
  border: "#1e3a52", text: "#e8edf2", textMuted: "#8899aa",
  textDim: "#5a6a7a", action: "#0ea5e9", actionHover: "#38bdf8",
  success: "#10b981", warning: "#f59e0b", danger: "#ef4444",
  purple: "#a78bfa", pink: "#f472b6", gold: "#f59e0b", teal: "#2dd4bf",
};

// ═══════════════════════════════════════════════════════════════════════════
// SM-2 ENGINE
// ═══════════════════════════════════════════════════════════════════════════
const MIN_EF = 1.5, INIT_EF = 2.5, MAX_INTERVAL = 180;
function sm2(params, quality) {
  let { repetition, interval, easeFactor } = params;
  const ef = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  easeFactor = Math.max(MIN_EF, Math.round(ef * 100) / 100);
  if (quality >= 3) {
    if (repetition === 0) interval = 1;
    else if (repetition === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetition += 1;
  } else { repetition = 0; interval = 1; }
  return { repetition, interval: Math.min(interval, MAX_INTERVAL), easeFactor };
}
function formatInterval(d) {
  if (d === 0) return "Heute"; if (d === 1) return "Morgen";
  if (d < 7) return `${d} Tage`; if (d < 14) return "~1 Woche";
  if (d < 30) return `${Math.round(d / 7)} Wochen`;
  if (d < 60) return "~1 Monat"; return `${Math.round(d / 30)} Monate`;
}

// ═══════════════════════════════════════════════════════════════════════════
// RATINGS
// ═══════════════════════════════════════════════════════════════════════════
const RATINGS = [
  { key: "blackout", label: "Vergessen", emoji: "😵", q: 0, xp: 5, color: "#ef4444" },
  { key: "hard", label: "Schwer", emoji: "😓", q: 2, xp: 10, color: "#f97316" },
  { key: "okay", label: "Geht so", emoji: "🤔", q: 3, xp: 20, color: "#eab308" },
  { key: "good", label: "Gut!", emoji: "😊", q: 4, xp: 35, color: "#10b981" },
  { key: "perfect", label: "Perfekt!", emoji: "🤩", q: 5, xp: 50, color: "#0ea5e9" },
];

// ═══════════════════════════════════════════════════════════════════════════
// STATIONS
// ═══════════════════════════════════════════════════════════════════════════
const STATIONS = {
  loci: { id: "loci", name: "Gedächtnispalast", icon: "🏛️", color: "#a78bfa", colorLight: "rgba(167,139,250,0.12)", subtitle: "Loci-Methode" },
  association: { id: "association", name: "Assoziations-Maschine", icon: "🔗", color: "#f472b6", colorLight: "rgba(244,114,182,0.12)", subtitle: "Kreative Verknüpfungen" },
  focus: { id: "focus", name: "Konzentrations-Parcours", icon: "🎯", color: "#60a5fa", colorLight: "rgba(96,165,250,0.12)", subtitle: "Fokus & Aufmerksamkeit" },
  chunking: { id: "chunking", name: "Chunking-Challenge", icon: "🧩", color: "#34d399", colorLight: "rgba(52,211,153,0.12)", subtitle: "Strukturieren & Gruppieren" },
  visual: { id: "visual", name: "Visualisierungs-Labor", icon: "👁️", color: "#fbbf24", colorLight: "rgba(251,191,36,0.12)", subtitle: "Mentale Bildgebung" },
};

// ═══════════════════════════════════════════════════════════════════════════
// EXPANDED EXERCISE BANK — 5-8 exercises per station, progressive levels
// ═══════════════════════════════════════════════════════════════════════════
const EXERCISE_BANK = {
  loci: [
    // Level 1: Einfach, 5 Gegenstände, bekannte Orte
    { title: "5 Gegenstände an Orten", level: 1, type: "loci", data: {
      items: [
        { item: "🍎 Apfel", location: "Eingangstür" },
        { item: "📚 Buch", location: "Sofa" },
        { item: "🎸 Gitarre", location: "Fenster" },
        { item: "🐱 Katze", location: "Kühlschrank" },
        { item: "🌺 Blume", location: "Lampe" },
      ], learnTime: 6 }},
    { title: "5 Tiere im Klassenzimmer", level: 1, type: "loci", data: {
      items: [
        { item: "🐕 Hund", location: "Lehrertisch" },
        { item: "🦜 Papagei", location: "Tafel" },
        { item: "🐸 Frosch", location: "Waschbecken" },
        { item: "🦔 Igel", location: "Bücherregal" },
        { item: "🐢 Schildkröte", location: "Fensterbank" },
      ], learnTime: 6 }},
    // Level 2: Mehr Items, neue Räume
    { title: "7 Lebensmittel im Park", level: 2, type: "loci", data: {
      items: [
        { item: "🍕 Pizza", location: "Parkbank" },
        { item: "🍩 Donut", location: "Brunnen" },
        { item: "🌽 Mais", location: "Spielplatz" },
        { item: "🍇 Trauben", location: "Blumenbeet" },
        { item: "🧁 Muffin", location: "Laterne" },
        { item: "🥨 Brezel", location: "Statue" },
        { item: "🍋 Zitrone", location: "Mülleimer" },
      ], learnTime: 5 }},
    { title: "7 Instrumente im Haus", level: 2, type: "loci", data: {
      items: [
        { item: "🎹 Klavier", location: "Badewanne" },
        { item: "🥁 Trommel", location: "Dachboden" },
        { item: "🎺 Trompete", location: "Garage" },
        { item: "🎻 Geige", location: "Keller" },
        { item: "🪗 Akkordeon", location: "Balkon" },
        { item: "🪈 Flöte", location: "Schrank" },
        { item: "🎷 Saxophon", location: "Treppe" },
      ], learnTime: 5 }},
    // Level 3: 10 Items, schnellere Lernzeit
    { title: "10 Werkzeuge im Schloss", level: 3, type: "loci", data: {
      items: [
        { item: "🔨 Hammer", location: "Zugbrücke" },
        { item: "🔧 Schraubenschlüssel", location: "Thronsaal" },
        { item: "🪚 Säge", location: "Burggraben" },
        { item: "🔩 Schraube", location: "Turm" },
        { item: "🪛 Schraubenzieher", location: "Kerker" },
        { item: "📎 Büroklammer", location: "Kapelle" },
        { item: "✏️ Bleistift", location: "Bibliothek" },
        { item: "📐 Geodreieck", location: "Waffenkammer" },
        { item: "🧲 Magnet", location: "Küche" },
        { item: "💡 Glühbirne", location: "Geheimgang" },
      ], learnTime: 4 }},
    // Level 4: 10 Items MIT Reihenfolge
    { title: "10er Palast mit Reihenfolge", level: 4, type: "loci-order", data: {
      items: [
        { item: "🌟 Stern", location: "1. Eingang" },
        { item: "🐉 Drache", location: "2. Flur" },
        { item: "🎯 Zielscheibe", location: "3. Wohnzimmer" },
        { item: "🌊 Welle", location: "4. Küche" },
        { item: "🏔️ Berg", location: "5. Bad" },
        { item: "🔥 Feuer", location: "6. Schlafzimmer" },
        { item: "❄️ Schneeflocke", location: "7. Arbeitszimmer" },
        { item: "⚡ Blitz", location: "8. Balkon" },
        { item: "🌙 Mond", location: "9. Dachboden" },
        { item: "☀️ Sonne", location: "10. Garten" },
      ], learnTime: 4, requireOrder: true }},
    // Level 5: Abstrakte Begriffe (keine Emojis)
    { title: "8 abstrakte Konzepte", level: 5, type: "loci", data: {
      items: [
        { item: "💭 Freiheit", location: "Wolkenkratzer" },
        { item: "💭 Gerechtigkeit", location: "Marktplatz" },
        { item: "💭 Tapferkeit", location: "Vulkan" },
        { item: "💭 Weisheit", location: "Alte Eiche" },
        { item: "💭 Hoffnung", location: "Leuchtturm" },
        { item: "💭 Kreativität", location: "Atelier" },
        { item: "💭 Geduld", location: "Fluss" },
        { item: "💭 Ehrlichkeit", location: "Spiegel-Saal" },
      ], learnTime: 5 }},
  ],
  association: [
    // Level 1: 2-Wort-Paare
    { title: "Tier + Gegenstand", level: 1, type: "assoc-pair", data: { pairs: [["Elefant", "Regenschirm"], ["Schmetterling", "Klavier"]] }},
    { title: "Natur + Technik", level: 1, type: "assoc-pair", data: { pairs: [["Vulkan", "Smartphone"], ["Ozean", "Roboter"]] }},
    // Level 2: 3-Wort-Paare
    { title: "Dreieck-Verknüpfung", level: 2, type: "assoc-pair", data: { pairs: [["Pizza", "Raumschiff", "Pinguin"], ["Schokolade", "Dinosaurier", "Fahrrad"]] }},
    // Level 3: Kettenstory – 5 Wörter zu einer Geschichte
    { title: "5er-Kette: Alltag", level: 3, type: "assoc-chain", data: {
      words: ["Schlüssel", "Wolke", "Gitarre", "Ameise", "Rakete"],
      hint: "Verbinde alle 5 Wörter zu EINER Geschichte!",
    }},
    { title: "5er-Kette: Fantasie", level: 3, type: "assoc-chain", data: {
      words: ["Drache", "Briefmarke", "Wasserfall", "Taschenrechner", "Krone"],
      hint: "Je verrückter die Bilder, desto besser!",
    }},
    // Level 4: Abstraktes verbinden
    { title: "Abstrakt + Konkret", level: 4, type: "assoc-pair", data: { pairs: [["Freiheit", "Schlüssel"], ["Mathematik", "Pizza"], ["Mut", "Löwe"]] }},
    { title: "Gefühle verbildlichen", level: 4, type: "assoc-pair", data: { pairs: [["Angst", "Tunnel"], ["Freude", "Vulkan"], ["Langeweile", "Wüste"]] }},
    // Level 5: Speed-Assoziationen (timed)
    { title: "Speed-Assoziationen", level: 5, type: "assoc-speed", data: {
      pairs: [["Berg", "Nudel"], ["Hai", "Geburtstag"], ["Regenbogen", "Kaktus"], ["Mond", "Staubsauger"], ["Tornado", "Keks"]],
      timePerPair: 15,
    }},
  ],
  focus: [
    // Level 1: Einfacher Stroop
    { title: "Farb-Stroop einfach", level: 1, type: "stroop", data: {
      words: [
        { text: "ROT", color: "#60a5fa", answer: "blau" },
        { text: "GRÜN", color: "#ef4444", answer: "rot" },
        { text: "BLAU", color: "#34d399", answer: "grün" },
        { text: "GELB", color: "#a78bfa", answer: "lila" },
        { text: "ROT", color: "#ef4444", answer: "rot" },
        { text: "BLAU", color: "#60a5fa", answer: "blau" },
      ]}},
    // Level 2: Schwerer Stroop (mehr Farben, mehr Wörter)
    { title: "Farb-Stroop mittel", level: 2, type: "stroop", data: {
      words: [
        { text: "GRÜN", color: "#60a5fa", answer: "blau" },
        { text: "BLAU", color: "#fbbf24", answer: "gelb" },
        { text: "ROT", color: "#34d399", answer: "grün" },
        { text: "GELB", color: "#ef4444", answer: "rot" },
        { text: "GRÜN", color: "#a78bfa", answer: "lila" },
        { text: "ROT", color: "#fbbf24", answer: "gelb" },
        { text: "BLAU", color: "#ef4444", answer: "rot" },
        { text: "GELB", color: "#60a5fa", answer: "blau" },
      ]}},
    // Level 2: Dual 1-Back — DAS Highlight
    { title: "Dual 1-Back", level: 2, type: "nback", data: { n: 1, rounds: 12, gridSize: 3 }},
    // Level 3: Reverse Stroop (Wort benennen, nicht Farbe)
    { title: "Reverse Stroop", level: 3, type: "reverse-stroop", data: {
      words: [
        { text: "ROT", color: "#60a5fa", answer: "ROT" },
        { text: "BLAU", color: "#ef4444", answer: "BLAU" },
        { text: "GRÜN", color: "#fbbf24", answer: "GRÜN" },
        { text: "GELB", color: "#34d399", answer: "GELB" },
        { text: "ROT", color: "#a78bfa", answer: "ROT" },
        { text: "BLAU", color: "#34d399", answer: "BLAU" },
        { text: "GELB", color: "#ef4444", answer: "GELB" },
        { text: "GRÜN", color: "#60a5fa", answer: "GRÜN" },
      ]}},
    // Level 3: Dual 2-Back
    { title: "Dual 2-Back", level: 3, type: "nback", data: { n: 2, rounds: 15, gridSize: 3 }},
    // Level 4: Zahlen-Stroop (größere Zahl erkennen, nicht den Wert)
    { title: "Zahlen-Stroop", level: 4, type: "number-stroop", data: {
      trials: [
        { display: "333", count: 3, distractor: "333", answer: "3" },
        { display: "22222", count: 5, distractor: "22222", answer: "5" },
        { display: "1111", count: 4, distractor: "1111", answer: "4" },
        { display: "55", count: 2, distractor: "55", answer: "2" },
        { display: "4444444", count: 7, distractor: "4444444", answer: "7" },
        { display: "666", count: 3, distractor: "666", answer: "3" },
        { display: "88", count: 2, distractor: "88", answer: "2" },
        { display: "111111", count: 6, distractor: "111111", answer: "6" },
      ]}},
    // Level 5: Dual 3-Back
    { title: "Dual 3-Back ★", level: 5, type: "nback", data: { n: 3, rounds: 20, gridSize: 3 }},
  ],
  chunking: [
    { title: "8 Ziffern → 2er", level: 1, type: "chunk", data: { sequence: "4 8 2 7 1 5 9 3", solution: ["48", "27", "15", "93"], hint: "Gruppiere in 2er-Paare" }},
    { title: "Verstecktes Wort", level: 1, type: "chunk", data: { sequence: "B R A I N G Y M", solution: ["BRAIN", "GYM"], hint: "Erkennst du die Wörter?" }},
    { title: "12 Ziffern → 3er (Pi!)", level: 2, type: "chunk", data: { sequence: "3 1 4 1 5 9 2 6 5 3 5 8", solution: ["314", "159", "265", "358"], hint: "Die ersten Stellen von Pi!" }},
    { title: "Telefonnummer", level: 2, type: "chunk", data: { sequence: "0 1 7 6 3 4 8 9 2 1 0", solution: ["0176", "348", "9210"], hint: "Denk an ein Telefonnummer-Format!" }},
    // Level 3: Gemischte Listen
    { title: "Einkaufsliste", level: 3, type: "chunk-category", data: {
      items: ["Milch", "Schrauben", "Äpfel", "Hammer", "Butter", "Nägel", "Bananen", "Zange", "Käse", "Bohrer"],
      categories: { "Lebensmittel": ["Milch", "Äpfel", "Butter", "Bananen", "Käse"], "Werkzeug": ["Schrauben", "Hammer", "Nägel", "Zange", "Bohrer"] },
      hint: "Sortiere nach Kategorien!"
    }},
    { title: "Schulfächer-Chaos", level: 3, type: "chunk-category", data: {
      items: ["Pythagoras", "Goethe", "Photosynthese", "Gleichung", "Faust", "Mitose", "Bruchrechnung", "Gedicht", "DNA", "Winkel"],
      categories: { "Mathe": ["Pythagoras", "Gleichung", "Bruchrechnung", "Winkel"], "Deutsch": ["Goethe", "Faust", "Gedicht"], "Bio": ["Photosynthese", "Mitose", "DNA"] },
      hint: "Welche Fächer erkennst du?"
    }},
    // Level 4: Speed-Chunking
    { title: "16 Ziffern blitz", level: 4, type: "chunk", data: {
      sequence: "7 2 4 8 3 6 1 9 5 0 8 2 4 7 6 3",
      solution: ["7248", "3619", "5082", "4763"],
      hint: "4er-Gruppen – du hast 10 Sekunden!"
    }},
    // Level 5: Muster-Chunking
    { title: "Binärcode knacken", level: 5, type: "chunk", data: {
      sequence: "1 0 1 1 0 0 1 0 1 1 1 0 0 1 0 1",
      solution: ["1011", "0010", "1110", "0101"],
      hint: "4-Bit-Gruppen – wie ein Computer denkt!"
    }},
  ],
  visual: [
    { title: "3 Bilder merken", level: 1, type: "visual-recall", data: { images: ["🏔️", "🌈", "🎪"], displayTime: 5 }},
    { title: "5 Formen erkennen", level: 1, type: "visual-recall", data: { images: ["🔴", "🟦", "🔶", "🟢", "🟣"], displayTime: 5 }},
    // Level 2: Reihenfolge merken
    { title: "6er Sequenz", level: 2, type: "visual-sequence", data: {
      sequence: ["🌙", "⭐", "🌊", "🔥", "🌿", "💎"],
      displayTime: 6
    }},
    { title: "Farbreihenfolge", level: 2, type: "visual-sequence", data: {
      sequence: ["🔴", "🔵", "🟡", "🟢", "🟣", "🟠", "⚪"],
      displayTime: 7
    }},
    // Level 3: Grid-Memory (Positionen merken)
    { title: "4×4 Grid merken", level: 3, type: "visual-grid", data: {
      gridSize: 4, activeCount: 5, displayTime: 4,
    }},
    { title: "4×4 Grid schwer", level: 3, type: "visual-grid", data: {
      gridSize: 4, activeCount: 7, displayTime: 5,
    }},
    // Level 4: Mentale Rotation
    { title: "Muster-Vergleich", level: 4, type: "visual-pattern", data: {
      patterns: [
        { grid: [1,0,1,0, 0,1,0,1, 1,0,1,0, 0,1,0,1], size: 4 },
        { grid: [1,1,0,0, 0,0,1,1, 1,1,0,0, 0,0,1,1], size: 4 },
        { grid: [0,1,1,0, 1,0,0,1, 1,0,0,1, 0,1,1,0], size: 4 },
      ],
      displayTime: 3
    }},
    // Level 5: 8 Bilder + Details
    { title: "8 Bilder mit Details", level: 5, type: "visual-recall", data: {
      images: ["🏰", "🌋", "🎭", "🗿", "🎠", "🏺", "🪬", "🎑"],
      displayTime: 8
    }},
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// CREATE ITEMS FROM BANK
// ═══════════════════════════════════════════════════════════════════════════
function createInitialItems(dbExercises = []) {
  const items = [];
  for (const [stationId, exercises] of Object.entries(EXERCISE_BANK)) {
    exercises.forEach((ex, i) => {
      const itemId = `${stationId}_${i}`;
      // Merge with DB state if available
      const dbMatch = dbExercises.find(
        d => d.station === stationId && d.level === ex.level && d.exercise_title === ex.title
      );
      items.push({
        id: itemId, station: stationId, title: ex.title,
        level: ex.level, type: ex.type, data: ex.data,
        sr: dbMatch
          ? { repetition: dbMatch.repetitions, interval: dbMatch.interval_days, easeFactor: dbMatch.ease_factor }
          : { repetition: 0, interval: 0, easeFactor: INIT_EF },
        lastReviewedAt: dbMatch?.last_review || null,
        totalReviews: dbMatch?.times_practiced || 0,
        correctReviews: 0,  // not tracked separately in DB
        totalXP: dbMatch?.total_xp || 0,
        dbId: dbMatch?.id || null,  // track DB row ID for updates
      });
    });
  }
  return items;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXERCISE COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

// --- LOCI EXERCISE (standard + ordering variant) ---
function LociExercise({ data, onComplete }) {
  const [phase, setPhase] = useState("learn");
  const [idx, setIdx] = useState(0);
  const [timer, setTimer] = useState(data.learnTime || 5);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [orderAnswers, setOrderAnswers] = useState([]);
  const startRef = useRef(Date.now());
  const locs = useMemo(() => [...data.items.map(i => i.location)].sort(() => Math.random() - 0.5), [data]);

  useEffect(() => {
    if (phase === "learn" && timer > 0) {
      const t = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(t);
    }
    if (phase === "learn" && timer === 0) {
      if (idx < data.items.length - 1) { setIdx(idx + 1); setTimer(data.learnTime || 5); }
      else {
        if (data.requireOrder) { setPhase("order"); setIdx(0); }
        else { setPhase("test"); setIdx(0); }
      }
    }
  }, [phase, timer, idx, data]);

  const handleAnswer = (loc) => {
    if (selected !== null) return;
    setSelected(loc);
    const correct = loc === data.items[idx].location;
    const newA = [...answers, correct];
    setAnswers(newA);
    setTimeout(() => {
      if (idx < data.items.length - 1) { setIdx(idx + 1); setSelected(null); }
      else {
        const pct = newA.filter(Boolean).length / data.items.length;
        onComplete(pct, Date.now() - startRef.current);
      }
    }, 600);
  };

  // Order phase: tap items in correct sequence
  const handleOrderTap = (item) => {
    const expected = data.items[orderAnswers.length];
    const correct = item === expected.item;
    const newOA = [...orderAnswers, { item, correct }];
    setOrderAnswers(newOA);
    if (newOA.length >= data.items.length) {
      const pct = newOA.filter(o => o.correct).length / data.items.length;
      onComplete(pct, Date.now() - startRef.current);
    }
  };

  if (phase === "learn") return (
    <div style={{ textAlign: "center", animation: "fadeIn 0.3s ease" }}>
      <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 12 }}>
        Merk dir: Gegenstand + Ort ({idx + 1}/{data.items.length})
      </div>
      <div style={{ fontSize: 44, marginBottom: 6 }}>{data.items[idx].item.split(" ")[0]}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{data.items[idx].item.split(" ").slice(1).join(" ")}</div>
      <div style={{ fontSize: 15, color: C.purple, marginTop: 6 }}>📍 {data.items[idx].location}</div>
      {data.requireOrder && <div style={{ fontSize: 11, color: C.warning, marginTop: 8 }}>⚠️ Reihenfolge merken!</div>}
      <div style={{
        marginTop: 14, width: 40, height: 40, borderRadius: "50%", margin: "12px auto",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16, fontWeight: 700,
        background: timer <= 2 ? "rgba(239,68,68,0.15)" : "rgba(14,165,233,0.15)",
        color: timer <= 2 ? C.danger : C.action, border: `2px solid ${timer <= 2 ? C.danger : C.action}40`,
      }}>{timer}</div>
    </div>
  );

  if (phase === "order") {
    const shuffledItems = useMemo(() => [...data.items].sort(() => Math.random() - 0.5), [data]);
    return (
      <div style={{ textAlign: "center", animation: "fadeIn 0.3s ease" }}>
        <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 12 }}>
          Tippe die Gegenstände in der richtigen Reihenfolge! ({orderAnswers.length}/{data.items.length})
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
          {shuffledItems.map((it, i) => {
            const alreadyTapped = orderAnswers.some(o => o.item === it.item);
            const tapResult = orderAnswers.find(o => o.item === it.item);
            return (
              <button key={i} onClick={() => !alreadyTapped && handleOrderTap(it.item)} disabled={alreadyTapped} style={{
                background: alreadyTapped ? (tapResult?.correct ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)") : C.surface,
                border: `1.5px solid ${alreadyTapped ? (tapResult?.correct ? C.success : C.danger) : C.border}`,
                borderRadius: 10, padding: "8px 14px", fontSize: 13, color: C.text,
                cursor: alreadyTapped ? "default" : "pointer", opacity: alreadyTapped ? 0.5 : 1,
              }}>{it.item}</button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", animation: "fadeIn 0.3s ease" }}>
      <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 10 }}>
        Wo lag dieser Gegenstand? ({idx + 1}/{data.items.length})
      </div>
      <div style={{ fontSize: 32, marginBottom: 2 }}>{data.items[idx].item.split(" ")[0]}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 14 }}>{data.items[idx].item.split(" ").slice(1).join(" ")}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 280, margin: "0 auto" }}>
        {locs.map(loc => {
          const isCorrect = loc === data.items[idx].location;
          const isSel = selected === loc;
          return (
            <button key={loc} onClick={() => handleAnswer(loc)} style={{
              background: isSel ? (isCorrect ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)") : C.surface,
              border: `1.5px solid ${isSel ? (isCorrect ? C.success : C.danger) : C.border}`,
              borderRadius: 10, padding: "9px 12px", fontSize: 13, color: C.text,
              cursor: selected ? "default" : "pointer", textAlign: "left",
            }}>📍 {loc}</button>
          );
        })}
      </div>
    </div>
  );
}

// --- ASSOCIATION EXERCISES ---
function AssociationExercise({ data, type, onComplete }) {
  const [pairIdx, setPairIdx] = useState(0);
  const [story, setStory] = useState("");
  const [stories, setStories] = useState([]);
  const [timeLeft, setTimeLeft] = useState(type === "assoc-speed" ? data.timePerPair : null);
  const startRef = useRef(Date.now());
  const items = type === "assoc-chain" ? [data.words] : data.pairs;

  useEffect(() => {
    if (type === "assoc-speed" && timeLeft !== null && timeLeft > 0) {
      const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(t);
    }
    if (type === "assoc-speed" && timeLeft === 0) submit();
  }, [timeLeft, type]);

  const submit = () => {
    if (!story.trim() && type !== "assoc-speed") return;
    const newStories = [...stories, story.trim() || "(Zeit abgelaufen)"];
    setStories(newStories);
    if (pairIdx < items.length - 1) {
      setPairIdx(pairIdx + 1); setStory("");
      if (type === "assoc-speed") setTimeLeft(data.timePerPair);
    } else {
      const avgLen = newStories.reduce((s, st) => s + st.length, 0) / newStories.length;
      const pct = Math.min(1, Math.max(0.3, avgLen / 50));
      onComplete(pct, Date.now() - startRef.current);
    }
  };

  const currentPair = type === "assoc-chain" ? data.words : items[pairIdx];
  const isChain = type === "assoc-chain";

  return (
    <div style={{ textAlign: "center", animation: "fadeIn 0.3s ease" }}>
      <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 12 }}>
        {isChain ? "Verbinde ALLE Wörter zu einer Geschichte!" : `Verbinde diese Begriffe (${pairIdx + 1}/${items.length})`}
      </div>
      {type === "assoc-speed" && timeLeft !== null && (
        <div style={{
          fontSize: 14, fontWeight: 700, marginBottom: 10,
          color: timeLeft <= 5 ? C.danger : C.action,
        }}>⏱ {timeLeft}s</div>
      )}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {(Array.isArray(currentPair) ? currentPair : [currentPair]).map((word, i) => (
          <div key={i} style={{
            background: "rgba(244,114,182,0.12)", border: "1px solid rgba(244,114,182,0.3)",
            borderRadius: 10, padding: "8px 14px", fontSize: isChain ? 14 : 16, fontWeight: 700, color: "#f472b6",
          }}>{word}</div>
        ))}
      </div>
      {isChain && data.hint && <div style={{ fontSize: 12, color: C.textDim, marginBottom: 10 }}>{data.hint}</div>}
      <textarea value={story} onChange={e => setStory(e.target.value)}
        placeholder="Erfinde eine verrückte Geschichte..."
        style={{
          width: "100%", minHeight: 70, background: C.surface, border: `1.5px solid ${C.border}`,
          borderRadius: 10, padding: 10, fontSize: 13, color: C.text, fontFamily: "inherit", boxSizing: "border-box", resize: "vertical",
        }} />
      <button onClick={submit} disabled={!story.trim()} style={{
        marginTop: 8, background: story.trim() ? "#f472b6" : C.surface,
        border: "none", borderRadius: 10, padding: "9px 18px",
        color: story.trim() ? C.base : C.textDim, fontWeight: 600, fontSize: 13, cursor: story.trim() ? "pointer" : "default",
      }}>{pairIdx < items.length - 1 ? "Weiter →" : "Fertig ✨"}</button>
    </div>
  );
}

// --- STROOP EXERCISES (normal + reverse) ---
function StroopExercise({ data, type, onComplete }) {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(null);
  const startRef = useRef(Date.now());
  const isReverse = type === "reverse-stroop";
  const colors = ["rot", "blau", "grün", "lila", "gelb"];
  const wordOptions = ["ROT", "BLAU", "GRÜN", "GELB"];
  const word = data.words[idx];

  const handle = (c) => {
    if (answered !== null) return;
    const correct = isReverse ? c === word.answer : c === word.answer;
    setAnswered(correct);
    if (correct) setScore(score + 1);
    setTimeout(() => {
      if (idx < data.words.length - 1) { setIdx(idx + 1); setAnswered(null); }
      else { onComplete((score + (correct ? 1 : 0)) / data.words.length, Date.now() - startRef.current); }
    }, 450);
  };

  const options = isReverse ? wordOptions : colors.filter(c => data.words.some(w => w.answer === c));
  const cm = { rot: "#ef4444", blau: "#60a5fa", grün: "#34d399", lila: "#a78bfa", gelb: "#fbbf24", ROT: "#ef4444", BLAU: "#60a5fa", GRÜN: "#34d399", GELB: "#fbbf24" };

  return (
    <div style={{ textAlign: "center", animation: "fadeIn 0.3s ease" }}>
      <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 6 }}>
        {isReverse ? "Welches WORT steht da?" : "Welche FARBE hat das Wort?"} ({idx + 1}/{data.words.length})
      </div>
      <div style={{
        fontSize: 48, fontWeight: 900, color: word.color, margin: "16px 0 22px",
        textShadow: `0 0 24px ${word.color}30`, letterSpacing: 3,
      }}>{word.text}</div>
      <div style={{ display: "flex", gap: 7, justifyContent: "center", flexWrap: "wrap" }}>
        {options.map(c => (
          <button key={c} onClick={() => handle(c)} style={{
            background: C.surface, border: `2px solid ${C.border}`, borderRadius: 10,
            padding: "9px 16px", fontSize: 13, fontWeight: 600, color: cm[c] || C.text,
            cursor: answered !== null ? "default" : "pointer", minWidth: 60,
          }}>{c}</button>
        ))}
      </div>
      {answered !== null && <div style={{ marginTop: 10, fontSize: 22 }}>{answered ? "✅" : "❌"}</div>}
    </div>
  );
}

// --- NUMBER STROOP ---
function NumberStroopExercise({ data, onComplete }) {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(null);
  const startRef = useRef(Date.now());
  const trial = data.trials[idx];

  const handle = (ans) => {
    if (answered !== null) return;
    const correct = ans === trial.answer;
    setAnswered(correct);
    if (correct) setScore(score + 1);
    setTimeout(() => {
      if (idx < data.trials.length - 1) { setIdx(idx + 1); setAnswered(null); }
      else onComplete((score + (correct ? 1 : 0)) / data.trials.length, Date.now() - startRef.current);
    }, 500);
  };

  const options = [...new Set(data.trials.map(t => t.answer))].sort();

  return (
    <div style={{ textAlign: "center", animation: "fadeIn 0.3s ease" }}>
      <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 6 }}>
        Wie VIELE Ziffern siehst du? (Nicht den Wert!) ({idx + 1}/{data.trials.length})
      </div>
      <div style={{
        fontSize: 56, fontWeight: 900, color: C.action, margin: "20px 0 24px",
        letterSpacing: 10, fontFamily: "monospace",
      }}>{trial.display}</div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        {options.map(o => (
          <button key={o} onClick={() => handle(o)} style={{
            width: 48, height: 48, borderRadius: 12, fontSize: 20, fontWeight: 700,
            background: C.surface, border: `2px solid ${C.border}`, color: C.text,
            cursor: answered !== null ? "default" : "pointer",
          }}>{o}</button>
        ))}
      </div>
      {answered !== null && <div style={{ marginTop: 10, fontSize: 22 }}>{answered ? "✅" : "❌"}</div>}
    </div>
  );
}

// --- DUAL N-BACK — the crown jewel ---
function NBackExercise({ data, onComplete }) {
  const { n, rounds, gridSize } = data;
  const [sequence, setSequence] = useState([]);
  const [round, setRound] = useState(0);
  const [currentPos, setCurrentPos] = useState(null);
  const [currentLetter, setCurrentLetter] = useState(null);
  const [posMatch, setPosMatch] = useState(false);
  const [letterMatch, setLetterMatch] = useState(false);
  const [results, setResults] = useState([]);
  const [phase, setPhase] = useState("intro"); // intro, play, feedback, done
  const [feedback, setFeedback] = useState(null);
  const startRef = useRef(Date.now());
  const letters = ["C", "H", "K", "L", "Q", "R", "S", "T"];

  // Generate full sequence on mount
  useEffect(() => {
    const seq = [];
    for (let i = 0; i < rounds; i++) {
      let pos = Math.floor(Math.random() * (gridSize * gridSize));
      let letter = letters[Math.floor(Math.random() * letters.length)];
      // Force ~30% matches for both
      if (i >= n && Math.random() < 0.3) pos = seq[i - n].pos;
      if (i >= n && Math.random() < 0.3) letter = seq[i - n].letter;
      seq.push({ pos, letter });
    }
    setSequence(seq);
  }, []);

  // Auto-advance rounds
  useEffect(() => {
    if (phase !== "play" || round >= rounds || sequence.length === 0) return;
    setCurrentPos(sequence[round].pos);
    setCurrentLetter(sequence[round].letter);
    setPosMatch(false);
    setLetterMatch(false);
    const t = setTimeout(() => {
      // Check answers
      const actualPosMatch = round >= n && sequence[round].pos === sequence[round - n].pos;
      const actualLetterMatch = round >= n && sequence[round].letter === sequence[round - n].letter;
      const posCorrect = posMatch === actualPosMatch;
      const letterCorrect = letterMatch === actualLetterMatch;
      setResults(prev => [...prev, { posCorrect, letterCorrect }]);
      setFeedback({ posCorrect, letterCorrect, actualPosMatch, actualLetterMatch });
      setPhase("feedback");
      setTimeout(() => {
        setFeedback(null);
        if (round < rounds - 1) { setRound(round + 1); setPhase("play"); }
        else setPhase("done");
      }, 600);
    }, 2500);
    return () => clearTimeout(t);
  }, [phase, round, sequence]);

  useEffect(() => {
    if (phase === "done" && results.length > 0) {
      const total = results.length * 2;
      const correct = results.reduce((s, r) => s + (r.posCorrect ? 1 : 0) + (r.letterCorrect ? 1 : 0), 0);
      onComplete(correct / total, Date.now() - startRef.current);
    }
  }, [phase, results]);

  if (phase === "intro") return (
    <div style={{ textAlign: "center", animation: "fadeIn 0.3s ease" }}>
      <div style={{ fontSize: 28, marginBottom: 10 }}>🧠</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 8 }}>Dual {n}-Back</div>
      <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6, marginBottom: 16, maxWidth: 280, margin: "0 auto 16px" }}>
        Du siehst ein <strong style={{ color: C.action }}>Quadrat</strong> im Gitter und einen <strong style={{ color: C.purple }}>Buchstaben</strong>.
        Drücke <strong style={{ color: "#34d399" }}>Position</strong>, wenn das Quadrat an der <em>gleichen Stelle</em> wie vor {n} Runde{n > 1 ? "n" : ""} war.
        Drücke <strong style={{ color: "#f472b6" }}>Buchstabe</strong>, wenn der Buchstabe <em>gleich</em> wie vor {n} Runde{n > 1 ? "n" : ""} war.
      </div>
      <button onClick={() => setPhase("play")} style={{
        background: C.action, border: "none", borderRadius: 10, padding: "10px 24px",
        color: C.base, fontWeight: 700, fontSize: 14, cursor: "pointer",
      }}>Start!</button>
    </div>
  );

  if (phase === "done") return null;

  // Grid rendering
  const cells = Array.from({ length: gridSize * gridSize }, (_, i) => i);
  return (
    <div style={{ textAlign: "center", animation: "fadeIn 0.2s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: C.textDim }}>Runde {round + 1}/{rounds}</span>
        <span style={{ fontSize: 11, color: C.textDim }}>Dual {n}-Back</span>
      </div>

      {/* Letter display */}
      <div style={{
        fontSize: 36, fontWeight: 900, color: C.purple, marginBottom: 10,
        animation: "scaleIn 0.2s ease",
      }}>{currentLetter}</div>

      {/* Grid */}
      <div style={{
        display: "grid", gridTemplateColumns: `repeat(${gridSize}, 1fr)`, gap: 4,
        width: gridSize * 52, margin: "0 auto 14px",
      }}>
        {cells.map(i => (
          <div key={i} style={{
            width: 48, height: 48, borderRadius: 8,
            background: i === currentPos ? C.action : C.surface,
            border: `1.5px solid ${i === currentPos ? C.action : C.border}`,
            transition: "all 0.15s ease",
            boxShadow: i === currentPos ? `0 0 16px ${C.action}50` : "none",
          }} />
        ))}
      </div>

      {/* Match buttons */}
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <button onClick={() => setPosMatch(!posMatch)} style={{
          flex: 1, maxWidth: 130, padding: "10px 8px", borderRadius: 10, cursor: "pointer",
          background: posMatch ? "rgba(52,211,153,0.2)" : C.surface,
          border: `2px solid ${posMatch ? "#34d399" : C.border}`,
          color: posMatch ? "#34d399" : C.textMuted, fontWeight: 600, fontSize: 12,
        }}>📍 Position{posMatch ? " ✓" : ""}</button>
        <button onClick={() => setLetterMatch(!letterMatch)} style={{
          flex: 1, maxWidth: 130, padding: "10px 8px", borderRadius: 10, cursor: "pointer",
          background: letterMatch ? "rgba(244,114,182,0.2)" : C.surface,
          border: `2px solid ${letterMatch ? "#f472b6" : C.border}`,
          color: letterMatch ? "#f472b6" : C.textMuted, fontWeight: 600, fontSize: 12,
        }}>🔤 Buchstabe{letterMatch ? " ✓" : ""}</button>
      </div>

      {/* Feedback flash */}
      {feedback && (
        <div style={{ marginTop: 10, display: "flex", gap: 8, justifyContent: "center", animation: "scaleIn 0.2s ease" }}>
          <span style={{ fontSize: 11, color: feedback.posCorrect ? C.success : C.danger }}>
            Pos: {feedback.posCorrect ? "✅" : "❌"}
          </span>
          <span style={{ fontSize: 11, color: feedback.letterCorrect ? C.success : C.danger }}>
            Bst: {feedback.letterCorrect ? "✅" : "❌"}
          </span>
        </div>
      )}
    </div>
  );
}

// --- CHUNKING EXERCISES ---
function ChunkingExercise({ data, type, onComplete }) {
  const [phase, setPhase] = useState("show");
  const [input, setInput] = useState("");
  const [timer, setTimer] = useState(type === "chunk" && data.sequence.length > 20 ? 10 : 8);
  const [categoryAnswers, setCategoryAnswers] = useState({});
  const [dragItem, setDragItem] = useState(null);
  const startRef = useRef(Date.now());

  useEffect(() => {
    if (phase === "show" && timer > 0) {
      const t = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(t);
    }
    if (phase === "show" && timer === 0) setPhase("answer");
  }, [phase, timer]);

  const checkChunk = () => {
    const userChunks = input.trim().split(/[\s,;-]+/).filter(Boolean);
    const correct = data.solution.filter(s => userChunks.some(u => u.toLowerCase() === s.toLowerCase())).length;
    onComplete(correct / data.solution.length, Date.now() - startRef.current);
  };

  const checkCategory = () => {
    let correct = 0, total = 0;
    for (const [cat, items] of Object.entries(data.categories)) {
      total += items.length;
      const userItems = categoryAnswers[cat] || [];
      correct += items.filter(it => userItems.includes(it)).length;
    }
    onComplete(correct / total, Date.now() - startRef.current);
  };

  if (type === "chunk-category") {
    const cats = Object.keys(data.categories);
    const assigned = Object.values(categoryAnswers).flat();
    const unassigned = data.items.filter(it => !assigned.includes(it));

    return (
      <div style={{ textAlign: "center", animation: "fadeIn 0.3s ease" }}>
        <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 8 }}>
          Sortiere die Begriffe in Kategorien!
        </div>
        <div style={{ fontSize: 12, color: "#34d399", marginBottom: 12 }}>💡 {data.hint}</div>

        {/* Unassigned items */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, justifyContent: "center", marginBottom: 14 }}>
          {unassigned.map(it => (
            <button key={it} onClick={() => {
              if (!dragItem) setDragItem(it);
            }} style={{
              background: dragItem === it ? "rgba(52,211,153,0.2)" : C.surface,
              border: `1.5px solid ${dragItem === it ? C.success : C.border}`,
              borderRadius: 8, padding: "5px 10px", fontSize: 12, color: C.text, cursor: "pointer",
            }}>{it}</button>
          ))}
        </div>

        {/* Categories */}
        <div style={{ display: "flex", gap: 8 }}>
          {cats.map(cat => (
            <button key={cat} onClick={() => {
              if (dragItem) {
                setCategoryAnswers(prev => ({ ...prev, [cat]: [...(prev[cat] || []), dragItem] }));
                setDragItem(null);
              }
            }} style={{
              flex: 1, background: C.surface, border: `1.5px solid ${C.border}`,
              borderRadius: 12, padding: 10, textAlign: "center", cursor: dragItem ? "pointer" : "default",
              minHeight: 80,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.teal, marginBottom: 6 }}>{cat}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 3, justifyContent: "center" }}>
                {(categoryAnswers[cat] || []).map(it => (
                  <span key={it} style={{
                    fontSize: 10, background: "rgba(52,211,153,0.12)", borderRadius: 4,
                    padding: "2px 6px", color: C.text,
                  }}>{it}</span>
                ))}
              </div>
            </button>
          ))}
        </div>
        {dragItem && <div style={{ marginTop: 8, fontSize: 11, color: C.warning }}>"{dragItem}" — tippe auf eine Kategorie!</div>}
        {unassigned.length === 0 && (
          <button onClick={checkCategory} style={{
            marginTop: 12, background: "#34d399", border: "none", borderRadius: 10,
            padding: "9px 18px", color: C.base, fontWeight: 600, fontSize: 13, cursor: "pointer",
          }}>Prüfen ✓</button>
        )}
      </div>
    );
  }

  // Standard chunk
  if (phase === "show") return (
    <div style={{ textAlign: "center", animation: "fadeIn 0.3s ease" }}>
      <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 12 }}>Merk dir die Sequenz!</div>
      <div style={{
        fontSize: data.sequence.length > 20 ? 20 : 26, fontWeight: 700, color: C.text,
        letterSpacing: data.sequence.length > 20 ? 3 : 5, background: C.surface,
        borderRadius: 12, padding: "16px 12px", marginBottom: 12, fontFamily: "monospace",
      }}>{data.sequence}</div>
      <div style={{ fontSize: 12, color: "#34d399" }}>💡 {data.hint}</div>
      <div style={{
        marginTop: 12, width: 36, height: 36, borderRadius: "50%", margin: "0 auto",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14, fontWeight: 700, color: C.action,
        background: "rgba(14,165,233,0.15)", border: `2px solid ${C.action}40`,
      }}>{timer}</div>
    </div>
  );

  return (
    <div style={{ textAlign: "center", animation: "fadeIn 0.3s ease" }}>
      <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 10 }}>Gruppiere! (Trenne mit Leerzeichen)</div>
      <div style={{ fontSize: 12, color: "#34d399", marginBottom: 10 }}>💡 {data.hint}</div>
      <input value={input} onChange={e => setInput(e.target.value)} placeholder="z.B. 48 27 15 93"
        style={{
          width: "100%", background: C.surface, border: `1.5px solid ${C.border}`,
          borderRadius: 10, padding: 10, fontSize: 15, color: C.text,
          fontFamily: "monospace", textAlign: "center", boxSizing: "border-box",
        }} />
      <button onClick={checkChunk} disabled={!input.trim()} style={{
        marginTop: 10, background: input.trim() ? "#34d399" : C.surface,
        border: "none", borderRadius: 10, padding: "9px 18px",
        color: input.trim() ? C.base : C.textDim, fontWeight: 600, fontSize: 13, cursor: input.trim() ? "pointer" : "default",
      }}>Prüfen ✓</button>
    </div>
  );
}

// --- VISUAL EXERCISES ---
function VisualExercise({ data, type, onComplete }) {
  const [phase, setPhase] = useState("show");
  const [timer, setTimer] = useState(data.displayTime || 5);
  const [input, setInput] = useState("");
  const [seqAnswer, setSeqAnswer] = useState([]);
  const [gridAnswer, setGridAnswer] = useState([]);
  const [patternIdx, setPatternIdx] = useState(0);
  const [patternAnswer, setPatternAnswer] = useState([]);
  const startRef = useRef(Date.now());

  // Grid: random active cells
  const activeCells = useMemo(() => {
    if (type !== "visual-grid") return [];
    const total = data.gridSize * data.gridSize;
    const cells = [];
    while (cells.length < data.activeCount) {
      const c = Math.floor(Math.random() * total);
      if (!cells.includes(c)) cells.push(c);
    }
    return cells;
  }, [data, type]);

  useEffect(() => {
    if (phase === "show" && timer > 0) {
      const t = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(t);
    }
    if (phase === "show" && timer === 0) setPhase("recall");
  }, [phase, timer]);

  const finish = (pct) => onComplete(pct, Date.now() - startRef.current);

  // --- Simple recall ---
  if (type === "visual-recall") {
    if (phase === "show") return (
      <div style={{ textAlign: "center", animation: "fadeIn 0.3s ease" }}>
        <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 12 }}>Merk dir alle Bilder!</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, fontSize: 40, flexWrap: "wrap", marginBottom: 12 }}>
          {data.images.map((img, i) => <span key={i} style={{ animation: `scaleIn 0.3s ease ${i * 0.08}s both` }}>{img}</span>)}
        </div>
        <div style={{ fontSize: 13, color: C.action }}>{timer}s</div>
      </div>
    );
    return (
      <div style={{ textAlign: "center", animation: "fadeIn 0.3s ease" }}>
        <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 10 }}>Beschreibe alle Bilder!</div>
        <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Ich habe gesehen: ..."
          style={{ width: "100%", minHeight: 70, background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: 10, fontSize: 13, color: C.text, fontFamily: "inherit", boxSizing: "border-box" }} />
        <button onClick={() => finish(Math.min(1, Math.max(0.3, input.trim().length / (data.images.length * 10))))} disabled={!input.trim()} style={{
          marginTop: 8, background: input.trim() ? "#fbbf24" : C.surface, border: "none", borderRadius: 10, padding: "9px 18px",
          color: input.trim() ? C.base : C.textDim, fontWeight: 600, fontSize: 13, cursor: input.trim() ? "pointer" : "default",
        }}>Fertig 👁️</button>
      </div>
    );
  }

  // --- Sequence recall ---
  if (type === "visual-sequence") {
    if (phase === "show") return (
      <div style={{ textAlign: "center", animation: "fadeIn 0.3s ease" }}>
        <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 12 }}>Merk dir die Reihenfolge!</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, fontSize: 36, flexWrap: "wrap", marginBottom: 12 }}>
          {data.sequence.map((s, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", animation: `scaleIn 0.3s ease ${i * 0.1}s both` }}>
              <span>{s}</span>
              <span style={{ fontSize: 9, color: C.textDim }}>{i + 1}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 13, color: C.action }}>{timer}s</div>
      </div>
    );

    const shuffled = useMemo(() => [...data.sequence].sort(() => Math.random() - 0.5), [data]);
    const remaining = shuffled.filter(s => !seqAnswer.includes(s));

    return (
      <div style={{ textAlign: "center", animation: "fadeIn 0.3s ease" }}>
        <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 10 }}>Tippe in der richtigen Reihenfolge!</div>
        {/* Already placed */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 12, minHeight: 40 }}>
          {seqAnswer.map((s, i) => {
            const correct = s === data.sequence[i];
            return <span key={i} style={{
              fontSize: 28, opacity: correct ? 1 : 0.5,
              filter: correct ? "none" : "grayscale(1)",
            }}>{s}</span>;
          })}
          {seqAnswer.length < data.sequence.length && <span style={{ fontSize: 28, color: C.textDim }}>?</span>}
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {remaining.map(s => (
            <button key={s} onClick={() => {
              const newA = [...seqAnswer, s];
              setSeqAnswer(newA);
              if (newA.length >= data.sequence.length) {
                const correct = newA.filter((a, i) => a === data.sequence[i]).length;
                finish(correct / data.sequence.length);
              }
            }} style={{
              fontSize: 28, background: C.surface, border: `1.5px solid ${C.border}`,
              borderRadius: 10, padding: "6px 12px", cursor: "pointer",
            }}>{s}</button>
          ))}
        </div>
      </div>
    );
  }

  // --- Grid memory ---
  if (type === "visual-grid") {
    const gs = data.gridSize;
    const total = gs * gs;
    if (phase === "show") return (
      <div style={{ textAlign: "center", animation: "fadeIn 0.3s ease" }}>
        <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 12 }}>Merk dir die markierten Felder!</div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${gs},1fr)`, gap: 4, width: gs * 48, margin: "0 auto 12px" }}>
          {Array.from({ length: total }, (_, i) => (
            <div key={i} style={{
              width: 44, height: 44, borderRadius: 8,
              background: activeCells.includes(i) ? C.action : C.surface,
              border: `1.5px solid ${activeCells.includes(i) ? C.action : C.border}`,
              boxShadow: activeCells.includes(i) ? `0 0 10px ${C.action}40` : "none",
            }} />
          ))}
        </div>
        <div style={{ fontSize: 13, color: C.action }}>{timer}s</div>
      </div>
    );

    return (
      <div style={{ textAlign: "center", animation: "fadeIn 0.3s ease" }}>
        <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 10 }}>
          Tippe die markierten Felder an! ({gridAnswer.length}/{data.activeCount})
        </div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${gs},1fr)`, gap: 4, width: gs * 48, margin: "0 auto 12px" }}>
          {Array.from({ length: total }, (_, i) => {
            const isSelected = gridAnswer.includes(i);
            return (
              <button key={i} onClick={() => {
                if (isSelected) return;
                const newA = [...gridAnswer, i];
                setGridAnswer(newA);
                if (newA.length >= data.activeCount) {
                  const correct = newA.filter(c => activeCells.includes(c)).length;
                  finish(correct / data.activeCount);
                }
              }} style={{
                width: 44, height: 44, borderRadius: 8, cursor: isSelected ? "default" : "pointer",
                background: isSelected ? (activeCells.includes(i) ? "rgba(14,165,233,0.25)" : "rgba(239,68,68,0.15)") : C.surface,
                border: `1.5px solid ${isSelected ? (activeCells.includes(i) ? C.action : C.danger) : C.border}`,
              }} />
            );
          })}
        </div>
      </div>
    );
  }

  // --- Pattern compare ---
  if (type === "visual-pattern") {
    const pattern = data.patterns[patternIdx];
    if (phase === "show") return (
      <div style={{ textAlign: "center", animation: "fadeIn 0.3s ease" }}>
        <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 12 }}>Merk dir das Muster! ({patternIdx + 1}/{data.patterns.length})</div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${pattern.size},1fr)`, gap: 3, width: pattern.size * 44, margin: "0 auto 12px" }}>
          {pattern.grid.map((cell, i) => (
            <div key={i} style={{
              width: 40, height: 40, borderRadius: 6,
              background: cell ? "#fbbf24" : C.surface,
              border: `1px solid ${cell ? "#fbbf24" : C.border}`,
            }} />
          ))}
        </div>
        <div style={{ fontSize: 13, color: C.action }}>{timer}s</div>
      </div>
    );

    return (
      <div style={{ textAlign: "center", animation: "fadeIn 0.3s ease" }}>
        <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 10 }}>Reproduziere das Muster!</div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${pattern.size},1fr)`, gap: 3, width: pattern.size * 44, margin: "0 auto 12px" }}>
          {pattern.grid.map((_, i) => {
            const isActive = patternAnswer.includes(i);
            return (
              <button key={i} onClick={() => {
                setPatternAnswer(prev => prev.includes(i) ? prev.filter(p => p !== i) : [...prev, i]);
              }} style={{
                width: 40, height: 40, borderRadius: 6, cursor: "pointer",
                background: isActive ? "#fbbf24" : C.surface,
                border: `1px solid ${isActive ? "#fbbf24" : C.border}`,
              }} />
            );
          })}
        </div>
        <button onClick={() => {
          const correct = pattern.grid.reduce((s, cell, i) => {
            const userActive = patternAnswer.includes(i);
            return s + ((cell === 1) === userActive ? 1 : 0);
          }, 0);
          const pct = correct / pattern.grid.length;
          if (patternIdx < data.patterns.length - 1) {
            setPatternIdx(patternIdx + 1); setPatternAnswer([]); setPhase("show"); setTimer(data.displayTime);
          } else finish(pct);
        }} style={{
          background: "#fbbf24", border: "none", borderRadius: 10, padding: "9px 18px",
          color: C.base, fontWeight: 600, fontSize: 13, cursor: "pointer",
        }}>Prüfen</button>
      </div>
    );
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// PROGRESS RING
// ═══════════════════════════════════════════════════════════════════════════
function Ring({ progress, size = 48, stroke = 3, color }) {
  const r = (size - stroke) / 2, circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={circ - (progress/100)*circ}
        strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.8s ease" }} />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════
const V = { HUB: 0, EXERCISE: 1, RATE: 2, RESULT: 3, DONE: 4, PASS: 5 };

export default function DenkariumExpanded() {
  const { legacyUserId } = useAuth();
  const completeExercise = useCompleteExercise();
  const { data: progressData } = useDenkariumProgress();

  // Load exercise state from Supabase
  const [dbLoaded, setDbLoaded] = useState(false);
  const [items, setItems] = useState(() => createInitialItems());

  useEffect(() => {
    if (!legacyUserId || dbLoaded) return;
    import('@/lib/supabase').then(({ supabase }) => {
      supabase
        .from('denkarium_exercises')
        .select('*')
        .eq('user_id', legacyUserId)
        .then(({ data }) => {
          if (data && data.length > 0) {
            setItems(createInitialItems(data));
          }
          setDbLoaded(true);
        });
    });
  }, [legacyUserId, dbLoaded]);

  const [view, setView] = useState(V.HUB);
  const [station, setStation] = useState(null);
  const [queue, setQueue] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [exResult, setExResult] = useState(null);
  const [selRating, setSelRating] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [streak, setStreak] = useState(0);
  const [sxp, setSxp] = useState(0);
  const [lastCalc, setLastCalc] = useState(null);
  const [filterLevel, setFilterLevel] = useState(null);

  const cur = queue[qIdx] || null;
  const stMeta = station ? STATIONS[station] : null;
  const totalXP = useMemo(() => items.reduce((s, i) => s + i.totalXP, 0), [items]);
  const brainLevel = useMemo(() => {
    const t = [0,300,800,1500,2500,4000,6000,9000,13000,18000];
    for (let i = t.length - 1; i >= 0; i--) if (totalXP >= t[i]) return i + 1;
    return 1;
  }, [totalXP]);

  const startStation = (sid, level) => {
    setStation(sid);
    const q = items.filter(i => i.station === sid && (level == null || i.level === level));
    setQueue(q); setQIdx(0); setReviews([]); setStreak(0); setSxp(0);
    setExResult(null); setSelRating(null); setFilterLevel(level);
    setView(V.EXERCISE);
  };

  const onExComplete = (pct, timeMs) => {
    setExResult({ pct, timeMs });
    if (pct >= 0.9) setSelRating("perfect");
    else if (pct >= 0.7) setSelRating("good");
    else if (pct >= 0.5) setSelRating("okay");
    else if (pct >= 0.2) setSelRating("hard");
    else setSelRating("blackout");
    setView(V.RATE);
  };

  const confirmRating = () => {
    if (!selRating || !cur) return;
    const r = RATINGS.find(x => x.key === selRating);
    const oldSR = { ...cur.sr };
    const newSR = sm2(cur.sr, r.q);
    const s = r.q >= 3 ? streak + 1 : 0;
    const mult = s >= 10 ? 2 : s >= 5 ? 1.5 : s >= 3 ? 1.2 : 1;
    const xp = Math.round(r.xp * mult);
    setStreak(s); setSxp(prev => prev + xp);
    setLastCalc({ old: oldSR, new: newSR, quality: r.q, xp, mult, title: cur.title, interval: newSR.interval });
    setItems(prev => prev.map(i => i.id === cur.id ? {
      ...i, sr: newSR, totalReviews: i.totalReviews + 1,
      correctReviews: r.q >= 3 ? i.correctReviews + 1 : i.correctReviews,
      totalXP: i.totalXP + xp, lastReviewedAt: new Date().toISOString(),
    } : i));
    setReviews(prev => [...prev, { station: cur.station, title: cur.title, rating: r.key, quality: r.q, xp, interval: newSR.interval }]);
    setView(V.RESULT);

    // ── Persist to Supabase ──
    completeExercise.mutate({
      station: cur.station,
      level: cur.level,
      exerciseTitle: cur.title,
      rating: selRating,
      score: exResult?.pct != null ? Math.round(exResult.pct * 100) : undefined,
    });
  };

  const nextItem = () => {
    setExResult(null); setSelRating(null);
    if (qIdx < queue.length - 1) { setQIdx(qIdx + 1); setView(V.EXERCISE); }
    else setView(V.DONE);
  };

  const goHub = () => { setView(V.HUB); setStation(null); };

  // Exercise renderer
  const renderEx = () => {
    if (!cur) return null;
    const t = cur.type;
    if (t === "loci" || t === "loci-order") return <LociExercise data={cur.data} onComplete={onExComplete} />;
    if (t.startsWith("assoc")) return <AssociationExercise data={cur.data} type={t} onComplete={onExComplete} />;
    if (t === "stroop" || t === "reverse-stroop") return <StroopExercise data={cur.data} type={t} onComplete={onExComplete} />;
    if (t === "nback") return <NBackExercise data={cur.data} onComplete={onExComplete} />;
    if (t === "number-stroop") return <NumberStroopExercise data={cur.data} onComplete={onExComplete} />;
    if (t.startsWith("chunk")) return <ChunkingExercise data={cur.data} type={t} onComplete={onExComplete} />;
    if (t.startsWith("visual")) return <VisualExercise data={cur.data} type={t} onComplete={onExComplete} />;
    return <div style={{ textAlign: "center", color: C.textDim, padding: 20 }}>Übungstyp "{t}" kommt bald!</div>;
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', -apple-system, sans-serif", background: C.base, color: C.text, minHeight: "100vh" }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.85) } to { opacity:1; transform:scale(1) } }
        @keyframes pulse { 0%,100% { transform:scale(1) } 50% { transform:scale(1.05) } }
        @keyframes glow { 0%,100% { box-shadow:0 0 8px rgba(245,158,11,0.3) } 50% { box-shadow:0 0 20px rgba(245,158,11,0.6) } }
        @keyframes slideUp { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
        button { font-family:inherit; } button:active { transform:scale(0.97)!important; }
        textarea::placeholder, input::placeholder { color:${C.textDim}; }
        textarea:focus, input:focus { outline:none; border-color:${C.action}!important; }
      `}</style>

      <div style={{ maxWidth: 500, margin: "0 auto", padding: "14px 18px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 10, color: C.textDim, textTransform: "uppercase", letterSpacing: 2 }}>Schatzkarte</div>
            <div style={{ fontSize: 19, fontWeight: 800, background: `linear-gradient(135deg, ${C.text}, ${C.action})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Das Denkarium</div>
          </div>
          <button onClick={() => setView(view === V.PASS ? V.HUB : V.PASS)} style={{
            background: view === V.PASS ? C.action : C.elevated, border: `1px solid ${view === V.PASS ? C.action : C.border}`,
            borderRadius: 9, padding: "6px 10px", cursor: "pointer", fontSize: 11, fontWeight: 600,
            color: view === V.PASS ? C.base : C.textMuted,
          }}>📋 Pass</button>
        </div>

        {/* XP bar */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
            <span style={{ color: C.textMuted }}>Level <span style={{ color: C.action, fontWeight: 700 }}>{brainLevel}</span></span>
            <span style={{ color: C.textDim }}>{totalXP} XP</span>
          </div>
          <div style={{ height: 4, borderRadius: 2, background: C.border, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 2, width: `${Math.min(100, (totalXP % 500) / 5)}%`, background: `linear-gradient(90deg, ${C.action}, #38bdf8)`, transition: "width 0.8s" }} />
          </div>
        </div>

        {/* ═══ HUB ═══ */}
        {view === V.HUB && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            {Object.values(STATIONS).map((st, si) => {
              const stItems = items.filter(i => i.station === st.id);
              const levels = [...new Set(stItems.map(i => i.level))].sort();
              const reviewed = stItems.filter(i => i.totalReviews > 0).length;
              const stXP = stItems.reduce((s, i) => s + i.totalXP, 0);
              return (
                <div key={st.id} style={{ marginBottom: 10, animation: `slideUp 0.4s ease ${si * 0.05}s both` }}>
                  <div style={{
                    background: C.elevated, border: `1.5px solid ${C.border}`, borderRadius: 14,
                    overflow: "hidden",
                  }}>
                    {/* Station header */}
                    <div style={{ padding: "14px 14px 10px", display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 42, height: 42, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 22, background: st.colorLight, border: `1px solid ${st.color}30`, flexShrink: 0,
                      }}>{st.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{st.name}</div>
                          <div style={{ fontSize: 10, background: `${st.color}18`, color: st.color, padding: "1px 6px", borderRadius: 5, fontWeight: 600 }}>
                            {stItems.length}
                          </div>
                        </div>
                        <div style={{ fontSize: 11, color: C.textMuted }}>{st.subtitle}</div>
                      </div>
                      {stXP > 0 && <div style={{ fontSize: 12, color: C.gold, fontWeight: 700 }}>{stXP} ⭐</div>}
                    </div>

                    {/* Level buttons */}
                    <div style={{ padding: "0 14px 12px", display: "flex", gap: 5, flexWrap: "wrap" }}>
                      <button onClick={() => startStation(st.id)} style={{
                        background: st.color, border: "none", borderRadius: 8, padding: "7px 12px",
                        color: C.base, fontWeight: 700, fontSize: 12, cursor: "pointer",
                      }}>▶ Alle</button>
                      {levels.map(lv => {
                        const lvItems = stItems.filter(i => i.level === lv);
                        const lvReviewed = lvItems.filter(i => i.totalReviews > 0).length;
                        return (
                          <button key={lv} onClick={() => startStation(st.id, lv)} style={{
                            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
                            padding: "6px 10px", fontSize: 11, color: C.text, cursor: "pointer",
                            display: "flex", alignItems: "center", gap: 4,
                          }}>
                            Lv.{lv}
                            <span style={{ fontSize: 9, color: lvReviewed === lvItems.length ? C.success : C.textDim }}>
                              {lvReviewed}/{lvItems.length}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ═══ EXERCISE ═══ */}
        {view === V.EXERCISE && cur && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <button onClick={goHub} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 12, padding: 0 }}>← Hub</button>
              <div style={{ flex: 1, height: 3, borderRadius: 2, background: C.border }}>
                <div style={{ height: "100%", borderRadius: 2, background: stMeta?.color, width: `${((qIdx + 1) / queue.length) * 100}%`, transition: "width 0.5s" }} />
              </div>
              <span style={{ fontSize: 10, color: C.textDim }}>{qIdx + 1}/{queue.length}</span>
              {streak >= 3 && <span style={{ fontSize: 11, color: C.warning, fontWeight: 700 }}>🔥{streak}</span>}
            </div>
            <div style={{ background: C.elevated, border: `1.5px solid ${stMeta?.color}30`, borderRadius: 16, padding: 18 }}>
              <div style={{ fontSize: 10, color: stMeta?.color, fontWeight: 600, marginBottom: 2 }}>
                {stMeta?.icon} {stMeta?.name} · Lv.{cur.level}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>{cur.title}</div>
              <div style={{ display: "inline-flex", gap: 10, background: C.surface, borderRadius: 6, padding: "3px 10px", marginBottom: 14 }}>
                <span style={{ fontSize: 9, color: C.textDim }}>EF <b style={{ color: C.purple }}>{cur.sr.easeFactor}</b></span>
                <span style={{ fontSize: 9, color: C.textDim }}>I <b style={{ color: C.action }}>{cur.sr.interval}d</b></span>
                <span style={{ fontSize: 9, color: C.textDim }}>n <b style={{ color: C.text }}>{cur.sr.repetition}</b></span>
              </div>
              {renderEx()}
            </div>
          </div>
        )}

        {/* ═══ RATING ═══ */}
        {view === V.RATE && cur && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ textAlign: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: C.textMuted }}>{stMeta?.icon} {cur.title}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginTop: 3 }}>Wie gut lief es?</div>
              {exResult && <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>{Math.round(exResult.pct * 100)}% · {(exResult.timeMs / 1000).toFixed(1)}s</div>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {RATINGS.map(r => {
                const isSel = selRating === r.key;
                const preview = sm2(cur.sr, r.q);
                return (
                  <button key={r.key} onClick={() => setSelRating(r.key)} style={{
                    background: isSel ? `${r.color}15` : C.surface,
                    border: `2px solid ${isSel ? r.color : C.border}`,
                    borderRadius: 10, padding: "9px 12px", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s",
                  }}>
                    <span style={{ fontSize: 22, width: 30, textAlign: "center" }}>{r.emoji}</span>
                    <div style={{ flex: 1, textAlign: "left", fontSize: 13, fontWeight: 600, color: isSel ? r.color : C.text }}>{r.label}</div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 10, color: C.action, fontWeight: 600 }}>→ {formatInterval(preview.interval)}</div>
                      <div style={{ fontSize: 8, color: C.textDim }}>EF {preview.easeFactor}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            <button onClick={confirmRating} disabled={!selRating} style={{
              width: "100%", marginTop: 10, background: selRating ? stMeta?.color : C.surface,
              border: "none", borderRadius: 10, padding: "12px", cursor: selRating ? "pointer" : "default",
              fontSize: 14, fontWeight: 700, color: selRating ? C.base : C.textDim,
            }}>Bestätigen ✓</button>
          </div>
        )}

        {/* ═══ RESULT ═══ */}
        {view === V.RESULT && lastCalc && (
          <div style={{ animation: "scaleIn 0.4s ease", textAlign: "center" }}>
            <div style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginBottom: 10 }}>
              <div style={{ fontSize: 38, marginBottom: 6 }}>{lastCalc.quality >= 4 ? "🎉" : lastCalc.quality >= 3 ? "👍" : "💪"}</div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 10,
                background: "rgba(245,158,11,0.12)", border: `1px solid ${C.gold}40`,
                borderRadius: 10, padding: "6px 14px",
                animation: lastCalc.xp >= 30 ? "glow 1.5s ease infinite" : "none",
              }}>
                <span style={{ fontSize: 16 }}>⭐</span>
                <span style={{ color: C.gold, fontWeight: 700, fontSize: 18 }}>+{lastCalc.xp} XP</span>
                {lastCalc.mult > 1 && <span style={{ fontSize: 9, color: C.warning }}>🔥×{lastCalc.mult}</span>}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
                Nächste WH: <span style={{ color: C.action }}>{formatInterval(lastCalc.interval)}</span>
              </div>
              <div style={{ marginTop: 8, background: C.surface, borderRadius: 8, padding: 8, display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 4, alignItems: "center" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 8, color: C.textDim }}>VORHER</div>
                  <div style={{ fontSize: 10, color: C.textMuted }}>EF {lastCalc.old.easeFactor} · I {lastCalc.old.interval}d</div>
                </div>
                <div style={{ fontSize: 14, color: C.purple }}>→</div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 8, color: C.textDim }}>NACHHER</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.success }}>EF {lastCalc.new.easeFactor} · I {lastCalc.new.interval}d</div>
                </div>
              </div>
            </div>
            <button onClick={nextItem} style={{
              width: "100%", background: stMeta?.color, border: "none", borderRadius: 10,
              padding: "12px", cursor: "pointer", fontSize: 14, fontWeight: 700, color: C.base,
            }}>{qIdx < queue.length - 1 ? "Nächste Übung →" : "Session beenden 🏁"}</button>
          </div>
        )}

        {/* ═══ SESSION DONE ═══ */}
        {view === V.DONE && (
          <div style={{ animation: "scaleIn 0.4s ease", textAlign: "center" }}>
            <div style={{ background: `linear-gradient(145deg, ${C.elevated}, ${C.surface})`, border: `2px solid ${C.gold}40`, borderRadius: 18, padding: 24, marginBottom: 12 }}>
              <div style={{ fontSize: 44, marginBottom: 6, animation: "pulse 1.5s ease infinite" }}>🏆</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>Training fertig!</div>
              <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 14 }}>{stMeta?.icon} {stMeta?.name}{filterLevel ? ` · Lv.${filterLevel}` : ""}</div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(245,158,11,0.15)", border: `1px solid ${C.gold}50`, borderRadius: 12, padding: "10px 20px", marginBottom: 16, animation: "glow 2s ease infinite" }}>
                <span style={{ fontSize: 20 }}>⭐</span>
                <span style={{ color: C.gold, fontWeight: 800, fontSize: 22 }}>+{sxp} XP</span>
              </div>
              <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 12 }}>
                {[{ label: "Übungen", value: reviews.length, c: C.text }, { label: "Perfekt", value: reviews.filter(r => r.quality >= 4).length, c: C.success }, { label: "Fehler", value: reviews.filter(r => r.quality < 3).length, c: C.danger }].map(s => (
                  <div key={s.label} style={{ background: C.base, borderRadius: 8, padding: "8px 12px", minWidth: 50 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: s.c }}>{s.value}</div>
                    <div style={{ fontSize: 9, color: C.textDim }}>{s.label}</div>
                  </div>
                ))}
              </div>
              {reviews.map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0", borderBottom: i < reviews.length - 1 ? `1px solid ${C.border}20` : "none" }}>
                  <span style={{ fontSize: 14 }}>{RATINGS.find(rt => rt.key === r.rating)?.emoji}</span>
                  <span style={{ flex: 1, fontSize: 11, color: C.textMuted, textAlign: "left" }}>{r.title}</span>
                  <span style={{ fontSize: 10, color: C.action, fontWeight: 600 }}>{r.interval}d</span>
                  <span style={{ fontSize: 10, color: C.gold, fontWeight: 600 }}>+{r.xp}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => startStation(station, filterLevel)} style={{ flex: 1, background: stMeta?.color, border: "none", borderRadius: 10, padding: "11px", cursor: "pointer", fontSize: 13, fontWeight: 700, color: C.base }}>Nochmal 💪</button>
              <button onClick={goHub} style={{ flex: 1, background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 10, padding: "11px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: C.textMuted }}>Zum Hub</button>
            </div>
          </div>
        )}

        {/* ═══ FITNESS PASS ═══ */}
        {view === V.PASS && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ background: `linear-gradient(145deg, ${C.elevated}, ${C.surface})`, border: `2px solid ${C.action}40`, borderRadius: 16, padding: 18, marginBottom: 10 }}>
              <div style={{ textAlign: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: 2 }}>Gehirn-Fitnesspass</div>
                <div style={{ fontSize: 28, margin: "6px 0" }}>🧠</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>Level {brainLevel}</div>
                <div style={{ fontSize: 11, color: C.textMuted }}>{totalXP} XP</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {Object.values(STATIONS).map(st => {
                  const si = items.filter(i => i.station === st.id);
                  const reviewed = si.filter(i => i.totalReviews > 0).length;
                  const pct = si.length > 0 ? (reviewed / si.length) * 100 : 0;
                  const stXP = si.reduce((s, i) => s + i.totalXP, 0);
                  return (
                    <div key={st.id} style={{ background: C.base, borderRadius: 10, padding: 10, border: `1px solid ${pct > 0 ? `${st.color}40` : C.border}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                        <span style={{ fontSize: 16 }}>{st.icon}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: C.text }}>{st.name}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Ring progress={pct} size={36} stroke={2.5} color={st.color} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: st.color }}>{stXP} XP</div>
                          <div style={{ fontSize: 8, color: C.textDim }}>{reviewed}/{si.length} geübt</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* SM-2 Table */}
            <div style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, marginBottom: 10, overflowX: "auto" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 8 }}>📊 SM-2 Details</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    {["Item", "EF", "I", "n", "%"].map(h => <th key={h} style={{ padding: "3px 4px", textAlign: "left", color: C.textDim, fontSize: 8, textTransform: "uppercase" }}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {items.filter(i => i.totalReviews > 0).slice(0, 20).map(it => (
                    <tr key={it.id} style={{ borderBottom: `1px solid ${C.border}10` }}>
                      <td style={{ padding: "3px 4px", color: C.text }}>{it.title.slice(0, 18)}</td>
                      <td style={{ padding: "3px 4px", fontWeight: 600, color: it.sr.easeFactor >= 2.5 ? C.success : it.sr.easeFactor >= 2 ? C.warning : C.danger }}>{it.sr.easeFactor}</td>
                      <td style={{ padding: "3px 4px", color: C.action, fontWeight: 600 }}>{it.sr.interval}d</td>
                      <td style={{ padding: "3px 4px", color: C.text }}>{it.sr.repetition}</td>
                      <td style={{ padding: "3px 4px", color: C.success }}>{it.totalReviews > 0 ? Math.round((it.correctReviews / it.totalReviews) * 100) : "—"}%</td>
                    </tr>
                  ))}
                  {items.filter(i => i.totalReviews > 0).length === 0 && (
                    <tr><td colSpan={5} style={{ padding: 10, textAlign: "center", color: C.textDim }}>Noch nichts trainiert</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <button onClick={goHub} style={{ width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 9, padding: "10px", cursor: "pointer", fontSize: 12, fontWeight: 600, color: C.textMuted }}>← Zurück</button>
          </div>
        )}

        {/* Nav */}
        <div style={{ position: "sticky", bottom: 0, background: `${C.base}ee`, backdropFilter: "blur(10px)", borderTop: `1px solid ${C.border}`, padding: "7px 14px", marginTop: 10, display: "flex", justifyContent: "space-around" }}>
          {[{ icon: "🗺️", label: "Karte" }, { icon: "🧠", label: "Denkarium", active: true }, { icon: "📚", label: "Karten" }, { icon: "👤", label: "Avatar" }].map(n => (
            <div key={n.label} style={{ textAlign: "center", cursor: "pointer", padding: "2px 5px", opacity: n.active ? 1 : 0.4 }}>
              <div style={{ fontSize: 18, marginBottom: 1 }}>{n.icon}</div>
              <div style={{ fontSize: 8, fontWeight: n.active ? 700 : 400, color: n.active ? C.action : C.textDim }}>{n.label}</div>
              {n.active && <div style={{ width: 3, height: 3, borderRadius: "50%", background: C.action, margin: "1px auto 0" }} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
