// ============================================
// Insel der Fäden – Content nach Altersstufen
// Videos 7–10 als Serie unter "Weisheit erlangen"
// Themen: Faden-Prinzip · ABC-Liste · Lücken-Jäger · KaWa
// Basierend auf Vera F. Birkenbihl
// ============================================

import { AgeGroup } from '@/types/legacy-ui';

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
  videoNumber: 7 | 8 | 9 | 10;
  videoId: string;
  placeholder: boolean;
  title: string;
  subtitle: string;
  icon: string;
  canvasAnimation: 'fadenNetz' | 'abcGrid' | 'ampelJaeger' | 'kawaRadiant';
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

    // ── VIDEO 7 · DAS FADEN-PRINZIP ──────────────────
    {
      videoNumber: 7,
      videoId: 'aEfoUTZQQQM',
      placeholder: false,
      title: 'Das Faden-Prinzip',
      subtitle: 'Warum manche Dinge hängenbleiben – und andere nicht',
      icon: '🧵',
      canvasAnimation: 'fadenNetz',
      intro: age === 'gs'
        ? `**Stell dir dein Gehirn vor wie ein Freundschaftsband!** 🧶\n\nJedes Mal, wenn du etwas lernst, knüpfst du einen neuen Faden.\nNeues Wissen kann nur bleiben, wenn es sich an EINEN dieser Fäden hängen kann.\n\nKein Faden? Das Wissen schwebt – und fällt runter.`
        : age === 'us'
        ? `**Die wichtigste Lern-Erkenntnis überhaupt.** 🎯\n\nVera Birkenbihl hat entdeckt:\n\n> "Ob Sie sich etwas leicht oder schwer merken können, hat NUR damit zu tun, ob Sie einen Faden haben."\n\nNeues Wissen dockt an bestehende Fäden an.\nKein Faden → geht rein, geht raus, weg.\nEigener Gedanke → Faden → bleibt.`
        : `**Das Faden-Prinzip: Neurobiologische Grundlage des Lernens.**\n\nVera Birkenbihl modellierte Wissen als assoziatives Netzwerk.\nJeder Knoten ist mit anderen verbunden (Spreading Activation).\nNeue Information enkodiert nur tief, wenn sie an bestehende Knoten andockt.\n\nOhne Vorwissensaktivierung → Maintenance Rehearsal → schnell vergessen.\nMit eigenem Faden → Elaborative Rehearsal → Langzeitspeicherung.`,
      sections: [
        {
          title: age === 'gs' ? '"Auf der Zunge" – kennst du das? 👅' : 'Blackout in der Klassenarbeit – warum? 🧠',
          content: age === 'gs'
            ? `Du weißt, dass du's weißt. Es ist da. Aber du kommst nicht dran.\n\n**Warum?**\nDas Wissen hat keinen festen Faden. Es schwebt.\nIn der Klassenarbeit, wenn du aufgeregt bist, fällt es runter.\n\n**Mit Faden:** "Ägypten! Wüste! Pharao!" ist dein Faden.\nDaran hängt dann "Pyramide" – für immer! 🧵`
            : age === 'us'
            ? `Du hast gelernt. Echt gelernt! Abends alles durchgelesen.\nIn der Klassenarbeit: **Blackout.**\n\nDu hattest keinen eigenen Faden.\nDu hast gelesen, was im Buch steht – aber nicht gedacht:\n"Was bedeutet das für MICH?"\n\nOhne Faden hängt das Wissen nicht richtig. Bei Stress: weg.\n**Mit Faden:** hält. Auch wenn du aufgeregt bist.`
            : `Bulimielernen: rein, raus, weg.\nKeine eigenen Fäden geknüpft → keine elaborative Verarbeitung → schnell vergessen.\n\n**Craik & Tulving (1975), Levels of Processing:**\nJe tiefer die Verarbeitung, desto stabiler die Enkodierung.\nPersönliche Assoziation = tiefste Verarbeitungsebene.\n\nEffektstärke Elaboration: d ≈ 0.56 (Hattie) – kombiniert mit Self-Reference Effect noch höher.`,
          type: 'warning',
        },
        {
          title: 'Das Pyramide-Experiment 🔬',
          content: `Birkenbihl machte dieses Experiment in jedem Vortrag:\n\nSie sagte ein Wort – alle schrieben auf, was IHNEN dazu einfällt.\n\n**Wort: "Pyramide."**\n\nWas fällt dir ein?\n→ Ägypten, Pharao, Wüste, Schoki-Pyramide, Videospiel...\n\nEgal was – das ist dein **Faden**.\nNicht das Wort, sondern dein Gedanke dazu.\n\nDaran hängt jetzt "Pyramide" – für immer. In der Klassenarbeit. Auch bei Stress. ✅`,
          type: 'success',
        },
        {
          title: 'Kopier-Modus vs. Denk-Modus ✍️',
          content: `**Kopier-Modus** ❌\nMitschreiben was der Lehrer sagt.\nGehirn ist nur mit Übertragen beschäftigt.\nKein Faden entsteht.\n\n**Denk-Modus** ✅\nAufschreiben was DIR einfällt.\nJeder eigene Gedanke = ein neuer Faden.\n\n**Rand-Methode – Realitäts-Lösung:**\nDu MUSST mitschreiben? Kein Problem.\nLass einen kleinen Rand frei.\nDort: deine Assoziationen, Stichworte, Bilder.\n\nBeispiel: Lehrer sagt "Die Römer bauten Straßen."\nDu schreibst an den Rand: **"Asterix!"**\nAn "Asterix" hängt jetzt ALLES über römische Straßen. 🎉`,
          type: 'success',
        },
        {
          title: age === 'gs' ? 'Dein Gehirn ist ein Netz! 🕸️' : 'Das Wissensnetz – dichter = besser 🕸️',
          content: `Je mehr Fäden du zu einem Thema hast, desto mehr bleibt hängen.\n\n**Fußball** ⚽ → tausend Fäden → bleibt sofort!\n**Quantenphysik** ⚛️ → null Fäden → rein, raus, weg.\n\nFäden baust du mit DEINEN eigenen Gedanken.\nNicht mit dem, was du abschreibst.`,
          type: 'expander',
        },
      ],
      practicePrompt: age === 'gs'
        ? '🃏 **Karteikarten:** Schreib auf die Rückseite nicht nur die Antwort – schreib auch deinen eigenen Gedanken dazu. Ein Wort, ein Bild. Das ist dein Faden – der Kleber!'
        : '🃏 **Karteikarten:** Ergänze jede Karte um deine persönliche Assoziation.\n🗺️ **Lernpfad:** Aktiviere vor jeder neuen Technik dein Vorwissen – "Was weiß ich schon dazu?"',
    },

    // ── VIDEO 8 · DIE ABC-LISTE ───────────────────────
    {
      videoNumber: 8,
      videoId: 'SwSgGrZDGfc',
      placeholder: false,
      title: 'Die ABC-Liste',
      subtitle: 'Fäden absichtlich aufspannen',
      icon: '📋',
      canvasAnimation: 'abcGrid',
      intro: age === 'gs'
        ? `**Dein Netz ist noch löchrig? Dann spann es auf!** 🕸️\n\nNeues Wissen braucht einen Faden – das weißt du jetzt.\nAber was, wenn du weißt, dass dein Netz noch löchrig ist?\n\nDann hilft automatisch nicht mehr.\nDann brauchst du die **ABC-Liste** – um dein Netz absichtlich aufzuspannen!`
        : age === 'us'
        ? `**Löchriges Netz? Absichtlich aufspannen!**\n\nIn Video 7 hast du gelernt: Neues Wissen braucht einen Faden.\nAber was, wenn in drei Tagen Klassenarbeit ist und du WEISST, dass dein Netz noch löchrig ist?\n\nDann reicht "automatisch" nicht mehr.\nDu brauchst die **ABC-Liste** – Birkenbihl's Werkzeug, um Lücken sofort sichtbar zu machen.`
        : `**Advance Organizer durch strukturierte Vorwissensaktivierung.**\n\nDie ABC-Liste ist Birkenbihl's Werkzeug zur systematischen Netzwerk-Aktivierung.\nPrinzip: Alphabet als Struktur-Anker → erzwingt Spreading Activation über das gesamte Themenfeld.\n\nLücken (leere Felder) = fehlende Knoten im assoziativen Netzwerk → gezielter Lernbedarf.`,
      sections: [
        {
          title: 'Was ist die ABC-Liste? 🔑',
          content: `**So funktioniert sie:**\n\n1. Thema oben draufschreiben\n2. Alphabet links runter: A, B, C, D...\n3. Pro Buchstabe: sofort schreiben, was dir einfällt!\n\n**Regel Nr. 1: Die Augen wandern.**\nNicht grübeln. Nicht nachdenken.\nEinfach schreiben, was kommt – auch wenn es "weit weg" scheint.\n\nLeere Felder? Das sind deine **Lücken**.\nGenau die zeigen dir, wo du noch lernen musst. ✅`,
          type: 'success',
        },
        {
          title: 'Warum Buchstaben als Schlüssel? 🗝️',
          content: `Das Alphabet ist ein **Suchsystem**.\n\nWenn du bei "B" anfängst zu denken, aktivierst du alle Wörter mit B, die du zu diesem Thema kennst.\nBei "K" alle mit K.\nUsw.\n\nDas Alphabet zwingt dich, das GESAMTE Thema abzusuchen – nicht nur die Teile, die dir gerade einfallen.\n\nErgebnis: Lücken werden sichtbar, die du sonst übersehen hättest.`,
          type: 'info',
        },
        {
          title: 'Was bringt die Liste? 🎯',
          content: `**Vor dem Lernen:**\nDu siehst sofort – welche Buchstaben sind leer?\nGenau dort muss ich lernen. Nicht alles nochmal – nur die Lücken!\n\n**Vera Birkenbihl** hat das ihr ganzes Leben lang gemacht:\n"Immer: erst ABC-Liste. Dann lernen."\n\n**Profi-Modus:**\nNach dem Lernen nochmal eine ABC-Liste zum selben Thema anlegen.\nVorher vs. Nachher – du siehst deinen Fortschritt! 📈`,
          type: 'success',
        },
        {
          title: age === 'gs' ? 'Probier es gleich aus! 🚀' : 'Sofort anwenden',
          content: `Nimm ein Fach, in dem du bald eine Arbeit schreibst.\n\nDann:\n1. Thema oben\n2. Alphabet links\n3. Augen wandern – was fällt dir ein?\n\nNur bis M reicht für den Anfang.\nNur 3 Minuten.\n\nLass deine Fäden sprechen – und schau, wo es noch löchrig ist.`,
          type: 'expander',
        },
      ],
      practicePrompt: age === 'gs'
        ? '🃏 **Karteikarten:** Bevor du neue Karten erstellst – mach kurz eine ABC-Liste zum Thema! So siehst du sofort, welche Karten du wirklich brauchst.\n🗺️ **Lernpfad:** Starte eine neue Station mit der ABC-Liste als Einstieg.'
        : '🃏 **Karteikarten:** ABC-Liste vor dem Erstellen neuer Karten – du lernst nur was fehlt, nicht alles nochmal.\n🗺️ **Lernpfad:** ABC-Liste am Stationsbeginn als systematischer Vorwissens-Check.',
    },

    // ── VIDEO 9 · DER LÜCKEN-JÄGER ───────────────────
    {
      videoNumber: 9,
      videoId: 'qxw9dDGKibc',
      placeholder: false,
      title: 'Der Lücken-Jäger',
      subtitle: 'Die ABC-Liste wird zum persönlichen Lernplan',
      icon: '🔍',
      canvasAnimation: 'ampelJaeger',
      intro: age === 'gs'
        ? `**Du hast deine ABC-Liste. Ein paar Felder sind leer.**\n\nUnd jetzt? Alles nochmal lesen?\n\nNein! Es gibt einen viel besseren Weg:\nDen **Lücken-Jäger** – deine ABC-Liste wird zur Schatzkarte deines Lernens! 🗺️`
        : age === 'us'
        ? `**Du hast deine ABC-Liste. Ein paar Felder gefüllt, ein paar leer.**\n\nDie meisten Schüler machen jetzt das:\nSie legen den Zettel beiseite und lesen alles nochmal durch.\n\nDas ist Zeitverschwendung.\n\nIn diesem Video lernst du, wie du die ABC-Liste in deinen **persönlichen Lernplan** verwandelst.`
        : `**Selektive Enkodierung durch Gap-Analysis.**\n\nDie meisten Schüler nutzen passive Wiederholung (alles nochmal lesen) – mit minimaler Effektstärke.\nDer Lücken-Jäger kombiniert Gap-Identifikation mit gezieltem Retrieval Practice.\n\nEffektstärke Retrieval Practice: d ≈ 0.73 (Hattie) – eine der stärksten Lernstrategien.`,
      sections: [
        {
          title: 'Das Ampel-System 🚦',
          content: `Nimm deine ABC-Liste und drei Stifte:\n\n🟢 **Grün:** Das weiß ich sicher. ✓\n🟡 **Orange:** Ich bin unsicher. ~\n🔴 **Rot:** Das weiß ich nicht. ✗\n\nFärbe jeden Buchstaben / jedes Feld ein.\n\nFertig?\n\nJetzt siehst du SOFORT:\n→ Grün = kein Zeitverschwendung mehr\n→ Orange + Rot = das lernst du jetzt`,
          type: 'success',
        },
        {
          title: 'Die 40%-Regel ⚡',
          content: `Birkenbihl hat beobachtet:\n\nBei den meisten Schülern sind nach dem ersten Durchlesen\nnur etwa **40% der Felder rot**.\n\n**Was bedeutet das?**\n60% weißt du schon – die musst du nicht nochmal lernen!\n\nDu lernst nur die 40% echten Lücken.\nDas spart Zeit und macht Fortschritt sichtbar.\n\nNach dem Lernen: nochmal ABC-Liste anlegen.\nSiehst du, wie das Rot schrumpft? 📉`,
          type: 'info',
        },
        {
          title: 'Fortschritt sehen: Die zweite Liste 📈',
          content: `Nachdem du die roten und orangen Felder gelernt hast:\n\n**Leg nochmal eine ABC-Liste zum selben Thema an.**\n\nVergleiche:\n- Vorher: wie viele rote Felder?\n- Nachher: wie viele rote Felder?\n\nDu siehst deinen Fortschritt direkt.\nNicht nach der Klassenarbeit – sondern JETZT, während du lernst.\n\nDas ist Motivation pur. 💪`,
          type: 'success',
        },
        {
          title: 'Echte Lücken weiterlernen 🎯',
          content: `Hartnäckig rote Felder – die, die immer wieder rot bleiben?\n\nDie nimmst du mit in deine nächste Lernrunde.\n\n**Mit deinen vorhandenen Lerntools:**\n\n🃏 **Karteikarten:** Erstelle für jedes rote Feld eine Karte.\nNur für die echten Lücken – nicht für alles.\n\n🗺️ **Lernpfad:** Rote Felder werden zur nächsten Station.\nSo baut sich dein Lernweg aus deinen eigenen Lücken auf.`,
          type: 'expander',
        },
      ],
      practicePrompt: age === 'gs'
        ? '🃏 **Karteikarten:** Nur für rote Felder neue Karten erstellen! Kein unnötiges Wiederholen was du schon kannst.\n🗺️ **Lernpfad:** Ampel-Check als erste Aktivität jeder Lernstation.'
        : '🃏 **Karteikarten:** Rote Felder → neue Karten. Grüne Felder → keine Zeit verschwenden.\n🗺️ **Lernpfad:** Ampel-Status als Fortschrittsindikator in jeder Station nutzen.',
    },

    // ── VIDEO 10 · DIE KAWA ───────────────────────────
    {
      videoNumber: 10,
      videoId: 'J8uYPJpYhGE',
      placeholder: false,
      title: 'Die KaWa',
      subtitle: 'Wenn ein Wort zum Schlüsselbund wird',
      icon: '🗝️',
      canvasAnimation: 'kawaRadiant',
      intro: age === 'gs'
        ? `**Bist du eher ein Text-Denker oder ein Bild-Denker?** 🤔\n\nBei manchen laufen Gedanken als Wörter ab. Bei anderen entstehen Bilder und Verbindungen.\n\nWenn du gerne in Netzen denkst – dann ist die **KaWa** dein Werkzeug!\nEin einziges Wort wird zum Schlüsselbund für ganz viel Wissen.`
        : age === 'us'
        ? `**KaWa – für alle, die in Verbindungen denken.**\n\nDu kennst die ABC-Liste – 26 Buchstaben, ganzes Themenfeld.\nDie KaWa macht dasselbe – aber mit einem einzigen Wort.\n\nEin Wort als Anker. Seine Buchstaben als Tore.\nPro Buchstabe: sofort assoziieren.\n\nKürzer als die ABC-Liste. Fokussierter. Kreativer.`
        : `**KaWa: Kreativ-assoziative Verdichtung durch constraint-basierte Assoziation.**\n\nPrinzip: Ein zentrales Wort als Schlüsselknoten → seine Buchstaben als strukturierte Assoziationstrigger.\nDurch Einschränkung (nur Buchstaben des Wortes) entsteht gezielter Fokus – statt diffuser Mindmap-Ausbreitung.\n\nBirkenbihl nannte es "Klangwolke zu Faden": das Wort als Klang wird selbst zum Assoziationsanker.`,
      sections: [
        {
          title: 'Was bedeutet KaWa? 🔑',
          content: `**KaWa** steht für:\n**K**reative **a**usbeute – **W**ort – **A**ssoziationen\n\n**So funktioniert sie:**\n1. Ein Themenwort wählen (z.B. "ÄGYPTEN")\n2. Die Buchstaben des Wortes untereinander schreiben: Ä, G, Y, P, T, E, N\n3. Zu jedem Buchstaben sofort assoziieren\n\n**Ergebnis:**\nÄ → Ära, Ägyptologie\nG → Götter, Gold\nP → Pyramide, Pharao\n...\n\nKürzer als ABC-Liste – aber mit Tiefgang. ✅`,
          type: 'success',
        },
        {
          title: 'KaWa vs. Mindmap 🥊',
          content: `**Mindmap** ❌ (für Lücken-Jagd)\nVerzweigt in alle Richtungen.\nKein Stopp, keine Kontrolle.\nSchnell: 3 Äste, dann nichts mehr...\n\n**KaWa** ✅\nFührt durch Buchstaben-Tore.\nJedes Tor zwingt dich zu einem neuen Bereich.\nEinschränkung macht kreativ!\n\n**Birkenbihl:** "Gerade weil du nicht überall hindenken kannst, findest du mehr."\n\nDas Gehirn sucht gezielter, wenn es einen Rahmen hat.`,
          type: 'info',
        },
        {
          title: 'Der Klangwolken-Trick 🔊',
          content: `Birkenbihl hatte einen Extra-Trick:\n\nSprich das Wort laut aus.\nHör dir selbst zu.\n\n"Ä-gyp-ten."\n\nDas Wort als Klang – als Klangwolke – aktiviert andere Fäden als das Wort als Text.\n\nManche Assoziationen kommen nur über den Klang.\n\nProbier es: Was klingt "PHOTOSYNTHESE" für dich?\nPhoto? Synthese? Synth-Sound?\n\nJeder Klang-Eindruck ist ein neuer möglicher Faden. 🎵`,
          type: 'expander',
        },
        {
          title: 'ABC-Liste + KaWa = dichtes Netz 🕸️',
          content: `Beide Methoden ergänzen sich perfekt:\n\n**ABC-Liste** → breiter Überblick, alle 26 Tore\n**KaWa** → tiefer Fokus auf ein Schlüsselwort\n\nManche Schüler machen erst die ABC-Liste –\nfinden die wichtigsten Begriffe –\nund machen dann für jeden Begriff eine KaWa.\n\nErgebnis: Ein dichtes, persönliches Wissensnetz.\n\nMit deinen eigenen Fäden. Nicht aus dem Buch. Deinen.`,
          type: 'success',
        },
      ],
      practicePrompt: age === 'gs'
        ? '🃏 **Karteikarten:** Mach für jedes wichtige Schlüsselwort eine KaWa – und schreib die Assoziationen auf die Rückseite als Gedächtnisstütze.\n🗺️ **Lernpfad:** Nutze die KaWa als kreative Einstiegsübung zu einer neuen Station.'
        : '🃏 **Karteikarten:** KaWa-Assoziationen als zusätzliche Fäden auf jeder Karte vermerken.\n🗺️ **Lernpfad:** KaWa für Schlüsselbegriffe → Verknüpfung zwischen Stationen sichtbar machen.',
    },
  ];
}

