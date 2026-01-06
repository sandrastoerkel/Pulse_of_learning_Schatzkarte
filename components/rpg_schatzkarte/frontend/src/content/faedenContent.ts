// ============================================
// Insel der Fäden - Content nach Altersstufen
// Basierend auf Vera F. Birkenbihl's Lehren
// Quelle: utils/learnstrat_challenges/birkenbihl_content.py
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
  title: "Das Faden-Prinzip - Für kleine Entdecker",
  video: {
    url: "",
    placeholder: true
  },
  explanation: {
    intro: `**Stell dir dein Gehirn wie ein Spinnennetz vor!** 🕸️

Jedes Mal wenn du etwas lernst, ist das wie ein neuer Faden im Netz.

Wenn jemand dir etwas Neues erzählt und du hast schon einen Faden dazu –
dann kannst du das Neue einfach dranhängen! Easy! ✨

Aber wenn du KEINEN Faden hast?
Dann ist es wie wenn eine Fliege am Netz vorbeifliegt – sie bleibt nicht hängen! 🪰

**Das Geheimnis:** Du musst erst einen Faden haben, dann bleibt alles hängen!`,
    sections: [
      {
        title: "Die Geschichte vom Zauberwort ✨",
        content: `Lea hörte im Radio ein komisches Wort: "Meteorologie"

Sie dachte: "Häh? Was soll das sein?" – und vergaß es sofort.

Eine Woche später lernte sie in der Schule über das Wetter.
Die Lehrerin sagte: "Wetter-Forscher heißen Meteorologen!"

Lea dachte: "Aha! Meteor... wie die Sternschnuppen! Und -logie wie bei Zoo-logie!"

Plötzlich hatte sie FÄDEN! Und jetzt vergisst sie das Wort nie mehr.

**Das Geheimnis:** Sobald du einen Faden hast, bleibt alles hängen!`,
        type: 'info'
      },
      {
        title: "Das Geheimnis der Superlerner! 🦸",
        content: `In der Schule lernt man: "Schreib auf, was die Lehrerin sagt!"

Vera Birkenbihl sagt: **Das ist FALSCH!**

Richtig ist: Schreib auf, was DU DENKST!

**Beispiel:**
Die Lehrerin sagt: "Schmetterlinge haben vier Flügel."

❌ Falsch: "Schmetterlinge haben 4 Flügel" aufschreiben
✅ Richtig: "Erinnert mich an den bunten im Garten!" aufschreiben

Warum? Weil DEIN Gedanke der Faden ist, an dem das Neue hängt!`,
        type: 'success'
      },
      {
        title: "Das Faden-Experiment! 🔬",
        content: `Vera Birkenbihl hat dieses Experiment mit tausenden Menschen gemacht!

**So geht's:**
1. Ich sage dir gleich 5 Wörter
2. Du darfst sie NICHT aufschreiben!
3. Du darfst sie dir NICHT merken wollen!
4. Du schreibst nur auf: "Was fällt MIR dazu ein?"

**Beispiel:** Ich sage "Drache" 🐉
Du schreibst: "Feuer, fliegen, Minecraft, cool"
(NICHT das Wort "Drache"!)

**Probier es mit diesen Wörtern:**
🍦 Eiscreme - Was fällt dir ein? Sommer? Lieblingssorte?
🛹 Skateboard - Tricks? Park? YouTube-Videos?
🌈 Regenbogen - Farben? Nach dem Regen? Einhorn?
🚀 Rakete - Weltraum? Silvester? SpaceX?
🦖 Dinosaurier - T-Rex? Jurassic Park? Ausgestorben?`,
        type: 'expander',
        expanded: true
      },
      {
        title: "Dein Gehirn ist ein Spinnennetz! 🕷️",
        content: `Stell dir vor: Jedes Mal wenn du etwas lernst,
kommt ein neuer Faden in dein Netz.

Je MEHR Fäden du hast, desto mehr neue Sachen bleiben hängen!

**Das Problem:**
Manche Kinder haben zu einem Thema NULL Fäden.
Dann ist es wie ein Netz mit riesigen Löchern – alles fällt durch!

**Die Lösung:**
Erst Fäden bauen! Dann lernen!

Wie baut man Fäden? Indem man SELBER Erfahrungen macht!`,
        type: 'expander'
      },
      {
        title: "Birkenbihl-Training im Alltag! 🏋️",
        content: `Du kannst die Faden-Methode ÜBERALL üben!

**Beim Fernsehen:** 📺
- Schau Nachrichten oder eine Sendung
- Schreib auf, was DIR dazu einfällt!
- Nicht was gesagt wird!

**Bei Gesprächen:** 💬
- Wenn jemand etwas erzählt
- Achte auf DEINE Gedanken dazu
- Merkst du, wie dein Gehirn Fäden sucht?

**Beim Lesen:** 📚
- Lies einen Abschnitt
- Halt an: Was fällt MIR dazu ein?
- Das sind deine Fäden!`,
        type: 'expander'
      },
      {
        title: "Fun Fact 🧠",
        content: `Vera Birkenbihl sagte: "Ob etwas leicht oder schwer ist, hat nur damit zu tun, ob du einen Faden hast – nicht wie schlau du bist!"

Das größte Spinnennetz der Welt ist 25 Meter breit! Dein Wissensnetz kann noch viel größer werden! 🕸️`,
        type: 'info'
      }
    ]
  },
  summary: "Du wirst nicht besser, weil du schlau bist. Du wirst besser, weil du FÄDEN baust und nicht aufgibst!"
};

