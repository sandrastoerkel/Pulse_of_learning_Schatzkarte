import { useState } from 'react';

// =============================================
// VERSION B: PREMIUM MINIMAL
// =============================================
// Komplett überarbeitet für High-End Feel:
// - Serif-Headline Font (Cormorant Garamond)
// - Sehr viel Weißraum
// - Gedämpfte, elegante Farbpalette
// - Subtile Animationen
// - Editorial/Magazin-Ästhetik
// =============================================

// Elegante Icon-Komponenten
const ShieldIcon = () => (
  <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
    <path d="M28 4L48 12V28C48 40 38 50 28 52C18 50 8 40 8 28V12L28 4Z" 
      stroke="#1a1a1a" strokeWidth="1.5" fill="none" />
    <path d="M28 18C28 15 24 13 21 16C18 19 18 23 28 32C38 23 38 19 35 16C32 13 28 15 28 18Z" 
      fill="#1a1a1a" opacity="0.15" />
  </svg>
);

const BrainIcon = () => (
  <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
    <ellipse cx="22" cy="28" rx="10" ry="14" stroke="#1a1a1a" strokeWidth="1.5" fill="none" />
    <ellipse cx="34" cy="28" rx="10" ry="14" stroke="#1a1a1a" strokeWidth="1.5" fill="none" />
    <circle cx="28" cy="24" r="3" fill="#1a1a1a" opacity="0.15" />
    <circle cx="20" cy="22" r="2" fill="#1a1a1a" opacity="0.1" />
    <circle cx="36" cy="22" r="2" fill="#1a1a1a" opacity="0.1" />
  </svg>
);

const StarIcon = () => (
  <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
    <path d="M28 8L31 20H44L33 28L36 40L28 32L20 40L23 28L12 20H25L28 8Z" 
      stroke="#1a1a1a" strokeWidth="1.5" fill="none" />
    <circle cx="28" cy="24" r="4" fill="#1a1a1a" opacity="0.1" />
  </svg>
);

