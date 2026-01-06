// ============================================
// Festung der Staerke - Content nach Altersstufen
// Direkt aus matheff_content.py uebernommen
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
  title: "Mental stark - Fuer kleine Helden",
  video: {
    url: "",
    placeholder: true
  },
  explanation: {
    intro: `Stell dir vor, du stehst vor einer richtig schweren Aufgabe. Vielleicht eine Mathe-Aufgabe, die du noch nie gemacht hast. Oder du sollst zum ersten Mal alleine Fahrrad fahren.

**Was denkst du dann?**`,
    sections: [
      {
        title: "Was ist das eigentlich?",
        content: `Wenn du glaubst, dass du etwas schaffen kannst - dann schaffst du es auch viel oefter!

Das nennen Forscher **"Selbstwirksamkeit"**. Ein langes Wort fuer: *"Ich weiss, dass ich Sachen lernen kann."*`,
        type: 'info'
      },
      {
        title: "Was die Forscher herausgefunden haben",
        content: `Ein schlauer Forscher namens **John Hattie** hat sich gefragt: Was hilft Kindern am meisten beim Lernen?

Er hat gaaaaanz viele Studien gelesen (mehr als du Buecher in deiner Schule hast!) und etwas Spannendes entdeckt:

**Kinder, die sich selbst Ziele setzen und dann MEHR schaffen als sie dachten - die werden immer besser und selbstbewusster!**

Das ist wie bei einem Videospiel: Wenn du einen Level schaffst, von dem du dachtest *"Das schaff ich nie!"* - dann traust du dir den naechsten Level auch zu!`,
        type: 'success'
      },
      {
        title: "1. Kleine Siege sammeln",
        content: `Jedes Mal wenn du etwas schaffst, wird dein "Ich-schaff-das-Muskel" staerker!

**Tipp:** Mach grosse Aufgaben klein.
Statt *"Ich lerne alle Malaufgaben"* -> *"Heute lerne ich nur die 3er-Reihe."*`,
        type: 'expander',
        expanded: true
      },
      {
        title: "2. Von anderen abgucken (erlaubt!)",
        content: `Wenn dein Freund etwas Schweres schafft, denkst du: *"Hey, wenn der das kann, kann ich das auch!"*

**Tipp:** Such dir jemanden, der auch mal Probleme hatte - und frag, wie er es gelernt hat.`,
        type: 'expander'
      },
      {
        title: "3. Aufmunterung hilft",
        content: `Wenn Mama, Papa oder dein Lehrer sagt *"Du schaffst das!"* - dann glaubst du es auch mehr.

**Tipp:** Du kannst dir das auch selbst sagen! Sag dir: *"Ich probier's einfach mal."*`,
        type: 'expander'
      },
      {
        title: "4. Ruhig bleiben",
        content: `Wenn dein Herz schnell klopft vor einer Aufgabe, denk dran:
Das ist nicht Angst, das ist **AUFREGUNG**! Dein Koerper macht sich bereit!

**Tipp:** Atme 3x tief ein und aus. Dann geht's los!`,
        type: 'expander'
      },
      {
        title: "Deine Superhelden-Saetze",
        content: `**Sag dir diese Saetze - sie machen dich staerker:**

- *"Ich lerne noch!"*
- *"Das ist schwer - aber ich probier's!"*
- *"Ich vergleiche mich mit mir von gestern."*
- *"Jeder Fehler bringt mich weiter."*`,
        type: 'success'
      }
    ]
  },
  summary: "Du wirst nicht besser, weil du schlau bist. Du wirst besser, weil du UEBST und nicht aufgibst!"
};

