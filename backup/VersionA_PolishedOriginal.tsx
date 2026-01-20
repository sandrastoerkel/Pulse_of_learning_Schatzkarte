import { useState } from 'react';

// =============================================
// VERSION A: POLISHED ORIGINAL
// =============================================
// Nah am Original, aber professioneller:
// - Bessere Typografie (Playfair Display + DM Sans)
// - Mehr Weißraum und Breathing Room
// - Stärkere CTAs mit Micro-Animations
// - Social Proof Section hinzugefügt
// - Cleaner Card Design
// =============================================

// Schatzkarte-Style Icon: Goldenes Schild mit Herz
const SelbstvertrauenIcon = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="shieldGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFE55C" />
        <stop offset="50%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#B8860B" />
      </linearGradient>
      <linearGradient id="shieldGreen" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#34d399" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
      <filter id="shieldGlow">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
    <g filter="url(#shieldGlow)">
      <path d="M32 8 L52 18 L52 35 C52 45 42 55 32 58 C22 55 12 45 12 35 L12 18 Z" 
        fill="url(#shieldGreen)" stroke="url(#shieldGold)" strokeWidth="2" />
      <path d="M32 25 C32 22, 27 20, 24 23 C21 26, 21 30, 32 40 C43 30, 43 26, 40 23 C37 20, 32 22, 32 25" 
        fill="#fff" opacity="0.9" />
    </g>
  </svg>
);

// Gehirn Icon
const GehirnIcon = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="brainPurple" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#a855f7" />
        <stop offset="100%" stopColor="#7c3aed" />
      </linearGradient>
      <linearGradient id="brainGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFE55C" />
        <stop offset="100%" stopColor="#B8860B" />
      </linearGradient>
      <filter id="brainGlow">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
    <g filter="url(#brainGlow)">
      <ellipse cx="24" cy="32" rx="14" ry="18" fill="url(#brainPurple)" />
      <ellipse cx="40" cy="32" rx="14" ry="18" fill="url(#brainPurple)" />
      <circle cx="32" cy="28" r="4" fill="#22c55e" opacity="0.8">
        <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="22" cy="26" r="2.5" fill="#22c55e" opacity="0.6">
        <animate attributeName="opacity" values="0.4;0.8;0.4" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="42" cy="26" r="2.5" fill="#22c55e" opacity="0.6">
        <animate attributeName="opacity" values="0.4;0.8;0.4" dur="1.8s" repeatCount="indefinite" />
      </circle>
    </g>
    <ellipse cx="32" cy="10" rx="6" ry="4" fill="url(#brainGold)" />
  </svg>
);

// Stern/Ziel Icon
const FlowIcon = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="starGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
      <linearGradient id="targetRed" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#f87171" />
        <stop offset="100%" stopColor="#dc2626" />
      </linearGradient>
      <filter id="starGlow">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
    <g transform="translate(32, 40)">
      <circle cx="0" cy="0" r="16" fill="none" stroke="url(#targetRed)" strokeWidth="3" />
      <circle cx="0" cy="0" r="10" fill="none" stroke="#fff" strokeWidth="3" />
      <circle cx="0" cy="0" r="4" fill="url(#targetRed)" />
    </g>
    <g transform="translate(32, 16)" filter="url(#starGlow)">
      <path d="M0 -10 L2 -3 L9 -3 L3 2 L5 9 L0 5 L-5 9 L-3 2 L-9 -3 L-2 -3 Z" fill="url(#starGold)">
        <animateTransform attributeName="transform" type="rotate" values="0;360" dur="20s" repeatCount="indefinite" />
      </path>
    </g>
  </svg>
);

