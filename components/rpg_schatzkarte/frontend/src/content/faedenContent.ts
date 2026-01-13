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
    intro: `**Stell dir dein Gehirn vor wie ein Freundschaftsband, das du knüpfst!** 🧶

Jedes Mal wenn du etwas lernst, ist das wie ein neuer Faden, den du einwebst.

Wenn jemand dir etwas Neues erzählt und du hast schon einen Faden dazu –
dann kannst du das Neue einfach dranknüpfen! Easy! ✨

Aber wenn du KEINEN Faden hast?
Dann ist es wie ein loses Stück Wolle – es fällt einfach runter! 🧵

**Das Geheimnis:** Du musst erst einen Faden haben, dann hält alles zusammen!`,
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
        title: "Dein Wissen ist wie ein Freundschaftsband! 🧶",
        content: `Hast du schon mal ein **Freundschaftsband** geknüpft?
Oder kennst du das **Straßennetz** in deiner Stadt?

**🧶 Wie ein Freundschaftsband:**
Jeder neue Faden, den du dazuknüpfst, macht das Band stärker!
Am Anfang hast du nur einen dünnen Faden – aber je mehr du knüpfst, desto bunter und stabiler wird es!

Genauso ist es mit deinem Wissen: Jede neue Sache, die du lernst, ist ein neuer Faden, den du an die anderen knüpfst!

**🛣️ Wie ein Straßennetz:**
Stell dir eine Stadt vor. Die Straßen verbinden alle Orte miteinander.
Wenn du von der Schule zum Spielplatz willst, nimmst du eine Straße.
Wenn eine Straße fehlt? Dann kommst du nicht hin!

Dein Gehirn funktioniert genauso: Je mehr "Straßen" du baust, desto schneller findest du alles!

**Das Problem:**
Manche Kinder haben zu einem Thema NULL Fäden – wie ein Armband ohne Knoten oder eine Stadt ohne Straßen. Dann fällt alles auseinander!

**Die Lösung:**
Erst Fäden knüpfen! Erst Straßen bauen! DANN lernen!

Wie? Indem du SELBER nachdenkst: "Was kenne ich schon dazu?"`,
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

Wusstest du? Das längste Freundschaftsband der Welt ist über 2 Kilometer lang! 🧶 Und das größte Straßennetz (in den USA) hat über 6 Millionen Kilometer! 🛣️ Dein Wissensnetz kann noch viel größer werden!`,
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

**Beispiel aus dem Unterricht:**
Der Lehrer erklärt die Römer und sagt: "Die Römer haben Straßen gebaut."
Dir fällt ein: "Assassin's Creed! Da laufe ich immer durch Rom!"
→ Du schreibst: "AC Rom"
→ An "AC Rom" hängt ALLES was du über römische Straßen brauchst!`,
        type: 'success'
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
