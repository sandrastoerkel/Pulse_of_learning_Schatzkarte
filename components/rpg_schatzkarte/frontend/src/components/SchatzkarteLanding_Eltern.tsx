import { useState } from "react";

// ═══════════════════════════════════════════════════════════════
// SCHATZKARTE LANDING PAGE — ELTERNVERSION (OPTIMIERT)
// ═══════════════════════════════════════════════════════════════
// Optimierungen:
// - Alle Farben zentralisiert in THEME-Objekt
// - Hover/Focus-States über CSS statt inline JS-Handler
// - Wiederholte Style-Objekte extrahiert
// - Accessibility: Focus-visible für Keyboard-Navigation
// - Touch-kompatibel (keine JS-basierten Hover-Effekte)
// ═══════════════════════════════════════════════════════════════

// ─── THEME (Single Source of Truth) ─────────────────────────
const THEME = {
  // Brand
  primary: "#1FB6A6",       // Türkis — CTAs, Links, Akzente
  primaryHover: "#18a594",
  primarySubtle: "rgba(31, 182, 166, 0.08)",
  primaryBadge: "rgba(31, 182, 166, 0.12)",

  secondary: "#6B5DD3",     // Lila — Demo-Button, Kategorie-Akzent
  secondaryHover: "#5a4dba",

  accent: "#F6C453",        // Gold — Sparkles, Gamification-Akzent

  // Neutrals
  dark: "#1E2A44",          // Headlines, Hero-Hintergrund
  darkAlt: "#2B3A5C",       // Gradient-Endpunkt
  text: "#2B2B2B",          // Body-Text
  textStrong: "#374151",    // Antwort-Text
  textMuted: "#6B7280",     // Subtexte, Labels
  textLight: "#9CA3AF",     // Deaktiviert, Meta-Info
  textOnDark: "#D1D5DB",    // Text auf dunklem Hintergrund
  textOnDarkMuted: "#cbd5e1",

  // Surfaces
  bg: "#F7F9FC",            // Hintergrund
  bgWhite: "#fff",
  border: "#E5E7EB",        // Standard-Border
  shadow: "rgba(0, 0, 0, 0.04)",

  // External Brand
  whatsapp: "#25D366",

  // Typography
  fontUI: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  fontBrand: "'Fraunces', serif",
} as const;

// ─── QUESTION COLORS (3er Rotation) ────────────────────────
const Q_COLORS = [THEME.primary, THEME.secondary, THEME.accent] as const;

// ─── TYPES ──────────────────────────────────────────────────
interface ParentQuestion {
  id: number;
  emoji: string;
  question: string;
  category: string;
  answer: {
    headline: string;
    text: string;
    evidence: string;
  };
  color: string;
}

