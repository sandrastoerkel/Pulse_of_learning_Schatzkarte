import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════
// SCHATZKARTE LANDING PAGE — FINAL
// ═══════════════════════════════════════════════════════════════
// 1. HERO: 6 Eltern-Fragen (interaktiv)
// 2. PARADIGMENWECHSEL
// 3. OBJECTION BUSTER: Kein Extra-Lernstoff
// 4. BEZIEHUNGSLERNEN: Chat + Gruppe + App
// 5. SCHATZKARTE: CTA zur echten App
// 6. VERTRAUEN
// 7. CTA: Buchung
// ═══════════════════════════════════════════════════════════════

interface Question {
  id: number;
  emoji: string;
  question: string;
  subtext: string;
  answer: {
    headline: string;
    text: string;
    icon: string;
    color: string;
  };
}

const QS: Question[] = [
  {
    id: 1, emoji: "🌈",
    question: "Wird mein Kind eine unbeschwerte Kindheit haben — trotz Notendruck?",
    subtext: "Schule, Leistung, Vergleich mit anderen…",
    answer: {
      headline: "Ja — wenn man dem Druck die Macht nimmt.",
      text: "Wer effektive Lerntechniken hat, lernt schneller — und hat dann noch Zeit für Freizeit, Freunde und Spielen. Der Notendruck verliert seinen Schrecken, wenn dein Kind weiß: \"Ich schaffe das.\" Und das Beste: Lernen kann richtig Spaß machen. Durch Anstrengung an der richtigen Stelle kommt man in einen Flow — das ist wie beim Sport.",
      icon: "☀️", color: "#d97706",
    },
  },
  {
    id: 2, emoji: "😮‍💨",
    question: "Wie kann ich den Stress in unserer Familie reduzieren?",
    subtext: "Hausaufgaben, Prüfungen, Streit…",
    answer: {
      headline: "Entspannung kommt durch Selbstvertrauen.",
      text: "Und durch Lerntechniken, die wirklich funktionieren. Wenn dein Kind merkt, dass es den Stoff tatsächlich bewältigen kann, löst sich der Familienstress fast von selbst. Kein Kampf mehr am Schreibtisch — weil dein Kind weiß, wie es anfangen soll und wann es fertig ist. Fleiß entsteht nicht durch Druck, sondern durch Erfolgserlebnisse.",
      icon: "🧘", color: "#7c3aed",
    },
  },
  {
    id: 3, emoji: "🎯",
    question: "Wird mein Kind eine gute Zukunft haben?",
    subtext: "Dafür braucht es doch gute Noten…",
    answer: {
      headline: "Eine gute Zukunft braucht mehr als gute Noten.",
      text: "Sie braucht Selbstvertrauen und die Fähigkeit, schnell Neues zu lernen. Die gute Nachricht: Genau das kann man trainieren. Und wenn dein Kind weiß, wie Lernen funktioniert, kommen die besseren Noten ganz von selbst — als Nebenprodukt, nicht als Ziel.",
      icon: "💡", color: "#059669",
    },
  },
  {
    id: 4, emoji: "🦋",
    question: "Wie wird mein Kind eine glückliche selbstständige Persönlichkeit?",
    subtext: "Unabhängig, eigenverantwortlich, stark…",
    answer: {
      headline: "Indem es selbstbewusst lernt.",
      text: "Das bedeutet: die eigenen Stärken und Schwächen kennen. Techniken haben, sich weiterzuentwickeln. Und ermutigt werden, es auch zu tun. Wer weiß, wie man lernt, traut sich auch Neues zu — im Unterricht, im Leben, im Beruf. Selbstständigkeit beginnt nicht mit 18, sondern mit dem ersten \"Das hab ich alleine geschafft!\"",
      icon: "🌟", color: "#059669",
    },
  },
  {
    id: 5, emoji: "🤖",
    question: "Bereitet die Schule mein Kind wirklich auf die Zukunft vor?",
    subtext: "KI verändert alles…",
    answer: {
      headline: "Die Schule versucht sich am Zeitgeist zu orientieren — aber Kinder müssen sich auf die Zukunft vorbereiten.",
      text: "Keiner weiß, wie diese Zukunft genau aussehen wird. Aber wir wissen: Kreative, selbstbewusste, neugierige Teenager kommen am besten zurecht — egal was kommt. Eigenständig lernen, mutig Neues anpacken, die Welt mitgestalten wollen. Das lernt man nicht aus einem Schulbuch — aber man kann es trainieren.",
      icon: "🚀", color: "#dc2626",
    },
  },
  {
    id: 6, emoji: "🙋",
    question: "Wie kann ICH meinem Kind helfen?",
    subtext: "Ich will unterstützen, aber weiß nicht wie…",
    answer: {
      headline: "Indem du lernst, was dein Kind wirklich braucht.",
      text: "Die meisten Eltern wollen helfen — aber gut gemeintes \"Hast du schon gelernt?\" bewirkt oft das Gegenteil. In meinem Eltern-Workshop lernst du, wie du richtig Feedback gibst, wie du Motivation förderst statt Druck aufbaust — und was es wirklich braucht, damit ein Kind richtig gut werden kann. Denn dein Kind braucht keine Kontrolleure, sondern Verbündete.",
      icon: "🤝", color: "#2563eb",
    },
  },
];