// ============================================
// UNTERSTUFE
// ============================================
const UNTERSTUFE_CONTENT: IslandContent = {
  title: "Das Faden-Prinzip - Dein Gehirn verstehen",
  video: {
    url: "",
    placeholder: true
  },
  explanation: {
    intro: `**Die wichtigste Lern-Erkenntnis überhaupt!** 🎯

Vera Birkenbihl hat etwas Revolutionäres entdeckt:

> "Wir haben in der Schule gelernt: Wenn wir uns was merken wollen,
> aufschreiben. **Das ist FALSCH!**"

Was ist richtig?
- ❌ NICHT aufschreiben was der Lehrer sagt
- ✅ Aufschreiben was DU SELBER denkst!

**Warum?** Dein Gehirn ist wie ein Netz aus Fäden.
Neues Wissen muss an einen bestehenden Faden "andocken".
Ohne Faden? Geht rein, geht raus. Weg.
Mit Faden? Bleibt für immer!`,
    sections: [
      {
        title: "Kennst du das: Blackout? 🧠❌",
        content: `Du hast gelernt. Echt gelernt! Abends vor der Arbeit alles durchgelesen.

Dann sitzt du in der Klassenarbeit und... **nichts.**
Dein Kopf ist leer. Totaler Blackout.

Später, nach der Arbeit, fällt dir alles wieder ein. Zu spät!

**Warum passiert das?**
Du hattest keinen "Faden"! Du hast nur gelesen, was im Buch steht.
Aber du hast nicht gedacht: "Was bedeutet das FÜR MICH?"

Ohne eigenen Faden = Das Wissen "hängt" nicht richtig.
Bei Stress? Weg!

**Mit Faden:** Du verbindest neues Wissen mit deinen eigenen Gedanken.
Das hält. Auch bei Stress!

**Das ist das Faden-Prinzip:** Ohne Faden = Blackout-Gefahr. Mit Faden = bleibt!`,
        type: 'warning'
      },
      {
        title: "Die Anti-Mitschreib-Methode! ✍️",
        content: `Was macht die Schule? "Schreib mit, was der Lehrer sagt!"
Was sagt Birkenbihl? **"Das ist der größte Lernfehler!"**

**Warum ist Mitschreiben schlecht?**
- Du bist im "Kopier-Modus", nicht im "Denk-Modus"
- Dein Gehirn ist nur mit Schreiben beschäftigt
- Der Inhalt geht an dir vorbei!

**Was sollst du stattdessen tun?**
Schreib auf, was DU DENKST, während du zuhörst!

**Beispiel Meeting (Birkenbihl):**
Chef redet über Dienstwagen.
Dir fällt ein: "Dietrich hat damals einen Dienstwagen ergattert!"
→ Du schreibst: "Dietrich"
→ An "Dietrich" hängt ALLES was du brauchst!`,
        type: 'success'
      },
      {
        title: "Das Birkenbihl-Experiment! 🔬",
        content: `Das Original-Experiment aus Birkenbihl's Seminar!

**Die Regeln:**
1. Ich nenne dir 5 Begriffe
2. Du darfst sie NICHT aufschreiben
3. Du darfst sie dir NICHT merken wollen!
4. Du schreibst NUR auf: Was fällt DIR dazu ein?

**Wichtig:** Beobachte dein eigenes Denken!
Was für Bilder tauchen auf? Welche Erinnerungen?

**Probier es mit diesen Wörtern:**
😀 Emoji - Welches benutzt du am meisten?
🚁 Drohne - Videos? Fliegen? Teuer?
🎧 Bluetooth - Kopfhörer? Verbinden?
📺 Streaming - Netflix? YouTube? Serien?
🤖 Algorithmus - TikTok? Vorgeschlagen?

**Fun Fact:** Birkenbihl hat über 30.000 Menschen mit diesem Experiment getestet – und ALLE haben besser erinnert, wenn sie eigene Gedanken notierten! 📊`,
        type: 'expander',
        expanded: true
      },
      {
        title: "Das Wissensnetz-Prinzip",
        content: `Birkenbihl erklärte: Dein Wissen ist wie ein Netz.

**Je dichter das Netz, desto mehr bleibt hängen!**

Stell dir vor:
- Thema, zu dem du VIEL weißt = dichtes Netz
- Thema, zu dem du NICHTS weißt = löchriges Netz

**Beispiel: Fußball** ⚽
Wenn du Fußball-Fan bist, hast du tausend Fäden:
Spieler, Vereine, Regeln, Stadien, eigene Erfahrungen...

Wenn jemand etwas über Fußball erzählt, bleibt ALLES hängen!

**Beispiel: Quantenphysik** ⚛️
Null Fäden? Dann geht es rein und direkt wieder raus!

**Die Lösung:** Erst Fäden bauen, dann lernen!`,
        type: 'expander'
      },
      {
        title: "Die 30-Tage-Birkenbihl-Challenge! 🏆",
        content: `Trainiere 30 Tage lang – und werde zum Faden-Meister!

**Woche 1: Nachrichten-Training**
- 5 Min/Tag Nachrichten schauen
- Eigene Gedanken notieren
- Danach: Was ist hängengeblieben?

**Woche 2: Schul-Training**
- In EINER Stunde: Nur eigene Gedanken notieren
- Vergleiche: Wie viel weißt du?

**Woche 3: Lese-Training**
- Bei jedem Text: Gedanken-Spalte!
- Links: Stichworte | Rechts: Eigene Gedanken

**Woche 4: Meister-Level**
- Kombiniere alles!
- Erkläre es einem Freund!

**Nach 30 Tagen wird die Faden-Methode automatisch – dein Gehirn macht es ohne nachzudenken!** 🧠`,
        type: 'expander'
      },
      {
        title: "Fun Fact",
        content: `Birkenbihl nannte das "Zuhören mit dem ganzen Gehirn" – nicht nur mit den Ohren! 👂🧠

Sie übte jeden Tag beim Nachrichten-Schauen – bis zu ihrem Tod mit 65 Jahren! 📺`,
        type: 'info'
      }
    ]
  },
  summary: "Dein Gehirn glaubt, was du ihm oft genug sagst. Notiere deine EIGENEN Gedanken – dann bleibt alles hängen!"
};

