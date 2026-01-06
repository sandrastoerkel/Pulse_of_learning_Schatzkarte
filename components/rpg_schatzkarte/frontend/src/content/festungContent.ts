// ============================================
// Festung der Stärke - Content nach Altersstufen
// Exakt übernommen aus matheff_content.py
// ============================================

import { AgeGroup } from '../types';

export interface ContentSection {
  title: string;
  content: string;
  type?: 'info' | 'success' | 'warning' | 'expander' | 'selfcheck';
  expanded?: boolean;
  selfcheck?: {
    statements: string[];
    results: { range: string; message: string; emoji: string }[];
    conclusion: string;
  };
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
  title: "💪 Mental stark – Für kleine Helden",
  video: {
    url: "https://www.youtube.com/watch?v=-vwiEs8QE2g",
    placeholder: false
  },
  explanation: {
    intro: `Stell dir vor, du stehst vor einer richtig schweren Aufgabe. Vielleicht eine Mathe-Aufgabe, die du noch nie gemacht hast. Oder du sollst zum ersten Mal alleine Fahrrad fahren.

**Was denkst du dann?**

<div class="two-columns">
<div class="column-box error">❌ "Das kann ich sowieso nicht..."</div>
<div class="column-box success">✅ "Das ist schwer, aber ich probier's mal!"</div>
</div>

**Der Unterschied ist RIESIG.**

Wenn du glaubst, dass du etwas schaffen kannst – dann schaffst du es auch viel öfter!

Das nennen Forscher **"Selbstwirksamkeit"**. Ein langes Wort für: *"Ich weiß, dass ich Sachen lernen kann."*`,
    sections: [
      {
        title: "🌟 Die 4 Superhelden-Kräfte (nach Bandura)",
        content: `Ein Forscher, Albert Bandura, hat herausgefunden, wie man diese Superkraft bekommt:`,
        type: 'info'
      },
      {
        title: "🏆 1. Kleine Siege sammeln",
        content: `Jedes Mal wenn du etwas schaffst, wird dein "Ich-schaff-das-Muskel" stärker!

**💡 Tipp:** Mach große Aufgaben klein.
Statt *"Ich lerne alle Malaufgaben"* → *"Heute lerne ich nur die 3er-Reihe."*`,
        type: 'expander',
        expanded: true
      },
      {
        title: "👀 2. Von anderen abgucken (erlaubt!)",
        content: `Wenn dein Freund etwas Schweres schafft, denkst du: *"Hey, wenn der das kann, kann ich das auch!"*

**💡 Tipp:** Such dir jemanden, der auch mal Probleme hatte – und frag, wie er es gelernt hat.`,
        type: 'expander'
      },
      {
        title: "💬 3. Aufmunterung hilft",
        content: `Wenn Mama, Papa oder dein Lehrer sagt *"Du schaffst das!"* – dann glaubst du es auch mehr.

**💡 Tipp:** Du kannst dir das auch selbst sagen! Sag dir: *"Ich probier's einfach mal."*`,
        type: 'expander'
      },
      {
        title: "😌 4. Ruhig bleiben",
        content: `Wenn dein Herz schnell klopft vor einer Aufgabe, denk dran:
Das ist nicht Angst, das ist **AUFREGUNG**! Dein Körper macht sich bereit!

**💡 Tipp:** Atme 3x tief ein und aus. Dann geht's los!`,
        type: 'expander'
      },
      {
        title: "📝 Mein Superhelden-Tagebuch",
        content: `Jeden Tag aufschreiben:

| Was habe ich heute geschafft? | War es schwer? | Wie habe ich mich gefühlt? |
|------------------------------|----------------|---------------------------|
| 3er-Reihe gelernt | Ja! | 💪 Stolz! |
| Aufsatz geschrieben | Mittel | 😊 Zufrieden |`,
        type: 'expander'
      },
      {
        title: "💬 Deine Superhelden-Sätze",
        content: `**Sag dir diese Sätze – sie machen dich stärker:**

🌟 *"Ich lerne noch!"*

🌟 *"Das ist schwer – aber ich probier's!"*

🌟 *"Ich vergleiche mich mit mir von gestern."*

🌟 *"Jeder Fehler bringt mich weiter."*`,
        type: 'success'
      },
      {
        title: "🔬 Was die Forscher herausgefunden haben",
        content: `Ein schlauer Forscher namens **John Hattie** hat sich gefragt: Was hilft Kindern am meisten beim Lernen?

Er hat gaaaaanz viele Studien gelesen (mehr als du Bücher in deiner Schule hast!) und etwas Spannendes entdeckt:

**Kinder, die sich selbst Ziele setzen und dann MEHR schaffen als sie dachten – die werden immer besser und selbstbewusster!**

Das ist wie bei einem Videospiel: Wenn du einen Level schaffst, von dem du dachtest *"Das schaff ich nie!"* – dann traust du dir den nächsten Level auch zu!`,
        type: 'success'
      },
      {
        title: "🎮 Die Hattie-Challenge: Übertreffe dich selbst!",
        content: `**So funktioniert's:**

1. **Vor der Aufgabe:** Schreib auf, wie viele Aufgaben du richtig haben wirst (deine Schätzung)
2. **Mach die Aufgabe**
3. **Danach:** Vergleiche! Hast du MEHR geschafft als du dachtest?

<div class="two-columns">
<div class="column-box success">**Wenn JA:** 🎉 Super! Dein Gehirn merkt sich: *'Ich kann mehr als ich denke!'*</div>
<div class="column-box info">**Wenn NEIN:** 🤔 Kein Problem! Frag dich: *'Was kann ich beim nächsten Mal anders machen?'*</div>
</div>`,
        type: 'info'
      },
      {
        title: "📊 Selbstcheck: Wie ist deine Selbstwirksamkeit?",
        content: `Beantworte ehrlich (1 = stimmt gar nicht, 5 = stimmt total):`,
        type: 'selfcheck',
        selfcheck: {
          statements: [
            "Wenn ich übe, werde ich besser",
            "Auch schwere Aufgaben kann ich lösen, wenn ich dranbleibe",
            "Fehler sind Teil des Lernens",
            "Ich kann mich selbst motivieren"
          ],
          results: [
            { range: "16-20", message: "Du bist auf einem guten Weg!", emoji: "🌟" },
            { range: "11-15", message: "Da geht noch was – nutze die Strategien!", emoji: "💪" },
            { range: "4-10", message: "Kein Problem, aber fang HEUTE an, daran zu arbeiten.", emoji: "🚀" }
          ],
          conclusion: "Dein Gehirn glaubt, was du ihm oft genug sagst. Also sag ihm das Richtige!"
        }
      }
    ]
  },
  summary: "💡 **Das Wichtigste:** Du wirst nicht besser, weil du schlau bist. Du wirst besser, weil du ÜBST und nicht aufgibst!"
};

