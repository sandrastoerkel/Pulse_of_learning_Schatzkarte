import { useState, useRef } from "react";
import { W, STAR_TO_DIFF, getWordsForMonster } from './wortschmiede_data.js';

/* ─── STIMMEN-BATTLE ──────────────────────────────────────────────────────── */
// Hören · Schreiben · Sprechen — 3-Schritt-Lernmodul

const STIMMEN_BATTLE_ROUNDS = 10;

// Prioritaetskette: SM-2 faellig+Fehler → nur faellig → Fehlerhistorie → Schwierigkeit → Fallback
function buildStimmenBattleQueue(difficulty, wordStats) {
  const today = new Date().toISOString().split("T")[0];
  const all = W;

  const byDiff = (words) => words.filter(w => STAR_TO_DIFF[w[3]] === difficulty);

  // Prio 1: Heute faellig UND schon mal falsch
  const p1 = byDiff(all).filter(w => {
    const s = wordStats[w[0]];
    return s && s.dueDate <= today && s.totalWrong > 0;
  });

  // Prio 2: Heute faellig (auch ohne Fehler)
  const p2 = byDiff(all).filter(w => {
    const s = wordStats[w[0]];
    return s && s.dueDate <= today && !p1.find(x => x[0] === w[0]);
  });

  // Prio 3: Fehlerhistorie (totalWrong > 0), noch nicht faellig
  const p3 = byDiff(all).filter(w => {
    const s = wordStats[w[0]];
    return s && s.totalWrong > 0 && s.dueDate > today;
  }).sort((a, b) => (wordStats[b[0]]?.totalWrong ?? 0) - (wordStats[a[0]]?.totalWrong ?? 0));

  // Prio 4: Alle Woerter nach Schwierigkeit (neu, noch nicht gesehen)
  const seen = new Set([...p1, ...p2, ...p3].map(w => w[0]));
  const p4 = byDiff(all).filter(w => !seen.has(w[0]));

  // Fallback: alle Woerter
  const p5 = all.filter(w => !byDiff(all).find(x => x[0] === w[0]));

  // Pool zusammenstellen bis 10 Woerter erreicht
  const pool = [];
  for (const group of [p1, p2, p3, p4, p5]) {
    const shuffled = [...group].sort(() => Math.random() - 0.5);
    for (const w of shuffled) {
      if (pool.length >= STIMMEN_BATTLE_ROUNDS) break;
      if (!pool.find(x => x[0] === w[0])) pool.push(w);
    }
    if (pool.length >= STIMMEN_BATTLE_ROUNDS) break;
  }
  return pool.slice(0, STIMMEN_BATTLE_ROUNDS);
}

// Level-Up-Modus: nur Woerter des spezifischen Monsters
function buildStimmenBattleQueueForMonster(monsterId, difficulty, wordStats) {
  const today = new Date().toISOString().split("T")[0];
  const words = getWordsForMonster(monsterId, difficulty);

  const sorted = [...words].sort((a, b) => {
    const sa = wordStats[a[0]];
    const sb = wordStats[b[0]];
    const errA = sa?.totalWrong ?? 0;
    const errB = sb?.totalWrong ?? 0;
    if (errB !== errA) return errB - errA;
    const dueA = !sa || sa.dueDate <= today ? 0 : 1;
    const dueB = !sb || sb.dueDate <= today ? 0 : 1;
    return dueA - dueB;
  });

  return sorted.slice(0, STIMMEN_BATTLE_ROUNDS);
}

