// ============================================
// Lernbegleiter - Kontextbezogene Tipps
// ============================================
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CompanionType } from '../types';
import { getCompanionImage, getCompanionInfo } from './CompanionSelector';

// Kontext-Typen für verschiedene Situationen
export type LernkonText =
  | 'map'           // Auf der Weltkarte
  | 'island_start'  // Starthafen
  | 'island_festung'
  | 'island_werkzeuge'
  | 'island_bruecken'
  | 'island_faeden'
  | 'island_spiegel_see'
  | 'island_vulkan'
  | 'island_ruhe_oase'
  | 'island_ausdauer_gipfel'
  | 'island_fokus_leuchtturm'
  | 'island_wachstum_garten'
  | 'island_lehrer_turm'
  | 'island_wohlfuehl_dorf'
  | 'island_schutz_burg'
  | 'island_meister_berg'
  | 'quiz'          // Während eines Quiz
  | 'quiz_correct'  // Nach richtiger Antwort
  | 'quiz_wrong'    // Nach falscher Antwort
  | 'challenge'     // Während einer Challenge
  | 'video'         // Video anschauen
  | 'bandura'       // Goldener Schlüssel
  | 'hattie'        // Selbsteinschätzung
  | 'polarstern'    // Ziele setzen
  | 'success'       // Nach Erfolg
  | 'welcome';      // Erste Begrüßung