// ============================================
// HELPER: Content-Objekt mit Backward-Compat bauen
// Video 7 wird fuer title/video/explanation genutzt
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
  'Station der Fäden',
  makeVideos('gs'),
  'Wissen bleibt nur, wenn es einen Faden findet. Deine Gedanken sind deine Fäden – bau sie überall, wo du lernst!',
);

const UNTERSTUFE_CONTENT: IslandContent = buildContent(
  'Station der Fäden',
  makeVideos('us'),
  'Das Faden-Prinzip ist das Gegenmittel gegen Bulimielernen. Eigene Assoziationen → tiefe Verarbeitung → stabile Langzeitspeicherung.',
);

const MITTELSTUFE_CONTENT: IslandContent = buildContent(
  'Station der Fäden',
  makeVideos('ms'),
  'Elaboratives Lernen durch assoziative Netzwerke: Faden-Prinzip, ABC-Liste, Lücken-Jäger und KaWa bilden ein vollständiges System zur Selbststeuerung des Lernens.',
);

// ============================================
// EXPORT
// ============================================

export const FAEDEN_CONTENT: Record<AgeGroup, IslandContent> = {
  grundschule: GRUNDSCHULE_CONTENT,
  unterstufe:  UNTERSTUFE_CONTENT,
  mittelstufe: MITTELSTUFE_CONTENT,
  oberstufe:   MITTELSTUFE_CONTENT, // Fallback
  paedagoge:   MITTELSTUFE_CONTENT, // Fallback
  coach:       MITTELSTUFE_CONTENT, // Fallback
};

// Types already exported via `export interface` above
