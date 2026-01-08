// ============================================
// Bandura-Challenge Content
// Aus bandura_sources_widget.py uebernommen
// ============================================

import { BanduraSource } from '../types';

// Type fuer die Source-IDs
export type BanduraSourceId = 'mastery' | 'vicarious' | 'persuasion' | 'physiological';

// Allgemeine Infos ueber die Bandura-Challenge
export const BANDURA_INFO = {
  title: "Der goldene Schlüssel",
  subtitle: "Trainiere deine Selbstwirksamkeit!",
  description: "Albert Bandura fand heraus: Es gibt 4 Wege, wie du deinen Glauben an dich selbst staerken kannst. Waehle eine Quelle und beschreibe deine heutige Erfahrung!",
  xp: {
    all_four_bonus: 25,
    detailed_bonus: 5
  }
};

export const BANDURA_SOURCES: Record<BanduraSourceId, BanduraSource> = {
  mastery: {
    id: "mastery",
    name_de: "Eigener Erfolg",
    icon: "🏆",
    color: "#4CAF50",
    prompt: "Was hast du heute geschafft, worauf du stolz bist?",
    examples: [
      "Eine schwierige Mathe-Aufgabe geloest",
      "Einen Text fehlerfrei vorgelesen",
      "Etwas Neues verstanden",
      "Eine Praesentation gehalten"
    ],
    xp: 15
  },
  vicarious: {
    id: "vicarious",
    name_de: "Vorbild-Lernen",
    icon: "👀",
    color: "#2196F3",
    prompt: "Von wem hast du heute gelernt oder wer hat dich inspiriert?",
    examples: [
      "Ein Mitschueler hat eine gute Loesung erklaert",
      "Jemand hat trotz Schwierigkeiten nicht aufgegeben",
      "Ein Video gesehen, das mir etwas beigebracht hat",
      "Ein Vorbild gefunden, das aehnliche Herausforderungen hatte"
    ],
    xp: 12
  },
  persuasion: {
    id: "persuasion",
    name_de: "Ermutigung",
    icon: "💬",
    color: "#9C27B0",
    prompt: "Welche ermutigenden Worte hast du bekommen oder gegeben?",
    examples: [
      "Jemand hat gesagt, dass ich das schaffen kann",
      "Positives Feedback von einem Lehrer",
      "Ich habe jemand anderen ermutigt",
      "Ein Kompliment fuer meine Arbeit bekommen"
    ],
    xp: 10
  },
  physiological: {
    id: "physiological",
    name_de: "Koerper-Management",
    icon: "🧘",
    color: "#FF9800",
    prompt: "Wie hast du heute mit Stress oder Nervositaet umgegangen?",
    examples: [
      "Tief durchgeatmet vor einer Pruefung",
      "Aufregung als positive Energie genutzt",
      "Pause gemacht, als ich frustriert war",
      "Sport/Bewegung zum Stressabbau gemacht"
    ],
    xp: 12
  }
};

// XP Konfiguration
export const BANDURA_XP_CONFIG = {
  base_entry: 10,
  all_four_today: 25,  // Bonus wenn alle 4 Quellen an einem Tag
  detailed_reflection: 5  // Bonus fuer ausfuehrliche Reflexion (>50 Zeichen)
};

// Wissenschaftlicher Hintergrund
export const BANDURA_SCIENCE = {
  title: "Die Wissenschaft dahinter",
  content: `**Albert Bandura (1977)** identifizierte 4 Hauptquellen der Selbstwirksamkeit:

**🏆 Mastery Experiences** (Eigene Erfolge)
Der STAERKSTE Weg! Wenn du selbst erlebst, dass du etwas schaffst, glaubt dein Gehirn am meisten daran.
"Ich habe es geschafft, also kann ich es wieder schaffen."

**👀 Vicarious Experiences** (Vorbild-Lernen)
Wenn du siehst, dass ANDERE wie du es schaffen, denkst du: "Wenn die das koennen, kann ich das auch!"
Wichtig: Das Vorbild sollte dir aehnlich sein (Alter, Situation).

**💬 Social Persuasion** (Ermutigung)
Wenn Menschen, denen du vertraust, sagen "Du schaffst das!" - hilft das! Aber nur von glaubwuerdigen Personen.
Auch SELBST andere ermutigen staerkt dich!

**🧘 Physiological States** (Koerper-Management)
Aufregung kann als "Ich bin bereit!" interpretiert werden statt als "Ich habe Angst."
Tiefes Atmen, Bewegung, genug Schlaf - alles hilft!

**Tipp:** Mastery ist am staerksten, aber alle 4 zusammen sind unschlagbar!`
};