// Tipps pro Kontext (mehrere zur Auswahl)
const TIPPS: Record<LernkonText, string[]> = {
  map: [
    "Klick auf eine Insel, um dein nächstes Abenteuer zu starten!",
    "Die goldenen Sterne zeigen abgeschlossene Quests - sammle sie alle!",
    "Jede Insel hat ein besonderes Thema, das dir beim Lernen hilft.",
    "Folge dem Pfad von Insel zu Insel - so lernst du Schritt für Schritt!",
    "Die Schiffe im Meer haben besondere Challenges für dich!",
  ],
  island_start: [
    "Willkommen im Basis-Camp! Hier beginnt deine Lernreise.",
    "Wähle deinen Lernbegleiter - ich bin für dich da!",
    "Das Basis-Camp ist dein sicherer Ort - komm jederzeit zurück!",
    "Setze dir ein Ziel mit dem Polarstern - wohin soll die Reise gehen?",
  ],
  island_festung: [
    "Selbstwirksamkeit = Glaube an deine Fähigkeit, eine Aufgabe zu schaffen!",
    "Kleine Erfolge sammeln: Jeder kleine Sieg stärkt dein Selbstvertrauen!",
    "Vorbilder zeigen dir: Wenn die das können, kann ich das auch!",
    "Ermutigung von anderen gibt dir Kraft - und du kannst sie dir holen!",
    "Achte auf deinen Körper: Ruhiger Atem = klarer Kopf!",
  ],
  island_werkzeuge: [
    "Hier lernst du die 7 Power-Techniken der Überflieger!",
    "Active Recall: Nicht nochmal lesen - dich selbst abfragen!",
    "Spaced Repetition: Verteile dein Lernen über mehrere Tage!",
    "Elaboration: Erkläre den Stoff mit deinen eigenen Worten!",
    "Dual Coding: Kombiniere Text mit Bildern oder Skizzen!",
    "Interleaving: Mische verschiedene Themen beim Lernen!",
    "Concrete Examples: Finde eigene Beispiele für abstrakte Konzepte!",
    "Die Pomodoro-Technik: 25 Min fokussiert lernen, 5 Min Pause!",
  ],
  island_bruecken: [
    "Transferlernen bedeutet: Wissen von einem Bereich auf einen anderen übertragen.",
    "Wenn du etwas Neues lernst, frag dich: Wo kenne ich das schon?",
    "Brücken bauen zwischen Themen macht dich zum Super-Lerner!",
  ],
  island_faeden: [
    "Alles hängt zusammen - wie Fäden in einem Netz!",
    "Verbinde neue Infos mit dem, was du schon weißt.",
    "Je mehr Verbindungen, desto besser merkst du dir Dinge!",
  ],
  island_spiegel_see: [
    "Hier lernst du, über dein eigenes Lernen nachzudenken.",
    "Frag dich: Was funktioniert gut für mich? Was könnte besser sein?",
    "Selbstreflexion macht dich zum bewussten Lerner!",
  ],
  island_vulkan: [
    "Was treibt dich an? Finde deine innere Motivation!",
    "Intrinsische Motivation kommt von innen - sie ist die stärkste!",
    "Wenn du weißt WARUM du lernst, fällt das WIE leichter.",
  ],
  island_ruhe_oase: [
    "Hier lernst du Strategien gegen Lernstress.",
    "Tiefes Atmen hilft: 4 Sekunden ein, 4 halten, 4 aus.",
    "Stress blockiert das Gehirn - Entspannung öffnet es!",
  ],
  island_ausdauer_gipfel: [
    "Durchhaltevermögen ist wie ein Muskel - man kann es trainieren!",
    "Kleine Schritte führen zum Gipfel.",
    "Wenn es schwer wird, mach eine kurze Pause - aber gib nicht auf!",
  ],
  island_fokus_leuchtturm: [
    "Fokus bedeutet: Eine Sache zur Zeit, aber die richtig!",
    "Schalte Ablenkungen aus wenn du lernst.",
    "Der Leuchtturm zeigt dir den Weg - bleib bei deinem Ziel!",
  ],
  island_wachstum_garten: [
    "Growth Mindset: Du kannst alles lernen - mit Übung!",
    "Das Wort 'NOCH' ist magisch: Ich kann das NOCH nicht.",
    "Fehler sind keine Niederlagen, sondern Lernchancen!",
  ],
  island_lehrer_turm: [
    "Lehrer sind da, um dir zu helfen - trau dich zu fragen!",
    "Eine gute Frage zeigt, dass du nachdenkst.",
    "Feedback von Lehrern hilft dir, besser zu werden.",
  ],
  island_wohlfuehl_dorf: [
    "Sich wohlzufühlen in der Schule ist wichtig fürs Lernen.",
    "Finde deinen Platz - wo fühlst du dich am besten?",
    "Gute Beziehungen zu Mitschülern machen die Schule schöner.",
  ],
  island_schutz_burg: [
    "Hier lernst du, dich zu schützen wenn andere gemein sind.",
    "Du hast das Recht, NEIN zu sagen.",
    "Grenzen setzen ist eine Stärke, keine Schwäche!",
  ],
  island_meister_berg: [
    "Du hast es fast geschafft - der Gipfel ist in Sicht!",
    "Hier zeigst du, was du alles gelernt hast.",
    "Ein wahrer Meister weiß: Lernen hört nie auf!",
  ],
  quiz: [
    "Das Quiz ist Active Recall in Aktion - du trainierst dein Gehirn!",
    "Versuch dich zu erinnern BEVOR du die Antworten liest.",
    "Auch wenn du rätst - dein Gehirn lernt aus dem Feedback!",
    "Lies alle Antworten durch - manchmal ist die letzte die richtige!",
    "Bei Unsicherheit: Welche Antworten kannst du ausschließen?",
  ],
  quiz_correct: [
    "Super gemacht! Das war richtig!",
    "Toll! Dein Wissen wächst!",
    "Genau! Weiter so!",
    "Perfekt! Du bist auf dem richtigen Weg!",
    "Klasse! Das hast du dir gut gemerkt!",
  ],
  quiz_wrong: [
    "Nicht schlimm! Aus Fehlern lernt man am meisten.",
    "Fast! Beim nächsten Mal klappt's bestimmt.",
    "Das ist okay - jeder Fehler bringt dich weiter!",
    "Kopf hoch! Übung macht den Meister.",
    "Versuch's nochmal - du lernst mit jedem Versuch!",
  ],
  challenge: [
    "Challenges = Du wendest an, was du gelernt hast!",
    "Überlege: Wie kann ich das in MEINEM Alltag nutzen?",
    "Finde ein konkretes Beispiel aus DEINEM Leben!",
    "Schreib es auf - dann merkst du es dir besser!",
    "Transfer-Power: Was du hier lernst, hilft dir überall!",
  ],
  video: [
    "Beim Video: Überlege dir VORHER, was du wissen willst!",
    "Pausiere das Video und fasse zusammen, was du gehört hast.",
    "Stelle dir Fragen: Was war der wichtigste Punkt?",
    "Nach dem Video: Erkläre es dir selbst in eigenen Worten!",
  ],
  bandura: [
    "Der Goldene Schlüssel: Sammle Beweise, dass du es KANNST!",
    "Eigene Erfolge: Was hast du heute/diese Woche geschafft?",
    "Vorbilder: Wer hat etwas Ähnliches geschafft? Das kannst du auch!",
    "Ermutigung: Wer glaubt an dich? Hol dir ihre Unterstützung!",
    "Körper-Check: Bist du ruhig und konzentriert? Das zeigt Stärke!",
  ],
  hattie: [
    "Sich selbst einschätzen zu können ist eine Superkraft!",
    "Überlege: Wie gut werde ich abschneiden?",
    "Mit der Zeit wirst du immer besser darin!",
  ],
  polarstern: [
    "Der Polarstern zeigt dir den Weg zu deinen Zielen!",
    "Gute Ziele sind konkret und erreichbar.",
    "Schreib deine Ziele auf - das macht sie real!",
  ],
  success: [
    "Fantastisch! Du hast es geschafft!",
    "Was für eine Leistung! Sei stolz auf dich!",
    "Super! Deine harte Arbeit hat sich gelohnt!",
    "Bravo! Du bist ein echter Lern-Champion!",
  ],
  welcome: [
    "Hallo! Schön, dass du da bist!",
    "Willkommen zurück! Bereit für neue Abenteuer?",
    "Hey! Lass uns zusammen lernen!",
  ],
};

