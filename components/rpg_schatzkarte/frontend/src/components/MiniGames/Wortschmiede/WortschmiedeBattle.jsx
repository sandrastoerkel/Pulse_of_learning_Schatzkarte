import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from '@supabase/supabase-js';

/* ─── FONTS ─────────────────────────────────────────────────────────────── */
const FontLink = () => (
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Outfit:wght@400;600;700;900&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet" />
);

/* ─── TTS ────────────────────────────────────────────────────────────────── */

// Wait for voices to load, then return best German voice
function getVoice(prefer = "any") {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const de = voices.filter(v => v.lang?.startsWith("de"));

  // Hilfsfunktion: erste Stimme finden, die einen der Namen enthält
  const findByNames = (list, names) => {
    for (const name of names) {
      const v = list.find(v => v.name.includes(name));
      if (v) return v;
    }
    return null;
  };

  if (prefer === "clear") {
    // Premium/Enhanced-Stimmen bevorzugen (macOS, iOS, ChromeOS)
    const premium = de.filter(v => /premium|enhanced|natural|neural/i.test(v.name));
    if (premium.length) {
      // Weibliche Premium bevorzugen (klarer für Wörter)
      const femPremium = findByNames(premium, ["Anna", "Petra", "Helena", "Sandy"]);
      if (femPremium) return femPremium;
      return premium[0];
    }
    // Dann bekannte klare Stimmen (weiblich bevorzugt für Deutlichkeit)
    const found = findByNames(de, ["Anna", "Petra", "Helena", "Sandy", "Yannick", "Martin"]);
    if (found) return found;
    return de[0] ?? voices[0] ?? null;
  }

  if (prefer === "monster") {
    // Für Monster: tiefere männliche Stimme, Premium bevorzugt
    const premium = de.filter(v => /premium|enhanced|natural|neural/i.test(v.name));
    const malePremium = findByNames(premium, ["Markus", "Martin", "Yannick", "Stefan", "Thomas", "Hans"]);
    if (malePremium) return malePremium;
    // Dann jede Premium-Stimme
    if (premium.length) return premium[0];
    // Dann bekannte männliche Stimmen
    const found = findByNames(de, ["Markus", "Martin", "Yannick", "Stefan", "Thomas", "Hans"]);
    if (found) return found;
    return de[0] ?? voices[0] ?? null;
  }

  if (prefer === "deep") {
    // Für dramatisch: tiefste männliche deutsche Stimme
    const found = findByNames(de, ["Stefan", "Thomas", "Hans", "Markus", "Martin"]);
    if (found) return found;
    const male = voices.find(v => /male|man|stefan|thomas|hans/i.test(v.name));
    return male ?? de[0] ?? voices[0] ?? null;
  }

  // "any": Premium > Standard
  const premium = de.filter(v => /premium|enhanced|natural|neural/i.test(v.name));
  if (premium.length) return premium[0];
  return de[0] ?? voices[0] ?? null;
}

// Core speak – queues utterance, retries voice assignment if not loaded yet
function speak(text, opts = {}) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();

  const fire = () => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang   = "de-DE";
    u.rate   = opts.rate   ?? 0.82;
    u.pitch  = opts.pitch  ?? 0.9;
    u.volume = opts.volume ?? 1.0;
    const v = getVoice(opts.voiceType ?? "any");
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  };

  if (window.speechSynthesis.getVoices().length > 0) {
    fire();
  } else {
    window.speechSynthesis.onvoiceschanged = () => { fire(); };
  }
}

// Queue multiple utterances in sequence with optional gaps
function speakSequence(items) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  let delay = 0;
  items.forEach(({ text, opts, pauseAfter }) => {
    setTimeout(() => speak(text, opts), delay);
    // Estimate duration: ~80ms per char at rate 0.5, ~50ms at rate 1.0
    const rate = opts?.rate ?? 0.82;
    const charMs = 80 / rate;
    delay += text.length * charMs + (pauseAfter ?? 300);
  });
}

// ── PROFILES ────────────────────────────────────────────────────────────────

const tts = {

  // SPELLING WORD: deutlich, natürliches Tempo
  word: (text) => speak(text, { rate: 0.9, pitch: 1.0, volume: 1.0, voiceType: "clear" }),

  // MONSTER BATTLECRY: tiefere Stimme, dramatisch aber verständlich
  monster: (text) => {
    // Pausen bei Satzzeichen einfügen für natürlicheren Fluss
    const dramatic = text
      .replace(/…/g, "... ")
      .replace(/\.\.\./g, "... ")
      .replace(/!/g, "! ")
      .replace(/\?/g, "? ");
    speak(dramatic, { rate: 0.82, pitch: 0.7, volume: 1.0, voiceType: "monster" });
  },

  // VICTORY / DEFEAT: klar und verständlich
  victory: (text) => speak(text, { rate: 0.85, pitch: 0.95, volume: 1.0, voiceType: "clear" }),
  defeat:  (text) => speak(text, { rate: 0.80, pitch: 0.85, volume: 0.9, voiceType: "clear" }),

  // NARRATOR (Intro, Anweisungen)
  narrate: (text) => speak(text, { rate: 0.85, pitch: 0.95, volume: 0.95, voiceType: "clear" }),
};

/* ─── SFX (Web Audio) ────────────────────────────────────────────────────── */
function playTone(freq, dur, type = "square", vol = 0.15) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = type; osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.start(); osc.stop(ctx.currentTime + dur);
  } catch (_) {}
}
const sfx = {
  hit:     () => { playTone(220, 0.1); setTimeout(() => playTone(180, 0.15), 80); },
  crit:    () => { playTone(440, 0.08); setTimeout(() => playTone(550, 0.08), 80); setTimeout(() => playTone(660, 0.15), 160); },
  hurt:    () => { playTone(150, 0.2, "sawtooth"); },
  win:     () => { [523,659,784,1047].forEach((f,i) => setTimeout(() => playTone(f, 0.3, "square", 0.12), i*120)); },
  lose:    () => { [440,370,300,220].forEach((f,i) => setTimeout(() => playTone(f, 0.3, "sawtooth", 0.1), i*120)); },
  select:  () => playTone(600, 0.05, "square", 0.08),
};

/* ─── DIFFICULTY ─────────────────────────────────────────────────────────── */
// leicht = Kl.5, mittel = Kl.6-7, hart = Kl.8+
const DIFF_LABELS = { leicht: "⭐ Leicht", mittel: "⭐⭐ Mittel", hart: "⭐⭐⭐ Hart" };
const DIFF_COLORS = { leicht: "#22c55e", mittel: "#f59e0b", hart: "#ef4444" };
const KLASSE_TO_DIFF = { "5": "leicht", "6": "leicht", "7": "mittel", "8": "mittel", "9+": "hart" };

