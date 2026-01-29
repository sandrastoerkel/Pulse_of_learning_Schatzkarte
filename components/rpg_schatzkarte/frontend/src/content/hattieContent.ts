// ============================================
// Hattie-Challenge Content
// Aus hattie_challenge_widget.py uebernommen
// ============================================

// Hattie Challenge Erklaerung
export const HATTIE_CHALLENGE_INFO = {
  title: "Selbsteinschätzung",
  subtitle: "Trainiere deine Fähigkeit, dich selbst einzuschätzen",
  description: `John Hattie fand heraus: **Selbst-Einschaetzung** hat eine Effektstaerke von **1.33** -
das ist einer der staerksten Lernfaktoren ueberhaupt!

**So funktioniert's:**
1. Waehle ein Fach und eine Aufgabe
2. Schaetze VORHER: Wie gut wirst du abschneiden? (Punkte/Note)
3. Mach die Aufgabe und trag das echte Ergebnis ein
4. Vergleiche: Warst du besser als erwartet?

**Warum das funktioniert:**
Wenn du BESSER bist als deine Schaetzung, speichert dein Gehirn:
*"Ich kann mehr als ich denke!"*

Das staerkt deine Selbstwirksamkeit nachhhaltig.`,

  steps: [
    {
      step: 1,
      title: "Fach waehlen",
      icon: "📚",
      description: "Waehle das Fach, in dem du dich testen willst"
    },
    {
      step: 2,
      title: "Aufgabe definieren",
      icon: "📝",
      description: "Beschreibe die Aufgabe (z.B. '10 Mathe-Aufgaben', 'Diktat', 'Vokabeltest')"
    },
    {
      step: 3,
      title: "Schaetzen",
      icon: "🎯",
      description: "Wie viele Punkte/welche Note erwartest du? Sei ehrlich!"
    },
    {
      step: 4,
      title: "Ergebnis eintragen",
      icon: "✅",
      description: "Nach der Aufgabe: Trag dein echtes Ergebnis ein"
    },
    {
      step: 5,
      title: "Reflektieren",
      icon: "🔄",
      description: "Warst du besser oder schlechter als erwartet? Warum?"
    }
  ],

  xp: {
    entry: 15,
    exceeded: 25,  // Bonus wenn Ergebnis > Erwartung
    streak_3: 10,
    streak_7: 25
  }
};

// Beispiel-Faecher
export const HATTIE_SUBJECTS = [
  { id: "mathe", name: "Mathematik", icon: "🔢" },
  { id: "deutsch", name: "Deutsch", icon: "📖" },
  { id: "englisch", name: "Englisch", icon: "🇬🇧" },
  { id: "naturwissenschaften", name: "Naturwissenschaften", icon: "🔬" },
  { id: "andere", name: "Andere", icon: "📚" }
];

// Wissenschaftlicher Hintergrund
export const HATTIE_SCIENCE = {
  title: "Die Forschung dahinter",
  content: `**John Hattie** ist einer der einflussreichsten Bildungsforscher weltweit.

In seiner Meta-Studie "Visible Learning" analysierte er ueber **1.400 Meta-Analysen**
und **300 Millionen Schueler** - die groesste Datensammlung ueber erfolgreiches Lernen.

**Die wichtigsten Erkenntnisse:**

| Faktor | Effektstaerke |
|--------|--------------|
| Selbst-Einschaetzung | 1.33 |
| Selbstwirksamkeit | 0.63 |
| Feedback | 0.70 |
| Hausaufgaben | 0.29 |

**Was bedeutet die Effektstaerke?**
- 0.40 = ein normales Schuljahr Lernfortschritt (der "Umschlagpunkt")
- Ueber 0.60 = exzellenter Effekt (mehr als ein Schuljahr!)
- Ueber 1.00 = aussergewoehnlich starke Wirkung

Die Selbst-Einschaetzung mit **1.33** ist damit einer der staerksten Faktoren!

**Warum?** Wenn du lernst, dich realistisch einzuschaetzen, kannst du:
1. Besser planen, was du noch lernen musst
2. Deine Erfolge bewusster wahrnehmen
3. Aus Fehleinschaetzungen lernen`
};
