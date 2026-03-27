// ============================================
// Cleverer lernen - Content nach Altersstufen
// Thema: Die 7 Power-Techniken (evidenzbasierte Lernstrategien)
// Quellen: Siehe /docs/effektstaerken_wissenschaftlich.docx
// ============================================

import { AgeGroup } from '@/types/legacy-ui';

// Link zum Quelldokument für Fußnoten
export const EFFECT_SIZE_SOURCE_DOC = '/docs/effektstaerken_wissenschaftlich.docx';

// Effektstärken-Daten für die UI (korrigiert nach wissenschaftlichen Meta-Analysen)
export interface EffectSize {
  value: number;
  range?: string;  // z.B. "0.50–0.74"
  stars: 1 | 2 | 3;
  label: string;
  source: string;  // Quellenangabe für Fußnote
}

export const EFFECT_SIZES: Record<string, EffectSize> = {
  retrieval: { value: 0.62, range: '0.50–0.74', stars: 3, label: 'High Utility', source: 'Rowland 2014; Adesope et al. 2017' },
  spaced: { value: 0.60, stars: 3, label: 'High Utility', source: 'Dunlosky et al. 2013; Cepeda et al. 2006' },
  feynman: { value: 0.54, stars: 2, label: 'Moderat', source: 'Donoghue & Hattie 2021 (Self-Explanation)' },
  interleaving: { value: 0.52, stars: 2, label: 'Moderat', source: 'Donoghue & Hattie 2021' },
  loci: { value: 0.65, stars: 3, label: 'High Utility', source: 'Twomey & Kroneisen 2021' },
  teaching: { value: 0.53, stars: 2, label: 'Moderat', source: 'Hattie 2009' },
  marking: { value: 0.36, stars: 1, label: 'Low Utility', source: 'Dunlosky et al. 2013' },
  rereading: { value: 0.36, stars: 1, label: 'Low Utility', source: 'Dunlosky et al. 2013' }
};
// Hinweis: Pomodoro-Technik hat keine Meta-Analyse, daher keine Effektstärke

interface Study {
  authors: string;
  year: number;
  finding: string;
}

interface FunFact {
  emoji: string;
  text: string;
}

interface ContentSection {
  title: string;
  content: string;
  type?: 'info' | 'success' | 'warning' | 'expander';
  expanded?: boolean;
  effectSize?: EffectSize;
  study?: Study;
  funFact?: FunFact;
  proTip?: string;
}

interface IslandContent {
  title: string;
  video: {
    url: string;
    placeholder: boolean;
  };
  explanation: {
    intro: string;
    sections: ContentSection[];
  };
  summary?: string;
  totalTechniques: number;
}