/* ─── WORD BANK (1466 LRS-Wörter) ────────────────────────────────────────── */
// [wort, kategorieId, fehler_oder_0, sterne]
// Kategorien: 1=ie/ih/ieh, 2=Dehnungs-h, 3=Funktionswörter, 4=Vorsilben/Morpheme,
//   5=Doppelkonsonanten, 6=ck/tz, 7=Auslautverhärtung, 8=s/ss/ß,
//   9=Groß-/Kleinschreibung, 10=Allgemeiner Wortschatz
const W=[
["der",3,"dei",2],
["die",3,"di",2],
["das",3,"dass",3],
["den",3,"dem",2],
["dem",3,"den",3],
["des",3,0,3],
["ein",3,"ain",2],
["eine",3,"aine",2],
["einen",3,"ainen",2],
["einem",3,"ainem",3],
["einer",3,"ainer",3],
["ich",3,"isch",2],
["du",3,"tu",2],
["er",3,"ehr",1],
["sie",3,"si",2],
["es",3,"ez",1],
["wir",3,"wier",4],
["ihr",3,"ir",3],
["mir",3,"mier",4],
["dir",3,"dier",4],
["mich",3,"misch",2],
["dich",3,"disch",2],
["ihn",3,"in",3],
["ihm",3,"im",3],
["uns",3,"unz",1],
["euch",3,"auch",3],
["ihnen",3,"inen",3],
["mein",3,"main",2],
["dein",3,"dain",2],
["sein",3,"sain",2],
["unser",3,"unsere",1],
["euer",3,0,3],
["und",3,"unt",3],
["aber",3,"aba",2],
["oder",3,"oda",2],
["denn",3,"den",3],
["weil",3,0,2],
["dass",3,"das",4],
["wenn",3,"wen",3],
["ob",3,"op",3],
["damit",3,0,2],
["obwohl",3,"obwol",4],
["sodass",3,"sodas",4],
["während",3,"wärend",4],
["bevor",3,"befor",3],
["nachdem",3,0,2],
["seitdem",3,0,3],
["als",3,0,2],
["wie",3,"wi",2],
["auch",3,"ouch",2],
["nicht",3,"nigt",3],
["noch",3,"nok",2],
["schon",3,"schohn",2],
["nur",3,"nour",1],
["ja",3,"ya",1],
["nein",3,"nain",2],
["doch",3,"dok",2],
["mal",3,"mahl",3],
["zwar",3,"zwahr",3],
["bloß",3,"bloss",4],
["so",3,"soo",1],
["wo",3,"woo",1],
["wann",3,"wan",3],
["warum",3,"waroum",2],
["hier",3,"hir",2],
["da",3,"dah",1],
["dort",3,0,1],
["heute",3,"heite",3],
["morgen",3,"morjen",2],
["gestern",3,0,2],
["immer",3,"imer",3],
["nie",3,"ni",2],
["oft",3,"ofd",2],
["sehr",3,"ser",3],
["ganz",3,"gans",2],
["mehr",3,"mer",3],
["viel",3,"vil",2],
["wenig",3,0,3],
["alle",3,"ale",3],
["alles",3,"ales",3],
["nichts",3,"nixts",3],
["etwas",3,0,2],
["man",3,"mann",3],
["jemand",3,"jehmand",2],
["niemand",3,0,3],
["selbst",3,"selbsd",3],
["jetzt",3,"jezt",4],
["dann",3,"dan",3],
["deshalb",3,"deshalp",3],
["deswegen",3,"desswegen",3],
["trotzdem",3,"trodzdem",4],
["außerdem",3,"ausserdem",4],
["zum",3,0,1],
["zur",3,0,1],
["vom",3,0,1],
["beim",3,"bim",2],
["im",3,"imm",1],
["am",3,"amm",1],
["ins",3,0,1],
["ans",3,0,1],
["in",3,"inn",1],
["an",3,"ann",1],
["auf",3,"ouf",2],
["aus",3,"ous",2],
["bei",3,"bai",2],
["mit",3,"mid",2],
["von",3,"fon",3],
["zu",3,"tzu",2],
["nach",3,"nah",2],
["vor",3,"for",3],
["über",3,"üba",3],
["unter",3,"unta",2],
["zwischen",3,"zwishen",3],
["durch",3,"dorch",2],
["gegen",3,0,2],
["ohne",3,"one",3],
["seit",3,"seiet",2],
["bis",3,"biss",2],
["um",3,"umm",1],
["ab",3,"ap",3],
["außer",3,"auser",3],
["neben",3,0,2],
["hinter",3,"hinda",2],
["wegen",3,0,2],
["trotz",3,"trots",4],
["statt",3,"stat",3],
["laut",3,"lout",2],
["haben",3,0,2],
["werden",3,"werdn",2],
["können",3,"konen",3],
["müssen",3,"mussen",3],
["sollen",3,"solen",3],
["wollen",3,"wolen",3],
["dürfen",3,0,3],
["mögen",3,0,3],
["lassen",3,"lasen",3],
["ist",3,"issd",1],
["war",3,"wahr",3],
["hat",3,"had",2],
["wird",3,"wirt",3],
["gibt",3,"gibd",3],
["geht",3,"get",3],
["macht",3,"makt",3],
["kommt",3,"komt",3],
["sagt",3,"sakt",3],
["sieht",3,"siet",4],
["steht",3,"stet",3],
["heißt",3,"heist",4],
["lässt",3,"last",4],
["bleibt",3,"bleibd",3],
["weiß",3,"weiss",4],
["nimmt",3,"nimt",3],
["hält",3,"hald",4],
["bringt",3,"brinkt",3],
["zeigt",3,"zeikt",3],
["findet",3,0,2],
["liegt",3,"liekt",3],
["steigt",3,"steikt",3],
["denkt",3,0,2],
["spielt",3,0,2],
["braucht",3,"broucht",3],
["scheint",3,0,2],
["meint",3,"meind",2],
["sucht",3,0,2],
["kennt",3,"kent",3],
["nennt",3,"nent",3],
["rennt",3,"rent",3],
["fällt",3,"fäld",3],
["stellt",3,"steld",3],
["Bahn",2,"Ban",3],
["Zahn",2,"Zan",3],
["Kahn",2,"Kan",3],
["Jahr",2,"Jar",3],
["Uhr",2,"Ur",3],
["Ohr",2,"Or",3],
["fahren",2,"faren",3],
["Fahrrad",2,"Farrad",4],
["Gefahr",2,"Gefar",3],
["Wahl",2,"Wal",3],
["Zahl",2,"Zal",3],
["zahlen",2,"zalen",3],
["zählen",2,"zälen",3],
["Stuhl",2,"Stul",3],
["Schuh",2,"Schu",4],
["Kuh",2,"Ku",4],
["froh",2,"fro",4],
["roh",2,"ro",4],
["früh",2,"früe",4],
["Höhe",2,"Höe",3],
["Ruhe",2,"Rue",3],
["nahe",2,"nae",3],
["Lohn",2,"Lon",3],
["Sohn",2,"Son",3],
["wohnen",2,"wonen",3],
["Wohnung",2,"Wonung",3],
["nehmen",2,"nemen",3],
["Rahmen",2,"Ramen",3],
["Sahne",2,"Sane",3],
["Bühne",2,"Büne",3],
["fühlen",2,"fülen",3],
["kühlen",2,"külen",3],
["führen",2,"füren",3],
["Gefühl",2,"Gefül",3],
["stehlen",2,"stelen",3],
["empfehlen",2,"empfelen",4],
["Fehler",2,"Feler",3],
["ähnlich",2,"änlich",3],
["Stahl",2,"Stal",3],
["Strahl",2,"Stral",3],
["drehen",2,0,3],
["wohl",2,"wol",3],
["Kohle",2,"Kole",3],
["Mehl",2,"Mel",3],
["Befehl",2,"Befel",3],
["Bohne",2,"Bone",3],
["bohren",2,"boren",3],
["Bahnhof",2,"Banhof",3],
["Lehre",2,"Lere",3],
["lehren",2,"leren",3],
["Lehrer",2,"Lerer",3],
["Ehe",2,"Ee",3],
["Höhle",2,"Höle",3],
["Kohl",2,"Kol",3],
["Jahrzehnt",2,"Jarzent",4],
["Fahrplan",2,"Farplan",3],
["Fahrkarte",2,"Farkarte",3],
["Ahnung",2,"Anung",3],
["ahnen",2,"anen",3],
["Ruhm",2,"Rum",4],
["mähen",2,"mäen",3],
["Mähne",2,"Mäne",3],
["dehnen",2,"denen",4],
["Dehnungs-h",2,"Denungs-h",4],
["mahnen",2,"manen",3],
["stählen",2,"stälen",3],
["Pfähle",2,"Pfäle",3],
["Pfahl",2,"Pfal",3],
["vorhaben",2,0,3],
["Taler",2,"Tahler",3],
["zahm",2,"zam",3],
["Ruhepause",2,"Ruepause",4],
["Uhrmacher",2,"Urmacher",3],
["Bahnsteig",2,"Bansteig",3],
["Jahreszeit",2,"Jareszeit",3],
["Hoheit",2,"Hoeit",4],
["Rohheit",2,"Roheit",4],
["Frühjahr",2,"Früjar",4],
["Frühling",2,"Früling",3],
["Wohnort",2,"Wonort",3],
["Tier",1,"Tir",2],
["Spiel",1,"Spil",2],
["spielen",1,"spilen",2],
["lieb",1,"lib",2],
["lieben",1,"liben",2],
["Brief",1,"Brif",2],
["Biene",1,"Bine",2],
["Wiese",1,"Wise",2],
["Riese",1,"Rise",2],
["bieten",1,"biten",2],
["mieten",1,"miten",2],
["Miete",1,"Mite",2],
["fliegen",1,"fligen",2],
["riechen",1,"richen",2],
["sieben",1,"siben",2],
["Dieb",1,"Dib",2],
["Spiegel",1,"Spigel",2],
["Stiefel",1,"Stifl",2],
["Knie",1,"Kni",3],
["Vieh",1,"Vi",4],
["Lied",1,"Lid",2],
["nieder",1,"nider",2],
["Gebiet",1,0,2],
["tief",1,"tif",2],
["Dienstag",1,"Dinstag",3],
["Fieber",1,"Fiba",2],
["fliehen",1,"flien",4],
["Kiefer",1,"Kifer",2],
["Liebe",1,"Libe",2],
["lieblich",1,"liblich",3],
["Niederlage",1,"Niderlage",3],
["Riegel",1,"Rigel",2],
["Sieg",1,"Siek",2],
["siegen",1,"sigen",2],
["Sieger",1,"Siger",2],
["fiel",1,"fil",2],
["blieb",1,"blib",2],
["rief",1,"rif",2],
["schief",1,"schif",2],
["Diät",1,0,4],
["ihn",1,"in",3],
["ihm",1,"im",3],
["ihr",1,"ir",3],
["ihnen",1,"inen",3],
["sieht",1,"siet",4],
["zieht",1,"ziet",4],
["ziehen",1,"zien",4],
["geschieht",1,"geschiet",4],
["wir",1,"wier",5],
["mir",1,"mier",5],
["dir",1,"dier",5],
["Tiger",1,"Tieger",4],
["Bilder",1,0,4],
["bitten",1,"bieten",5],
["Wille",1,"Wiele",5],
["kommen",5,"komen",3],
["Sommer",5,"Somer",3],
["Hammer",5,"Hamer",3],
["Zimmer",5,"Zimer",3],
["Nummer",5,"Numer",3],
["Gramm",5,"Gram",3],
["Programm",5,0,3],
["Komma",5,"Koma",3],
["Lamm",5,"Lam",3],
["Kamm",5,"Kam",3],
["rennen",5,"renen",3],
["kennen",5,"kenen",3],
["nennen",5,"nenen",3],
["brennen",5,"brenen",3],
["Sonne",5,"Sone",3],
["Tonne",5,"Tone",3],
["Wanne",5,"Wane",3],
["Mann",5,"Man",3],
["spinnen",5,"spinen",3],
["Tanne",5,"Tane",3],
["Rinne",5,"Rine",3],
["Ball",5,"Bal",3],
["toll",5,"tol",3],
["voll",5,"vol",3],
["hell",5,"hel",3],
["Halle",5,"Hale",3],
["Welle",5,"Wele",3],
["Stelle",5,"Stele",3],
["stellen",5,"stelen",3],
["fallen",5,"falen",3],
["Rolle",5,"Role",3],
["Brille",5,"Brile",3],
["Quelle",5,"Quele",3],
["Millionen",5,"Milionen",3],
["Bett",5,"Bet",3],
["Blatt",5,"Blat",3],
["satt",5,"sat",3],
["nett",5,"net",3],
["bitte",5,"bite",3],
["Mitte",5,"Mite",3],
["Ratte",5,"Rate",3],
["Butter",5,"Buter",3],
["Wetter",5,"Weter",3],
["Treppe",5,"Trepe",3],
["Suppe",5,"Supe",3],
["Puppe",5,"Pupe",3],
["Affe",5,"Afe",3],
["Koffer",5,"Kofer",3],
["Pfeffer",5,"Pfefer",3],
["Löffel",5,"Löfel",3],
["Schiff",5,"Schif",3],
["treffen",5,"trefen",3],
["hoffen",5,"hofen",3],
["offen",5,"ofen",3],
["wissen",5,"wisen",3],
["lassen",5,"lasen",3],
["müssen",5,"mussen",3],
["essen",5,"esen",3],
["messen",5,"mesen",3],
["passen",5,"pasen",3],
["Wasser",5,"Waßer",3],
["Messer",5,"Meser",3],
["besser",5,"beser",3],
["Klasse",5,"Klase",3],
["Tasse",5,"Tase",3],
["nass",5,"nas",3],
["Kuss",5,"Kus",3],
["Fluss",5,"Flus",3],
["Schluss",5,"Schlus",3],
["Riss",5,"Ris",3],
["dass",5,"das",4],
["Schirm",5,0,2],
["Kissen",5,"Kisen",3],
["Gewissen",5,"Gewisen",3],
["Hund",7,"Hunt",3],
["Kind",7,"Kint",3],
["Mund",7,"Munt",3],
["Hand",7,"Hant",3],
["Sand",7,"Sant",3],
["Band",7,"Bant",3],
["Wald",7,"Walt",3],
["Feld",7,"Felt",3],
["Held",7,"Helt",3],
["Geld",7,"Gelt",3],
["wild",7,"wilt",3],
["Bild",7,"Bilt",3],
["blind",7,"blint",3],
["Rad",7,"Rat",3],
["Bad",7,"Bat",3],
["Pfad",7,"Pfat",3],
["Abend",7,"Abent",3],
["Stab",7,"Stap",3],
["Staub",7,"Stoup",3],
["Laub",7,"Loup",3],
["Korb",7,"Korp",3],
["Kalb",7,"Kalp",3],
["halb",7,"halp",3],
["gelb",7,"gelp",3],
["grob",7,"grop",3],
["taub",7,"taup",3],
["Tag",7,"Tak",3],
["Weg",7,"Wek",3],
["Berg",7,"Berk",3],
["Zug",7,"Zuk",3],
["Flug",7,"Fluk",3],
["Burg",7,"Burk",3],
["klug",7,"kluk",3],
["Sieg",7,"Siek",3],
["Krieg",7,"Kriek",3],
["Zweig",7,"Zweik",3],
["zeigt",7,"zeikt",3],
["sagt",7,"sakt",3],
["trägt",7,"träkt",3],
["liegt",7,"liekt",3],
["steigt",7,"steikt",3],
["fliegt",7,"fliekt",3],
["gibt",7,"gibd",3],
["bleibt",7,"bleibd",3],
["lebt",7,"lebd",3],
["liebt",7,"liebd",3],
["backen",6,"baken",4],
["Bäcker",6,"Bäker",4],
["packen",6,"paken",3],
["stecken",6,"steken",3],
["wecken",6,"weken",3],
["drücken",6,"drüken",3],
["Brücke",6,"Brüke",3],
["Glück",6,"Glük",3],
["Stück",6,"Stük",3],
["Rücken",6,"Rüken",3],
["Fleck",6,"Flek",3],
["Decke",6,"Deke",3],
["Socke",6,"Soke",3],
["Rock",6,"Rok",3],
["Sack",6,"Sak",3],
["Mücke",6,"Müke",3],
["Lücke",6,"Lüke",3],
["Ecke",6,"Eke",3],
["nicken",6,"niken",3],
["zucken",6,"zuken",3],
["schlucken",6,"schluken",3],
["Zucker",6,"Zuker",4],
["Acker",6,"Aker",3],
["Schnecke",6,"Schneke",3],
["hocken",6,"hoken",3],
["locken",6,"loken",3],
["Jacke",6,"Jake",3],
["Recke",6,"Reke",3],
["Mütze",6,"Mütse",4],
["Katze",6,"Katse",4],
["Hitze",6,"Hitse",4],
["Netz",6,"Nets",4],
["Satz",6,"Sats",4],
["Platz",6,"Plats",4],
["Schutz",6,"Schuts",4],
["Witz",6,"Wits",4],
["Blitz",6,"Blits",4],
["Schatz",6,"Schats",4],
["Gesetz",6,0,4],
["jetzt",6,"jezt",4],
["sitzen",6,"sitsen",4],
["setzen",6,"setsen",4],
["putzen",6,"putsen",4],
["schätzen",6,"schätsen",4],
["nützen",6,"nütsen",4],
["verletzen",6,"verletsen",4],
["ersetzen",6,"ersetsen",4],
["Straße",8,"Strase",4],
["Spaß",8,"Spass",4],
["Fuß",8,"Fuss",4],
["groß",8,"gross",4],
["heiß",8,"heiss",4],
["süß",8,"süss",4],
["bloß",8,"bloss",4],
["außen",8,"aussen",4],
["außer",8,"ausser",4],
["heißen",8,"heisen",4],
["reißen",8,"reisen",4],
["beißen",8,"beisen",4],
["schießen",8,"schiesen",4],
["fließen",8,"fliesen",4],
["gießen",8,"giesen",4],
["genießen",8,"geniesen",4],
["stoßen",8,"stosen",4],
["Maß",8,"Mass",4],
["Hass",8,"Haß",4],
["Schloss",8,"Schloß",4],
["Biss",8,"Biß",4],
["Riss",8,"Riß",4],
["Fluss",8,"Fluß",4],
["Kuss",8,"Kuß",4],
["reisen",8,"reißen",5],
["lesen",8,"leßen",4],
["Hose",8,"Hoße",4],
["Nase",8,"Naße",4],
["Weise",8,"Weisse",4],
["rasieren",8,"rassieren",4],
["das Laufen",9,"das laufen",4],
["das Schreiben",9,"das schreiben",4],
["das Lernen",9,"das lernen",4],
["das Beste",9,"das beste",4],
["das Schöne",9,"das schöne",4],
["etwas Interessantes",9,"etwas interessantes",5],
["nichts Neues",9,"nichts neues",5],
["im Allgemeinen",9,"im allgemeinen",5],
["auf Deutsch",9,"auf deutsch",4],
["auf Englisch",9,"auf englisch",4],
["morgen früh",9,"Morgen früh",4],
["heute Abend",9,"heute abend",4],
["heute Morgen",9,"heute morgen",4],
["schuld sein",9,"Schuld sein",4],
["recht haben",9,"Recht haben",4],
["essen gehen",9,"Essen gehen",5],
["kennen lernen",9,"Kennen lernen",5],
["die Freude",9,"die freude",3],
["der Mut",9,"der mut",3],
["die Stärke",9,"die stärke",3],
["vergessen",4,"fergessen",3],
["verstehen",4,"ferstehen",3],
["versuchen",4,"fersuchen",3],
["verlieren",4,"ferlieren",3],
["verantworten",4,"ferantworten",3],
["vertrauen",4,"fertrauen",3],
["besuchen",4,"besuhen",3],
["beginnen",4,0,3],
["bekommen",4,"bekomen",3],
["bedeuten",4,0,3],
["beachten",4,0,3],
["gewinnen",4,0,3],
["gehören",4,0,4],
["gefallen",4,"gefalen",4],
["Geschichte",4,"Geshichte",3],
["Gedanke",4,0,3],
["Gesicht",4,0,3],
["Gesetz",4,0,4],
["entscheiden",4,0,3],
["entwickeln",4,0,3],
["entlassen",4,"entlasen",4],
["erklären",4,0,3],
["erkennen",4,"erkenen",4],
["erreichen",4,0,4],
["erfahren",4,0,4],
["Erfahrung",4,0,4],
["zerreißen",4,"zerreifen",4],
["zerstören",4,0,3],
["zusammen",4,0,4],
["zunächst",4,0,3],
["Zusammenhang",4,0,3],
["übertragen",4,0,3],
["übernehmen",4,"übernemen",4],
["übersetzen",4,"übersetsen",4],
["untersuchen",4,0,3],
["unterscheiden",4,0,3],
["unterstützen",4,0,4],
["aufmerksam",4,0,3],
["aufgeben",4,0,3],
["ausführen",4,0,4],
["aussuchen",4,0,3],
["mitmachen",4,0,2],
["nachdenken",4,0,3],
["vorstellen",4,0,3],
["Vorstellung",4,0,3],
["hinzufügen",4,0,3],
["herstellen",4,"herstelen",3],
["ablehnen",4,"ablenen",4],
["abbrechen",4,"abrechen",4],
["Schule",10,0,1],
["Klasse",10,"Klase",3],
["Heft",10,0,1],
["Buch",10,0,1],
["Stift",10,0,1],
["Tafel",10,0,1],
["Lineal",10,0,2],
["Schere",10,0,1],
["Lehrer",10,"Lerer",3],
["Aufgabe",10,0,2],
["Mutter",10,"Muter",3],
["Vater",10,0,2],
["Eltern",10,0,2],
["Kind",10,"Kint",3],
["Bruder",10,0,2],
["Schwester",10,0,2],
["Oma",10,0,1],
["Opa",10,0,1],
["Familie",10,0,2],
["Freund",10,"Freunt",3],
["Hund",10,"Hunt",3],
["Katze",10,"Katse",4],
["Vogel",10,0,2],
["Fisch",10,0,1],
["Pferd",10,0,2],
["Maus",10,"Mous",2],
["Kuh",10,"Ku",4],
["Schwein",10,"Schwain",2],
["Schaf",10,0,1],
["Löwe",10,"Löve",2],
["rot",10,"rod",2],
["blau",10,"blou",2],
["gelb",10,"gelp",3],
["grün",10,0,2],
["schwarz",10,0,2],
["weiß",10,"weiss",4],
["grau",10,0,2],
["braun",10,"broun",2],
["rosa",10,"roza",1],
["lila",10,0,1],
["orange",10,"oransche",3],
["violett",10,0,3],
["eins",10,0,1],
["zwei",10,"zwo",2],
["drei",10,"drai",1],
["vier",10,"fier",2],
["fünf",10,0,2],
["sechs",10,0,2],
["sieben",10,"siben",2],
["acht",10,0,1],
["neun",10,0,2],
["zehn",10,"zehen",3],
["zwölf",10,0,2],
["zwanzig",10,0,2],
["dreißig",10,"dreisig",4],
["vierzig",10,"fierzig",3],
["fünfzig",10,0,3],
["hundert",10,0,2],
["tausend",10,0,3],
["Kopf",10,0,1],
["Auge",10,"Ouge",2],
["Nase",10,"Naße",3],
["Mund",10,"Munt",3],
["Ohr",10,"Or",3],
["Arm",10,0,1],
["Bein",10,"Bain",2],
["Fuß",10,"Fuss",4],
["Hand",10,"Hant",3],
["Finger",10,0,1],
["Herz",10,0,1],
["Bauch",10,"Bouch",2],
["Rücken",10,"Rüken",3],
["Mensch",10,0,1],
["Welt",10,"Weld",2],
["Zeit",10,"Zeig",2],
["Leben",10,"Laben",2],
["Haus",10,"Hous",2],
["Stadt",10,"Stat",3],
["Land",10,"Lant",3],
["Wasser",10,"Waßer",3],
["Feuer",10,"Feier",3],
["Luft",10,"Lufd",2],
["Erde",10,0,1],
["Natur",10,0,2],
["Energie",10,0,3],
["Gesellschaft",10,0,4],
["Möglichkeit",10,0,3],
["Entwicklung",10,0,4],
["Bedeutung",10,0,3],
["Zusammenhang",10,0,3],
["Ergebnis",10,0,3],
["Lösung",10,0,2],
["Beispiel",10,0,4],
["Unterschied",10,0,3],
["Vergleich",10,0,3],
["Zusammenfassung",10,0,3],
["arbeiten",10,0,2],
["helfen",10,0,2],
["lernen",10,0,1],
["schreiben",10,0,2],
["lesen",10,"leßen",3],
["sprechen",10,0,2],
["hören",10,0,2],
["sehen",10,0,3],
["denken",10,0,2],
["wissen",10,"wisen",3],
["verstehen",10,"ferstehen",3],
["erklären",10,0,3],
["beschreiben",10,0,3],
["vergleichen",10,"fergleichen",3],
["entscheiden",10,0,3],
["erreichen",10,0,4],
["vorstellen",10,0,3],
["zusammenfassen",10,0,3],
["überprüfen",10,0,3],
["darstellen",10,0,3],
["wichtig",10,0,2],
["groß",10,"gross",4],
["klein",10,"klain",2],
["schnell",10,"schnel",3],
["langsam",10,0,2],
["schwierig",10,0,3],
["einfach",10,0,2],
["möglich",10,0,2],
["richtig",10,0,2],
["falsch",10,0,2],
["interessant",10,"interresant",3],
["langweilig",10,0,3],
["notwendig",10,"notwenig",3],
["erfolgreich",10,0,3],
["unterschiedlich",10,0,4],
["verantwortlich",10,"ferantwortlich",3],
["selbstständig",10,0,4],
["zuverlässig",10,0,4],
["begeistert",10,0,3],
["Verantwortung",10,"Ferantwortung",3],
["Konsequenz",10,0,4],
["Perspektive",10,0,4],
["Kommunikation",10,"Komunikation",4],
["Demokratie",10,0,3],
["Philosophie",10,"Filosofie",4],
["Hypothese",10,0,4],
["Analyse",10,0,3],
["Synthese",10,"Synthesee",4],
["Interpretation",10,0,4],
["Argumentation",10,0,4],
["Charakteristik",10,0,4],
["Kompromiss",10,0,4],
["Reflexion",10,0,4],
["Motivation",10,0,3],
["Konzentration",10,0,3],
["Verantwortungsbewusstsein",10,"...bewustsein",5],
["Widerspruch",10,0,3],
["Auswirkung",10,0,3],
["Schlussfolgerung",10,0,4],
["Voraussetzung",10,0,4],
["Gegebenheit",10,0,3],
["Schwierigkeit",10,0,4],
["Meinungsverschiedenheit",10,0,5],
["annehmen",10,"annemen",4],
["nachweisen",10,0,3],
["widersprechen",10,0,3],
["unterscheiden",10,0,3],
["hervorheben",10,0,4],
["berücksichtigen",10,0,4],
["veranschaulichen",10,0,3],
["schlussfolgern",10,0,4],
["charakterisieren",10,0,4],
["analysieren",10,0,4],
["formulieren",10,0,3],
["strukturieren",10,0,4],
["argumentieren",10,0,4],
["reflektieren",10,0,4],
["präsentieren",10,0,4],
["recherchieren",10,0,4],
["diskutieren",10,0,4],
["kritisieren",10,0,4],
["dokumentieren",10,0,4],
["interpretieren",10,0,4],
["schlussfolgern",10,0,4],
["Abschnitt",10,0,3],
["Hauptsatz",10,0,4],
["Nebensatz",10,0,4],
["Pronomen",10,0,3],
["Adjektiv",10,0,3],
["Substantiv",10,0,3],
["Konjunktion",10,0,3],
["Prädikat",10,0,3],
["Subjekt",10,0,3],
["Objekt",10,0,3],
["Paragraph",10,"Paragraf",4],
["Kommentar",10,0,4],
["Inhaltsangabe",10,"Inhalltsangabe",3],
["Gedicht",10,0,2],
["Strophe",10,"Strofe",4],
["Metapher",10,"Metafer",4],
["Experiment",10,0,3],
["Diagramm",10,0,4],
["Tabelle",10,"Tabele",3],
["Gleichung",10,0,3],
["Berechnung",10,"Berechtung",3],
["Formel",10,0,2],
["Dreieck",10,0,4],
["Viereck",10,"Fiereck",4],
["Geschwindigkeit",10,0,4],
["Beschleunigung",10,0,4],
["Photosynthese",10,"Fotosynthese",4],
["Chromosom",10,0,4],
["Lehnwort",2,"Lenwort",3],
["fehlerfrei",2,"felerfrei",3],
["Übernahme",2,"Übername",4],
["aufnehmen",2,"aufnemen",3],
["abnehmen",2,"abnemen",3],
["zunehmen",2,"zunemen",3],
["Einnahme",2,"Einname",3],
["Mahlzeit",2,"Malzeit",3],
["Hühner",2,"Hüner",3],
["kühn",2,"kün",3],
["Rehe",2,"Ree",3],
["Reh",2,"Re",4],
["Weh",2,"We",4],
["Zehe",2,"Zee",3],
["Kühe",2,"Küe",3],
["Beziehung",2,0,4],
["beziehen",2,0,4],
["Erziehung",2,0,4],
["erziehen",2,0,4],
["Annäherung",2,0,4],
["Wahrhaftigkeit",2,"Warh.",5],
["wahrhaftig",2,"warh.",5],
["Vorsicht",2,0,2],
["Übersicht",2,0,2],
["Absicht",2,0,2],
["Hahn",2,"Han",3],
["Mohn",2,"Mon",3],
["Krönung",2,0,2],
["Söhne",2,"Söne",3],
["Zähne",2,"Zäne",3],
["Mahd",2,"Mad",4],
["nahm",2,"nam",3],
["zählte",2,"zälte",3],
["Gehalt",2,0,2],
["Inhalt",2,0,2],
["Hafen",2,0,2],
["Hafer",2,0,2],
["Lieferung",1,"Liferung",3],
["liefern",1,"lifern",2],
["Niederlande",1,"Niderlande",3],
["Dienst",1,"Dinst",2],
["Dienstleistung",1,"Dinstleistung",4],
["Friedhof",1,0,4],
["Friedrich",1,"Fridrich",3],
["vielleicht",1,0,4],
["wie viel",1,"wieviel",3],
["Wiederholung",1,"Widerholung",4],
["wiederholen",1,"widerholen",4],
["bestehlen",1,"bestelen",4],
["Riemen",1,"Rimen",2],
["Mieter",1,"Miter",2],
["Vermieter",1,"Fermiter",3],
["Bereich",1,0,4],
["Reich",1,"Riech",4],
["Zeitung",1,"Zeitug",3],
["Beziehung",1,0,4],
["Spielzeug",1,"Spilzeug",3],
["Stieglitz",1,"Stiglitz",5],
["Kieselstein",1,"Kiselstein",4],
["Hilfe",5,0,3],
["Stille",5,"Stile",3],
["Hülle",5,"Hüle",3],
["Fülle",5,"Füle",3],
["Grille",5,"Grile",3],
["Pille",5,"Pile",3],
["Brillant",5,"Briljant",4],
["Gott",5,"Got",3],
["Ritter",5,"Riter",3],
["bitter",5,"biter",3],
["Zitter",5,"Ziter",3],
["zittern",5,"zitern",3],
["Otter",5,"Oter",3],
["Euter",5,"Eutter",3],
["Flotte",5,"Flote",3],
["flott",5,"flot",3],
["Watte",5,"Wate",3],
["matt",5,"mat",3],
["glatt",5,"glat",3],
["Gitter",5,"Giter",3],
["Kittel",5,"Kitel",3],
["Mittel",5,"Mitel",3],
["mittels",5,"mitels",3],
["Kette",5,"Kete",3],
["Latte",5,"Late",3],
["retten",5,"reten",3],
["wetten",5,"weten",3],
["Gewitter",5,"Gewiter",3],
["Sitte",5,"Site",3],
["Sippe",5,"Sipe",3],
["Lippe",5,"Lipe",3],
["Kippe",5,"Kipe",3],
["knapp",5,"knap",3],
["Rippe",5,"Ripe",3],
["Knappe",5,"Knape",3],
["Mappe",5,"Mape",3],
["Rappe",5,"Rape",3],
["Kappe",5,"Kape",3],
["Pappe",5,"Pape",3],
["Steppe",5,"Stepe",3],
["schlapp",5,"schlap",3],
["Krampf",5,0,2],
["Dummheit",5,"Dumheit",3],
["dumm",5,"dum",3],
["Summe",5,"Sume",3],
["Klemme",5,"Kleme",3],
["Flamme",5,"Flame",3],
["Schwämme",5,"Schwäme",3],
["Grimm",5,"Grim",3],
["grimmig",5,"grimig",3],
["Schlamm",5,"Schlam",3],
["Schwamm",5,"Schwam",3],
["schlimm",5,"schlim",3],
["Atem",5,0,3],
["Atom",5,0,3],
["Abfluss",5,"Abflus",3],
["Abschluss",5,"Abschlus",3],
["Anschluss",5,"Anschlus",3],
["Ausfluss",5,"Ausflus",3],
["Genuss",5,"Genuß",4],
["Überfluss",5,"Überfluß",4],
["auffassen",5,"aufasen",4],
["abfassen",5,"abfasen",3],
["erfassen",5,"erfasen",3],
["umfassen",5,"umfasen",3],
["zulassen",5,"zulasen",3],
["verlassen",5,"velasen",3],
["überlassen",5,"überlasen",3],
["abwässern",5,"abwäsern",3],
["wässern",5,"wäsern",3],
["Rand",7,"Rant",3],
["Stand",7,"Stant",3],
["Strand",7,"Strant",3],
["Grund",7,"Grunt",3],
["Wunde",7,"Wunte",3],
["Herd",7,"Hert",3],
["Nord",7,"Nort",3],
["Süd",7,"Süt",3],
["Grad",7,"Grat",3],
["Leid",7,"Leit",3],
["Maid",7,"Mait",3],
["Kleid",7,"Kleit",3],
["Bescheid",7,"Bescheit",3],
["Neid",7,"Neit",3],
["Mord",7,"Mort",3],
["Mond",7,"Mont",3],
["Pfund",7,"Pfunt",3],
["Wand",7,"Want",3],
["rund",7,"runt",3],
["gesund",7,"gesunt",3],
["sparsam",7,"sparsa",2],
["Druck",7,"Drugg",3],
["Glück",7,"Glüg",3],
["Fleck",7,"Flegg",3],
["Block",7,"Blogg",3],
["Stock",7,"Stogg",3],
["Blick",7,"Bligg",3],
["Trick",7,"Trigg",3],
["Werk",7,0,3],
["stark",7,0,3],
["weich",7,"weig",3],
["flicken",6,"fliken",3],
["kleckern",6,"klekern",3],
["lecken",6,"leken",3],
["recken",6,"reken",3],
["knicken",6,"kniken",3],
["stricken",6,"striken",3],
["picken",6,"piken",3],
["ticken",6,"tiken",3],
["hacken",6,"haken",3],
["knacken",6,"knaken",3],
["zwicken",6,"zwiken",3],
["schicken",6,"schiken",3],
["blicken",6,"bliken",3],
["Brocken",6,"Broken",3],
["Hacke",6,"Hake",3],
["Lückentext",6,"Lükentext",4],
["Rucksack",6,"Ruksack",4],
["abknicken",6,"abkniken",3],
["erschrecken",6,"erschreken",3],
["überbrücken",6,"überbrüken",4],
["entrücken",6,"entrüken",4],
["Abkürzung",6,0,4],
["abkürzen",6,0,4],
["besetzen",6,"besetsen",4],
["aussetzen",6,"aussetsen",4],
["einsetzen",6,"einsetsen",4],
["umsetzen",6,"umsetsen",4],
["einschätzen",6,"einschätsen",4],
["unterschätzen",6,"unterschätsen",4],
["überschätzen",6,"überschätsen",4],
["Sitzung",6,0,4],
["Besetzung",6,0,4],
["Verletzung",6,0,4],
["Übersetzung",6,0,4],
["Einschätzung",6,0,4],
["Schätzung",6,0,4],
["Nutzung",6,0,4],
["Stützung",6,0,4],
["Maßnahme",8,"Masnahme",5],
["Maßstab",8,"Masstab",4],
["Ausmaß",8,0,4],
["Übermaß",8,0,4],
["Abreißen",8,"Abreisen",4],
["Losreißen",8,"Losreisen",4],
["aufschließen",8,"aufschliesen",5],
["abschließen",8,"abschliesen",5],
["einschließen",8,"einschliesen",5],
["ausschließen",8,"ausschliesen",5],
["beschließen",8,"beschliesen",4],
["Abschluss",8,"Abschluß",4],
["Anschluss",8,"Anschluß",4],
["Aufschluss",8,"Aufschluß",4],
["Zusammenschluss",8,"Zusammenschluß",5],
["Beschluss",8,"Beschluß",4],
["Entschluss",8,"Entschluß",4],
["Vorsatz",8,0,4],
["Grundsatz",8,0,4],
["Leitspruch",8,0,3],
["Süßigkeit",8,"Süssigkeit",4],
["Süßspeise",8,"Süssspeise",5],
["Fußball",8,"Fussball",4],
["Fußgänger",8,"Fussgänger",4],
["Straßenbahn",8,"Strasenbahn",5],
["Gewissen",8,"Gewisen",3],
["vergessen",8,"fergessen",4],
["besessen",8,"besesen",4],
["Prozess",8,0,4],
["Adresse",8,"Adrese",4],
["Interesse",8,"Intresse",4],
["passieren",8,"pasieren",4],
["interessieren",8,"interesieren",5],
["im Freien",9,"im freien",4],
["ins Blaue",9,"ins blaue",4],
["zum Besten",9,"zum besten",4],
["auf dem Laufenden",9,"auf dem laufenden",5],
["aufs Neue",9,"aufs neue",4],
["fürs Erste",9,"fürs erste",4],
["im Nachhinein",9,"im nachhinein",5],
["eines Tages",9,"eines tages",4],
["abends",9,"Abends",4],
["morgens",9,"Morgens",4],
["mittags",9,"Mittags",4],
["nachts",9,"Nachts",4],
["montags",9,"Montags",4],
["ein bisschen",9,"ein Bisschen",4],
["das Äußere",9,"das äußere",4],
["das Innere",9,"das innere",4],
["etwas Wichtiges",9,"etwas wichtiges",5],
["alles Gute",9,"alles gute",4],
["der Erste",9,"der erste",4],
["als Letztes",9,"als letztes",4],
["aufs Geratewohl",9,"aufs geratewohl",5],
["in Bezug auf",9,"in bezug auf",5],
["mit Bezug auf",9,"mit bezug auf",5],
["enttäuschen",4,0,4],
["Enttäuschung",4,0,4],
["entfernen",4,0,3],
["entgegen",4,0,3],
["enthalten",4,0,3],
["entsprechen",4,0,3],
["entnehmen",4,"entnemen",4],
["entstehen",4,0,4],
["erhalten",4,0,3],
["erlauben",4,0,3],
["ermöglichen",4,0,3],
["erscheinen",4,0,3],
["erwarten",4,0,3],
["erweisen",4,0,3],
["erzählen",4,0,4],
["Erzählung",4,0,4],
["vollständig",4,0,4],
["Vollständigkeit",4,0,4],
["angemessen",4,0,4],
["anscheinend",4,0,3],
["ausreichend",4,0,3],
["ausgezeichnet",4,0,4],
["Umgebung",4,"umgebung",3],
["Misserfolg",4,"Miserfolg",4],
["misslingen",4,"mislingen",4],
["missverstehen",4,"misverstehen",5],
["Missverständnis",4,"Misverständnis",5],
["weitgehend",4,0,4],
["weitreichend",4,0,4],
["Arbeit",10,0,2],
["Beruf",10,0,2],
["Wirtschaft",10,0,2],
["Politik",10,0,2],
["Kultur",10,0,2],
["Bildung",10,0,2],
["Gesundheit",10,0,3],
["Umwelt",10,0,2],
["Technik",10,0,3],
["Freiheit",10,0,3],
["Gleichheit",10,0,4],
["Gerechtigkeit",10,0,4],
["Sicherheit",10,0,3],
["Zuverlässigkeit",10,0,5],
["Kreativität",10,0,4],
["Globalisierung",10,0,4],
["Nachhaltigkeit",10,0,5],
["Digitalisierung",10,0,4],
["Gebirge",10,0,3],
["Wüste",10,0,2],
["Fluss",10,"Fluß",4],
["Küste",10,0,2],
["Tal",10,"Thal",3],
["Wald",10,"Walt",3],
["Wiese",10,"Wise",2],
["Vulkan",10,0,3],
["Atmosphäre",10,0,4],
["Ökosystem",10,0,4],
["Klimawandel",10,0,3],
["Erdbeben",10,0,2],
["Kontinente",10,0,3],
["Kaufmann",10,"Kaufman",3],
["Kauffrau",10,0,3],
["Rechtsanwalt",10,0,3],
["Bürgermeister",10,0,3],
["Bundeskanzler",10,0,3],
["Abgeordneter",10,0,3],
["Bundesregierung",10,0,4],
["Nachricht",10,0,2],
["Zeitung",10,0,2],
["Fernsehen",10,0,3],
["Zeitschrift",10,0,3],
["Informationen",10,0,3],
["Veröffentlichung",10,0,4],
["Bewerbung",10,0,3],
["Ausbildung",10,0,3],
["Weiterbildung",10,0,3],
["Wissenschaft",10,0,4],
["Forschung",10,0,2],
["Erkenntnis",10,0,4],
["Untersuchung",10,0,3],
["Beobachtung",10,0,3],
["Aufzeichnung",10,0,3],
["Auswertung",10,0,3],
["Grundlage",10,0,3],
["Grundsatz",10,0,4],
["Addition",10,"Adition",4],
["Subtraktion",10,0,3],
["Multiplikation",10,0,4],
["Division",10,"Divison",3],
["Bruchrechnung",10,0,3],
["Dezimalzahl",10,0,4],
["Rechnung",10,0,2],
["Prozent",10,0,3],
["Wahrscheinlichkeit",10,0,5],
["Verhältnis",10,0,3],
["Durchschnitt",10,0,4],
["Summe",10,"Sume",3],
["Differenz",10,0,4],
["Produkt",10,0,3],
["Quotient",10,0,4],
["Mittelalter",10,0,4],
["Aufklärung",10,0,3],
["Revolution",10,0,3],
["Kolonialismus",10,0,4],
["Industrialisierung",10,0,5],
["Verfassung",10,0,4],
["Menschenrechte",10,0,3],
["Grundgesetz",10,0,4],
["Parlamentarismus",10,0,4],
["Bürgerrechte",10,0,4],
["Organismus",10,0,3],
["Zelle",10,"Zele",3],
["Zellkern",10,"Zelkern",4],
["Evolution",10,0,3],
["Verdauung",10,0,3],
["Blutkreislauf",10,0,3],
["Atmungssystem",10,0,4],
["Immunsystem",10,0,4],
["Verbindung",10,0,2],
["Reaktion",10,0,3],
["Aggregatzustand",10,0,5],
["Aggregation",10,"Agregation",4],
["Magnetismus",10,0,4],
["Elektrizität",10,0,4],
["Schwerkraft",10,0,2],
["Wellenlänge",10,"Welenlänge",4],
["Frequenz",10,0,4],
["Unternehmen",10,0,4],
["Aktionär",10,0,3],
["Kapitalismus",10,0,4],
["Gewinn",10,0,3],
["Verlust",10,0,2],
["Investition",10,0,4],
["Beschäftigung",10,0,3],
["Arbeitslosigkeit",10,0,4],
["Steuererhöhung",10,0,5],
["Inflation",10,0,3],
["Rechtschreibung",10,0,3],
["Grammatik",10,0,4],
["Zeichensetzung",10,0,4],
["Satzzeichen",10,0,4],
["Aufsatz",10,0,4],
["Erörterung",10,0,3],
["Beschreibung",10,0,3],
["Charakterisierung",10,0,4],
["Textanalyse",10,0,4],
["Gedichtinterpretation",10,0,5],
["Sprachkompetenz",10,0,4],
["Wortschatz",10,0,4],
["Grammatikfehler",10,0,4],
["Fremdsprache",10,0,2],
["Muttersprache",10,0,3],
["abbilden",10,0,2],
["abbrechen",10,"abrechen",4],
["ableiten",10,0,3],
["abschreiben",10,0,3],
["achten",10,0,2],
["anbieten",10,0,3],
["andeuten",10,0,3],
["anfordern",10,0,2],
["anlegen",10,0,2],
["anpassen",10,0,3],
["anwenden",10,0,2],
["auflösen",10,0,2],
["aufzeigen",10,0,3],
["ausdrücken",10,0,4],
["auslösen",10,0,2],
["auswählen",10,0,4],
["beachten",10,0,2],
["beantworten",10,0,2],
["begründen",10,0,2],
["behalten",10,0,2],
["bemerken",10,0,2],
["benutzen",10,"benutsen",4],
["beraten",10,0,2],
["bestätigen",10,0,3],
["bewegen",10,0,2],
["beweisen",10,0,3],
["bezeichnen",10,0,3],
["bilden",10,0,2],
["durchführen",10,0,4],
["einhalten",10,0,2],
["einleiten",10,0,3],
["einteilen",10,0,3],
["einwirken",10,0,2],
["entwickeln",10,0,4],
["festhalten",10,0,2],
["feststellen",10,"feststelen",3],
["gelingen",10,0,2],
["gestalten",10,0,2],
["gliedern",10,0,3],
["herausfinden",10,"rausfinden",2],
["herstellen",10,"herstelen",3],
["hinweisen",10,0,3],
["nachvollziehen",10,"nachfolziehen",4],
["nennen",10,"nenen",3],
["prüfen",10,0,2],
["sammeln",10,"sameln",3],
["stützen",10,"stütsen",4],
["übertragen",10,0,3],
["umgehen",10,0,4],
["verdeutlichen",10,0,3],
["vereinfachen",10,0,3],
["verfassen",10,0,4],
["vorgehen",10,0,4],
["zeichnen",10,0,3],
["zuordnen",10,0,2],
["zurückführen",10,0,4],
["zusammenstellen",10,"zusammenstelen",3],
["ähnlich",10,"änlich",3],
["ausführlich",10,0,4],
["eigenständig",10,0,3],
["einheitlich",10,0,3],
["entsprechend",10,0,3],
["erheblich",10,0,3],
["fähig",10,0,2],
["gründlich",10,0,3],
["inhaltlich",10,0,3],
["konsequent",10,0,4],
["kreativ",10,0,3],
["logisch",10,0,2],
["nachhaltig",10,0,4],
["objektiv",10,0,3],
["offensichtlich",10,0,4],
["praktisch",10,0,2],
["sachlich",10,0,2],
["sorgfältig",10,0,3],
["spezifisch",10,0,3],
["systematisch",10,0,3],
["typisch",10,0,3],
["umfangreich",10,0,3],
["umfassend",10,0,4],
["verständlich",10,0,3],
["wesentlich",10,0,3],
["wirkungsvoll",10,"wirkungsvol",3],
["wissenschaftlich",10,0,4],
["zutreffend",10,0,4],
["Prüfung",10,0,2],
["Hausaufgabe",10,0,2],
["Klassenarbeit",10,"Klasenarbeit",3],
["Schulaufgabe",10,0,2],
["Überschrift",10,0,3],
["Fachbegriff",10,0,4],
["Fachvokabular",10,0,4],
["Lernziel",10,0,3],
["Unterricht",10,0,2],
["Verständnis",10,0,3],
["Bewertung",10,0,2],
["Beurteilung",10,0,3],
["Zeugnis",10,0,3],
["Halbjahr",10,0,4],
["Schuljahr",10,0,4],
["Nachhilfe",10,0,4],
["Lerngruppe",10,0,4],
["Klassenraum",10,"Klasenraum",4],
["Schulbuch",10,0,2],
["Mannschaft",10,"Manschaft",3],
["Wettkampf",10,"Wetkampf",3],
["Meisterschaft",10,0,3],
["Wettbewerb",10,"Wetbewerb",3],
["Sportplatz",10,0,4],
["Schiedsrichter",10,0,3],
["Niederlage",10,0,3],
["Halbzeit",10,0,3],
["Aufstellung",10,0,3],
["Training",10,0,3],
["Schwimmbad",10,"Schwimbad",4],
["Fitnessstudio",10,0,4],
["Arzt",10,0,3],
["Krankenhaus",10,0,2],
["Medikament",10,0,3],
["Behandlung",10,0,2],
["Impfung",10,0,2],
["Allergie",10,"Alergie",4],
["Entzündung",10,0,4],
["Erkältung",10,0,3],
["Krankheit",10,0,2],
["Verletzung",10,0,4],
["Schmerzen",10,0,4],
["Temperatur",10,0,3],
["Diagnose",10,0,3],
["Therapie",10,"Terapie",4],
["Psychiatrie",10,0,5],
["Computer",10,0,3],
["Software",10,0,3],
["Internet",10,0,2],
["Tastatur",10,0,2],
["Bildschirm",10,0,2],
["Programm",10,0,3],
["Algorithmus",10,"Algoritmus",4],
["Datenverarbeitung",10,0,4],
["Netzwerk",10,0,4],
["Programmierung",10,"Programierung",4],
["Schnittstelle",10,"Schnitstelle",5],
["Dateiverwaltung",10,"Datei-...",4],
["Verschlüsselung",10,0,4],
["aufpassen",10,0,3],
["aufräumen",10,0,3],
["Bescheid wissen",10,"Bescheit wissen",3],
["Fortschritte machen",10,0,4],
["in Frage stellen",10,"in frage stellen",3],
["zur Verfügung stehen",10,"zur verfügung",3],
["in Anspruch nehmen",10,"in anspruch",3],
["zum Ausdruck bringen",10,"zum ausdruck",3],
["Thema",10,"Tema",3],
["Theorie",10,"Teorie",4],
["These",10,"Tese",3],
["Thesen",10,"Tesen",3],
["Phase",10,"Fase",3],
["Phrase",10,"Frase",4],
["Physik",10,"Fisik",4],
["Fotograf",10,"Photograph",4],
["Rhythmus",10,"Rithmus",5],
["Mathematik",10,"Matematik",3],
["Chemie",10,0,4],
["Cholesterin",10,"Kolesterin",4],
["Chronik",10,"Kronik",4],
["Chaos",10,"Kaos",4],
["chaotisch",10,"kaotisch",4],
["Mechanik",10,"Mekanik",4],
["Psychologie",10,"Psikologie",5],
["Ökologie",10,0,4],
["Biologie",10,0,3],
["Geographie",10,"Geografie",4],
["Pädagogik",10,0,4],
["Linguistik",10,0,4],
["Rhetorik",10,"Retorik",4],
["Hymne",10,"Himne",4],
["Symphonie",10,"Simfonie",5],
["Gymnasium",10,0,4],
["Bundesverfassung",10,0,4],
["Rechtsstaatlichkeit",10,0,5],
["Gewaltenteilung",10,0,4],
["Meinungsfreiheit",10,0,4],
["Pressefreiheit",10,0,4],
["Religionsfreiheit",10,0,4],
["Versammlungsfreiheit",10,"Versamlungsfreiheit",5],
["Gewissensfreiheit",10,0,5],
["Redefreiheit",10,0,4],
["Gleichberechtigung",10,0,4],
["Eigenverantwortung",10,0,4],
["Selbstbestimmung",10,0,4],
["Auseinandersetzung",10,0,5],
["Wechselwirkung",10,0,3],
["Interessenkonflikt",10,0,4],
["Bevölkerungsentwicklung",10,"...entwicklung",5],
["Wirtschaftswachstum",10,0,4],
["Umweltverschmutzung",10,0,5],
["Klimaschutzpolitik",10,0,4],
["Zukunftsperspektive",10,0,4],
["zunächst",10,0,3],
["anschließend",10,0,4],
["schließlich",10,0,4],
["zusammenfassend",10,0,4],
["abschließend",10,0,4],
["einerseits",10,0,3],
["andererseits",10,0,3],
["zum einen",10,"zum Einen",3],
["zum anderen",10,"zum Anderen",3],
["ebenso",10,0,2],
["hingegen",10,0,2],
["dagegen",10,0,2],
["dennoch",10,0,3],
["allerdings",10,0,3],
["infolgedessen",10,0,4],
["dementsprechend",10,0,3],
["demzufolge",10,0,3],
["diesbezüglich",10,0,4],
["letzten Endes",10,"letzten endes",3],
["gleichzeitig",10,0,3],
["folglich",10,0,2],
["beispielsweise",10,0,5],
["unter anderem",10,"unter Anderem",3],
["im Gegensatz dazu",10,"...",3],
["in diesem Zusammenhang",10,"...",3],
["Frühstück",10,"Früstück",4],
["Mittagessen",10,"Mitagessen",4],
["Abendessen",10,0,3],
["Getränk",10,0,2],
["Mahlzeit",10,"Malzeit",3],
["Einkauf",10,0,2],
["Wohnung",10,"Wonung",3],
["Schlafzimmer",10,"Schlafzimer",3],
["Kühlschrank",10,0,3],
["Waschmaschine",10,0,2],
["Straßenbahn",10,"Strasenbahn",4],
["Führerschein",10,"Fürerschein",4],
["Ausweise",10,0,3],
["Reisepass",10,"Reisepas",4],
["Geburtsurkunde",10,0,3],
["Krankenversicherung",10,0,4],
["Rentenversicherung",10,0,4],
["Sozialversicherung",10,0,4],
["Arbeitgeber",10,0,3],
["Arbeitnehmer",10,"Arbeitnemer",4],
["kochen",10,0,1],
["waschen",10,0,1],
["schlafen",10,0,1],
["aufwachen",10,0,2],
["anziehen",10,0,4],
["einkaufen",10,0,2],
["bezahlen",10,0,3],
["spazieren",10,"spaziern",3],
["telefonieren",10,0,3],
["fotografieren",10,0,3],
["sparen",10,"spahren",3],
["verdienen",10,0,3],
["ausgeben",10,0,2],
["überweisen",10,0,3],
["versichern",10,0,2],
["wählen",10,0,3],
["abstimmen",10,0,3],
["kandidieren",10,0,3],
["regieren",10,0,3],
["verwalten",10,0,2],
["aufgeregt",10,0,2],
["ängstlich",10,0,3],
["mutig",10,0,1],
["tapfer",10,0,1],
["freundlich",10,0,3],
["höflich",10,0,2],
["ehrlich",10,0,3],
["pünktlich",10,0,3],
["fleißig",10,0,4],
["faul",10,"foul",2],
["lustig",10,0,1],
["traurig",10,0,2],
["wütend",10,0,2],
["stolz",10,0,1],
["neugierig",10,0,4],
["geduldig",10,0,2],
["ungeduldig",10,0,2],
["verständnisvoll",10,0,3],
["rücksichtsvoll",10,0,4]
];

// Monster → Kategorien-Mapping
const MONSTER_CATS = {
  nebelwurm: [1, 2],
  spiegelgeist: [3, 4],
  doppeltroll: [5, 6],
  schattenfuerst: [7, 8],
  regelbrecher: [9],
  wortfresser: [10],
};

const STAR_TO_DIFF = { 1: "leicht", 2: "leicht", 3: "mittel", 4: "hart", 5: "hart" };

function getWordsForMonster(monsterId, difficulty) {
  const cats = MONSTER_CATS[monsterId];
  if (!cats) return [];
  const primary = W.filter(w => cats.includes(w[1]) && STAR_TO_DIFF[w[3]] === difficulty);
  if (primary.length >= 10) return primary;
  // Fallback: adjacent difficulties
  const order = { leicht: ["leicht","mittel","hart"], mittel: ["mittel","leicht","hart"], hart: ["hart","mittel","leicht"] };
  const pool = [];
  const seen = new Set();
  for (const d of order[difficulty]) {
    for (const w of W) {
      if (cats.includes(w[1]) && STAR_TO_DIFF[w[3]] === d && !seen.has(w[0])) {
        pool.push(w);
        seen.add(w[0]);
      }
    }
  }
  return pool;
}

// Baut eine 8-Runden-Queue, gewichtet nach fälligen SM-2-Wörtern pro Monster
function buildSessionQueue(difficulty, wordStats) {
  const today = new Date().toISOString().split("T")[0];

  // Wie viele fällige/neue Wörter hat jedes Monster?
  const scored = MONSTERS.map(m => {
    const words = getWordsForMonster(m.id, difficulty);
    const dueCount = words.filter(w => {
      const s = wordStats[w[0]];
      return !s || s.dueDate <= today;
    }).length;
    return { monster: m, dueCount: Math.max(dueCount, 1) }; // min 1 damit jedes Monster erreichbar bleibt
  }).sort((a, b) => b.dueCount - a.dueCount);

  // Verteile SESSION_ROUNDS Slots proportional zu dueCount
  const totalDue = scored.reduce((s, x) => s + x.dueCount, 0);
  const slots = scored.map(x => ({
    monster: x.monster,
    slots: Math.max(1, Math.round((x.dueCount / totalDue) * SESSION_ROUNDS)),
  }));

  // Normalisiere auf genau SESSION_ROUNDS
  let total = slots.reduce((s, x) => s + x.slots, 0);
  while (total > SESSION_ROUNDS) { slots[slots.length - 1].slots = Math.max(0, slots[slots.length - 1].slots - 1); total--; }
  while (total < SESSION_ROUNDS) { slots[0].slots++; total++; }

  // Erstelle Pool und mische
  const pool = slots.flatMap(x => Array(x.slots).fill(x.monster));
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  // Keine zwei gleichen Monster hintereinander
  for (let i = 1; i < pool.length; i++) {
    if (pool[i].id === pool[i - 1].id) {
      for (let j = i + 1; j < pool.length; j++) {
        if (pool[j].id !== pool[i - 1].id) { [pool[i], pool[j]] = [pool[j], pool[i]]; break; }
      }
    }
  }
  return pool.slice(0, SESSION_ROUNDS);
}

function fisherYates(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ─── SM-2 SPACED REPETITION ─────────────────────────────────────────────── */
// Basierend auf SuperMemo-2 Algorithmus (Wozniak 1990)
// grade: 4 = korrekt, 1 = falsch (vereinfacht für Kinder-Kontext)
function sm2Update(existingCard, correct) {
  const today = new Date().toISOString().split('T')[0];
  const card = existingCard || {
    interval: 0,
    repetition: 0,
    efactor: 2.5,
    dueDate: today,
    totalCorrect: 0,
    totalWrong: 0,
  };

  const grade = correct ? 4 : 1;
  let { interval, repetition, efactor } = card;

  if (grade >= 3) {
    if (repetition === 0)      interval = 1;
    else if (repetition === 1) interval = 6;
    else                       interval = Math.round(interval * efactor);
    repetition++;
  } else {
    // Falsch → morgen nochmal (wie Anki "Again")
    interval = 1;
    repetition = 0;
  }

  efactor = Math.max(1.3, efactor + 0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));

  const due = new Date();
  due.setDate(due.getDate() + interval);
  const dueDate = due.toISOString().split('T')[0];

  return {
    ...card,
    interval,
    repetition,
    efactor,
    dueDate,
    totalCorrect: card.totalCorrect + (correct ? 1 : 0),
    totalWrong:   card.totalWrong   + (correct ? 0 : 1),
  };
}