// ─── DATA ───────────────────────────────────────────────────
const PARENT_QUESTIONS: ParentQuestion[] = [
  {
    id: 1,
    emoji: "🌈",
    question: "Wird mein Kind eine unbeschwerte Kindheit haben — trotz Notendruck?",
    category: "Lebensqualität",
    answer: {
      headline: "Ja — wenn man dem Druck die Macht nimmt.",
      text: "Effektive Lerntechniken führen zu schnellerem Lernen — und schaffen Zeit für Freizeit, Freunde und Spiel. Der Notendruck verliert seinen Schrecken, wenn Ihr Kind erlebt: \"Ich schaffe das.\" Lernen kann in einen Flow-Zustand führen — ähnlich wie beim Sport.",
      evidence: "Studien zeigen: Selbstwirksamkeit (Bandura) reduziert Lernstress deutlich.",
    },
    color: Q_COLORS[0],
  },
  {
    id: 2,
    emoji: "😮‍💨",
    question: "Wie kann ich den Stress in unserer Familie reduzieren?",
    category: "Familiendynamik",
    answer: {
      headline: "Entspannung entsteht durch Selbstvertrauen und wirksame Strategien.",
      text: "Wenn Ihr Kind merkt, dass es den Stoff bewältigen kann, löst sich Familienstress oft von selbst. Kein Kampf mehr am Schreibtisch — weil Ihr Kind weiß, wie es anfangen soll und wann es fertig ist. Intrinsische Motivation entsteht durch Erfolgserlebnisse, nicht durch Druck.",
      evidence: "John Hattie (Visible Learning): Feedback und Selbsteinschätzung gehören zu den wirksamsten Faktoren (Effektstärke >0.6).",
    },
    color: Q_COLORS[1],
  },
  {
    id: 3,
    emoji: "🎯",
    question: "Wird mein Kind eine gute Zukunft haben?",
    category: "Zukunftsperspektive",
    answer: {
      headline: "Eine gute Zukunft braucht mehr als gute Noten.",
      text: "Entscheidend sind Selbstvertrauen und die Fähigkeit, schnell Neues zu lernen. Beides lässt sich trainieren. Wenn Ihr Kind versteht, wie Lernen funktioniert, kommen bessere Noten als Nebenprodukt — nicht als Hauptziel.",
      evidence: "OECD-Studien: Lernkompetenz und Selbstwirksamkeit sind stärkere Prädiktoren für Lebenserfolg als einzelne Noten.",
    },
    color: Q_COLORS[2],
  },
  {
    id: 4,
    emoji: "🦋",
    question: "Wie wird mein Kind eine selbstständige Persönlichkeit?",
    category: "Persönlichkeitsentwicklung",
    answer: {
      headline: "Durch selbstbewusstes, eigenverantwortliches Lernen.",
      text: "Das bedeutet: eigene Stärken und Schwächen kennen, Techniken zur Weiterentwicklung haben und ermutigt werden, sie zu nutzen. Wer weiß, wie man lernt, traut sich auch Neues zu — im Unterricht, im Leben, im Beruf. Selbstständigkeit beginnt mit dem ersten \"Das hab ich alleine geschafft!\"",
      evidence: "Growth Mindset (Carol Dweck): Fähigkeiten sind entwickelbar — diese Überzeugung fördert Resilienz und Eigeninitiative.",
    },
    color: Q_COLORS[0],
  },
  {
    id: 5,
    emoji: "🤖",
    question: "Bereitet die Schule mein Kind wirklich auf die Zukunft vor?",
    category: "Bildungssystem",
    answer: {
      headline: "Schulen orientieren sich am Zeitgeist — Kinder brauchen Zukunftskompetenz.",
      text: "Niemand weiß genau, wie die Zukunft aussieht. Aber klar ist: Kreative, selbstbewusste, neugierige junge Menschen kommen am besten zurecht. Eigenständig lernen, mutig Neues anpacken, die Welt mitgestalten wollen — das lernt man nicht aus Schulbüchern, aber man kann es trainieren.",
      evidence: "21st Century Skills: Kritisches Denken, Kreativität, Kollaboration und Kommunikation sind zentrale Zukunftskompetenzen.",
    },
    color: Q_COLORS[1],
  },
  {
    id: 6,
    emoji: "🤝",
    question: "Wie kann ICH meinem Kind am besten helfen?",
    category: "Elternrolle",
    answer: {
      headline: "Indem Sie verstehen, was Ihr Kind wirklich braucht.",
      text: "Gut gemeintes \"Hast du schon gelernt?\" bewirkt oft das Gegenteil. In meinem Eltern-Workshop lernen Sie, wie Sie wirksam Feedback geben, Motivation fördern statt Druck aufbauen — und was es wirklich braucht, damit ein Kind sein Potenzial entfaltet. Ihr Kind braucht Verbündete, keine Kontrolleure.",
      evidence: "Hattie-Studien: Elterliches Engagement mit Fokus auf Lernprozess (nicht nur Ergebnis) hat hohe positive Effekte.",
    },
    color: Q_COLORS[2],
  },
];

const CONTACT_EMAIL = "sandra.stoerkel@web.de";
const WHATSAPP_NUMBER = "60172904521";

// ─── REUSABLE COMPONENTS ────────────────────────────────────

function Sparkle({ size = 16, color = THEME.accent }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ flexShrink: 0 }}>
      <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" />
    </svg>
  );
}

// ─── REUSABLE STYLE OBJECTS ─────────────────────────────────

const sectionHeading: React.CSSProperties = {
  fontSize: "clamp(32px, 5vw, 48px)",
  fontWeight: 900,
  color: THEME.dark,
  marginBottom: 16,
};

const sectionSub: React.CSSProperties = {
  fontSize: 18,
  color: THEME.textMuted,
  lineHeight: 1.7,
};

const sectionCenter: React.CSSProperties = {
  textAlign: "center" as const,
  marginBottom: 56,
};

const cardBase: React.CSSProperties = {
  background: THEME.bgWhite,
  borderRadius: 16,
  border: `2px solid ${THEME.border}`,
  transition: "all .3s ease",
};

const inputBase: React.CSSProperties = {
  padding: "16px 20px",
  border: `2px solid ${THEME.border}`,
  borderRadius: 12,
  fontSize: 16,
  outline: "none",
  transition: "border-color .2s ease",
};