// ============================================
// UNTERSTUFE
// ============================================
const UNTERSTUFE_CONTENT: IslandContent = {
  title: "💪 Mental stark – Dein Gehirn ist trainierbar",
  video: {
    url: "https://www.youtube.com/watch?v=-vwiEs8QE2g",
    placeholder: false
  },
  explanation: {
    intro: `**🎯 Eine Entdeckung, die alles verändert**`,
    sections: [
      {
        title: "🧠 Neuroplastizität – Dein Gehirn wächst!",
        content: `**Forscher haben etwas Unglaubliches herausgefunden:**

Dein Gehirn funktioniert wie ein Muskel. Je mehr du übst, desto stärker wird es.

Das nennt man **Neuroplastizität** – und es bedeutet:
**Deine Fähigkeiten sind nicht festgelegt. Sie können wachsen.**`,
        type: 'success'
      },
      {
        title: "🔬 Das ist Biologie, keine Floskel",
        content: `Das ist keine Motivation-Floskel – das ist Biologie.
Beim Lernen bilden sich neue Verbindungen zwischen Nervenzellen.
Buchstäblich: **Dein Gehirn baut sich um, wenn du übst.**`,
        type: 'info'
      },
      {
        title: "📊 Was sagt die Wissenschaft?",
        content: `**John Hattie** hat über **80 Millionen Schüler** untersucht (kein Witz!).
Er wollte wissen: Was macht den Unterschied zwischen erfolgreichen und weniger erfolgreichen Schülern?

**Das Ergebnis:**
- Nicht Intelligenz.
- Nicht die Schule.
- Nicht mal die Lehrer (sorry, Lehrer).

**Sondern: Wie du über dich selbst denkst.**

Schüler, die glauben, dass sie eine Aufgabe schaffen können, schaffen sie auch öfter.

Das nennt man **Selbstwirksamkeit** – und die hat eine Effektstärke von **0.63** (alles über 0.40 ist richtig gut!).`,
        type: 'success'
      },
      {
        title: "🏆 1. Echte Erfolgserlebnisse (Die Stärkste!)",
        content: `Nichts überzeugt dein Gehirn mehr als: **Du hast es selbst geschafft.**

**Das Problem:** Wenn eine Aufgabe zu groß ist, gibst du vielleicht auf, bevor du Erfolg hast.

**Die Lösung:** Zerlege große Aufgaben in Mini-Aufgaben.

| ❌ Zu groß | ✅ Mini-Aufgabe |
|-----------|----------------|
| "Ich lerne für die Mathe-Arbeit" | "Ich mache heute 10 Bruch-Aufgaben" |
| "Ich werde besser in Englisch" | "Ich lerne heute 5 Vokabeln" |

**Wichtig:** Schreib auf, was du geschafft hast! Dein Gehirn vergisst Erfolge schneller als Misserfolge.`,
        type: 'expander',
        expanded: true
      },
      {
        title: "👀 2. Von anderen lernen",
        content: `Wenn du siehst, wie jemand **ÄHNLICHES** wie du etwas schafft, denkt dein Gehirn: *"Okay, scheint also möglich zu sein..."*

**⚠️ Achtung:** Es muss jemand sein, der dir ähnlich ist!
Wenn ein Mathe-Genie die Aufgabe löst, hilft dir das nicht.
Aber wenn dein Kumpel, der auch Probleme hatte, es erklärt – das wirkt!

**💡 Tipp:** Frag Klassenkameraden: *"Wie hast du das verstanden?"*`,
        type: 'expander'
      },
      {
        title: "💬 3. Was andere zu dir sagen",
        content: `Wenn Lehrer oder Eltern sagen *"Du schaffst das!"* – hilft das.
**ABER:** Nur wenn du es ihnen glaubst.

**Noch stärker:** Sag es dir selbst.

**Dein neuer innerer Spruch:** "Das ist schwer. Aber schwer heißt nicht unmöglich."`,
        type: 'expander'
      },
      {
        title: "😤 4. Dein Körper-Feeling",
        content: `Schwitzige Hände vor dem Test? Herzklopfen?

**Das ist ein gutes Zeichen!** Dein Körper macht sich bereit.

**Sag dir:**
🚀 *"Ich bin aufgeregt – mein Körper ist bereit!"*
🚀 *"Diese Energie hilft mir, mein Bestes zu geben!"*

**Fun Fact:** Aufregung und Nervosität fühlen sich körperlich fast gleich an. Der Unterschied liegt nur in dem, was du dir sagst!`,
        type: 'expander'
      },
      {
        title: "🎯 Die Hattie-Methode: Erwartungen übertreffen",
        content: `Hattie nennt das **'Student Expectations'** – und es ist eine der stärksten Methoden überhaupt.

**So geht's:**
1. **Vor dem Test/der Aufgabe:** Schätze realistisch: *"Ich werde wahrscheinlich eine 3 bekommen."*
2. **Gib dein Bestes**
3. **Nach dem Ergebnis:** Wenn du BESSER bist als deine Schätzung → **BOOM!** Dein Selbstvertrauen steigt.`,
        type: 'info'
      },
      {
        title: "⚠️ Der Trick",
        content: `Deine Schätzung muss ehrlich sein. Nicht zu niedrig (um sicher zu gehen), nicht zu hoch (um cool zu wirken).`,
        type: 'warning'
      },
      {
        title: "📊 Selbstcheck: Wie ist deine Selbstwirksamkeit?",
        content: `Beantworte ehrlich (1 = stimmt gar nicht, 5 = stimmt total):

| Aussage | 1 | 2 | 3 | 4 | 5 |
|---------|---|---|---|---|---|
| Wenn ich übe, werde ich besser | | | | | |
| Auch schwere Aufgaben kann ich lösen, wenn ich dranbleibe | | | | | |
| Fehler sind Teil des Lernens | | | | | |
| Ich kann mich selbst motivieren | | | | | |

**Auswertung:**
- **16-20:** Du bist auf einem guten Weg!
- **11-15:** Da geht noch was – nutze die Strategien!
- **4-10:** Kein Problem, aber fang HEUTE an, daran zu arbeiten.`,
        type: 'info'
      }
    ]
  },
  summary: "💡 **Das Wichtigste:** Dein Gehirn glaubt, was du ihm oft genug sagst. Also sag ihm das Richtige."
};