// Wörter nach Fälligkeit sortieren: überfällig → neu → schon gekonnt
function sortWordsByPriority(words, wordStats) {
  const today = new Date().toISOString().split('T')[0];
  return [...words].sort((a, b) => {
    const sa = wordStats[a[0]];
    const sb = wordStats[b[0]];

    const getPrio = (s) => {
      if (!s) return 1;                     // 1 = neu, hohe Priorität
      if (s.dueDate <= today) return 0;     // 0 = fällig, höchste Priorität
      return 2;                             // 2 = noch nicht fällig
    };

    const pa = getPrio(sa), pb = getPrio(sb);
    if (pa !== pb) return pa - pb;

    // Bei gleicher Prio: mehr Fehler zuerst
    const errA = sa?.totalWrong ?? 0;
    const errB = sb?.totalWrong ?? 0;
    return errB - errA;
  });
}

/* ─── ERROR GENERATOR ─────────────────────────────────────────────────────── */
function generateErrors(word, catId, typicalError) {
  const errs = new Set();
  const lo = word.toLowerCase();

  if (typicalError && typicalError !== 0) errs.add(typicalError);

  switch (catId) {
    case 1: // ie/ih/ieh
      if (lo.includes("ie"))  { errs.add(word.replace(/ie/, "ei")); errs.add(word.replace(/ie/, "i")); errs.add(word.replace(/ie/, "ieh")); }
      if (lo.includes("ei"))  { errs.add(word.replace(/ei/, "ie")); errs.add(word.replace(/ei/, "ai")); }
      if (lo.includes("ih"))  { errs.add(word.replace(/ih/, "i")); errs.add(word.replace(/ih/, "ieh")); }
      if (lo.includes("ieh")) { errs.add(word.replace(/ieh/, "ie")); errs.add(word.replace(/ieh/, "ih")); }
      break;
    case 2: // Dehnungs-h
      { const noH = word.replace(/([aeiouäöü])h([bcdfgklmnprstvwz])/i, "$1$2");
        if (noH !== word) errs.add(noH);
        const addH = word.replace(/([aeiouäöü])([bcdfgklmnprstvwz])/i, "$1h$2");
        if (addH !== word && !lo.includes("h")) errs.add(addH);
        if (lo.includes("eh")) errs.add(word.replace(/eh/, "e"));
        if (lo.includes("ah")) errs.add(word.replace(/ah/, "a"));
        if (lo.includes("oh")) errs.add(word.replace(/oh/, "o"));
        if (lo.includes("uh")) errs.add(word.replace(/uh/, "u"));
      } break;
    case 3: // Funktionswörter
      if (lo.includes("ei")) errs.add(word.replace(/ei/, "ai"));
      if (lo.includes("ie")) errs.add(word.replace(/ie/, "i"));
      if (lo.includes("ch")) errs.add(word.replace(/ch/, "sch"));
      errs.add(word.replace(/d$/, "t")); errs.add(word.replace(/b$/, "p")); errs.add(word.replace(/g$/, "k"));
      if (lo.includes("nn")) errs.add(word.replace(/nn/, "n"));
      if (lo.includes("ss")) errs.add(word.replace(/ss/, "s"));
      break;
    case 4: // Vorsilben/Morpheme
      errs.add(word.replace(/^ver/i, "fer")); errs.add(word.replace(/^vor/i, "for"));
      errs.add(word.replace(/^be/i, "pe")); errs.add(word.replace(/^ge/i, "ke"));
      errs.add(word.replace(/^ent/i, "end")); errs.add(word.replace(/^emp/i, "ent"));
      errs.add(word.replace(/^zer/i, "ser"));
      break;
    case 5: // Doppelkonsonanten
      errs.add(word.replace(/([bcdfgklmnprst])\1/, "$1"));
      { const dbl = word.replace(/([bcdfgklmnprst])([aeiouäöü])/i, "$1$1$2");
        if (dbl !== word) errs.add(dbl); }
      break;
    case 6: // ck/tz
      if (lo.includes("ck")) { errs.add(word.replace(/ck/, "k")); errs.add(word.replace(/ck/, "kk")); }
      if (lo.includes("tz")) { errs.add(word.replace(/tz/, "z")); errs.add(word.replace(/tz/, "zz")); }
      if (/[^c]k/.test(lo)) errs.add(word.replace(/([^c])k/, "$1ck"));
      if (/[^t]z/.test(lo)) errs.add(word.replace(/([^t])z/, "$1tz"));
      break;
    case 7: // Auslautverhärtung
      errs.add(word.replace(/d$/, "t")); errs.add(word.replace(/d([^aeiouäöü])/g, "t$1"));
      errs.add(word.replace(/b$/, "p")); errs.add(word.replace(/g$/, "k"));
      errs.add(word.replace(/t$/, "d")); errs.add(word.replace(/p$/, "b")); errs.add(word.replace(/k$/, "g"));
      break;
    case 8: // s/ss/ß
      if (lo.includes("ß"))  { errs.add(word.replace(/ß/, "ss")); errs.add(word.replace(/ß/, "s")); }
      if (lo.includes("ss")) { errs.add(word.replace(/ss/, "ß"));  errs.add(word.replace(/ss/, "s")); }
      if (/[^s]s[^s]/.test(lo) || /[^s]s$/.test(lo)) {
        errs.add(word.replace(/([^s])s([^s]|$)/, "$1ss$2"));
        errs.add(word.replace(/([^s])s([^s]|$)/, "$1ß$2"));
      }
      break;
    case 9: // Groß-/Kleinschreibung
      if (/^[A-ZÄÖÜ]/.test(word)) errs.add(word[0].toLowerCase() + word.slice(1));
      else errs.add(word[0].toUpperCase() + word.slice(1));
      break;
    case 10: // Allgemeiner Wortschatz
      if (lo.includes("v")) errs.add(word.replace(/v/i, "f"));
      if (lo.includes("f") && !lo.includes("ff")) errs.add(word.replace(/f/i, "v"));
      if (lo.includes("ei")) errs.add(word.replace(/ei/, "ai"));
      if (lo.includes("eu")) errs.add(word.replace(/eu/, "oi"));
      { const dbl = word.replace(/([bcdfgklmnprst])(?!\1)/i, "$1$1");
        if (dbl !== word) errs.add(dbl); }
      break;
  }

  // Fallback
  if (errs.size < 2 && word.length > 2) {
    const i = 1 + Math.floor(Math.random() * (word.length - 2));
    errs.add(word.slice(0, i) + word[i+1] + word[i] + word.slice(i+2));
    if (word.length > 3) errs.add(word.slice(0, i) + word.slice(i+1));
    errs.add(word.slice(0, i) + word[i] + word.slice(i));
  }

  const result = [...errs].filter(e => e && e !== word && e.length > 0);
  return result.length > 0 ? result : [word + word[word.length-1], word.slice(0,-1)];
}

