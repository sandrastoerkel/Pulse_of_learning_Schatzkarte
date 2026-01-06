// ============================================
// Insel der Brücken - Content nach Altersstufen
// Thema: Transfer (Wissen übertragen)
// Quelle: utils/learnstrat_challenges/transfer_content.py
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
  title: "Das Transfer-Geheimnis - Für kleine Entdecker",
  video: {
    url: "",
    placeholder: true
  },
  explanation: {
    intro: `**Eine Überraschung: Überflieger sind gar nicht schlauer!** 🌟

Kennst du Kinder, die in vielen Fächern gut sind?
Mathe, Deutsch, Sachkunde – sie können einfach alles?

Viele glauben: Diese Kinder sind besonders schlau geboren.
**Das stimmt aber nicht!**

Forscher haben genau hingeschaut.
Und sie haben etwas Spannendes entdeckt:

**Überflieger kennen einen besonderen Trick.**
Sie können ihr Wissen ÜBERTRAGEN.
Wie ein Schlüssel, der viele Türen öffnet.

**Und das Beste?** Diesen Trick kann jeder lernen. Auch du!`,
    sections: [
      {
        title: "Wie Lisa Schwimmen und Radfahren verband 🚴",
        content: `Lisa lernte gerade Schwimmen.
Ihre Trainerin sagte: "Nicht aufgeben! Jeder braucht am Anfang Zeit."

Lisa übte jeden Tag ein bisschen. Brustschwimmen, Kraulen, Tauchen.
Nach einigen Wochen konnte sie es!

Dann wollte Lisa Fahrradfahren ohne Stützräder lernen.
Am Anfang wackelte sie und hatte Angst.

Aber dann dachte sie: "Moment mal – das ist ja wie beim Schwimmen!"
- Nicht aufgeben
- Jeden Tag ein bisschen üben
- Es wird langsam besser

**DAS ist Transfer.**
Was beim Schwimmen half, half auch beim Radfahren!`,
        type: 'info'
      },
      {
        title: "Wie Tim sein Lego-Wissen nutzte 🧱",
        content: `Tim baute liebend gern mit Lego.
Er hatte einen Trick: Erst die Anleitung genau anschauen, dann Schritt für Schritt bauen.

Eines Tages hatte er eine schwere Sachkunde-Aufgabe.
Er sollte beschreiben, wie eine Pflanze wächst.

Tim überlegte: "Das ist ja wie bei Lego!"

1. ANSCHAUEN: Was soll ich genau machen?
2. SCHRITT FÜR SCHRITT: Erst der Samen, dann die Wurzeln, dann der Stängel...
3. FERTIG: Am Ende die Blüte!

Er schrieb alles der Reihe nach auf.
Seine Lehrerin war begeistert!

**Das Geheimnis?** Der gleiche Trick funktioniert überall!`,
        type: 'success'
      },
      {
        title: "Near Transfer – Ähnliches erkennen 🎯",
        content: `**Hast du das auch schon erlebt?**

Du lernst etwas Neues – und denkst: "Das kommt mir bekannt vor!"
Zum Beispiel beim Rechnen: Erst 3 + 4, dann 30 + 40.
Oder beim Schreiben: Erst "Hund", dann "Mund".

Das Tolle daran: Du musst nicht alles neu lernen!
Du kannst nutzen, was du schon kannst.

Das nennt man **Near Transfer**.
"Near" ist Englisch und bedeutet "nah".

**Beispiele:**
- Du kannst 3 + 4 rechnen? Dann kannst du auch 30 + 40!
- Du kannst "Hund" schreiben? Dann kannst du auch "Mund" schreiben!
- Du kannst langsam Fahrrad fahren? Dann schaffst du es auch schneller!

**Das PRINZIP bleibt immer gleich. Nur die Zahlen oder Wörter ändern sich.**`,
        type: 'expander',
        expanded: true
      },
      {
        title: "So hilft dir das in der Schule 📚",
        content: `In Heimat- und Sachkunde hast du gelernt, wie eine Gemeinde funktioniert:
Bürgermeister, Gemeinderat, Rathaus.

Jetzt lernst du das Thema "Bayern".
Ist das ganz neu? Nein, nicht wirklich!

- Die Gemeinde hat einen Bürgermeister → Bayern hat einen Ministerpräsidenten
- Die Gemeinde hat einen Gemeinderat → Bayern hat einen Landtag
- Die Gemeinde hat ein Rathaus → Bayern hat eine Staatskanzlei

**Das gleiche Prinzip, nur größer!**

**Beim Übertritt:**
Bald kommst du auf eine neue Schule.
Dort gibt es neue Fächer wie Englisch oder Geschichte.

Das klingt vielleicht schwierig.
Aber mit Transfer wird es leichter!

Denn vieles, was du jetzt schon kannst, hilft dir auch dort:
- Texte verstehen → Hilft in JEDEM Fach
- Sauber schreiben → Hilft bei JEDER Arbeit
- Gut zuhören → Hilft in JEDER Stunde

**Du fängst nicht bei Null an!**`,
        type: 'expander'
      },
      {
        title: "Dein Transfer-Moment! 🧪",
        content: `**Probiere es selbst aus!**

Denk an etwas, das du richtig gut kannst.
Vielleicht Fußball? Oder Malen? Oder ein Instrument?

Jetzt überlege:
Was ist dein besonderer Trick dabei?

Zum Beispiel:
- Beim Fußball: "Immer zum Ball schauen!"
- Beim Malen: "Erst grob, dann die Details."
- Beim Flöte spielen: "Langsam anfangen, dann schneller werden."

Und jetzt die spannende Frage:
**Wo könnte dir der GLEICHE Trick in der Schule helfen?**

- Immer hinschauen → Beim Lesen genau auf die Wörter achten?
- Erst grob, dann Details → Beim Aufsatz erst die Ideen, dann ausformulieren?
- Langsam anfangen → Beim Rechnen erst die leichten Aufgaben?`,
        type: 'expander'
      },
      {
        title: "Fun Fact 🦸",
        content: `**Wusstest du das?**
Wissenschaftler sagen: Wer gut im Übertragen ist, wird in ALLEN Fächern besser!
Nicht nur in einem – in allen gleichzeitig.
Das ist fast wie eine Superkraft!

Alle Profis nutzen Transfer!
Fußballspieler übertragen ihre Tricks auf neue Spielsituationen.
Musiker übertragen Rhythmen auf neue Lieder.
Und du? Du kannst das auch! ⚽🎵`,
        type: 'info'
      }
    ]
  },
  summary: "Überflieger sind nicht schlauer als andere. Sie können ihr Wissen einfach gut ÜBERTRAGEN. Das kannst du auch lernen!"
};

