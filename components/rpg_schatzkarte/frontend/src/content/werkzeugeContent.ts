// ============================================
// Insel der 7 Werkzeuge - Content nach Altersstufen
// Thema: Die 7 Power-Techniken (evidenzbasierte Lernstrategien)
// Quelle: utils/ressourcen/learnstrat_content.py
// ============================================

import { AgeGroup } from '../types';

interface ContentSection {
  title: string;
  content: string;
  type?: 'info' | 'success' | 'warning' | 'expander';
  expanded?: boolean;
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
}

// ============================================
// GRUNDSCHULE
// ============================================
const GRUNDSCHULE_CONTENT: IslandContent = {
  title: "Die 7 Power-Techniken - Cleverer lernen",
  video: {
    url: "",
    placeholder: true
  },
  explanation: {
    intro: `**Die Wissenschaft sagt: Du machst es falsch. Aber keine Sorge – wir fixen das jetzt!**

Stell dir vor, du lernst 5 Stunden für eine Prüfung. Du liest alles dreimal durch, markierst die wichtigsten Stellen gelb, schreibst eine Zusammenfassung. Du fühlst dich super vorbereitet.

Und dann? Schreibst du eine 4.

Deine Freundin hat nur 2 Stunden gelernt. Sie schreibt eine 1.

Ist sie einfach schlauer? **Nein.** Sie lernt nur ANDERS.

Die Wissenschaft weiß seit über 100 Jahren, welche Methoden funktionieren. Die Schule hat's dir nur nie erzählt. **Bis jetzt!**`,
    sections: [
      {
        title: "Was die meisten Schüler falsch machen",
        content: `*"Schreib das auf, dann merkst du's dir!"*

Diesen Satz hast du wahrscheinlich tausendmal gehört. Und er ist... falsch.

**Was die meisten machen:**
- Text mehrmals durchlesen (*"Wird schon hängenbleiben..."*)
- Wichtiges gelb markieren (*Sieht produktiv aus!*)
- Zusammenfassung schreiben (*Dauert ewig...*)
- Am Abend vorher alles reinprügeln (*Cramming!*)

**PLOT TWIST:** Alle diese Methoden sind wissenschaftlich gesehen... meh.

Forscher von der Kent State University haben 10 beliebte Lerntechniken untersucht. Ergebnis: **Die Techniken, die Schüler am häufigsten nutzen, sind am wenigsten effektiv.** Autsch.`,
        type: 'warning'
      },
      {
        title: "Technik 1: Retrieval Practice (Selbsttest)",
        content: `**Effektstärke: d = 0.58** ⭐⭐⭐

Jedes Mal, wenn du etwas aus deinem Gedächtnis ABRUFST (statt es nur wieder zu lesen), verstärkst du die Verbindung im Gehirn.

Das ist wie ein Trampelpfad: Je öfter du ihn gehst, desto breiter wird er.
Wiederlesen ist, als würdest du den Pfad nur anschauen.
Abrufen ist, ihn tatsächlich zu gehen.

**So geht's für dich:**
- **"Buch zu, Augen zu, erzähl mir, was du gerade gelesen hast!"**
- Mach ein Spiel daraus: Wer kann sich an die meisten Sachen erinnern?
- Benutze Bildkarten und dreh sie um – was war auf der Karte?
- Eltern können fragen: *"Was hast du heute in der Schule gelernt?"*`,
        type: 'expander',
        expanded: true
      },
      {
        title: "Technik 2: Spaced Repetition (Zeitversetzt wiederholen)",
        content: `**Effektstärke: d = 0.60** ⭐⭐⭐

Dein Gehirn vergisst. Schnell. Nach 24 Stunden hast du 70% vergessen!

ABER: Wenn du wiederholst, BEVOR du vergessen hast, wird die Kurve flacher.
Mit jeder Wiederholung hält das Wissen länger.

**Die goldene Regel:** 1 Tag → 3 Tage → 1 Woche → 2 Wochen → 1 Monat

**So geht's für dich:**
- *"Weißt du noch, was wir gestern gelernt haben? Und vorgestern?"*
- Baut kleine Quiz-Momente in den Alltag ein. Beim Abendessen: *"Was war nochmal...?"*
- Macht einen Wochen-Rückblick am Sonntag: *"Was haben wir diese Woche alles gelernt?"*
- **Sticker-Kalender:** Jedes Mal, wenn wiederholt wird, gibt's einen Sticker!`,
        type: 'expander'
      },
      {
        title: "Technik 3: Feynman-Methode (Erklär's einem 10-Jährigen)",
        content: `**Effektstärke: d = 0.75** ⭐⭐⭐ Sehr hoch!

Richard Feynman war Nobelpreisträger für Physik und legendär dafür, komplizierte Sachen einfach zu erklären.

Seine Methode: **Wenn du etwas nicht einfach erklären kannst, hast du es nicht verstanden.**

> *"Was ich nicht erschaffen kann, verstehe ich nicht."* – Richard Feynman

**So geht's für dich:**
- **"Erklär's deinem Teddy!"** Oder: Spiel Lehrer! Stell deine Kuscheltiere in eine Reihe und erkläre ihnen, was du gelernt hast.
- Wenn du stecken bleibst, weißt du, was du nochmal nachschauen musst.
- **Bonus:** Geschwister unterrichten! (Die fragen nämlich wirklich nach, wenn sie's nicht verstehen.)`,
        type: 'expander'
      },
      {
        title: "Technik 4: Interleaving (Mischen statt Blocken)",
        content: `**Effektstärke: d = 0.67** ⭐⭐⭐

Die meisten lernen "geblockt": Erst 20 Mathe-Aufgaben zum Thema A, dann 20 zum Thema B.
Fühlt sich effektiv an. **IST ES ABER NICHT.**

Interleaving heißt: Aufgaben mischen! A, B, C, A, B, C...

Warum? Weil du bei jeder Aufgabe erst erkennen musst, WELCHES Problem das überhaupt ist.
Das trainiert dein Gehirn, Unterschiede zu erkennen.

**Fun Fact:** Physik-Studenten, die mit Interleaving lernten, schnitten 125% besser ab – obwohl sie sich schlechter fühlten!

**So geht's für dich:**
- Beim Üben abwechseln: Mal eine Aufgabe Plus, dann Minus, dann Plus, dann Minus.
- Bei Vokabeln: Nicht alle Tiere, dann alle Farben – sondern bunt gemischt!
- Spiele wie **Memory** trainieren das automatisch.`,
        type: 'expander'
      },
      {
        title: "Technik 5: Loci-Methode (Gedächtnispalast)",
        content: `**Effektstärke: d = 0.65** ⭐⭐⭐

Diese Methode nutzen Gedächtnis-Weltmeister!

Funktioniert so: Du "gehst" im Kopf durch einen bekannten Ort (dein Zimmer, Schulweg) und "platzierst" an jedem Punkt einen Begriff, den du dir merken willst.

Warum funktioniert das? Das Gehirn ist super darin, sich Orte zu merken – viel besser als abstrakte Listen.

**So geht's für dich:**
- *"Stell dir vor, ein Apfel liegt auf deinem Bett!"*
- **Kinderzimmer-Rundgang:** Tür = erste Vokabel, Bett = zweite, Schrank = dritte...
- Je verrückter die Bilder, desto besser! Der Apfel tanzt auf dem Bett? SUPER, das merkst du dir!`,
        type: 'expander'
      },
      {
        title: "Technik 6 & 7: Pomodoro + Lernen durch Lehren",
        content: `**Pomodoro-Technik (d = 0.53):** 🍅

Das Gehirn kann sich nicht ewig konzentrieren. Nach etwa 25 Minuten lässt die Aufmerksamkeit nach.

**Für dich:** 10-15 Min lernen, dann 5 Min Bewegungspause (Hampelmann, Tanzen, Rennen).
Eine Sanduhr oder Timer macht's spannend!

---

**Lernen durch Lehren (d = 0.53):** 👥

*"Wer lehrt, lernt doppelt."*

Wenn du jemandem etwas erklärst, musst du:
1. Es selbst verstehen
2. Es in klare Worte fassen
3. Auf Fragen reagieren

**Für dich:**
- **Geschwister-Schule!** Der Große erklärt dem Kleinen.
- Oder: Eltern spielen dumm. *"Mama/Papa versteht das nicht, kannst du es mir erklären?"*`,
        type: 'expander'
      },
      {
        title: "Das Paradox: Warum sich gutes Lernen falsch anfühlt",
        content: `*"Ich hab so viel gelernt und fühle mich trotzdem unsicher..."*

Das ist NORMAL. Und es ist sogar ein GUTES Zeichen!

**Das Fluency-Problem:**
Wenn du einen Text dreimal durchliest, fühlt er sich "vertraut" an.
Dein Gehirn sagt: *"Hey, das kenn ich doch! Muss ich also wissen!"*
Aber: Etwas wiederzuerkennen ist nicht dasselbe wie es zu WISSEN.

**Die Studie, die alles verändert:**
- Gruppe A: Wiederlesen (fühlte sich gut an)
- Gruppe B: Retrieval Practice (fühlte sich anstrengend an)

Gruppe A fühlte sich 62% vorbereitet. Gruppe B nur 53%.
**Aber:** Gruppe B schnitt im Test **54% BESSER** ab!

**Die Take-Away Message:**
- Wenn Lernen sich leicht anfühlt, lernst du wahrscheinlich nicht viel.
- Wenn Lernen sich anstrengend anfühlt, bist du auf dem richtigen Weg.

**Vertrau der Wissenschaft, nicht deinem Gefühl!**`,
        type: 'info'
      }
    ]
  },
  summary: "Die 7 Power-Techniken sind wissenschaftlich bewiesen. Vertrau der Wissenschaft, nicht deinem Gefühl – denn gutes Lernen fühlt sich manchmal schwer an!"
};