/* ─── BEISPIELSÄTZE ──────────────────────────────────────────────────────── */
// Jedes Wort bekommt einen Kontext-Satz, damit klar ist welches Wort gemeint ist.
// Das Zielwort wird im ChallengePanel als ___ angezeigt.
const SENTENCES = {
  "der": "Das ist ___ Hund von nebenan.",
  "die": "Heute kommt ___ Lehrerin.",
  "das": "Ich lese ___ Buch zum zweiten Mal.",
  "den": "Ich sehe ___ Vogel im Baum.",
  "dem": "Ich gebe ___ Jungen das Buch.",
  "des": "Das Dach ___ Hauses ist rot.",
  "ein": "Da steht ___ Baum im Garten.",
  "eine": "Ich habe ___ Katze gesehen.",
  "einen": "Sie malt ___ Regenbogen.",
  "einem": "Er wohnt in ___ kleinen Haus.",
  "einer": "Das Geschenk ist von ___ Freundin.",
  "ich": "Heute gehe ___ in die Schule.",
  "du": "Kommst ___ morgen mit?",
  "er": "Gestern war ___ im Schwimmbad.",
  "sie": "Heute spielt ___ draußen Fußball.",
  "es": "Heute Morgen hat ___ geregnet.",
  "wir": "Morgen fahren ___ in den Urlaub.",
  "ihr": "Kommt ___ auch zur Party?",
  "mir": "Gibst du ___ bitte das Salz?",
  "dir": "Ich schenke ___ ein Bild.",
  "mich": "Der Hund hat ___ erschreckt.",
  "dich": "Ich habe ___ überall gesucht.",
  "ihn": "Ich sehe ___ jeden Tag in der Schule.",
  "ihm": "Ich gebe ___ einen Apfel.",
  "uns": "Kommst du zu ___?",
  "euch": "Ich besuche ___ am Wochenende.",
  "ihnen": "Wir danken ___ für die Hilfe.",
  "mein": "Das ist ___ Fahrrad.",
  "dein": "Wo ist ___ Rucksack?",
  "sein": "Er hat ___ Heft vergessen.",
  "unser": "Das ist ___ Klassenzimmer.",
  "euer": "Ist das ___ Hund?",
  "und": "Tom ___ Lisa spielen draußen.",
  "aber": "Es regnet, ___ ich gehe trotzdem raus.",
  "oder": "Möchtest du Tee ___ Kakao?",
  "denn": "Ich bleibe zu Hause, ___ ich bin krank.",
  "weil": "Ich freue mich, ___ morgen Ferien sind.",
  "dass": "Ich weiß, ___ du das kannst!",
  "wenn": "Wir bauen einen Schneemann, ___ es schneit.",
  "ob": "Ich frage mich, ___ er kommt.",
  "damit": "Ich übe täglich, ___ ich besser werde.",
  "obwohl": "Er lacht, ___ ihm traurig ist.",
  "sodass": "Es regnete stark, ___ die Straße überflutet war.",
  "während": "Er hört Musik, ___ ich lese.",
  "bevor": "Wasch dir die Hände, ___ du isst.",
  "nachdem": "Wir gingen spazieren, ___ wir gegessen hatten.",
  "seitdem": "Er geht oft raus, ___ er einen Hund hat.",
  "als": "Ich hatte ein Meerschweinchen, ___ ich klein war.",
  "wie": "Sie rennt so schnell ___ der Wind.",
  "auch": "Ich komme ___ gerne mit.",
  "nicht": "Heute scheint die Sonne ___.",
  "noch": "Hast du ___ Hunger?",
  "schon": "Bist du ___ fertig?",
  "nur": "Ich habe ___ einen Euro dabei.",
  "ja": "Kommst du mit? – ___!",
  "nein": "Möchtest du Spinat? – ___!",
  "doch": "Ich will ___ mitmachen!",
  "mal": "Zeig ___ her, was du gebastelt hast.",
  "zwar": "Es ist ___ kalt, aber sonnig.",
  "bloß": "Pass ___ auf!",
  "so": "Genau ___ macht man das richtig.",
  "wo": "Weißt du, ___ er wohnt?",
  "wann": "Ich frage, ___ die Schule anfängt.",
  "warum": "Kannst du mir sagen, ___ du so müde bist?",
  "hier": "Komm ___, setz dich zu mir.",
  "da": "Der Spielplatz liegt ___ drüben.",
  "dort": "Ein Eiswagen steht ___ an der Ecke.",
  "heute": "Wir haben ___ frei.",
  "morgen": "Wir schreiben ___ einen Test.",
  "gestern": "Es hat ___ den ganzen Tag geregnet.",
  "immer": "Er kommt ___ zu spät.",
  "nie": "Sie vergisst ___ ihre Hausaufgaben.",
  "oft": "Wir gehen ___ in den Park.",
  "sehr": "Das Essen schmeckt ___ gut.",
  "ganz": "Der Film war ___ spannend.",
  "mehr": "Ich möchte ___ davon!",
  "viel": "Er hat ___ zu erzählen.",
  "wenig": "Ich habe heute ___ Zeit.",
  "alle": "Auf dem Hof spielen ___ Kinder.",
  "alles": "Zum Glück ist ___ gut gegangen.",
  "nichts": "Hier gibt es ___ zu sehen.",
  "etwas": "Möchtest du ___ trinken?",
  "man": "Hier darf ___ nicht laut sein.",
  "jemand": "Hat ___ meinen Stift gesehen?",
  "niemand": "Als ich ankam, war ___ zu Hause.",
  "selbst": "Das habe ich ___ gemacht!",
  "jetzt": "Wir gehen ___ los.",
  "dann": "Erst essen, ___ spielen.",
  "deshalb": "Es regnet, ___ nehme ich den Schirm.",
  "deswegen": "Er war krank, ___ fehlte er.",
  "trotzdem": "Es ist kalt, ___ gehe ich raus.",
  "außerdem": "Es ist spät, ___ bin ich müde.",
  "zum": "Wir gehen ___ Bäcker.",
  "zur": "Sie läuft ___ Schule.",
  "vom": "Ich komme gerade ___ Arzt.",
  "beim": "Er sitzt ___ Frühstück.",
  "im": "Die Jacke hängt ___ Schrank.",
  "am": "Wir treffen uns ___ Bahnhof.",
  "ins": "Wir gehen ___ Kino.",
  "ans": "Stell die Leiter ___ Fenster.",
  "in": "Das Buch liegt ___ der Tasche.",
  "an": "Das Bild hängt ___ der Wand.",
  "auf": "Die Katze sitzt ___ dem Dach.",
  "aus": "Er kommt ___ der Schule.",
  "bei": "Wir bleiben drinnen, ___ Regen.",
  "mit": "Ich fahre ___ dem Bus.",
  "von": "Das Geschenk ist ___ Oma.",
  "zu": "Ich gehe ___ meiner Freundin.",
  "nach": "Wir gehen ___ dem Essen spazieren.",
  "vor": "Der Hund steht ___ der Tür.",
  "über": "Die Brücke führt ___ den Fluss.",
  "unter": "Die Katze schläft ___ dem Bett.",
  "zwischen": "Der Ball liegt ___ den Stühlen.",
  "durch": "Wir laufen ___ den Wald.",
  "gegen": "Er lehnt sich ___ die Wand.",
  "ohne": "Ich gehe nicht los ___ Frühstück.",
  "seit": "Ich bin erkältet ___ letztem Montag.",
  "bis": "Wir warten ___ morgen.",
  "um": "Der Zaun geht ___ den Garten.",
  "ab": "Es ist Ferien ___ morgen!",
  "außer": "Alle sind da, ___ Tom.",
  "neben": "Ich sitze ___ meiner Freundin.",
  "hinter": "Der Garten liegt ___ dem Haus.",
  "wegen": "Sport fällt aus ___ des Regens.",
  "trotz": "Wir gehen raus ___ der Kälte.",
  "statt": "Ich trinke Tee ___ Kaffee.",
  "laut": "Es wird sonnig, ___ Wetterbericht.",
  "haben": "Wir ___ heute frei.",
  "werden": "Die Tage ___ jetzt länger.",
  "können": "Wir ___ das schaffen!",
  "müssen": "Alle Kinder ___ zur Schule gehen.",
  "sollen": "Wir ___ leise sein.",
  "wollen": "Die Kinder ___ draußen spielen.",
  "dürfen": "Hier ___ man nicht rennen.",
  "mögen": "Viele Kinder ___ Schokolade.",
  "lassen": "Lass mich das ___ !",
  "ist": "Heute ___ ein schöner Tag.",
  "war": "Gestern ___ es noch kalt.",
  "hat": "Er ___ einen neuen Rucksack.",
  "wird": "Es ___ bald dunkel.",
  "gibt": "Hier ___ es leckeres Eis.",
  "geht": "Wie ___ es dir?",
  "macht": "Das ___ richtig Spaß!",
  "kommt": "Sie ___ gleich nach Hause.",
  "sagt": "Die Lehrerin ___ es noch einmal.",
  "sieht": "Er ___ den Regenbogen am Himmel.",
  "steht": "Das Fahrrad ___ vor der Tür.",
  "heißt": "Mein Hund ___ Bello.",
  "lässt": "Sie ___ ihren Bruder mitspielen.",
  "bleibt": "Er ___ heute zu Hause.",
  "weiß": "Ich ___ die Antwort!",
  "nimmt": "Sie ___ das rote Buch.",
  "hält": "Er ___ den Ball fest.",
  "bringt": "Papa ___ Brötchen mit.",
  "zeigt": "Die Lehrerin ___ uns ein Bild.",
  "findet": "Er ___ seinen Schlüssel nicht.",
  "liegt": "Das Heft ___ auf dem Tisch.",
  "steigt": "Sie ___ in den Bus.",
  "denkt": "Er ___ an seine Freunde.",
  "spielt": "Das Kind ___ im Garten.",
  "braucht": "Man ___ Geduld beim Lernen.",
  "scheint": "Die Sonne ___ hell.",
  "meint": "Was ___ du damit?",
  "sucht": "Sie ___ ihre Brille.",
  "kennt": "Jeder ___ dieses Lied.",
  "nennt": "Man ___ ihn den Schnellsten.",
  "rennt": "Der Hund ___ über die Wiese.",
  "fällt": "Das Blatt ___ vom Baum.",
  "stellt": "Sie ___ die Tasse auf den Tisch.",
  "Bahn": "Der Zug fährt auf der ___.",
  "Zahn": "Mir tut der ___ weh.",
  "Kahn": "Der alte ___ liegt am Ufer.",
  "Jahr": "Ein ___ hat zwölf Monate.",
  "Uhr": "Die ___ zeigt schon halb drei.",
  "fahren": "Wir ___ mit dem Zug nach Berlin.",
  "Ruhe": "In der Bücherei braucht man ___.",
  "nahe": "Der See liegt ganz ___ am Haus.",
  "Höhe": "Aus dieser ___ sieht alles klein aus.",
  "früh": "Morgen stehen wir ___ auf.",
  "zählen": "Kannst du schon bis hundert ___?",
  "Sohn": "Ihr ___ geht in die dritte Klasse.",
  "Wahl": "Morgen ist die ___ zum Klassensprecher.",
  "Zahl": "Schreibe die ___ an die Tafel.",
  "Stahl": "Die Brücke ist aus ___.",
  "Mehl": "Zum Backen braucht man ___.",
  "Stuhl": "Setz dich auf den ___!",
  "Schuh": "Mein linker ___ ist nass.",
  "nehmen": "Soll ich den roten oder den blauen ___?",
  "fehlen": "Heute ___ drei Kinder.",
  "wohnen": "Wir ___ in einer kleinen Stadt.",
  "Bohne": "Die ___ wächst am Zaun.",
  "Sahne": "Möchtest du ___ auf den Kuchen?",
  "Rahmen": "Das Bild hängt in einem goldenen ___.",
  "Tier": "Im Zoo lebt ein großes ___.",
  "Bier": "Mein Opa trinkt gerne ___.",
  "Lied": "Wir singen ein schönes ___.",
  "Spiel": "Das ___ dauert neunzig Minuten.",
  "Ziel": "Das ___ ist die Kirche am Marktplatz.",
  "Brief": "Ich schreibe einen ___ an Oma.",
  "Stiefel": "Bei Regen trage ich ___.",
  "Spiegel": "Ich schaue in den ___.",
  "fliegen": "Die Vögel ___ nach Süden.",
  "liegen": "Die Socken ___ auf dem Boden.",
  "bieten": "Was können wir ___ ?",
  "ziehen": "Wir ___ nächste Woche um.",
  "Kreis": "Zeichne einen ___ auf das Blatt.",
  "Reise": "Die ___ nach Hamburg war toll.",
  "leise": "Sei bitte ___!",
  "Stein": "Da liegt ein großer ___ im Weg.",
  "Bein": "Mir tut das ___ weh.",
  "klein": "Die Maus ist ganz ___.",
  "Hund": "Unser ___ heißt Rex.",
  "Wald": "Wir wandern durch den ___.",
  "Geld": "Ich spare mein ___.",
  "Kind": "Das ___ spielt im Sandkasten.",
  "Freund": "Mein bester ___ heißt Tim.",
  "Rad": "Ich fahre mit dem ___ zur Schule.",
  "Bad": "Das ___ ist frisch geputzt.",
  "Pferd": "Das ___ galoppiert über die Wiese.",
  "Kleid": "Sie trägt ein rotes ___.",
  "Berg": "Wir wandern auf den ___.",
  "Zwerg": "Im Märchen lebt ein kleiner ___.",
  "Tag": "Was für ein schöner ___!",
  "Weg": "Der ___ führt durch den Park.",
  "Zug": "Der ___ fährt um acht Uhr.",
  "Straße": "Die ___ ist heute gesperrt.",
  "Fuß": "Ich habe mir den ___ gestoßen.",
  "groß": "Der Baum ist sehr ___.",
  "Spaß": "Das Spiel macht ___!",
  "heiß": "Der Tee ist noch zu ___.",
  "Fluss": "Der ___ fließt durch die Stadt.",
  "Schluss": "Jetzt ist ___!",
  "nass": "Nach dem Regen ist alles ___.",
  "Klasse": "Unsere ___ hat 25 Kinder.",
  "Wasser": "Trink genug ___!",
  "essen": "Wir ___ heute Pizza.",
  "Schlüssel": "Wo ist mein ___?",
  "kommen": "Wann ___ die Gäste?",
  "Sonne": "Die ___ scheint hell.",
  "Brille": "Ohne ___ kann ich nichts lesen.",
  "Tasse": "Hol mir bitte eine ___ Tee.",
  "Puppe": "Das Mädchen spielt mit der ___.",
  "Treppe": "Geh vorsichtig die ___ hinauf.",
  "rennen": "Die Kinder ___ über den Hof.",
  "schwimmen": "Im Sommer ___ wir im See.",
  "Butter": "Streich bitte ___ aufs Brot.",
  "Blätter": "Im Herbst fallen die ___ von den Bäumen.",
  "Mutter": "Meine ___ backt einen Kuchen.",
  "Zimmer": "Mein ___ ist aufgeräumt.",
  "Zucker": "Im Tee ist zu viel ___.",
  "Rücken": "Mir tut der ___ weh.",
  "Stück": "Ich hätte gerne ein ___ Kuchen.",
  "Brücke": "Die ___ geht über den Fluss.",
  "drücken": "Du musst den Knopf ___.",
  "Katze": "Die ___ schläft auf dem Sofa.",
  "Platz": "Auf dem ___ spielen Kinder.",
  "Mütze": "Setz deine ___ auf, es ist kalt!",
  "Schatz": "Du bist mein ___!",
  "putzen": "Heute müssen wir die Fenster ___.",
  "das Neue": "Hast du schon ___ gehört?",
  "das Gute": "Was ist ___ daran?",
  "das Beste": "Das ___ kommt bekanntlich zum Schluss.",
  "im Freien": "Heute spielen wir ___.",
  "ins Blaue": "Wir fahren einfach ___.",
  "beim Lesen": "Man lernt viel ___ .",
  "zum Spielen": "Kommst du ___ raus?",
  "nichts Neues": "Es gibt ___ zu berichten.",
  "etwas Schönes": "Ich habe ___ gefunden.",
  "verstehen": "Ich ___ die Aufgabe nicht.",
  "vergessen": "Hast du deine Jacke ___?",
  "versprechen": "Ich ___ dir, pünktlich zu sein.",
  "versuchen": "Wir ___ es noch einmal.",
  "bekommen": "Zum Geburtstag ___ ich ein Buch.",
  "beginnen": "Wann ___ die Ferien?",
  "entdecken": "Forscher ___ neue Tierarten.",
  "empfehlen": "Ich kann dieses Buch ___.",
  "zerbrechen": "Vorsicht, das Glas könnte ___!",
  "Vorfahrt": "An der Kreuzung hat er ___.",
  "Feuer": "Im Kamin brennt ein ___.",
  "Abenteuer": "Das war ein großes ___!",
  "Freude": "Die Kinder tanzen vor ___.",
  "Gebäude": "Das ___ hat fünf Stockwerke.",
  "Fahrzeug": "Ein Fahrrad ist auch ein ___.",
  "Zeugnis": "Morgen gibt es ___.",
  "plötzlich": "Es fing ___ an zu regnen.",
  "vielleicht": "Es klappt ___ beim nächsten Mal.",
  "eigentlich": "Ich wollte ___ zu Hause bleiben.",
  "ziemlich": "Das war ___ schwer.",
  "nämlich": "Er fehlt, er ist ___ krank.",
  "ungefähr": "Es dauert ___ eine Stunde.",
  "vertrauen": "Du kannst mir ___.",
  "Phantasie": "Kinder haben viel ___.",
  "das Laufen": "Viele Kinder lieben ___ .",
  "das Schreiben": "Das Kind übt täglich ___ .",
  "das Lernen": "Mit Pausen fällt ___ leichter.",
  "das Schöne": "Das ist ___ daran, dass wir gemeinsam üben.",
  "etwas Interessantes": "Im Museum haben wir ___ entdeckt.",
  "im Allgemeinen": "Das Wetter ist ___ im April wechselhaft.",
  "auf Deutsch": "Erkläre das bitte ___!",
  "auf Englisch": "Kannst du das ___ sagen?",
  "morgen früh": "Wir fahren ___ in den Urlaub.",
  "heute Abend": "Wir schauen ___ einen Film.",
  "heute Morgen": "Die Straße war ___ vereist.",
  "schuld sein": "Niemand will ___ an dem Missverständnis.",
  "recht haben": "Am Ende hatte sie ___.",
  "essen gehen": "Am Samstag wollen wir ___.",
  "kennen lernen": "Beim Schulausflug konnte ich neue Leute ___.",
  "die Freude": "Die Klasse jubelte vor ___ .",
  "der Mut": "Ihm fehlte ___, auf die Bühne zu gehen.",
  "die Stärke": "Seine ___ ist das genaue Beobachten.",
  "zum Besten": "Der Clown gab alles, ___ der Kinder.",
  "auf dem Laufenden": "Er hält uns immer ___ .",
  "aufs Neue": "Sie versuchte es ___ .",
  "fürs Erste": "Diese Erklärung reicht ___ .",
  "im Nachhinein": "Die Entscheidung war ___ richtig.",
  "eines Tages": "Es wird ___ alles einfacher.",
  "abends": "Wir lesen ___ oft zusammen.",
  "morgens": "Ich trinke ___ immer Kakao.",
  "mittags": "Es gibt ___ warmes Essen in der Schule.",
  "nachts": "Man kann ___ die Sterne gut sehen.",
  "montags": "Wir haben ___ immer Sport.",
  "ein bisschen": "Kannst du ___ lauter sprechen?",
  "das Äußere": "Das ___ eines Menschen sagt nicht alles aus.",
  "das Innere": "Im ___ des Baumes wachsen die Jahresringe.",
  "etwas Wichtiges": "Sie hat mir ___ erzählt.",
  "alles Gute": "Ich wünsche dir ___ zum Geburtstag!",
  "der Erste": "Er war ___ in der Zieldurchfahrt.",
  "als Letztes": "Er packt ___ seinen Rucksack.",
  "aufs Geratewohl": "Sie wählte ___ eine Antwort.",
  "in Bezug auf": "Es gibt eine Änderung ___ die Hausaufgaben.",
  "mit Bezug auf": "Ich antworte ___ deinen Brief.",
  "spielen": "Die Kinder ___ auf dem Schulhof.",
  "lieb": "Sei ___ und hilf mir bitte.",
  "lieben": "Wir ___ unsere Haustiere sehr.",
  "Biene": "Die ___ sammelt Blütennektar.",
  "Wiese": "Auf der ___ spielen Kinder Fußball.",
  "Riese": "Im Märchen trifft das Kind einen freundlichen ___.",
  "mieten": "Sie möchten eine Wohnung ___.",
  "Miete": "Die ___ muss jeden Monat bezahlt werden.",
  "riechen": "Die Rosen ___ wunderbar.",
  "sieben": "Eine Woche hat ___ Tage.",
  "Dieb": "Der ___ wurde von der Polizei gefasst.",
  "Knie": "Er hat sich das ___ aufgeschlagen.",
  "Vieh": "Der Bauer füttert jeden Morgen sein ___.",
  "nieder": "Das Feuer brannte das Haus ___ .",
  "Gebiet": "In diesem ___ gibt es viele seltene Tiere.",
  "tief": "Der See ist hier sehr ___.",
  "Dienstag": "Am ___ haben wir Kunstunterricht.",
  "Fieber": "Das Kind hat ___ und muss im Bett bleiben.",
  "fliehen": "Die Vögel ___ vor dem Sturm.",
  "Kiefer": "Der Zahnarzt untersucht meinen ___.",
  "Liebe": "Mit ___ und Geduld lernt sich alles leichter.",
  "lieblich": "Das Tal sah ___ und friedlich aus.",
  "Niederlage": "Nach der ___ war das Team traurig.",
  "Riegel": "Sie schob den ___ vor die Tür.",
  "Sieg": "Der ___ war verdient nach vielen Wochen Training.",
  "siegen": "Wer fairerweise kämpft, kann ___.",
  "Sieger": "Der ___ erhielt eine Goldmedaille.",
  "fiel": "Das Buch ___ vom Regal.",
  "blieb": "Er ___ ruhig, obwohl es laut war.",
  "rief": "Sie ___ laut nach ihrer Schwester.",
  "schief": "Das Bild hängt ___.",
  "Diät": "Der Arzt empfiehlt eine gesunde ___.",
  "zieht": "Im Herbst ___ die Familie in eine neue Stadt.",
  "geschieht": "Was ___ hier eigentlich?",
  "Tiger": "Der ___ ist das größte Raubtier Asiens.",
  "Bilder": "An der Wand hängen bunte ___.",
  "bitten": "Ich möchte dich um einen Gefallen ___.",
  "Wille": "Mit starkem ___ erreicht man viel.",
  "Lieferung": "Die ___ kommt morgen an.",
  "liefern": "Der Bäcker kann frische Brötchen ___.",
  "Niederlande": "In den ___ gibt es viele Tulpenfelder.",
  "Dienst": "Der Arzt hat heute ___.",
  "Dienstleistung": "Eine ___ ist Arbeit, die man für andere tut.",
  "Friedhof": "Am ___ stehen alte, schattige Bäume.",
  "Friedrich": "___ der Große war König von Preußen.",
  "wie viel": "Weißt du, ___ das Eis kostet?",
  "Wiederholung": "Die ___ hilft beim Auswendiglernen.",
  "wiederholen": "Kannst du das bitte ___?",
  "bestehlen": "Jemanden zu ___ ist eine Straftat.",
  "Riemen": "Der ___ hält die Tasche zusammen.",
  "Mieter": "Der ___ zahlt pünktlich seine Miete.",
  "Vermieter": "Der ___ hat die Heizung reparieren lassen.",
  "Bereich": "Im ___ Mathematik macht sie große Fortschritte.",
  "Reich": "Das Römische ___ war sehr mächtig.",
  "Zeitung": "Opa liest jeden Morgen die ___.",
  "Beziehung": "Eine gute ___ braucht Vertrauen.",
  "Spielzeug": "Das ___ liegt überall im Zimmer verteilt.",
  "Stieglitz": "Der ___ ist ein bunter Singvogel.",
  "Kieselstein": "Sie warf einen ___ in den See.",
  "Mund": "Bitte mach den ___ beim Kauen zu.",
  "Hand": "Reiche mir die ___ beim Überqueren der Straße.",
  "Sand": "Am Strand spielen die Kinder im ___.",
  "Band": "Ein buntes ___ hält ihr Haar zusammen.",
  "Feld": "Der Bauer pflügt sein ___ im Frühling.",
  "Held": "In dem Buch kämpft ein mutiger ___ gegen das Böse.",
  "wild": "Der Hund läuft ___ durch den Garten.",
  "Bild": "Sie hängte ein neues ___ an die Wand.",
  "blind": "Die Katze ist auf einem Auge ___.",
  "Pfad": "Der schmale ___ führt durch den Wald.",
  "Abend": "Am ___ lesen wir noch ein Kapitel.",
  "Stab": "Der Turner dreht sich um den ___.",
  "Staub": "Auf dem Regal liegt viel ___.",
  "Laub": "Im Herbst fegen wir das ___ zusammen.",
  "Korb": "Die Äpfel liegen im ___.",
  "Kalb": "Das ___ trinkt bei seiner Mutter.",
  "halb": "In ___ einer Stunde sind wir fertig.",
  "gelb": "Die Banane ist ___.",
  "grob": "Seine Antwort war ziemlich ___.",
  "taub": "Durch den lauten Lärm wurde er fast ___.",
  "Flug": "Der ___ nach Hamburg dauert eine Stunde.",
  "Burg": "Auf dem Berg steht eine alte ___.",
  "klug": "Sie ist sehr ___ und löst Aufgaben schnell.",
  "Krieg": "Im ___ leiden viele Menschen.",
  "Zweig": "Der Vogel sitzt auf einem dünnen ___.",
  "trägt": "Er ___ seinen Bruder auf dem Rücken.",
  "fliegt": "Der Adler ___ hoch über den Bergen.",
  "lebt": "Sie ___ seit vielen Jahren in München.",
  "liebt": "Er ___ seine kleine Schwester sehr.",
  "Rand": "Am ___ des Glases klebt Lippenstift.",
  "Stand": "Am Markt gibt es einen ___ mit frischem Obst.",
  "Strand": "Wir bauen eine Sandburg am ___.",
  "Grund": "Aus welchem ___ bist du so traurig?",
  "Wunde": "Die ___ wurde sorgfältig verbunden.",
  "Herd": "Das Wasser kocht auf dem ___.",
  "Nord": "Im ___ Deutschlands liegt Hamburg.",
  "Süd": "Im ___ Deutschlands findet man die Alpen.",
  "Grad": "Heute hat es dreißig ___ im Schatten.",
  "Leid": "Es tut mir ___, dass ich zu spät komme.",
  "Maid": "Die ___ pflückte Blumen auf der Wiese.",
  "Bescheid": "Ich gebe dir ___, wenn ich ankomme.",
  "Neid": "___ macht unglücklich.",
  "Mord": "Der Detektiv löste den ___ im alten Haus.",
  "Mond": "Bei Vollmond leuchtet der ___ sehr hell.",
  "Pfund": "Für das Rezept brauche ich ein ___ Mehl.",
  "Wand": "An der ___ hängt eine bunte Weltkarte.",
  "rund": "Der Tisch ist ___ und hat Platz für sechs Personen.",
  "gesund": "Viel Obst und Gemüse hält ___ .",
  "sparsam": "Sie ist sehr ___ und spart jeden Monat etwas.",
  "Druck": "Unter ___ macht er viele Fehler.",
  "Glück": "Sie hatte ___ und fand noch einen Platz.",
  "Fleck": "Der ___ auf dem Hemd geht nicht raus.",
  "Block": "Der ___ Papier ist schon fast voll.",
  "Stock": "Im dritten ___ wohnen unsere Nachbarn.",
  "Blick": "Mit einem ___ sah sie, was los war.",
  "Trick": "Kennst du den ___ mit dem Zauberwürfel?",
  "Werk": "Dieses ___ hat der Künstler zehn Jahre gemalt.",
  "stark": "Der Wind war so ___, dass die Bäume schwankten.",
  "weich": "Das Kissen ist schön ___ .",
  "süß": "Die Erdbeeren schmecken ___ und saftig.",
  "außen": "Die Mauer ist ___ grau, innen aber bunt.",
  "heißen": "Wie soll das Kätzchen ___?",
  "reißen": "Das Papier lässt sich leicht ___.",
  "beißen": "Der Hund wird nicht ___ .",
  "schießen": "Der Spieler konnte das Tor nicht ___.",
  "fließen": "Der Fluss beginnt, langsam zu ___.",
  "gießen": "Vergiss nicht, die Blumen zu ___!",
  "genießen": "Wir ___ die Ruhe am See.",
  "stoßen": "Vorsicht, du könntest dich ___!",
  "Maß": "Bitte halte beim Süßigkeitenessen ___.",
  "Hass": "___ löst keine Probleme.",
  "Schloss": "Wir besuchten ein altes ___ mit Burggraben.",
  "Biss": "Der ___ der Mücke juckt sehr.",
  "Riss": "In der Wand ist ein kleiner ___.",
  "Kuss": "Mama gab ihm einen ___ auf die Wange.",
  "reisen": "Im Sommer möchten wir nach Italien ___.",
  "lesen": "Sie mag es, abends ein Buch zu ___.",
  "Hose": "Die ___ hat ein Loch im Knie.",
  "Nase": "Im Winter läuft mir die ___.",
  "Weise": "Auf diese ___ löst man die Aufgabe am besten.",
  "rasieren": "Papa muss sich jeden Morgen ___.",
  "Maßnahme": "Eine wichtige ___ ist das Händewaschen.",
  "Maßstab": "Der ___ der Karte ist 1:50000.",
  "Ausmaß": "Das ___ des Schadens war riesig.",
  "Übermaß": "Im ___ ist sogar Sport ungesund.",
  "Abreißen": "___ des Plakats ist verboten.",
  "Losreißen": "___ vom Handy fällt vielen schwer.",
  "aufschließen": "Kannst du bitte die Tür ___?",
  "abschließen": "Vergiss nicht, das Fahrrad ___!",
  "einschließen": "Das Angebot schließt das Frühstück ___.",
  "ausschließen": "Wir können einen Fehler nicht ___.",
  "beschließen": "Die Klasse will gemeinsam ___, wohin die Reise geht.",
  "Abschluss": "Nach dem ___ der Schule beginnt die Ausbildung.",
  "Anschluss": "Der ___ an den Zug wurde knapp verpasst.",
  "Aufschluss": "Die Analyse gibt ___ über die Ursache.",
  "Zusammenschluss": "Der ___ beider Vereine war ein Erfolg.",
  "Beschluss": "Der ___ wurde einstimmig gefasst.",
  "Entschluss": "Sie fasste den ___, mehr Sport zu treiben.",
  "Vorsatz": "Ihr ___ für das neue Jahr ist mehr Schlafen.",
  "Grundsatz": "Ehrlichkeit ist ein wichtiger ___.",
  "Leitspruch": "Ihr ___ lautet: Lieber langsam und sicher.",
  "Süßigkeit": "Eine ___ gibt es nach dem Mittagessen.",
  "Süßspeise": "Als ___ gibt es heute Pudding.",
  "Fußball": "___ ist der beliebteste Sport in Deutschland.",
  "Fußgänger": "Der ___ wartete an der roten Ampel.",
  "Straßenbahn": "Wir fahren mit der ___ in die Innenstadt.",
  "Gewissen": "Sein ___ ließ ihn nicht schlafen.",
  "besessen": "Er ist von seiner Idee völlig ___.",
  "Prozess": "Der ___ vor Gericht dauerte drei Wochen.",
  "Adresse": "Hast du seine ___ aufgeschrieben?",
  "Interesse": "Sie zeigt großes ___ an Tieren.",
  "passieren": "Was kann auf dem Schulweg ___?",
  "interessieren": "Geschichte beginnt mich sehr zu ___.",
  "backen": "Oma möchte heute einen Kuchen ___.",
  "Bäcker": "Vom ___ kaufen wir frisches Brot.",
  "packen": "Ich muss noch meinen Koffer ___.",
  "stecken": "Wo kann der Schlüssel ___?",
  "wecken": "Das Vogelgezwitscher begann mich zu ___.",
  "Decke": "Er zog die ___ bis unter das Kinn.",
  "Socke": "Eine ___ hat ein Loch.",
  "Rock": "Sie trägt einen bunten ___ zum Fest.",
  "Sack": "Im ___ liegen die Kartoffeln.",
  "Mücke": "Die ___ hat mich am Arm gestochen.",
  "Lücke": "Im Text ist eine ___, die gefüllt werden muss.",
  "Ecke": "An der ___ steht eine alte Laterne.",
  "nicken": "Sie begann zu ___, um zuzustimmen.",
  "zucken": "Beim lauten Knall begann er zu ___.",
  "schlucken": "Die Tablette ist schwer zu ___.",
  "Acker": "Der Bauer pflügt seinen ___ im Herbst.",
  "Schnecke": "Die ___ kriecht langsam über den Weg.",
  "hocken": "Die Kinder ___ um das Lagerfeuer.",
  "locken": "Der Duft des Essens beginnt mich zu ___.",
  "Jacke": "Zieh deine ___ an, es ist kalt!",
  "Recke": "Als tapferer ___ kämpfte er für sein Volk.",
  "Hitze": "Bei der großen ___ bleiben wir drinnen.",
  "Netz": "Der Fischer wirft sein ___ ins Wasser.",
  "Satz": "Schreibe jeden ___ mit einem Großbuchstaben.",
  "Schutz": "Der Helm bietet ___ beim Fahrradfahren.",
  "Witz": "Er erzählte einen lustigen ___.",
  "Blitz": "Ein ___ fuhr in den alten Baum.",
  "Gesetz": "Das ___ gilt für alle gleich.",
  "sitzen": "Wir ___ zusammen am Tisch.",
  "setzen": "Bitte ___ Sie sich!",
  "schätzen": "Ich ___ deinen Rat sehr.",
  "nützen": "Das Lernen wird dir später viel ___.",
  "verletzen": "Beim Spielen kann man sich leicht ___.",
  "ersetzen": "Das alte Teil muss man bald ___.",
  "flicken": "Kannst du das Loch in der Hose ___?",
  "kleckern": "Pass auf, dass du nicht ___!",
  "lecken": "Die Katze beginnt ihre Pfoten zu ___.",
  "recken": "Er ___ sich morgens lang und ausgiebig.",
  "knicken": "Beim Fallen drohte er das Knie zu ___.",
  "stricken": "Oma kann wunderschöne Socken ___.",
  "picken": "Die Hühner ___ Körner vom Boden.",
  "ticken": "Die alte Uhr beginnt wieder zu ___.",
  "hacken": "Papa muss noch Holz ___.",
  "knacken": "Das Eis beginnt unter unseren Schritten zu ___.",
  "zwicken": "Die enge Hose beginnt zu ___.",
  "schicken": "Ich möchte Oma eine Karte ___.",
  "blicken": "Sie ___ neugierig durch das Schlüsselloch.",
  "Brocken": "Ein großer ___ Eis fiel von der Wand.",
  "Hacke": "Er bearbeitet den Garten mit der ___.",
  "Lückentext": "Füllt den ___ mit passenden Wörtern aus!",
  "Rucksack": "Ich packe meinen ___ für die Wanderung.",
  "abknicken": "Pass auf, der Stift könnte ___!",
  "erschrecken": "Das laute Geräusch konnte mich ___.",
  "überbrücken": "Wie kann man eine lange Wartezeit ___?",
  "entrücken": "Musik kann uns aus dem Alltag ___.",
  "Abkürzung": "Durch den Park gibt es eine ___.",
  "abkürzen": "Wir können den Weg durch den Wald ___.",
  "besetzen": "Die Schüler ___ alle Plätze im Bus.",
  "aussetzen": "Das Training muss er wegen Krankheit ___.",
  "einsetzen": "Die Feuerwehr kann Drohnen ___.",
  "umsetzen": "Gute Ideen muss man auch ___.",
  "einschätzen": "Die Lage ist schwer zu ___.",
  "unterschätzen": "Man sollte seinen Gegner nie ___.",
  "überschätzen": "Du neigst dazu, dich selbst zu ___.",
  "Sitzung": "Die ___ des Gemeinderats dauerte zwei Stunden.",
  "Besetzung": "Die ___ der Hauptrolle war eine Überraschung.",
  "Verletzung": "Die ___ am Knie braucht Zeit zum Heilen.",
  "Übersetzung": "Die ___ aus dem Englischen war schwierig.",
  "Einschätzung": "Meiner ___ nach wird das klappen.",
  "Schätzung": "Laut dieser ___ leben hier 5000 Menschen.",
  "Nutzung": "Die ___ des Handys ist im Unterricht verboten.",
  "Stützung": "Die ___ des schwachen Schülers ist wichtig.",
  "Sommer": "Im ___ fahren wir ans Meer.",
  "Hammer": "Mit dem ___ schlägt er den Nagel in die Wand.",
  "Nummer": "Welche ___ hat dein Haus?",
  "Gramm": "Das Rezept braucht 200 ___ Mehl.",
  "Programm": "Das ___ muss zuerst installiert werden.",
  "Komma": "Vergiss nicht das ___ vor weil!",
  "Lamm": "Das kleine ___ läuft hinter der Mutter her.",
  "Kamm": "Er zieht den ___ durch sein nasses Haar.",
  "kennen": "Ich ___ dieses Lied auswendig.",
  "nennen": "Kannst du drei Beispiele ___?",
  "brennen": "Die Kerze begann zu ___.",
  "Tonne": "Der Müll kommt in die braune ___.",
  "Wanne": "Das Baby badet in einer kleinen ___.",
  "Mann": "Der ___ mit dem roten Hut ist mein Onkel.",
  "spinnen": "Die Spinne kann dünne Fäden ___.",
  "Tanne": "Im Wald steht eine hohe ___.",
  "Rinne": "Das Wasser fließt durch die ___.",
  "Ball": "Der ___ fliegt über das Netz.",
  "toll": "Das Konzert war wirklich ___!",
  "voll": "Die Tasse ist ___ mit Kakao.",
  "hell": "Das Zimmer ist schön ___ und freundlich.",
  "Halle": "Die ___ fasst tausend Zuschauer.",
  "Welle": "Die große ___ warf ihn um.",
  "Stelle": "An dieser ___ habe ich meinen Schlüssel verloren.",
  "stellen": "Bitte ___ die Schuhe ans Regal.",
  "fallen": "Im Herbst beginnen die Blätter zu ___.",
  "Rolle": "Die ___ Klebeband ist leer.",
  "Quelle": "Das Wasser sprudelt frisch aus der ___.",
  "Millionen": "In dieser Stadt leben drei ___ Menschen.",
  "Bett": "Er liegt noch im ___ und schläft.",
  "Blatt": "Auf dem ___ steht die Aufgabe.",
  "satt": "Nach dem großen Mittagessen bin ich ___.",
  "nett": "Die neue Lehrerin ist sehr ___.",
  "bitte": "Kannst du mir ___ helfen?",
  "Mitte": "Das Buch liegt in der ___ des Regals.",
  "Ratte": "Die ___ huscht durch den Keller.",
  "Wetter": "Das ___ morgen soll schön werden.",
  "Suppe": "Mama kocht eine warme ___.",
  "Affe": "Der ___ klettert geschickt auf den Baum.",
  "Koffer": "Er packt seinen ___ für die Reise.",
  "Pfeffer": "Das Essen braucht noch etwas ___.",
  "Löffel": "Sie rührt mit dem ___ in der Tasse.",
  "Schiff": "Das ___ fährt langsam in den Hafen.",
  "treffen": "Wir wollen uns morgen ___.",
  "hoffen": "Wir ___ auf gutes Wetter.",
  "offen": "Das Fenster ist noch ___.",
  "wissen": "Ich ___ nicht, wo mein Heft ist.",
  "messen": "Der Arzt möchte die Temperatur ___.",
  "passen": "Die Schuhe ___ genau.",
  "Messer": "Mit dem ___ schneidet er das Brot.",
  "besser": "Nach dem Schlaf fühle ich mich ___.",
  "Schirm": "Bei Regen brauche ich meinen ___.",
  "Kissen": "Das ___ ist weich und bequem.",
  "Hilfe": "Er brauchte ___ beim Tragen der schweren Kiste.",
  "Stille": "In der ___ hört man jeden Atemzug.",
  "Hülle": "Das Handy steckt in einer bunten ___.",
  "Fülle": "Eine ___ an Ideen hatte sie immer.",
  "Grille": "Die ___ zirpt die ganze Nacht.",
  "Pille": "Die ___ muss mit viel Wasser geschluckt werden.",
  "Brillant": "Der Ring hat einen funkelnden ___.",
  "Gott": "In vielen Religionen glaubt man an ___.",
  "Ritter": "Der ___ trug eine schwere Rüstung.",
  "bitter": "Der Kaffee schmeckt ___.",
  "Zitter": "Ein ___ lief ihr bei der Nachricht durch den Körper.",
  "zittern": "Vor Kälte begann er zu ___.",
  "Otter": "Der ___ schwimmt geschickt im Fluss.",
  "Euter": "Die Kuh gibt Milch aus dem ___.",
  "Flotte": "Die ___ aus zehn Schiffen lief aus dem Hafen.",
  "flott": "Das Mädchen ist ___ und immer gut gelaunt.",
  "Watte": "Die Wunde wird mit ___ gereinigt.",
  "matt": "Nach dem langen Rennen war er völlig ___.",
  "glatt": "Die Straße ist nach dem Frost ___.",
  "Gitter": "Hinter dem ___ liegt der Schatz.",
  "Kittel": "Der Arzt trägt einen weißen ___.",
  "Mittel": "Gegen Kopfschmerzen gibt es ein gutes ___.",
  "mittels": "Sie löste das Problem ___ einer Karte.",
  "Kette": "Sie trägt eine goldene ___ um den Hals.",
  "Latte": "Der Zaun besteht aus vielen schmalen ___n.",
  "retten": "Der Feuerwehrmann konnte das Kind ___.",
  "wetten": "Ich ___ , dass du das schaffst!",
  "Gewitter": "Das ___ kam plötzlich und war sehr stark.",
  "Sitte": "Es ist eine gute ___, die Türen aufzuhalten.",
  "Sippe": "Die ganze ___ traf sich zum Familienfest.",
  "Lippe": "Er biss sich auf die ___ vor Aufregung.",
  "Kippe": "Das Glas steht auf der ___ des Tisches.",
  "knapp": "Die Zeit wurde am Ende ___.",
  "Rippe": "Beim Sturz brach er sich eine ___.",
  "Knappe": "Der ___ half dem Ritter beim Anlegen der Rüstung.",
  "Mappe": "Die ___ ist voller Zeichnungen.",
  "Rappe": "Der ___ ist ein schwarzes Pferd.",
  "Kappe": "Er setzt sich eine rote ___ auf.",
  "Pappe": "Das Modell wird aus ___ gebaut.",
  "Steppe": "In der ___ gibt es wenig Regen.",
  "schlapp": "Nach der langen Wanderung fühlte sie sich ___.",
  "Krampf": "Beim Schwimmen bekam er einen ___ im Bein.",
  "Dummheit": "Das war eine echte ___!",
  "dumm": "Fragen darf man immer, das ist nicht ___.",
  "Summe": "Die ___ aller Zahlen ergibt hundert.",
  "Klemme": "Er steckt in der ___ und braucht Hilfe.",
  "Flamme": "Die ___ der Kerze flackerte im Wind.",
  "Schwämme": "Die ___ wachsen nach dem Regen.",
  "Grimm": "Voller ___ stampfte er aus dem Zimmer.",
  "grimmig": "Der Wächter schaute ___ auf die Kinder.",
  "Schlamm": "Nach dem Regen sind die Stiefel voller ___.",
  "Schwamm": "Er wischte die Tafel mit dem ___ sauber.",
  "schlimm": "Zum Glück war die Verletzung nicht ___.",
  "Atem": "Nach dem Rennen ging ihm der ___ aus.",
  "Atom": "Ein ___ ist der kleinste Baustein der Materie.",
  "Abfluss": "Der ___ in der Badewanne ist verstopft.",
  "Ausfluss": "Der ___ des Sees fließt in den Fluss.",
  "Genuss": "Das Eis war ein echter ___.",
  "Überfluss": "In unserem Land leben viele im ___.",
  "auffassen": "Bitte ___, das kommt in der Prüfung vor!",
  "abfassen": "Er musste den Bericht neu ___.",
  "erfassen": "Der Computer kann Daten schnell ___.",
  "umfassen": "Das Buch soll alle Themen ___.",
  "zulassen": "Das Gesetz lässt das nicht ___.",
  "verlassen": "Du kannst dich auf mich ___.",
  "überlassen": "Er wollte die Entscheidung ihr ___.",
  "abwässern": "Die Felder müssen nach dem Regen ___.",
  "wässern": "Die Pflanzen muss man täglich ___.",
  "Ohr": "Sie flüsterte ihm etwas ins ___.",
  "Fahrrad": "Er fährt jeden Tag mit dem ___ zur Schule.",
  "Gefahr": "Auf Glatteis besteht ___.",
  "zahlen": "An der Kasse muss er ___.",
  "Kuh": "Die ___ gibt täglich frische Milch.",
  "froh": "Er ist ___, dass das Wetter gut ist.",
  "roh": "Karotten kann man ___ essen.",
  "Lohn": "Für seine Arbeit bekommt er einen fairen ___.",
  "Wohnung": "Die neue ___ liegt im dritten Stock.",
  "Bühne": "Die Schauspieler stehen auf der ___.",
  "fühlen": "Wie ___ du dich heute?",
  "kühlen": "Stell das Getränk bitte zum ___.",
  "führen": "Der Pfad wird uns durch den Wald ___.",
  "Gefühl": "Sie hat ein gutes ___ für Zahlen.",
  "stehlen": "Es ist unehrlich zu ___.",
  "Fehler": "Aus einem ___ kann man viel lernen.",
  "ähnlich": "Die beiden Bilder sind sich sehr ___.",
  "Strahl": "Ein ___ Sonnenlicht fiel ins Zimmer.",
  "drehen": "Die Erde fängt an sich zu ___.",
  "wohl": "Bei uns zu Hause fühle ich mich ___.",
  "Kohle": "Früher wurde mit ___ geheizt.",
  "Befehl": "Der Soldat führte den ___ aus.",
  "bohren": "Er muss ein Loch in die Wand ___.",
  "Bahnhof": "Der Zug fährt pünktlich vom ___ ab.",
  "Lehre": "Er macht eine ___ als Tischler.",
  "lehren": "Der Lehrer will uns Mathematik ___.",
  "Lehrer": "Unser ___ erklärt alles sehr geduldig.",
  "Ehe": "Sie haben eine lange, glückliche ___ geführt.",
  "Höhle": "Der Bär schläft den Winter in einer ___ .",
  "Kohl": "Aus ___ kann man leckere Suppe kochen.",
  "Jahrzehnt": "In einem ___ vergehen zehn Jahre.",
  "Fahrplan": "Im ___ steht, wann der Zug fährt.",
  "Fahrkarte": "Er kaufte sich eine ___ für den Zug.",
  "Ahnung": "Ich habe keine ___, wo mein Stift ist.",
  "ahnen": "Das konnte sie nicht ___.",
  "Ruhm": "Der Sportler gewann ___ und Ehre.",
  "mähen": "Papa muss noch den Rasen ___.",
  "Mähne": "Das Pferd schüttelt seine lange ___.",
  "dehnen": "Vor dem Sport sollte man sich ___.",
  "Dehnungs-h": "Das ___ macht ein Wort länger.",
  "mahnen": "Die Lehrerin muss ihn zum Aufpassen ___.",
  "stählen": "Sport und Training ___ den Körper.",
  "Pfähle": "Die ___ stecken tief im Boden.",
  "Pfahl": "Der ___ wird in den Boden gerammt.",
  "vorhaben": "Was habt ihr morgen ___?",
  "Taler": "Im Märchen erhält er drei goldene ___.",
  "zahm": "Das Kaninchen ist sehr ___ geworden.",
  "Ruhepause": "Nach der Arbeit brauchen wir eine ___.",
  "Uhrmacher": "Der ___ repariert alte Uhren.",
  "Bahnsteig": "Der Zug fährt auf ___ drei ein.",
  "Jahreszeit": "Der Frühling ist meine liebste ___.",
  "Hoheit": "Seine ___ begrüßte die Gäste.",
  "Rohheit": "Seine ___ im Umgang mit anderen überraschte alle.",
  "Frühjahr": "Im ___ blühen die ersten Blumen.",
  "Frühling": "Im ___ werden die Tage länger.",
  "Wohnort": "Trage deinen ___ ins Formular ein.",
  "Lehnwort": "Computer ist ein ___ aus dem Englischen.",
  "fehlerfrei": "Der Aufsatz wurde ___ geschrieben.",
  "Übernahme": "Die ___ der Firma dauerte viele Monate.",
  "aufnehmen": "Er möchte ein neues Lied ___.",
  "abnehmen": "Der Arzt rät ihm, ___.",
  "zunehmen": "Es ist bekannt, dass die Dunkelstunden im Winter ___.",
  "Einnahme": "Die ___ der Medizin muss täglich erfolgen.",
  "Mahlzeit": "Eine warme ___ am Abend ist gemütlich.",
  "Hühner": "Die ___ laufen frei auf dem Hof.",
  "kühn": "Der ___ Plan gelang gegen alle Erwartungen.",
  "Rehe": "Im Morgengrauen sehen wir zwei ___ auf der Wiese.",
  "Reh": "Das ___ springt über den Zaun.",
  "Weh": "Das ___ in seinem Herzen ließ nicht nach.",
  "Zehe": "Er hat sich die große ___ gestoßen.",
  "Kühe": "Die ___ stehen friedlich auf der Weide.",
  "beziehen": "Das Bett sollte man regelmäßig frisch ___.",
  "Erziehung": "Gute ___ beginnt in der Familie.",
  "erziehen": "Kinder zu ___ ist eine verantwortungsvolle Aufgabe.",
  "Annäherung": "Eine friedliche ___ der Länder ist das Ziel.",
  "Wahrhaftigkeit": "___ bedeutet, immer die Wahrheit zu sagen.",
  "wahrhaftig": "Er meinte es ___ gut mit uns.",
  "Vorsicht": "___ ist besser als Nachsicht.",
  "Übersicht": "Die Tabelle gibt eine gute ___ über die Daten.",
  "Absicht": "Das war keine ___, es war ein Versehen.",
  "Hahn": "Der ___ kräht jeden Morgen früh.",
  "Mohn": "Auf dem Feld blüht roter ___.",
  "Krönung": "Die ___ der Königin war ein großes Fest.",
  "Söhne": "Das Ehepaar hat zwei ___.",
  "Zähne": "Zweimal täglich soll man die ___ putzen.",
  "Mahd": "Nach der ___ riecht es frisch nach Gras.",
  "nahm": "Er ___ seinen Rucksack und ging.",
  "zählte": "Sie ___ alle Kinder durch.",
  "Gehalt": "Sein ___ wird jeden Monat überwiesen.",
  "Inhalt": "Was ist der ___ des Buches?",
  "Hafen": "Das Schiff läuft in den ___ ein.",
  "Hafer": "Pferde fressen gerne ___.",
  "verlieren": "Ich darf meine Schlüssel nicht ___.",
  "verantworten": "Wer muss das ___?",
  "besuchen": "Wir möchten Oma am Sonntag ___.",
  "bedeuten": "Was soll das ___?",
  "beachten": "Bitte alle Hinweise ___!",
  "gewinnen": "Wir wollen das Spiel ___.",
  "gehören": "Dieses Buch ___ mir.",
  "gefallen": "Das Lied wird dir bestimmt ___.",
  "Geschichte": "Im Unterricht lernen wir ___ .",
  "Gedanke": "Ein guter ___ kam ihm plötzlich.",
  "Gesicht": "Sein ___ war vor Freude ganz rot.",
  "entscheiden": "Sie muss sich bald ___.",
  "entwickeln": "Kinder ___ sich in ihrem eigenen Tempo.",
  "entlassen": "Der Arzt konnte den Patienten ___.",
  "erklären": "Kannst du mir das bitte ___?",
  "erkennen": "Im Dunkeln konnte er sie kaum ___.",
  "erreichen": "Das Ziel ist schwer zu ___.",
  "erfahren": "Davon habe ich erst heute ___.",
  "Erfahrung": "Durch Übung macht man ___.",
  "zerreißen": "Das Papier lässt sich leicht ___.",
  "zerstören": "Ein Sturm kann viel ___.",
  "zusammen": "Wir lösen die Aufgabe ___.",
  "zunächst": "Wir müssen ___ die Aufgabe lesen.",
  "Zusammenhang": "In welchem ___ steht das?",
  "übertragen": "Die Krankheit kann sich ___.",
  "übernehmen": "Sie möchte mehr Verantwortung ___.",
  "übersetzen": "Kannst du den Satz ___?",
  "untersuchen": "Der Arzt möchte ihn ___.",
  "unterscheiden": "Die zwei Begriffe muss man genau ___.",
  "unterstützen": "Freunde ___ sich gegenseitig.",
  "aufmerksam": "Im Unterricht sollte man ___ sein.",
  "aufgeben": "Niemals ___ — es lohnt sich!",
  "ausführen": "Den Auftrag muss er sorgfältig ___.",
  "aussuchen": "Du darfst dir ein Buch ___.",
  "mitmachen": "Alle Kinder wollen beim Spiel ___.",
  "nachdenken": "Bitte kurz ___, bevor du antwortest.",
  "vorstellen": "Darf ich mich kurz ___?",
  "Vorstellung": "Die ___ des Theaterstücks war toll.",
  "hinzufügen": "Möchtest du noch etwas ___?",
  "herstellen": "In dieser Fabrik werden Autos ___.",
  "ablehnen": "Er musste das Angebot leider ___.",
  "abbrechen": "Das Gespräch musste er plötzlich ___.",
  "enttäuschen": "Ich hoffe, ich werde dich nicht ___.",
  "Enttäuschung": "Die ___ war groß, als es nicht klappte.",
  "entfernen": "Den Fleck kann man leicht ___.",
  "entgegen": "Er lief ihr ___ .",
  "enthalten": "Der Saft soll keinen Zucker ___.",
  "entsprechen": "Das Ergebnis muss den Erwartungen ___.",
  "entnehmen": "Er konnte dem Text die Lösung ___.",
  "entstehen": "Wie kann Freundschaft ___?",
  "erhalten": "Sie hat einen Brief ___.",
  "erlauben": "Darf ich das ___?",
  "ermöglichen": "Übung kann viel ___.",
  "erscheinen": "Das neue Buch wird nächste Woche ___.",
  "erwarten": "Was ___ uns bei der Reise?",
  "erweisen": "Das wird sich noch ___.",
  "erzählen": "Opa kann tolle Geschichten ___.",
  "Erzählung": "Die ___ handelt von einem mutigen Mädchen.",
  "vollständig": "Bitte die Aufgabe ___ ausfüllen.",
  "Vollständigkeit": "Auf ___ sollte man beim Aufsatz achten.",
  "angemessen": "Eine ___ Antwort ist kurz und klar.",
  "anscheinend": "Er hat ___ die Aufgabe vergessen.",
  "ausreichend": "Für die Prüfung haben wir ___ Zeit.",
  "ausgezeichnet": "Das Essen schmeckte ___.",
  "Umgebung": "In der ___ des Parks gibt es viele Tiere.",
  "Misserfolg": "Aus einem ___ kann man lernen.",
  "misslingen": "Manchmal kann ein Experiment ___.",
  "missverstehen": "Man kann sich leicht ___.",
  "Missverständnis": "Das war ein ___ — es tut mir leid.",
  "weitgehend": "Die Aufgabe ist ___ gelöst.",
  "weitreichend": "Die Entscheidung hat ___ Folgen.",
  "Schule": "Morgen fängt die ___ wieder an.",
  "Heft": "Das ___ liegt auf dem Tisch.",
  "Buch": "Das ___ hat 300 Seiten.",
  "Stift": "Mein ___ ist auf den Boden gerollt.",
  "Tafel": "Die Lehrerin schreibt an die ___.",
  "Lineal": "Mit dem ___ zieht er gerade Linien.",
  "Schere": "Die ___ liegt im Mäppchen.",
  "Aufgabe": "Die ___ war schwieriger als erwartet.",
  "Vater": "Mein ___ kocht heute Abend.",
  "Eltern": "Meine ___ kommen heute Abend nach Hause.",
  "Bruder": "Mein ___ ist drei Jahre jünger als ich.",
  "Schwester": "Meine ___ geht in die zweite Klasse.",
  "Oma": "___ backt die besten Kekse.",
  "Opa": "___ erzählt gerne Geschichten.",
  "Familie": "Die ganze ___ feiert gemeinsam.",
  "Vogel": "Der ___ singt früh am Morgen.",
  "Fisch": "Der ___ schwimmt im klaren Wasser.",
  "Maus": "Die kleine ___ huscht unter das Sofa.",
  "Schwein": "Das ___ grunzt laut im Stall.",
  "Schaf": "Das ___ hat ein weiches Fell.",
  "Löwe": "Der ___ ist der König der Savanne.",
  "rot": "Das Stoppschild ist ___.",
  "blau": "Der Himmel ist heute strahlend ___.",
  "grün": "Das Gras ist schön ___.",
  "schwarz": "Die Nacht ist ___.",
  "grau": "Der Elefant ist ___.",
  "braun": "Der Bär hat ein ___ Fell.",
  "rosa": "Das Kleid ist ___.",
  "lila": "Die Lavendelblüten sind ___.",
  "orange": "Die Karotte ist ___.",
  "violett": "Die Blume hat ___ Blütenblätter.",
  "eins": "Auf dem Siegertreppchen steht ___ ganz oben.",
  "zwei": "Ich habe ___ Hände.",
  "drei": "Ein Dreieck hat ___ Ecken.",
  "vier": "Eine Katze hat ___ Pfoten.",
  "fünf": "Eine Hand hat ___ Finger.",
  "sechs": "Ein Würfel hat ___ Seiten.",
  "acht": "Eine Spinne hat ___ Beine.",
  "neun": "Eine Spieluhr spielt ___ verschiedene Melodien.",
  "zehn": "Beide Hände haben zusammen ___ Finger.",
  "zwölf": "Ein Jahr hat ___ Monate.",
  "zwanzig": "Er kann bis ___ zählen.",
  "dreißig": "Die Klasse hat ___ Schüler.",
  "vierzig": "Nach ___ Jahren gingen sie in Rente.",
  "fünfzig": "Mir fehlen noch ___ Cent.",
  "hundert": "Ein Euro hat ___ Cent.",
  "tausend": "In dem Buch sind über ___ Seiten.",
  "Kopf": "Mir tut der ___ weh.",
  "Auge": "Sie hat ein ___ zugekniffen.",
  "Arm": "Er trägt das Kind auf dem ___.",
  "Finger": "Er zeigte mit dem ___ auf die Tafel.",
  "Herz": "Das ___ schlägt schneller beim Sport.",
  "Bauch": "Mir tut der ___ weh.",
  "Mensch": "Jeder ___ verdient Respekt.",
  "Welt": "Die ___ ist größer als wir denken.",
  "Zeit": "Die ___ vergeht schnell beim Spielen.",
  "Leben": "Das ___ hält viele Überraschungen bereit.",
  "Haus": "Das ___ hat einen großen Garten.",
  "Stadt": "In unserer ___ gibt es einen schönen Park.",
  "Land": "Auf dem ___ ist es ruhiger als in der Stadt.",
  "Luft": "Die frische ___ auf dem Berg ist herrlich.",
  "Erde": "Die ___ dreht sich um die Sonne.",
  "Natur": "Die ___ muss geschützt werden.",
  "Energie": "Solar___ kommt von der Sonne.",
  "Gesellschaft": "In einer ___ tragen alle Verantwortung.",
  "Möglichkeit": "Es gibt mehr als eine ___ , das zu lösen.",
  "Entwicklung": "Die technische ___ geht schnell voran.",
  "Bedeutung": "Die ___ des Wortes war ihm unklar.",
  "Ergebnis": "Das ___ der Rechnung ist richtig.",
  "Lösung": "Die ___ steht auf der letzten Seite.",
  "Beispiel": "Nenne ein ___!",
  "Unterschied": "Was ist der ___ zwischen den beiden?",
  "Vergleich": "Im ___ ist die erste Antwort besser.",
  "Zusammenfassung": "Schreibe eine kurze ___ des Textes.",
  "arbeiten": "Wir ___ heute in Gruppen.",
  "helfen": "Kannst du mir bitte ___?",
  "lernen": "Man muss täglich ___.",
  "schreiben": "Ich möchte einen Brief ___.",
  "sprechen": "Im Unterricht sollte man laut ___.",
  "hören": "Kannst du das Lied ___?",
  "sehen": "Von hier aus kann man den Berg ___.",
  "denken": "Bitte kurz ___, bevor du antwortest.",
  "beschreiben": "Kannst du das Bild ___?",
  "vergleichen": "Versuche die beiden Texte zu ___.",
  "zusammenfassen": "Bitte den Text kurz ___!",
  "überprüfen": "Vergiss nicht, deine Antwort zu ___!",
  "darstellen": "Das Diagramm soll die Daten ___.",
  "wichtig": "Hausaufgaben sind ___ für den Lernerfolg.",
  "schnell": "Das Pferd läuft sehr ___.",
  "langsam": "Die Schildkröte bewegt sich ___.",
  "schwierig": "Die Aufgabe war ___.",
  "einfach": "Der erste Teil ist noch ___.",
  "möglich": "Alles ist ___, wenn man es versucht.",
  "richtig": "Das ist die ___ Antwort.",
  "falsch": "Das ist leider ___.",
  "interessant": "Der Film war wirklich ___.",
  "langweilig": "Die Wartezeit war sehr ___.",
  "notwendig": "Übung ist ___ zum Lernen.",
  "erfolgreich": "Mit viel Fleiß kann man ___ sein.",
  "unterschiedlich": "Die Meinungen sind sehr ___.",
  "verantwortlich": "Jeder ist für sein Handeln ___ .",
  "selbstständig": "Hausaufgaben soll man ___ machen.",
  "zuverlässig": "Ein guter Freund ist immer ___.",
  "begeistert": "Die Kinder waren ___ vom Ausflug.",
  "Verantwortung": "Jeder trägt ___ für sein Handeln.",
  "Konsequenz": "Die ___ seines Handelns wurde ihm klar.",
  "Perspektive": "Wir sollten das aus einer anderen ___ sehen.",
  "Kommunikation": "Gute ___ ist wichtig in einer Gruppe.",
  "Demokratie": "In einer ___ darf jeder wählen.",
  "Philosophie": "___ fragt nach dem Sinn des Lebens.",
  "Hypothese": "Eine ___ ist eine noch ungeprüfte Annahme.",
  "Analyse": "Die ___ des Textes zeigte viele Details.",
  "Synthese": "In der ___ werden Ergebnisse zusammengeführt.",
  "Interpretation": "Die ___ des Gedichts war schwierig.",
  "Argumentation": "Deine ___ war klar und überzeugend.",
  "Charakteristik": "Die ___ der Figur zeigt viele Schwächen.",
  "Kompromiss": "Ein ___ bedeutet, dass beide Seiten nachgeben.",
  "Reflexion": "Die ___ über das Gelernte hilft beim Verstehen.",
  "Motivation": "Mit viel ___ lernt man schneller.",
  "Konzentration": "Für die Prüfung braucht man volle ___.",
  "Verantwortungsbewusstsein": "___ bedeutet, Folgen zu bedenken.",
  "Widerspruch": "Er wollte keinen ___ dulden.",
  "Auswirkung": "Die ___ des Sturms war enorm.",
  "Schlussfolgerung": "Welche ___ ziehst du daraus?",
  "Voraussetzung": "Eine gute ___ fürs Lernen ist ausreichend Schlaf.",
  "Gegebenheit": "Die ___ vor Ort muss man kennen.",
  "Schwierigkeit": "Bei der ersten ___ nicht aufgeben!",
  "Meinungsverschiedenheit": "Eine ___ kann man im Gespräch lösen.",
  "annehmen": "Wir können ___, dass die Antwort stimmt.",
  "nachweisen": "Das lässt sich leicht ___.",
  "widersprechen": "Er wollte der Aussage ___.",
  "hervorheben": "Du solltest die wichtigen Punkte ___.",
  "berücksichtigen": "Bitte alle Hinweise ___!",
  "veranschaulichen": "Ein Beispiel kann das gut ___.",
  "schlussfolgern": "Was lässt sich daraus ___?",
  "charakterisieren": "Versuche die Hauptfigur zu ___.",
  "analysieren": "Wir sollen den Text genau ___.",
  "formulieren": "Bitte deinen Gedanken klar ___!",
  "strukturieren": "Ein Plan hilft, den Aufsatz zu ___.",
  "argumentieren": "Lerne, deine Meinung klar zu ___.",
  "reflektieren": "Es lohnt sich, über Fehler zu ___.",
  "präsentieren": "Die Gruppe soll ihre Ergebnisse ___.",
  "recherchieren": "Für das Referat muss ich ___.",
  "diskutieren": "In der Klasse wollen wir das ___.",
  "kritisieren": "Man darf Ideen sachlich ___.",
  "dokumentieren": "Das Experiment muss man genau ___.",
  "interpretieren": "Das Bild kann man unterschiedlich ___.",
  "Abschnitt": "Lese den zweiten ___ noch einmal.",
  "Hauptsatz": "Ein ___ kann allein stehen.",
  "Nebensatz": "Ein ___ braucht immer einen Hauptsatz.",
  "Pronomen": "Er ist ein ___.",
  "Adjektiv": "Schön ist ein ___.",
  "Substantiv": "Hund ist ein ___.",
  "Konjunktion": "Und ist eine ___.",
  "Prädikat": "Das ___ ist das wichtigste Element des Satzes.",
  "Subjekt": "Das ___ sagt, wer etwas tut.",
  "Objekt": "Das ___ sagt, wen oder was man tut.",
  "Paragraph": "Im dritten ___ steht die Regel.",
  "Kommentar": "Schreibe einen ___ zum Text.",
  "Inhaltsangabe": "Die ___ fasst den Text kurz zusammen.",
  "Gedicht": "Das ___ hat drei Strophen.",
  "Strophe": "Die zweite ___ ist die schönste.",
  "Metapher": "Das Herz aus Stein ist eine ___.",
  "Experiment": "Im Labor führen wir ein ___ durch.",
  "Diagramm": "Das ___ zeigt die Temperaturen der letzten Woche.",
  "Tabelle": "Trage die Ergebnisse in die ___ ein.",
  "Gleichung": "Die ___ hat zwei Unbekannte.",
  "Berechnung": "Zeige die ___ in allen Schritten.",
  "Formel": "Die ___ für den Kreisumfang lautet pi mal d.",
  "Dreieck": "Ein ___ hat drei Winkel.",
  "Viereck": "Ein Quadrat ist ein besonderes ___.",
  "Geschwindigkeit": "Die ___ des Zuges beträgt 200 km/h.",
  "Beschleunigung": "Die ___ eines Autos hängt vom Motor ab.",
  "Photosynthese": "Durch ___ wandeln Pflanzen Licht in Energie um.",
  "Chromosom": "Im ___ ist die Erbinformation gespeichert.",
  "Arbeit": "Gute ___ braucht Zeit und Geduld.",
  "Beruf": "Sie hat ihren Traum___ gefunden.",
  "Wirtschaft": "Die ___ eines Landes hängt von vielen Faktoren ab.",
  "Politik": "___ betrifft das Leben aller Menschen.",
  "Kultur": "Jedes Land hat eine eigene ___.",
  "Bildung": "___ ist der Schlüssel zu vielen Türen.",
  "Gesundheit": "___ ist das Wichtigste im Leben.",
  "Umwelt": "Die ___ muss geschützt werden.",
  "Technik": "Moderne ___ erleichtert viele Aufgaben.",
  "Freiheit": "___ bedeutet, selbst entscheiden zu dürfen.",
  "Gleichheit": "___ vor dem Gesetz gilt für alle.",
  "Gerechtigkeit": "Für ___ kämpfen viele Menschen.",
  "Sicherheit": "Im Straßenverkehr ist ___ das Wichtigste.",
  "Zuverlässigkeit": "___ ist eine wichtige Eigenschaft.",
  "Kreativität": "___ zeigt sich auf viele Arten.",
  "Globalisierung": "Durch ___ sind Länder eng verbunden.",
  "Nachhaltigkeit": "___ bedeutet, die Zukunft zu schützen.",
  "Digitalisierung": "___ verändert die Arbeitswelt.",
  "Gebirge": "Im ___ liegt im Winter viel Schnee.",
  "Wüste": "In der ___ ist es sehr heiß und trocken.",
  "Küste": "An der ___ riecht man das Meer.",
  "Tal": "Das ___ liegt zwischen zwei Bergen.",
  "Vulkan": "Der ___ brach vor hundert Jahren aus.",
  "Atmosphäre": "Die ___ schützt die Erde vor Strahlung.",
  "Ökosystem": "Der Wald ist ein wichtiges ___.",
  "Klimawandel": "Der ___ betrifft alle Menschen weltweit.",
  "Erdbeben": "Das ___ zerstörte viele Häuser.",
  "Kontinente": "Die Erde hat sieben ___.",
  "Kaufmann": "Der ___ verkauft seine Waren.",
  "Kauffrau": "Die ___ berät ihre Kunden freundlich.",
  "Rechtsanwalt": "Der ___ verteidigt seinen Mandanten.",
  "Bürgermeister": "Der ___ eröffnete das Stadtfest.",
  "Bundeskanzler": "Der ___ leitet die Regierung.",
  "Abgeordneter": "Der ___ stimmt im Parlament ab.",
  "Bundesregierung": "Die ___ beschloss ein neues Gesetz.",
  "Nachricht": "Eine gute ___ kann den Tag verbessern.",
  "Fernsehen": "Im ___ läuft heute ein guter Film.",
  "Zeitschrift": "Die ___ über Natur ist sehr interessant.",
  "Informationen": "___ findet man im Internet.",
  "Veröffentlichung": "Die ___ des Berichts sorgte für Aufsehen.",
  "Bewerbung": "Die ___ um die Stelle wurde abgeschickt.",
  "Ausbildung": "Nach der Schule beginnt er eine ___.",
  "Weiterbildung": "___ ist im Beruf sehr wichtig.",
  "Wissenschaft": "Die ___ sucht nach Antworten.",
  "Forschung": "___ hilft, neue Erkenntnisse zu gewinnen.",
  "Erkenntnis": "Diese ___ veränderte die Forschung.",
  "Untersuchung": "Die ___ ergab keine Auffälligkeiten.",
  "Beobachtung": "Genaue ___ ist in der Wissenschaft wichtig.",
  "Aufzeichnung": "Die ___ wurde sorgfältig archiviert.",
  "Auswertung": "Die ___ der Daten dauerte lange.",
  "Grundlage": "Gute Ernährung ist eine wichtige ___ .",
  "Addition": "___ bedeutet zusammenzählen.",
  "Subtraktion": "Bei der ___ zieht man eine Zahl ab.",
  "Multiplikation": "___ ist wiederholtes Addieren.",
  "Division": "Bei der ___ teilt man eine Zahl.",
  "Bruchrechnung": "___ braucht viel Übung.",
  "Dezimalzahl": "3,14 ist eine ___.",
  "Rechnung": "Die ___ hat leider einen Fehler.",
  "Prozent": "Zwanzig ___ der Klasse fehlten.",
  "Wahrscheinlichkeit": "Die ___ des Regens beträgt achtzig Prozent.",
  "Verhältnis": "Das ___ von Länge zu Breite ist zwei zu eins.",
  "Durchschnitt": "Der ___ der Klasse lag bei sieben Punkten.",
  "Differenz": "Die ___ zwischen acht und drei ist fünf.",
  "Produkt": "Das ___ von vier mal fünf ist zwanzig.",
  "Quotient": "Der ___ von zehn geteilt durch zwei ist fünf.",
  "Mittelalter": "Im ___ lebten Ritter und Burgfräulein.",
  "Aufklärung": "Die ___ brachte neue Ideen über Freiheit.",
  "Revolution": "Die ___ veränderte die Gesellschaft.",
  "Kolonialismus": "Der ___ hatte viele negative Folgen.",
  "Industrialisierung": "Die ___ veränderte die Arbeitswelt.",
  "Verfassung": "Die ___ ist das wichtigste Gesetz eines Landes.",
  "Menschenrechte": "___ gelten für alle Menschen.",
  "Grundgesetz": "Das ___ schützt unsere Grundrechte.",
  "Parlamentarismus": "Im ___ werden Gesetze durch gewählte Vertreter gemacht.",
  "Bürgerrechte": "___ sichern die Freiheit des Einzelnen.",
  "Organismus": "Jeder ___ braucht Energie zum Überleben.",
  "Zelle": "Die ___ ist die kleinste Einheit des Lebens.",
  "Zellkern": "Im ___ befindet sich die DNA.",
  "Evolution": "Die ___ erklärt die Vielfalt des Lebens.",
  "Verdauung": "Die ___ beginnt schon im Mund.",
  "Blutkreislauf": "Das Herz treibt den ___ an.",
  "Atmungssystem": "Das ___ versorgt den Körper mit Sauerstoff.",
  "Immunsystem": "Das ___ schützt uns vor Krankheiten.",
  "Verbindung": "Wasser ist eine chemische ___.",
  "Reaktion": "Bei der ___ entstehen neue Stoffe.",
  "Aggregatzustand": "Eis, Wasser und Dampf sind ___ desselben Stoffs.",
  "Aggregation": "Bei der ___ schließen sich Teilchen zusammen.",
  "Magnetismus": "Durch ___ werden Eisenobjekte angezogen.",
  "Elektrizität": "___ ermöglicht das Leuchten der Glühbirne.",
  "Schwerkraft": "Die ___ hält uns auf dem Boden.",
  "Wellenlänge": "Jede Farbe hat eine bestimmte ___.",
  "Frequenz": "Die ___ gibt an, wie oft eine Welle schwingt.",
  "Unternehmen": "Das ___ beschäftigt hundert Mitarbeiter.",
  "Aktionär": "Ein ___ besitzt Anteile an einem Unternehmen.",
  "Kapitalismus": "Im ___ bestimmt der Markt die Preise.",
  "Gewinn": "Das Unternehmen erzielte hohen ___.",
  "Verlust": "Nach dem Sturm entstand ein großer ___.",
  "Investition": "Eine ___ in Bildung lohnt sich immer.",
  "Beschäftigung": "___ ist wichtig für das Wohlbefinden.",
  "Arbeitslosigkeit": "___ ist ein gesellschaftliches Problem.",
  "Steuererhöhung": "Die ___ wurde intensiv diskutiert.",
  "Inflation": "Bei hoher ___ verliert Geld an Wert.",
  "Rechtschreibung": "Auf ___ sollte man immer achten.",
  "Grammatik": "___ ist das Regelwerk einer Sprache.",
  "Zeichensetzung": "Korrekte ___ macht Texte verständlicher.",
  "Satzzeichen": "Punkt und Komma sind ___.",
  "Aufsatz": "Der ___ soll zwei Seiten lang sein.",
  "Erörterung": "In einer ___ werden Argumente abgewogen.",
  "Beschreibung": "Eine genaue ___ hilft beim Verstehen.",
  "Charakterisierung": "Die ___ der Hauptfigur war sehr detailliert.",
  "Textanalyse": "Bei der ___ wird der Text genau untersucht.",
  "Gedichtinterpretation": "Eine ___ braucht Belege aus dem Text.",
  "Sprachkompetenz": "Lesen fördert die ___.",
  "Wortschatz": "Ein großer ___ hilft beim Schreiben.",
  "Grammatikfehler": "Bitte die ___ verbessern!",
  "Fremdsprache": "Englisch ist seine erste ___.",
  "Muttersprache": "Deutsch ist meine ___.",
  "abbilden": "Das Diagramm soll die Daten ___.",
  "ableiten": "Daraus lässt sich eine Regel ___.",
  "abschreiben": "Beim Test ist ___ verboten.",
  "achten": "Bitte auf Sauberkeit ___!",
  "anbieten": "Er kann seine Hilfe ___.",
  "andeuten": "Er wollte etwas ___, ohne es direkt zu sagen.",
  "anfordern": "Weitere Informationen kannst du ___.",
  "anlegen": "Sie möchte ein Tagebuch ___.",
  "anpassen": "Das Tempo muss man an die Gruppe ___.",
  "anwenden": "Die Regel sollst du jetzt ___.",
  "auflösen": "Das Salz beginnt sich im Wasser zu ___.",
  "aufzeigen": "Das Experiment kann Zusammenhänge ___.",
  "ausdrücken": "Versuche deinen Gedanken klar zu ___.",
  "auslösen": "Das Lachen konnte er nicht ___.",
  "auswählen": "Du darfst ein Thema frei ___.",
  "beantworten": "Kannst du die Frage ___?",
  "begründen": "Bitte deine Meinung ___!",
  "behalten": "Die Regel musst du dir ___.",
  "bemerken": "Hast du den Fehler ___?",
  "benutzen": "Im Unterricht darf man das Wörterbuch ___.",
  "beraten": "Der Lehrer kann dich gut ___.",
  "bestätigen": "Die Antwort konnte er ___.",
  "bewegen": "Sport ___ dich und hält dich gesund.",
  "beweisen": "Das musst du erst ___.",
  "bezeichnen": "Wie kann man das ___?",
  "bilden": "Zusammen ___ wir ein starkes Team.",
  "durchführen": "Wir sollen das Experiment morgen ___.",
  "einhalten": "Regeln muss man ___.",
  "einleiten": "Wie kann man den Aufsatz ___?",
  "einteilen": "Die Zeit muss man gut ___.",
  "einwirken": "Musik kann positiv auf die Stimmung ___.",
  "festhalten": "Bitte die Ergebnisse ___!",
  "feststellen": "Wir konnten ___, dass die Lösung stimmt.",
  "gelingen": "Mit Übung wird es dir ___.",
  "gestalten": "Du kannst das Plakat frei ___.",
  "gliedern": "Den Aufsatz sollte man sinnvoll ___.",
  "herausfinden": "Versuche die Antwort selbst zu ___!",
  "hinweisen": "Die Lehrerin möchte auf einen Fehler ___.",
  "nachvollziehen": "Kannst du meinen Gedankengang ___?",
  "prüfen": "Bitte deine Antwort nochmal ___!",
  "sammeln": "Informationen kann man im Internet ___.",
  "stützen": "Deine Meinung musst du mit Belegen ___.",
  "umgehen": "Mit Konflikten kann man lösungsorientiert ___.",
  "verdeutlichen": "Ein Beispiel kann das gut ___.",
  "vereinfachen": "Versuche die Erklärung zu ___.",
  "verfassen": "Sie soll einen Brief ___.",
  "vorgehen": "Wie soll man bei der Aufgabe ___?",
  "zeichnen": "Bitte ein Diagramm ___!",
  "zuordnen": "Ordne die Begriffe den Kategorien ___!",
  "zurückführen": "Das lässt sich auf einen Fehler ___.",
  "zusammenstellen": "Eine Liste von Quellen muss man ___.",
  "ausführlich": "Bitte ___ antworten!",
  "eigenständig": "Die Aufgabe soll ___ gelöst werden.",
  "einheitlich": "Das Schriftbild sollte ___ sein.",
  "entsprechend": "Wähle das ___ Werkzeug!",
  "erheblich": "Der Unterschied ist ___.",
  "fähig": "Mit Übung ist jeder dazu ___.",
  "gründlich": "Bitte die Aufgabe ___ bearbeiten!",
  "inhaltlich": "Der Aufsatz war ___ sehr gut.",
  "konsequent": "Sie lernte ___ jeden Tag.",
  "kreativ": "Beim Basteln darf man ___ sein.",
  "logisch": "Die Erklärung ist ___ und klar.",
  "nachhaltig": "Umweltschutz muss ___ sein.",
  "objektiv": "Ein Journalist sollte ___ berichten.",
  "offensichtlich": "Er hat ___ die Aufgabe vergessen.",
  "praktisch": "Das Werkzeug ist sehr ___.",
  "sachlich": "Bitte ___ antworten!",
  "sorgfältig": "Die Arbeit wurde ___ erledigt.",
  "spezifisch": "Das ist ein sehr ___ Fachbegriff.",
  "systematisch": "Sie geht ___ vor.",
  "typisch": "Das ist ___ für einen Herbsttag.",
  "umfangreich": "Das Projekt war sehr ___.",
  "umfassend": "Der Bericht war ___ und detailliert.",
  "verständlich": "Die Erklärung war klar und ___.",
  "wesentlich": "Der ___ Punkt fehlt noch.",
  "wirkungsvoll": "Die Präsentation war sehr ___.",
  "wissenschaftlich": "Das Experiment wurde ___ ausgewertet.",
  "zutreffend": "Welche Aussage ist ___?",
  "Prüfung": "Die ___ wird morgen geschrieben.",
  "Hausaufgabe": "Vergiss deine ___ nicht!",
  "Klassenarbeit": "Die ___ war schwieriger als erwartet.",
  "Schulaufgabe": "Heute haben wir eine ___.",
  "Überschrift": "Schreibe eine passende ___ für den Text.",
  "Fachbegriff": "Der ___ muss genau erklärt werden.",
  "Fachvokabular": "In der Biologie gibt es viel ___.",
  "Lernziel": "Das ___ dieser Stunde ist klar.",
  "Unterricht": "Der ___ beginnt um acht Uhr.",
  "Verständnis": "Gutes ___ braucht Übung und Geduld.",
  "Bewertung": "Die ___ erfolgt nach festen Kriterien.",
  "Beurteilung": "Die ___ des Lehrers war fair.",
  "Halbjahr": "Am Ende des ___ gibt es Zeugnisse.",
  "Schuljahr": "Das neue ___ beginnt im September.",
  "Nachhilfe": "Er geht einmal pro Woche zur ___.",
  "Lerngruppe": "In der ___ hilft man sich gegenseitig.",
  "Klassenraum": "Der ___ wurde neu gestrichen.",
  "Schulbuch": "Das ___ liegt auf dem Tisch.",
  "Mannschaft": "Unsere ___ hat gewonnen!",
  "Wettkampf": "Beim ___ gab jeder sein Bestes.",
  "Meisterschaft": "Die ___ findet nächsten Monat statt.",
  "Wettbewerb": "Am ___ nehmen zwanzig Schulen teil.",
  "Sportplatz": "Auf dem ___ wird trainiert.",
  "Schiedsrichter": "Der ___ pfiff das Foul.",
  "Halbzeit": "In der ___ gab es Wasser für alle.",
  "Aufstellung": "Der Trainer änderte die ___.",
  "Training": "Heute ist ___ um vier Uhr.",
  "Schwimmbad": "Im ___ ist das Wasser gut geheizt.",
  "Fitnessstudio": "Er geht dreimal pro Woche ins ___.",
  "Arzt": "Der ___ hat mich untersucht.",
  "Krankenhaus": "Er musste ins ___ gebracht werden.",
  "Medikament": "Das ___ muss dreimal täglich eingenommen werden.",
  "Behandlung": "Die ___ hat geholfen.",
  "Impfung": "Die ___ schützt vor der Krankheit.",
  "Allergie": "Sie hat eine ___ gegen Hausstaub.",
  "Entzündung": "Die ___ am Finger schmerzt.",
  "Erkältung": "Bei einer ___ hilft viel Schlaf.",
  "Krankheit": "Die ___ brach plötzlich aus.",
  "Schmerzen": "Die ___ lassen nach einer Weile nach.",
  "Temperatur": "Der Arzt misst die ___.",
  "Diagnose": "Die ___ des Arztes war eindeutig.",
  "Therapie": "Die ___ dauert mehrere Wochen.",
  "Psychiatrie": "Die ___ kümmert sich um seelische Gesundheit.",
  "Computer": "Der ___ startet heute langsam.",
  "Software": "Die neue ___ läuft besser als die alte.",
  "Internet": "Im ___ findet man viele Informationen.",
  "Tastatur": "Er tippte auf der ___.",
  "Bildschirm": "Der ___ ist zu hell eingestellt.",
  "Algorithmus": "Ein ___ löst ein Problem Schritt für Schritt.",
  "Datenverarbeitung": "___ erfolgt heute meistens automatisch.",
  "Netzwerk": "Das ___ verbindet alle Computer im Haus.",
  "Programmierung": "___ ist eine wichtige Fähigkeit.",
  "Schnittstelle": "Die ___ zwischen den Geräten funktioniert.",
  "Dateiverwaltung": "Gute ___ spart Zeit.",
  "Verschlüsselung": "___ schützt wichtige Daten.",
  "anschließend": "Wir bearbeiten ___ die zweite Aufgabe.",
  "schließlich": "Die Lösung kam ___ wie von selbst.",
  "zusammenfassend": "Man kann ___ sagen, dass alles geklappt hat.",
  "abschließend": "Die Klasse bedankte sich ___ beim Lehrer.",
  "einerseits": "Es ist ___ einfach, andererseits riskant.",
  "andererseits": "Einerseits macht es Spaß, ___ kostet es Zeit.",
  "zum einen": "Es ist ___ billig, zum anderen praktisch.",
  "zum anderen": "Zum einen ist es schnell, ___ auch sicher.",
  "ebenso": "Mathematik ist wichtig, ___ Deutsch.",
  "hingegen": "Er lacht viel, sie ___ selten.",
  "dagegen": "Alle stimmten zu, er ___ nicht.",
  "dennoch": "Es regnete, ___ gingen wir spazieren.",
  "allerdings": "Es war schön, ___ auch anstrengend.",
  "infolgedessen": "Es schneite, ___ fuhr der Zug nicht.",
  "dementsprechend": "Die Regel ist bekannt, ___ sollte man sie kennen.",
  "demzufolge": "Er fehlte gestern, ___ weiß er nichts.",
  "diesbezüglich": "Es gibt ___ noch offene Fragen.",
  "letzten Endes": "Das ist ___ deine Entscheidung.",
  "gleichzeitig": "Sie lacht und weint ___.",
  "folglich": "Er lernte viel, ___ bestand er die Prüfung.",
  "beispielsweise": "Tiere wie ___ Hunde sind treue Freunde.",
  "unter anderem": "Der Bericht enthält ___ Statistiken.",
  "im Gegensatz dazu": "Er ist still, ___ seine Schwester sehr laut.",
  "in diesem Zusammenhang": "Das Wetter ist ___ auch wichtig.",
  "Frühstück": "Zum ___ esse ich Brot mit Marmelade.",
  "Mittagessen": "Das ___ gibt es um zwölf Uhr.",
  "Abendessen": "Zum ___ kochen wir Nudeln.",
  "Getränk": "Ein kühles ___ schmeckt gut im Sommer.",
  "Einkauf": "Den ___ erledigt Mama am Samstag.",
  "Schlafzimmer": "Im ___ ist es ruhig und dunkel.",
  "Kühlschrank": "Der ___ muss aufgeräumt werden.",
  "Waschmaschine": "Die ___ läuft schon seit einer Stunde.",
  "Führerschein": "Mit achtzehn kann man den ___ machen.",
  "Ausweise": "Alle ___ müssen vorgezeigt werden.",
  "Reisepass": "Für die Reise brauche ich meinen ___.",
  "Geburtsurkunde": "Die ___ wird beim Standesamt ausgestellt.",
  "Krankenversicherung": "Jeder braucht eine ___.",
  "Rentenversicherung": "Die ___ sichert das Alter ab.",
  "Sozialversicherung": "Die ___ schützt Arbeitnehmer.",
  "Arbeitgeber": "Der ___ zahlt das Gehalt.",
  "Arbeitnehmer": "Der ___ arbeitet für das Unternehmen.",
  "kochen": "Mama kann sehr gut ___.",
  "waschen": "Du musst dir die Hände ___.",
  "schlafen": "Kinder sollen genug ___.",
  "aufwachen": "Er ___ jeden Morgen um sieben.",
  "anziehen": "Vergiss nicht, die Jacke ___.",
  "einkaufen": "Wir müssen noch ___ gehen.",
  "bezahlen": "An der Kasse muss er ___.",
  "spazieren": "Nach dem Essen gehen wir ___.",
  "telefonieren": "Er kann stundenlang ___.",
  "fotografieren": "Im Urlaub liebt sie es zu ___.",
  "sparen": "Sie möchte Geld für ein Fahrrad ___.",
  "verdienen": "Mit einem Nebenjob kann man Geld ___.",
  "ausgeben": "Er neigt dazu, zu viel Geld zu ___.",
  "überweisen": "Den Betrag muss sie noch ___.",
  "versichern": "Das Auto muss man ___.",
  "wählen": "Mit achtzehn darf man ___.",
  "abstimmen": "Die Klasse möchte über das Thema ___.",
  "kandidieren": "Er möchte für den Klassensprecher ___.",
  "regieren": "Ein Präsident darf vier Jahre ___.",
  "verwalten": "Eine Gemeinde muss Finanzen gut ___.",
  "aufgeregt": "Vor dem Auftritt war sie sehr ___.",
  "ängstlich": "Das Kind ist ___ vor großen Hunden.",
  "mutig": "Der Feuerwehrmann ist sehr ___.",
  "tapfer": "Sie war ___ und ließ sich nicht einschüchtern.",
  "freundlich": "Die Verkäuferin war sehr ___.",
  "höflich": "Man sollte immer ___ sein.",
  "ehrlich": "Sei immer ___, auch wenn es schwer fällt.",
  "pünktlich": "Er ist immer ___ zur Schule.",
  "fleißig": "Sie ist sehr ___ und macht immer ihre Hausaufgaben.",
  "faul": "Heute war er sehr ___ und hat nichts getan.",
  "lustig": "Der Film war sehr ___.",
  "traurig": "Er war ___, weil sein Freund weggezogen war.",
  "wütend": "Sie war sehr ___ über die Ungerechtigkeit.",
  "stolz": "Er war ___ auf seine gute Note.",
  "neugierig": "Kinder sind von Natur aus ___.",
  "geduldig": "Man muss ___ sein, wenn man etwas Neues lernt.",
  "ungeduldig": "Er wurde ___, weil es so lange dauerte.",
  "verständnisvoll": "Die Lehrerin war sehr ___ .",
  "rücksichtsvoll": "Im Verkehr sollte man ___ sein.",
  "Thema": "Das ___ des Aufsatzes ist der Klimawandel.",
  "Theorie": "Eine ___ muss bewiesen werden.",
  "These": "Deine ___ klingt interessant.",
  "Thesen": "Die drei ___ des Vortrags waren klar.",
  "Phase": "In der zweiten ___ wird das Experiment wiederholt.",
  "Phrase": "Diese ___ hört man sehr oft.",
  "Physik": "In ___ lernen wir über Kräfte.",
  "Fotograf": "Der ___ machte viele schöne Aufnahmen.",
  "Rhythmus": "Das Lied hat einen schönen ___.",
  "Mathematik": "___ ist mein Lieblingsfach.",
  "Chemie": "In ___ führen wir Experimente durch.",
  "Cholesterin": "Zu viel ___ ist ungesund.",
  "Chronik": "Die ___ der Stadt ist sehr interessant.",
  "Chaos": "Im Zimmer herrschte völliges ___.",
  "chaotisch": "Die Situation war ziemlich ___.",
  "Mechanik": "___ beschäftigt sich mit Bewegungen.",
  "Psychologie": "___ untersucht das menschliche Verhalten.",
  "Ökologie": "___ beschäftigt sich mit Lebensräumen.",
  "Biologie": "In ___ lernen wir über Pflanzen und Tiere.",
  "Geographie": "In ___ lernen wir Länder und Kontinente kennen.",
  "Pädagogik": "___ ist die Wissenschaft vom Lehren.",
  "Linguistik": "___ ist die Wissenschaft der Sprache.",
  "Rhetorik": "In der ___ lernt man überzeugend zu sprechen.",
  "Hymne": "Die Nationalhymne ist eine ___ .",
  "Symphonie": "Die neunte ___ von Beethoven ist berühmt.",
  "Gymnasium": "Das ___ ist eine weiterführende Schule.",
  "Bundesverfassung": "Die ___ legt die Grundrechte fest.",
  "Rechtsstaatlichkeit": "___ bedeutet, dass das Recht für alle gilt.",
  "Gewaltenteilung": "___ verhindert Machtmissbrauch.",
  "Meinungsfreiheit": "___ ist ein wichtiges Grundrecht.",
  "Pressefreiheit": "___ schützt Journalisten.",
  "Religionsfreiheit": "___ gilt in Deutschland für alle.",
  "Versammlungsfreiheit": "___ erlaubt friedliche Demonstrationen.",
  "Gewissensfreiheit": "___ schützt persönliche Überzeugungen.",
  "Redefreiheit": "___ gilt überall in der Demokratie.",
  "Gleichberechtigung": "___ bedeutet, dass alle gleiche Rechte haben.",
  "Eigenverantwortung": "___ ist ein Zeichen von Reife.",
  "Selbstbestimmung": "___ bedeutet, selbst zu entscheiden.",
  "Auseinandersetzung": "Eine friedliche ___ ist wichtig.",
  "Wechselwirkung": "Zwischen Ursache und Wirkung gibt es eine ___.",
  "Interessenkonflikt": "Ein ___ entsteht, wenn Meinungen sich widersprechen.",
  "Bevölkerungsentwicklung": "Die ___ zeigt, wie die Einwohnerzahl sich verändert.",
  "Wirtschaftswachstum": "___ bedeutet, dass mehr produziert wird.",
  "Umweltverschmutzung": "___ schadet Tieren und Menschen.",
  "Klimaschutzpolitik": "___ ist heute wichtiger denn je.",
  "Zukunftsperspektive": "Mit Bildung hat man gute ___n.",
  "aufpassen": "Bitte im Unterricht ___!",
  "aufräumen": "Dein Zimmer musst du ___.",
  "Bescheid wissen": "Er möchte über alles ___.",
  "Fortschritte machen": "Du wirst beim Lesen bald ___ .",
  "in Frage stellen": "Man sollte auch bewährte Methoden ___.",
  "zur Verfügung stehen": "Die Geräte werden ab morgen ___.",
  "in Anspruch nehmen": "Die Hilfe kann man jederzeit ___.",
  "zum Ausdruck bringen": "Deine Gefühle kannst du durch Schreiben ___.",
};