const dotPattern: React.CSSProperties = {
  position: "absolute" as const,
  inset: 0,
  backgroundImage: `radial-gradient(${THEME.primarySubtle} 2px, transparent 2px)`,
  backgroundSize: "40px 40px",
  pointerEvents: "none" as const,
};

// ─── MAIN COMPONENT ─────────────────────────────────────────

interface SchatzkarteLandingElternProps {
  onGuestMode?: () => void;
}

export default function SchatzkarteLandingEltern({ onGuestMode }: SchatzkarteLandingElternProps) {
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formKlasse, setFormKlasse] = useState("");
  const [formDone, setFormDone] = useState(false);

  const handleQuestionClick = (id: number) => {
    setActiveQuestion(activeQuestion === id ? null : id);
    setAnsweredQuestions(prev => new Set([...prev, id]));
  };

  const allAnswered = answeredQuestions.size === PARENT_QUESTIONS.length;
  const formValid = formName.trim() !== "" && formEmail.trim() !== "";

  const handleFormSubmit = () => {
    if (!formValid) return;
    const subject = encodeURIComponent(`Infogespräch-Anfrage: ${formName}`);
    const body = encodeURIComponent(
      `Neue Anfrage über die Schatzkarte-Website:\n\n` +
      `Name: ${formName}\n` +
      `E-Mail: ${formEmail}\n` +
      `Klassenstufe: ${formKlasse || "Nicht angegeben"}\n\n` +
      `Bitte um Rückruf für ein kostenloses Infogespräch.`
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setFormDone(true);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden',
      background: THEME.bg,
      fontFamily: THEME.fontUI,
      color: THEME.text
    }}>
      {/* Scrollbarer Inhalt */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden'
      }}>

      {/* ═══ CSS Hover/Focus States (statt inline JS-Handler) ═══ */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ─ Buttons ─ */
        .btn-primary {
          padding: 12px 24px;
          border-radius: 30px;
          background: ${THEME.primary};
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all .2s ease;
          white-space: nowrap;
          display: inline-block;
        }
        .btn-primary:hover { background: ${THEME.primaryHover}; transform: translateY(-1px); }
        .btn-primary:focus-visible { outline: 2px solid ${THEME.primary}; outline-offset: 2px; }

        .btn-secondary {
          padding: 12px 24px;
          border-radius: 30px;
          background: transparent;
          border: 2px solid ${THEME.secondary};
          color: ${THEME.secondary};
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all .2s ease;
          white-space: nowrap;
        }
        .btn-secondary:hover { background: ${THEME.secondary}; color: #fff; transform: translateY(-1px); }
        .btn-secondary:focus-visible { outline: 2px solid ${THEME.secondary}; outline-offset: 2px; }

        .btn-cta {
          width: 100%;
          padding: 18px;
          border-radius: 50px;
          font-size: 17px;
          font-weight: 800;
          color: #fff;
          border: none;
          cursor: pointer;
          background: ${THEME.primary};
          box-shadow: 0 8px 24px rgba(31,182,166,.4);
          transition: all .3s ease;
        }
        .btn-cta:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(31,182,166,.5); }
        .btn-cta:disabled { background: ${THEME.textLight}; box-shadow: none; cursor: not-allowed; }
        .btn-cta:focus-visible { outline: 2px solid ${THEME.primary}; outline-offset: 2px; }

        .btn-whatsapp {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: ${THEME.whatsapp};
          color: #fff;
          padding: 14px 28px;
          border-radius: 30px;
          font-size: 15px;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 4px 14px rgba(37,211,102,.35);
          transition: all .2s ease;
        }
        .btn-whatsapp:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(37,211,102,.45); }
        .btn-whatsapp:focus-visible { outline: 2px solid ${THEME.whatsapp}; outline-offset: 2px; }

        /* ─ Cards ─ */
        .question-card {
          background: #fff;
          border-radius: 16px;
          padding: 24px;
          cursor: pointer;
          border: 2px solid ${THEME.border};
          box-shadow: 0 2px 8px ${THEME.shadow};
          transition: all .3s ease;
        }
        .question-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.08); transform: translateY(-2px); }
        .question-card:focus-visible { outline: 2px solid ${THEME.primary}; outline-offset: 2px; }

        .pillar-card {
          background: #fff;
          border-radius: 20px;
          padding: 32px;
          border: 2px solid ${THEME.border};
          transition: all .3s ease;
        }
        .pillar-card:hover { transform: translateY(-4px); }

        /* ─ Inputs ─ */
        .form-input:focus { border-color: ${THEME.primary} !important; }

        /* ─ Sticky Header glass ─ */
        .sticky-header {
          padding: 24px;
          background: rgba(255,255,255,0.95);
          border-bottom: 1px solid ${THEME.border};
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        /* ─ Action Bar (Flex-Item am unteren Rand) ─ */
        .action-bar-fixed {
          flex-shrink: 0;
          padding: 16px 24px;
          background: rgba(255,255,255,0.98);
          border-top: 1px solid ${THEME.border};
          box-shadow: 0 -4px 20px rgba(0,0,0,0.15);
        }

        .action-bar-fixed .bar-content {
          max-width: 600px;
          margin: 0 auto;
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .btn-demo-big {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 16px 28px;
          border-radius: 50px;
          background: linear-gradient(135deg, ${THEME.secondary} 0%, ${THEME.primary} 100%);
          color: #fff;
          font-size: 17px;
          font-weight: 800;
          border: none;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(107,93,211,0.4);
          transition: all .3s ease;
        }
        .btn-demo-big:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(107,93,211,0.5);
        }
        .btn-demo-big:focus-visible { outline: 2px solid ${THEME.secondary}; outline-offset: 2px; }

        .btn-whatsapp-big {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 16px 28px;
          border-radius: 50px;
          background: ${THEME.whatsapp};
          color: #fff;
          font-size: 17px;
          font-weight: 800;
          text-decoration: none;
          box-shadow: 0 6px 20px rgba(37,211,102,0.4);
          transition: all .3s ease;
        }
        .btn-whatsapp-big:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(37,211,102,0.5);
        }
        .btn-whatsapp-big:focus-visible { outline: 2px solid ${THEME.whatsapp}; outline-offset: 2px; }

        @media (max-width: 500px) {
          .action-bar-fixed .bar-content {
            flex-direction: column;
          }
          .btn-demo-big, .btn-whatsapp-big {
            font-size: 15px;
            padding: 14px 20px;
          }
        }
      `}</style>

      {/* ══════════════════════════════════════════════ */}
      {/* HEADER                                        */}
      {/* ══════════════════════════════════════════════ */}
      <header className="sticky-header">
        <div style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 32 }}>🗺️</span>
            <div>
              <h1 style={{
                fontFamily: THEME.fontBrand,
                fontSize: 24,
                fontWeight: 800,
                color: THEME.dark,
                margin: 0,
                lineHeight: 1,
              }}>
                Schatzkarte
              </h1>
              <p style={{ fontSize: 12, color: THEME.textMuted, margin: "4px 0 0 0" }}>
                Lerncoaching für Klassen 3–10
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <a href="#kontakt" className="btn-primary">
              Infogespräch buchen
            </a>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════ */}
      {/* HERO                                          */}
      {/* ══════════════════════════════════════════════ */}
      <section style={{
        padding: "80px 24px 100px",
        background: `linear-gradient(135deg, ${THEME.dark} 0%, ${THEME.darkAlt} 100%)`,
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={dotPattern} />
        <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={{
              fontSize: "clamp(36px, 6vw, 64px)",
              fontWeight: 900,
              lineHeight: 1.1,
              color: "#fff",
              marginBottom: 24,
            }}>
              Was braucht Ihr Kind<br />
              <span style={{
                background: `linear-gradient(135deg, ${THEME.primary} 0%, ${THEME.secondary} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                wirklich zum Lernen?
              </span>
            </h2>
            <p style={{
              fontSize: 20,
              lineHeight: 1.7,
              color: THEME.textOnDark,
              maxWidth: 700,
              margin: "0 auto",
            }}>
              Sechs Fragen, die sich die meisten Eltern stellen — und evidenzbasierte Antworten, die wirklich weiterhelfen.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ */}
      {/* ELTERN-FRAGEN                                 */}
      {/* ══════════════════════════════════════════════ */}
      <section style={{ padding: "80px 24px", background: THEME.bg }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={sectionCenter}>
            <h2 style={sectionHeading}>Ihre Fragen — meine Antworten</h2>
            <p style={sectionSub}>
              Klicken Sie auf eine Frage, um die evidenzbasierte Antwort zu sehen.
            </p>
          </div>

          {/* Question Cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 20,
            marginBottom: 48,
          }}>
            {PARENT_QUESTIONS.map((q) => {
              const isActive = activeQuestion === q.id;
              return (
                <div
                  key={q.id}
                  className="question-card"
                  role="button"
                  tabIndex={0}
                  aria-expanded={isActive}
                  onClick={() => handleQuestionClick(q.id)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleQuestionClick(q.id); }}}
                  style={{
                    ...(isActive && {
                      borderColor: q.color,
                      boxShadow: `0 8px 24px ${q.color}30`,
                      transform: "translateY(-4px)",
                    }),
                  }}
                >
                  {/* Question Header */}
                  <div style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 16,
                    marginBottom: isActive ? 20 : 0,
                  }}>
                    <div style={{ fontSize: 32, flexShrink: 0 }}>{q.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: "inline-block",
                        padding: "4px 12px",
                        borderRadius: 20,
                        background: `${q.color}15`,
                        color: q.color,
                        fontSize: 12,
                        fontWeight: 700,
                        marginBottom: 10,
                      }}>
                        {q.category}
                      </div>
                      <h3 style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: THEME.dark,
                        lineHeight: 1.4,
                        margin: 0,
                      }}>
                        {q.question}
                      </h3>
                    </div>
                    <div style={{
                      fontSize: 20,
                      color: isActive ? q.color : THEME.textLight,
                      transition: "all .3s ease",
                    }}>
                      {isActive ? "▼" : "▶"}
                    </div>
                  </div>

                  {/* Answer (conditional) */}
                  {isActive && (
                    <div style={{
                      paddingTop: 20,
                      borderTop: `2px solid ${q.color}30`,
                      animation: "fadeIn .3s ease",
                    }}>
                      <h4 style={{
                        fontSize: 17,
                        fontWeight: 800,
                        color: q.color,
                        marginBottom: 12,
                      }}>
                        {q.answer.headline}
                      </h4>
                      <p style={{
                        fontSize: 15,
                        color: THEME.textStrong,
                        lineHeight: 1.7,
                        marginBottom: 16,
                      }}>
                        {q.answer.text}
                      </p>
                      <div style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                        padding: "14px 16px",
                        background: THEME.bg,
                        borderRadius: 12,
                        borderLeft: `3px solid ${q.color}`,
                      }}>
                        <div style={{ fontSize: 16, flexShrink: 0 }}>📚</div>
                        <div>
                          <div style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: THEME.textMuted,
                            marginBottom: 4,
                          }}>
                            EVIDENZ
                          </div>
                          <div style={{
                            fontSize: 13,
                            color: THEME.textMuted,
                            lineHeight: 1.5,
                          }}>
                            {q.answer.evidence}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress Indicator */}
          {answeredQuestions.size > 0 && (
            <div style={{
              textAlign: "center",
              padding: 20,
              background: allAnswered ? THEME.primarySubtle : THEME.bg,
              borderRadius: 16,
              border: `2px solid ${allAnswered ? THEME.primary : THEME.border}`,
            }}>
              <div style={{ fontSize: allAnswered ? 32 : 24, marginBottom: 8 }}>
                {allAnswered ? "🎉" : "👀"}
              </div>
              <div style={{
                fontSize: 16,
                fontWeight: 700,
                color: allAnswered ? THEME.primary : THEME.textMuted,
              }}>
                {allAnswered
                  ? "Super! Sie haben alle Fragen erkundet."
                  : `${answeredQuestions.size} von ${PARENT_QUESTIONS.length} Fragen erkundet`}
              </div>
              {allAnswered && (
                <>
                  <p style={{
                    fontSize: 14,
                    color: THEME.textMuted,
                    marginTop: 8,
                    marginBottom: 16,
                  }}>
                    Bereit für ein persönliches Gespräch?
                  </p>
                  <a href="#kontakt" className="btn-primary" style={{ padding: "14px 28px", fontSize: 15 }}>
                    Jetzt Infogespräch buchen
                  </a>
                </>
              )}
            </div>
          )}

          {/* Meine Überzeugung */}
          <div style={{
            background: `linear-gradient(135deg, ${THEME.dark} 0%, ${THEME.darkAlt} 100%)`,
            borderRadius: 24,
            padding: 40,
            marginTop: 48,
          }}>
            <div style={{
              display: "inline-block",
              background: THEME.primaryBadge,
              color: THEME.primary,
              padding: "6px 14px",
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 16,
            }}>
              Meine Überzeugung
            </div>
            <h2 style={{
              fontFamily: THEME.fontBrand,
              fontSize: "clamp(26px, 4vw, 42px)",
              fontWeight: 800,
              lineHeight: 1.2,
              marginBottom: 20,
              color: "#fff",
            }}>
              Die Welt verändert sich rasant.
            </h2>
            <p style={{
              fontSize: 17,
              color: THEME.textOnDarkMuted,
              lineHeight: 1.8,
              marginBottom: 0,
              maxWidth: 650,
            }}>
              Keiner weiß, wie diese Zukunft genau aussehen wird. Aber wir wissen: Kreative, selbstbewusste, neugierige Teenager kommen am besten zurecht — egal was kommt. Eigenständig lernen, mutig Neues anpacken, die Welt mitgestalten wollen. Das lernt man nicht aus einem Schulbuch — aber man kann es trainieren.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ */}
      {/* PARADIGMENWECHSEL                              */}
      {/* ══════════════════════════════════════════════ */}
      <section style={{ padding: "80px 24px", background: THEME.bgWhite }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ ...sectionCenter, marginBottom: 64 }}>
            <h2 style={sectionHeading}>Ein Paradigmenwechsel im Lernen</h2>
            <p style={{ ...sectionSub, maxWidth: 700, margin: "0 auto" }}>
              Weg vom reinen Stoffpauken — hin zu echtem Verständnis und Selbstwirksamkeit.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 32,
          }}>
            {/* Traditionell */}
            <div style={{
              padding: 40,
              background: THEME.bg,
              borderRadius: 20,
              border: `2px solid ${THEME.border}`,
            }}>
              <div style={{ fontSize: 48, marginBottom: 20, textAlign: "center", filter: "grayscale(70%)" }}>📚</div>
              <h3 style={{ fontSize: 24, fontWeight: 800, color: THEME.textMuted, marginBottom: 24, textAlign: "center" }}>
                Traditionelles Lernen
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  "Fokus auf Stoffmenge",
                  "Auswendiglernen ohne Kontext",
                  "Einzelkämpfer am Schreibtisch",
                  "Lernen als notwendiges Übel",
                  "Angst vor schlechten Noten",
                ].map((item, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <span style={{ fontSize: 18, color: THEME.textLight, flexShrink: 0 }}>⛔</span>
                    <span style={{ fontSize: 16, color: THEME.textMuted, lineHeight: 1.5 }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Schatzkarte */}
            <div style={{
              padding: 40,
              background: `linear-gradient(135deg, ${THEME.primarySubtle} 0%, rgba(107,93,211,.08) 100%)`,
              borderRadius: 20,
              border: `2px solid ${THEME.primary}`,
              boxShadow: `0 8px 24px rgba(31,182,166,.15)`,
            }}>
              <div style={{ fontSize: 48, marginBottom: 20, textAlign: "center" }}>🗺️</div>
              <h3 style={{ fontSize: 24, fontWeight: 800, color: THEME.dark, marginBottom: 24, textAlign: "center" }}>
                Schatzkarten-Ansatz
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { icon: "🎯", text: "Fokus auf Aufbau von Selbstbewusstsein" },
                  { icon: "🧠", text: "Spaß beim gehirngerechten Lernen" },
                  { icon: "👥", text: "Lernen in der Community" },
                  { icon: "✨", text: "Lernen als Wachstumschance" },
                  { icon: "💪", text: "Selbstwirksamkeit durch Erfolg" },
                ].map((item, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                    <span style={{ fontSize: 16, color: THEME.dark, fontWeight: 600, lineHeight: 1.5 }}>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ */}
      {/* DREI SÄULEN                                    */}
      {/* ══════════════════════════════════════════════ */}
      <section style={{ padding: "80px 24px", background: THEME.bg }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ ...sectionCenter, marginBottom: 64 }}>
            <h2 style={sectionHeading}>Die drei Säulen der Schatzkarte</h2>
            <p style={sectionSub}>Evidenzbasiert, praxiserprobt, nachhaltig wirksam.</p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 28,
          }}>
            {[
              {
                icon: "🧠",
                title: "Wirksame Lerntechniken",
                items: ["Active Recall", "Spaced Repetition", "Feynman-Methode", "Pomodoro-Technik"],
                color: THEME.primary,
                evidence: "Nach Hattie (Visible Learning) gehören diese zu den wirksamsten Strategien (ES > 0.6)",
              },
              {
                icon: "👥",
                title: "Lernen in Beziehung",
                items: ["Peer-Feedback", "Lerngruppen", "Coach-Begleitung", "Eltern-Workshops"],
                color: THEME.secondary,
                evidence: "Soziales Lernen und konstruktives Feedback verstärken Motivation und Selbstwirksamkeit",
              },
              {
                icon: "🎮",
                title: "Gamification & App",
                items: ["Schätze sammeln", "Level-System", "Fortschritt sichtbar", "Keine Extra-Aufgaben"],
                color: THEME.accent,
                evidence: "Gamification erhöht intrinsische Motivation und macht Lernen zu einer positiven Erfahrung",
              },
            ].map((pillar, i) => (
              <div
                key={i}
                className="pillar-card"
                style={{ ["--pillar-color" as string]: pillar.color }}
              >
                <div style={{ fontSize: 56, marginBottom: 20, textAlign: "center" }}>
                  {pillar.icon}
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: pillar.color, marginBottom: 20, textAlign: "center" }}>
                  {pillar.title}
                </h3>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px 0", display: "flex", flexDirection: "column", gap: 10 }}>
                  {pillar.items.map((item, j) => (
                    <li key={j} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, color: THEME.textStrong }}>
                      <Sparkle size={14} color={pillar.color} />
                      {item}
                    </li>
                  ))}
                </ul>
                <div style={{
                  padding: "12px 16px",
                  background: `${pillar.color}08`,
                  borderRadius: 12,
                  borderLeft: `3px solid ${pillar.color}`,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: THEME.textMuted, marginBottom: 6 }}>
                    WISSENSCHAFTLICHER HINTERGRUND
                  </div>
                  <div style={{ fontSize: 13, color: THEME.textMuted, lineHeight: 1.5 }}>
                    {pillar.evidence}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ */}
      {/* ÜBER MICH                                      */}
      {/* ══════════════════════════════════════════════ */}
      <section style={{ padding: "80px 24px", background: THEME.bgWhite }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>👋</div>
            <h2 style={sectionHeading}>Wer steckt dahinter?</h2>
          </div>

          <div style={{
            background: `linear-gradient(135deg, ${THEME.bg} 0%, ${THEME.bgWhite} 100%)`,
            borderRadius: 24,
            padding: 40,
            border: `2px solid ${THEME.border}`,
          }}>
            <h3 style={{ fontSize: 24, fontWeight: 800, color: THEME.dark, marginBottom: 20 }}>
              Sandra Störkel
            </h3>
            <p style={{ fontSize: 16, color: THEME.textStrong, lineHeight: 1.8, marginBottom: 24 }}>
              Ich bin Oberstudienrätin mit 20 Jahren Erfahrung am bayerischen Gymnasium. Nach meiner Lehrtätigkeit habe ich ein Data Science Bootcamp absolviert, wo ich mich intensiv mit Selbstwirksamkeitsforschung beschäftigt habe — insbesondere mit der Analyse von PISA-Daten und den Faktoren, die Lernerfolg wirklich beeinflussen.
            </p>
            <p style={{ fontSize: 16, color: THEME.textStrong, lineHeight: 1.8, marginBottom: 24 }}>
              Aus Neugier und Abenteuerlust bin ich mit meiner Familie für drei Jahre nach Malaysia gezogen. Dabei habe ich selbst erlebt, wie großartig es ist, die gewohnte Brille abzusetzen, Neues kennenzulernen — und zu spüren, wie sehr sich der eigene Horizont weitet, wenn man es einfach wagt.
            </p>
            <p style={{ fontSize: 16, color: THEME.textStrong, lineHeight: 1.8, marginBottom: 28 }}>
              Als Mutter von zwei Kindern kenne ich die alltäglichen Kämpfe, den Frust und die Sorgen aus eigener Erfahrung. Genau deshalb liegt mir diese Arbeit so am Herzen: Es begeistert mich zutiefst, Kindern Wege zu zeigen, wie sie ihre Potenziale entfalten können. Wenn ich erlebe, wie ein Kind plötzlich Selbstvertrauen gewinnt, wie es merkt „Das schaffe ich!" — und wie dadurch nicht nur die Noten besser werden, sondern sich die ganze Persönlichkeit entfaltet und der Familienalltag sich entspannt — dann weiß ich, dass es funktioniert.
            </p>

            {/* Expertise Tags */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {[
                "20 Jahre Gymnasium",
                "Data Science",
                "PISA-Forschung",
                "Hattie Visible Learning",
                "Bandura Self-Efficacy",
                "EdTech-Entwicklung",
              ].map((tag, i) => (
                <div key={i} style={{
                  padding: "8px 16px",
                  background: THEME.primaryBadge,
                  color: THEME.primary,
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 700,
                }}>
                  {tag}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ */}
      {/* CTA — Kontaktformular                         */}
      {/* ══════════════════════════════════════════════ */}
      <section id="kontakt" style={{
        padding: "100px 24px",
        background: `linear-gradient(135deg, ${THEME.dark} 0%, ${THEME.darkAlt} 100%)`,
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={dotPattern} />

        <div style={{ maxWidth: 650, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 900,
              color: "#fff",
              marginBottom: 16,
            }}>
              Bereit für das Gespräch?
            </h2>
            <p style={{ fontSize: 18, color: THEME.textOnDark, lineHeight: 1.7 }}>
              In einem kostenlosen, unverbindlichen Infogespräch besprechen wir, wie die Schatzkarte Ihrem Kind konkret helfen kann.
            </p>
          </div>

          <div style={{
            background: THEME.bgWhite,
            borderRadius: 24,
            padding: 40,
            boxShadow: "0 25px 60px rgba(0,0,0,.3)",
          }}>
            {formDone ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
                <h3 style={{ fontSize: 24, fontWeight: 800, color: THEME.primary, marginBottom: 12 }}>
                  Vielen Dank!
                </h3>
                <p style={{ color: THEME.textMuted, fontSize: 16, lineHeight: 1.7 }}>
                  Ihr E-Mail-Programm sollte sich geöffnet haben. Senden Sie die E-Mail ab und ich melde mich innerhalb von 24 Stunden bei Ihnen.
                </p>
              </div>
            ) : (
              <>
                <h3 style={{
                  textAlign: "center",
                  fontSize: 22,
                  fontWeight: 800,
                  color: THEME.dark,
                  marginBottom: 32,
                }}>
                  📬 Kostenloses Infogespräch buchen
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Ihr Name *"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    style={inputBase}
                  />
                  <input
                    className="form-input"
                    type="email"
                    placeholder="E-Mail-Adresse *"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    style={inputBase}
                  />
                  <select
                    className="form-input"
                    value={formKlasse}
                    onChange={(e) => setFormKlasse(e.target.value)}
                    style={{ ...inputBase, background: THEME.bgWhite }}
                  >
                    <option value="">Klassenstufe Ihres Kindes</option>
                    <option value="3.–4. Klasse">3.–4. Klasse</option>
                    <option value="5.–7. Klasse">5.–7. Klasse</option>
                    <option value="8.–10. Klasse">8.–10. Klasse</option>
                  </select>
                </div>

                <button
                  className="btn-cta"
                  onClick={handleFormSubmit}
                  disabled={!formValid}
                  style={{ marginTop: 24 }}
                >
                  Jetzt kostenlos Infogespräch buchen
                </button>

                <div style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 20,
                  marginTop: 20,
                  fontSize: 13,
                  color: THEME.textLight,
                }}>
                  <span>✓ 100% kostenlos</span>
                  <span>✓ Unverbindlich</span>
                  <span>✓ Antwort in 24h</span>
                </div>

                {/* WhatsApp Alternative */}
                <div style={{
                  marginTop: 28,
                  paddingTop: 24,
                  borderTop: `1px solid ${THEME.border}`,
                  textAlign: "center",
                }}>
                  <p style={{ fontSize: 14, color: THEME.textMuted, marginBottom: 14 }}>
                    Oder direkt per WhatsApp kontaktieren:
                  </p>
                  <a
                    className="btn-whatsapp"
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hallo Sandra! Ich interessiere mich für die Schatzkarte und würde gerne mehr erfahren.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    Per WhatsApp kontaktieren
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ */}
      {/* FOOTER                                        */}
      {/* ══════════════════════════════════════════════ */}
      <footer style={{ padding: "48px 24px", background: THEME.dark }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 32 }}>🗺️</span>
            <span style={{
              fontFamily: THEME.fontBrand,
              fontWeight: 800,
              fontSize: 22,
              color: THEME.primary,
            }}>
              Schatzkarte
            </span>
          </div>
          <p style={{ color: THEME.textLight, fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
            Lerncoaching für Schüler der Klassen 3–10<br />
            Wissenschaftlich fundiert. Spielerisch. In Beziehung.
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginBottom: 20 }}>
            {[...Array(5)].map((_, i) => (
              <Sparkle key={i} size={14} color={THEME.accent} />
            ))}
          </div>
          <p style={{ color: THEME.textMuted, fontSize: 13 }}>
            © 2025 Sandra Störkel · Impressum · Datenschutz
          </p>
        </div>
      </footer>
      </div>{/* Ende scrollbarer Inhalt */}

      {/* ══════════════════════════════════════════════ */}
      {/* ACTION BAR (immer sichtbar am unteren Rand)   */}
      {/* ══════════════════════════════════════════════ */}
      <div className="action-bar-fixed">
        <div className="bar-content">
          <button className="btn-demo-big" onClick={() => onGuestMode?.()}>
            <span>🎮</span>
            Demo testen
          </button>
          <a
            className="btn-whatsapp-big"
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hallo Sandra! Ich interessiere mich für die Schatzkarte.")}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

export { SchatzkarteLandingEltern };