/* ─── STIMMEN BATTLE SCREEN ──────────────────────────────────────────────── */
function StimmenBattleScreen({ words, difficulty, onUpdateWordStats, onComplete, onBack }) {
  const [idx, setIdx]           = useState(0);
  const [phase, setPhase]       = useState("listen"); // listen | write | speak | result
  const [writeVal, setWriteVal] = useState("");
  const [speakVal, setSpeakVal] = useState("");
  const [wOk, setWOk]           = useState(false);
  const [sOk, setSok]           = useState(false);
  const [roundPts, setRoundPts] = useState(0);
  const [totalPts, setTotalPts] = useState(0);
  const [compPts, setCompPts]   = useState(0);
  const [results, setResults]   = useState([]);
  const [ttsStatus, setTtsStatus] = useState("");
  const [heard, setHeard]       = useState("");
  const spDebounceRef           = useRef(null);
  const writeRef                = useRef(null);
  const speakRef                = useRef(null);

  const cur = words[idx];
  const word = cur ? cur[0] : "";

  // iOS-sicheres TTS
  function playWord(rate) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.lang = "de-DE";
    u.rate = rate ?? 0.82;
    u.pitch = 1.0;
    const vv = window.speechSynthesis.getVoices();
    if (vv.length > 0) {
      const dv = vv.find(v => v.lang.startsWith("de") && /premium|enhanced|anna/i.test(v.name))
               || vv.find(v => v.lang.startsWith("de"));
      if (dv) u.voice = dv;
    }
    setTtsStatus("\u{1F50A} Läuft...");
    u.onerror = () => setTtsStatus("Fehler \u2013 nochmal tippen.");
    window.speechSynthesis.speak(u);
    const t = setInterval(() => {
      if (window.speechSynthesis.paused) window.speechSynthesis.resume();
    }, 5000);
    u.onend = () => { clearInterval(t); setTtsStatus("\u2713 Fertig \u2014 gut zugehört?"); };
  }

  function goWrite() {
    setPhase("write");
    setWriteVal("");
    setTimeout(() => writeRef.current?.focus(), 80);
  }

  function checkWrite() {
    const val = writeRef.current?.value?.trim() || writeVal.trim();
    if (!val) return;
    const ok = val.toLowerCase() === word.toLowerCase();
    setWOk(ok);
    if (onUpdateWordStats) onUpdateWordStats(word, ok);
    setTimeout(() => goSpeak(), ok ? 700 : 1400);
  }

  function goSpeak() {
    setSpeakVal("");
    setHeard("");
    setPhase("speak");
    setTimeout(() => speakRef.current?.focus(), 120);
  }

  function handleSpeakInput(e) {
    const val = e.target.value;
    setSpeakVal(val);
    clearTimeout(spDebounceRef.current);
    if (val.trim()) {
      spDebounceRef.current = setTimeout(() => finishSpeak(val.trim()), 1500);
    }
  }

  function finishSpeak(val) {
    clearTimeout(spDebounceRef.current);
    const spokenVal = val || speakVal.trim();
    if (!spokenVal) return;
    setHeard(spokenVal);
    const ok = spokenVal.toLowerCase() === word.toLowerCase();
    setSok(ok);
    const wv = writeRef.current?.value?.trim() || writeVal;
    const wOkNow = wv.toLowerCase() === word.toLowerCase();
    let pts = 0;
    if (wOkNow) pts += 10;
    if (ok)     pts += 10;
    if (wOkNow && ok) pts += 5;
    const compNow = compPts + 10;
    setRoundPts(pts);
    setTotalPts(p => p + pts);
    setCompPts(compNow);
    setResults(r => [...r, { word, written: wv, spoken: spokenVal, wOk: wOkNow, sOk: ok, pts }]);
    setPhase("result");
  }

  function nextWord() {
    if (idx + 1 >= words.length) {
      onComplete({
        results,
        totalPts: totalPts + roundPts,
        compPts,
      });
    } else {
      setIdx(i => i + 1);
      setPhase("listen");
      setWriteVal("");
      setSpeakVal("");
      setWOk(false);
      setSok(false);
      setTtsStatus("");
      setHeard("");
    }
  }

  const stepColors = ["#a78bfa", "#4ade80", "#fbbf24"];
  const stepNames  = ["Hören", "Schreiben", "Sprechen"];
  const stepIdx    = { listen: 0, write: 1, speak: 2, result: 2 }[phase] ?? 0;

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(160deg, #030712 0%, #0a0520 100%)", display: "flex", flexDirection: "column", fontFamily: "'Outfit', sans-serif" }}>
      {/* Header */}
      <div style={{ background: "rgba(0,0,0,0.5)", borderBottom: "1px solid #1e293b", padding: "10px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 20, padding: 0 }}>‹</button>
        <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: "#a78bfa", flex: 1 }}>STIMMEN-BATTLE</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#64748b" }}>{idx + 1} / {words.length}</span>
      </div>

      {/* Fortschrittsbalken */}
      <div style={{ height: 3, background: "#1e293b" }}>
        <div style={{ height: "100%", width: `${((idx) / words.length) * 100}%`, background: "#a78bfa", transition: "width 0.4s" }} />
      </div>

      {/* Score */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #1e293b" }}>
        <div style={{ flex: 1, textAlign: "center", padding: "8px 0", borderRight: "1px solid #1e293b" }}>
          <div style={{ fontSize: 10, color: "#64748b" }}>Computer</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700, color: "#ef4444" }}>{compPts}</div>
        </div>
        <div style={{ flex: 1, textAlign: "center", padding: "8px 0" }}>
          <div style={{ fontSize: 10, color: "#64748b" }}>Du</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700, color: "#4ade80" }}>{totalPts}</div>
        </div>
      </div>

      {/* Schritt-Indikatoren */}
      <div style={{ display: "flex", gap: 6, padding: "12px 16px 0" }}>
        {stepNames.map((n, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ height: 3, width: "100%", borderRadius: 2, background: i <= stepIdx ? stepColors[i] : "#1e293b", transition: "background 0.3s" }} />
            <span style={{ fontSize: 9, color: i === stepIdx ? stepColors[i] : "#334155", fontFamily: "'Press Start 2P', monospace" }}>{n}</span>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, padding: "16px", maxWidth: 520, margin: "0 auto", width: "100%" }}>

        {/* SCHRITT 1: HÖREN */}
        {phase === "listen" && (
          <div style={{ background: "#0d1333", border: "1px solid #a78bfa33", borderRadius: 16, padding: "20px" }}>
            <div style={{ fontSize: 10, color: "#a78bfa", fontFamily: "'Press Start 2P', monospace", marginBottom: 12 }}>SCHRITT 1 — HÖR ZU</div>
            <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 16px", lineHeight: 1.6 }}>
              Der Computer spricht ein Wort. Hör genau hin — kein Spicken!
            </p>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <button onClick={() => playWord(0.82)} style={{ flex: 2, background: "#a78bfa", color: "#07091a", border: "none", borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
                🔊 Wort abspielen
              </button>
              <button onClick={() => playWord(0.5)} style={{ flex: 1, background: "transparent", border: "1px solid #334155", color: "#94a3b8", borderRadius: 10, padding: "12px", fontSize: 12, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
                🐢 Langsam
              </button>
            </div>
            <div style={{ fontSize: 11, color: "#475569", minHeight: 18, marginBottom: 12 }}>{ttsStatus}</div>
            <button onClick={goWrite} style={{ width: "100%", background: "transparent", border: "1px solid #a78bfa55", color: "#a78bfa", borderRadius: 10, padding: "11px", fontSize: 13, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
              Ich hab's gehört →
            </button>
          </div>
        )}

        {/* SCHRITT 2: SCHREIBEN */}
        {phase === "write" && (
          <div style={{ background: "#0d1333", border: "1px solid #4ade8033", borderRadius: 16, padding: "20px" }}>
            <div style={{ fontSize: 10, color: "#4ade80", fontFamily: "'Press Start 2P', monospace", marginBottom: 12 }}>SCHRITT 2 — SCHREIB DAS WORT</div>
            <input
              ref={writeRef}
              type="text"
              value={writeVal}
              onChange={e => setWriteVal(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") checkWrite(); }}
              placeholder="..."
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck="false"
              style={{ width: "100%", boxSizing: "border-box", fontSize: 24, textAlign: "center", fontFamily: "'JetBrains Mono', monospace", letterSpacing: 3, marginBottom: 12, padding: "10px", background: "#070d1a", border: "1px solid #1e293b", borderRadius: 10, color: "#e2e8f0" }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => playWord(0.75)} style={{ flex: 1, background: "transparent", border: "1px solid #334155", color: "#94a3b8", borderRadius: 10, padding: "11px", fontSize: 12, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
                🔊 Nochmal hören
              </button>
              <button onClick={checkWrite} style={{ flex: 2, background: "#4ade80", color: "#07091a", border: "none", borderRadius: 10, padding: "11px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
                Prüfen →
              </button>
            </div>
          </div>
        )}

        {/* SCHRITT 3: SPRECHEN (iOS Diktat) */}
        {phase === "speak" && (
          <div style={{ background: "#0d1333", border: "1px solid #fbbf2433", borderRadius: 16, padding: "20px" }}>
            <div style={{ fontSize: 10, color: "#fbbf24", fontFamily: "'Press Start 2P', monospace", marginBottom: 12 }}>SCHRITT 3 — SPRICH DAS WORT</div>
            <div style={{ fontSize: 28, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, textAlign: "center", letterSpacing: 3, color: "#e2e8f0", margin: "8px 0 16px" }}>{word}</div>
            <div style={{ background: "#070d1a", border: "1px solid #1e293b", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#64748b", lineHeight: 1.6, marginBottom: 12 }}>
              Tippe ins Feld und drück das <strong style={{ color: "#94a3b8" }}>Mikrofon auf der Tastatur</strong> — dann sprich das Wort laut.
            </div>
            <input
              ref={speakRef}
              type="text"
              value={speakVal}
              onChange={handleSpeakInput}
              onKeyDown={e => { if (e.key === "Enter") { clearTimeout(spDebounceRef.current); finishSpeak(speakVal.trim()); } }}
              placeholder="..."
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck="false"
              style={{ width: "100%", boxSizing: "border-box", fontSize: 24, textAlign: "center", fontFamily: "'JetBrains Mono', monospace", letterSpacing: 3, marginBottom: 12, padding: "10px", background: "#070d1a", border: "1px solid #1e293b", borderRadius: 10, color: "#e2e8f0" }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => playWord(0.75)} style={{ flex: 1, background: "transparent", border: "1px solid #334155", color: "#94a3b8", borderRadius: 10, padding: "11px", fontSize: 12, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
                🔊 Nochmal hören
              </button>
              <button onClick={() => { clearTimeout(spDebounceRef.current); finishSpeak(speakVal.trim()); }} disabled={!speakVal.trim()} style={{ flex: 2, background: speakVal.trim() ? "#fbbf24" : "#1e293b", color: speakVal.trim() ? "#07091a" : "#334155", border: "none", borderRadius: 10, padding: "11px", fontSize: 14, fontWeight: 700, cursor: speakVal.trim() ? "pointer" : "default", fontFamily: "'Outfit', sans-serif", transition: "background 0.2s" }}>
                Fertig →
              </button>
            </div>
          </div>
        )}

        {/* ERGEBNIS PRO WORT */}
        {phase === "result" && (
          <div style={{ background: "#0d1333", border: "1px solid #1e293b", borderRadius: 16, padding: "20px" }}>
            <div style={{ fontSize: 22, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, textAlign: "center", color: "#e2e8f0", marginBottom: 16 }}>{word}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              {/* Schreiben */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: wOk ? "#052e16" : "#2e0516", border: `1px solid ${wOk ? "#22c55e44" : "#ef444444"}`, borderRadius: 10 }}>
                <div>
                  <div style={{ fontSize: 10, color: "#64748b", marginBottom: 3 }}>Geschrieben</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, color: wOk ? "#4ade80" : "#f87171" }}>
                    {writeRef.current?.value?.trim() || writeVal || "\u2014"}
                  </div>
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 900, color: wOk ? "#4ade80" : "#f87171" }}>
                  {wOk ? "+10" : "0"}
                </div>
              </div>
              {/* Sprechen */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: sOk ? "#052e16" : "#2e0516", border: `1px solid ${sOk ? "#22c55e44" : "#ef444444"}`, borderRadius: 10 }}>
                <div>
                  <div style={{ fontSize: 10, color: "#64748b", marginBottom: 3 }}>Gesprochen</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, color: sOk ? "#4ade80" : "#f87171" }}>{heard || "\u2014"}</div>
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 900, color: sOk ? "#4ade80" : "#f87171" }}>
                  {sOk ? "+10" : "0"}
                </div>
              </div>
              {/* Bonus */}
              {wOk && sOk && (
                <div style={{ textAlign: "center", fontSize: 13, color: "#fbbf24", padding: "6px 0" }}>
                  ⭐ Perfekt! +5 Bonus — Computer geschlagen!
                </div>
              )}
            </div>
            <button onClick={nextWord} style={{ width: "100%", background: "#a78bfa", color: "#07091a", border: "none", borderRadius: 12, padding: "13px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
              {idx + 1 >= words.length ? "Auswertung →" : "Nächstes Wort →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── STIMMEN BATTLE END SCREEN ──────────────────────────────────────────── */
function StimmenBattleEndScreen({ results, totalPts, compPts, monsterId, monsterStars, onBack }) {
  const won = totalPts >= compPts;
  const pct = results.length > 0 ? Math.round((results.filter(r => r.wOk).length / results.length) * 100) : 0;
  const spokenPct = results.length > 0 ? Math.round((results.filter(r => r.sOk).length / results.length) * 100) : 0;

  const isLevelUpMode = !!monsterId;
  const writePassed = pct >= 70;
  const speakPassed = spokenPct >= 70;
  const levelUpPassed = writePassed && speakPassed;

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(160deg, #030712 0%, #0a0520 100%)", overflowY: "auto", padding: "32px 16px", fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ maxWidth: 460, margin: "0 auto", textAlign: "center" }}>

        {/* Emoji + Titel */}
        <div style={{ fontSize: 56, marginBottom: 10 }}>
          {isLevelUpMode ? (levelUpPassed ? "⭐" : "🎯") : (won ? "🏆" : "🎯")}
        </div>
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: isLevelUpMode ? "#fbbf24" : "#a78bfa", marginBottom: 8, lineHeight: 1.8 }}>
          {isLevelUpMode
            ? (levelUpPassed ? "LEVEL-UP BESTANDEN!" : "NOCH NICHT GANZ...")
            : "STIMMEN-BATTLE BEENDET"}
        </div>

        {/* Level-Up Ergebnis-Box */}
        {isLevelUpMode && (
          <div style={{
            background: levelUpPassed ? "#052e16" : "#1c0a00",
            border: `2px solid ${levelUpPassed ? "#22c55e" : "#f59e0b"}`,
            borderRadius: 14, padding: "16px 20px", marginBottom: 20,
          }}>
            {levelUpPassed ? (
              <>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#4ade80", marginBottom: 6 }}>
                  Du hast den ⭐ Stern verdient!
                </div>
                <div style={{ fontSize: 13, color: "#86efac", lineHeight: 1.6 }}>
                  Du kannst dieses Monster jetzt wirklich — hören, schreiben und sprechen. Das Gehirn hat es gespeichert!
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fbbf24", marginBottom: 6 }}>
                  Noch nicht ganz — üb noch eine Woche!
                </div>
                <div style={{ fontSize: 12, color: "#fde68a", lineHeight: 1.6 }}>
                  Du brauchst 70% beim Schreiben <strong>und</strong> 70% beim Sprechen.<br/>
                  Schreiben: <strong style={{ color: writePassed ? "#4ade80" : "#f87171" }}>{pct}%</strong> {writePassed ? "✅" : "❌"} &nbsp;·&nbsp;
                  Sprechen: <strong style={{ color: speakPassed ? "#4ade80" : "#f87171" }}>{spokenPct}%</strong> {speakPassed ? "✅" : "❌"}
                </div>
              </>
            )}
          </div>
        )}

        {/* Punkte (nur bei freiem Battle) */}
        {!isLevelUpMode && (
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            <div style={{ flex: 1, background: "#0d1333", border: "1px solid #4ade8055", borderRadius: 12, padding: "14px 10px" }}>
              <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4 }}>Du</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 32, fontWeight: 900, color: "#4ade80" }}>{totalPts}</div>
            </div>
            <div style={{ flex: 1, background: "#0d1333", border: "1px solid #ef444455", borderRadius: 12, padding: "14px 10px" }}>
              <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4 }}>Computer</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 32, fontWeight: 900, color: "#ef4444" }}>{compPts}</div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          <div style={{ background: "#0d1333", border: `1px solid ${writePassed ? "#22c55e44" : "#1e293b"}`, borderRadius: 12, padding: "12px" }}>
            <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4 }}>Schreiben</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 900, color: writePassed ? "#4ade80" : "#f87171" }}>{pct}%</div>
            {isLevelUpMode && <div style={{ fontSize: 9, color: "#475569", marginTop: 2 }}>Ziel: 70%</div>}
          </div>
          <div style={{ background: "#0d1333", border: `1px solid ${speakPassed ? "#fbbf2444" : "#1e293b"}`, borderRadius: 12, padding: "12px" }}>
            <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4 }}>Sprechen</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 900, color: speakPassed ? "#fbbf24" : "#f87171" }}>{spokenPct}%</div>
            {isLevelUpMode && <div style={{ fontSize: 9, color: "#475569", marginTop: 2 }}>Ziel: 70%</div>}
          </div>
        </div>

        {/* Wortliste */}
        <div style={{ background: "#0d1333", border: "1px solid #1e293b", borderRadius: 12, padding: "14px 16px", marginBottom: 24, textAlign: "left" }}>
          <div style={{ fontSize: 10, color: "#475569", fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>ALLE WÖRTER</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {results.map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: "#e2e8f0", flex: 1 }}>{r.word}</span>
                <span style={{ fontSize: 15 }}>{r.wOk ? "✅" : "❌"}</span>
                <span style={{ fontSize: 10, color: "#475569", minWidth: 56 }}>schreiben</span>
                <span style={{ fontSize: 15 }}>{r.sOk ? "✅" : "❌"}</span>
                <span style={{ fontSize: 10, color: "#475569", minWidth: 52 }}>sprechen</span>
              </div>
            ))}
          </div>
        </div>

        <button onClick={onBack} style={{ background: levelUpPassed ? "#fbbf24" : "#a78bfa", color: "#07091a", border: "none", borderRadius: 12, padding: "14px 40px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
          Zur Karte 🗺️
        </button>
      </div>
    </div>
  );
}

export { STIMMEN_BATTLE_ROUNDS, buildStimmenBattleQueue, buildStimmenBattleQueueForMonster, StimmenBattleScreen, StimmenBattleEndScreen };