/* ─── CHALLENGE GENERATOR ─────────────────────────────────────────────────── */
const CAT_QUESTIONS = {
  1: ["Mit ie oder ei?", "ie, ih oder ieh?", "Hör genau hin:"],
  2: ["Mit oder ohne h?", "Dehnungs-h oder nicht?", "Hör genau hin:"],
  3: ["Tippe das Wort:", "Hör zu und tippe:"],
  4: ["Welche Vorsilbe?", "Tippe das Wort:"],
  5: ["Doppelt oder einfach?", "Hör genau hin:"],
  6: ["ck oder k? tz oder z?", "Tippe das Wort:"],
  7: ["Wie schreibt man das?", "d oder t? b oder p?"],
  8: ["s, ss oder ß?", "Hör genau hin:"],
  9: ["Groß oder klein?", "Was ist richtig?"],
  10: ["Tippe das Wort:", "Hör genau hin:"],
};

function generateChallenges(monsterId, difficulty, wordStats = {}) {
  const words = getWordsForMonster(monsterId, difficulty);
  if (!words.length) return [];
  // Fällige und fehlerhafte Wörter zuerst, dann Rest zufällig
  const prioritized = sortWordsByPriority(words, wordStats);
  // Die ersten 60% nach Priorität, Rest shuffled – für Balance
  const cutoff = Math.ceil(prioritized.length * 0.6);
  const front = prioritized.slice(0, cutoff);
  const back  = fisherYates(prioritized.slice(cutoff));
  const shuffled = [...front, ...back];
  const challenges = [];

  for (let i = 0; i < shuffled.length; i++) {
    const [word, catId, typErr] = shuffled[i];
    const qs = CAT_QUESTIONS[catId] || ["Tippe das Wort:"];

    const sentence = SENTENCES[word] || null;
    if (i % 2 === 0) {
      challenges.push({ q: qs[Math.floor(Math.random() * qs.length)], word, audio: true, type: "input", sentence });
    } else {
      const allErrs = generateErrors(word, catId, typErr);
      const wrong = fisherYates(allErrs).slice(0, 2);
      while (wrong.length < 2) wrong.push(word.slice(0,-1) + (wrong.length === 0 ? "e" : "n"));
      challenges.push({ q: "Was ist richtig?", word, options: fisherYates([word, ...wrong]), correct: word, type: "choice", sentence });
    }
  }
  return challenges;
}