// ============================================
// MITTELSTUFE
// ============================================
const MITTELSTUFE_CONTENT: IslandContent = {
  title: "Das Faden-Prinzip - Die Wissenschaft dahinter",
  video: {
    url: "",
    placeholder: true
  },
  explanation: {
    intro: `**Das Faden-Prinzip: Warum Lernen manchmal "schwer" scheint**

Vera F. Birkenbihl revolutionierte unser Verständnis vom Lernen:

> "Ob etwas leicht oder schwer ist, hat NUR damit zu tun,
> ob Sie einen Faden haben. Es hat NICHTS mit Intelligenz zu tun!"

**Das Modell:**
- Dein Gehirn = Wissensnetz aus verbundenen Fäden
- Neues Wissen = muss an bestehenden Faden "andocken"
- Kein Faden da = Information "prallt ab"
- Faden vorhanden = Information "hängt sich dran"

**Die Konsequenz:**
Bevor du etwas Neues lernst, finde deinen FADEN!
Frag dich: "Was weiß ich SCHON darüber? Was fällt mir dazu ein?"

So aktivierst du dein bestehendes Netz – und das Neue kann andocken.`,
    sections: [
      {
        title: "Bulimielernen – Kennst du das? 🤮📚",
        content: `Sei ehrlich: Hast du schon mal so gelernt?

1. Klausur morgen → Panik
2. Abends alles "reinprügeln"
3. In der Klausur "auskotzen"
4. Eine Woche später: Alles vergessen

Das nennt man **Bulimielernen**. Rein, raus, weg.

**Warum funktioniert das nicht?**
Du hast keine eigenen Fäden geknüpft!
Du hast nur fremde Informationen kurz "geparkt" – ohne sie mit DEINEN Gedanken zu verbinden.

**Das Faden-Prinzip ist das Gegenteil:**
- Du fragst: "Was bedeutet das für MICH?"
- Du notierst DEINE Assoziationen
- Du baust DEIN Netz

**Ergebnis:** Das Wissen bleibt. Nicht nur bis zur Klausur – für immer.

Ab jetzt wirst du das Wort "Bulimielernen" überall hören. Weil du jetzt einen Faden hast.`,
        type: 'warning'
      },
      {
        title: "Elaboratives vs. Mechanisches Lernen",
        content: `Vera Birkenbihl unterschied zwei Arten des Notierens:

**1. Mechanisches Mitschreiben** ❌
- Kopieren was gesagt wird
- Gehirn im "Stenografie-Modus"
- Oberflächliche Verarbeitung
- Schnell vergessen!

**2. Elaboratives Notieren** ✅
- Eigene Gedanken festhalten
- Gehirn im "Versteh-Modus"
- Tiefe Verarbeitung
- Dauerhaft gespeichert!

**Die Wissenschaft dahinter:**
Craik & Tulving (1975) zeigten: "Levels of Processing"
Je tiefer die Verarbeitung, desto besser die Erinnerung.

**Eigene Gedanken = tiefste Verarbeitung**
(Persönlicher Bezug, Emotionen, bestehendes Wissen)`,
        type: 'success'
      },
      {
        title: "Das wissenschaftliche Experiment 🔬",
        content: `Birkenbihl's Original-Experiment (30.000+ Teilnehmer!)

**Ablauf:**
1. Du hörst 5 Fachbegriffe
2. Du schreibst NICHT die Begriffe auf!
3. Du notierst NUR: Was fällt MIR dazu ein?
4. Danach prüfen wir: Wie viel erinnerst du?

**Die Erkenntnis:**
Wer seine eigenen Gedanken notiert, erinnert MEHR
als wer versucht, die Wörter auswendig zu lernen!

**Probier es:**
😀 Emoji - Assoziationen notieren!
🚁 Drohne - Deine Bilder, Erinnerungen!
🎧 Bluetooth - Was verbindest DU damit?
📺 Streaming - Persönliche Assoziationen!
🤖 Algorithmus - Egal wie wenig – notiere es!`,
        type: 'expander',
        expanded: true
      },
      {
        title: "Assoziative Netzwerke und Spreading Activation",
        content: `Vera Birkenbihl nutzte das Modell der assoziativen Netzwerke:

**Das Konzept:**
- Wissen ist in Netzwerken organisiert (nicht linear!)
- Jeder Knoten ist mit anderen Knoten verbunden
- Aktivierung "breitet sich aus" (Spreading Activation)

**Die Konsequenz für Lernen:**
- Viele Verbindungen = schnelle Aktivierung = leichtes Lernen
- Wenige Verbindungen = langsame Aktivierung = schweres Lernen

**Birkenbihl's Beispiel "Adipositas":**
Wort ohne Netzwerk = "Klangwolke" (wird nicht verarbeitet)
Wort MIT Netzwerk = sofort erkannt, überall wahrgenommen

**Strategie:**
Vor dem Lernen: Netzwerk AKTIVIEREN oder AUFBAUEN!

**Übung: Spreading Activation Test**
Ich sage ein Wort. Du hast 30 Sekunden.
Schreib ALLES auf, was dir einfällt – auch wenn es "weit weg" scheint!

Beispiel: "Bank"
→ Geld, Sitzen, Park, Sparkasse, Räuber, Tresor, Holz, Fluss...

Siehst du? Von "Bank" (Sitzen) zu "Fluss" (Flussufer) – alles verbunden!`,
        type: 'expander'
      },
      {
        title: "Das Birkenbihl-Tagebuch 📓",
        content: `Führe ein "Faden-Tagebuch" für 2 Wochen:

**Täglich notieren:**
1. Situation (Unterricht/Video/Gespräch)
2. Thema
3. Meine Fäden (was fiel mir ein?)
4. Ergebnis (wie viel behalten?)
5. Reflexion (was hat funktioniert?)

**Wöchentliche Auswertung:**
- Bei welchen Themen hatte ich viele Fäden?
- Wo fehlten Fäden?
- Wie kann ich Fäden aufbauen?

**Tipp:** Birkenbihl empfahl: "Üben Sie bei den Nachrichten!" – Perfektes tägliches Training! 📺`,
        type: 'expander'
      },
      {
        title: "Wissenschaftliche Grundlagen",
        content: `**Birkenbihl's Methoden kombinieren mehrere evidenzbasierte Prinzipien:**

- **Elaborative Rehearsal** (statt Maintenance Rehearsal)
- **Self-Reference Effect** - Information mit Selbstbezug wird besser erinnert
- **Aktivierung von Vorwissen** (Advance Organizers)
- **Metakognition** ("eigenes Denken beobachten")

**Neurobiologische Validierung:**
- Tiefere Verarbeitung durch persönliche Assoziationen
- Aktivierung bestehender neuronaler Netzwerke
- Bessere Enkodierung durch Selbst-Bezug

**Effektstärke:** Elaboration d=0.56 nach Hattie – kombiniert mit Self-Reference Effect noch stärker!

**Fun Fact:** In deinem Gehirn gibt es 86 Milliarden Neuronen mit je 7.000 Verbindungen – das größte Netzwerk im Universum! 🌌`,
        type: 'info'
      }
    ]
  },
  summary: "Das Faden-Prinzip ist das Gegenmittel gegen Bulimielernen. Eigene Assoziationen = tiefe Verarbeitung = stabile Langzeitspeicherung."
};

// ============================================
// EXPORT
// ============================================
export const FAEDEN_CONTENT: Record<AgeGroup, IslandContent> = {
  grundschule: GRUNDSCHULE_CONTENT,
  unterstufe: UNTERSTUFE_CONTENT,
  mittelstufe: MITTELSTUFE_CONTENT,
  oberstufe: MITTELSTUFE_CONTENT, // Fallback
  paedagoge: MITTELSTUFE_CONTENT  // Fallback
};

export type { IslandContent, ContentSection };