// ============================================
// UNTERSTUFE
// ============================================
const UNTERSTUFE_CONTENT: IslandContent = {
  title: "Die 7 Power-Techniken - Cleverer lernen",
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

Hier sind die 7 Techniken, die WIRKLICH funktionieren!`,
    sections: [
      {
        title: "Was ist eine 'Effektstärke' (d)?",
        content: `Stell dir vor, du misst, wie viel Schüler in einem Jahr lernen. Das ist der Normalfall.
Jetzt fragst du: Bringt Methode X mehr oder weniger als dieses eine Jahr?

- **d = 0.40** → Ein Jahr Lernfortschritt (der Durchschnitt)
- **d > 0.40** → Mehr als ein Jahr! 🎉
- **d < 0.40** → Weniger als ein Jahr 😕
- **d = 0.80** → Zwei Jahre Fortschritt in einem Jahr! 🚀

**Die Top-Effektstärken:**

| Technik | Effektstärke | Bewertung |
|---------|--------------|-----------|
| Selbsttest (Retrieval) | d = 0.58 | ⭐⭐⭐ High Utility |
| Verteiltes Lernen | d = 0.60 | ⭐⭐⭐ High Utility |
| Feynman-Methode | d = 0.75 | ⭐⭐⭐ Sehr hoch! |
| Markieren | d = 0.36 | ❌ Low Utility |
| Wiederlesen | d = 0.36 | ❌ Low Utility |`,
        type: 'success'
      },
      {
        title: "Technik 1: Retrieval Practice (Selbsttest)",
        content: `**Effektstärke: d = 0.58** ⭐⭐⭐

Jedes Mal, wenn du etwas aus deinem Gedächtnis ABRUFST (statt es nur wieder zu lesen), verstärkst du die Verbindung im Gehirn.

Das ist wie ein Trampelpfad: Je öfter du ihn gehst, desto breiter wird er.

**So geht's für dich:**
- **Karteikarten sind dein bester Freund!** Schreib auf die Vorderseite die Frage, auf die Rückseite die Antwort.
- **WICHTIG:** Erst versuchen zu antworten, DANN umdrehen.
- **Apps wie Anki oder Quizlet** machen das automatisch.
- **Challenge:** Kannst du die ganze Karteikarten-Box durchgehen, ohne zu spicken?`,
        type: 'expander',
        expanded: true
      },
      {
        title: "Technik 2: Spaced Repetition (Zeitversetzt wiederholen)",
        content: `**Effektstärke: d = 0.60** ⭐⭐⭐

Dein Gehirn vergisst. Schnell. Die Vergessenskurve (Ebbinghaus, 1885) zeigt:
Nach 24 Stunden hast du 70% vergessen!

ABER: Wenn du wiederholst, BEVOR du vergessen hast, wird die Kurve flacher.

**Die goldene Regel:** 1 Tag → 3 Tage → 1 Woche → 2 Wochen → 1 Monat

**So geht's für dich:**
- **Lernplan erstellen!** Nicht: "Ich lerne am Wochenende vor der Arbeit."
- Sondern: "Ich lerne heute 30 Min, übermorgen 15 Min, in einer Woche nochmal 10 Min."
- **Apps helfen:** Anki sagt dir automatisch, wann du was wiederholen sollst. Das nennt sich Spaced Repetition Software (SRS).`,
        type: 'expander'
      },
      {
        title: "Technik 3: Feynman-Methode",
        content: `**Effektstärke: d = 0.75** ⭐⭐⭐ Sehr hoch!

Richard Feynman war Nobelpreisträger für Physik.
Seine Methode: **Wenn du etwas nicht einfach erklären kannst, hast du es nicht verstanden.**

> *"Was ich nicht erschaffen kann, verstehe ich nicht."* – Richard Feynman

**So geht's für dich:**
- Stell dir vor, ein Grundschüler fragt dich: *"Was sind Brüche?"* oder *"Was ist Fotosynthese?"*
- **Kannst du es SO erklären, dass er es versteht? Ohne Fachbegriffe?**
- Schreib deine Erklärung auf. Dann lies sie laut vor.
- Klingt es wie ein Mensch redet? Wenn nicht, vereinfache!`,
        type: 'expander'
      },
      {
        title: "Technik 4: Interleaving (Mischen statt Blocken)",
        content: `**Effektstärke: d = 0.67** ⭐⭐⭐

Die meisten lernen "geblockt": Erst 20 Mathe-Aufgaben zum Thema A, dann 20 zum Thema B.
Fühlt sich effektiv an. **IST ES ABER NICHT.**

Interleaving heißt: Aufgaben mischen! A, B, C, A, B, C...

Warum? Weil du bei jeder Aufgabe erst erkennen musst, WELCHES Problem das überhaupt ist.

**Fun Fact:** Physik-Studenten, die mit Interleaving lernten, schnitten 125% besser ab – obwohl sie sich schlechter fühlten!

**So geht's für dich:**
- **Erstelle gemischte Übungsblätter!** Statt 10 Bruchaufgaben, dann 10 Dezimalaufgaben → Mische sie!
- **Bei Sprachen:** Nicht erst alle Verben im Präsens, dann alle im Perfekt. Sondern: Ein Satz Präsens, ein Satz Perfekt, einer Präsens...`,
        type: 'expander'
      },
      {
        title: "Technik 5: Loci-Methode (Gedächtnispalast)",
        content: `**Effektstärke: d = 0.65** ⭐⭐⭐

Diese Methode nutzen Gedächtnis-Weltmeister!

Funktioniert so: Du "gehst" im Kopf durch einen bekannten Ort (dein Zimmer, Schulweg) und "platzierst" an jedem Punkt einen Begriff, den du dir merken willst.

Warum funktioniert das? Das Gehirn ist super darin, sich Orte zu merken – viel besser als abstrakte Listen.

**So geht's für dich:**
- **Schulweg nutzen!** Von zuhause bis zum Klassenraum – jede Station = ein Merkpunkt.
- **Historische Ereignisse?** Häng sie an deinen Schulweg. Die Französische Revolution passiert am Bäcker, Napoleon steht an der Ampel...`,
        type: 'expander'
      },
      {
        title: "Technik 6 & 7: Pomodoro + Lernen durch Lehren",
        content: `**Pomodoro-Technik (d = 0.53):** 🍅

Das Gehirn kann sich nicht ewig konzentrieren. Nach etwa 25 Minuten lässt die Aufmerksamkeit nach.

**Klassisches Pomodoro:** 25 + 5.
- **Handy in einen anderen Raum!**
- Die Pause ist ECHTE Pause: Aufstehen, Wasser holen, Fenster öffnen, Dehnübungen.
- **NICHT:** Social Media "kurz checken".

---

**Lernen durch Lehren (d = 0.53):** 👥

*"Wer lehrt, lernt doppelt."*

Wenn du jemandem etwas erklärst, musst du:
1. Es selbst verstehen
2. Es in klare Worte fassen
3. Auf Fragen reagieren

Das ist Elaboration, Retrieval Practice und Metakognition in einem!

**So geht's:**
- **Lerngruppen!** Aber nicht gemeinsam schweigend lernen.
- Sondern: Jeder wird Experte für ein Thema und erklärt es den anderen.
- **Der Erklärer lernt mehr als der Zuhörer!**`,
        type: 'expander'
      },
      {
        title: "Das Paradox: Warum sich gutes Lernen falsch anfühlt",
        content: `**Das Fluency-Problem:**

Wenn du einen Text dreimal durchliest, fühlt er sich "vertraut" an.
Das nennt man "Fluency". Dein Gehirn sagt: *"Hey, das kenn ich doch!"*
Aber: Etwas wiederzuerkennen ist nicht dasselbe wie es zu WISSEN.

**Die Studie:**
- Gruppe A: Wiederlesen (fühlte sich gut an)
- Gruppe B: Retrieval Practice (fühlte sich anstrengend an)

Gruppe A fühlte sich 62% vorbereitet. Gruppe B nur 53%.
**Aber:** Gruppe B schnitt im Test **54% BESSER** ab!

**"Desirable Difficulties" (Erwünschte Schwierigkeiten):**
Bestimmte Schwierigkeiten beim Lernen sind GUT, weil sie das Gehirn zwingen, härter zu arbeiten.

**Die Take-Away Message:**
- Wenn Lernen sich leicht anfühlt, lernst du wahrscheinlich nicht viel.
- Wenn Lernen sich anstrengend anfühlt, bist du auf dem richtigen Weg.`,
        type: 'info'
      }
    ]
  },
  summary: "Die 7 Power-Techniken haben Effektstärken von d=0.53 bis d=0.75. Das ist mehr als doppelt so effektiv wie Markieren oder Wiederlesen!"
};

// ============================================
// MITTELSTUFE
// ============================================
const MITTELSTUFE_CONTENT: IslandContent = {
  title: "Die 7 Power-Techniken - Evidenzbasiertes Lernen",
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

**Was ist eine Effektstärke?**
- d = 0.40 → Ein Jahr Lernfortschritt (Durchschnitt)
- d = 0.80 → Zwei Jahre Fortschritt in einem Jahr!
- d < 0.40 → Weniger als der Durchschnitt`,
    sections: [
      {
        title: "Die Effektstärken im Vergleich",
        content: `**High Utility Strategien:**
| Technik | Effektstärke | Bedeutung |
|---------|--------------|-----------|
| Feynman-Methode | d = 0.75 | ~1.9 Jahre Fortschritt |
| Interleaving | d = 0.67 | ~1.7 Jahre Fortschritt |
| Loci-Methode | d = 0.65 | ~1.6 Jahre Fortschritt |
| Spaced Repetition | d = 0.60 | ~1.5 Jahre Fortschritt |
| Retrieval Practice | d = 0.58 | ~1.5 Jahre Fortschritt |

**Low Utility Strategien (was die meisten machen):**
| Technik | Effektstärke | Bedeutung |
|---------|--------------|-----------|
| Markieren | d = 0.36 | Unter Durchschnitt |
| Wiederlesen | d = 0.36 | Unter Durchschnitt |
| Zusammenfassen | d = 0.50 | Durchschnittlich |

**Die Ironie:** Die Methoden, die sich GUT anfühlen, funktionieren oft SCHLECHT.`,
        type: 'success'
      },
      {
        title: "Technik 1: Retrieval Practice (d = 0.58)",
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
        expanded: true
      },
      {
        title: "Technik 2: Spaced Repetition (d = 0.60)",
        content: `**Das Prinzip:**
Die Vergessenskurve (Ebbinghaus, 1885) zeigt: Nach 24h sind 70% weg.
Aber: Strategisch getimte Wiederholungen flachen die Kurve ab.

**Die goldene Regel:**
1 Tag → 3 Tage → 1 Woche → 2 Wochen → 1 Monat → 3 Monate

**Warum es funktioniert:**
- Wiederholung kurz vor dem Vergessen = maximaler Lerneffekt
- "Desirable Difficulty" – die Anstrengung stärkt die Speicherung

**Praktische Umsetzung:**
- **Anki** (SRS-Software, gratis) – berechnet optimale Wiederholungsintervalle
- **Leitner-System** mit physischen Karteikarten (5 Fächer)
- **Nicht:** Alles am Abend vorher "reinprügeln" (Cramming = schnelles Vergessen)`,
        type: 'expander'
      },
      {
        title: "Technik 3: Feynman-Methode (d = 0.75)",
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
        type: 'expander'
      },
      {
        title: "Technik 4: Interleaving (d = 0.67)",
        content: `**Das Prinzip:**
Statt geblocktem Üben (AAABBBCCC) → Mischen (ABCABCABC)

**Die Studie (Rohrer & Taylor, 2007):**
- Gruppe A: Geblockt (fühlte sich 62% vorbereitet)
- Gruppe B: Interleaved (fühlte sich 53% vorbereitet)
- **Ergebnis:** Gruppe B schnitt 125% besser ab!

**Warum es funktioniert:**
- Zwingt zur Diskrimination (Unterschiede erkennen)
- Trainiert die Auswahl der richtigen Strategie
- Entspricht realen Prüfungssituationen

**Praktische Umsetzung:**
- **Mathe:** Plus/Minus/Mal gemischt statt nacheinander
- **Sprachen:** Zeiten gemischt statt kapitelweise
- **Geschichte:** Epochen gemischt abfragen`,
        type: 'expander'
      },
      {
        title: "Technik 5: Loci-Methode (d = 0.65)",
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
        type: 'expander'
      },
      {
        title: "Technik 6 & 7: Pomodoro + Lernen durch Lehren",
        content: `**Pomodoro-Technik (d = 0.53):**
- 25 Min fokussierte Arbeit → 5 Min Pause → Repeat
- Nach 4 Zyklen: 15-30 Min längere Pause
- **Wissenschaft:** Aufmerksamkeit lässt nach ~25 Min nach
- **Wichtig:** Echte Pause = keine Screens!

---

**Lernen durch Lehren (d = 0.53):**
Der "Protégé-Effekt" zeigt: Wer lehrt, lernt am meisten.

**Warum:**
- Erfordert tiefe Elaboration
- Kombiniert Retrieval + Metakognition
- Zwingt zur Strukturierung

**Praktische Umsetzung:**
- **Lerngruppen mit Expertenprinzip:** Jeder wird Experte für ein Thema
- **Erklär-Videos erstellen** (auch ohne Veröffentlichung)
- **Nachhilfe geben** – der beste Weg, etwas zu meistern`,
        type: 'expander'
      },
      {
        title: "Das Fluency-Problem & Desirable Difficulties",
        content: `**Das Fluency-Problem:**
Wenn sich etwas "vertraut" anfühlt, glauben wir, es zu wissen.
Aber: Wiedererkennen ≠ Wissen!

**Illusion of Competence:**
- Mehrfaches Lesen → "Ich kenn das ja!"
- Aber: Kannst du es aus dem Gedächtnis abrufen? Wahrscheinlich nicht.

**Desirable Difficulties (Bjork, 1994):**
Bestimmte Schwierigkeiten sind ERWÜNSCHT, weil sie tiefere Verarbeitung erzwingen:
- Interleaving (fühlt sich schwieriger an)
- Spacing (fühlt sich unsicherer an)
- Retrieval (fühlt sich anstrengender an)

**Die Konsequenz:**
Vertrau nicht deinem Gefühl! Vertrau den Effektstärken.

**Metakognitive Strategie:**
Nach dem Lernen fragen: "Kann ich das aus dem Kopf?"
Wenn nein → noch nicht gelernt, nur gelesen.`,
        type: 'warning'
      }
    ]
  },
  summary: "Die 7 Power-Techniken sind evidenzbasiert mit Effektstärken von d=0.53 bis d=0.75. Das Fluency-Problem erklärt, warum ineffektive Methoden sich gut anfühlen. Vertrau der Wissenschaft!"
};

// ============================================
// EXPORT
// ============================================
export const WERKZEUGE_CONTENT: Record<AgeGroup, IslandContent> = {
  grundschule: GRUNDSCHULE_CONTENT,
  unterstufe: UNTERSTUFE_CONTENT,
  mittelstufe: MITTELSTUFE_CONTENT,
  oberstufe: MITTELSTUFE_CONTENT, // Fallback
  paedagoge: MITTELSTUFE_CONTENT  // Fallback
};

export type { IslandContent, ContentSection };