// ============================================
// MITTELSTUFE
// ============================================
const MITTELSTUFE_CONTENT: IslandContent = {
  title: "💪 Mental stark – Die Psychologie hinter deinem Erfolg",
  video: {
    url: "https://www.youtube.com/watch?v=-vwiEs8QE2g",
    placeholder: false
  },
  explanation: {
    intro: `**🎯 Warum das hier wichtig ist**

Du stehst vor dem Übertritt, vor Abschlussprüfungen, vor wichtigen Entscheidungen.
Und mal ehrlich: **Der Druck ist real.**

Aber hier ist die Sache: Es geht nicht nur darum, was du KANNST.
Es geht darum, was du **GLAUBST**, dass du kannst.

*Und das ist keine Esoterik – das ist Wissenschaft.*`,
    sections: [
      {
        title: "📊 Die Daten sprechen – weltweit",
        content: `**PISA 2022** ist die weltweit größte Bildungsstudie:
- **690.000 Schüler** getestet
- **81 Länder** – von Singapur bis Finnland, von Brasilien bis Japan
- Repräsentiert **29 Millionen** 15-Jährige weltweit

Forscher haben mit Machine Learning (XGBoost, SHAP) analysiert:
*Was bestimmt den Mathe-Erfolg – überall auf der Welt?*

**Das Ergebnis – und es gilt WELTWEIT:**

**Mathematische Selbstwirksamkeit** ist der stärkste Prädiktor für Mathematikleistung.

✅ In westlichen Ländern (Deutschland, Finnland, Dänemark)
✅ In asiatischen Top-Performern (Singapur, Korea, Japan, Taiwan)
✅ In **ALLEN 81** untersuchten Bildungssystemen

Stärker als der sozioökonomische Hintergrund. Stärker als die Schule. Stärker als wie viel du übst.`,
        type: 'success'
      },
      {
        title: "💡 Was heißt das konkret?",
        content: `Zwei Schüler mit dem GLEICHEN Wissen können völlig unterschiedlich abschneiden –
je nachdem, wie sehr sie an sich glauben.

Und das ist kein kulturelles Artefakt – es ist ein **universelles Prinzip**.`,
        type: 'info'
      },
      {
        title: "🧠 Hattie: Was wirklich funktioniert",
        content: `John Hattie hat in seiner Meta-Analyse (über 1.400 Studien, 300 Millionen Schüler) Folgendes gefunden:

| Faktor | Effektstärke | Was es bedeutet |
|--------|--------------|-----------------|
| Selbstwirksamkeit | 0.63 | Starker Effekt |
| Selbst-Einschätzung | 1.33 | Mega-Effekt |
| Hausaufgaben | 0.29 | Schwacher Effekt |
| Klassengröße | 0.21 | Kaum Effekt |

**Die Kernbotschaft:** Was DU denkst, hat mehr Einfluss als äußere Umstände.`,
        type: 'warning'
      },
      {
        title: "📉 Zum Vergleich: Mathe-Angst (ANXMAT)",
        content: `Die Kehrseite der Selbstwirksamkeit ist **Mathe-Angst** – und auch hier sind die PISA-Daten eindeutig:

- **Ein Punkt mehr** auf dem Angst-Index = **18 Punkte weniger** in Mathe (OECD-Durchschnitt)
- Der Anteil nervöser Schüler ist **gestiegen**: 31% (2012) → 39% (2022)
- In **JEDEM** der 81 Bildungssysteme ist Angst negativ mit Leistung korreliert

**Die gute Nachricht:** Selbstwirksamkeit und Angst hängen zusammen.
Wenn du deine Selbstwirksamkeit stärkst, sinkt automatisch die Angst.`,
        type: 'expander'
      },
      {
        title: "🏆 1. Mastery Experiences (Meisterschaftserfahrungen)",
        content: `> *"Mastery experiences are the most powerful driver of self-efficacy because they provide authentic evidence of whether one can succeed."*

**Übersetzt:** Nichts überzeugt dich so sehr wie dein eigener Erfolg.

**Aber Achtung:** Es müssen ECHTE Herausforderungen sein.
Wenn alles zu leicht ist, lernst du nichts über deine Fähigkeiten.

**Strategie: Progressive Overload**
- Woche 1: 10 einfache Aufgaben
- Woche 2: 10 mittlere Aufgaben
- Woche 3: 5 schwere Aufgaben
- → Du merkst: *"Hey, ich kann das steigern!"*`,
        type: 'expander',
        expanded: true
      },
      {
        title: "👀 2. Vicarious Experiences (Stellvertretende Erfahrungen)",
        content: `> *"Seeing people similar to oneself succeed by sustained effort raises observers' beliefs that they too possess the capabilities."*

**Der Schlüssel:** Die Person muss dir ÄHNLICH sein.
- Ein Mathegenie als Vorbild? ❌ Nicht hilfreich.
- Ein Klassenkamerad, der auch kämpfen musste? ✅ Sehr hilfreich.

**Konkret:**
- Frag Leute, die es geschafft haben: *"Was war dein Weg?"*
- Schau dir YouTube-Tutorials von "normalen" Leuten an, nicht nur von Profis
- Lerngruppen mit unterschiedlichen Levels`,
        type: 'expander'
      },
      {
        title: "💬 3. Verbal Persuasion (Soziale Überzeugung)",
        content: `Ermutigung hilft – **ABER:** Die Person muss glaubwürdig sein.

Wenn dein Mathe-Lehrer sagt *"Du kannst das"* und du weißt, dass er dich kennt, wirkt das.
Wenn jemand Fremdes das sagt, eher nicht.

**Noch wichtiger: Dein Selbstgespräch**

Forschung zeigt: Die Art, wie du mit dir selbst sprichst, beeinflusst deine Leistung messbar.

**Sätze, die dich stärker machen:**
💪 *"Das ist noch eine Herausforderung für mich."*
💪 *"Meine Vorbereitung hat sich ausgezahlt."*
💪 *"Ich werde mein Bestes geben."*
💪 *"Ich kann das lernen, wenn ich dranbleibe."*`,
        type: 'expander'
      },
      {
        title: "😤 4. Physiological & Emotional States",
        content: `Dein Körper sendet Signale. Dein Gehirn interpretiert sie.

**Reframing-Technik:** Herzklopfen und schneller Atem bedeuten:
*"Ich bin aktiviert und bereit!"*

Das ist wissenschaftlich fundiert – körperliche Aktivierung kann Leistung verbessern, wenn du sie positiv interpretierst.

**Praktische Tools:**
- **Box Breathing:** 4 Sek. ein, 4 Sek. halten, 4 Sek. aus, 4 Sek. halten
- **Power Posing:** 2 Min. aufrechte Haltung vor wichtigen Situationen
- **Schlaf:** Deine Selbstwirksamkeit sinkt messbar bei Schlafmangel`,
        type: 'expander'
      },
      {
        title: "🎯 Die Hattie-Strategie: Student Expectations",
        content: `**So funktioniert's:**
1. **Vor der Prüfung:** Schreibe deine realistische Erwartung auf (Note oder Punktzahl)
2. **Lerne mit dem Ziel, diese Erwartung zu übertreffen**
3. **Nach der Prüfung:** Vergleiche Erwartung vs. Ergebnis

**Warum das funktioniert:**

Wenn du ÜBER deiner Erwartung liegst, speichert dein Gehirn: *"Ich kann mehr als ich denke."*

Das ist keine Motivation-Trickserei – das ist, wie dein Selbstbild tatsächlich entsteht.`,
        type: 'success'
      },
      {
        title: "🔍 Fehler-Analyse: Dein Detektiv-Modus",
        content: `**Nach einem Misserfolg:** Werde zum Detektiv und analysiere.

**Deine Analyse-Fragen:**
🔍 *"Welcher Teil war das Problem?"*
🔍 *"Was fehlte mir? Zeit? Wissen? Übung?"*
🔍 *"Was mache ich beim nächsten Mal anders?"*
🔍 *"Welche Strategie könnte besser funktionieren?"*

**Der Trick:** Schreibe Erfolg deiner Anstrengung zu – das motiviert dich weiterzumachen.
Und wenn etwas nicht klappt: Es lag an der Strategie, nicht an dir. Strategien kann man ändern.`,
        type: 'info'
      }
    ]
  },
  summary: "💡 **Das Wichtigste:** Selbstwirksamkeit ist keine fixe Eigenschaft – sie ist **trainierbar wie ein Muskel**. Und die PISA-Daten zeigen: Sie ist der wichtigste Prädiktor für deinen Erfolg."
};

// ============================================
// EXPORT
// ============================================
export const FESTUNG_CONTENT: Record<AgeGroup, IslandContent> = {
  grundschule: GRUNDSCHULE_CONTENT,
  unterstufe: UNTERSTUFE_CONTENT,
  mittelstufe: MITTELSTUFE_CONTENT,
  oberstufe: MITTELSTUFE_CONTENT, // Fallback – kann später erweitert werden
  paedagoge: MITTELSTUFE_CONTENT  // Fallback – kann später erweitert werden
};

export type { IslandContent };