export default function VersionBPremiumMinimal({ onClose }: { onClose?: () => void }) {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  const styles = {
    page: {
      fontFamily: "'Inter', system-ui, sans-serif",
      color: '#1a1a1a',
      background: '#fafafa',
      lineHeight: 1.7,
      fontSize: '17px'
    },
    serif: {
      fontFamily: "'Cormorant Garamond', Georgia, serif"
    }
  };

  return (
    <div style={styles.page}>
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      
      {/* Custom Styles */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeInUp 0.8s ease-out forwards; }
        .delay-1 { animation-delay: 0.1s; opacity: 0; }
        .delay-2 { animation-delay: 0.2s; opacity: 0; }
        .delay-3 { animation-delay: 0.3s; opacity: 0; }
        .premium-btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .premium-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.12);
        }
      `}</style>

      {/* NAVIGATION - Ultra Minimal */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        padding: '28px 48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(250, 250, 250, 0.9)',
        backdropFilter: 'blur(20px)',
        zIndex: 100
      }}>
        <div style={{
          ...styles.serif,
          fontSize: '1.6rem',
          fontWeight: 600,
          letterSpacing: '-0.02em'
        }}>
          Pulse
        </div>
        <button className="premium-btn" style={{
          background: '#1a1a1a',
          color: '#fff',
          padding: '14px 32px',
          borderRadius: '4px',
          border: 'none',
          fontSize: '0.9rem',
          fontWeight: 500,
          letterSpacing: '0.02em',
          cursor: 'pointer'
        }}>
          Gespräch buchen
        </button>
      </nav>

      {/* HERO - Editorial Style */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '160px 48px 120px',
        background: '#fafafa'
      }}>
        <div style={{ maxWidth: '900px', textAlign: 'center' }}>
          {/* Small Label */}
          <p className="fade-in delay-1" style={{
            fontSize: '0.85rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#888',
            marginBottom: '32px'
          }}>
            Wissenschaftlich fundiertes Lerncoaching
          </p>

          {/* Main Headline */}
          <h1 className="fade-in delay-2" style={{
            ...styles.serif,
            fontSize: 'clamp(3rem, 7vw, 5rem)',
            fontWeight: 500,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            marginBottom: '40px',
            color: '#1a1a1a'
          }}>
            Lernen, das bleibt.
          </h1>

          {/* Subtitle */}
          <p className="fade-in delay-3" style={{
            fontSize: '1.25rem',
            color: '#666',
            maxWidth: '550px',
            margin: '0 auto 56px',
            fontWeight: 300,
            lineHeight: 1.8
          }}>
            Ihr Kind entwickelt in 8 Wochen nachhaltige Lernstrategien – 
            basierend auf der Forschung von Hattie, Bandura & Birkenbihl.
          </p>

          {/* CTA */}
          <button className="premium-btn fade-in" style={{
            background: '#1a1a1a',
            color: '#fff',
            padding: '20px 48px',
            borderRadius: '4px',
            border: 'none',
            fontSize: '1rem',
            fontWeight: 500,
            cursor: 'pointer',
            animationDelay: '0.4s',
            opacity: 0
          }}>
            Kostenloses Erstgespräch vereinbaren
          </button>
        </div>
      </section>

      {/* CREDENTIALS - Horizontal Strip */}
      <section style={{
        padding: '60px 48px',
        background: '#fff',
        borderTop: '1px solid #eee',
        borderBottom: '1px solid #eee'
      }}>
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'center',
          gap: '80px',
          flexWrap: 'wrap'
        }}>
          {[
            { num: '20+', label: 'Jahre Lehrerfahrung' },
            { num: '400M', label: 'Schüler erforscht (Hattie)' },
            { num: '8', label: 'Wochen Programm' }
          ].map((item, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{
                ...styles.serif,
                fontSize: '2.5rem',
                fontWeight: 500,
                color: '#1a1a1a',
                letterSpacing: '-0.02em'
              }}>{item.num}</div>
              <div style={{
                fontSize: '0.85rem',
                color: '#888',
                letterSpacing: '0.05em',
                marginTop: '8px'
              }}>{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PROBLEM - Full Width Text */}
      <section style={{
        padding: '140px 48px',
        background: '#fafafa'
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <p style={{
            fontSize: '0.85rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#888',
            marginBottom: '24px'
          }}>
            Das Problem
          </p>
          <h2 style={{
            ...styles.serif,
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            fontWeight: 500,
            lineHeight: 1.3,
            color: '#1a1a1a',
            marginBottom: '40px'
          }}>
            Stundenlang lernen, kaum Ergebnis. Prüfungsangst. 
            Verlorenes Potential.
          </h2>
          <p style={{
            fontSize: '1.15rem',
            color: '#666',
            lineHeight: 1.9
          }}>
            Die Schule lehrt Inhalte – aber nicht, wie das Gehirn tatsächlich 
            lernt. Das Ergebnis: Kinder, die sich abrackern, ohne Fortschritt 
            zu sehen. Eltern, die nicht wissen, wie sie helfen können.
          </p>
        </div>
      </section>

      {/* SOLUTION - 3 Pillars */}
      <section style={{
        padding: '140px 48px',
        background: '#fff'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '100px' }}>
            <p style={{
              fontSize: '0.85rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#888',
              marginBottom: '24px'
            }}>
              Die Methode
            </p>
            <h2 style={{
              ...styles.serif,
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 500,
              color: '#1a1a1a'
            }}>
              Drei Säulen für nachhaltigen Erfolg
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '60px'
          }}>
            {[
              {
                icon: <ShieldIcon />,
                title: 'Selbstvertrauen',
                desc: 'Echte Selbstwirksamkeit entwickeln. Wer an sich glaubt, lernt besser.',
                source: 'Bandura'
              },
              {
                icon: <BrainIcon />,
                title: 'Gehirngerecht',
                desc: 'Methoden, die mit dem Gehirn arbeiten – nicht gegen es.',
                source: 'Hattie · Birkenbihl'
              },
              {
                icon: <StarIcon />,
                title: 'Motivation',
                desc: 'Intrinsische Motivation durch Erfolge und spielerische Elemente.',
                source: 'Gamification'
              }
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: '32px', opacity: 0.9 }}>{item.icon}</div>
                <h3 style={{
                  ...styles.serif,
                  fontSize: '1.6rem',
                  fontWeight: 500,
                  marginBottom: '16px',
                  color: '#1a1a1a'
                }}>{item.title}</h3>
                <p style={{
                  color: '#666',
                  lineHeight: 1.8,
                  marginBottom: '20px'
                }}>{item.desc}</p>
                <span style={{
                  fontSize: '0.8rem',
                  color: '#aaa',
                  letterSpacing: '0.05em'
                }}>{item.source}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS - Numbered Steps */}
      <section style={{
        padding: '140px 48px',
        background: '#f5f5f5'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <p style={{
              fontSize: '0.85rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#888',
              marginBottom: '24px'
            }}>
              Das Programm
            </p>
            <h2 style={{
              ...styles.serif,
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 500,
              color: '#1a1a1a'
            }}>
              So begleite ich Ihr Kind
            </h2>
          </div>

          {[
            {
              num: '01',
              title: 'Live-Kleingruppen',
              desc: 'Zweimal pro Woche treffen sich bis zu 8 Kinder in interaktiven Video-Sessions. Hier werden Lerntechniken aktiv eingeübt.'
            },
            {
              num: '02',
              title: 'Die Schatzkarte',
              desc: 'Eine spielerische Lernwelt, in der Ihr Kind eigenständig übt – mit Challenges, XP-Punkten und sichtbaren Fortschritten.'
            },
            {
              num: '03',
              title: 'Eltern-Begleitung',
              desc: 'Exklusive Workshops zeigen Ihnen, wie Sie optimal unterstützen – ohne Druck, mit den richtigen Strategien.'
            }
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex',
              gap: '40px',
              marginBottom: i < 2 ? '60px' : 0,
              paddingBottom: i < 2 ? '60px' : 0,
              borderBottom: i < 2 ? '1px solid #e0e0e0' : 'none'
            }}>
              <div style={{
                ...styles.serif,
                fontSize: '3rem',
                fontWeight: 400,
                color: '#ddd',
                lineHeight: 1
              }}>{item.num}</div>
              <div>
                <h3 style={{
                  ...styles.serif,
                  fontSize: '1.5rem',
                  fontWeight: 500,
                  marginBottom: '12px',
                  color: '#1a1a1a'
                }}>{item.title}</h3>
                <p style={{ color: '#666', lineHeight: 1.8 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIAL - Single Quote */}
      <section style={{
        padding: '140px 48px',
        background: '#fff'
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            ...styles.serif,
            fontSize: '4rem',
            color: '#eee',
            marginBottom: '24px'
          }}>"</div>
          <blockquote style={{
            ...styles.serif,
            fontSize: 'clamp(1.4rem, 3vw, 2rem)',
            fontWeight: 400,
            lineHeight: 1.6,
            color: '#1a1a1a',
            fontStyle: 'italic',
            marginBottom: '40px'
          }}>
            Endlich versteht meine Tochter, wie sie effektiv lernen kann. 
            Der Stress vor Klassenarbeiten ist deutlich weniger geworden.
          </blockquote>
          <p style={{ color: '#888', fontSize: '0.95rem' }}>
            — Mutter von Lisa, 12 Jahre
          </p>
        </div>
      </section>

      {/* TARGET AUDIENCE */}
      <section style={{
        padding: '100px 48px',
        background: '#fafafa',
        textAlign: 'center'
      }}>
        <p style={{
          fontSize: '0.85rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: '#888',
          marginBottom: '24px'
        }}>
          Für wen
        </p>
        <h2 style={{
          ...styles.serif,
          fontSize: '2rem',
          fontWeight: 500,
          color: '#1a1a1a',
          marginBottom: '40px'
        }}>
          Schüler von Klasse 3 bis 10
        </h2>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '24px',
          flexWrap: 'wrap'
        }}>
          {['Grundschule', 'Realschule', 'Gymnasium', 'Gesamtschule'].map((s, i) => (
            <span key={i} style={{
              padding: '12px 28px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '0.9rem',
              color: '#666'
            }}>{s}</span>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section style={{
        padding: '140px 48px',
        background: '#1a1a1a',
        color: '#fff'
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{
              ...styles.serif,
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 500,
              marginBottom: '24px',
              color: '#fff'
            }}>
              Bereit für den ersten Schritt?
            </h2>
            <p style={{ color: '#999', fontSize: '1.1rem' }}>
              Kostenloses Erstgespräch – unverbindlich und ohne Druck.
            </p>
          </div>

          <div style={{
            background: '#fff',
            borderRadius: '8px',
            padding: '48px'
          }}>
            {formSubmitted ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>✓</div>
                <h3 style={{
                  ...styles.serif,
                  fontSize: '1.8rem',
                  color: '#1a1a1a',
                  marginBottom: '12px'
                }}>Vielen Dank</h3>
                <p style={{ color: '#666' }}>Ich melde mich innerhalb von 24 Stunden bei Ihnen.</p>
              </div>
            ) : (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <input type="text" placeholder="Ihr Name" style={{
                    padding: '18px 20px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    color: '#1a1a1a'
                  }} />
                  <input type="email" placeholder="E-Mail-Adresse" style={{
                    padding: '18px 20px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    color: '#1a1a1a'
                  }} />
                </div>
                <select style={{
                  width: '100%',
                  padding: '18px 20px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  color: '#1a1a1a',
                  background: '#fff',
                  marginBottom: '24px'
                }}>
                  <option>Klassenstufe Ihres Kindes</option>
                  <option>Klasse 3–4</option>
                  <option>Klasse 5–7</option>
                  <option>Klasse 8–10</option>
                </select>
                <button onClick={() => setFormSubmitted(true)} className="premium-btn" style={{
                  width: '100%',
                  padding: '20px',
                  borderRadius: '4px',
                  fontWeight: 600,
                  color: '#fff',
                  fontSize: '1rem',
                  background: '#1a1a1a',
                  border: 'none',
                  cursor: 'pointer'
                }}>
                  Erstgespräch vereinbaren
                </button>
                <p style={{
                  textAlign: 'center',
                  fontSize: '0.85rem',
                  color: '#aaa',
                  marginTop: '20px'
                }}>
                  100% kostenlos · Antwort innerhalb von 24 Stunden
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        padding: '60px 48px',
        background: '#111',
        textAlign: 'center'
      }}>
        <div style={{
          ...styles.serif,
          fontSize: '1.4rem',
          color: '#fff',
          marginBottom: '16px'
        }}>
          Pulse of Learning
        </div>
        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '24px' }}>
          Wissenschaftlich fundiertes Lerncoaching
        </p>
        <p style={{ color: '#444', fontSize: '0.85rem' }}>
          © 2025 Sandra Störkel · Impressum · Datenschutz
        </p>
      </footer>
    </div>
  );
}
