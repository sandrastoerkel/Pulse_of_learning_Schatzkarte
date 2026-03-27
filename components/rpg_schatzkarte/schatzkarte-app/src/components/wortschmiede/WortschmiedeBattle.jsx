import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { W, SENTENCES, MONSTERS, MONSTER_CATS, STAR_TO_DIFF, DIFF_LABELS, DIFF_COLORS, KLASSE_TO_DIFF, getWordsForMonster, fisherYates, sm2Update, sortWordsByPriority, generateErrors, CAT_QUESTIONS, generateChallenges, generatePruferQuestions } from './wortschmiede_data.js';
import { STIMMEN_BATTLE_ROUNDS, buildStimmenBattleQueue, buildStimmenBattleQueueForMonster, StimmenBattleScreen, StimmenBattleEndScreen } from './StimmenBattle.jsx';

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
function WorldMap({ onBattle, onStartSession, onStartStimmenBattle, defeatedIds, xp, streak, difficulty, onChangeDifficulty, onReset, wordStats = {}, firstDefeatedDates = {}, monsterStars = {} }) {
  const today = new Date().toISOString().split('T')[0];

  // Berechne fällige Wörter pro Monster
  function getDueCount(monsterId) {
    const words = getWordsForMonster(monsterId, difficulty);
    return words.filter(w => {
      const s = wordStats[w[0]];
      return !s || s.dueDate <= today;
    }).length;
  }

  // Ist Level-Up-Test verfuegbar? (14+ Tage nach erstem Sieg, noch kein Stern)
  function isLevelUpReady(monsterId) {
    if (monsterStars[monsterId]) return false;
    const firstDate = firstDefeatedDates[monsterId];
    if (!firstDate) return false;
    const diffDays = Math.floor((new Date(today) - new Date(firstDate)) / 86400000);
    return diffDays >= 14;
  }

  function daysUntilLevelUp(monsterId) {
    if (monsterStars[monsterId]) return null;
    const firstDate = firstDefeatedDates[monsterId];
    if (!firstDate) return null;
    const diffDays = Math.floor((new Date(today) - new Date(firstDate)) / 86400000);
    const remaining = 14 - diffDays;
    return remaining > 0 ? remaining : 0;
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

        {/* SESSION START BUTTONS */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
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

          <div
            style={{
              width: "100%", background: "linear-gradient(135deg, #1a1a2e, #2a2a3e)",
              border: "1px solid #555", borderRadius: 16, padding: "14px 24px",
              fontFamily: "'Outfit', sans-serif",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              opacity: 0.5,
            }}
          >
            <div style={{ textAlign: "left" }}>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: "#888", marginBottom: 4 }}>
                🎤 STIMMEN-BATTLE
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#999" }}>
                Vorläufig deaktiviert
              </div>
            </div>
            <div style={{ fontSize: 28, filter: "grayscale(1)" }}>🎙️</div>
          </div>
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
            const levelUpReady = isLevelUpReady(m.id);
            const daysLeft = daysUntilLevelUp(m.id);
            const hasStar = !!monsterStars[m.id];
            return (
              <div key={m.id} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              <div
                onClick={() => onBattle(m)}
                style={{
                  background: defeated ? "#0a1a0a" : "#0d1333",
                  border: `2px solid ${levelUpReady ? "#fbbf24" : defeated ? "#22c55e44" : m.color + "55"}`,
                  borderRadius: levelUpReady ? "16px 16px 0 0" : 16,
                  padding: "16px 18px",
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
                    {hasStar && <span style={{ fontSize: 15 }} title="Level-Up bestanden!">⭐</span>}
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
                    {levelUpReady && (
                      <span style={{ background: "#78350f", color: "#fbbf24", borderRadius: 10, padding: "1px 8px", fontSize: 10, fontWeight: 700, animation: "pulse 1.5s ease-in-out infinite" }}>
                        ⭐ Level-Up!
                      </span>
                    )}
                    {!hasStar && !levelUpReady && daysLeft !== null && daysLeft > 0 && (
                      <span style={{ background: "#1e293b", color: "#475569", borderRadius: 10, padding: "1px 8px", fontSize: 10 }}>
                        ⭐ in {daysLeft}d
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
              {/* Level-Up-Button — direkt unter der Karte, nur wenn bereit */}
              {levelUpReady && (
                <div
                  style={{
                    width: "100%", background: "linear-gradient(90deg, #2a2a3e, #333)",
                    border: "1px solid #555", borderTop: "none",
                    borderRadius: "0 0 16px 16px", padding: "10px 18px",
                    fontFamily: "'Outfit', sans-serif",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    opacity: 0.5,
                  }}
                >
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: "#888", marginBottom: 2 }}>⭐ LEVEL-UP TEST</div>
                    <div style={{ fontSize: 11, color: "#999" }}>Vorläufig deaktiviert</div>
                  </div>
                  <div style={{ fontSize: 22, filter: "grayscale(1)" }}>🎤</div>
                </div>
              )}
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
  if (!container || !container.parentElement) return;
  const rect = container.getBoundingClientRect();
  const parentRect = container.parentElement.getBoundingClientRect();
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

async function supabaseUpsertProgress(sb, userId, { defeatedIds, xp, difficulty, autoLevel, streak, lastPlayedDate, firstDefeatedDates, monsterStars }) {
  const { error } = await sb
    .from('wortschmiede_progress')
    .upsert({
      user_id: userId,
      defeated_ids: defeatedIds,
      xp,
      difficulty,
      auto_level: autoLevel,
      streak: streak ?? 0,
      last_played_date: lastPlayedDate || null,
      first_defeated_dates: firstDefeatedDates ?? {},
      monster_stars: monsterStars ?? {},
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
export default function WortschmiedeBattle({ onClose, onXPEarned }) {
  // SOURCE: useAuth hook — ersetzt userId/supabaseUrl/supabaseAnonKey Props
  const { legacyUserId } = useAuth();
  const userId = legacyUserId ?? '';

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

  // Stimmen-Battle-State
  const [sbWords, setSbWords]           = useState([]);
  const [sbResults, setSbResults]       = useState({ results: [], totalPts: 0, compPts: 0 });
  const [sbMonsterId, setSbMonsterId]   = useState(null); // null = freies Battle, sonst Level-Up

  // Level-Up Tracking: { [monsterId]: "YYYY-MM-DD" } — Tag des ersten Siegs
  const [firstDefeatedDates, setFirstDefeatedDates] = useState(saved?.firstDefeatedDates || {});
  // Sterne: { [monsterId]: true } — Level-Up-Test bestanden
  const [monsterStars, setMonsterStars] = useState(saved?.monsterStars || {});

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

  // Supabase-Daten laden (globaler Client statt createClient aus Props)
  useEffect(() => {
    if (!userId) return;
    (async () => {
      const [progress, stats] = await Promise.all([
        supabaseLoadProgress(supabase, userId),
        supabaseLoadWordStats(supabase, userId),
      ]);
      if (progress) {
        setDefeatedIds(progress.defeated_ids || []);
        setXp(progress.xp ?? 0);
        setDifficulty(progress.difficulty || "mittel");
        setAutoLevel(progress.auto_level || "mittel");
        // Streak & Level-Up-Daten aus Supabase laden
        if (progress.streak !== undefined) {
          setStreak(progress.streak);
          streakRef.current = progress.streak;
        }
        if (progress.last_played_date !== undefined) {
          setLastPlayedDate(progress.last_played_date);
          lastPlayedRef.current = progress.last_played_date;
        }
        if (progress.first_defeated_dates) {
          setFirstDefeatedDates(progress.first_defeated_dates);
        }
        if (progress.monster_stars) {
          setMonsterStars(progress.monster_stars);
        }
        if (progress.auto_level) setScreen(s => s === "diagnose" ? "map" : s);
      }
      if (stats && Object.keys(stats).length > 0) {
        setWordStats(stats);
      }
    })();
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Bei jeder Aenderung speichern (inkl. wordStats) — localStorage + Supabase
  useEffect(() => {
    writeSave({ defeatedIds, xp, difficulty, autoLevel, wordStats, streak, lastPlayedDate, firstDefeatedDates, monsterStars });
    // Fire-and-forget Supabase upsert (globaler Client)
    if (userId) {
      supabaseUpsertProgress(supabase, userId, { defeatedIds, xp, difficulty, autoLevel, streak, lastPlayedDate, firstDefeatedDates, monsterStars });
    }
  }, [defeatedIds, xp, difficulty, autoLevel, wordStats, streak, lastPlayedDate, firstDefeatedDates, monsterStars]); // eslint-disable-line react-hooks/exhaustive-deps

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
      // Fire-and-forget Supabase upsert fuer dieses Wort (globaler Client)
      if (userId) {
        supabaseUpsertWordStat(supabase, userId, word, updated);
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

    // Ersten Sieg-Datum fuer Level-Up-Tracking merken
    setFirstDefeatedDates(prev => {
      if (prev[monsterId]) return prev; // bereits gesetzt
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
      return { ...prev, [monsterId]: today };
    });

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
    setFirstDefeatedDates({});
    setMonsterStars({});
    streakRef.current = 0;
    lastPlayedRef.current = null;
    inSessionRef.current = false;
    setScreen("diagnose");
    // Supabase-Daten loeschen (globaler Client)
    if (userId) {
      supabase.from('wortschmiede_progress').delete().eq('user_id', userId).then();
      supabase.from('wortschmiede_word_stats').delete().eq('user_id', userId).then();
    }
  }

  // ── STIMMEN-BATTLE ──────────────────────────────────────────────────────

  function startStimmenBattle(monsterId) {
    let words;
    if (monsterId) {
      words = buildStimmenBattleQueueForMonster(monsterId, difficulty, wordStats);
    } else {
      words = buildStimmenBattleQueue(difficulty, wordStats);
    }
    if (!words || words.length === 0) {
      // Keine Woerter verfuegbar → auf Map bleiben
      console.warn('[Wortschmiede] Stimmen-Battle: keine Woerter fuer Schwierigkeit', difficulty);
      return;
    }
    setSbWords(words);
    setSbMonsterId(monsterId || null);
    setSbResults({ results: [], totalPts: 0, compPts: 0 });
    setScreen("stimmen_battle");
  }

  function handleStimmenBattleComplete(data) {
    setSbResults(data);
    // Level-Up-Modus: Stern vergeben wenn schreiben >= 70% UND sprechen >= 70%
    if (sbMonsterId && data.results?.length > 0) {
      const writeOk = data.results.filter(r => r.wOk).length;
      const speakOk = data.results.filter(r => r.sOk).length;
      const total = data.results.length;
      if (writeOk / total >= 0.7 && speakOk / total >= 0.7) {
        setMonsterStars(prev => ({ ...prev, [sbMonsterId]: true }));
        addXP(50); // Bonus-XP fuer Level-Up
      }
    }
    setScreen("stimmen_battle_end");
  }

  return (
    <div className="wortschmiede-root" style={{ width: "100%", minHeight: "100%", background: "#030712" }}>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <FontLink />
      {/* Zurueck-Button oben links (nur auf Map + Diagnose + Difficulty) */}
      {onClose && screen !== "round" && screen !== "roundResult" && screen !== "session_pause" && screen !== "session_end" && screen !== "stimmen_battle" && screen !== "stimmen_battle_end" && (
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
          onStartStimmenBattle={startStimmenBattle}
          firstDefeatedDates={firstDefeatedDates}
          monsterStars={monsterStars}
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
      {screen === "stimmen_battle" && sbWords.length > 0 && (
        <StimmenBattleScreen
          words={sbWords}
          difficulty={difficulty}
          onUpdateWordStats={handleUpdateWordStats}
          onComplete={handleStimmenBattleComplete}
          onBack={() => setScreen("map")}
        />
      )}
      {screen === "stimmen_battle_end" && (
        <StimmenBattleEndScreen
          results={sbResults.results}
          totalPts={sbResults.totalPts}
          compPts={sbResults.compPts}
          isLevelUp={!!sbMonsterId}
          monsterName={sbMonsterId ? MONSTERS.find(m => m.id === sbMonsterId)?.name : null}
          passed={sbMonsterId ? !!monsterStars[sbMonsterId] : false}
          onBack={() => setScreen("map")}
        />
      )}
    </div>
  );
}