// ============================================
// GRUNDSCHULE
// ============================================
const GRUNDSCHULE_CONTENT: IslandContent = {
  title: "Die 7 Power-Techniken - Cleverer lernen",
  totalTechniques: 7,
  video: {
    url: "",
    placeholder: true
  },
  explanation: {
    intro: `**Die Wissenschaft sagt: Die meisten Schüler machen es falsch. Aber keine Sorge – wir fixen das jetzt!**

Stell dir vor, du lernst 5 Stunden für eine Prüfung. Du liest alles dreimal durch, markierst die wichtigsten Stellen gelb, schreibst eine Zusammenfassung. Du fühlst dich super vorbereitet.

Und dann? Schreibst du eine 4.

Deine Freundin hat nur 2 Stunden gelernt. Sie schreibt eine 1.

Ist sie einfach schlauer? **Nein.** Sie lernt nur ANDERS.

Die Wissenschaft weiß seit über 100 Jahren, welche Methoden funktionieren. Die Schule hat's dir nur nie erzählt. **Bis jetzt!**`,
    sections: [
      {
        title: "Das wissen sogar die meisten Erwachsenen nicht",
        content: `*"Schreib das auf, dann merkst du's dir!"*

Diesen Satz hast du wahrscheinlich tausendmal gehört. Und er ist... falsch. Zumindest so, wie die Schule ihn meint.

**Was die meisten machen:**
- Text mehrmals durchlesen (*"Wird schon hängenbleiben..."*)
- Wichtiges gelb markieren (*Sieht produktiv aus!*)
- Zusammenfassung schreiben (*Dauert ewig...*)
- Am Abend vorher alles reinprügeln (*Cramming!*)

**PLOT TWIST:** Alle diese Methoden sind wissenschaftlich gesehen... meh.`,
        type: 'warning',
        study: {
          authors: 'Dunlosky et al.',
          year: 2013,
          finding: 'Die Techniken, die Schüler am häufigsten nutzen, sind am wenigsten effektiv.'
        }
      },
      {
        title: "Die Wissenschaft: Effektstärken erklärt",
        content: `**John Hattie** hat über 1.800 Meta-Studien mit mehr als 300 Millionen Schülern ausgewertet. Das ist wie... ALLE Studien zum Thema Lernen, die es gibt. Zusammengefasst.

**Was ist eine 'Effektstärke' (d)?**

Stell dir vor, du misst, wie viel Schüler in einem Jahr lernen. Das ist der Normalfall. Jetzt fragst du: Bringt Methode X mehr oder weniger als dieses eine Jahr?

- **d = 0.40** → Ein Jahr Lernfortschritt (der Durchschnitt)
- **d > 0.40** → Mehr als ein Jahr!
- **d < 0.40** → Weniger als ein Jahr
- **d = 0.80** → Zwei Jahre Fortschritt in einem Jahr!`,
        type: 'info'
      },
      {
        title: "Technik 1: Retrieval Practice (Selbsttest) – d = 0.50–0.74 📚",
        content: `Jedes Mal, wenn du etwas aus deinem Gedächtnis ABRUFST (statt es nur wieder zu lesen), verstärkst du die Verbindung im Gehirn.

Das ist wie ein Trampelpfad: Je öfter du ihn gehst, desto breiter wird er.
Wiederlesen ist, als würdest du den Pfad nur anschauen.
Abrufen ist, ihn tatsächlich zu gehen.

**So geht's für dich:**
- **"Buch zu, Augen zu, erzähl mir, was du gerade gelesen hast!"**
- Mach ein Spiel daraus: Wer kann sich an die meisten Sachen erinnern?
- Benutze Bildkarten und dreh sie um – was war auf der Karte?
- Eltern können fragen: *"Was hast du heute in der Schule gelernt?"*`,
        type: 'expander',
        expanded: true,
        effectSize: EFFECT_SIZES.retrieval
      },
      {
        title: "Technik 2: Spaced Repetition (Zeitversetzt wiederholen) – d = 0.60 📚",
        content: `Dein Gehirn vergisst. Schnell. Nach 24 Stunden hast du 70% vergessen!

ABER: Wenn du wiederholst, BEVOR du vergessen hast, wird die Kurve flacher.
Mit jeder Wiederholung hält das Wissen länger.

**Die goldene Regel:** 1 Tag → 3 Tage → 1 Woche → 2 Wochen → 1 Monat

**So geht's für dich:**
- *"Weißt du noch, was wir gestern gelernt haben? Und vorgestern?"*
- Baut kleine Quiz-Momente in den Alltag ein. Beim Abendessen: *"Was war nochmal...?"*
- Macht einen Wochen-Rückblick am Sonntag: *"Was haben wir diese Woche alles gelernt?"*
- **Sticker-Kalender:** Jedes Mal, wenn wiederholt wird, gibt's einen Sticker!`,
        type: 'expander',
        effectSize: EFFECT_SIZES.spaced,
        study: {
          authors: 'Ebbinghaus',
          year: 1885,
          finding: 'Die Vergessenskurve zeigt: Strategisches Wiederholen flacht den Vergessens-Prozess ab.'
        }
      },
      {
        title: "Technik 3: Feynman-Methode (Erklär's einem 6-Jährigen) – d = 0.54 📚",
        content: `Richard Feynman war Nobelpreisträger für Physik und legendär dafür, komplizierte Sachen einfach zu erklären.

Seine Methode: **Wenn du etwas nicht einfach erklären kannst, hast du es nicht verstanden.**

> *"Was ich nicht erschaffen kann, verstehe ich nicht."* – Richard Feynman

**So geht's für dich:**
- **"Erklär's deinem Teddy!"** Oder: Spiel Lehrer! Stell deine Kuscheltiere in eine Reihe und erkläre ihnen, was du gelernt hast.
- Wenn du stecken bleibst, weißt du, was du nochmal nachschauen musst.
- **Bonus:** Geschwister unterrichten! (Die fragen nämlich wirklich nach, wenn sie's nicht verstehen.)`,
        type: 'expander',
        effectSize: EFFECT_SIZES.feynman
      },
      {
        title: "Technik 4: Interleaving (Mischen statt Blocken) – d = 0.52 📚",
        content: `Die meisten lernen "geblockt": Erst 20 Mathe-Aufgaben zum Thema A, dann 20 zum Thema B.
Fühlt sich effektiv an. **IST ES ABER NICHT.**

Interleaving heißt: Aufgaben mischen! A, B, C, A, B, C...

Warum? Weil du bei jeder Aufgabe erst erkennen musst, WELCHES Problem das überhaupt ist.
Das trainiert dein Gehirn, Unterschiede zu erkennen.

**So geht's für dich:**
- Beim Üben abwechseln: Mal eine Aufgabe Plus, dann Minus, dann Plus, dann Minus.
- Bei Vokabeln: Nicht alle Tiere, dann alle Farben – sondern bunt gemischt!
- Spiele wie **Memory** trainieren das automatisch.`,
        type: 'expander',
        effectSize: EFFECT_SIZES.interleaving,
        funFact: {
          emoji: '🔬',
          text: 'Physik-Studenten, die mit Interleaving lernten, schnitten 125% besser ab – obwohl sie sich schlechter fühlten!'
        }
      },
      {
        title: "Technik 5: Loci-Methode (Gedächtnispalast) – d = 0.65 📚",
        content: `Diese Methode nutzen Gedächtnis-Weltmeister!

Funktioniert so: Du "gehst" im Kopf durch einen bekannten Ort (dein Zimmer, Schulweg) und "platzierst" an jedem Punkt einen Begriff, den du dir merken willst.

Warum funktioniert das? Das Gehirn ist super darin, sich Orte zu merken – viel besser als abstrakte Listen.

**So geht's für dich:**
- *"Stell dir vor, ein Apfel liegt auf deinem Bett!"*
- **Kinderzimmer-Rundgang:** Tür = erste Vokabel, Bett = zweite, Schrank = dritte...
- Je verrückter die Bilder, desto besser! Der Apfel tanzt auf dem Bett? SUPER, das merkst du dir!`,
        type: 'expander',
        effectSize: EFFECT_SIZES.loci
      },
      {
        title: "Technik 6: Pomodoro-Technik (25 + 5)",
        content: `Das Gehirn kann sich nicht ewig konzentrieren. Nach etwa 25 Minuten lässt die Aufmerksamkeit nach.

Die Pomodoro-Technik nutzt das: 25 Min fokussiert arbeiten, dann 5 Min echte Pause (nicht Handy!). Nach 4 Runden: 15-30 Min längere Pause.

**So geht's für dich (kürzere Intervalle):**
- 10-15 Min lernen, dann 5 Min Bewegungspause (Hampelmann, Tanzen, Rennen).
- Eine Sanduhr oder Timer macht's spannend.
- *"Schaffst du es, bis die Zeit abläuft konzentriert zu bleiben?"*`,
        type: 'expander'
      },
      {
        title: "Technik 7: Lernen durch Lehren – d = 0.53 📚",
        content: `*"Wer lehrt, lernt doppelt."*

Das ist nicht nur ein Spruch. Wenn du jemandem etwas erklärst, musst du:
1. Es selbst verstehen
2. Es in klare Worte fassen
3. Auf Fragen reagieren

Das ist Elaboration, Retrieval Practice und Metakognition in einem!

**So geht's für dich:**
- **Geschwister-Schule!** Der Große erklärt dem Kleinen.
- Oder: Eltern spielen dumm. *"Mama/Papa versteht das nicht, kannst du es mir erklären?"*
- Das Kind muss erklären, und dabei lernt es selbst am meisten.`,
        type: 'expander',
        effectSize: EFFECT_SIZES.teaching
      },
      {
        title: "Clever lernen: Warum aktiv besser ist als passiv",
        content: `*"Ich hab so viel gelernt und fühle mich trotzdem unsicher..."*

Das ist NORMAL. Und es ist sogar ein GUTES Zeichen!

**Das Fluency-Problem:**
Wenn du einen Text dreimal durchliest, fühlt er sich "vertraut" an.
Dein Gehirn sagt: *"Hey, das kenn ich doch! Muss ich also wissen!"*
Aber: Etwas wiederzuerkennen ist nicht dasselbe wie es zu WISSEN.

**Die Take-Away Message:**
- Passiv konsumieren (nur lesen, nur zuhören) = langweiliger UND weniger effektiv
- Aktiv mitmachen (Quiz, erklären, mischen) = spannender UND effektiver
- Das ist logisch, kein Paradox!

**Die Wissenschaft zeigt: Clever lernen funktioniert!**`,
        type: 'info',
        study: {
          authors: 'Bjork',
          year: 1994,
          finding: 'Aktive Lernmethoden sind effektiver als passive – Quiz, Erklären und Mischen bringen mehr als nur Lesen!'
        }
      }
    ]
  },
  summary: "Die 7 Power-Techniken sind wissenschaftlich bewiesen. Aktive Methoden wie Quiz, Erklären und Mischen sind spannender UND effektiver als passives Lesen!"
};