// ============================================
// UNTERSTUFE
// ============================================
const UNTERSTUFE_CONTENT: IslandContent = {
  title: "Mental stark - Dein Gehirn ist trainierbar",
  video: {
    url: "",
    placeholder: true
  },
  explanation: {
    intro: `**Forscher haben etwas Unglaubliches herausgefunden:**

Dein Gehirn funktioniert wie ein Muskel. Je mehr du uebst, desto staerker wird es.

Das nennt man **Neuroplastizitaet** - und es bedeutet:
**Deine Faehigkeiten sind nicht festgelegt. Sie koennen wachsen.**

Das ist keine Motivation-Floskel - das ist Biologie. Beim Lernen bilden sich neue Verbindungen zwischen Nervenzellen. Buchstaeblich: **Dein Gehirn baut sich um, wenn du uebst.**`,
    sections: [
      {
        title: "Was sagt die Wissenschaft?",
        content: `**John Hattie** hat ueber **80 Millionen Schueler** untersucht (kein Witz!).
Er wollte wissen: Was macht den Unterschied zwischen erfolgreichen und weniger erfolgreichen Schuelern?

**Das Ergebnis:**
- Nicht Intelligenz.
- Nicht die Schule.
- Nicht mal die Lehrer (sorry, Lehrer).

**Sondern: Wie du ueber dich selbst denkst.**

Schueler, die glauben, dass sie eine Aufgabe schaffen koennen, schaffen sie auch oefter.

Das nennt man **Selbstwirksamkeit** - und die hat eine Effektstaerke von **0.63** (alles ueber 0.40 ist richtig gut!).`,
        type: 'success'
      },
      {
        title: "1. Echte Erfolgserlebnisse (Die Staerkste!)",
        content: `Nichts ueberzeugt dein Gehirn mehr als: **Du hast es selbst geschafft.**

**Das Problem:** Wenn eine Aufgabe zu gross ist, gibst du vielleicht auf, bevor du Erfolg hast.

**Die Loesung:** Zerlege grosse Aufgaben in Mini-Aufgaben.

| Zu gross | Mini-Aufgabe |
|-----------|----------------|
| "Ich lerne fuer die Mathe-Arbeit" | "Ich mache heute 10 Bruch-Aufgaben" |
| "Ich werde besser in Englisch" | "Ich lerne heute 5 Vokabeln" |

**Wichtig:** Schreib auf, was du geschafft hast! Dein Gehirn vergisst Erfolge schneller als Misserfolge.`,
        type: 'expander',
        expanded: true
      },
      {
        title: "2. Von anderen lernen",
        content: `Wenn du siehst, wie jemand **AEHNLICHES** wie du etwas schafft, denkt dein Gehirn: *"Okay, scheint also moeglich zu sein..."*

**Achtung:** Es muss jemand sein, der dir aehnlich ist! Wenn ein Mathe-Genie die Aufgabe loest, hilft dir das nicht.
Aber wenn dein Kumpel, der auch Probleme hatte, es erklaert - das wirkt!

**Tipp:** Frag Klassenkameraden: *"Wie hast du das verstanden?"*`,
        type: 'expander'
      },
      {
        title: "3. Was andere zu dir sagen",
        content: `Wenn Lehrer oder Eltern sagen *"Du schaffst das!"* - hilft das. **ABER:** Nur wenn du es ihnen glaubst.

**Noch staerker:** Sag es dir selbst.

**Dein neuer innerer Spruch:** "Das ist schwer. Aber schwer heisst nicht unmoeglich."`,
        type: 'expander'
      },
      {
        title: "4. Dein Koerper-Feeling",
        content: `Schwitzige Haende vor dem Test? Herzklopfen? **Das ist ein gutes Zeichen!** Dein Koerper macht sich bereit.

**Sag dir:**
- *"Ich bin aufgeregt - mein Koerper ist bereit!"*
- *"Diese Energie hilft mir, mein Bestes zu geben!"*

**Fun Fact:** Aufregung und Nervositaet fuehlen sich koerperlich fast gleich an. Der Unterschied liegt nur in dem, was du dir sagst!`,
        type: 'expander'
      },
      {
        title: "Die Hattie-Methode: Erwartungen uebertreffen",
        content: `Hattie nennt das **'Student Expectations'** - und es ist eine der staerksten Methoden ueberhaupt.

**So geht's:**
1. **Vor dem Test/der Aufgabe:** Schaetze realistisch: *"Ich werde wahrscheinlich eine 3 bekommen."*
2. **Gib dein Bestes**
3. **Nach dem Ergebnis:** Wenn du BESSER bist als deine Schaetzung -> **BOOM!** Dein Selbstvertrauen steigt.

**Der Trick:** Deine Schaetzung muss ehrlich sein. Nicht zu niedrig (um sicher zu gehen), nicht zu hoch (um cool zu wirken).`,
        type: 'info'
      }
    ]
  },
  summary: "Dein Gehirn glaubt, was du ihm oft genug sagst. Also sag ihm das Richtige."
};