// ============================================
// UNTERSTUFE
// ============================================
const UNTERSTUFE_CONTENT: IslandContent = {
  title: "Transfer – Das Geheimnis der Überflieger",
  video: {
    url: "",
    placeholder: true
  },
  explanation: {
    intro: `**Warum verstehen manche Leute einfach ALLES?** 🤔

Du kennst sie. Die, bei denen es einfach klickt.
Neue Themen? Kein Problem. Andere Fächer? Auch kein Problem.

Die meisten denken: "Die sind halt schlau."
**Überraschung: Das stimmt nicht.**

Forscher haben das untersucht.
Es gibt einen Skill, den fast niemand kennt.
Er heißt **Transfer**.

Transfer = Wissen von einer Situation auf andere übertragen.

Das ist kein Talent. Das ist eine Technik.
Und die kannst du lernen.`,
    sections: [
      {
        title: "Was sagt die Wissenschaft? 🔬",
        content: `Forscher haben über 200 Studien ausgewertet.
Effektstärke von Transfer-Strategien: **d=0.86**

Was heißt das?
- Durchschnittliche Lernmethode: d=0.40
- Transfer: d=0.86 = **mehr als doppelt so effektiv!**

Konkret: Wenn du Transfer beherrschst,
lernst du mit dem gleichen Aufwand VIEL mehr.

**Ein Prinzip. Zwei Fächer. Doppelter Nutzen.**`,
        type: 'success'
      },
      {
        title: "So funktioniert das im echten Leben",
        content: `Du lernst in Mathe: Gleichungen lösen.
"Was ich links mache, muss ich rechts auch machen."

Dann in Physik: Formeln umstellen.
Moment... das ist ja das GLEICHE Prinzip!

Ohne Transfer: Du lernst beides komplett neu.
Mit Transfer: Du erkennst das Muster und sparst Zeit.

**Gaming-Beispiel:** 🎮
In Fortnite lernst du: Ressourcen einteilen.
Nicht alles auf einmal ausgeben. Priorisieren.

Und dann merkst du:
Das ist wie Taschengeld einteilen!
Oder Zeit für Hausaufgaben planen!

**Gaming-Skills sind echte Skills.**
Du musst sie nur übertragen.`,
        type: 'info'
      },
      {
        title: "Near Transfer – Ähnliches erkennen 🎯",
        content: `**Near Transfer = Transfer auf ähnliche Situationen**

Beispiele:
- Gleichung lösen (2x + 5 = 15) → Andere Gleichung (3x + 7 = 22)
- Inhaltsangabe für Geschichte → Inhaltsangabe für Film
- Vokabeln mit Karteikarten → Formeln mit Karteikarten

**Das Prinzip bleibt gleich. Die Details ändern sich.**

**In der Schule:**
- Bruchrechnung → Prozentrechnung (beides ist Teile vom Ganzen)
- Flächenberechnung Rechteck → Flächenberechnung Parallelogramm
- Gedichtanalyse → Songtext-Analyse

**Der Trick:** Frag dich immer: "Das kenne ich doch irgendwoher!"`,
        type: 'expander',
        expanded: true
      },
      {
        title: "Far Transfer – Die Königsklasse 🚀",
        content: `**Far Transfer = Transfer auf KOMPLETT andere Bereiche**

Das ist schwieriger – aber auch viel mächtiger!

**Beispiel:**
Du lernst in Geschichte: "Wer die Vergangenheit nicht kennt, wiederholt ihre Fehler."
→ Das gilt auch für deine persönlichen Fehler!

Du lernst in Bio: "Ökosysteme brauchen Gleichgewicht."
→ Das gilt auch für Work-Life-Balance!

**Das Geheimnis:** Finde das PRINZIP hinter den Dingen.
Dann kannst du es überall anwenden.`,
        type: 'expander'
      },
      {
        title: "Wie Tom durch Minecraft besser in Erdkunde wurde 🗺️",
        content: `Tom liebte Minecraft. Er baute riesige Welten.
Dabei lernte er: Erst erkunden, dann planen, dann bauen.

In Erdkunde sollten sie eine Karte analysieren.
Die anderen starrten ratlos auf das Blatt.

Tom dachte: "Das ist wie eine neue Minecraft-Welt!"
Er erkundete systematisch: Flüsse, Berge, Städte.
Dann plante er seine Antwort. Dann schrieb er.

Seine Lehrerin war beeindruckt.
Tom grinste. Er hatte transferiert.

**Das Prinzip "Erkunden → Planen → Handeln" funktioniert überall.**`,
        type: 'info'
      },
      {
        title: "Finde deine Transfer-Chancen! 🔍",
        content: `**Denk an etwas, das du außerhalb der Schule gut kannst.**
(Gaming, Sport, Musik, Kunst, Social Media...)

Frag dich:
1. Was ist das Prinzip dabei?
2. Wo könnte mir das in der Schule helfen?

**Beispiele:**
- YouTube-Videos schneiden → Präsentationen strukturieren (beides braucht guten Aufbau)
- Social-Media-Trends erkennen → Muster in Geschichte erkennen
- Minecraft-Redstone → Logik in Mathe verstehen

**Das Wichtigste:**
Transfer ist der Unterschied zwischen "viel lernen" und "smart lernen".

Frag dich bei jedem neuen Thema:
**"Wo hab ich so was Ähnliches schon mal gemacht?"**`,
        type: 'expander'
      }
    ]
  },
  summary: "Transfer ist keine Begabung – es ist ein trainierbarer Skill. Die Frage ist nicht: 'Wie viel weißt du?' Die Frage ist: 'Wie gut kannst du es anwenden?'"
};

