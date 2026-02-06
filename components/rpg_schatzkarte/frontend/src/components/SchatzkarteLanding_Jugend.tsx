import { useState } from "react";

// ═══════════════════════════════════════════════════════════════
// SCHATZKARTE LANDING PAGE — JUGENDVERSION (11-14 Jahre)
// ═══════════════════════════════════════════════════════════════
// Design: Modern, spielerisch, Cards, Icons, wenig Text
// Inspiration: Duolingo + Minecraft + Spotify
// Farben: Türkis #1FB6A6, Dunkelblau #1E2A44, Gold #F6C453, Lila #6B5DD3
// ═══════════════════════════════════════════════════════════════

interface Challenge {
  id: number;
  icon: string;
  title: string;
  subtitle: string;
  solution: string;
  color: string;
}

const CHALLENGES: Challenge[] = [
  {
    id: 1,
    icon: "😮‍💨",
    title: "Dauerstress?",
    subtitle: "Hausaufgaben, Tests, Druck...",
    solution: "Mit den richtigen Techniken lernst du schneller — und hast mehr Zeit für das, was dir Spaß macht! ⚡",
    color: "#1FB6A6",
  },
  {
    id: 2,
    icon: "🤔",
    title: "Verstehst du's nicht?",
    subtitle: "Komplizierter Stoff, keine Ahnung wie anfangen...",
    solution: "Du lernst Schritt für Schritt, was wirklich funktioniert. Kein Auswendiglernen, sondern verstehen! 🧠",
    color: "#6B5DD3",
  },
  {
    id: 3,
    icon: "😴",
    title: "Null Bock?",
    subtitle: "Lernen ist einfach langweilig...",
    solution: "Lerne wie in einem Game — mit Levels, Schätzen und Erfolgen. Macht echt Spaß! 🎮",
    color: "#F6C453",
  },
  {
    id: 4,
    icon: "😰",
    title: "Angst vor Tests?",
    subtitle: "Blackout, Panik, schlechte Noten...",
    solution: "Wenn du weißt WIE man lernt, hast du Selbstvertrauen — und die Angst verschwindet! 💪",
    color: "#1FB6A6",
  },
];

const CONTACT_EMAIL = "sandra.stoerkel@web.de";
const WHATSAPP_NUMBER = "60172904521";

interface SparkleProps {
  size?: number;
  color?: string;
}

function Sparkle({ size = 16, color = "#F6C453" }: SparkleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ flexShrink: 0 }}>
      <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" />
    </svg>
  );
}

interface SchatzkarteLandingJugendProps {
  onGuestMode?: () => void;
}