// Begleiter-spezifische Begrüßungen
const COMPANION_GREETINGS: Record<CompanionType, string> = {
  draki: "Grüß dich! Ich bin Draki, dein schlaues Drachenkind!",
  shadow: "Miau! Shadow hier - ich begleite dich durch die Schatten des Wissens!",
  phoenix: "Hallo! Ich bin Phoenix - zusammen fliegen wir hoch hinaus!",
  knight: "Seid gegrüßt! Sir Whiskers steht euch bei, tapferer Lerner!",
  brainy: "Hi! Ich bin Brainy - lass uns gemeinsam schlauer werden!",
};

interface LernbegleiterProps {
  companion: CompanionType;
  context: LernkonText;
  userName?: string;
  islandName?: string;
  onClose?: () => void;
  minimized?: boolean;
  onToggleMinimize?: () => void;
}

export function Lernbegleiter({
  companion,
  context,
  userName = "Lerner",
  islandName,
  minimized = false,
  onToggleMinimize,
}: LernbegleiterProps) {
  const [currentTip, setCurrentTip] = useState(0);
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  // Tipps für aktuellen Kontext
  const tips = useMemo(() => TIPPS[context] || TIPPS.map, [context]);

  // Begleiter-Info
  const companionInfo = useMemo(() => getCompanionInfo(companion), [companion]);

  // Automatisch Tipps wechseln alle 15 Sekunden
  useEffect(() => {
    if (minimized) return;

    const interval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % tips.length);
    }, 15000);

    return () => clearInterval(interval);
  }, [tips.length, minimized]);

  // Bei Kontextwechsel: Ersten Tipp zeigen
  useEffect(() => {
    setCurrentTip(0);
  }, [context]);

  // Erste Begrüßung
  const message = useMemo(() => {
    if (isFirstVisit) {
      setIsFirstVisit(false);
      return COMPANION_GREETINGS[companion];
    }
    // Personalisiere mit Namen
    let tip = tips[currentTip];
    if (userName && tip.includes("du")) {
      // Manchmal Namen einfügen
      if (Math.random() > 0.7) {
        tip = tip.replace("du", userName);
      }
    }
    return tip;
  }, [companion, tips, currentTip, userName, isFirstVisit]);

  // Nächsten Tipp anzeigen
  const nextTip = () => {
    setCurrentTip(prev => (prev + 1) % tips.length);
  };

  if (minimized) {
    return (
      <motion.div
        className="lernbegleiter-minimized"
        onClick={onToggleMinimize}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <img
          src={getCompanionImage(companion)}
          alt={companionInfo.name}
          className="companion-mini-img"
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="lernbegleiter-container"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
    >
      {/* Sprechblase ÜBER der Figur */}
      <motion.div
        className="speech-bubble"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        key={message}
      >
        <div className="bubble-content">
          <span className="companion-name">{companionInfo.name}:</span>
          <p className="tip-text">{message}</p>
        </div>
        <button className="next-tip-btn" onClick={nextTip} title="Nächster Tipp">
          →
        </button>
      </motion.div>

      {/* Begleiter-Figur (groß, ohne Rand) */}
      <div className="companion-avatar-container" onClick={onToggleMinimize}>
        {/* Glow-Effekt */}
        <div className="companion-glow" />
        <motion.img
          src={getCompanionImage(companion)}
          alt={companionInfo.name}
          className="companion-avatar-large"
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    </motion.div>
  );
}

// Exportiere auch die Tipps-Funktion für externe Nutzung
export function getTipForContext(context: LernkonText): string {
  const tips = TIPPS[context] || TIPPS.map;
  return tips[Math.floor(Math.random() * tips.length)];
}