// ============================================
// MITTELSTUFE
// ============================================
const MITTELSTUFE_CONTENT: IslandContent = {
  title: "Transfer – Die Metakompetenz",
  video: {
    url: "",
    placeholder: true
  },
  explanation: {
    intro: `**Warum sind manche Leute in fast allem gut?** 🤔

Das ist keine rhetorische Frage. Forscher haben das untersucht.
Die Antwort ist überraschend – und sie hat nichts mit IQ zu tun.

Der Unterschied zwischen durchschnittlichen und herausragenden Lernern
liegt nicht im WIE VIEL. Sondern im WIE.

Und dieses WIE hat einen Namen: **Transfer**.

**Die Zahlen sprechen für sich:**
- Transfer-Strategien: **d=0.86** (Top 6 von 252 Faktoren!)
- Durchschnitt aller Lernmethoden: d=0.40

Eine Effektstärke von 0.86 entspricht einem Leistungsvorsprung von etwa **1,5 Schuljahren**.`,
    sections: [
      {
        title: "Was ist Transfer genau?",
        content: `Transfer bezeichnet die Fähigkeit, Wissen und Kompetenzen
aus einem Kontext in einen neuen, anderen Kontext zu übertragen.

**Zwei Arten:**
- **Near Transfer:** Zwischen ähnlichen Situationen (leichter)
- **Far Transfer:** Zwischen verschiedenen Domänen (schwieriger, aber wertvoller)

**Der Kern:** Nicht das Wissen selbst ist entscheidend,
sondern die Fähigkeit, das zugrundeliegende PRINZIP zu erkennen und anzuwenden.

**Mythos vs. Realität:**
❌ "Manche Menschen sind einfach vielseitig begabt."
✅ Sie haben gelernt, Muster zu erkennen und zu übertragen.

❌ "Jedes Fach braucht komplett anderes Wissen."
✅ Viele Prinzipien sind fächerübergreifend anwendbar.

❌ "Transfer passiert automatisch, wenn man genug lernt."
✅ Transfer muss aktiv trainiert werden – er passiert NICHT von selbst.`,
        type: 'success'
      },
      {
        title: "Hatties Drei-Ebenen-Modell des Lernens 📊",
        content: `**Ebene 1: Surface Learning (Oberflächenlernen)**
- Fakten, Vokabeln, Prozeduren
- Wichtig als Grundlage
- Strategien: Zusammenfassen, Notizen, Mnemoniken

**Ebene 2: Deep Learning (Tiefenlernen)**
- Zusammenhänge verstehen
- Konzeptuelle Strukturen erkennen
- Strategien: Elaboration, Concept Mapping, Selbsterklärung

**Ebene 3: Transfer**
- Wissen auf neue Kontexte anwenden
- Metakognition erforderlich
- Strategien: Analogiebildung, Prinzipienextraktion, Perspektivwechsel

**Kritische Einsicht:**
Die meisten Prüfungen testen Ebene 1 und 2.
Aber im Leben brauchst du vor allem Ebene 3.`,
        type: 'expander',
        expanded: true
      },
      {
        title: "Konkretes Beispiel: Das Gleichgewichts-Prinzip ⚖️",
        content: `**Situation:** Du lernst in Physik das Konzept des Gleichgewichts.
Ein System ist im Gleichgewicht, wenn sich entgegengesetzte Kräfte ausgleichen.

**Near Transfer:**
Chemie – Chemisches Gleichgewicht (Le Chatelier)

**Far Transfer:**
- Wirtschaft – Angebot und Nachfrage
- Politik – Gewaltenteilung
- Psychologie – Work-Life-Balance
- Ökosysteme – Räuber-Beute-Verhältnis

**Ein Prinzip. Fünf völlig verschiedene Anwendungen.**

Der Schlüssel: Finde die **Tiefenstruktur** hinter der Oberflächenstruktur!`,
        type: 'info'
      },
      {
        title: "Transfer und Metakognition 🧠",
        content: `Transfer ist ohne Metakognition nicht möglich.
Du musst ÜBER dein Denken nachdenken.

**Die drei metakognitiven Kernprozesse:**

**1. Planen:**
- Welche Strategie könnte hier funktionieren?
- Was weiß ich bereits, das relevant sein könnte?

**2. Monitoring:**
- Funktioniert mein Ansatz?
- Erkenne ich relevante Muster?

**3. Evaluieren:**
- Hat der Transfer funktioniert?
- Was kann ich für die Zukunft lernen?

**Selbstreflexionsfrage:**
"Denke ich gerade über das Problem nach – oder über mein Denken über das Problem?"
Letzteres ist Metakognition.`,
        type: 'expander'
      },
      {
        title: "Implikationen für Prüfungen 📝",
        content: `**Das Problem:**
- Prüfungsaufgaben sind oft neu formuliert
- Reine Reproduktion reicht nicht
- Transfer wird implizit gefordert, aber nicht gelehrt

**Die Lösung:**
- Lerne nicht Aufgabentypen, lerne Prinzipien
- Übe mit unbekannten Aufgaben, nicht nur mit bekannten
- Frag bei jedem Thema: "Was ist das Prinzip? Wo gilt es noch?"

**Praktische Strategien:**

**1. Aufgaben nach Prinzipien kategorisieren:**
Beim Lernen nicht fragen "Welches Kapitel?" sondern "Welches Prinzip?"

**2. Systematisches Variieren beim Üben:**
- Gleiche Aufgabe mit anderen Zahlen
- Gleiches Prinzip in anderem Kontext
- Typische Aufgabe umformulieren

**3. Transfer-Fragen beim Lernen:**
- "Wo habe ich dieses Prinzip schon gesehen?"
- "In welchem anderen Fach gilt das auch?"
- "Was wäre, wenn die Aufgabe anders gestellt wäre?"`,
        type: 'expander'
      },
      {
        title: "Wissenschaftlicher Hintergrund",
        content: `**Theoretische Grundlagen:**

**Thorndike & Woodworth (1901): Common-Elements Theory**
- Transfer basiert auf gemeinsamen Elementen zwischen Situationen
- Je mehr Überlappung, desto leichter der Transfer

**Perkins & Salomon (1992): Hugging & Bridging**
- Hugging: Lernsituationen der Anwendung ähnlich machen
- Bridging: Explizit Verbindungen zwischen Kontexten herstellen

**Barnett & Ceci (2002): Taxonomie des Transfers**
- Systematisierung von Near und Far Transfer
- Dimensionen: Wissensdomäne, physischer Kontext, zeitlicher Abstand

**Relevanz für DICH:**
Transfer ist die Kompetenz, die dich von einer KI unterscheidet.
ChatGPT kann Fakten. Menschen können transferieren.
Und sie ist die Kompetenz, die in Zukunft am meisten zählt.`,
        type: 'info'
      }
    ]
  },
  summary: "Transfer ist die Brücke zwischen Wissen und Kompetenz. d=0.86 – Das ist der Unterschied zwischen Lernen und Verstehen."
};

// ============================================
// EXPORT
// ============================================
export const BRUECKEN_CONTENT: Record<AgeGroup, IslandContent> = {
  grundschule: GRUNDSCHULE_CONTENT,
  unterstufe: UNTERSTUFE_CONTENT,
  mittelstufe: MITTELSTUFE_CONTENT,
  oberstufe: MITTELSTUFE_CONTENT, // Fallback
  paedagoge: MITTELSTUFE_CONTENT  // Fallback
};

export type { IslandContent, ContentSection };