export default function SchatzkarteLandingJugend({ onGuestMode }: SchatzkarteLandingJugendProps) {
  const [activeChallenge, setActiveChallenge] = useState<number | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formKlasse, setFormKlasse] = useState("");
  const [formDone, setFormDone] = useState(false);

  const handleFormSubmit = () => {
    const subject = encodeURIComponent(`Schatzkarte-Interesse: ${formName}`);
    const body = encodeURIComponent(
      `Hey Sandra!\n\n` +
      `Name: ${formName}\n` +
      `E-Mail: ${formEmail}\n` +
      `Klasse: ${formKlasse || "Nicht angegeben"}\n\n` +
      `Ich will mehr über die Schatzkarte erfahren!`
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setFormDone(true);
  };

  return (
    <div style={{
      background: "linear-gradient(180deg, #1E2A44 0%, #2B3A5C 100%)",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      color: "#F7F9FC",
    }}>

      {/* ══════════════════════════════════════════════ */}
      {/* HERO — Kurz, knackig, visuell                 */}
      {/* ══════════════════════════════════════════════ */}
      <section style={{
        padding: "80px 24px 100px",
        background: "linear-gradient(135deg, #1E2A44 0%, #2B3A5C 50%, #1FB6A6 100%)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Schatzkarten-Muster im Hintergrund */}
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(rgba(31,182,166,.08) 2px, transparent 2px)",
          backgroundSize: "32px 32px",
          pointerEvents: "none",
        }} />
        
        <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 2 }}>
          {/* Logo */}
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            gap: 12, 
            marginBottom: 48 
          }}>
            <span style={{ fontSize: 48 }}>🗺️</span>
            <h1 style={{ 
              fontFamily: "'Fraunces', serif", 
              fontSize: 42, 
              fontWeight: 800,
              background: "linear-gradient(135deg, #F6C453 0%, #1FB6A6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              margin: 0,
            }}>
              Schatzkarte
            </h1>
          </div>

          {/* Headline */}
          <h2 style={{
            textAlign: "center",
            fontSize: "clamp(32px, 6vw, 56px)",
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: 24,
            color: "#fff",
          }}>
            Lernen wie ein<br />
            <span style={{
              background: "linear-gradient(135deg, #F6C453 0%, #1FB6A6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Level-Up! 🚀
            </span>
          </h2>

          {/* Subheadline */}
          <p style={{
            textAlign: "center",
            fontSize: 20,
            lineHeight: 1.6,
            color: "#D1D5DB",
            maxWidth: 600,
            margin: "0 auto 48px",
          }}>
            Lerne <strong style={{ color: "#F6C453" }}>schneller</strong>, <strong style={{ color: "#1FB6A6" }}>besser</strong> und <strong style={{ color: "#6B5DD3" }}>mit mehr Spaß</strong> — und hab endlich wieder Zeit für das, was dir wichtig ist!
          </p>

          {/* CTA Buttons */}
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            justifyContent: "center",
            marginBottom: 64,
          }}>
            <button
              onClick={() => onGuestMode?.()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "16px 32px",
                borderRadius: 50,
                background: "linear-gradient(135deg, #F6C453 0%, #F59E0B 100%)",
                color: "#1E2A44",
                fontSize: 18,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                boxShadow: "0 8px 24px rgba(246,196,83,.35)",
                transition: "all .3s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(246,196,83,.5)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(246,196,83,.35)";
              }}
            >
              <Sparkle size={20} color="#1E2A44" />
              Starte deine Schatzreise
            </button>
            
            <a
              href="#challenges"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "16px 32px",
                borderRadius: 50,
                background: "transparent",
                border: "2px solid #1FB6A6",
                color: "#1FB6A6",
                fontSize: 18,
                fontWeight: 700,
                textDecoration: "none",
                transition: "all .3s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "#1FB6A6";
                e.currentTarget.style.color = "#1E2A44";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#1FB6A6";
              }}
            >
              Mehr erfahren 🎯
            </a>
          </div>

          {/* Decorative Sparkles */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
          }}>
            {[...Array(5)].map((_, i) => (
              <Sparkle key={i} size={20} color="#F6C453" />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ */}
      {/* CHALLENGES — Kennst du das?                   */}
      {/* ══════════════════════════════════════════════ */}
      <section id="challenges" style={{
        padding: "80px 24px",
        background: "#F7F9FC",
      }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 900,
              color: "#1E2A44",
              marginBottom: 16,
            }}>
              Kennst du das? 🤔
            </h2>
            <p style={{
              fontSize: 18,
              color: "#6B7280",
              maxWidth: 600,
              margin: "0 auto",
            }}>
              Klick auf eine Karte und finde raus, wie die Schatzkarte dir hilft!
            </p>
          </div>

          {/* Challenge Cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
          }}>
            {CHALLENGES.map((ch) => (
              <div
                key={ch.id}
                onClick={() => setActiveChallenge(activeChallenge === ch.id ? null : ch.id)}
                style={{
                  background: "#fff",
                  borderRadius: 20,
                  padding: 28,
                  cursor: "pointer",
                  border: activeChallenge === ch.id 
                    ? `3px solid ${ch.color}` 
                    : "3px solid transparent",
                  boxShadow: activeChallenge === ch.id
                    ? `0 12px 32px ${ch.color}40`
                    : "0 4px 12px rgba(0,0,0,.08)",
                  transition: "all .3s ease",
                  transform: activeChallenge === ch.id ? "translateY(-4px)" : "translateY(0)",
                }}
                onMouseOver={(e) => {
                  if (activeChallenge !== ch.id) {
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,.12)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }
                }}
                onMouseOut={(e) => {
                  if (activeChallenge !== ch.id) {
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,.08)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 16, textAlign: "center" }}>
                  {ch.icon}
                </div>
                <h3 style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: "#1E2A44",
                  marginBottom: 8,
                  textAlign: "center",
                }}>
                  {ch.title}
                </h3>
                <p style={{
                  fontSize: 15,
                  color: "#6B7280",
                  marginBottom: 16,
                  textAlign: "center",
                }}>
                  {ch.subtitle}
                </p>

                {/* Lösung */}
                {activeChallenge === ch.id && (
                  <div style={{
                    marginTop: 20,
                    paddingTop: 20,
                    borderTop: `2px solid ${ch.color}`,
                    animation: "fadeIn .3s ease",
                  }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 12,
                    }}>
                      <Sparkle size={20} color={ch.color} />
                      <span style={{ 
                        fontSize: 16, 
                        fontWeight: 700, 
                        color: ch.color 
                      }}>
                        Die Lösung:
                      </span>
                    </div>
                    <p style={{
                      fontSize: 15,
                      color: "#374151",
                      lineHeight: 1.6,
                      margin: 0,
                    }}>
                      {ch.solution}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ */}
      {/* WAS IST DAS? — Vorher/Nachher Split           */}
      {/* ══════════════════════════════════════════════ */}
      <section id="was-ist-das" style={{
        padding: "80px 24px",
        background: "linear-gradient(135deg, #1E2A44 0%, #2B3A5C 100%)",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{
            textAlign: "center",
            fontSize: "clamp(32px, 5vw, 48px)",
            fontWeight: 900,
            color: "#fff",
            marginBottom: 16,
          }}>
            Klassisch vs. Schatzkarte 🔄
          </h2>
          <p style={{
            textAlign: "center",
            fontSize: 18,
            color: "#D1D5DB",
            marginBottom: 56,
            maxWidth: 700,
            margin: "0 auto 56px",
          }}>
            So war's früher — so ist's mit der Schatzkarte!
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 32,
          }}>
            {/* Links: Klassisch */}
            <div style={{
              background: "rgba(107,114,128,.15)",
              borderRadius: 20,
              padding: 32,
              border: "2px solid rgba(107,114,128,.3)",
            }}>
              <div style={{ 
                fontSize: 48, 
                marginBottom: 20, 
                textAlign: "center",
                filter: "grayscale(100%)",
              }}>
                ❌
              </div>
              <h3 style={{
                fontSize: 24,
                fontWeight: 800,
                color: "#9CA3AF",
                marginBottom: 24,
                textAlign: "center",
              }}>
                Klassisches Lernen
              </h3>
              <ul style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}>
                {[
                  "Einfach nur auswendig lernen",
                  "Alleine am Schreibtisch sitzen",
                  "Keine Ahnung, was wirklich hilft",
                  "Stress und schlechtes Gewissen",
                ].map((item, i) => (
                  <li key={i} style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    color: "#9CA3AF",
                    fontSize: 16,
                  }}>
                    <span style={{ 
                      fontSize: 20, 
                      flexShrink: 0,
                      filter: "grayscale(100%)",
                    }}>
                      ⛔
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Rechts: Schatzkarte */}
            <div style={{
              background: "linear-gradient(135deg, rgba(31,182,166,.2) 0%, rgba(107,93,211,.2) 100%)",
              borderRadius: 20,
              padding: 32,
              border: "2px solid #1FB6A6",
              boxShadow: "0 12px 32px rgba(31,182,166,.25)",
            }}>
              <div style={{ fontSize: 48, marginBottom: 20, textAlign: "center" }}>
                ✨
              </div>
              <h3 style={{
                fontSize: 24,
                fontWeight: 800,
                color: "#F6C453",
                marginBottom: 24,
                textAlign: "center",
              }}>
                Schatzkarten-Lernen
              </h3>
              <ul style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}>
                {[
                  { icon: "🧠", text: "Lerntechniken, die wirklich klappen" },
                  { icon: "👥", text: "Zusammen mit anderen Schülern" },
                  { icon: "🎮", text: "Spielerisch wie in einem Game" },
                  { icon: "⚡", text: "Schneller fertig, mehr Freizeit" },
                ].map((item, i) => (
                  <li key={i} style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    color: "#F7F9FC",
                    fontSize: 16,
                  }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>
                      {item.icon}
                    </span>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ */}
      {/* KEINE EXTRA-ARBEIT — 3 Kacheln                */}
      {/* ══════════════════════════════════════════════ */}
      <section style={{
        padding: "80px 24px",
        background: "#F7F9FC",
      }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h2 style={{
            textAlign: "center",
            fontSize: "clamp(32px, 5vw, 48px)",
            fontWeight: 900,
            color: "#1E2A44",
            marginBottom: 16,
          }}>
            Das Beste daran? 🎁
          </h2>
          <p style={{
            textAlign: "center",
            fontSize: 18,
            color: "#6B7280",
            marginBottom: 56,
            maxWidth: 600,
            margin: "0 auto 56px",
          }}>
            Kein extra Lernstoff — du nutzt einfach, was du eh für die Schule machen musst!
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
          }}>
            {[
              {
                icon: "⏱️",
                title: "Kein Mehraufwand",
                text: "Lerne für die Schule — aber richtig!",
                color: "#1FB6A6",
              },
              {
                icon: "🎒",
                title: "Passt zum Schulstoff",
                text: "Nutze deine Hausaufgaben & Tests!",
                color: "#6B5DD3",
              },
              {
                icon: "🧠",
                title: "Lernen ohne Druck",
                text: "Verstehen statt auswendig lernen!",
                color: "#F6C453",
              },
            ].map((card, i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  borderRadius: 20,
                  padding: 32,
                  textAlign: "center",
                  border: "2px solid #E5E7EB",
                  boxShadow: "0 4px 12px rgba(0,0,0,.06)",
                  transition: "all .3s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
                  e.currentTarget.style.boxShadow = `0 12px 32px ${card.color}40`;
                  e.currentTarget.style.borderColor = card.color;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,.06)";
                  e.currentTarget.style.borderColor = "#E5E7EB";
                }}
              >
                <div style={{ 
                  fontSize: 56, 
                  marginBottom: 20,
                  filter: `drop-shadow(0 4px 12px ${card.color}60)`,
                }}>
                  {card.icon}
                </div>
                <h3 style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: card.color,
                  marginBottom: 12,
                }}>
                  {card.title}
                </h3>
                <p style={{
                  fontSize: 16,
                  color: "#6B7280",
                  lineHeight: 1.6,
                  margin: 0,
                }}>
                  {card.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ */}
      {/* WIE FUNKTIONIERT'S? — Timeline                */}
      {/* ══════════════════════════════════════════════ */}
      <section style={{
        padding: "80px 24px",
        background: "linear-gradient(135deg, #6B5DD3 0%, #8B7DD8 100%)",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(rgba(255,255,255,.08) 2px, transparent 2px)",
          backgroundSize: "32px 32px",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <h2 style={{
            textAlign: "center",
            fontSize: "clamp(32px, 5vw, 48px)",
            fontWeight: 900,
            color: "#fff",
            marginBottom: 16,
          }}>
            Dein Lernweg 🗺️
          </h2>
          <p style={{
            textAlign: "center",
            fontSize: 18,
            color: "rgba(255,255,255,.85)",
            marginBottom: 64,
            maxWidth: 600,
            margin: "0 auto 64px",
          }}>
            So einfach geht's — Schritt für Schritt zum Lernerfolg!
          </p>

          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: 32,
          }}>
            {[
              {
                step: "1",
                icon: "🔍",
                title: "Entdecken",
                text: "Lerne coole Lerntechniken kennen (Pomodoro, Active Recall, Feynman...)",
              },
              {
                step: "2",
                icon: "🎯",
                title: "Üben",
                text: "Wende sie auf deinen echten Schulstoff an — keine Extra-Aufgaben!",
              },
              {
                step: "3",
                icon: "💬",
                title: "Austauschen",
                text: "Teile Erfolge mit anderen Schülern, bekomme Tipps vom Coach!",
              },
              {
                step: "4",
                icon: "⭐",
                title: "Erfolg feiern",
                text: "Sammle Schätze, steige auf im Level — und merk, wie's besser klappt!",
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 24,
                  background: "rgba(255,255,255,.15)",
                  borderRadius: 20,
                  padding: 24,
                  backdropFilter: "blur(10px)",
                  border: "2px solid rgba(255,255,255,.2)",
                }}
              >
                {/* Step Number */}
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #F6C453 0%, #F59E0B 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  fontWeight: 900,
                  color: "#1E2A44",
                  flexShrink: 0,
                  boxShadow: "0 4px 16px rgba(246,196,83,.4)",
                }}>
                  {item.step}
                </div>

                {/* Icon */}
                <div style={{
                  fontSize: 48,
                  flexShrink: 0,
                }}>
                  {item.icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#fff",
                    marginBottom: 8,
                  }}>
                    {item.title}
                  </h3>
                  <p style={{
                    fontSize: 16,
                    color: "rgba(255,255,255,.85)",
                    margin: 0,
                    lineHeight: 1.5,
                  }}>
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ */}
      {/* COMMUNITY — Chat Bubbles Style                */}
      {/* ══════════════════════════════════════════════ */}
      <section style={{
        padding: "80px 24px",
        background: "#F7F9FC",
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{
            textAlign: "center",
            fontSize: "clamp(32px, 5vw, 48px)",
            fontWeight: 900,
            color: "#1E2A44",
            marginBottom: 16,
          }}>
            Du bist nicht alleine! 👥
          </h2>
          <p style={{
            textAlign: "center",
            fontSize: 18,
            color: "#6B7280",
            marginBottom: 56,
          }}>
            Lerne zusammen mit anderen — per Chat, in der Gruppe, in der App!
          </p>

          {/* Chat Bubbles */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}>
            {/* Chat */}
            <div style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
            }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "#1FB6A6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                flexShrink: 0,
              }}>
                💬
              </div>
              <div style={{
                flex: 1,
                background: "#1FB6A6",
                color: "#fff",
                padding: "16px 20px",
                borderRadius: "20px 20px 20px 4px",
                boxShadow: "0 4px 12px rgba(31,182,166,.2)",
              }}>
                <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 14 }}>
                  Chat
                </div>
                <div style={{ fontSize: 15, lineHeight: 1.5 }}>
                  Stelle Fragen, teile Erfolge, hole dir Tipps!
                </div>
              </div>
            </div>

            {/* Gruppe */}
            <div style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              flexDirection: "row-reverse",
            }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "#6B5DD3",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                flexShrink: 0,
              }}>
                👥
              </div>
              <div style={{
                flex: 1,
                background: "#6B5DD3",
                color: "#fff",
                padding: "16px 20px",
                borderRadius: "20px 20px 4px 20px",
                boxShadow: "0 4px 12px rgba(107,93,211,.2)",
              }}>
                <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 14 }}>
                  Lerngruppe
                </div>
                <div style={{ fontSize: 15, lineHeight: 1.5 }}>
                  Gemeinsam lernen macht mehr Spaß — und du bleibst dran!
                </div>
              </div>
            </div>

            {/* App */}
            <div style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
            }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "#F6C453",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                flexShrink: 0,
              }}>
                📱
              </div>
              <div style={{
                flex: 1,
                background: "#F6C453",
                color: "#1E2A44",
                padding: "16px 20px",
                borderRadius: "20px 20px 20px 4px",
                boxShadow: "0 4px 12px rgba(246,196,83,.2)",
              }}>
                <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 14 }}>
                  Schatzkarte-App
                </div>
                <div style={{ fontSize: 15, lineHeight: 1.5 }}>
                  Alle Techniken, Aufgaben und Schätze immer dabei — auf dem Tablet!
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ */}
      {/* CTA — Für Jugendliche                         */}
      {/* ══════════════════════════════════════════════ */}
      <section style={{
        padding: "100px 24px",
        background: "linear-gradient(135deg, #1FB6A6 0%, #059669 100%)",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(rgba(255,255,255,.08) 2px, transparent 2px)",
          backgroundSize: "32px 32px",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 600, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🚀</div>
            <h2 style={{
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 900,
              color: "#fff",
              marginBottom: 16,
            }}>
              Bereit loszulegen?
            </h2>
            <p style={{
              fontSize: 18,
              color: "rgba(255,255,255,.9)",
              lineHeight: 1.6,
            }}>
              Frag deine Eltern, ob sie ein kostenloses Infogespräch buchen können — oder schick ihnen einfach den Link!
            </p>
          </div>

          <div style={{
            background: "#fff",
            borderRadius: 24,
            padding: 36,
            boxShadow: "0 25px 60px rgba(0,0,0,.25)",
          }}>
            {formDone ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
                <h3 style={{ fontSize: 24, fontWeight: 800, color: "#1FB6A6", marginBottom: 8 }}>
                  Super! 🎉
                </h3>
                <p style={{ color: "#6B7280", fontSize: 16 }}>
                  Dein E-Mail-Programm müsste sich öffnen. Schick die Mail ab und wir melden uns bei deinen Eltern!
                </p>
              </div>
            ) : (
              <>
                <h3 style={{
                  textAlign: "center",
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#1E2A44",
                  marginBottom: 28,
                }}>
                  📧 Infos anfordern
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <input
                    type="text"
                    placeholder="Dein Name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    style={{
                      padding: "16px 20px",
                      border: "2px solid #E5E7EB",
                      borderRadius: 12,
                      fontSize: 16,
                      outline: "none",
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = "#1FB6A6"}
                    onBlur={(e) => e.currentTarget.style.borderColor = "#E5E7EB"}
                  />
                  <input
                    type="email"
                    placeholder="E-Mail deiner Eltern"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    style={{
                      padding: "16px 20px",
                      border: "2px solid #E5E7EB",
                      borderRadius: 12,
                      fontSize: 16,
                      outline: "none",
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = "#1FB6A6"}
                    onBlur={(e) => e.currentTarget.style.borderColor = "#E5E7EB"}
                  />
                  <select
                    value={formKlasse}
                    onChange={(e) => setFormKlasse(e.target.value)}
                    style={{
                      padding: "16px 20px",
                      border: "2px solid #E5E7EB",
                      borderRadius: 12,
                      fontSize: 16,
                      background: "#fff",
                      outline: "none",
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = "#1FB6A6"}
                    onBlur={(e) => e.currentTarget.style.borderColor = "#E5E7EB"}
                  >
                    <option value="">In welcher Klasse bist du?</option>
                    <option value="3.–4. Klasse">3.–4. Klasse</option>
                    <option value="5.–7. Klasse">5.–7. Klasse</option>
                    <option value="8.–10. Klasse">8.–10. Klasse</option>
                  </select>
                </div>

                <button
                  onClick={handleFormSubmit}
                  disabled={!formName || !formEmail}
                  style={{
                    marginTop: 24,
                    width: "100%",
                    padding: "18px",
                    borderRadius: 50,
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#fff",
                    border: "none",
                    cursor: (!formName || !formEmail) ? "not-allowed" : "pointer",
                    background: (!formName || !formEmail)
                      ? "#9CA3AF"
                      : "linear-gradient(135deg, #F6C453 0%, #F59E0B 100%)",
                    boxShadow: (!formName || !formEmail)
                      ? "none"
                      : "0 8px 24px rgba(246,196,83,.4)",
                    transition: "all .3s ease",
                  }}
                  onMouseOver={(e) => {
                    if (formName && formEmail) {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 12px 32px rgba(246,196,83,.5)";
                    }
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = formName && formEmail 
                      ? "0 8px 24px rgba(246,196,83,.4)" 
                      : "none";
                  }}
                >
                  Infos anfordern 🚀
                </button>

                <p style={{
                  textAlign: "center",
                  fontSize: 13,
                  color: "#9CA3AF",
                  marginTop: 16,
                }}>
                  100% kostenlos · Keine Verpflichtung
                </p>

                {/* WhatsApp */}
                <div style={{
                  marginTop: 24,
                  paddingTop: 20,
                  borderTop: "1px solid #E5E7EB",
                  textAlign: "center",
                }}>
                  <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 12 }}>
                    Oder direkt per WhatsApp:
                  </p>
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hey Sandra! Ich interessiere mich für die Schatzkarte!")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      background: "#25D366",
                      color: "#fff",
                      padding: "12px 24px",
                      borderRadius: 30,
                      fontSize: 14,
                      fontWeight: 700,
                      textDecoration: "none",
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
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    Schreib mir!
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
      <footer style={{
        padding: "48px 24px",
        background: "#1E2A44",
      }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            marginBottom: 16,
          }}>
            <span style={{ fontSize: 28 }}>🗺️</span>
            <span style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 800,
              fontSize: 20,
              color: "#1FB6A6",
            }}>
              Schatzkarte
            </span>
          </div>
          <p style={{ color: "#9CA3AF", fontSize: 14, marginBottom: 20 }}>
            Lerncoaching für Schüler der Klassen 3–10<br />
            Wissenschaftlich fundiert. Spielerisch. Gemeinsam.
          </p>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            marginBottom: 16,
          }}>
            {[...Array(5)].map((_, i) => (
              <Sparkle key={i} size={14} color="#F6C453" />
            ))}
          </div>
          <p style={{ color: "#6B7280", fontSize: 13 }}>
            © 2025 Sandra Störkel · Impressum · Datenschutz
          </p>
        </div>
      </footer>

      {/* Inline Keyframes */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export { SchatzkarteLandingJugend };