// ============================================
// MITTELSTUFE
// ============================================
const MITTELSTUFE_CONTENT: IslandContent = {
  title: "Mental stark - Die Psychologie hinter deinem Erfolg",
  video: {
    url: "",
    placeholder: true
  },
  explanation: {
    intro: `Du stehst vor dem Uebertritt, vor Abschlusspruefungen, vor wichtigen Entscheidungen.
Und mal ehrlich: **Der Druck ist real.**

Aber hier ist die Sache: Es geht nicht nur darum, was du KANNST.
Es geht darum, was du **GLAUBST**, dass du kannst.

*Und das ist keine Esoterik - das ist Wissenschaft.*`,
    sections: [
      {
        title: "Die Daten sprechen - weltweit",
        content: `**PISA 2022** ist die weltweit groesste Bildungsstudie:
- **690.000 Schueler** getestet
- **81 Laender** - von Singapur bis Finnland, von Brasilien bis Japan
- Repraesentiert **29 Millionen** 15-Jaehrige weltweit

Forscher haben mit Machine Learning (XGBoost, SHAP) analysiert:
*Was bestimmt den Mathe-Erfolg - ueberall auf der Welt?*

**Das Ergebnis - und es gilt WELTWEIT:**

**Mathematische Selbstwirksamkeit** ist der staerkste Praediktor fuer Mathematikleistung.

- In westlichen Laendern (Deutschland, Finnland, Daenemark)
- In asiatischen Top-Performern (Singapur, Korea, Japan, Taiwan)
- In **ALLEN 81** untersuchten Bildungssystemen

Staerker als der soziooekonomische Hintergrund. Staerker als die Schule. Staerker als wie viel du uebst.`,
        type: 'success'
      },
      {
        title: "Was heisst das konkret?",
        content: `Zwei Schueler mit dem GLEICHEN Wissen koennen voellig unterschiedlich abschneiden -
je nachdem, wie sehr sie an sich glauben.

Und das ist kein kulturelles Artefakt - es ist ein **universelles Prinzip**.`,
        type: 'info'
      },
      {
        title: "Hattie: Was wirklich funktioniert",
        content: `John Hattie hat in seiner Meta-Analyse (ueber 1.400 Studien, 300 Millionen Schueler) Folgendes gefunden:

| Faktor | Effektstaerke | Was es bedeutet |
|--------|--------------|-----------------|
| Selbstwirksamkeit | 0.63 | Starker Effekt |
| Selbst-Einschaetzung | 1.33 | Mega-Effekt |
| Hausaufgaben | 0.29 | Schwacher Effekt |
| Klassengroesse | 0.21 | Kaum Effekt |

**Die Kernbotschaft:** Was DU denkst, hat mehr Einfluss als aeussere Umstaende.`,
        type: 'warning'
      },
      {
        title: "1. Mastery Experiences (Meisterschaftserfahrungen)",
        content: `> *"Mastery experiences are the most powerful driver of self-efficacy because they provide authentic evidence of whether one can succeed."*

**Uebersetzt:** Nichts ueberzeugt dich so sehr wie dein eigener Erfolg.

**Aber Achtung:** Es muessen ECHTE Herausforderungen sein. Wenn alles zu leicht ist, lernst du nichts ueber deine Faehigkeiten.

**Strategie: Progressive Overload**
- Woche 1: 10 einfache Aufgaben
- Woche 2: 10 mittlere Aufgaben
- Woche 3: 5 schwere Aufgaben
- -> Du merkst: *"Hey, ich kann das steigern!"*`,
        type: 'expander',
        expanded: true
      },
      {
        title: "2. Vicarious Experiences (Stellvertretende Erfahrungen)",
        content: `> *"Seeing people similar to oneself succeed by sustained effort raises observers' beliefs that they too possess the capabilities."*

**Der Schluessel:** Die Person muss dir AEHNLICH sein.
- Ein Mathegenie als Vorbild? Nicht hilfreich.
- Ein Klassenkamerad, der auch kaempfen musste? Sehr hilfreich.

**Konkret:**
- Frag Leute, die es geschafft haben: *"Was war dein Weg?"*
- Schau dir YouTube-Tutorials von "normalen" Leuten an, nicht nur von Profis
- Lerngruppen mit unterschiedlichen Levels`,
        type: 'expander'
      },
      {
        title: "3. Verbal Persuasion (Soziale Ueberzeugung)",
        content: `Ermutigung hilft - **ABER:** Die Person muss glaubwuerdig sein.

Wenn dein Mathe-Lehrer sagt *"Du kannst das"* und du weisst, dass er dich kennt, wirkt das.
Wenn jemand Fremdes das sagt, eher nicht.

**Noch wichtiger: Dein Selbstgespraech**

Forschung zeigt: Die Art, wie du mit dir selbst sprichst, beeinflusst deine Leistung messbar.

**Saetze, die dich staerker machen:**
- *"Das ist noch eine Herausforderung fuer mich."*
- *"Meine Vorbereitung hat sich ausgezahlt."*
- *"Ich werde mein Bestes geben."*
- *"Ich kann das lernen, wenn ich dranbleibe."*`,
        type: 'expander'
      },
      {
        title: "4. Physiological & Emotional States",
        content: `Dein Koerper sendet Signale. Dein Gehirn interpretiert sie.

**Reframing-Technik:** Herzklopfen und schneller Atem bedeuten:
*"Ich bin aktiviert und bereit!"*

Das ist wissenschaftlich fundiert - koerperliche Aktivierung kann Leistung verbessern, wenn du sie positiv interpretierst.

**Praktische Tools:**
- **Box Breathing:** 4 Sek. ein, 4 Sek. halten, 4 Sek. aus, 4 Sek. halten
- **Power Posing:** 2 Min. aufrechte Haltung vor wichtigen Situationen
- **Schlaf:** Deine Selbstwirksamkeit sinkt messbar bei Schlafmangel`,
        type: 'expander'
      },
      {
        title: "Fehler-Analyse: Dein Detektiv-Modus",
        content: `**Nach einem Misserfolg:** Werde zum Detektiv und analysiere.

**Deine Analyse-Fragen:**
- *"Welcher Teil war das Problem?"*
- *"Was fehlte mir? Zeit? Wissen? Uebung?"*
- *"Was mache ich beim naechsten Mal anders?"*
- *"Welche Strategie koennte besser funktionieren?"*

**Der Trick:** Schreibe Erfolg deiner Anstrengung zu - das motiviert dich weiterzumachen.
Und wenn etwas nicht klappt: Es lag an der Strategie, nicht an dir. Strategien kann man aendern.`,
        type: 'info'
      }
    ]
  },
  summary: "Selbstwirksamkeit ist keine fixe Eigenschaft - sie ist **trainierbar wie ein Muskel**. Und die PISA-Daten zeigen: Sie ist der wichtigste Praediktor fuer deinen Erfolg."
};

// ============================================
// EXPORT
// ============================================
export const FESTUNG_CONTENT: Record<AgeGroup, IslandContent> = {
  grundschule: GRUNDSCHULE_CONTENT,
  unterstufe: UNTERSTUFE_CONTENT,
  mittelstufe: MITTELSTUFE_CONTENT,
  oberstufe: MITTELSTUFE_CONTENT, // Fallback - kann spaeter erweitert werden
  paedagoge: MITTELSTUFE_CONTENT  // Fallback - kann spaeter erweitert werden
};

export type { IslandContent, ContentSection };