// Kontaktdaten
const CONTACT_EMAIL = "sandra.stoerkel@web.de";
const WHATSAPP_NUMBER = "60172904521"; // Malaysia Format ohne +

interface SparkleProps {
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}

function Sparkle({ size = 20, color = "var(--fb-reward)", style = {} }: SparkleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ flexShrink: 0, ...style }}>
      <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" />
    </svg>
  );
}

// Im iframe immer sichtbar (IntersectionObserver funktioniert dort nicht zuverlässig)
function useVis(_id: string): boolean {
  return true; // Alle Sections sofort sichtbar
}

interface SchatzkarteLandingProps {
  onGuestMode?: () => void;
}

export default function SchatzkarteLanding({ onGuestMode }: SchatzkarteLandingProps) {
  const [activeQ, setActiveQ] = useState<number | null>(null);
  const [answered, setAnswered] = useState<Set<number>>(new Set());
  const [formDone, setFormDone] = useState(false);

  // Formular-State
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formKlasse, setFormKlasse] = useState("");

  const v2 = useVis("s2");
  const v3 = useVis("s3");
  const v4 = useVis("s4");
  const v5 = useVis("s5");
  const v6 = useVis("s6");
  const v7 = useVis("s7");

  const handleQ = (id: number) => {
    setActiveQ(activeQ === id ? null : id);
    setAnswered((p) => new Set([...p, id]));
  };
  const allDone = answered.size === QS.length;
  const fade = (vis: boolean): React.CSSProperties => ({
    opacity: vis ? 1 : 0,
    transform: vis ? "translateY(0)" : "translateY(32px)",
    transition: "opacity .85s cubic-bezier(.22,1,.36,1), transform .85s cubic-bezier(.22,1,.36,1)",
  });

  // Formular absenden per E-Mail
  const handleFormSubmit = () => {
    const subject = encodeURIComponent(`Infogespräch-Anfrage: ${formName}`);
    const body = encodeURIComponent(
      `Neue Anfrage über die Schatzkarte-Website:\n\n` +
      `Name: ${formName}\n` +
      `E-Mail: ${formEmail}\n` +
      `Klassenstufe: ${formKlasse || "Nicht angegeben"}\n\n` +
      `---\n` +
      `Diese Nachricht wurde automatisch über das Kontaktformular gesendet.`
    );

    // E-Mail öffnen
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;

    // Danke-Meldung anzeigen
    setFormDone(true);
  };

  return (
    <div style={{ fontFamily: "'Libre Franklin','DM Sans',system-ui,sans-serif", color: "#1a1a2e", background: "#fefefe", lineHeight: 1.65, overflowX: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@400;500;600;700;800;900&family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700;9..144,800&display=swap" rel="stylesheet" />
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0}
        @keyframes floatIn{from{opacity:0;transform:translateY(16px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes pulseGlow{0%,100%{box-shadow:0 0 0 0 rgba(5,150,105,.25)}50%{box-shadow:0 0 0 14px rgba(5,150,105,0)}}
        @keyframes gentleFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes spinSlow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        .qc{transition:all .35s cubic-bezier(.34,1.56,.64,1);cursor:pointer}
        .qc:hover{transform:translateY(-3px);box-shadow:0 10px 28px rgba(0,0,0,.08)!important}
        .cb{transition:all .3s ease}.cb:hover{transform:translateY(-2px);box-shadow:0 14px 40px rgba(5,150,105,.4)!important}
        .cb:active{transform:translateY(0)}
        .cta-outline{transition:all .3s ease;cursor:pointer}
        .cta-outline:hover{background:#059669!important;color:#fff!important;border-color:#059669!important}
        input:focus,select:focus{border-color:#059669!important;outline:none}
        @media(max-width:640px){.q-grid{grid-template-columns:1fr!important}}
      `}</style>

      {/* ══════════════════════════════════════════════ */}
      {/* SECTION 1 — HERO: Interaktiver Eltern-Dialog  */}
      {/* ══════════════════════════════════════════════ */}
      <section style={{
        position: "relative", display: "flex", flexDirection: "column",
        justifyContent: "flex-start", padding: "40px 24px 60px",
        background: "linear-gradient(168deg,#fefce8 0%,#f0fdf4 40%,#fefefe 75%)", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: "8%", right: "-6%", width: 320, height: 320, background: "radial-gradient(circle,#bbf7d033,transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "12%", left: "-8%", width: 400, height: 400, background: "radial-gradient(circle,#fef3c733,transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

        <div style={{ maxWidth: 920, margin: "0 auto", position: "relative", zIndex: 2 }}>
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36, animation: "fadeUp .6s ease-out" }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#059669,#34d399)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🗺️</div>
            <span style={{ fontWeight: 800, fontSize: 14, color: "#059669", letterSpacing: 1.2, textTransform: "uppercase" }}>Schatzkarte</span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: "'Fraunces',serif", fontSize: "clamp(30px,5vw,52px)", fontWeight: 800,
            color: "#1a1a2e", lineHeight: 1.15, marginBottom: 14, animation: "fadeUp .6s ease-out .1s both",
          }}>
            Was beschäftigt dich{" "}
            <span style={{ position: "relative", display: "inline-block", color: "#059669" }}>
              wirklich
              <svg style={{ position: "absolute", bottom: -6, left: 0, width: "100%", height: 12 }} viewBox="0 0 120 12" fill="none">
                <path d="M2 8Q30 2 60 7T118 5" stroke="#34d399" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>?
          </h1>
          <p style={{ fontSize: 18, color: "#52525b", maxWidth: 580, marginBottom: 44, animation: "fadeUp .6s ease-out .2s both" }}>
            Klicke auf die Frage, die dir am meisten auf dem Herzen liegt.
          </p>

          {/* 6 Question Cards — 2×3 Grid */}
          <div className="q-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(270px,1fr))", gap: 14 }}>
            {QS.map((q, i) => {
              const open = activeQ === q.id;
              const done = answered.has(q.id);
              return (
                <div key={q.id} className="qc" onClick={() => handleQ(q.id)} style={{
                  background: open ? `linear-gradient(135deg,${q.answer.color}06,${q.answer.color}12)` : "#fff",
                  border: open ? `2px solid ${q.answer.color}44` : done ? "2px solid #a7f3d0" : "2px solid #e5e7eb",
                  borderRadius: 18, padding: open ? "20px" : "16px 20px",
                  animation: `floatIn .5s ease-out ${.25 + i * .08}s both`,
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{ fontSize: 24, flexShrink: 0, lineHeight: 1 }}>{q.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e", marginBottom: 2, lineHeight: 1.35 }}>{q.question}</div>
                      <div style={{ fontSize: 12, color: "#71717a" }}>{q.subtext}</div>
                    </div>
                    <div style={{
                      flexShrink: 0, width: 24, height: 24, borderRadius: "50%",
                      background: done ? "#dcfce7" : "#f4f4f5",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, transition: "all .3s", transform: open ? "rotate(180deg)" : "none",
                      color: done ? "#059669" : "#a1a1aa",
                    }}>
                      {done ? "✓" : "▾"}
                    </div>
                  </div>
                  {/* Expandable answer */}
                  <div style={{
                    maxHeight: open ? 320 : 0, opacity: open ? 1 : 0, overflow: "hidden",
                    transition: "all .45s cubic-bezier(.34,1.56,.64,1)", marginTop: open ? 14 : 0,
                  }}>
                    <div style={{ borderTop: `2px solid ${q.answer.color}18`, paddingTop: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                        <span style={{ fontSize: 18 }}>{q.answer.icon}</span>
                        <span style={{ fontFamily: "'Fraunces',serif", fontWeight: 700, fontSize: 15, color: q.answer.color, lineHeight: 1.3 }}>{q.answer.headline}</span>
                      </div>
                      <p style={{ fontSize: 13, color: "#3f3f46", lineHeight: 1.75 }}>{q.answer.text}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress */}
          {answered.size > 0 && (
            <div style={{ marginTop: 28, textAlign: "center", animation: "fadeUp .4s ease-out" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: allDone ? "#dcfce7" : "#f4f4f5",
                padding: "10px 20px", borderRadius: 30, fontSize: 14, fontWeight: 600,
                color: allDone ? "#047857" : "#71717a",
              }}>
                {allDone
                  ? <><Sparkle size={14} color="#059669" /> Genau dafür gibt es die Schatzkarte ↓</>
                  : <>{answered.size}/{QS.length} Fragen entdeckt</>
                }
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════ */}
      {/* SECTION 2 — PARADIGMENWECHSEL                 */}
      {/* ══════════════════════════════════════════════ */}
      <section id="s2" style={{ ...fade(v2), padding: "96px 24px", background: "linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 50%, #1a3550 100%)", color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)", backgroundSize: "56px 56px", pointerEvents: "none" }} />
        <div style={{ maxWidth: 780, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div style={{ display: "inline-block", background: "rgba(147,197,253,.15)", color: "#93c5fd", padding: "7px 16px", borderRadius: 8, fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 22 }}>
            Meine Überzeugung
          </div>
          <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: "clamp(26px,4vw,42px)", fontWeight: 800, lineHeight: 1.2, marginBottom: 20 }}>
            Die Welt verändert sich rasant.
          </h2>
          <p style={{ fontSize: 17, color: "#cbd5e1", lineHeight: 1.8, marginBottom: 36, maxWidth: 650 }}>
            Keiner weiß, wie diese Zukunft genau aussehen wird. Aber wir wissen: Kreative, selbstbewusste, neugierige Teenager kommen am besten zurecht — egal was kommt. Eigenständig lernen, mutig Neues anpacken, die Welt mitgestalten wollen. Das lernt man nicht aus einem Schulbuch — aber man kann es trainieren.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 14 }}>
            {[
              { icon: "🎨", title: "Kreativ mitgestalten und Spaß haben", text: "Mutig sein, Neues ausprobieren, die Welt als Herausforderung annehmen" },
              { icon: "⚡", title: "Schnell lernen", text: "Techniken, die nachweislich funktionieren" },
              { icon: "💪", title: "Selbstwirksam handeln", text: "Wissen, dass man es schaffen kann" },
            ].map((p, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 16, padding: "22px 20px" }}>
                <div style={{ fontSize: 26, marginBottom: 10 }}>{p.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 5, color: "#f1f5f9" }}>{p.title}</div>
                <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{p.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ */}
      {/* SECTION 3 — OBJECTION BUSTER                  */}
      {/* ══════════════════════════════════════════════ */}
      <section id="s3" style={{ ...fade(v3), padding: "88px 24px", background: "linear-gradient(180deg,#fefefe,#fef3c711)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fef3c7", color: "#92400e", padding: "8px 18px", borderRadius: 30, fontSize: 13, fontWeight: 700, marginBottom: 24 }}>
            ⚠️ Wichtig für Eltern
          </div>
          <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: "clamp(26px,4vw,40px)", fontWeight: 800, color: "#1a1a2e", lineHeight: 1.2, marginBottom: 20 }}>
            Dein Kind muss{" "}
            <span style={{ background: "linear-gradient(180deg,transparent 55%,#fde68a 55%)", padding: "0 4px" }}>
              nichts Zusätzliches lernen.
            </span>
          </h2>
          <p style={{ fontSize: 17, color: "#52525b", maxWidth: 600, margin: "0 auto 40px", lineHeight: 1.75 }}>
            Alle Lerntechniken werden direkt am aktuellen Schulstoff und den Hausaufgaben geübt — nicht als Extra obendrauf.
            Dein Kind lernt nicht <em>mehr</em>, sondern <em>besser</em>.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20, maxWidth: 660, margin: "0 auto" }}>
            <div style={{ background: "#fef2f2", border: "2px solid #fecaca", borderRadius: 20, padding: "28px 24px", textAlign: "left" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#dc2626", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>❌ Typische Nachhilfe</div>
              {["Extra Aufgabenblätter", "Zusätzlicher Lernstoff", "Noch mehr Schreibtisch-Zeit", "Einsames Pauken"].map((t, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#7f1d1d", marginBottom: 8 }}>
                  <span style={{ color: "#ef4444", fontWeight: 700, fontSize: 16 }}>✗</span> {t}
                </div>
              ))}
            </div>
            <div style={{ background: "#f0fdf4", border: "2px solid #86efac", borderRadius: 20, padding: "28px 24px", textAlign: "left" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>✅ Schatzkarte</div>
              {["Übt mit den eigenen Hausaufgaben", "Lernt Techniken AM echten Stoff", "Weniger Zeit, bessere Ergebnisse", "In der Gruppe, mit Begleitung"].map((t, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#14532d", marginBottom: 8 }}>
                  <span style={{ color: "#22c55e", fontWeight: 700, fontSize: 16 }}>✓</span> {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ */}
      {/* SECTION 4 — BEZIEHUNGSLERNEN                  */}
      {/* ══════════════════════════════════════════════ */}
      <section id="s4" style={{ ...fade(v4), padding: "96px 24px", background: "#f8fafc" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ display: "inline-block", background: "#dbeafe", color: "#1e40af", padding: "7px 16px", borderRadius: 30, fontSize: 13, fontWeight: 700, marginBottom: 20 }}>
              🤝 Das Besondere
            </div>
            <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: "clamp(26px,4vw,40px)", fontWeight: 800, color: "#1a1a2e", lineHeight: 1.2, marginBottom: 12 }}>
              Lernen passiert in <span style={{ color: "#2563eb" }}>Beziehung.</span>
            </h2>
            <p style={{ fontSize: 17, color: "#52525b", maxWidth: 560, margin: "0 auto" }}>
              Apps allein reichen nicht. Dein Kind braucht echte Menschen, die es begleiten, herausfordern und ermutigen.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 20 }}>
            {/* Chat mit Sandra */}
            <div style={{ background: "#fff", borderRadius: 22, padding: "32px 26px", border: "2px solid #bfdbfe", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -8, right: -8, width: 80, height: 80, background: "radial-gradient(circle,#dbeafe,transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
              <div style={{ fontSize: 36, marginBottom: 14 }}>💬</div>
              <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 700, color: "#1e40af", marginBottom: 8 }}>
                2× pro Woche: Live-Chat mit mir
              </h3>
              <p style={{ fontSize: 14, color: "#52525b", lineHeight: 1.7 }}>
                Ich begleite dein Kind persönlich. Wir besprechen Fragen, üben Techniken am echten Schulstoff und ich ermutige — wie eine Mentorin, nicht wie eine App.
              </p>
              <div style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 6, background: "#eff6ff", padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, color: "#1d4ed8" }}>
                👩‍🏫 Persönliche Betreuung
              </div>
            </div>

            {/* Lerngruppe */}
            <div style={{ background: "#fff", borderRadius: 22, padding: "32px 26px", border: "2px solid #c4b5fd", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -8, right: -8, width: 80, height: 80, background: "radial-gradient(circle,#ede9fe,transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
              <div style={{ fontSize: 36, marginBottom: 14 }}>👥</div>
              <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 700, color: "#6d28d9", marginBottom: 8 }}>
                Lerngruppe: Du bist nicht allein
              </h3>
              <p style={{ fontSize: 14, color: "#52525b", lineHeight: 1.7 }}>
                Dein Kind trifft Gleichaltrige mit ähnlichen Herausforderungen. Zusammen lernen, sich motivieren — und merken: anderen geht es genauso.
              </p>
              <div style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 6, background: "#f5f3ff", padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, color: "#6d28d9" }}>
                🫂 Gemeinschaftsgefühl
              </div>
            </div>

            {/* Schatzkarte-App */}
            <div style={{ background: "#fff", borderRadius: 22, padding: "32px 26px", border: "2px solid #86efac", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -8, right: -8, width: 80, height: 80, background: "radial-gradient(circle,#dcfce7,transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
              <div style={{ fontSize: 36, marginBottom: 14 }}>🗺️</div>
              <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 700, color: "#059669", marginBottom: 8 }}>
                Schatzkarte: Jederzeit üben
              </h3>
              <p style={{ fontSize: 14, color: "#52525b", lineHeight: 1.7 }}>
                Zwischen den Sessions übt dein Kind eigenständig mit der interaktiven Schatzkarte — Flashcards, Gedächtnispalast, Quizze — alles am eigenen Schulstoff.
              </p>
              <div style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 6, background: "#dcfce7", padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, color: "#047857" }}>
                🎮 Spielerisch & eigenständig
              </div>
            </div>
          </div>

          {/* Formula */}
          <div style={{ textAlign: "center", marginTop: 36 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 12, background: "#fff", border: "2px solid #e5e7eb", borderRadius: 30, padding: "14px 28px", fontSize: 15, fontWeight: 600, color: "#1a1a2e" }}>
              <span>💬</span><span style={{ color: "#a1a1aa" }}>+</span>
              <span>👥</span><span style={{ color: "#a1a1aa" }}>+</span>
              <span>🗺️</span><span style={{ color: "#a1a1aa" }}>=</span>
              <span style={{ color: "#059669" }}>Nachhaltiges Lernen</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ */}
      {/* SECTION 5 — SCHATZKARTE ENTDECKEN             */}
      {/* ══════════════════════════════════════════════ */}
      <section id="s5" style={{ ...fade(v5), padding: "96px 24px", background: "linear-gradient(180deg,#fefefe,#f0fdf4)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "linear-gradient(90deg,#fef3c7,#dcfce7,#fef3c7)",
            backgroundSize: "200% 100%", animation: "shimmer 3s linear infinite",
            padding: "8px 18px", borderRadius: 30, fontSize: 13, fontWeight: 700, color: "#92400e", marginBottom: 22,
          }}>
            <Sparkle size={13} color="#d97706" /> WIE EIN COMPUTERSPIEL
          </div>

          <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: "clamp(26px,4vw,42px)", fontWeight: 800, color: "#1a1a2e", marginBottom: 16 }}>
            Entdecke die <span style={{ color: "#059669" }}>Schatzkarte</span>
          </h2>
          <p style={{ fontSize: 17, color: "#52525b", maxWidth: 540, margin: "0 auto 20px", lineHeight: 1.75 }}>
            Eine interaktive Lernwelt mit Inseln, Quests und echten Lerntechniken.
            Dein Kind sammelt XP, schaltet Belohnungen frei — und lernt dabei, ohne es zu merken.
          </p>
          <p style={{ fontSize: 15, color: "#71717a", maxWidth: 480, margin: "0 auto 40px", lineHeight: 1.7 }}>
            Gedächtnispalast bauen, Flashcards mit Spracheingabe erstellen, Selbsteinschätzung trainieren — alles auf modernstem Niveau, alles am eigenen Schulstoff.
          </p>

          {/* Big CTA to real app */}
          <div style={{
            background: "linear-gradient(150deg,#fefce8,#f0fdf4 50%,#ecfeff)",
            border: "2px solid #a7f3d0", borderRadius: 26, padding: "44px 32px",
            position: "relative", overflow: "hidden",
          }}>
            <Sparkle size={10} color="#fbbf2466" style={{ position: "absolute", top: 20, left: 30 }} />
            <Sparkle size={8} color="#34d39944" style={{ position: "absolute", bottom: 24, right: 40 }} />
            <Sparkle size={12} color="#fbbf2433" style={{ position: "absolute", top: 40, right: 80 }} />

            <div style={{ fontSize: 64, marginBottom: 16, animation: "gentleFloat 3s ease-in-out infinite" }}>🗺️</div>
            <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 700, color: "#1a1a2e", marginBottom: 10 }}>
              Schau dir die Schatzkarte an
            </h3>
            <p style={{ fontSize: 15, color: "#52525b", marginBottom: 28, maxWidth: 400, margin: "0 auto 28px" }}>
              Klicke dich durch die Inseln und erlebe, wie dein Kind lernen wird — interaktiv, spielerisch, motivierend.
            </p>
            <button
              onClick={() => onGuestMode?.()}
              className="cb"
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                background: "linear-gradient(135deg,#059669,#047857)",
                color: "#fff", padding: "16px 36px", borderRadius: 50,
                fontSize: 16, fontWeight: 700, border: "none", cursor: "pointer",
                boxShadow: "0 8px 25px rgba(5,150,105,.35)",
                animation: "pulseGlow 2.5s ease-in-out infinite",
              }}
            >
              🗺️ Jetzt die Schatzkarte entdecken
            </button>
            <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 16 }}>
              Kostenlos · Kein Login nötig · Sofort loslegen
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ */}
      {/* SECTION 6 — VERTRAUEN                         */}
      {/* ══════════════════════════════════════════════ */}
      <section id="s6" style={{ ...fade(v6), padding: "72px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 24, fontWeight: 700, color: "#1a1a2e" }}>Warum gerade ich?</h2>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16 }}>
            {[
              { icon: "👩‍🏫", label: "20 Jahre Lehrerin", sub: "am bayerischen Gymnasium" },
              { icon: "📊", label: "Data Science", sub: "zertifiziert · PISA-Forschung" },
              { icon: "🎓", label: "Hattie & Bandura", sub: "evidenzbasierte Methoden" },
              { icon: "👨‍👩‍👧‍👦", label: "Selbst Mama", sub: "von 2 Schulkindern" },
            ].map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 14, padding: "16px 20px", minWidth: 200 }}>
                <span style={{ fontSize: 28 }}>{t.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>{t.label}</div>
                  <div style={{ fontSize: 12, color: "#71717a" }}>{t.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ */}
      {/* SECTION 7 — CTA                               */}
      {/* ══════════════════════════════════════════════ */}
      <section id="s7" style={{
        ...fade(v7), padding: "96px 24px",
        background: "linear-gradient(135deg,#059669,#047857)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.06) 1px,transparent 1px)", backgroundSize: "24px 24px", pointerEvents: "none" }} />
        <div style={{ maxWidth: 560, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: "clamp(26px,4vw,38px)", fontWeight: 800, color: "#fff", marginBottom: 12 }}>
              Bereit für den ersten Schritt?
            </h2>
            <p style={{ fontSize: 17, color: "#bbf7d0", lineHeight: 1.6 }}>
              In einem kostenlosen Infogespräch zeige ich dir, wie die Schatzkarte deinem Kind helfen kann — ganz unverbindlich.
            </p>
          </div>

          <div style={{ background: "#fff", borderRadius: 24, padding: "36px 32px", boxShadow: "0 25px 60px rgba(0,0,0,.25)" }}>
            {formDone ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 14 }}>✅</div>
                <h3 style={{ fontWeight: 700, fontSize: 20, color: "#059669", marginBottom: 6 }}>Vielen Dank!</h3>
                <p style={{ color: "#6b7280", fontSize: 15 }}>Dein E-Mail-Programm sollte sich geöffnet haben. Sende die E-Mail ab und ich melde mich innerhalb von 24 Stunden bei dir.</p>
              </div>
            ) : (
              <>
                <h3 style={{ textAlign: "center", fontSize: 18, fontWeight: 700, color: "#1a1a2e", marginBottom: 24 }}>
                  📬 Kostenloses Infogespräch buchen
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
                  <input
                    type="text"
                    placeholder="Dein Name *"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    style={{
                      flex: "1 1 180px", padding: "14px 18px", border: "2px solid #e5e7eb", borderRadius: 12, fontSize: 15,
                    }}
                  />
                  <input
                    type="email"
                    placeholder="E-Mail-Adresse *"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    style={{
                      flex: "1 1 180px", padding: "14px 18px", border: "2px solid #e5e7eb", borderRadius: 12, fontSize: 15,
                    }}
                  />
                </div>
                <select
                  value={formKlasse}
                  onChange={(e) => setFormKlasse(e.target.value)}
                  style={{
                    width: "100%", padding: "14px 18px", border: "2px solid #e5e7eb", borderRadius: 12,
                    fontSize: 15, background: "#fff", marginBottom: 20,
                  }}
                >
                  <option value="">Klassenstufe des Kindes</option>
                  <option value="3.–4. Klasse">3.–4. Klasse</option>
                  <option value="5.–7. Klasse">5.–7. Klasse</option>
                  <option value="8.–10. Klasse">8.–10. Klasse</option>
                </select>
                <button
                  className="cb"
                  onClick={handleFormSubmit}
                  disabled={!formName || !formEmail}
                  style={{
                    width: "100%", padding: "16px", borderRadius: 50, fontWeight: 700,
                    color: "#fff", fontSize: 16, border: "none",
                    cursor: (!formName || !formEmail) ? "not-allowed" : "pointer",
                    background: (!formName || !formEmail)
                      ? "#9ca3af"
                      : "linear-gradient(135deg,#059669,#047857)",
                    boxShadow: (!formName || !formEmail)
                      ? "none"
                      : "0 8px 25px rgba(5,150,105,.35)",
                    animation: (!formName || !formEmail)
                      ? "none"
                      : "pulseGlow 2.5s ease-in-out infinite",
                    transition: "all .3s ease",
                  }}
                >
                  Jetzt kostenlos Infogespräch buchen
                </button>
                <p style={{ textAlign: "center", fontSize: 13, color: "#9ca3af", marginTop: 14 }}>
                  100% kostenlos · Keine Verpflichtung · Antwort in 24h
                </p>

                {/* WhatsApp Alternative */}
                <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #e5e7eb", textAlign: "center" }}>
                  <p style={{ fontSize: 13, color: "#71717a", marginBottom: 12 }}>
                    Oder schreib mir direkt:
                  </p>
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hallo Sandra! Ich interessiere mich für die Schatzkarte und würde gerne mehr erfahren.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      background: "#25D366", color: "#fff",
                      padding: "12px 24px", borderRadius: 30,
                      fontSize: 14, fontWeight: 600, textDecoration: "none",
                      boxShadow: "0 4px 14px rgba(37,211,102,.35)",
                      transition: "all .2s ease",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 6px 20px rgba(37,211,102,.45)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 14px rgba(37,211,102,.35)";
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    Via WhatsApp kontaktieren
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* WhatsApp Button entfernt - position:fixed funktioniert nicht im iframe */}

      {/* ══════════════════════════════════════════════ */}
      {/* FOOTER                                        */}
      {/* ══════════════════════════════════════════════ */}
      <footer style={{ padding: "48px 24px", background: "#111827" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 20 }}>🗺️</span>
            <span style={{ fontFamily: "'Fraunces',serif", fontWeight: 700, fontSize: 18, color: "#34d399" }}>Schatzkarte</span>
          </div>
          <p style={{ color: "#9ca3af", fontSize: 14, marginBottom: 18 }}>
            Lerncoaching für Schüler der Klassen 3–10. Wissenschaftlich fundiert. Spielerisch. In Beziehung.
          </p>
          <p style={{ color: "#6b7280", fontSize: 13 }}>© 2025 Sandra Störkel · Impressum · Datenschutz</p>
        </div>
      </footer>
    </div>
  );
}

export { SchatzkarteLanding };