/* ─── DIAGNOSE GENERATOR ──────────────────────────────────────────────────── */
function generatePruferQuestions() {
  // 10 Fragen aus 5 zufälligen Kategorien: 3 leicht + 4 mittel + 3 hart
  const cats = fisherYates([1,2,3,4,5,6,7,8,9,10]).slice(0,5);
  const catNames = {1:"ie/ih/ieh",2:"Dehnungs-h",3:"Funktionswörter",4:"Vorsilben",5:"Doppelkonsonant",6:"ck/tz",7:"Auslaut",8:"s/ss/ß",9:"Groß/Klein",10:"Wortschatz"};
  const questions = [];
  const diffCounts = [["leicht",3],["mittel",4],["hart",3]];

  for (const [diff, count] of diffCounts) {
    const pool = [];
    for (const cat of cats) {
      const words = W.filter(w => w[1] === cat && STAR_TO_DIFF[w[3]] === diff);
      pool.push(...words);
    }
    const picked = fisherYates(pool).slice(0, count);
    for (let i = 0; i < picked.length; i++) {
      const [word, catId, typErr] = picked[i];
      const hint = catNames[catId] || "Rechtschreibung";
      const sentence = SENTENCES[word] || null;
      if (i % 2 === 0) {
        questions.push({ q: "Tippe das Wort:", word, audio: true, type: "input", diff, hint, sentence });
      } else {
        const allErrs = generateErrors(word, catId, typErr);
        const wrong = fisherYates(allErrs).slice(0, 2);
        while (wrong.length < 2) wrong.push(word.slice(0,-1) + "e");
        questions.push({ q: "Was ist richtig?", word, options: fisherYates([word, ...wrong]), correct: word, type: "choice", diff, hint, sentence });
      }
    }
  }
  // Falls weniger als 10 durch leere Pools, mit Allgemein auffüllen
  while (questions.length < 10) {
    const fallback = fisherYates(W.filter(w => w[1] === 10))[0];
    if (!fallback) break;
    questions.push({ q: "Tippe das Wort:", word: fallback[0], audio: true, type: "input", diff: "mittel", hint: "Wortschatz" });
  }
  return questions;
}


/* ─── MONSTER DATA ───────────────────────────────────────────────────────── */
const MONSTERS = [
  {
    id: "nebelwurm",
    name: "Nebelwurm",
    title: "Der Laut-Verschleierer",
    zone: "Nebelwald",
    zoneEmoji: "🌫️",
    type: "ei_ie",
    level: 1,
    maxHp: 120,
    attack: 12,
    color: "#06b6d4",
    darkColor: "#0e4f60",
    bgFrom: "#030f1a",
    bgTo: "#05202e",
    battleCry: "Ich verneeble deine Laute… ei oder ie… wer weiß das schon?",
    weakMsg: "Super effektiv! Der Nebelwurm hasst klares Hören!",
    defeatMsg: "Der Nebelwurm löst sich in hellem Licht auf. Du hörst jetzt klar!",
    lore: "Lebt im Lautnebel. Verwechselt ei und ie, bis alles verschwommen klingt.",
  },
  {
    id: "spiegelgeist",
    name: "Spiegelgeist",
    title: "Der Buchstaben-Verdreher",
    zone: "Spiegelburg",
    zoneEmoji: "🪞",
    type: "bd",
    level: 2,
    maxHp: 130,
    attack: 15,
    color: "#a78bfa",
    darkColor: "#2d1b69",
    bgFrom: "#0a0315",
    bgTo: "#150828",
    battleCry: "b… d… d… b… welches ist welches?",
    weakMsg: "Du erkennst den Unterschied! Spiegelgeist ist verwirrt!",
    defeatMsg: "Der Spiegelgeist zerspringt in tausend Splitter. b ist b und d ist d!",
    lore: "Verwandelt b in d und zurück. Lauert in Spiegeln und verdreht Buchstaben.",
  },
  {
    id: "doppeltroll",
    name: "Doppel-Troll",
    title: "Der Konsonanten-Verdoppler",
    zone: "Doppelhöhle",
    zoneEmoji: "⚡",
    type: "doppel",
    level: 3,
    maxHp: 140,
    attack: 18,
    color: "#f59e0b",
    darkColor: "#78350f",
    bgFrom: "#120800",
    bgTo: "#1f1000",
    battleCry: "Kommen oder kommen? Zwei m oder eins?",
    weakMsg: "Dein Regelwissen trifft den Troll! Doppelt hält besser!",
    defeatMsg: "Der Doppel-Troll schrumpft auf Einzel-Trollgröße. Klar: kommen mit mm!",
    lore: "Streut überall doppelte Konsonanten – oder lässt sie weg. Lebt in der Ungewissheit.",
  },
  {
    id: "schattenfuerst",
    name: "Schattenfürst",
    title: "Der Auslaut-Verhärter",
    zone: "Schattenburg",
    zoneEmoji: "🌑",
    type: "auslaut",
    level: 4,
    maxHp: 150,
    attack: 20,
    color: "#64748b",
    darkColor: "#1e293b",
    bgFrom: "#030508",
    bgTo: "#0a0f18",
    battleCry: "Hund oder Hunt? Das klingt doch gleich!",
    weakMsg: "Verlängerungstrick! Der Schattenfürst verliert seine Kraft!",
    defeatMsg: "Der Schattenfürst weicht dem Licht der Verlängerungsregel!",
    lore: "Verhärtet alle Auslaute. Hund klingt wie Hunt – und er WILL, dass du es falsch schreibst.",
  },
  {
    id: "regelbrecher",
    name: "Regelbrecher",
    title: "Der Chaos-Meister",
    zone: "Regelruinen",
    zoneEmoji: "📚",
    type: "mixed",
    level: 5,
    maxHp: 160,
    attack: 22,
    color: "#ec4899",
    darkColor: "#831843",
    bgFrom: "#150010",
    bgTo: "#1f0018",
    battleCry: "Regeln? Ich zerreisse alle Regeln!",
    weakMsg: "Dein Regelwissen macht den Regelbrecher schwach!",
    defeatMsg: "Der Regelbrecher kapituliert! Du hast alle seine Tricks durchschaut!",
    lore: "Der mächtigste Monster. Mischt alle Fehlertypen durcheinander. Besiege ihn und du hast alle Angstmonster überwunden.",
  },
  {
    id: "wortfresser",
    name: "Wortfresser",
    title: "Der Buchstaben-Schlinger",
    zone: "Knochenkrypta",
    zoneEmoji: "💀",
    type: "allgemein",
    level: 6,
    maxHp: 170,
    attack: 24,
    color: "#84cc16",
    darkColor: "#365314",
    bgFrom: "#050a00",
    bgTo: "#0f1a05",
    battleCry: "Ich fresse alle Buchstaben! Schreib schneller!",
    weakMsg: "Der Wortfresser verschluckt sich an deiner Antwort!",
    defeatMsg: "Der Wortfresser ist satt und gibt auf. Du beherrschst die Wörter!",
    lore: "Frisst ganze Wörter und spuckt sie falsch geschrieben wieder aus. Der hungrigste aller Monster.",
  },
];

// Dynamic challenge generation from word bank
function getChallenges(monster, difficulty, wordStats = {}) {
  return generateChallenges(monster.id, difficulty, wordStats);
}

/* ─── PRÜFER DATA (Diagnostic Boss) ─────────────────────────────────────── */
// Dynamisch generiert: 10 Fragen aus 5 zufälligen Kategorien (3 leicht + 4 mittel + 3 hart)
// Wird bei jedem Diagnose-Start neu erzeugt

function calcDifficulty(score) {
  if (score <= 3) return "leicht";
  if (score <= 7) return "mittel";
  return "hart";
}

/* ─── MONSTER SVG ART ────────────────────────────────────────────────────── */
/* ─── SPRITE SHEET CONFIG ─────────────────────────────────────────────────── */
const SPRITE_DATA = {
  nebelwurm: {
    frameW: 90, frameH: 90, scale: 1.8,
    idle:   { src: './sprites/fireworm-idle.png',   frames: 9,  dur: 1.2 },
    attack: { src: './sprites/fireworm-attack.png', frames: 16, dur: 1.0 },
    hurt:   { src: './sprites/fireworm-hurt.png',   frames: 3,  dur: 0.45 },
    death:  { src: './sprites/fireworm-death.png',  frames: 8,  dur: 0.8 },
  },
  spiegelgeist: {
    frameW: 150, frameH: 150, scale: 1.1,
    idle:   { src: './sprites/flyingeye-idle.png',   frames: 8, dur: 1.0 },
    attack: { src: './sprites/flyingeye-attack.png', frames: 8, dur: 0.6 },
    hurt:   { src: './sprites/flyingeye-hurt.png',   frames: 4, dur: 0.45 },
    death:  { src: './sprites/flyingeye-death.png',  frames: 4, dur: 0.6 },
  },
  doppeltroll: {
    frameW: 150, frameH: 150, scale: 1.1,
    idle:   { src: './sprites/mushroom-idle.png',   frames: 4, dur: 0.8 },
    attack: { src: './sprites/mushroom-attack.png', frames: 8, dur: 0.6 },
    hurt:   { src: './sprites/mushroom-hurt.png',   frames: 4, dur: 0.45 },
    death:  { src: './sprites/mushroom-death.png',  frames: 4, dur: 0.6 },
  },
  schattenfuerst: {
    frameW: 80, frameH: 80, scale: 2.0,
    sheet: './sprites/nightborne.png',
    sheetW: 1840, sheetH: 400,
    idle:   { row: 0, frames: 9,  dur: 1.2 },
    attack: { row: 2, frames: 12, dur: 0.8 },
    hurt:   { row: 3, frames: 5,  dur: 0.45 },
    death:  { row: 4, frames: 23, dur: 1.5 },
  },
  regelbrecher: {
    frameW: 150, frameH: 150, scale: 1.1,
    idle:   { src: './sprites/goblin-idle.png',   frames: 4, dur: 0.8 },
    attack: { src: './sprites/goblin-attack.png', frames: 8, dur: 0.6 },
    hurt:   { src: './sprites/goblin-hurt.png',   frames: 4, dur: 0.45 },
    death:  { src: './sprites/goblin-death.png',  frames: 4, dur: 0.6 },
  },
  wortfresser: {
    frameW: 150, frameH: 150, scale: 1.1,
    idle:   { src: './sprites/skeleton-idle.png',   frames: 4, dur: 0.8 },
    attack: { src: './sprites/skeleton-attack.png', frames: 8, dur: 0.6 },
    hurt:   { src: './sprites/skeleton-hurt.png',   frames: 4, dur: 0.45 },
    death:  { src: './sprites/skeleton-death.png',  frames: 4, dur: 0.6 },
  },
};

const PLAYER_SPRITE = {
  frameW: 140, frameH: 140, scale: 1.0,
  idle:   { src: './sprites/hero-idle.png',   frames: 11, dur: 1.5 },
  attack: { src: './sprites/hero-attack.png', frames: 6,  dur: 0.5 },
  hurt:   { src: './sprites/hero-hurt.png',   frames: 4,  dur: 0.45 },
};

/* Generiere CSS @keyframes fuer alle Sprite-Sheet-Animationen */
function generateSpriteKeyframes() {
  let kf = '';
  for (const [id, data] of Object.entries(SPRITE_DATA)) {
    for (const state of ['idle', 'attack', 'hurt', 'death']) {
      const anim = data[state];
      if (!anim) continue;
      const s = data.scale;
      if (data.sheet) {
        const yOff = -(anim.row * data.frameH * s);
        const xEnd = -(anim.frames * data.frameW * s);
        kf += `@keyframes ${id}_${state}{from{background-position:0 ${yOff}px}to{background-position:${xEnd}px ${yOff}px}}\n`;
      } else {
        const xEnd = -(anim.frames * data.frameW * s);
        kf += `@keyframes ${id}_${state}{from{background-position-x:0}to{background-position-x:${xEnd}px}}\n`;
      }
    }
  }
  for (const state of ['idle', 'attack', 'hurt']) {
    const anim = PLAYER_SPRITE[state];
    const xEnd = -(anim.frames * PLAYER_SPRITE.frameW * PLAYER_SPRITE.scale);
    kf += `@keyframes player_${state}{from{background-position-x:0}to{background-position-x:${xEnd}px}}\n`;
  }
  return kf;
}

function MonsterSprite({ monster, isHurt, isAttacking, isDying }) {
  const moveAnim = isDying ? "monsterDeath 0.9s ease-out forwards"
    : isHurt      ? "monsterHurt 0.55s ease-out"
    : isAttacking ? "monsterAttack 0.5s ease-out"
    : "monsterIdle 2.8s ease-in-out infinite";

  const data = SPRITE_DATA[monster.id];
  if (!data) return null;

  const state = isDying ? 'death' : isHurt ? 'hurt' : isAttacking ? 'attack' : 'idle';
  const animData = data[state];
  const s = data.scale;
  const displayW = data.frameW * s;
  const displayH = data.frameH * s;

  const src = data.sheet || animData.src;
  const bgSize = data.sheet
    ? `${data.sheetW * s}px ${data.sheetH * s}px`
    : `${data.frameW * animData.frames * s}px ${displayH}px`;

  const loop = state === 'idle';
  const frameAnim = `${monster.id}_${state} ${animData.dur}s steps(${animData.frames}) ${loop ? 'infinite' : 'forwards'}`;

  return (
    <div className="sprite-wrap" style={{ animation: moveAnim, display: "inline-block" }}>
      <div key={state} style={{
        width: displayW,
        height: displayH,
        backgroundImage: `url(${src})`,
        backgroundSize: bgSize,
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
        animation: frameAnim,
      }} />
    </div>
  );
}

/* ─── PLAYER SPRITE ──────────────────────────────────────────────────────── */
function PlayerSprite({ isAttacking, isHurt }) {
  const moveAnim = isHurt      ? "playerHurt 0.55s ease-out"
    : isAttacking              ? "playerAttack 0.7s cubic-bezier(.2,.9,.3,1)"
    : "playerIdle 2.4s ease-in-out infinite";

  const data = PLAYER_SPRITE;
  const state = isHurt ? 'hurt' : isAttacking ? 'attack' : 'idle';
  const animData = data[state];
  const s = data.scale;
  const displayW = data.frameW * s;
  const displayH = data.frameH * s;

  const bgSize = `${data.frameW * animData.frames * s}px ${displayH}px`;
  const loop = state === 'idle';
  const frameAnim = `player_${state} ${animData.dur}s steps(${animData.frames}) ${loop ? 'infinite' : 'forwards'}`;

  return (
    <div className="sprite-wrap" style={{ animation: moveAnim, display: "inline-block" }}>
      <div key={state} style={{
        width: displayW,
        height: displayH,
        backgroundImage: `url(${animData.src})`,
        backgroundSize: bgSize,
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
        animation: frameAnim,
        transform: 'scaleX(-1)',
      }} />
    </div>
  );
}

/* ─── HP BAR ─────────────────────────────────────────────────────────────── */
function HPBar({ current, max, color, label, small }) {
  const pct = Math.max(0, (current / max) * 100);
  const barColor = pct > 50 ? "#22c55e" : pct > 25 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: small ? 10 : 12, fontWeight: 700, color: color, fontFamily: "'Outfit', sans-serif" }}>{label}</span>
        <span style={{ fontSize: small ? 10 : 12, fontFamily: "'JetBrains Mono', monospace", color: "#94a3b8" }}>{current}/{max}</span>
      </div>
      <div style={{ height: small ? 8 : 12, background: "#1e293b", borderRadius: 6, overflow: "hidden", border: "1px solid #334155" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: barColor, borderRadius: 6, transition: "width 0.5s cubic-bezier(.34,1.56,.64,1)", boxShadow: `0 0 8px ${barColor}66` }}/>
      </div>
    </div>
  );
}

/* ─── DAMAGE NUMBER ──────────────────────────────────────────────────────── */
function DamageFloat({ value, isPlayer }) {
  const color = isPlayer ? "#f87171" : "#fbbf24";
  return (
    <div style={{
      position: "absolute", top: isPlayer ? "55%" : "8%", left: isPlayer ? "8%" : "52%",
      fontSize: 30, fontWeight: 900, color, fontFamily: "'Press Start 2P', monospace",
      animation: "floatUpBounce 1.1s cubic-bezier(.22,1,.36,1) forwards",
      pointerEvents: "none", zIndex: 50,
      textShadow: `0 0 24px ${color}, 0 2px 4px #000`,
    }}>
      -{value}
    </div>
  );
}

/* ─── BATTLE LOG ─────────────────────────────────────────────────────────── */
function BattleLog({ messages }) {
  const ref = useRef();
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [messages]);
  return (
    <div ref={ref} style={{
      background: "#030712", border: "1px solid #1e293b", borderRadius: 10,
      padding: "10px 14px", maxHeight: 90, overflowY: "auto",
      fontFamily: "'Outfit', sans-serif", fontSize: 13,
    }}>
      {messages.map((m, i) => (
        <div key={i} style={{ color: m.color || "#94a3b8", marginBottom: 3, animation: i === messages.length - 1 ? "fadeIn 0.3s ease" : "none" }}>
          {m.text}
        </div>
      ))}
    </div>
  );
}

