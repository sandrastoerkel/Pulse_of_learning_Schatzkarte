// ============================================
// Transferlernen - Content nach Altersstufen
// Thema: Transfer (Wissen übertragen)
// 5 Videos als Serie unter "Weisheit erlangen"
// Quelle: utils/learnstrat_challenges/transfer_content.py
// ============================================

import { AgeGroup } from '../types';

// ============================================
// INTERFACES
// ============================================

export interface ContentSection {
  title: string;
  content: string;
  type?: 'info' | 'success' | 'warning' | 'expander';
  expanded?: boolean;
}

export interface VideoEntry {
  videoNumber: 1 | 2 | 3 | 4 | 5;
  videoId: string;
  placeholder: boolean;
  title: string;
  subtitle: string;
  icon: string;
  canvasAnimation: 'bridgeBuilder' | 'puzzleConnect' | 'nearFarRadar' | 'brainLayers' | 'transferStar';
  intro: string;
  sections: ContentSection[];
  practicePrompt: string;
}

export interface IslandContent {
  // Backward-compat fuer QuestModal (title, video, explanation, summary)
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
  // Neue Felder fuer Video-Serie
  islandTitle?: string;
  videos?: VideoEntry[];
}

// ============================================
// HILFSFUNKTION: Videos nach Altersgruppe
// ============================================