// ============================================
// UNTERSTUFE
// ============================================
const UNTERSTUFE_CONTENT: IslandContent = {
  title: "Die 7 Power-Techniken - Cleverer lernen",
  totalTechniques: 7,
  video: {
    url: "",
    placeholder: true
  },
  explanation: {
    intro: `**PLOT TWIST: Mehr lernen ≠ Besser lernen**

Stell dir vor, du lernst 5 Stunden für eine Prüfung. Du liest alles dreimal durch, markierst die wichtigsten Stellen gelb, schreibst eine Zusammenfassung. Du fühlst dich super vorbereitet.

Und dann? Schreibst du eine 4.

Deine Freundin hat nur 2 Stunden gelernt. Sie schreibt eine 1.

Ist sie einfach schlauer? **Nein.** Sie lernt nur ANDERS.

**John Hattie** hat über 1.800 Meta-Studien mit mehr als 300 Millionen Schülern ausgewertet. Das sind ALLE Studien zum Thema Lernen, die es gibt. Zusammengefasst.

Siehst du das Muster? Die Methoden, bei denen du passiv konsumierst, funktionieren oft SCHLECHT. Aber die aktiven Methoden – Quiz spielen, erklären, mischen – sind spannender UND bringen mehr! Dein Gehirn liebt Abwechslung und echte Herausforderungen.

Hier sind die 7 Techniken, die WIRKLICH funktionieren!`,
    sections: [
      {
        title: "Was ist eine 'Effektstärke' (d)?",
        content: `Stell dir vor, du misst, wie viel Schüler in einem Jahr lernen. Das ist der Normalfall.
Jetzt fragst du: Bringt Methode X mehr oder weniger als dieses eine Jahr?

- **d = 0.40** → Ein Jahr Lernfortschritt (der Durchschnitt)
- **d > 0.40** → Mehr als ein Jahr! 🎉
- **d < 0.40** → Weniger als ein Jahr 😕
- **d = 0.80** → Zwei Jahre Fortschritt in einem Jahr! 🚀`,
        type: 'success',
        study: {
          authors: 'Dunlosky et al.',
          year: 2013,
          finding: 'Diese Meta-Analyse an der Kent State University bewertete 10 beliebte Lerntechniken systematisch.'
        }
      },
      {
        title: "Technik 1: Retrieval Practice (d = 0.50–0.74) 📚",
        content: `Jedes Mal, wenn du etwas aus deinem Gedächtnis ABRUFST (statt es nur wieder zu lesen), verstärkst du die Verbindung im Gehirn.

Das ist wie ein Trampelpfad: Je öfter du ihn gehst, desto breiter wird er.

**So geht's für dich:**
- **Karteikarten sind dein bester Freund!** Schreib auf die Vorderseite die Frage, auf die Rückseite die Antwort.
- **WICHTIG:** Erst versuchen zu antworten, DANN umdrehen.
- **Apps wie Anki oder Quizlet** machen das automatisch.`,
        type: 'expander',
        expanded: true,
        effectSize: EFFECT_SIZES.retrieval,
        proTip: 'Kannst du die ganze Karteikarten-Box durchgehen, ohne zu spicken? Das ist die ultimative Challenge!'
      },
      {
        title: "Technik 2: Spaced Repetition (d = 0.60) 📚",
        content: `Dein Gehirn vergisst. Schnell. Nach 24 Stunden hast du 70% vergessen!

ABER: Wenn du wiederholst, BEVOR du vergessen hast, wird die Kurve flacher.

**Die goldene Regel:** 1 Tag → 3 Tage → 1 Woche → 2 Wochen → 1 Monat

**So geht's für dich:**
- **Lernplan erstellen!** Nicht: "Ich lerne am Wochenende vor der Arbeit."
- Sondern: "Ich lerne heute 30 Min, übermorgen 15 Min, in einer Woche nochmal 10 Min."
- **Apps helfen:** Anki sagt dir automatisch, wann du was wiederholen sollst. Das nennt sich Spaced Repetition Software (SRS).`,
        type: 'expander',
        effectSize: EFFECT_SIZES.spaced,
        study: {
          authors: 'Ebbinghaus',
          year: 1885,
          finding: 'Die Vergessenskurve – ja, das wissen wir seit über 100 Jahren!'
        }
      },
      {
        title: "Technik 3: Feynman-Methode (d = 0.54*) 📚",
        content: `Richard Feynman war Nobelpreisträger für Physik.
Seine Methode: **Wenn du etwas nicht einfach erklären kannst, hast du es nicht verstanden.**

> *"Was ich nicht erschaffen kann, verstehe ich nicht."* – Richard Feynman

**So geht's für dich:**
- Stell dir vor, ein Grundschüler fragt dich: *"Was sind Brüche?"* oder *"Was ist Fotosynthese?"*
- **Kannst du es SO erklären, dass er es versteht? Ohne Fachbegriffe?**
- Schreib deine Erklärung auf. Dann lies sie laut vor.
- Klingt es wie ein Mensch redet? Wenn nicht, vereinfache!`,
        type: 'expander',
        effectSize: EFFECT_SIZES.feynman
      },
      {
        title: "Technik 4: Interleaving (d = 0.52) 📚",
        content: `Die meisten lernen "geblockt": Erst 20 Mathe-Aufgaben zum Thema A, dann 20 zum Thema B.
Fühlt sich effektiv an. **IST ES ABER NICHT.**

Interleaving heißt: Aufgaben mischen! A, B, C, A, B, C...

Warum? Weil du bei jeder Aufgabe erst erkennen musst, WELCHES Problem das überhaupt ist.

**So geht's für dich:**
- **Erstelle gemischte Übungsblätter!** Statt 10 Bruchaufgaben, dann 10 Dezimalaufgaben → Mische sie!
- **Bei Sprachen:** Nicht erst alle Verben im Präsens, dann alle im Perfekt. Sondern: Ein Satz Präsens, ein Satz Perfekt, einer Präsens...`,
        type: 'expander',
        effectSize: EFFECT_SIZES.interleaving,
        funFact: {
          emoji: '🔬',
          text: 'Physik-Studenten, die mit Interleaving lernten, schnitten 125% besser ab – obwohl sie sich schlechter fühlten!'
        }
      },
      {
        title: "Technik 5: Loci-Methode (g = 0.65) 📚",
        content: `Diese Methode nutzen Gedächtnis-Weltmeister!

Funktioniert so: Du "gehst" im Kopf durch einen bekannten Ort (dein Zimmer, Schulweg) und "platzierst" an jedem Punkt einen Begriff, den du dir merken willst.

Warum funktioniert das? Das Gehirn ist super darin, sich Orte zu merken – viel besser als abstrakte Listen.

**So geht's für dich:**
- **Schulweg nutzen!** Von zuhause bis zum Klassenraum – jede Station = ein Merkpunkt.
- **Historische Ereignisse?** Häng sie an deinen Schulweg. Die Französische Revolution passiert am Bäcker, Napoleon steht an der Ampel...`,
        type: 'expander',
        effectSize: EFFECT_SIZES.loci
      },
      {
        title: "Technik 6: Pomodoro-Technik",
        content: `Das Gehirn kann sich nicht ewig konzentrieren. Nach etwa 25 Minuten lässt die Aufmerksamkeit nach.

**Klassisches Pomodoro:** 25 + 5.
- **Handy in einen anderen Raum!**
- Die Pause ist ECHTE Pause: Aufstehen, Wasser holen, Fenster öffnen, Dehnübungen.
- **NICHT:** Social Media "kurz checken".`,
        type: 'expander'
      },
      {
        title: "Technik 7: Lernen durch Lehren (d = 0.53) 📚",
        content: `*"Wer lehrt, lernt doppelt."*

Wenn du jemandem etwas erklärst, musst du:
1. Es selbst verstehen
2. Es in klare Worte fassen
3. Auf Fragen reagieren

Das ist Elaboration, Retrieval Practice und Metakognition in einem!

**So geht's:**
- **Lerngruppen!** Aber nicht gemeinsam schweigend lernen.
- Sondern: Jeder wird Experte für ein Thema und erklärt es den anderen.
- **Der Erklärer lernt mehr als der Zuhörer!**`,
        type: 'expander',
        effectSize: EFFECT_SIZES.teaching,
        proTip: 'Sich gegenseitig Quizfragen stellen ist wie Retrieval Practice × 2!'
      },
      {
        title: "Clever lernen: Warum aktiv besser ist als passiv",
        content: `**Das Fluency-Problem:**

Wenn du einen Text dreimal durchliest, fühlt er sich "vertraut" an.
Das nennt man "Fluency". Dein Gehirn sagt: *"Hey, das kenn ich doch!"*
Aber: Etwas wiederzuerkennen ist nicht dasselbe wie es zu WISSEN.

**Clevere Lernhacks – warum aktiv besser ist:**
Aktiv mitmachen (Quiz spielen, erklären, mischen) ist spannender UND effektiver als passiv konsumieren. Wenn du selbst etwas tust, bleibt es besser hängen!

**Die Take-Away Message:**
- Passiv konsumieren (nur lesen) = langweiliger UND weniger effektiv
- Aktiv mitmachen (Quiz, erklären, mischen) = spannender UND effektiver!`,
        type: 'info',
        study: {
          authors: 'Rohrer & Taylor',
          year: 2007,
          finding: 'Gruppe A (Wiederlesen) fühlte sich 62% vorbereitet. Gruppe B (Retrieval) nur 53%. Aber: Gruppe B schnitt 54% BESSER ab!'
        }
      }
    ]
  },
  summary: "Die 7 Power-Techniken haben Effektstärken von d=0.52 bis d=0.65. Das ist mehr als doppelt so effektiv wie Markieren oder Wiederlesen!"
};