/* ─── CHALLENGE ──────────────────────────────────────────────────────────── */
function ChallengePanel({ challenge, onCorrect, onWrong, monsterColor }) {
  const [input, setInput] = useState("");
  const [chosen, setChosen] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => { setInput(""); setChosen(null); setSubmitted(false); setCelebrating(false); }, [challenge]);

  function playAudio() {
    setPlaying(true);
    tts.word(challenge.word);
    setTimeout(() => setPlaying(false), 1500);
  }

  function checkInput() {
    if (!input.trim() || submitted) return;
    setSubmitted(true);
    const ok = input.trim().toLowerCase() === challenge.word.toLowerCase();
    if (ok) setCelebrating(true);
    setTimeout(() => { ok ? onCorrect() : onWrong(); }, 700);
  }

  function chooseOption(opt) {
    if (chosen || submitted) return;
    setChosen(opt);
    setSubmitted(true);
    const ok = opt === challenge.correct;
    if (ok) setCelebrating(true);
    setTimeout(() => { ok ? onCorrect() : onWrong(); }, 700);
  }

  const isInputCorrect = submitted && challenge.type === "input" && input.trim().toLowerCase() === challenge.word.toLowerCase();

  return (
    <div style={{
      background: "#0d1333", border: `2px solid ${monsterColor}44`,
      borderRadius: 14, padding: "18px 20px",
      position: "relative", overflow: "visible",
    }}>
      {/* Sparkles on celebration */}
      {celebrating && [0,1,2,3,4,5].map(i => (
        <div key={i} style={{
          position: "absolute",
          left: `${15 + i * 14}%`, top: `${-5 + (i%2)*(-10)}px`,
          fontSize: 18, pointerEvents: "none", zIndex: 10,
          animation: `sparkleFloat 0.75s ease-out ${i*80}ms forwards`,
        }}>{["✦","⭐","✦","💫","✦","⭐"][i]}</div>
      ))}
      <div style={{ fontSize: 11, fontWeight: 700, color: monsterColor, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12, fontFamily: "'Outfit', sans-serif" }}>
        ⚔️ ANGRIFF
      </div>
      <div style={{ fontSize: 14, color: "#c7cde8", marginBottom: challenge.sentence ? 8 : 14, fontFamily: "'Outfit', sans-serif" }}>{challenge.q}</div>

      {challenge.sentence && (
        <div style={{
          fontSize: 15, color: "#94a3b8", marginBottom: 14, fontFamily: "'Outfit', sans-serif",
          background: "#07091a", borderRadius: 8, padding: "8px 12px",
          borderLeft: `3px solid ${monsterColor}66`, lineHeight: 1.6,
        }}>
          {challenge.sentence.split("___").map((part, i, arr) => (
            <span key={i}>
              {part}
              {i < arr.length - 1 && (
                <span style={{
                  display: "inline-block", minWidth: 60, borderBottom: "2px dashed #475569",
                  textAlign: "center", margin: "0 2px", color: "#fbbf24", fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>{submitted ? challenge.word : "\u00A0?\u00A0"}</span>
              )}
            </span>
          ))}
        </div>
      )}

      {challenge.type === "input" && (
        <>
          {challenge.audio && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <button onClick={playAudio} style={{
                background: playing ? `${monsterColor}33` : "#07091a",
                border: `2px solid ${monsterColor}66`, borderRadius: 10,
                padding: "10px 20px", color: monsterColor, cursor: "pointer",
                fontSize: 18, fontFamily: "'Outfit', sans-serif",
                animation: playing ? "pulse 1s infinite" : "none",
              }}>🔊 Hören</button>
              <span style={{ fontSize: 12, color: "#475569", fontFamily: "'Outfit', sans-serif" }}>Hör das Wort, dann tippe es</span>
            </div>
          )}
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && checkInput()}
            disabled={submitted}
            autoComplete="off" spellCheck={false} autoFocus
            style={{
              width: "100%", background: "#07091a",
              border: `2px solid ${submitted ? (isInputCorrect ? "#22c55e" : "#ef4444") : "#1e2a5a"}`,
              borderRadius: 10, padding: "12px 16px",
              color: "#e8eaf6", fontSize: 20,
              fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
              outline: "none", letterSpacing: 1, marginBottom: 10,
              animation: celebrating ? "correctGlow 0.7s ease-out" : "none",
              boxShadow: submitted ? (isInputCorrect ? "0 0 20px #22c55e44" : "0 0 20px #ef444444") : "none",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
            placeholder="Wort eintippen …"
          />
          <button onClick={checkInput} disabled={!input.trim() || submitted} style={{
            background: monsterColor, color: "#07091a", border: "none",
            borderRadius: 10, padding: "11px 28px", fontSize: 14,
            fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif",
            opacity: !input.trim() || submitted ? 0.4 : 1,
          }}>
            Angriff! ⚔️
          </button>
        </>
      )}

      {challenge.type === "choice" && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {challenge.options.filter((v, i, a) => a.indexOf(v) === i).map((opt, i) => {
            let bg = "#07091a", border = "#1e2a5a", color = "#e8eaf6";
            const isCorrectOpt = chosen && opt === challenge.correct;
            if (chosen) {
              if (isCorrectOpt) { bg = "#052e16"; border = "#22c55e"; color = "#4ade80"; }
              else if (opt === chosen) { bg = "#2e0516"; border = "#ef4444"; color = "#f87171"; }
            }
            return (
              <button key={i} onClick={() => chooseOption(opt)} style={{
                background: bg, border: `2px solid ${border}`, borderRadius: 10,
                padding: "12px 20px", color, fontSize: 16,
                fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
                cursor: chosen ? "default" : "pointer",
                transition: "all 0.2s", flex: "1 1 auto",
                animation: isCorrectOpt ? "correctGlow 0.7s ease-out" : "none",
                boxShadow: chosen && isCorrectOpt ? "0 0 16px #22c55e44" : "none",
              }}>
                {opt}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── PRÜFER BOSS (Diagnostic entry battle) ─────────────────────────────── */
function DiagnoseBoss({ onComplete }) {
  const [phase, setPhase]   = useState("intro"); // intro | battle | result
  const [qIdx, setQIdx]     = useState(0);
  const [score, setScore]   = useState(0);
  const [input, setInput]   = useState("");
  const [chosen, setChosen] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [bossHp, setBossHp] = useState(100);
  const [shake, setShake]   = useState(false);
  const [log, setLog]       = useState([]);
  const [pruferQuestions] = useState(() => generatePruferQuestions());

  const q = pruferQuestions[qIdx];
  const BOSS_HP_MAX = 100;

  useEffect(() => {
    setLog([{ text: "Der Prüfer erscheint!", color: "#a78bfa" },
            { text: '"Ich bin der Prüfer! Zeig mir… was du kannst!"', color: "#ef4444" }]);
    tts.monster("Ich bin der Prüfer! Zeig mir, was du kannst!");
    setTimeout(() => setPhase("battle"), 2200);
  }, []);

  function addLog(msg) { setLog(p => [...p.slice(-8), msg]); }

  function playWord() {
    setPlaying(true);
    tts.word(q.word);
    setTimeout(() => setPlaying(false), 1500);
  }

  function handleCorrect() {
    const dmg = Math.floor(BOSS_HP_MAX / pruferQuestions.length);
    sfx.crit();
    setShake(true); setTimeout(() => setShake(false), 500);
    const newHp = Math.max(0, bossHp - dmg);
    setBossHp(newHp);
    setScore(s => s + 1);
    addLog({ text: `✓ Richtig! [${q.hint}] Treffer!`, color: "#4ade80" });
    setTimeout(advance, 700);
  }

  function handleWrong() {
    sfx.hurt();
    addLog({ text: `✗ Falsch – korrekt: „${q.word}" [${q.hint}]`, color: "#f87171" });
    setTimeout(advance, 900);
  }

  function advance() {
    setSubmitted(false); setInput(""); setChosen(null);
    if (qIdx + 1 >= pruferQuestions.length) { setPhase("result"); sfx.win(); }
    else setQIdx(i => i + 1);
  }

  function checkInput() {
    if (!input.trim() || submitted) return;
    setSubmitted(true);
    input.trim().toLowerCase() === q.word.toLowerCase() ? handleCorrect() : handleWrong();
  }

  function chooseOption(opt) {
    if (submitted) return;
    setChosen(opt); setSubmitted(true);
    opt === q.correct ? handleCorrect() : handleWrong();
  }

  const isCorrect = submitted && q.type === "input" && input.trim().toLowerCase() === q.word.toLowerCase();
  const autoLevel = calcDifficulty(score);

  // ── RESULT ──
  if (phase === "result") {
    const finalScore = score; // score is set before we get here
    const level = calcDifficulty(finalScore);
    return (
      <div style={{ minHeight: "100%", background: "linear-gradient(160deg, #0a0315 0%, #150828 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: "#a78bfa", marginBottom: 20, lineHeight: 1.8 }}>
            PRÜFUNG<br/>ABGESCHLOSSEN
          </div>
          {/* Score display */}
          <div style={{ background: "#0d1333", border: "2px solid #a78bfa44", borderRadius: 16, padding: "24px", marginBottom: 20 }}>
            <div style={{ fontSize: 56, fontWeight: 900, color: "#fbbf24", lineHeight: 1 }}>{finalScore}</div>
            <div style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>von {pruferQuestions.length} Fragen richtig</div>
            {/* Bar breakdown */}
            <div style={{ marginTop: 16, display: "flex", gap: 4, height: 8, borderRadius: 4, overflow: "hidden" }}>
              {pruferQuestions.map((_, i) => (
                <div key={i} style={{ flex: 1, background: i < finalScore ? "#22c55e" : "#1e293b", borderRadius: 2 }}/>
              ))}
            </div>
            {/* Auto level */}
            <div style={{ marginTop: 16, padding: "10px 16px", background: `${DIFF_COLORS[level]}15`, border: `1px solid ${DIFF_COLORS[level]}44`, borderRadius: 10 }}>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>AUTOMATISCH ERKANNT</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: DIFF_COLORS[level] }}>{DIFF_LABELS[level]}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                {level === "leicht" && "Grundwortschatz – häufige, kurze Wörter"}
                {level === "mittel" && "Schulwortschatz Klasse 6–7"}
                {level === "hart"   && "Gymnasium-Niveau Klasse 8+"}
              </div>
            </div>
          </div>
          <button onClick={() => onComplete(level)} style={{ background: "#a78bfa", color: "#07091a", border: "none", borderRadius: 12, padding: "14px 36px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
            Schwierigkeit anpassen →
          </button>
        </div>
      </div>
    );
  }

  // ── INTRO ──
  if (phase === "intro") return (
    <div style={{ minHeight: "100%", background: "linear-gradient(160deg, #0a0315 0%, #150828 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ textAlign: "center", padding: 24 }}>
        <div style={{ fontSize: 80, animation: "bounce 0.8s ease-out", marginBottom: 16 }}>🔮</div>
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 12, color: "#a78bfa", lineHeight: 2 }}>DER PRÜFER<br/><span style={{ fontSize: 8, color: "#64748b" }}>erscheint…</span></div>
      </div>
    </div>
  );

  // ── BATTLE ──
  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(160deg, #0a0315 0%, #150828 100%)", display: "flex", flexDirection: "column", fontFamily: "'Outfit', sans-serif" }}>
      {/* Top bar */}
      <div style={{ background: "rgba(0,0,0,0.5)", borderBottom: "1px solid #1e293b", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: "#a78bfa" }}>DER PRÜFER</span>
        <span style={{ fontSize: 12, color: "#64748b", fontFamily: "'Outfit', sans-serif" }}>Frage {qIdx + 1} / {pruferQuestions.length}</span>
      </div>

      <div style={{ flex: 1, padding: "16px", maxWidth: 560, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
        {/* HP bars */}
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ background: "rgba(0,0,0,0.5)", border: "1px solid #1e293b", borderRadius: 12, padding: "10px 14px", flex: 1 }}>
            <HPBar current={bossHp} max={BOSS_HP_MAX} color="#a78bfa" label="Der Prüfer" />
          </div>
          <div style={{ background: "rgba(0,0,0,0.5)", border: "1px solid #1e293b", borderRadius: 12, padding: "10px 14px", flex: 1 }}>
            <HPBar current={score} max={PRUFER_QUESTIONS.length} color="#4ade80" label="Richtig" />
          </div>
        </div>

        {/* Arena */}
        <div style={{ position: "relative", background: "rgba(0,0,0,0.3)", borderRadius: 16, border: "1px solid #1e293b", height: 160, display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "12px 28px", overflow: "hidden" }}>
          <div style={{ animation: shake ? "shakeX 0.4s ease-out" : "none" }}>
            <svg viewBox="0 0 100 110" width="110" height="120">
              <defs>
                <radialGradient id="prufer-g" cx="50%" cy="40%"><stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.9"/><stop offset="100%" stopColor="#6d28d9" stopOpacity="0.7"/></radialGradient>
                <filter id="pf"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              </defs>
              {/* Robes */}
              <path d="M10 110 L20 55 Q50 35 80 55 L90 110 Q50 100 10 110Z" fill="url(#prufer-g)" filter="url(#pf)"/>
              {/* Head */}
              <circle cx="50" cy="38" r="24" fill="#2e1065" filter="url(#pf)"/>
              {/* Wizard hat */}
              <polygon points="50,2 36,40 64,40" fill="#4c1d95"/>
              <rect x="32" y="38" width="36" height="6" rx="3" fill="#6d28d9"/>
              {/* Eyes glowing */}
              <ellipse cx="42" cy="36" rx="6" ry="6" fill="#7c3aed"/>
              <ellipse cx="58" cy="36" rx="6" ry="6" fill="#7c3aed"/>
              <ellipse cx="42" cy="36" rx="3" ry="3" fill="#e9d5ff" filter="url(#pf)"/>
              <ellipse cx="58" cy="36" rx="3" ry="3" fill="#e9d5ff" filter="url(#pf)"/>
              {/* Stern mouth */}
              <path d="M40 50 L60 50" stroke="#a78bfa" strokeWidth="2"/>
              {/* Staff */}
              <line x1="76" y1="60" x2="90" y2="20" stroke="#7c3aed" strokeWidth="3"/>
              <circle cx="90" cy="18" r="6" fill="#c4b5fd" filter="url(#pf)"/>
              {/* ? marks floating */}
              <text x="8"  y="30" fontSize="12" fill="#a78bfa" opacity="0.5" fontFamily="monospace">?</text>
              <text x="82" y="50" fontSize="12" fill="#a78bfa" opacity="0.4" fontFamily="monospace">?</text>
            </svg>
          </div>
          {/* Diff indicator floating */}
          <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.7)", border: "1px solid #a78bfa44", borderRadius: 20, padding: "4px 14px", fontSize: 11, color: "#a78bfa", fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>
            {q.diff === "leicht" ? "⭐" : q.diff === "mittel" ? "⭐⭐" : "⭐⭐⭐"} {q.hint}
          </div>
          <PlayerSprite isAttacking={false} isHurt={false} />
        </div>

        {/* Log */}
        <BattleLog messages={log} />

        {/* Challenge */}
        <div style={{ background: "#0d1333", border: "2px solid #a78bfa44", borderRadius: 14, padding: "18px 20px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12, fontFamily: "'Outfit', sans-serif" }}>⚔️ ANGRIFF</div>
          <div style={{ fontSize: 14, color: "#c7cde8", marginBottom: q.sentence ? 8 : 14, fontFamily: "'Outfit', sans-serif" }}>{q.q}</div>
          {q.sentence && (
            <div style={{
              fontSize: 15, color: "#94a3b8", marginBottom: 14, fontFamily: "'Outfit', sans-serif",
              background: "#07091a", borderRadius: 8, padding: "8px 12px",
              borderLeft: "3px solid #a78bfa66", lineHeight: 1.6,
            }}>
              {q.sentence.split("___").map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span style={{
                      display: "inline-block", minWidth: 60, borderBottom: "2px dashed #475569",
                      textAlign: "center", margin: "0 2px", color: "#fbbf24", fontWeight: 700,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>{submitted ? q.word : "\u00A0?\u00A0"}</span>
                  )}
                </span>
              ))}
            </div>
          )}
          {q.type === "input" && (
            <>
              {q.audio && (
                <button onClick={playWord} style={{ background: playing ? "#a78bfa33" : "#07091a", border: "2px solid #a78bfa66", borderRadius: 10, padding: "10px 20px", color: "#a78bfa", cursor: "pointer", fontSize: 16, fontFamily: "'Outfit', sans-serif", marginBottom: 10 }}>
                  🔊 Hören
                </button>
              )}
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && checkInput()} disabled={submitted} autoComplete="off" spellCheck={false} autoFocus
                style={{ width: "100%", background: "#07091a", border: `2px solid ${submitted ? (isCorrect ? "#22c55e" : "#ef4444") : "#1e2a5a"}`, borderRadius: 10, padding: "12px 16px", color: "#e8eaf6", fontSize: 20, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, outline: "none", letterSpacing: 1, marginBottom: 10 }} placeholder="Wort eintippen …"
              />
              <button onClick={checkInput} disabled={!input.trim() || submitted} style={{ background: "#a78bfa", color: "#07091a", border: "none", borderRadius: 10, padding: "11px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif", opacity: !input.trim() || submitted ? 0.4 : 1 }}>Angriff! ⚔️</button>
            </>
          )}
          {q.type === "choice" && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {q.options.filter((v, i, a) => a.indexOf(v) === i).map((opt, i) => {
                let bg = "#07091a", border = "#1e2a5a", col = "#e8eaf6";
                if (chosen) { if (opt === q.correct) { bg="#052e16"; border="#22c55e"; col="#4ade80"; } else if (opt === chosen) { bg="#2e0516"; border="#ef4444"; col="#f87171"; } }
                return <button key={i} onClick={() => chooseOption(opt)} style={{ background: bg, border: `2px solid ${border}`, borderRadius: 10, padding: "12px 18px", color: col, fontSize: 15, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, cursor: chosen ? "default" : "pointer", flex: "1 1 auto" }}>{opt}</button>;
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── SESSION PAUSE SCREEN ───────────────────────────────────────────────── */
function SessionPauseScreen({ roundNum, roundCorrect, roundWrong, roundVictory, sessionCorrect, threshold, monsterName, monsterEmoji, onNext }) {
  const [countdown, setCountdown] = useState(PAUSE_DURATION);

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(t); onNext(); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(160deg, #030712 0%, #0d1333 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>

        {/* Runden-Fortschritt */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 20 }}>
          {Array.from({ length: SESSION_ROUNDS }, (_, i) => (
            <div key={i} style={{ width: 28, height: 6, borderRadius: 3, background: i < roundNum ? "#a78bfa" : "#1e293b", transition: "background 0.3s" }} />
          ))}
        </div>

        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: "#475569", marginBottom: 12, letterSpacing: 1 }}>
          RUNDE {roundNum} / {SESSION_ROUNDS}
        </div>

        <div style={{ fontSize: 40, marginBottom: 8 }}>{roundVictory ? "✅" : "⏱️"}</div>
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: roundVictory ? "#4ade80" : "#f59e0b", marginBottom: 4 }}>
          {roundVictory ? "GESCHAFFT!" : "ZEIT UM"}
        </div>
        <div style={{ color: "#64748b", fontSize: 13, marginBottom: 24 }}>{monsterEmoji} {monsterName}</div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 24 }}>
          <div style={{ background: "#0d1333", border: "1px solid #22c55e33", borderRadius: 12, padding: "12px 20px", minWidth: 110 }}>
            <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4 }}>Diese Runde</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 26, fontWeight: 900, color: "#4ade80", lineHeight: 1 }}>
              {roundCorrect}<span style={{ color: "#334155", fontSize: 14 }}>/{threshold}</span>
            </div>
            <div style={{ fontSize: 10, color: "#475569", marginTop: 3 }}>{roundWrong > 0 ? `${roundWrong} falsch` : "perfekt!"}</div>
          </div>
          <div style={{ background: "#0d1333", border: "1px solid #fbbf2433", borderRadius: 12, padding: "12px 20px", minWidth: 110 }}>
            <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4 }}>Session gesamt</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 26, fontWeight: 900, color: "#fbbf24", lineHeight: 1 }}>
              {sessionCorrect}
            </div>
            <div style={{ fontSize: 10, color: "#475569", marginTop: 3 }}>richtige Wörter</div>
          </div>
        </div>

        {/* Countdown */}
        <div style={{ background: "#1e293b", borderRadius: 8, overflow: "hidden", height: 6, marginBottom: 10 }}>
          <div style={{ width: `${(countdown / PAUSE_DURATION) * 100}%`, height: "100%", background: "#a78bfa", transition: "width 1s linear" }} />
        </div>
        <div style={{ fontSize: 12, color: "#475569", marginBottom: 20 }}>
          Nächste Runde in <span style={{ color: "#a78bfa", fontWeight: 700 }}>{countdown}s</span>
        </div>

        <button onClick={onNext} style={{ background: "#a78bfa", color: "#07091a", border: "none", borderRadius: 12, padding: "12px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
          Weiter →
        </button>
      </div>
    </div>
  );
}

/* ─── SESSION END SCREEN ─────────────────────────────────────────────────── */
function SessionEndScreen({ rounds, totalCorrect, totalWrong, streak, xpEarned, onBack }) {
  const total = totalCorrect + totalWrong;
  const pct = total > 0 ? Math.round((totalCorrect / total) * 100) : 0;

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(160deg, #030712 0%, #0a0a1a 100%)", overflowY: "auto", padding: "32px 16px", fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ maxWidth: 460, margin: "0 auto", textAlign: "center" }}>

        <div style={{ fontSize: 60, marginBottom: 10, animation: "bounce 0.6s ease-out" }}>🏆</div>
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: "#fbbf24", marginBottom: 8, lineHeight: 1.8 }}>
          SESSION ABGESCHLOSSEN!
        </div>
        <div style={{ color: "#64748b", fontSize: 13, marginBottom: 24 }}>
          {SESSION_ROUNDS} Runden · ~10 Minuten Übung
        </div>

        {/* Streak */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#120800", border: "1px solid #f59e0b44", borderRadius: 20, padding: "8px 20px", marginBottom: 24 }}>
          <span style={{ fontSize: 22 }}>🔥</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 900, color: "#f59e0b" }}>{streak}</span>
          <span style={{ fontSize: 13, color: "#92400e" }}>Tag{streak !== 1 ? "e" : ""} in Folge</span>
        </div>

        {/* Hauptzahl */}
        <div style={{ background: "#0d1333", border: "1px solid #4ade8055", borderRadius: 16, padding: "20px 24px", marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 1, marginBottom: 8 }}>HEUTE RICHTIG GESCHRIEBEN</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 64, fontWeight: 900, color: "#4ade80", lineHeight: 1 }}>{totalCorrect}</div>
          <div style={{ fontSize: 13, color: "#475569", marginTop: 8 }}>Wörter · {pct}% Genauigkeit</div>
        </div>

        {/* XP */}
        <div style={{ background: "#0d1333", border: "1px solid #fbbf2433", borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>⚡</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 900, color: "#fbbf24" }}>+{xpEarned} XP</span>
          <span style={{ fontSize: 13, color: "#475569" }}>diese Session</span>
        </div>

        {/* Runden-Übersicht */}
        <div style={{ background: "#0d1333", border: "1px solid #1e293b", borderRadius: 12, padding: "14px 16px", marginBottom: 28, textAlign: "left" }}>
          <div style={{ fontSize: 10, color: "#475569", fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>RUNDENÜBERSICHT</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rounds.map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: "#334155", minWidth: 24 }}>R{i + 1}</span>
                <span style={{ fontSize: 18 }}>{r.monster.zoneEmoji}</span>
                <span style={{ fontSize: 12, color: "#64748b", flex: 1 }}>{r.monster.name}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ background: "#052e16", border: "1px solid #22c55e33", borderRadius: 6, padding: "2px 8px", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: "#4ade80" }}>
                    {r.correct} ✓
                  </div>
                  <span style={{ fontSize: 16 }}>{r.victory ? "✅" : "⏱️"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button onClick={onBack} style={{ background: "#a78bfa", color: "#07091a", border: "none", borderRadius: 12, padding: "14px 40px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
          Zur Karte 🗺️
        </button>
      </div>
    </div>
  );
}

/* ─── DIFFICULTY PANEL ───────────────────────────────────────────────────── */
function DifficultyPanel({ autoLevel, onConfirm }) {
  const [selected, setSelected] = useState(autoLevel);
  const [klasse, setKlasse] = useState(null);
  const klassen = ["5", "6", "7", "8", "9+"];

  function pickKlasse(k) {
    setKlasse(k);
    setSelected(KLASSE_TO_DIFF[k]);
  }

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(160deg, #030712 0%, #0d1333 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ maxWidth: 500, width: "100%" }}>
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: "#fbbf24", marginBottom: 20, textAlign: "center", lineHeight: 2 }}>
          SCHWIERIGKEIT<br/><span style={{ fontSize: 7, color: "#64748b" }}>FEIN EINSTELLEN</span>
        </div>

        {/* Auto result */}
        <div style={{ background: "#0d1333", border: `2px solid ${DIFF_COLORS[autoLevel]}44`, borderRadius: 14, padding: "16px 20px", marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6, fontWeight: 700, letterSpacing: 1 }}>TEST-ERGEBNIS</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: DIFF_COLORS[autoLevel] }}>{DIFF_LABELS[autoLevel]}</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>automatisch erkannt</div>
          </div>
        </div>

        {/* Klasse picker */}
        <div style={{ background: "#0d1333", border: "1px solid #1e293b", borderRadius: 14, padding: "16px 20px", marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 12, fontWeight: 700 }}>ODER: Klasse wählen</div>
          <div style={{ display: "flex", gap: 8 }}>
            {klassen.map(k => (
              <button key={k} onClick={() => pickKlasse(k)} style={{
                flex: 1, padding: "10px 0", borderRadius: 10, fontSize: 14, fontWeight: 700,
                background: klasse === k ? "#fbbf2422" : "#07091a",
                border: `2px solid ${klasse === k ? "#fbbf24" : "#1e293b"}`,
                color: klasse === k ? "#fbbf24" : "#64748b",
                cursor: "pointer", fontFamily: "'Outfit', sans-serif",
              }}>
                {k}
              </button>
            ))}
          </div>
          {klasse && <div style={{ marginTop: 10, fontSize: 12, color: "#64748b" }}>Klasse {klasse} → <strong style={{ color: DIFF_COLORS[selected] }}>{DIFF_LABELS[selected]}</strong></div>}
        </div>

        {/* Manual override */}
        <div style={{ background: "#0d1333", border: "1px solid #1e293b", borderRadius: 14, padding: "16px 20px", marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 12, fontWeight: 700 }}>ODER: Manuell überschreiben</div>
          <div style={{ display: "flex", gap: 10 }}>
            {["leicht", "mittel", "hart"].map(d => (
              <button key={d} onClick={() => { setSelected(d); setKlasse(null); }} style={{
                flex: 1, padding: "12px 0", borderRadius: 12, fontSize: 13, fontWeight: 700,
                background: selected === d ? `${DIFF_COLORS[d]}22` : "#07091a",
                border: `2px solid ${selected === d ? DIFF_COLORS[d] : "#1e293b"}`,
                color: selected === d ? DIFF_COLORS[d] : "#64748b",
                cursor: "pointer", fontFamily: "'Outfit', sans-serif",
              }}>
                {DIFF_LABELS[d]}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: "#475569", lineHeight: 1.6 }}>
            {selected === "leicht" && "⭐ Häufige, kurze Wörter aus dem Grundwortschatz."}
            {selected === "mittel" && "⭐⭐ Schulwortschatz Klasse 6–7, mittlere Wortlänge."}
            {selected === "hart"   && "⭐⭐⭐ Gymnasium-Niveau, lange und komplexe Wörter."}
          </div>
        </div>

        {/* Confirm */}
        <button onClick={() => onConfirm(selected)} style={{
          width: "100%", background: "#fbbf24", color: "#07091a", border: "none",
          borderRadius: 14, padding: "16px", fontSize: 16, fontWeight: 900,
          cursor: "pointer", fontFamily: "'Outfit', sans-serif",
          boxShadow: "0 4px 24px #fbbf2444",
        }}>
          {DIFF_LABELS[selected]} – Los geht's! →
        </button>
      </div>
    </div>
  );
}