export default function VersionAPolishedOriginal() {
  const [formSubmitted, setFormSubmitted] = useState(false);

  return (
    <div style={{
      fontFamily: "'DM Sans', system-ui, sans-serif",
      color: '#1f2937',
      background: '#fff',
      lineHeight: 1.6
    }}>
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* NAVIGATION */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '16px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.4rem' }}>
            <span style={{ color: '#059669' }}>Pulse</span> of Learning
          </div>
          <button style={{
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            color: '#fff',
            padding: '12px 28px',
            borderRadius: '50px',
            border: 'none',
            fontWeight: 600,
            fontSize: '0.95rem',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)',
            transition: 'all 0.3s ease'
          }}>
            Kostenlos starten
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        paddingTop: '140px',
        paddingBottom: '100px',
        background: 'linear-gradient(180deg, #fff 0%, #f0fdf4 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute',
          top: '80px',
          right: '5%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(34, 197, 94, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '50px',
          left: '10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(251, 191, 36, 0.12) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />

        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '0 32px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 10
        }}>
          {/* Badge */}
          <span style={{
            display: 'inline-block',
            background: '#dcfce7',
            color: '#047857',
            fontWeight: 600,
            padding: '10px 24px',
            borderRadius: '50px',
            fontSize: '0.9rem',
            marginBottom: '32px',
            border: '1px solid #a7f3d0'
          }}>
            🎓 Wissenschaftlich fundiertes Lerncoaching
          </span>

          {/* Headline */}
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
            fontWeight: 800,
            color: '#111827',
            lineHeight: 1.15,
            marginBottom: '28px'
          }}>
            Dein Kind kann mehr –<br/>
            wenn es weiß, <span style={{ 
              color: '#059669',
              textDecoration: 'underline',
              textDecorationColor: '#fbbf24',
              textDecorationThickness: '4px',
              textUnderlineOffset: '6px'
            }}>wie man lernt</span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: '1.25rem',
            color: '#4b5563',
            maxWidth: '600px',
            margin: '0 auto 40px auto',
            lineHeight: 1.7
          }}>
            In 8 Wochen entwickelt dein Kind die Lernstrategien der Überflieger – 
            basierend auf der Forschung von John Hattie & Albert Bandura.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '60px' }}>
            <button style={{
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: '#fff',
              padding: '18px 40px',
              borderRadius: '50px',
              border: 'none',
              fontWeight: 700,
              fontSize: '1.1rem',
              cursor: 'pointer',
              boxShadow: '0 8px 30px rgba(5, 150, 105, 0.4)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}>
              🚀 Kostenlose Infostunde buchen
            </button>
            <button style={{
              background: '#fff',
              color: '#059669',
              padding: '18px 40px',
              borderRadius: '50px',
              border: '2px solid #059669',
              fontWeight: 600,
              fontSize: '1.1rem',
              cursor: 'pointer'
            }}>
              🗺️ Demo ansehen
            </button>
          </div>

          {/* Credentials Bar */}
          <div style={{
            display: 'inline-flex',
            flexWrap: 'wrap',
            gap: '32px',
            justifyContent: 'center',
            background: '#fff',
            padding: '24px 40px',
            borderRadius: '20px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb'
          }}>
            {[
              { icon: '👩‍🏫', label: '20+ Jahre', sub: 'Lehrerin am Gymnasium' },
              { icon: '📊', label: 'Data Science', sub: 'Zertifiziert' },
              { icon: '👨‍👩‍👧‍👦', label: '2 Kinder', sub: 'Im Schulsystem' }
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '2rem' }}>{item.icon}</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, color: '#111827', fontSize: '1rem' }}>{item.label}</div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WISSENSCHAFT FOUNDATION */}
      <section style={{ padding: '80px 32px', background: '#fff', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '1.1rem', color: '#4b5563', marginBottom: '40px', maxWidth: '700px', margin: '0 auto 40px auto' }}>
            Meine Methode basiert auf <strong style={{ color: '#059669' }}>Meta-Analysen mit 400 Mio. Schülern</strong>. 
            Ich übersetze wissenschaftliche Erkenntnisse in praktische Lerntechniken.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '24px' }}>
            {[
              { name: 'John Hattie', desc: '400 Mio. Schüler erforscht' },
              { name: 'Albert Bandura', desc: 'Self-Efficacy Theorie' },
              { name: 'Vera Birkenbihl', desc: 'Gehirngerechtes Lernen' }
            ].map((r, i) => (
              <div key={i} style={{
                background: '#f9fafb',
                borderRadius: '16px',
                padding: '24px 32px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontWeight: 700, color: '#111827', marginBottom: '4px' }}>{r.name}</div>
                <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{r.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PAIN POINTS */}
      <section style={{ padding: '100px 32px', background: '#f9fafb' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '2.5rem',
            fontWeight: 700,
            color: '#111827',
            textAlign: 'center',
            marginBottom: '50px'
          }}>
            Erkennst du das wieder?
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              'Dein Kind sitzt stundenlang am Schreibtisch – aber es bleibt nichts hängen.',
              'Vor Klassenarbeiten herrscht Panik und Stress in der ganzen Familie.',
              'Du spürst, dass dein Kind Potential hat, aber irgendetwas blockiert.',
              'Nachhilfe hat nicht nachhaltig funktioniert.'
            ].map((text, i) => (
              <div key={i} style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '24px 28px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                border: '1px solid #e5e7eb'
              }}>
                <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '1.2rem' }}>✗</span>
                <span style={{ fontSize: '1.05rem', color: '#374151' }}>{text}</span>
              </div>
            ))}
          </div>
          <p style={{
            textAlign: 'center',
            marginTop: '40px',
            fontSize: '1.3rem',
            fontWeight: 600,
            color: '#059669',
            fontStyle: 'italic'
          }}>
            "Das ist nicht deine Schuld. Niemand bringt unseren Kindern bei, WIE man lernt."
          </p>
        </div>
      </section>

      {/* LÖSUNG - 3 SÄULEN */}
      <section style={{ padding: '100px 32px', background: '#fff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{
              display: 'inline-block',
              background: '#dcfce7',
              color: '#047857',
              padding: '10px 24px',
              borderRadius: '30px',
              fontSize: '0.9rem',
              fontWeight: 600,
              marginBottom: '20px'
            }}>💡 Die Lösung</span>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '2.5rem',
              fontWeight: 700,
              color: '#111827'
            }}>
              Meine 3 Säulen für nachhaltigen Lernerfolg
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            {/* Säule 1 */}
            <div style={{
              background: 'linear-gradient(180deg, #f0fdf4 0%, #fff 100%)',
              borderRadius: '24px',
              padding: '40px 32px',
              border: '1px solid #a7f3d0',
              textAlign: 'center'
            }}>
              <div style={{ marginBottom: '24px' }}><SelbstvertrauenIcon size={80} /></div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>
                Selbstvertrauen aufbauen
              </h3>
              <p style={{ color: '#4b5563', marginBottom: '20px', lineHeight: 1.6 }}>
                Wer an sich glaubt, lernt besser. Dein Kind entwickelt echte Selbstwirksamkeit.
              </p>
              <span style={{
                display: 'inline-block',
                background: '#dcfce7',
                color: '#047857',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: 600
              }}>
                Bandura Self-Efficacy
              </span>
            </div>

            {/* Säule 2 */}
            <div style={{
              background: 'linear-gradient(180deg, #faf5ff 0%, #fff 100%)',
              borderRadius: '24px',
              padding: '40px 32px',
              border: '1px solid #e9d5ff',
              textAlign: 'center'
            }}>
              <div style={{ marginBottom: '24px' }}><GehirnIcon size={80} /></div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>
                Gehirngerecht lernen
              </h3>
              <p style={{ color: '#4b5563', marginBottom: '20px', lineHeight: 1.6 }}>
                Methoden, die mit dem Gehirn arbeiten – nicht gegen es. Weniger Aufwand, mehr Erfolg.
              </p>
              <span style={{
                display: 'inline-block',
                background: '#f3e8ff',
                color: '#7c3aed',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: 600
              }}>
                Hattie · Birkenbihl
              </span>
            </div>

            {/* Säule 3 */}
            <div style={{
              background: 'linear-gradient(180deg, #fffbeb 0%, #fff 100%)',
              borderRadius: '24px',
              padding: '40px 32px',
              border: '1px solid #fde68a',
              textAlign: 'center'
            }}>
              <div style={{ marginBottom: '24px' }}><FlowIcon size={80} /></div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>
                In den Flow kommen
              </h3>
              <p style={{ color: '#4b5563', marginBottom: '20px', lineHeight: 1.6 }}>
                Mit Gamification und klaren Zielen. Lernen macht plötzlich Spaß!
              </p>
              <span style={{
                display: 'inline-block',
                background: '#fef3c7',
                color: '#b45309',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: 600
              }}>
                Spielerisch motivierend
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SO FUNKTIONIERT'S */}
      <section style={{ padding: '100px 32px', background: '#f9fafb' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{
              display: 'inline-block',
              background: '#dbeafe',
              color: '#1d4ed8',
              padding: '10px 24px',
              borderRadius: '30px',
              fontSize: '0.9rem',
              fontWeight: 600,
              marginBottom: '20px'
            }}>🎯 Das Konzept</span>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '2.5rem',
              fontWeight: 700,
              color: '#111827',
              marginBottom: '16px'
            }}>
              3 Bausteine, die ineinandergreifen
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {/* Baustein 1 */}
            <div style={{
              background: '#fff',
              borderRadius: '20px',
              padding: '32px',
              border: '2px solid #86efac',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '-12px',
                left: '24px',
                background: '#059669',
                color: '#fff',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>BAUSTEIN 1</div>
              <div style={{ fontSize: '2.5rem', marginBottom: '16px', marginTop: '8px' }}>🎥👥</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#059669', marginBottom: '8px' }}>Live-Kleingruppen</h3>
              <p style={{ color: '#047857', fontSize: '0.9rem', fontWeight: 600, marginBottom: '16px' }}>2× pro Woche · bis 8 Kinder</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {['Lerntechniken einüben', 'Fragen direkt klären', 'Selbstvertrauen aufbauen'].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: '#374151' }}>
                    <span style={{ color: '#22c55e', fontWeight: 700 }}>✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Baustein 2 */}
            <div style={{
              background: '#fff',
              borderRadius: '20px',
              padding: '32px',
              border: '2px solid #fcd34d',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '-12px',
                left: '24px',
                background: '#d97706',
                color: '#fff',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>BAUSTEIN 2</div>
              <div style={{ fontSize: '2.5rem', marginBottom: '16px', marginTop: '8px' }}>🗺️🎮</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#b45309', marginBottom: '8px' }}>Die Schatzkarte</h3>
              <p style={{ color: '#d97706', fontSize: '0.9rem', fontWeight: 600, marginBottom: '16px' }}>Jederzeit · Im eigenen Tempo</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {['Interaktive Lernwelt', 'Gamification & XP', 'Fortschritte sichtbar'].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: '#374151' }}>
                    <span style={{ color: '#22c55e', fontWeight: 700 }}>✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Baustein 3 */}
            <div style={{
              background: '#fff',
              borderRadius: '20px',
              padding: '32px',
              border: '2px solid #93c5fd',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '-12px',
                left: '24px',
                background: '#1d4ed8',
                color: '#fff',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>BAUSTEIN 3</div>
              <div style={{ fontSize: '2.5rem', marginBottom: '16px', marginTop: '8px' }}>👨‍👩‍👧‍👦</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1d4ed8', marginBottom: '8px' }}>Eltern-Workshops</h3>
              <p style={{ color: '#1d4ed8', fontSize: '0.9rem', fontWeight: 600, marginBottom: '16px' }}>Exklusiv für Eltern</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {['Richtig Feedback geben', 'Motivation fördern', 'Stressfrei durch Prüfungen'].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: '#374151' }}>
                    <span style={{ color: '#22c55e', fontWeight: 700 }}>✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF (NEU!) */}
      <section style={{ padding: '100px 32px', background: '#fff' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '2rem',
            fontWeight: 700,
            color: '#111827',
            marginBottom: '50px'
          }}>
            Das sagen Eltern
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {[
              { text: '"Endlich versteht meine Tochter, wie sie effektiv lernen kann. Der Stress vor Klassenarbeiten ist deutlich weniger geworden!"', author: 'Mutter von Lisa, 12 Jahre' },
              { text: '"Mein Sohn hat zum ersten Mal Spaß am Lernen. Die Schatzkarte ist genial – er will gar nicht mehr aufhören!"', author: 'Vater von Max, 10 Jahre' }
            ].map((t, i) => (
              <div key={i} style={{
                background: '#f9fafb',
                borderRadius: '20px',
                padding: '32px',
                border: '1px solid #e5e7eb',
                textAlign: 'left'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '16px', color: '#fbbf24' }}>★★★★★</div>
                <p style={{ color: '#374151', fontStyle: 'italic', marginBottom: '20px', lineHeight: 1.7 }}>{t.text}</p>
                <div style={{ fontWeight: 600, color: '#059669', fontSize: '0.9rem' }}>— {t.author}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ZIELGRUPPE */}
      <section style={{ padding: '80px 32px', background: '#f0fdf4' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '2rem',
            fontWeight: 700,
            color: '#111827',
            marginBottom: '20px'
          }}>
            Für Schüler von Klasse 3 bis 10
          </h2>
          <p style={{ color: '#4b5563', marginBottom: '30px' }}>
            Alle Schulformen: Grundschule, Realschule, Gymnasium, Gesamtschule
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {['3.-4. Klasse', '5.-7. Klasse', '8.-10. Klasse'].map((s, i) => (
              <span key={i} style={{
                background: '#fff',
                padding: '12px 24px',
                borderRadius: '30px',
                fontWeight: 600,
                color: '#059669',
                border: '2px solid #86efac'
              }}>{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section style={{
        padding: '100px 32px',
        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '2.5rem',
              fontWeight: 700,
              color: '#fff',
              marginBottom: '16px'
            }}>
              Bereit für den nächsten Schritt?
            </h2>
            <p style={{ fontSize: '1.2rem', color: '#bbf7d0' }}>
              Buche jetzt deine kostenlose Infostunde – ohne Verpflichtung.
            </p>
          </div>

          <div style={{
            background: '#fff',
            borderRadius: '24px',
            padding: '40px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.25)'
          }}>
            {formSubmitted ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: '4rem', marginBottom: '16px' }}>✅</div>
                <h3 style={{ fontWeight: 700, fontSize: '1.5rem', color: '#059669', marginBottom: '8px' }}>Vielen Dank!</h3>
                <p style={{ color: '#6b7280' }}>Ich melde mich innerhalb von 24 Stunden bei dir.</p>
              </div>
            ) : (
              <div>
                <h3 style={{ textAlign: 'center', fontSize: '1.3rem', fontWeight: 700, color: '#111827', marginBottom: '30px' }}>
                  📬 Kostenlose Infostunde buchen
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                  <input type="text" placeholder="Dein Name *" style={{
                    flex: '1 1 200px',
                    padding: '16px 20px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '1rem'
                  }} />
                  <input type="email" placeholder="E-Mail-Adresse *" style={{
                    flex: '1 1 200px',
                    padding: '16px 20px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '1rem'
                  }} />
                </div>
                <select style={{
                  width: '100%',
                  padding: '16px 20px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  background: '#fff',
                  marginBottom: '24px'
                }}>
                  <option>Klassenstufe des Kindes</option>
                  <option>3.–4. Klasse</option>
                  <option>5.–7. Klasse</option>
                  <option>8.–10. Klasse</option>
                </select>
                <button onClick={() => setFormSubmitted(true)} style={{
                  width: '100%',
                  padding: '18px',
                  borderRadius: '50px',
                  fontWeight: 700,
                  color: '#fff',
                  fontSize: '1.1rem',
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 8px 25px rgba(5, 150, 105, 0.4)'
                }}>
                  🚀 Kostenlose Infostunde buchen
                </button>
                <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#9ca3af', marginTop: '16px' }}>
                  100% kostenlos · Keine Verpflichtung · Antwort in 24h
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '60px 32px', background: '#111827' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            fontSize: '1.5rem',
            marginBottom: '16px',
            color: '#fff'
          }}>
            <span style={{ color: '#34d399' }}>Pulse</span> of Learning
          </div>
          <p style={{ color: '#9ca3af', marginBottom: '24px' }}>
            Lerncoaching für alle Schüler. Wissenschaftlich fundiert. Spielerisch motivierend.
          </p>
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
            © 2025 Sandra Störkel · Impressum · Datenschutz
          </p>
        </div>
      </footer>
    </div>
  );
}