function makeVideos(age: 'gs' | 'us' | 'ms'): VideoEntry[] {
  return [

    // ── VIDEO 1 · WAS IST TRANSFER? ──────────────────
    {
      videoNumber: 1,
      videoId: '',
      placeholder: true,
      title: 'Was ist Transfer?',
      subtitle: 'Die Brücke zwischen Wissensinseln',
      icon: '🌉',
      canvasAnimation: 'bridgeBuilder',
      intro: age === 'gs'
        ? `**Eine Überraschung: Überflieger sind gar nicht schlauer!** 🌟\n\nKennst du Kinder, die in vielen Fächern gut sind?\nMaThe, Deutsch, Sachkunde – sie können einfach alles?\n\nForscher haben genau hingeschaut.\nUnd sie haben etwas Spannendes entdeckt:\n\n**Überflieger kennen einen besonderen Trick.**\nSie können ihr Wissen ÜBERTRAGEN.\nWie eine Brücke, die verschiedene Wissensinseln verbindet.\n\n**Und das Beste?** Diesen Trick kann jeder lernen. Auch du!`
        : age === 'us'
        ? `**Warum verstehen manche Leute einfach ALLES?** 🤔\n\nDu kennst sie. Die, bei denen es einfach klickt.\nNeue Themen? Kein Problem. Andere Fächer? Auch kein Problem.\n\nDie meisten denken: "Die sind halt schlau."\n**Überraschung: Das stimmt nicht.**\n\nForscher haben das untersucht.\nEs gibt einen Skill, den fast niemand kennt.\nEr heißt **Transfer**.\n\nTransfer = Wissen von einer Situation auf andere übertragen.\n\nDas ist kein Talent. Das ist eine Technik.\nUnd die kannst du lernen.`
        : `**Warum sind manche Leute in fast allem gut?** 🤔\n\nDas ist keine rhetorische Frage. Forscher haben das untersucht.\nDie Antwort ist überraschend – und sie hat nichts mit IQ zu tun.\n\nDer Unterschied zwischen durchschnittlichen und herausragenden Lernern\nliegt nicht im WIE VIEL. Sondern im WIE.\n\nUnd dieses WIE hat einen Namen: **Transfer**.\n\n**Die Zahlen sprechen für sich:**\n- Transfer-Strategien: **d=0.86** (Top 6 von 252 Faktoren!)\n- Durchschnitt aller Lernmethoden: d=0.40\n\nEine Effektstärke von 0.86 entspricht einem Leistungsvorsprung von etwa **1,5 Schuljahren**.`,
      sections: [
        {
          title: age === 'gs' ? 'Wie Lisa Schwimmen und Radfahren verband 🚴' : age === 'us' ? 'Was sagt die Wissenschaft? 🔬' : 'Was ist Transfer genau?',
          content: age === 'gs'
            ? `Lisa lernte gerade Schwimmen.\nIhre Trainerin sagte: "Nicht aufgeben! Jeder braucht am Anfang Zeit."\n\nLisa übte jeden Tag ein bisschen. Brustschwimmen, Kraulen, Tauchen.\nNach einigen Wochen konnte sie es!\n\nDann wollte Lisa Fahrradfahren ohne Stützräder lernen.\nAm Anfang wackelte sie und hatte Angst.\n\nAber dann dachte sie: "Moment mal – das ist ja wie beim Schwimmen!"\n- Nicht aufgeben\n- Jeden Tag ein bisschen üben\n- Es wird langsam besser\n\n**DAS ist Transfer.**\nWas beim Schwimmen half, half auch beim Radfahren!`
            : age === 'us'
            ? `Forscher haben über 200 Studien ausgewertet.\nEffektstärke von Transfer-Strategien: **d=0.86**\n\nWas heißt das?\n- Durchschnittliche Lernmethode: d=0.40\n- Transfer: d=0.86 = **mehr als doppelt so effektiv!**\n\nKonkret: Wenn du Transfer beherrschst,\nlernst du mit dem gleichen Aufwand VIEL mehr.\n\n**Ein Prinzip. Zwei Fächer. Doppelter Nutzen.**`
            : `Transfer bezeichnet die Fähigkeit, Wissen und Kompetenzen\naus einem Kontext in einen neuen, anderen Kontext zu übertragen.\n\n**Zwei Arten:**\n- **Near Transfer:** Zwischen ähnlichen Situationen (leichter)\n- **Far Transfer:** Zwischen verschiedenen Domänen (schwieriger, aber wertvoller)\n\n**Der Kern:** Nicht das Wissen selbst ist entscheidend,\nsondern die Fähigkeit, das zugrundeliegende PRINZIP zu erkennen und anzuwenden.\n\n**Mythos vs. Realität:**\n❌ "Manche Menschen sind einfach vielseitig begabt."\n✅ Sie haben gelernt, Muster zu erkennen und zu übertragen.\n\n❌ "Jedes Fach braucht komplett anderes Wissen."\n✅ Viele Prinzipien sind fächerübergreifend anwendbar.\n\n❌ "Transfer passiert automatisch, wenn man genug lernt."\n✅ Transfer muss aktiv trainiert werden – er passiert NICHT von selbst.`,
          type: age === 'gs' ? 'info' : 'success',
        },
        {
          title: age === 'gs' ? 'Wie Tim sein Lego-Wissen nutzte 🧱' : age === 'us' ? 'So funktioniert das im echten Leben' : 'Hatties Drei-Ebenen-Modell des Lernens 📊',
          content: age === 'gs'
            ? `Tim baute liebend gern mit Lego.\nEr hatte einen Trick: Erst die Anleitung genau anschauen, dann Schritt für Schritt bauen.\n\nEines Tages hatte er eine schwere Sachkunde-Aufgabe.\nEr sollte beschreiben, wie eine Pflanze wächst.\n\nTim überlegte: "Das ist ja wie bei Lego!"\n\n1. ANSCHAUEN: Was soll ich genau machen?\n2. SCHRITT FÜR SCHRITT: Erst der Samen, dann die Wurzeln, dann der Stängel...\n3. FERTIG: Am Ende die Blüte!\n\nEr schrieb alles der Reihe nach auf.\nSeine Lehrerin war begeistert!\n\n**Das Geheimnis?** Der gleiche Trick funktioniert überall!`
            : age === 'us'
            ? `Du lernst in Mathe: Gleichungen lösen.\n"Was ich links mache, muss ich rechts auch machen."\n\nDann in Physik: Formeln umstellen.\nMoment... das ist ja das GLEICHE Prinzip!\n\nOhne Transfer: Du lernst beides komplett neu.\nMit Transfer: Du erkennst das Muster und sparst Zeit.\n\n**Gaming-Beispiel:** 🎮\nIn Fortnite lernst du: Ressourcen einteilen.\nNicht alles auf einmal ausgeben. Priorisieren.\n\nUnd dann merkst du:\nDas ist wie Taschengeld einteilen!\nOder Zeit für Hausaufgaben planen!\n\n**Gaming-Skills sind echte Skills.**\nDu musst sie nur übertragen.`
            : `**Ebene 1: Surface Learning (Oberflächenlernen)**\n- Fakten, Vokabeln, Prozeduren\n- Wichtig als Grundlage\n- Strategien: Zusammenfassen, Notizen, Mnemoniken\n\n**Ebene 2: Deep Learning (Tiefenlernen)**\n- Zusammenhänge verstehen\n- Konzeptuelle Strukturen erkennen\n- Strategien: Elaboration, Concept Mapping, Selbsterklärung\n\n**Ebene 3: Transfer**\n- Wissen auf neue Kontexte anwenden\n- Metakognition erforderlich\n- Strategien: Analogiebildung, Prinzipienextraktion, Perspektivwechsel\n\n**Kritische Einsicht:**\nDie meisten Prüfungen testen Ebene 1 und 2.\nAber im Leben brauchst du vor allem Ebene 3.`,
          type: age === 'gs' ? 'success' : age === 'us' ? 'info' : 'expander',
          expanded: age === 'ms' ? true : undefined,
        },
      ],
      practicePrompt: age === 'gs'
        ? '🌉 **Brücken-Übung:** Denk an etwas, das du kürzlich gelernt hast. Kannst du eine Brücke zu einem anderen Fach bauen? Probiere es aus!'
        : age === 'us'
        ? '🌉 **Brücken-Übung:** Schreib drei Dinge auf, die du gut kannst (auch außerhalb der Schule). Finde für jedes davon eine Verbindung zu einem Schulfach.'
        : '🌉 **Brücken-Übung:** Erstelle eine Transfer-Matrix: Links deine Fächer, rechts gemeinsame Prinzipien. Wo gibt es Überschneidungen?',
    },

    // ── VIDEO 2 · NEAR & FAR TRANSFER ───────────────
    {
      videoNumber: 2,
      videoId: '',
      placeholder: true,
      title: 'Near & Far Transfer',
      subtitle: 'Ähnliches erkennen, Verschiedenes verbinden',
      icon: '🧩',
      canvasAnimation: 'puzzleConnect',
      intro: age === 'gs'
        ? `**Hast du das auch schon erlebt?** 🎯\n\nDu lernst etwas Neues – und denkst: "Das kommt mir bekannt vor!"\nZum Beispiel beim Rechnen: Erst 3 + 4, dann 30 + 40.\nOder beim Schreiben: Erst "Hund", dann "Mund".\n\nDas Tolle daran: Du musst nicht alles neu lernen!\nDu kannst nutzen, was du schon kannst.\n\nDas nennt man **Near Transfer** – also "naher Transfer".\nAber es gibt auch **Far Transfer** – wenn du Wissen auf ganz andere Bereiche überträgst!`
        : age === 'us'
        ? `**Transfer gibt es in zwei Stufen.** 🎯\n\n**Near Transfer** = Ähnliches erkennen\nDu löst eine Gleichung – und erkennst, dass die nächste genauso funktioniert.\n\n**Far Transfer** = Die Königsklasse\nDu erkennst, dass Gleichgewicht in Physik dem gleichen Prinzip folgt wie in der Politik.\n\nBeides ist wichtig. Und beides kann man trainieren!`
        : `**Die Taxonomie des Transfers nach Barnett & Ceci (2002).**\n\nTransfer variiert entlang mehrerer Dimensionen:\n- Wissensdomäne (gleich vs. verschieden)\n- Physischer Kontext (gleich vs. verschieden)\n- Zeitlicher Abstand (sofort vs. verzögert)\n\n**Near Transfer** = hohe Ähnlichkeit auf allen Dimensionen\n**Far Transfer** = geringe Ähnlichkeit → schwieriger, aber wertvoller`,
      sections: [
        {
          title: age === 'gs' ? 'Near Transfer – Ähnliches erkennen 🎯' : 'Near Transfer – Muster erkennen 🎯',
          content: age === 'gs'
            ? `**Beispiele für Near Transfer:**\n- Du kannst 3 + 4 rechnen? Dann kannst du auch 30 + 40!\n- Du kannst "Hund" schreiben? Dann kannst du auch "Mund" schreiben!\n- Du kannst langsam Fahrrad fahren? Dann schaffst du es auch schneller!\n\n**Das PRINZIP bleibt immer gleich. Nur die Zahlen oder Wörter ändern sich.**`
            : age === 'us'
            ? `**Near Transfer = Transfer auf ähnliche Situationen**\n\nBeispiele:\n- Gleichung lösen (2x + 5 = 15) → Andere Gleichung (3x + 7 = 22)\n- Inhaltsangabe für Geschichte → Inhaltsangabe für Film\n- Vokabeln mit Karteikarten → Formeln mit Karteikarten\n\n**Das Prinzip bleibt gleich. Die Details ändern sich.**\n\n**In der Schule:**\n- Bruchrechnung → Prozentrechnung (beides ist Teile vom Ganzen)\n- Flächenberechnung Rechteck → Flächenberechnung Parallelogramm\n- Gedichtanalyse → Songtext-Analyse\n\n**Der Trick:** Frag dich immer: "Das kenne ich doch irgendwoher!"`
            : `**Near Transfer = Transfer zwischen ähnlichen Situationen**\n\nBeispiele:\n- Gleichung lösen (2x + 5 = 15) → Andere Gleichung (3x + 7 = 22)\n- Inhaltsangabe für Geschichte → Inhaltsangabe für Film\n- Bruchrechnung → Prozentrechnung\n\n**Perkins & Salomon (1992): Hugging**\n- Lernsituationen der Anwendung ähnlich machen\n- Je mehr Überlappung, desto leichter der Transfer (Thorndike)`,
          type: 'expander',
          expanded: true,
        },
        {
          title: age === 'gs' ? 'Far Transfer – Weit übertragen! 🚀' : 'Far Transfer – Die Königsklasse 🚀',
          content: age === 'gs'
            ? `**Manchmal kannst du Wissen sogar auf ganz andere Bereiche übertragen!**\n\nBeispiel: Beim Fußball lernst du "Immer zum Ball schauen!"\n→ Beim Lesen heißt das: "Genau auf die Wörter achten!"\n\nBeispiel: Beim Malen lernst du "Erst grob, dann Details"\n→ Beim Aufsatz heißt das: "Erst die Ideen, dann ausformulieren!"\n\n**Das gleiche Prinzip – aber in einer ganz anderen Situation!**\nDas ist Far Transfer – und der ist richtig stark!`
            : age === 'us'
            ? `**Far Transfer = Transfer auf KOMPLETT andere Bereiche**\n\nDas ist schwieriger – aber auch viel mächtiger!\n\n**Beispiel:**\nDu lernst in Geschichte: "Wer die Vergangenheit nicht kennt, wiederholt ihre Fehler."\n→ Das gilt auch für deine persönlichen Fehler!\n\nDu lernst in Bio: "Ökosysteme brauchen Gleichgewicht."\n→ Das gilt auch für Work-Life-Balance!\n\n**Das Geheimnis:** Finde das PRINZIP hinter den Dingen.\nDann kannst du es überall anwenden.`
            : `**Far Transfer = Transfer zwischen verschiedenen Domänen**\n\nBeispiel: Das Gleichgewichts-Prinzip\n\n**Near Transfer:**\nPhysik → Chemie (chemisches Gleichgewicht, Le Chatelier)\n\n**Far Transfer:**\n- Wirtschaft – Angebot und Nachfrage\n- Politik – Gewaltenteilung\n- Psychologie – Work-Life-Balance\n- Ökosysteme – Räuber-Beute-Verhältnis\n\n**Ein Prinzip. Fünf völlig verschiedene Anwendungen.**\n\nDer Schlüssel: Finde die **Tiefenstruktur** hinter der Oberflächenstruktur!\n\n**Perkins & Salomon (1992): Bridging**\n- Explizit Verbindungen zwischen Kontexten herstellen`,
          type: 'expander',
        },
      ],
      practicePrompt: age === 'gs'
        ? '🧩 **Puzzle-Übung:** Nimm ein Schulfach. Finde ein Beispiel für Near Transfer (etwas Ähnliches) und eins für Far Transfer (etwas ganz Anderes)!'
        : age === 'us'
        ? '🧩 **Puzzle-Übung:** Erstelle eine Near/Far-Tabelle für dein Lieblingsfach. Welche Verbindungen findest du zu anderen Fächern?'
        : '🧩 **Puzzle-Übung:** Wähle ein Prinzip aus der Physik. Finde mindestens 3 Anwendungen in völlig anderen Domänen.',
    },

    // ── VIDEO 3 · TRANSFER-RADAR ────────────────────
    {
      videoNumber: 3,
      videoId: '',
      placeholder: true,
      title: 'Transfer-Radar',
      subtitle: 'Transferchancen im Alltag erkennen',
      icon: '📡',
      canvasAnimation: 'nearFarRadar',
      intro: age === 'gs'
        ? `**Stell dir vor, du hast ein Radar!** 📡\n\nDieses Radar zeigt dir, wo du dein Wissen überall einsetzen kannst.\nNahe Ziele sind leicht zu finden – das ist Near Transfer.\nFerne Ziele sind schwieriger – das ist Far Transfer.\n\nMit deinem Transfer-Radar scannst du die Welt nach Verbindungen!\nUnd je mehr du übst, desto stärker wird dein Radar.`
        : age === 'us'
        ? `**Dein Transfer-Radar aktivieren.** 📡\n\nTransfer passiert nicht automatisch.\nDu musst aktiv nach Verbindungen suchen.\n\nDas ist wie ein Radar: Du scannst deine Umgebung nach Mustern.\nJe öfter du das machst, desto schneller erkennst du Verbindungen.\n\nIn diesem Video lernst du, wie du dein Transfer-Radar schärfst – in der Schule und im Alltag.`
        : `**Systematisches Transfer-Scanning.**\n\nTransfer muss aktiv initiiert werden (Salomon & Perkins, 1989).\nOhne bewusste Suche nach Analogien bleibt Wissen kontextgebunden.\n\n**Transfer-Radar = Metakognitive Strategie:**\nBei jedem neuen Thema systematisch fragen:\n- Welches Prinzip steckt dahinter?\n- Wo habe ich dieses Prinzip schon gesehen?\n- Auf welche neuen Kontexte lässt es sich anwenden?`,
      sections: [
        {
          title: age === 'gs' ? 'So hilft dir das in der Schule 📚' : age === 'us' ? 'Wie Tom durch Minecraft besser in Erdkunde wurde 🗺️' : 'Transfer und Metakognition 🧠',
          content: age === 'gs'
            ? `In Heimat- und Sachkunde hast du gelernt, wie eine Gemeinde funktioniert:\nBürgermeister, Gemeinderat, Rathaus.\n\nJetzt lernst du das Thema "Bayern".\nIst das ganz neu? Nein, nicht wirklich!\n\n- Die Gemeinde hat einen Bürgermeister → Bayern hat einen Ministerpräsidenten\n- Die Gemeinde hat einen Gemeinderat → Bayern hat einen Landtag\n- Die Gemeinde hat ein Rathaus → Bayern hat eine Staatskanzlei\n\n**Das gleiche Prinzip, nur größer!**\n\n**Beim Übertritt:**\nBald kommst du auf eine neue Schule.\nDort gibt es neue Fächer wie Englisch oder Geschichte.\n\nDas klingt vielleicht schwierig.\nAber mit Transfer wird es leichter!\n\nDenn vieles, was du jetzt schon kannst, hilft dir auch dort:\n- Texte verstehen → Hilft in JEDEM Fach\n- Sauber schreiben → Hilft bei JEDER Arbeit\n- Gut zuhören → Hilft in JEDER Stunde\n\n**Du fängst nicht bei Null an!**`
            : age === 'us'
            ? `Tom liebte Minecraft. Er baute riesige Welten.\nDabei lernte er: Erst erkunden, dann planen, dann bauen.\n\nIn Erdkunde sollten sie eine Karte analysieren.\nDie anderen starrten ratlos auf das Blatt.\n\nTom dachte: "Das ist wie eine neue Minecraft-Welt!"\nEr erkundete systematisch: Flüsse, Berge, Städte.\nDann plante er seine Antwort. Dann schrieb er.\n\nSeine Lehrerin war beeindruckt.\nTom grinste. Er hatte transferiert.\n\n**Das Prinzip "Erkunden → Planen → Handeln" funktioniert überall.**`
            : `Transfer ist ohne Metakognition nicht möglich.\nDu musst ÜBER dein Denken nachdenken.\n\n**Die drei metakognitiven Kernprozesse:**\n\n**1. Planen:**\n- Welche Strategie könnte hier funktionieren?\n- Was weiß ich bereits, das relevant sein könnte?\n\n**2. Monitoring:**\n- Funktioniert mein Ansatz?\n- Erkenne ich relevante Muster?\n\n**3. Evaluieren:**\n- Hat der Transfer funktioniert?\n- Was kann ich für die Zukunft lernen?\n\n**Selbstreflexionsfrage:**\n"Denke ich gerade über das Problem nach – oder über mein Denken über das Problem?"\nLetzteres ist Metakognition.`,
          type: age === 'gs' ? 'expander' : age === 'us' ? 'info' : 'expander',
        },
      ],
      practicePrompt: age === 'gs'
        ? '📡 **Radar-Übung:** Nimm ein Thema aus dem Sachunterricht. Scanne mit deinem Transfer-Radar: Wo findest du das gleiche Prinzip in Mathe, Deutsch oder Sport?'
        : age === 'us'
        ? '📡 **Radar-Übung:** Denk an etwas, das du außerhalb der Schule gut kannst (Gaming, Sport, Musik). Finde 3 Verbindungen zu Schulfächern!'
        : '📡 **Radar-Übung:** Wähle ein Thema aus deiner letzten Klassenarbeit. Scanne systematisch: Planen → Monitoring → Evaluieren. Wo hättest du Transfer nutzen können?',
    },

    // ── VIDEO 4 · TIEFENLERNEN & TRANSFER ───────────
    {
      videoNumber: 4,
      videoId: '',
      placeholder: true,
      title: 'Tiefenlernen & Transfer',
      subtitle: 'Von der Oberfläche in die Tiefe',
      icon: '🧠',
      canvasAnimation: 'brainLayers',
      intro: age === 'gs'
        ? `**Wusstest du, dass es verschiedene Arten zu lernen gibt?** 🧠\n\nManchmal lernst du Dinge nur "oben drauf" – wie eine dünne Schicht Farbe.\nDas vergisst du schnell.\n\nAber wenn du TIEF lernst, bleibt das Wissen für immer!\nUnd dann kannst du es auch auf andere Dinge übertragen.\n\n**Tiefenlernen ist der Turbo für Transfer!**`
        : age === 'us'
        ? `**Wissen hat drei Ebenen.** 🧠\n\nEbene 1: Du weißt Fakten (Hauptstadt von Frankreich? Paris!)\nEbene 2: Du verstehst Zusammenhänge (WARUM ist Paris die Hauptstadt?)\nEbene 3: Du kannst es übertragen (Wie entstehen Hauptstädte generell?)\n\nDie meisten lernen nur auf Ebene 1.\nÜberflieger lernen auf Ebene 3.\n\n**Tiefenlernen ist der Schlüssel zum Transfer.**`
        : `**Von Surface Learning zu Transfer Learning.**\n\nHatties Drei-Ebenen-Modell zeigt: Die meisten Schüler bleiben auf Ebene 1 (Surface).\nAber Transfer erfordert Ebene 3.\n\n**Der Sprung von Ebene 2 zu Ebene 3 ist entscheidend:**\nNicht mehr nur verstehen, sondern aktiv auf neue Kontexte anwenden.\n\nDafür braucht es explizite Übung – Transfer passiert nicht von selbst.`,
      sections: [
        {
          title: age === 'gs' ? 'Fun Fact – Deine Superkraft! 🦸' : age === 'us' ? 'Deine Gaming-Skills sind echte Skills 🎮' : 'Implikationen für Prüfungen 📝',
          content: age === 'gs'
            ? `**Wusstest du das?**\nWissenschaftler sagen: Wer gut im Übertragen ist, wird in ALLEN Fächern besser!\nNicht nur in einem – in allen gleichzeitig.\nDas ist fast wie eine Superkraft!\n\nAlle Profis nutzen Transfer!\nFußballspieler übertragen ihre Tricks auf neue Spielsituationen.\nMusiker übertragen Rhythmen auf neue Lieder.\nUnd du? Du kannst das auch! ⚽🎵`
            : age === 'us'
            ? `**Du denkst, Gaming ist Zeitverschwendung?** Falsch!\n\n**Strategie-Spiele** lehren dich:\n- Ressourcen einteilen → Zeitmanagement für Hausaufgaben\n- Erst erkunden, dann planen → Texte verstehen\n- Teamwork und Kommunikation → Gruppenarbeiten\n\n**Das Problem:** Die meisten erkennen nicht, dass sie transferierbare Skills haben.\n\n**Die Lösung:** Frag bei jedem neuen Thema:\n"Wo hab ich so was Ähnliches schon mal gemacht?"\n\nDas gilt für Gaming, Sport, Musik, Kochen – alles!`
            : `**Das Problem:**\n- Prüfungsaufgaben sind oft neu formuliert\n- Reine Reproduktion reicht nicht\n- Transfer wird implizit gefordert, aber nicht gelehrt\n\n**Die Lösung:**\n- Lerne nicht Aufgabentypen, lerne Prinzipien\n- Übe mit unbekannten Aufgaben, nicht nur mit bekannten\n- Frag bei jedem Thema: "Was ist das Prinzip? Wo gilt es noch?"\n\n**Praktische Strategien:**\n\n**1. Aufgaben nach Prinzipien kategorisieren:**\nBeim Lernen nicht fragen "Welches Kapitel?" sondern "Welches Prinzip?"\n\n**2. Systematisches Variieren beim Üben:**\n- Gleiche Aufgabe mit anderen Zahlen\n- Gleiches Prinzip in anderem Kontext\n- Typische Aufgabe umformulieren\n\n**3. Transfer-Fragen beim Lernen:**\n- "Wo habe ich dieses Prinzip schon gesehen?"\n- "In welchem anderen Fach gilt das auch?"\n- "Was wäre, wenn die Aufgabe anders gestellt wäre?"`,
          type: age === 'gs' ? 'info' : 'expander',
        },
      ],
      practicePrompt: age === 'gs'
        ? '🧠 **Tiefen-Übung:** Nimm ein Thema und erkläre es jemandem so, als wärst du der Lehrer. Wenn du es erklären kannst, hast du es tief verstanden!'
        : age === 'us'
        ? '🧠 **Tiefen-Übung:** Nimm dein Lieblings-Hobby und finde 3 "versteckte" Skills, die du in der Schule nutzen kannst.'
        : '🧠 **Tiefen-Übung:** Nimm eine typische Prüfungsaufgabe. Formuliere sie in 3 verschiedenen Kontexten um – das gleiche Prinzip, andere Oberfläche.',
    },

    // ── VIDEO 5 · DEIN TRANSFER-MOMENT ──────────────
    {
      videoNumber: 5,
      videoId: '',
      placeholder: true,
      title: 'Dein Transfer-Moment',
      subtitle: 'Wissen verbinden und anwenden',
      icon: '⭐',
      canvasAnimation: 'transferStar',
      intro: age === 'gs'
        ? `**Jetzt bist du dran!** ⭐\n\nDu weißt jetzt, was Transfer ist.\nDu kennst Near und Far Transfer.\nDu hast dein Transfer-Radar aktiviert.\n\nJetzt kommt der wichtigste Teil:\n**Dein eigener Transfer-Moment!**\n\nDenk an etwas, das du richtig gut kannst.\nUnd finde heraus, wo dir der gleiche Trick in der Schule hilft!`
        : age === 'us'
        ? `**Dein persönlicher Transfer-Moment.** ⭐\n\nTransfer ist nicht nur Theorie.\nEs ist etwas, das du JETZT sofort ausprobieren kannst.\n\nDenk an etwas, das du außerhalb der Schule gut kannst.\n(Gaming, Sport, Musik, Kunst, Social Media...)\n\nFrag dich:\n1. Was ist das Prinzip dabei?\n2. Wo könnte mir das in der Schule helfen?\n\n**Transfer ist der Unterschied zwischen "viel lernen" und "smart lernen".**`
        : `**Transfer als Kernkompetenz der Zukunft.**\n\nTransfer ist die Kompetenz, die dich von einer KI unterscheidet.\nChatGPT kann Fakten. Menschen können transferieren.\n\n**Theoretische Grundlagen:**\n\n- **Thorndike & Woodworth (1901):** Transfer basiert auf gemeinsamen Elementen\n- **Perkins & Salomon (1992):** Hugging & Bridging als didaktische Strategien\n- **Barnett & Ceci (2002):** Systematisierung von Near und Far Transfer\n\nTransfer ist die Kompetenz, die in Zukunft am meisten zählt.`,
      sections: [
        {
          title: age === 'gs' ? 'Dein Transfer-Moment! 🧪' : 'Finde deine Transfer-Chancen! 🔍',
          content: age === 'gs'
            ? `**Probiere es selbst aus!**\n\nDenk an etwas, das du richtig gut kannst.\nVielleicht Fußball? Oder Malen? Oder ein Instrument?\n\nJetzt überlege:\nWas ist dein besonderer Trick dabei?\n\nZum Beispiel:\n- Beim Fußball: "Immer zum Ball schauen!"\n- Beim Malen: "Erst grob, dann die Details."\n- Beim Flöte spielen: "Langsam anfangen, dann schneller werden."\n\nUnd jetzt die spannende Frage:\n**Wo könnte dir der GLEICHE Trick in der Schule helfen?**\n\n- Immer hinschauen → Beim Lesen genau auf die Wörter achten?\n- Erst grob, dann Details → Beim Aufsatz erst die Ideen, dann ausformulieren?\n- Langsam anfangen → Beim Rechnen erst die leichten Aufgaben?`
            : age === 'us'
            ? `**Denk an etwas, das du außerhalb der Schule gut kannst.**\n(Gaming, Sport, Musik, Kunst, Social Media...)\n\nFrag dich:\n1. Was ist das Prinzip dabei?\n2. Wo könnte mir das in der Schule helfen?\n\n**Beispiele:**\n- YouTube-Videos schneiden → Präsentationen strukturieren (beides braucht guten Aufbau)\n- Social-Media-Trends erkennen → Muster in Geschichte erkennen\n- Minecraft-Redstone → Logik in Mathe verstehen\n\n**Das Wichtigste:**\nTransfer ist der Unterschied zwischen "viel lernen" und "smart lernen".\n\nFrag dich bei jedem neuen Thema:\n**"Wo hab ich so was Ähnliches schon mal gemacht?"**`
            : `**Transfer systematisch trainieren:**\n\n**Strategie 1: Prinzipien-Journaling**\nSchreibe nach jeder Unterrichtsstunde das zugrundeliegende Prinzip auf.\nNicht die Fakten – das PRINZIP.\n\n**Strategie 2: Cross-Fach-Mapping**\nErstelle eine Matrix: Fächer × Prinzipien.\nFinde Überschneidungen.\n\n**Strategie 3: Transfer-Fragen**\nBei jedem neuen Thema:\n- "Wo habe ich dieses Prinzip schon gesehen?"\n- "In welchem anderen Fach gilt das auch?"\n- "Was wäre, wenn die Aufgabe anders gestellt wäre?"\n\n**Relevanz:**\nTransfer ist die Brücke zwischen Wissen und Kompetenz.\nd=0.86 – Das ist der Unterschied zwischen Lernen und Verstehen.`,
          type: 'expander',
          expanded: true,
        },
      ],
      practicePrompt: age === 'gs'
        ? '⭐ **Star-Übung:** Male einen Stern mit 5 Zacken. Schreib an jeden Zacken ein Fach. In die Mitte schreibst du einen Trick, der in ALLEN Fächern hilft!'
        : age === 'us'
        ? '⭐ **Star-Übung:** Erstelle deine persönliche "Transfer-Karte": In der Mitte dein bester Skill, drumherum alle Fächer, wo du ihn nutzen kannst.'
        : '⭐ **Star-Übung:** Erstelle ein Prinzipien-Journal für eine Woche. Notiere pro Tag das wichtigste Prinzip und mindestens eine Transfer-Anwendung.',
    },
  ];
}