/* ─── WORLD MAP ──────────────────────────────────────────────────────────── */
function WorldMap({ onBattle, onStartSession, defeatedIds, xp, streak, difficulty, onChangeDifficulty, onReset, wordStats = {} }) {
  const today = new Date().toISOString().split('T')[0];

  // Berechne fällige Wörter pro Monster
  function getDueCount(monsterId) {
    const words = getWordsForMonster(monsterId, difficulty);
    return words.filter(w => {
      const s = wordStats[w[0]];
      return !s || s.dueDate <= today;
    }).length;
  }

  const totalDue = MONSTERS.reduce((sum, m) => sum + getDueCount(m.id), 0);

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(180deg, #030712 0%, #0a0a1a 100%)", padding: "24px 16px", fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 14, color: "#fbbf24", marginBottom: 8, lineHeight: 1.8 }}>
            WORT<br/>SCHMIEDE
          </div>
          <div style={{ color: "#475569", fontSize: 13 }}>Besiege deine inneren Angstmonster</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
            <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 20, padding: "6px 16px", fontSize: 13, fontWeight: 700, color: "#fbbf24" }}>
              ⚡ {xp} XP
            </div>
            {streak > 0 && (
              <div style={{ background: "#120800", border: "1px solid #f59e0b44", borderRadius: 20, padding: "6px 16px", fontSize: 13, fontWeight: 700, color: "#f59e0b" }}>
                🔥 {streak} Tag{streak !== 1 ? "e" : ""}
              </div>
            )}
            <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 20, padding: "6px 16px", fontSize: 13, fontWeight: 700, color: "#94a3b8" }}>
              {defeatedIds.length}/{MONSTERS.length} besiegt
            </div>
            <button onClick={onChangeDifficulty} style={{
              background: `${DIFF_COLORS[difficulty]}18`,
              border: `1px solid ${DIFF_COLORS[difficulty]}55`,
              borderRadius: 20, padding: "6px 14px",
              fontSize: 12, fontWeight: 700, color: DIFF_COLORS[difficulty],
              cursor: "pointer", fontFamily: "'Outfit', sans-serif",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              {DIFF_LABELS[difficulty]} <span style={{ fontSize: 10, opacity: 0.7 }}>✎</span>
            </button>
          </div>
        </div>

        {/* SESSION START BUTTON */}
        <div style={{ marginBottom: 28 }}>
          <button
            onClick={onStartSession}
            style={{
              width: "100%", background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
              border: "none", borderRadius: 16, padding: "18px 24px",
              cursor: "pointer", fontFamily: "'Outfit', sans-serif",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              boxShadow: "0 4px 24px #7c3aed44",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px #7c3aed66"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 24px #7c3aed44"; }}
          >
            <div style={{ textAlign: "left" }}>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: "#07091a", marginBottom: 4 }}>
                ▶ HEUTIGE SESSION
              </div>
              <div style={{ fontSize: 13, color: "#1e0f40", fontWeight: 600 }}>
                {SESSION_ROUNDS} Runden · ~10 Minuten
                {totalDue > 0 && <span style={{ marginLeft: 10, background: "#07091a33", borderRadius: 10, padding: "1px 8px" }}>🔁 {totalDue} fällig</span>}
              </div>
            </div>
            <div style={{ fontSize: 32 }}>🗡️</div>
          </button>
        </div>

        {/* Lore */}
        <div style={{ background: "#0d1333", border: "1px solid #1e293b", borderRadius: 14, padding: "14px 18px", marginBottom: 24, color: "#64748b", fontSize: 12, lineHeight: 1.7 }}>
          🗺️ <strong style={{ color: "#94a3b8" }}>Die Angstmonster</strong> leben in deinem Kopf – überall dort, wo du unsicher bist beim Schreiben. Aber du kannst sie besiegen! Jede richtige Antwort ist ein Treffer. Jedes besiegte Monster macht dich stärker.
        </div>

        {/* Monster list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {MONSTERS.map((m, i) => {
            const defeated = defeatedIds.includes(m.id);
            const dueCount = getDueCount(m.id);
            return (
              <div
                key={m.id}
                onClick={() => onBattle(m)}
                style={{
                  background: defeated ? "#0a1a0a" : "#0d1333",
                  border: `2px solid ${defeated ? "#22c55e44" : m.color + "55"}`,
                  borderRadius: 16, padding: "16px 18px",
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  display: "flex", alignItems: "center", gap: 14,
                  position: "relative", overflow: "hidden",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateX(4px)"; e.currentTarget.style.boxShadow = `0 4px 24px ${m.color}22`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: "100%", background: `linear-gradient(90deg, transparent, ${m.color}08)`, pointerEvents: "none" }}/>
                <div style={{ fontSize: 34, minWidth: 40, textAlign: "center" }}>{m.zoneEmoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: m.color }}>{m.name}</span>
                    <span style={{ background: "#1e293b", borderRadius: 4, padding: "2px 7px", fontSize: 10, color: "#64748b", fontWeight: 700 }}>Lv.{m.level}</span>
                    {defeated && <span style={{ fontSize: 15 }}>✅</span>}
                    {dueCount > 0 && (
                      <span style={{
                        background: "#7c3aed", color: "#fff",
                        borderRadius: 10, padding: "1px 8px",
                        fontSize: 10, fontWeight: 700,
                        animation: "pulse 1.5s ease-in-out infinite",
                      }}>
                        🔁 {dueCount} fällig
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>{m.title} · {m.zone}</div>
                  <div style={{ fontSize: 11, color: "#475569", marginTop: 2, lineHeight: 1.4 }}>{m.lore}</div>
                </div>
                <div style={{ fontSize: 12, color: m.color, fontWeight: 700, whiteSpace: "nowrap" }}>
                  {defeated ? "Revanche →" : "Kämpfen →"}
                </div>
              </div>
            );
          })}
        </div>

        {/* Fortschritt zuruecksetzen */}
        {onReset && (
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <button onClick={() => { if (window.confirm("Fortschritt wirklich zurücksetzen?")) onReset(); }} style={{
              background: "transparent", border: "1px solid #1e293b", borderRadius: 10,
              padding: "8px 20px", fontSize: 12, color: "#475569", cursor: "pointer",
              fontFamily: "'Outfit', sans-serif",
            }}>
              Fortschritt zurücksetzen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── PARTICLE BURST ─────────────────────────────────────────────────────── */
function spawnParticles(container, color, count = 9) {
  if (!container) return;
  const rect = container.getBoundingClientRect();
  const parentRect = container.parentElement?.getBoundingClientRect() ?? rect;
  const cx = rect.left - parentRect.left + rect.width / 2;
  const cy = rect.top  - parentRect.top  + rect.height * 0.4;

  for (let i = 0; i < count; i++) {
    const angle  = (i / count) * Math.PI * 2 + Math.random() * 0.4;
    const dist   = 38 + Math.random() * 40;
    const size   = 5 + Math.random() * 7;
    const colors = [color, "#fff", "#fbbf24", color, "#fff"];
    const pc     = colors[i % colors.length];

    const p = document.createElement("div");
    p.style.cssText = `
      position:absolute; width:${size}px; height:${size}px;
      border-radius:50%; background:${pc};
      left:${cx}px; top:${cy}px;
      pointer-events:none; z-index:60;
      box-shadow: 0 0 6px ${pc};
    `;
    container.parentElement.appendChild(p);

    p.animate([
      { transform: "translate(-50%,-50%) scale(1)",   opacity: 1 },
      { transform: `translate(calc(-50% + ${Math.cos(angle)*dist}px), calc(-50% + ${Math.sin(angle)*dist}px)) scale(0.3)`, opacity: 0 },
    ], { duration: 520 + Math.random() * 180, easing: "cubic-bezier(.2,.8,.4,1)", fill: "forwards" });

    setTimeout(() => p.remove(), 750);
  }
}

/* ─── BATTLE SCREEN (Timer-basiert, kein Game-Over) ──────────────────────── */
const ROUND_DURATION = 60; // 1 Minute pro Runde

// Anzahl richtig geschriebener Wörter, die zum Sieg (nächstes Level) nötig sind
const LEVEL_THRESHOLD = { leicht: 6, mittel: 8, hart: 10 };

// Session-Konzept: 8 Runden à 1 Minute = ~10 Minuten täglich
const SESSION_ROUNDS = 8;
const PAUSE_DURATION = 12; // Sekunden Pause zwischen Runden

function BattleScreen({ monster, onMonsterDefeated, onBack, difficulty, wordStats, onUpdateWordStats, timeLeft, onCorrectAnswer, onWrongAnswer, threshold }) {
  const [monsterHp, setMonsterHp] = useState(threshold);
  const [chalIdx, setChalIdx] = useState(0);
  const [chalKey, setChalKey] = useState(0);
  const [phase, setPhase] = useState("intro"); // intro | battle
  const [log, setLog] = useState([{ text: `${monster.name} erscheint!`, color: monster.color }]);
  const [shake, setShake] = useState(false);
  const [playerShake, setPlayerShake] = useState(false);
  const [monsterAnim, setMonsterAnim] = useState("float");
  const [playerAnim, setPlayerAnim] = useState("idle");
  const [floatDmg, setFloatDmg] = useState(null);
  const [intro, setIntro] = useState(true);
  const [isDying, setIsDying] = useState(false);
  const monsterRef = useRef(null);

  const [challenges] = useState(() => getChallenges(monster, difficulty, wordStats));
  const shuffledRef = useRef([]);
  const posRef = useRef(-1);
  const wrongQueueRef = useRef([]);
  const wrongCountRef = useRef({});
  const currentWord = challenges[chalIdx]?.word ?? null;

  function shuffleAndStart() {
    const a = Array.from({ length: challenges.length }, (_, i) => i);
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    shuffledRef.current = a; posRef.current = 0; setChalIdx(a[0]);
  }

  function nextChallenge() {
    setChalKey(k => k + 1);
    if (wrongQueueRef.current.length > 0) { setChalIdx(wrongQueueRef.current.shift()); return; }
    posRef.current++;
    if (posRef.current >= shuffledRef.current.length) shuffleAndStart();
    else setChalIdx(shuffledRef.current[posRef.current]);
  }

  useEffect(() => {
    shuffleAndStart();
    addLog({ text: `"${monster.battleCry}"`, color: "#ef4444" });
    tts.monster(monster.battleCry);
    setTimeout(() => { setIntro(false); setPhase("battle"); addLog({ text: "Was tust du?", color: "#94a3b8" }); }, 2000);
  }, []);

  function addLog(msg) { setLog(p => [...p.slice(-10), msg]); }
  function triggerShake(who) {
    if (who === "monster") { setShake(true); setTimeout(() => setShake(false), 500); }
    else { setPlayerShake(true); setTimeout(() => setPlayerShake(false), 500); }
  }

  function handleCorrect() {
    if (currentWord && onUpdateWordStats) onUpdateWordStats(currentWord, true);
    if (onCorrectAnswer) onCorrectAnswer(currentWord);

    // Cosmetic damage display (nur visuell, kein Einfluss auf Wertung)
    const dmg = Math.floor(18 + Math.random() * 12);
    const crit = Math.random() < 0.2;
    const finalDmg = crit ? dmg * 2 : dmg;

    setPlayerAnim("attack");
    setTimeout(() => {
      sfx.crit(); setMonsterAnim("hurt"); triggerShake("monster");
      setFloatDmg({ value: finalDmg, isPlayer: false });
      spawnParticles(monsterRef.current, monster.color, crit ? 14 : 9);
    }, 250);
    setTimeout(() => { setMonsterAnim("float"); setPlayerAnim("idle"); setFloatDmg(null); }, 1200);

    // Jede richtige Antwort = 1 Schritt zum Ziel (threshold)
    const newHp = Math.max(0, monsterHp - 1);
    setMonsterHp(newHp);

    const correctSoFar = threshold - newHp;
    if (crit) addLog({ text: `💥 KRITISCHER TREFFER! +1 richtig (${correctSoFar}/${threshold})`, color: "#fbbf24" });
    else addLog({ text: `⚔️ Richtig! ${correctSoFar} von ${threshold} Wörtern!`, color: "#4ade80" });

    if (newHp <= 0) {
      setIsDying(true);
      sfx.win();
      addLog({ text: `🏆 ${monster.defeatMsg}`, color: "#4ade80" });
      setTimeout(() => { if (onMonsterDefeated) onMonsterDefeated(monster.id); }, 1500);
      return;
    }
    if (Math.random() < 0.3) addLog({ text: monster.weakMsg, color: "#fbbf24" });
    setTimeout(nextChallenge, 600);
  }

  function handleWrong() {
    if (currentWord && onUpdateWordStats) onUpdateWordStats(currentWord, false);
    if (onWrongAnswer) onWrongAnswer(currentWord);
    if (currentWord) {
      const count = wrongCountRef.current[currentWord] ?? 0;
      if (count < 2) {
        wrongQueueRef.current.push(chalIdx);
        wrongCountRef.current[currentWord] = count + 1;
        addLog({ text: `🔁 "${currentWord}" kommt nochmal!`, color: "#a78bfa" });
      }
    }
    sfx.hurt(); setPlayerAnim("hurt"); setMonsterAnim("attack"); triggerShake("player");
    setFloatDmg({ value: "✗", isPlayer: true });
    setTimeout(() => { setPlayerAnim("idle"); setMonsterAnim("float"); setFloatDmg(null); }, 1000);
    addLog({ text: `💢 Falsch! ${monster.name} greift an!`, color: "#f87171" });
    setTimeout(nextChallenge, 600);
  }

  // Timer-Anzeige formatieren
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timerColor = timeLeft <= 30 ? "#ef4444" : timeLeft <= 60 ? "#f59e0b" : "#4ade80";
  const bgStyle = { background: `linear-gradient(160deg, ${monster.bgFrom} 0%, ${monster.bgTo} 100%)` };

  return (
    <div style={{ ...bgStyle, minHeight: "100%", display: "flex", flexDirection: "column", fontFamily: "'Outfit', sans-serif" }}>
      {/* Top bar mit Timer */}
      <div style={{ background: "rgba(0,0,0,0.5)", borderBottom: "1px solid #1e293b", padding: "10px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 20 }}>‹</button>
        <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: monster.color, flex: 1 }}>{monster.zone}</span>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700, color: timerColor, minWidth: 60, textAlign: "right" }}>
          {mins}:{secs.toString().padStart(2, "0")}
        </div>
      </div>

      {/* Timer-Balken */}
      <div style={{ height: 4, background: "#1e293b" }}>
        <div style={{ height: "100%", width: `${(timeLeft / ROUND_DURATION) * 100}%`, background: timerColor, transition: "width 1s linear, background 0.5s" }} />
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "16px 16px 24px", maxWidth: 560, margin: "0 auto", width: "100%" }}>
        {/* Fortschrittsbalken: Richtige Wörter */}
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <div style={{ background: "rgba(0,0,0,0.5)", border: "1px solid #1e293b", borderRadius: 12, padding: "10px 14px", flex: 1 }}>
            <HPBar current={threshold - monsterHp} max={threshold} color="#4ade80" label={`✓ Richtige Wörter (Ziel: ${threshold})`} />
          </div>
        </div>

        {/* Arena */}
        <div style={{
          flex: "0 0 180px", position: "relative",
          background: "rgba(0,0,0,0.3)", borderRadius: 16, border: "1px solid #1e293b",
          display: "flex", alignItems: "flex-end", justifyContent: "space-between",
          padding: "12px 20px", overflow: "hidden", marginBottom: 14,
        }}>
          <div style={{ position: "absolute", bottom: 48, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${monster.color}33, transparent)` }}/>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", animation: shake ? "shakeX 0.4s ease-out" : "none" }}>
            <div style={{ fontSize: 9, fontFamily: "'Press Start 2P', monospace", color: monster.color, marginBottom: 8 }}>Lv.{monster.level}</div>
            <div ref={monsterRef} style={{ position: "relative" }}>
              <MonsterSprite monster={monster} isHurt={monsterAnim === "hurt"} isAttacking={monsterAnim === "attack"} isDying={isDying} />
            </div>
          </div>
          {floatDmg && <DamageFloat value={floatDmg.value} isPlayer={floatDmg.isPlayer} />}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", animation: playerShake ? "shakeX 0.4s ease-out" : "none" }}>
            <div style={{ fontSize: 9, fontFamily: "'Press Start 2P', monospace", color: "#fbbf24", marginBottom: 8 }}>DU</div>
            <PlayerSprite isAttacking={playerAnim === "attack"} isHurt={playerAnim === "hurt"} />
          </div>
          {intro && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)", borderRadius: 16 }}>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: monster.color, textAlign: "center", lineHeight: 2, padding: "0 20px", animation: "fadeIn 0.3s ease" }}>
                {monster.name}<br/><span style={{ fontSize: 8, color: "#94a3b8" }}>erscheint!</span>
              </div>
            </div>
          )}
        </div>

        <div style={{ marginBottom: 14 }}><BattleLog messages={log} /></div>

        {phase === "battle" && !intro && (
          <ChallengePanel key={chalKey} challenge={challenges[chalIdx]} onCorrect={handleCorrect} onWrong={handleWrong} monsterColor={monster.color} />
        )}
      </div>
    </div>
  );
}

/* ─── SESSION RESULT SCREEN ──────────────────────────────────────────────── */
function RoundResultScreen({ stats, victory, monster, nextMonster, onContinue, onRetry, onBack, threshold }) {
  const { correct, wrong, wrongWords } = stats;
  const total = correct + wrong;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const needed = threshold ?? 8;
  const missing = Math.max(0, needed - correct);

  // Schwache Wörter dieser Runde
  const weakWords = Object.entries(wrongWords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(160deg, #030712 0%, #0d1333 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ maxWidth: 460, width: "100%", textAlign: "center" }}>
        {/* Sieg oder Niederlage */}
        <div style={{ fontSize: 56, marginBottom: 10, animation: "bounce 0.6s ease-out" }}>
          {victory ? "🏆" : "⏱️"}
        </div>
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: victory ? "#4ade80" : "#f59e0b", marginBottom: 6, lineHeight: 1.8 }}>
          {victory ? "MONSTER BESIEGT!" : "ZEIT UM!"}
        </div>
        <div style={{ color: "#94a3b8", fontSize: 14, marginBottom: 20 }}>
          {victory
            ? `${monster.name} wurde besiegt! Du kannst ins nächste Level!`
            : `${correct} von ${needed} Wörtern richtig — noch ${missing} mehr zum Aufstieg!`
          }
        </div>

        {/* Fortschrittsanzeige: X von Y richtig */}
        <div style={{ background: "#0d1333", border: "1px solid #1e293b", borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: victory ? "#4ade80" : "#f59e0b" }}>
              {victory ? "✓ Ziel erreicht!" : "Fortschritt"}
            </span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 900, color: victory ? "#4ade80" : "#fbbf24" }}>
              {correct} / {needed}
            </span>
          </div>
          <div style={{ height: 14, background: "#1e293b", borderRadius: 8, overflow: "hidden", border: "1px solid #334155" }}>
            <div style={{
              width: `${Math.min(100, (correct / needed) * 100)}%`,
              height: "100%",
              background: victory ? "linear-gradient(90deg, #22c55e, #4ade80)" : "linear-gradient(90deg, #f59e0b, #fbbf24)",
              borderRadius: 8,
              transition: "width 0.8s cubic-bezier(.34,1.56,.64,1)",
              boxShadow: victory ? "0 0 12px #4ade8088" : "0 0 8px #fbbf2466",
            }} />
          </div>
          {!victory && (
            <div style={{ marginTop: 6, fontSize: 11, color: "#64748b" }}>
              Ziel: {needed} richtige Wörter in 1 Minute → nächstes Level
            </div>
          )}
        </div>

        {/* Statistik */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
          {[
            { label: "Richtig", value: correct, color: "#4ade80" },
            { label: "Falsch", value: wrong, color: "#f87171" },
            { label: "Genauigkeit", value: `${pct}%`, color: "#fbbf24" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: "#0d1333", border: "1px solid #1e293b", borderRadius: 12, padding: "12px 8px" }}>
              <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color, fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Schwache Wörter */}
        {weakWords.length > 0 && (
          <div style={{ background: "#0d1333", border: "1px solid #ef444444", borderRadius: 12, padding: "12px 14px", marginBottom: 20, textAlign: "left" }}>
            <div style={{ fontSize: 10, color: "#f87171", fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>NOCHMAL ÜBEN</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {weakWords.map(([word, count]) => (
                <span key={word} style={{ background: "#1e0a0a", border: "1px solid #ef444444", borderRadius: 8, padding: "3px 8px", fontSize: 12, color: "#fca5a5", fontFamily: "'JetBrains Mono', monospace" }}>
                  {word} <span style={{ color: "#ef4444", fontSize: 10 }}>×{count}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Naechstes Level Vorschau (bei Sieg) */}
        {victory && nextMonster && (
          <div style={{ background: "#0d1333", border: `1px solid ${nextMonster.color}44`, borderRadius: 12, padding: "12px 14px", marginBottom: 20 }}>
            <div style={{ fontSize: 10, color: nextMonster.color, fontWeight: 700, marginBottom: 4, letterSpacing: 1 }}>NÄCHSTER GEGNER</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0" }}>{nextMonster.zoneEmoji} {nextMonster.name}</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>Lv.{nextMonster.level} — {nextMonster.title}</div>
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          {victory && nextMonster ? (
            <button onClick={onContinue} style={{ background: "#4ade80", color: "#07091a", border: "none", borderRadius: 12, padding: "14px 32px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
              Weiter! ⚔️
            </button>
          ) : (
            <button onClick={onRetry} style={{ background: "#fbbf24", color: "#07091a", border: "none", borderRadius: 12, padding: "14px 32px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
              Nochmal! 🔁
            </button>
          )}
          <button onClick={onBack} style={{ background: "transparent", border: "1px solid #334155", color: "#94a3b8", borderRadius: 12, padding: "14px 24px", fontSize: 14, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
            Zur Karte
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── CSS ─────────────────────────────────────────────────────────────────── */
const css = `
  .wortschmiede-root, .wortschmiede-root * { box-sizing: border-box; margin: 0; padding: 0; }
  .wortschmiede-root { background: #030712; }

  /* ── Sprite wrappers: anchor at bottom ── */
  .sprite-wrap {
    display: inline-block;
    transform-origin: bottom center;
  }

  /* ── IDLE: Squash-and-Stretch breathing ── */
  @keyframes monsterIdle {
    0%,100% { transform: translateY(0)    scaleX(1)    scaleY(1); }
    25%     { transform: translateY(-5px)  scaleX(1.04) scaleY(0.96); }
    50%     { transform: translateY(-9px)  scaleX(0.96) scaleY(1.04); }
    75%     { transform: translateY(-4px)  scaleX(1.02) scaleY(0.98); }
  }

  /* ── ATTACK: Anticipation → Lunge RIGHT toward player → Recoil ── */
  @keyframes monsterAttack {
    0%   { transform: translateX(0)    scaleX(1)    scaleY(1); }
    15%  { transform: translateX(-14px) scaleX(0.88) scaleY(1.12); }  /* zurueckziehen */
    40%  { transform: translateX(38px)  scaleX(1.18) scaleY(0.85); }  /* Stoss nach rechts */
    65%  { transform: translateX(20px)  scaleX(0.95) scaleY(1.05); }  /* Rueckstoss */
    100% { transform: translateX(0)    scaleX(1)    scaleY(1); }
  }

  /* ── HURT: White flash + pop + shake ── */
  @keyframes monsterHurt {
    0%   { transform: translateX(0)   scaleX(1)    scaleY(1);    filter: brightness(1); }
    10%  { transform: translateX(-6px) scaleX(1.15) scaleY(0.85); filter: brightness(8) saturate(0); }
    25%  { transform: translateX(10px) scaleX(0.9)  scaleY(1.1);  filter: brightness(4) saturate(0); }
    45%  { transform: translateX(-8px) scaleX(1.08) scaleY(0.93); filter: brightness(2); }
    65%  { transform: translateX(5px)  scaleX(0.97) scaleY(1.03); filter: brightness(1.2); }
    80%  { transform: translateX(-3px) scaleX(1);    scaleY(1);    filter: brightness(1); }
    100% { transform: translateX(0)   scaleX(1)    scaleY(1);    filter: brightness(1); }
  }

  /* ── PLAYER IDLE: gentle bob ── */
  @keyframes playerIdle {
    0%,100% { transform: translateY(0) scaleX(1) scaleY(1); }
    40%     { transform: translateY(-4px) scaleX(1.02) scaleY(0.98); }
    70%     { transform: translateY(-6px) scaleX(0.98) scaleY(1.02); }
  }

  /* ── PLAYER ATTACK: Sprint zum Monster, Schlag, zurueck (Ring Fit Style) ── */
  @keyframes playerAttack {
    0%   { transform: translateX(0)     scaleX(1)    scaleY(1); }
    8%   { transform: translateX(12px)  scaleX(0.85) scaleY(1.15); }  /* holt aus (zurueck) */
    12%  { transform: translateX(8px)   scaleX(0.85) scaleY(1.15); }  /* duckt sich */
    30%  { transform: translateX(-120px) scaleX(1.15) scaleY(0.9); }  /* SPRINT zum Monster */
    38%  { transform: translateX(-135px) scaleX(1.3)  scaleY(0.8); }  /* SCHLAG! Ueberschwung */
    48%  { transform: translateX(-120px) scaleX(0.95) scaleY(1.1); }  /* Treffer-Halt */
    62%  { transform: translateX(-60px)  scaleX(1)    scaleY(1); }    /* springt zurueck */
    80%  { transform: translateX(-10px)  scaleX(1.05) scaleY(0.95); } /* Landung */
    92%  { transform: translateX(5px)   scaleX(0.98) scaleY(1.02); }  /* Nachwippen */
    100% { transform: translateX(0)     scaleX(1)    scaleY(1); }
  }

  /* ── PLAYER HURT: red flash + stagger ── */
  @keyframes playerHurt {
    0%   { transform: translateX(0);    filter: brightness(1); }
    10%  { transform: translateX(12px); filter: brightness(6) hue-rotate(310deg) saturate(3); }
    30%  { transform: translateX(-10px); filter: brightness(3) hue-rotate(310deg); }
    50%  { transform: translateX(7px);   filter: brightness(2); }
    70%  { transform: translateX(-5px);  filter: brightness(1.3); }
    100% { transform: translateX(0);    filter: brightness(1); }
  }

  /* ── SCREEN SHAKE ── */
  @keyframes shakeX {
    0%,100% { transform: translateX(0); }
    15%     { transform: translateX(-12px); }
    30%     { transform: translateX(12px); }
    45%     { transform: translateX(-8px); }
    60%     { transform: translateX(8px); }
    75%     { transform: translateX(-4px); }
    90%     { transform: translateX(4px); }
  }

  /* ── DAMAGE NUMBER: bounce arc ── */
  @keyframes floatUpBounce {
    0%   { opacity: 0;   transform: translateY(0)    scale(0.5); }
    15%  { opacity: 1;   transform: translateY(-14px) scale(1.35); }
    45%  { opacity: 1;   transform: translateY(-32px) scale(1.1); }
    75%  { opacity: 0.8; transform: translateY(-52px) scale(0.9); }
    100% { opacity: 0;   transform: translateY(-70px) scale(0.7); }
  }

  /* ── CORRECT ANSWER: sparkle pulse on input ── */
  @keyframes correctGlow {
    0%,100% { box-shadow: 0 0 0 0 #22c55e00; }
    25%     { box-shadow: 0 0 28px 6px #22c55e99, 0 0 60px 12px #22c55e33; }
    60%     { box-shadow: 0 0 18px 4px #22c55e66; }
  }

  @keyframes sparkleFloat {
    0%   { opacity: 1; transform: scale(0) translateY(0); }
    40%  { opacity: 1; transform: scale(1.4) translateY(-12px); }
    100% { opacity: 0; transform: scale(0.8) translateY(-28px); }
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes bounce {
    0%   { transform: scale(0.5) translateY(20px); opacity: 0; }
    60%  { transform: scale(1.2) translateY(-8px);  opacity: 1; }
    100% { transform: scale(1)   translateY(0); }
  }
  @keyframes pulse {
    0%,100% { box-shadow: 0 0 0 0 currentColor; }
    50%     { box-shadow: 0 0 0 8px transparent; }
  }
  @keyframes monsterDeath {
    0%   { opacity: 1; transform: scaleX(1)    scaleY(1)    translateY(0); filter: brightness(1); }
    20%  { opacity: 1; transform: scaleX(1.3)  scaleY(0.7)  translateY(8px); filter: brightness(6) saturate(0); }
    50%  { opacity: 0.6; transform: scaleX(0.7) scaleY(1.3) translateY(-10px); filter: brightness(3) hue-rotate(60deg); }
    80%  { opacity: 0.2; transform: scaleX(1.1)  scaleY(0.4)  translateY(20px); filter: brightness(1); }
    100% { opacity: 0;   transform: scaleX(1)    scaleY(0.1)  translateY(30px); }
  }
  
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #0d1333; }
  ::-webkit-scrollbar-thumb { background: #1e2a5a; border-radius: 2px; }

  /* ── Sprite Sheet Frame-Animationen (generiert) ── */
  ${generateSpriteKeyframes()}
`;

/* ─── SAVE / LOAD ────────────────────────────────────────────────────────── */
const SAVE_KEY = "wortschmiede-save";

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function writeSave(data) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); } catch {}
}

/* ─── SUPABASE SYNC HELPERS ────────────────────────────────────────────── */

async function supabaseLoadProgress(sb, userId) {
  const { data, error } = await sb
    .from('wortschmiede_progress')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) { console.error('[Wortschmiede] load progress error:', error); return null; }
  return data;
}

async function supabaseLoadWordStats(sb, userId) {
  const { data, error } = await sb
    .from('wortschmiede_word_stats')
    .select('*')
    .eq('user_id', userId);
  if (error) { console.error('[Wortschmiede] load word_stats error:', error); return null; }
  if (!data) return null;
  // Array → Object { word: { interval, repetition, efactor, dueDate, totalCorrect, totalWrong } }
  const stats = {};
  for (const row of data) {
    stats[row.word] = {
      interval: row.interval,
      repetition: row.repetition,
      efactor: row.efactor,
      dueDate: row.due_date,
      totalCorrect: row.total_correct,
      totalWrong: row.total_wrong,
    };
  }
  return stats;
}

async function supabaseUpsertProgress(sb, userId, { defeatedIds, xp, difficulty, autoLevel }) {
  const { error } = await sb
    .from('wortschmiede_progress')
    .upsert({
      user_id: userId,
      defeated_ids: defeatedIds,
      xp,
      difficulty,
      auto_level: autoLevel,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
  if (error) console.error('[Wortschmiede] upsert progress error:', error);
}

async function supabaseUpsertWordStat(sb, userId, word, stat) {
  const { error } = await sb
    .from('wortschmiede_word_stats')
    .upsert({
      user_id: userId,
      word,
      interval: stat.interval,
      repetition: stat.repetition,
      efactor: stat.efactor,
      due_date: stat.dueDate,
      total_correct: stat.totalCorrect,
      total_wrong: stat.totalWrong,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,word' });
  if (error) console.error('[Wortschmiede] upsert word_stat error:', error);
}

/* ─── ROOT APP ────────────────────────────────────────────────────────────── */
export default function WortschmiedeBattle({ onClose, onXPEarned, userId, supabaseUrl, supabaseAnonKey }) {
  // Einmalig gespeicherten Stand laden
  const [saved] = useState(loadSave);

  // flow: "diagnose" | "difficulty" | "map" | "round" | "roundResult" | "session_pause" | "session_end"
  // Diagnose ueberspringen wenn autoLevel schon gespeichert ist
  const [screen, setScreen]             = useState(saved?.autoLevel ? "map" : "diagnose");
  const [currentMonster, setCurrentMonster] = useState(null);
  const [defeatedIds, setDefeatedIds]   = useState(saved?.defeatedIds || []);
  const [xp, setXp]                     = useState(saved?.xp || 0);
  const [difficulty, setDifficulty]     = useState(saved?.difficulty || "mittel");
  const [autoLevel, setAutoLevel]       = useState(saved?.autoLevel || "mittel");

  // SM-2 Wortstatistiken: { [wort]: { interval, repetition, efactor, dueDate, totalCorrect, totalWrong } }
  const [wordStats, setWordStats]       = useState(saved?.wordStats || {});

  // Session-State
  const [sessionRound, setSessionRound]           = useState(0);
  const [sessionTotalStats, setSessionTotalStats] = useState({ correct: 0, wrong: 0, rounds: [] });
  const [sessionXp, setSessionXp]                 = useState(0);
  const [streak, setStreak]                       = useState(saved?.streak || 0);
  const [lastPlayedDate, setLastPlayedDate]       = useState(saved?.lastPlayedDate || null);
  const sessionQueueRef   = useRef([]);
  const sessionRoundRef   = useRef(0);
  const sessionStatsRef   = useRef({ correct: 0, wrong: 0, rounds: [] });
  const sessionXpRef      = useRef(0);
  const inSessionRef      = useRef(false);
  const streakRef         = useRef(saved?.streak || 0);
  const lastPlayedRef     = useRef(saved?.lastPlayedDate || null);

  // Runden-State (1-Minute pro Runde)
  const [timeLeft, setTimeLeft]         = useState(ROUND_DURATION);
  const [roundStats, setRoundStats]     = useState(null);
  const [roundVictory, setRoundVictory] = useState(false);
  const [nextMonster, setNextMonster]   = useState(null); // Vorschau naechstes Monster
  const [monsterKey, setMonsterKey]     = useState(0);
  const roundStatsRef = useRef(null);
  const timerRef = useRef(null);

  // XP-Tracking fuer onXPEarned Callback
  const prevXpRef = useRef(xp);

  // Supabase Client (Chat-Widget-Pattern: useRef + einmalige Initialisierung)
  const sbRef = useRef(null);
  const supabaseReady = !!(userId && supabaseUrl && supabaseAnonKey);

  useEffect(() => {
    if (!supabaseReady) return;
    if (!sbRef.current) {
      sbRef.current = createClient(supabaseUrl, supabaseAnonKey);
    }
    // Supabase-Daten laden und localStorage ueberschreiben (Source of Truth)
    (async () => {
      const sb = sbRef.current;
      const [progress, stats] = await Promise.all([
        supabaseLoadProgress(sb, userId),
        supabaseLoadWordStats(sb, userId),
      ]);
      if (progress) {
        setDefeatedIds(progress.defeated_ids || []);
        setXp(progress.xp ?? 0);
        setDifficulty(progress.difficulty || "mittel");
        setAutoLevel(progress.auto_level || "mittel");
        if (progress.auto_level) setScreen(s => s === "diagnose" ? "map" : s);
      }
      if (stats && Object.keys(stats).length > 0) {
        setWordStats(stats);
      }
    })();
  }, [supabaseReady]); // eslint-disable-line react-hooks/exhaustive-deps

  // Bei jeder Aenderung speichern (inkl. wordStats) — localStorage + Supabase
  useEffect(() => {
    writeSave({ defeatedIds, xp, difficulty, autoLevel, wordStats, streak, lastPlayedDate });
    // Fire-and-forget Supabase upsert
    if (sbRef.current && userId) {
      supabaseUpsertProgress(sbRef.current, userId, { defeatedIds, xp, difficulty, autoLevel });
    }
  }, [defeatedIds, xp, difficulty, autoLevel, wordStats, streak, lastPlayedDate]); // eslint-disable-line react-hooks/exhaustive-deps

  // XP-Aenderungen an Parent melden
  useEffect(() => {
    const diff = xp - prevXpRef.current;
    if (diff > 0 && onXPEarned) {
      onXPEarned(diff);
    }
    prevXpRef.current = xp;
  }, [xp, onXPEarned]);

  // Runden-Timer: laeuft nur wenn screen === "round"
  useEffect(() => {
    if (screen !== "round") {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          // Zeit abgelaufen → Runde beenden (Niederlage)
          const stats = roundStatsRef.current;
          if (stats) {
            if (inSessionRef.current) {
              // Session-Modus: sammeln und weiter
              handleSessionRoundEndRef.current(stats, false);
            } else {
              // Einzel-Modus: alter roundResult-Screen
              setRoundStats({ ...stats });
              setRoundVictory(false);
              setNextMonster(null);
              setScreen("roundResult");
            }
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
  }, [screen]);

  function addXP(amt) { setXp(p => p + amt); }

  // SM-2 Update für ein einzelnes Wort
  function handleUpdateWordStats(word, correct) {
    setWordStats(prev => {
      const updated = sm2Update(prev[word], correct);
      // Fire-and-forget Supabase upsert fuer dieses Wort
      if (sbRef.current && userId) {
        supabaseUpsertWordStat(sbRef.current, userId, word, updated);
      }
      return { ...prev, [word]: updated };
    });
  }

  function handleDiagnoseComplete(level) {
    setAutoLevel(level);
    setDifficulty(level);
    setScreen("difficulty");
  }

  function handleDifficultyConfirm(level) {
    setDifficulty(level);
    setScreen("map");
  }

  // Naechstes Monster nach Level-Reihenfolge bestimmen
  function getNextMonsterByLevel(currentId) {
    const idx = MONSTERS.findIndex(m => m.id === currentId);
    if (idx < 0 || idx >= MONSTERS.length - 1) return null; // letztes Level → kein naechstes
    return MONSTERS[idx + 1];
  }

  // Runde starten: 1-Minute-Timer, Monster setzen
  function startRound(monster) {
    sfx.select();
    const stats = { correct: 0, wrong: 0, wrongWords: {} };
    roundStatsRef.current = stats;
    setRoundStats(stats);
    setRoundVictory(false);
    setNextMonster(null);
    setTimeLeft(ROUND_DURATION);
    setCurrentMonster(monster);
    setMonsterKey(k => k + 1);
    setScreen("round");
  }

  // Monster besiegt → Runde gewonnen
  function handleMonsterDefeated(monsterId) {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }

    // XP vergeben: 15 + 5 pro Level
    const monster = MONSTERS.find(m => m.id === monsterId);
    const xpGain = monster ? 15 + monster.level * 5 : 20;
    addXP(xpGain);
    if (inSessionRef.current) sessionXpRef.current += xpGain;

    // Monster als besiegt markieren (fuer WorldMap)
    setDefeatedIds(p => p.includes(monsterId) ? p : [...p, monsterId]);

    const stats = roundStatsRef.current;
    if (!stats) return;

    if (inSessionRef.current) {
      handleSessionRoundEndRef.current(stats, true);
    } else {
      // Einzel-Modus: alter Flow
      const next = getNextMonsterByLevel(monsterId);
      setRoundStats({ ...stats });
      setRoundVictory(true);
      setNextMonster(next);
      setScreen("roundResult");
    }
  }

  // Tracking-Callbacks fuer Runden-Stats
  function handleRoundCorrect(word) {
    if (roundStatsRef.current) roundStatsRef.current.correct++;
  }

  function handleRoundWrong(word) {
    if (roundStatsRef.current) {
      roundStatsRef.current.wrong++;
      if (word) {
        roundStatsRef.current.wrongWords[word] = (roundStatsRef.current.wrongWords[word] || 0) + 1;
      }
    }
  }

  // Runde abbrechen → zurueck zur Karte
  function handleRoundBack() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    inSessionRef.current = false;
    setScreen("map");
    setCurrentMonster(null);
  }

  // ── SESSION LOGIK ────────────────────────────────────────────────────────

  // Session starten: Queue bauen, Runde 1 starten
  function startSession() {
    sfx.select();
    const queue = buildSessionQueue(difficulty, wordStats);
    sessionQueueRef.current = queue;
    sessionRoundRef.current = 1;
    sessionStatsRef.current = { correct: 0, wrong: 0, rounds: [] };
    sessionXpRef.current = 0;
    inSessionRef.current = true;
    setSessionRound(1);
    setSessionTotalStats({ correct: 0, wrong: 0, rounds: [] });
    setSessionXp(0);
    startRound(queue[0]);
  }

  // Nach jeder Runde (Sieg oder Niederlage): akkumulieren, weiter oder Ende
  function handleSessionRoundEnd(roundStats, victory) {
    const currentRound = sessionRoundRef.current;
    const currentMonsterSnap = sessionQueueRef.current[currentRound - 1];

    // Akkumulieren
    const newStats = {
      correct: sessionStatsRef.current.correct + (roundStats?.correct ?? 0),
      wrong:   sessionStatsRef.current.wrong   + (roundStats?.wrong   ?? 0),
      rounds:  [...sessionStatsRef.current.rounds, {
        monster: currentMonsterSnap,
        correct: roundStats?.correct ?? 0,
        wrong:   roundStats?.wrong   ?? 0,
        victory,
      }],
    };
    sessionStatsRef.current = newStats;
    setSessionTotalStats({ ...newStats });

    // Runden-Stats auch fuer Pause-Screen
    setRoundStats(roundStats ? { ...roundStats } : { correct: 0, wrong: 0, wrongWords: {} });
    setRoundVictory(victory);

    if (currentRound >= SESSION_ROUNDS) {
      // Session beendet
      finishSession(newStats);
    } else {
      setScreen("session_pause");
    }
  }

  // Ref-Wrapper damit der Timer-Callback nie stale ist
  const handleSessionRoundEndRef = useRef(handleSessionRoundEnd);
  handleSessionRoundEndRef.current = handleSessionRoundEnd;

  // Nächste Runde nach Pause starten
  function handleNextSessionRound() {
    if (!inSessionRef.current) return; // Session schon beendet
    const nextRoundNum = sessionRoundRef.current + 1;
    if (nextRoundNum > SESSION_ROUNDS) return; // Sicherheitscheck
    sessionRoundRef.current = nextRoundNum;
    setSessionRound(nextRoundNum);
    const nextM = sessionQueueRef.current[nextRoundNum - 1];
    if (!nextM) return;
    startRound(nextM);
  }

  // Session abschließen: Streak berechnen, Screen wechseln
  function finishSession(totalStats) {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    const yd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const yesterday = `${yd.getFullYear()}-${String(yd.getMonth()+1).padStart(2,'0')}-${String(yd.getDate()).padStart(2,'0')}`;
    const last = lastPlayedRef.current;
    let newStreak;
    if (last === today)      newStreak = streakRef.current;        // schon heute gespielt
    else if (last === yesterday) newStreak = streakRef.current + 1; // gestern gespielt → weiter
    else                         newStreak = 1;                     // Lücke → neu starten

    streakRef.current = newStreak;
    lastPlayedRef.current = today;
    setStreak(newStreak);
    setLastPlayedDate(today);
    setSessionXp(sessionXpRef.current);
    inSessionRef.current = false;
    setScreen("session_end");
  }

  // Weiter zum naechsten Level (nach Sieg)
  function handleContinue() {
    if (nextMonster) startRound(nextMonster);
  }

  // Gleiches Level nochmal (nach Niederlage)
  function handleRetry() {
    if (currentMonster) startRound(currentMonster);
  }

  function handleResetProgress() {
    localStorage.removeItem(SAVE_KEY);
    setDefeatedIds([]);
    setXp(0);
    setAutoLevel("mittel");
    setDifficulty("mittel");
    setWordStats({});
    setStreak(0);
    setLastPlayedDate(null);
    streakRef.current = 0;
    lastPlayedRef.current = null;
    inSessionRef.current = false;
    setScreen("diagnose");
    // Supabase-Daten loeschen
    if (sbRef.current && userId) {
      sbRef.current.from('wortschmiede_progress').delete().eq('user_id', userId).then();
      sbRef.current.from('wortschmiede_word_stats').delete().eq('user_id', userId).then();
    }
  }

  return (
    <div className="wortschmiede-root" style={{ width: "100%", minHeight: "100%", background: "#030712" }}>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <FontLink />
      {/* Zurueck-Button oben links (nur auf Map + Diagnose + Difficulty) */}
      {onClose && screen !== "round" && screen !== "roundResult" && screen !== "session_pause" && screen !== "session_end" && (
        <button
          onClick={onClose}
          style={{
            position: "sticky", top: 12, left: 12, zIndex: 99999, float: "left",
            background: "rgba(0,0,0,0.7)", border: "1px solid #475569",
            borderRadius: 10, padding: "8px 16px",
            color: "#e2e8f0", fontSize: 14, fontWeight: 700,
            cursor: "pointer", fontFamily: "'Outfit', sans-serif",
            display: "flex", alignItems: "center", gap: 6,
            backdropFilter: "blur(8px)",
          }}
        >
          ✕ Zurück
        </button>
      )}
      {screen === "diagnose" && (
        <DiagnoseBoss onComplete={handleDiagnoseComplete} />
      )}
      {screen === "difficulty" && (
        <DifficultyPanel autoLevel={autoLevel} onConfirm={handleDifficultyConfirm} />
      )}
      {screen === "map" && (
        <WorldMap
          onBattle={m => { inSessionRef.current = false; startRound(m); }}
          onStartSession={startSession}
          defeatedIds={defeatedIds}
          xp={xp}
          streak={streak}
          difficulty={difficulty}
          onChangeDifficulty={() => setScreen("difficulty")}
          onReset={handleResetProgress}
          wordStats={wordStats}
        />
      )}
      {screen === "round" && currentMonster && (
        <BattleScreen
          key={monsterKey}
          monster={currentMonster}
          onMonsterDefeated={handleMonsterDefeated}
          onBack={handleRoundBack}
          difficulty={difficulty}
          wordStats={wordStats}
          onUpdateWordStats={handleUpdateWordStats}
          timeLeft={timeLeft}
          onCorrectAnswer={handleRoundCorrect}
          onWrongAnswer={handleRoundWrong}
          threshold={LEVEL_THRESHOLD[difficulty] ?? 8}
        />
      )}
      {screen === "roundResult" && roundStats && (
        <RoundResultScreen
          stats={roundStats}
          victory={roundVictory}
          monster={currentMonster}
          nextMonster={nextMonster}
          onContinue={handleContinue}
          onRetry={handleRetry}
          onBack={() => { inSessionRef.current = false; setScreen("map"); setCurrentMonster(null); }}
          threshold={LEVEL_THRESHOLD[difficulty] ?? 8}
        />
      )}
      {screen === "session_pause" && roundStats && currentMonster && (
        <SessionPauseScreen
          roundNum={sessionRound}
          roundCorrect={roundStats.correct}
          roundWrong={roundStats.wrong}
          roundVictory={roundVictory}
          sessionCorrect={sessionTotalStats.correct}
          threshold={LEVEL_THRESHOLD[difficulty] ?? 8}
          monsterName={currentMonster.name}
          monsterEmoji={currentMonster.zoneEmoji}
          onNext={handleNextSessionRound}
        />
      )}
      {screen === "session_end" && (
        <SessionEndScreen
          rounds={sessionTotalStats.rounds}
          totalCorrect={sessionTotalStats.correct}
          totalWrong={sessionTotalStats.wrong}
          streak={streak}
          xpEarned={sessionXp}
          onBack={() => { setScreen("map"); setCurrentMonster(null); }}
        />
      )}
    </div>
  );
}