// ============================================
// MITTELSTUFE
// ============================================
const MITTELSTUFE_CONTENT: IslandContent = {
  title: "Die 7 Power-Techniken - Evidenzbasiertes Lernen",
  totalTechniques: 7,
  video: {
    url: "",
    placeholder: true
  },
  explanation: {
    intro: `**Die Wissenschaft sagt: Du machst es falsch.**

John Hattie hat über 1.800 Meta-Studien mit mehr als 300 Millionen Schülern ausgewertet.
Das ist wie... ALLE Studien zum Thema Lernen, die es gibt. Zusammengefasst.

**Die ernüchternde Wahrheit:**
Die Techniken, die Schüler am häufigsten nutzen (Markieren, Wiederlesen, Zusammenfassen), sind am wenigsten effektiv.

**Die gute Nachricht:**
Es gibt 7 Techniken mit hohen Effektstärken (d > 0.50), die du sofort anwenden kannst.

Siehst du das Muster? Die Methoden, bei denen du passiv konsumierst, funktionieren oft SCHLECHT. Aber die aktiven Methoden – Quiz spielen, erklären, mischen – sind spannender UND bringen mehr! Dein Gehirn liebt Abwechslung und echte Herausforderungen.

**Was ist eine Effektstärke?**
- d = 0.40 → Ein Jahr Lernfortschritt (Durchschnitt)
- d = 0.80 → Zwei Jahre Fortschritt in einem Jahr!
- d < 0.40 → Weniger als der Durchschnitt`,
    sections: [
      {
        title: "Die Effektstärken im Vergleich",
        content: `**High Utility Strategien:**
| Technik | Effektstärke | Quelle |
|---------|--------------|--------|
| Loci-Methode | d = 0.65 | Twomey & Kroneisen 2021 |
| Retrieval Practice | d = 0.50–0.74 | Rowland 2014; Adesope et al. 2017 |
| Spaced Repetition | d = 0.60 | Dunlosky et al. 2013 |
| Feynman-Methode | d = 0.54 | Donoghue & Hattie 2021 |
| Interleaving | d = 0.52 | Donoghue & Hattie 2021 |
| Lernen durch Lehren | d = 0.53 | Hattie 2009 |

**Low Utility Strategien (was die meisten machen):**
| Technik | Effektstärke | Quelle |
|---------|--------------|--------|
| Markieren | d = 0.36 | Dunlosky et al. 2013 |
| Wiederlesen | d = 0.36 | Dunlosky et al. 2013 |

**Das Spannende:** Die aktiven Methoden (Quiz, Erklären, Mischen) sind nicht nur effektiver, sondern auch interessanter!`,
        type: 'success',
        study: {
          authors: 'Dunlosky et al.',
          year: 2013,
          finding: 'Systematische Meta-Analyse der Kent State University zu 10 beliebten Lerntechniken.'
        }
      },
      {
        title: "Technik 1: Retrieval Practice (d = 0.50–0.74) 📚",
        content: `**Das Prinzip:**
Jedes Mal, wenn du etwas aus deinem Gedächtnis ABRUFST, verstärkst du die neuronale Verbindung.
Das ist der **Testing Effect** – einer der robustesten Befunde der Lernpsychologie.

**Warum es funktioniert (kognitiv):**
- Aktiver Abruf > passives Wiedererkennen
- Stärkt die Verbindung zwischen Cue und Target
- Identifiziert Wissenslücken präzise

**Praktische Umsetzung:**
- **Karteikarten** (physisch oder digital: Anki, Quizlet)
- **Blurting:** Buch zu, alles aufschreiben was du weißt, vergleichen
- **Selbstquiz:** Vor dem Lernen Fragen formulieren, nach dem Lernen beantworten
- **Cornell Notes:** Rand für Fragen, beim Wiederholen nur Fragen ansehen`,
        type: 'expander',
        expanded: true,
        effectSize: EFFECT_SIZES.retrieval,
        proTip: 'Bevor du ein neues Thema anfängst, teste dich kurz zum alten Thema. Das nennt man "interleaved retrieval".'
      },
      {
        title: "Technik 2: Spaced Repetition (d = 0.60) 📚",
        content: `**Das Prinzip:**
Die Vergessenskurve zeigt: Nach 24h sind 70% weg.
Aber: Strategisch getimte Wiederholungen flachen die Kurve ab.

**Die goldene Regel:**
1 Tag → 3 Tage → 1 Woche → 2 Wochen → 1 Monat → 3 Monate

**Warum es funktioniert:**
- Wiederholung kurz vor dem Vergessen = maximaler Lerneffekt
- Aktives Abrufen stärkt die Speicherung besser als passives Wiederholen

**Praktische Umsetzung:**
- **Anki** (SRS-Software, gratis) – berechnet optimale Wiederholungsintervalle
- **Leitner-System** mit physischen Karteikarten (5 Fächer)
- **Nicht:** Alles am Abend vorher "reinprügeln" (Cramming = schnelles Vergessen)`,
        type: 'expander',
        effectSize: EFFECT_SIZES.spaced,
        proTip: 'Baue "Mini-Reviews" in deinen Alltag: Jeden Tag 10 Minuten alten Stoff durchgehen. Nutze Wartezeiten: Bus, Pause, vor dem Einschlafen.',
        study: {
          authors: 'Ebbinghaus',
          year: 1885,
          finding: 'Die Vergessenskurve – ein Klassiker der Gedächtnisforschung.'
        }
      },
      {
        title: "Technik 3: Feynman-Methode (d = 0.54*) 📚",
        content: `**Das Prinzip:**
"Wenn du etwas nicht einfach erklären kannst, hast du es nicht verstanden." – Richard Feynman

**Die 4 Schritte:**
1. Wähle ein Konzept
2. Erkläre es, als wäre der Zuhörer 10 Jahre alt (keine Fachbegriffe!)
3. Identifiziere Lücken (wo stockst du?)
4. Vereinfache und nutze Analogien

**Warum es funktioniert:**
- Zwingt zur Elaboration (tiefe Verarbeitung)
- Deckt "Illusion of Competence" auf
- Kombiniert Retrieval + Elaboration + Metakognition

**Praktische Umsetzung:**
- Lernpartner erklären lassen, dann tauschen
- Erklär-Videos für dich selbst aufnehmen
- Eltern/Geschwister als "dumme" Zuhörer nutzen`,
        type: 'expander',
        effectSize: EFFECT_SIZES.feynman,
        proTip: 'Nimm dich beim Erklären auf! Höre dir die Aufnahme an. Wo klingst du unsicher? Da musst du nochmal nachlesen.'
      },
      {
        title: "Technik 4: Interleaving (d = 0.52) 📚",
        content: `**Das Prinzip:**
Statt geblocktem Üben (AAABBBCCC) → Mischen (ABCABCABC)

**Warum es funktioniert:**
- Zwingt zur Diskrimination (Unterschiede erkennen)
- Trainiert die Auswahl der richtigen Strategie
- Entspricht realen Prüfungssituationen

**Praktische Umsetzung:**
- **Mathe:** Plus/Minus/Mal gemischt statt nacheinander
- **Sprachen:** Zeiten gemischt statt kapitelweise
- **Geschichte:** Epochen gemischt abfragen
- **Hausaufgaben:** Wechsle alle 15 Min zwischen Fächern!`,
        type: 'expander',
        effectSize: EFFECT_SIZES.interleaving,
        study: {
          authors: 'Rohrer & Taylor',
          year: 2007,
          finding: 'Gruppe A: Geblockt (fühlte sich 62% vorbereitet). Gruppe B: Interleaved (fühlte sich 53% vorbereitet). Ergebnis: Gruppe B schnitt 125% besser ab!'
        },
        funFact: {
          emoji: '🧠',
          text: 'Ja, das fühlt sich weniger "effizient" an. Aber dein Gehirn lernt so, zwischen verschiedenen Denkmodi zu wechseln.'
        }
      },
      {
        title: "Technik 5: Loci-Methode (g = 0.65) 📚",
        content: `**Das Prinzip:**
Nutze die natürliche Stärke des Gehirns für räumliche Erinnerung.
"Platziere" zu merkende Items an bekannten Orten in deiner Vorstellung.

**Warum es funktioniert:**
- Das Hippocampus-System ist evolutionär auf räumliche Navigation optimiert
- Visuelle + räumliche Enkodierung = doppelte Verstärkung
- Gedächtnis-Weltmeister nutzen ausschließlich diese Technik

**Praktische Umsetzung:**
1. Wähle einen bekannten Ort (Wohnung, Schulweg, Zimmer)
2. Definiere 10-20 markante Punkte in fester Reihenfolge
3. "Platziere" zu merkende Begriffe an diesen Punkten (je bizarrer, desto besser!)
4. Gehe den Weg mental ab zum Abrufen`,
        type: 'expander',
        effectSize: EFFECT_SIZES.loci,
        proTip: 'Bau mehrere "Paläste"! Einen fürs Fach A, einen fürs Fach B. Kombiniere mit Interleaving – geh mal rückwärts durch deinen Palast!'
      },
      {
        title: "Technik 6: Pomodoro-Technik",
        content: `**Das Prinzip:**
- 25 Min fokussierte Arbeit → 5 Min Pause → Repeat
- Nach 4 Zyklen: 15-30 Min längere Pause
- **Wissenschaft:** Aufmerksamkeit lässt nach ~25 Min nach
- **Wichtig:** Echte Pause = keine Screens!

**Variationen:**
- Schwieriges = kürzere Pomodoros (20 Min)
- Leichteres = längere (30 Min)`,
        type: 'expander',
        proTip: 'Führe ein Pomodoro-Protokoll: Wie viele schaffst du pro Lernsession? Versuche, dich selbst zu übertrumpfen.'
      },
      {
        title: "Technik 7: Lernen durch Lehren (d = 0.53) 📚",
        content: `**Das Prinzip:**
Der "Protégé-Effekt" zeigt: Wer lehrt, lernt am meisten.

**Warum:**
- Erfordert tiefe Elaboration
- Kombiniert Retrieval + Metakognition
- Zwingt zur Strukturierung

**Praktische Umsetzung:**
- **Lerngruppen mit Expertenprinzip:** Jeder wird Experte für ein Thema
- **Erklär-Videos erstellen** (auch ohne Veröffentlichung)
- **Nachhilfe geben** – der beste Weg, etwas zu meistern`,
        type: 'expander',
        effectSize: EFFECT_SIZES.teaching,
        proTip: '"Erklärvideo"-Methode: Stell dir vor, du machst ein YouTube-Video. Wie würdest du das Thema erklären? Schreib ein Skript. Sprich es laut.'
      },
      {
        title: "Das Fluency-Problem & Clevere Lernhacks",
        content: `**Das Fluency-Problem:**
Wenn sich etwas "vertraut" anfühlt, glauben wir, es zu wissen.
Aber: Wiedererkennen ≠ Wissen!

**Illusion of Competence:**
- Mehrfaches Lesen → "Ich kenn das ja!"
- Aber: Kannst du es aus dem Gedächtnis abrufen? Wahrscheinlich nicht.

**Clevere Lernhacks – aktiv statt passiv:**
Diese aktiven Methoden sind spannender UND effektiver:
- Interleaving (Abwechslung macht's interessanter)
- Spacing (cleveres Timing statt Bulimie-Lernen)
- Retrieval (Quiz spielen statt nur lesen)

**Die gute Nachricht:**
Aktiv mitmachen ist nicht nur besser – es macht auch mehr Spaß!

**Metakognitive Strategie:**
Nach dem Lernen fragen: "Kann ich das aus dem Kopf?"
Wenn nein → noch nicht gelernt, nur gelesen.`,
        type: 'warning',
        study: {
          authors: 'Bjork',
          year: 1994,
          finding: 'Aktive Lernstrategien (Quiz, Erklären, Mischen) sind effektiver UND machen das Lernen interessanter.'
        }
      }
    ]
  },
  summary: "Die 7 Power-Techniken sind evidenzbasiert mit Effektstärken von d=0.52 bis d=0.65. Aktive Methoden wie Quiz, Erklären und Mischen sind spannender UND effektiver!"
};

// ============================================
// EXPORT
// ============================================
export const WERKZEUGE_CONTENT: Record<AgeGroup, IslandContent> = {
  grundschule: GRUNDSCHULE_CONTENT,
  unterstufe: UNTERSTUFE_CONTENT,
  mittelstufe: MITTELSTUFE_CONTENT,
  oberstufe: MITTELSTUFE_CONTENT, // Fallback
  paedagoge: MITTELSTUFE_CONTENT,  // Fallback
  coach: MITTELSTUFE_CONTENT      // Fallback
};

export type { IslandContent, ContentSection };