// ============================================
// HELPER: Content-Objekt mit Backward-Compat bauen
// Video 1 wird fuer title/video/explanation genutzt
// ============================================

function buildContent(islandTitle: string, videos: VideoEntry[], summary: string): IslandContent {
  const firstVideo = videos[0];
  return {
    // Backward-compat fuer QuestModal
    title: firstVideo.title,
    video: {
      url: firstVideo.videoId ? `https://www.youtube.com/watch?v=${firstVideo.videoId}` : '',
      placeholder: firstVideo.placeholder,
    },
    explanation: {
      intro: firstVideo.intro,
      sections: firstVideo.sections,
    },
    summary,
    // Neue Felder
    islandTitle,
    videos,
  };
}

// ============================================
// CONTENT PRO ALTERSGRUPPE
// ============================================

const GRUNDSCHULE_CONTENT: IslandContent = buildContent(
  'Station der Brücken',
  makeVideos('gs'),
  'Überflieger sind nicht schlauer als andere. Sie können ihr Wissen einfach gut ÜBERTRAGEN. Das kannst du auch lernen!',
);

const UNTERSTUFE_CONTENT: IslandContent = buildContent(
  'Station der Brücken',
  makeVideos('us'),
  'Transfer ist keine Begabung – es ist ein trainierbarer Skill. Die Frage ist nicht: "Wie viel weißt du?" Die Frage ist: "Wie gut kannst du es anwenden?"',
);

const MITTELSTUFE_CONTENT: IslandContent = buildContent(
  'Station der Brücken',
  makeVideos('ms'),
  'Transfer ist die Brücke zwischen Wissen und Kompetenz. d=0.86 – Das ist der Unterschied zwischen Lernen und Verstehen.',
);

// ============================================
// EXPORT
// ============================================

export const BRUECKEN_CONTENT: Record<AgeGroup, IslandContent> = {
  grundschule: GRUNDSCHULE_CONTENT,
  unterstufe:  UNTERSTUFE_CONTENT,
  mittelstufe: MITTELSTUFE_CONTENT,
  oberstufe:   MITTELSTUFE_CONTENT, // Fallback
  paedagoge:   MITTELSTUFE_CONTENT, // Fallback
};
