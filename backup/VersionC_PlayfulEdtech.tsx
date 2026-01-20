import { useState, useEffect } from 'react';

// =============================================
// VERSION C: PLAYFUL EDTECH
// =============================================
// Komplett frisches, modernes EdTech Design:
// - Lebendige Farbpalette (Teal + Purple + Gold)
// - Playful Illustrationen und Icons
// - Mehr Gamification-Feeling
// - Dynamische Animationen
// - Moderne Card-Layouts mit Glassmorphism
// =============================================

// Animierte Floating Icons
const FloatingIcon = ({ children, delay = 0 }) => (
  <div style={{
    animation: `float 3s ease-in-out infinite`,
    animationDelay: `${delay}s`
  }}>
    {children}
  </div>
);

// XP Badge Component
const XPBadge = ({ value }) => (
  <div style={{
    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    color: '#fff',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: 700,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    boxShadow: '0 4px 12px rgba(251, 191, 36, 0.4)'
  }}>
    ⭐ {value} XP
  </div>
);

// Achievement Card
const AchievementCard = ({ emoji, title, unlocked }) => (
  <div style={{
    background: unlocked ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' : '#f3f4f6',
    borderRadius: '16px',
    padding: '20px',
    textAlign: 'center',
    border: unlocked ? '2px solid #86efac' : '2px solid #e5e7eb',
    opacity: unlocked ? 1 : 0.6,
    transform: unlocked ? 'scale(1)' : 'scale(0.95)'
  }}>
    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{emoji}</div>
    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: unlocked ? '#059669' : '#9ca3af' }}>{title}</div>
  </div>
);

export default function VersionCPlayfulEdtech() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [xpCount, setXpCount] = useState(0);

  // Animated XP counter
  useEffect(() => {
    const timer = setTimeout(() => {
      if (xpCount < 2450) {
        setXpCount(prev => Math.min(prev + 50, 2450));
      }
    }, 30);
    return () => clearTimeout(timer);
  }, [xpCount]);

  return (
    <div style={{
      fontFamily: "'Nunito', 'Quicksand', system-ui, sans-serif",
      color: '#1f2937',
      background: '#fefefe',
      lineHeight: 1.6,
      overflow: 'hidden'
    }}>
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Quicksand:wght@500;600;700&display=swap" rel="stylesheet" />

      {/* Animations & Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
        .gradient-text {
          background: linear-gradient(135deg, #14b8a6 0%, #8b5cf6 50%, #f59e0b 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradient-shift 4s ease infinite;
        }
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hover-lift:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.5);
        }
      `}</style>

      {/* NAVIGATION */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        zIndex: 100
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem'
          }}>🗺️</div>
          <span style={{ fontWeight: 800, fontSize: '1.3rem' }}>
            <span className="gradient-text">Pulse</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <XPBadge value="Gratis" />
          <button style={{
            background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
            color: '#fff',
            padding: '12px 28px',
            borderRadius: '50px',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(20, 184, 166, 0.35)'
          }}>
            🚀 Starten
          </button>
        </div>
      </nav>

      {/* HERO - Playful & Dynamic */}
      <section style={{
        minHeight: '100vh',
        paddingTop: '120px',
        paddingBottom: '80px',
        position: 'relative',
        background: 'linear-gradient(180deg, #f0fdfa 0%, #ecfdf5 50%, #fff 100%)',
        overflow: 'hidden'
      }}>
        {/* Decorative Elements */}
        <div style={{
          position: 'absolute',
          top: '15%',
          right: '5%',
          fontSize: '4rem',
          opacity: 0.15,
          animation: 'float 4s ease-in-out infinite'
        }}>🎯</div>
        <div style={{
          position: 'absolute',
          top: '60%',
          left: '8%',
          fontSize: '3rem',
          opacity: 0.12,
          animation: 'float 5s ease-in-out infinite',
          animationDelay: '1s'
        }}>⭐</div>
        <div style={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          fontSize: '3.5rem',
          opacity: 0.1,
          animation: 'float 4.5s ease-in-out infinite',
          animationDelay: '0.5s'
        }}>🧠</div>

        {/* Gradient Orbs */}
        <div style={{
          position: 'absolute',
          top: '100px',
          right: '10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(20, 184, 166, 0.2) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '100px',
          left: '5%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(30px)'
        }} />

        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '60px 32px',
          position: 'relative',
          zIndex: 10
        }}>
          {/* Badge with Animation */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
              padding: '12px 24px',
              borderRadius: '50px',
              fontSize: '0.95rem',
              fontWeight: 700,
              color: '#0d9488',
              border: '2px solid rgba(20, 184, 166, 0.3)'
            }}>
              <span style={{ animation: 'pulse 2s infinite' }}>🎮</span>
              Level Up dein Lernen!
            </span>
          </div>

          {/* Main Headline */}
          <h1 style={{
            textAlign: 'center',
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: '28px'
          }}>
            Dein Kind wird zum<br/>
            <span className="gradient-text">Lern-Superheld</span> 🦸
          </h1>

          {/* Subtitle */}
          <p style={{
            textAlign: 'center',
            fontSize: '1.3rem',
            color: '#4b5563',
            maxWidth: '600px',
            margin: '0 auto 48px',
            lineHeight: 1.7
          }}>
            Mit der <strong style={{ color: '#14b8a6' }}>Schatzkarte</strong> lernt dein Kind spielerisch 
            die Geheimnisse der Überflieger – und sammelt dabei XP! 
          </p>

          {/* CTA Buttons */}
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '60px'
          }}>
            <button className="hover-lift" style={{
              background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
              color: '#fff',
              padding: '20px 40px',
              borderRadius: '60px',
              border: 'none',
              fontWeight: 800,
              fontSize: '1.15rem',
              cursor: 'pointer',
              boxShadow: '0 12px 35px rgba(20, 184, 166, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              🚀 Abenteuer starten
              <span style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.8rem'
              }}>Gratis</span>
            </button>
            <button className="hover-lift" style={{
              background: '#fff',
              color: '#14b8a6',
              padding: '20px 40px',
              borderRadius: '60px',
              border: '3px solid #14b8a6',
              fontWeight: 700,
              fontSize: '1.15rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🗺️ Demo Tour
            </button>
          </div>

          {/* Gamification Preview Card */}
          <div className="glass-card" style={{
            maxWidth: '500px',
            margin: '0 auto',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>🦊</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>Level 12 Lernfuchs</div>
                  <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Nächstes Level: 550 XP</div>
                </div>
              </div>
              <XPBadge value={xpCount} />
            </div>

            {/* Progress Bar */}
            <div style={{
              background: '#e5e7eb',
              borderRadius: '10px',
              height: '12px',
              marginBottom: '24px',
              overflow: 'hidden'
            }}>
              <div style={{
                background: 'linear-gradient(90deg, #14b8a6 0%, #8b5cf6 100%)',
                height: '100%',
                width: '72%',
                borderRadius: '10px',
                transition: 'width 1s ease'
              }} />
            </div>

            {/* Mini Achievements */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px'
            }}>
              <AchievementCard emoji="🎯" title="Zielstarter" unlocked={true} />
              <AchievementCard emoji="🧠" title="Gedächtnis-Profi" unlocked={true} />
              <AchievementCard emoji="⚡" title="Speed-Learner" unlocked={true} />
              <AchievementCard emoji="🏆" title="Champion" unlocked={false} />
            </div>
          </div>
        </div>
      </section>

      {/* SCIENTIFIC CREDIBILITY - Fun Style */}
      <section style={{
        padding: '80px 32px',
        background: '#fff',
        borderTop: '1px solid #f0f0f0'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{
            fontSize: '1.1rem',
            color: '#6b7280',
            marginBottom: '40px'
          }}>
            Basierend auf der Forschung von echten Lern-Legenden 🏆
          </p>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '24px'
          }}>
            {[
              { name: 'John Hattie', stat: '400 Mio. Schüler', emoji: '📊' },
              { name: 'Albert Bandura', stat: 'Self-Efficacy', emoji: '💪' },
              { name: 'Vera Birkenbihl', stat: 'Gehirngerecht', emoji: '🧠' }
            ].map((r, i) => (
              <div key={i} className="hover-lift" style={{
                background: '#f9fafb',
                borderRadius: '20px',
                padding: '24px 32px',
                border: '2px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <span style={{ fontSize: '2rem' }}>{r.emoji}</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, color: '#1f2937' }}>{r.name}</div>
                  <div style={{ fontSize: '0.85rem', color: '#14b8a6', fontWeight: 600 }}>{r.stat}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM - Empathetic */}
      <section style={{
        padding: '100px 32px',
        background: 'linear-gradient(180deg, #fef2f2 0%, #fff 100%)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span style={{
              display: 'inline-block',
              background: '#fee2e2',
              color: '#dc2626',
              padding: '10px 24px',
              borderRadius: '50px',
              fontSize: '0.9rem',
              fontWeight: 700,
              marginBottom: '20px'
            }}>😰 Das kennen wir</span>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: 900,
              color: '#1f2937'
            }}>
              Kommt dir das bekannt vor?
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { emoji: '😴', text: 'Stundenlang lernen – und trotzdem nichts behalten' },
              { emoji: '😱', text: 'Prüfungspanik in der ganzen Familie' },
              { emoji: '🤯', text: 'Das Gefühl, dass dein Kind mehr kann, aber blockiert ist' },
              { emoji: '❓', text: 'Niemand erklärt, WIE das Gehirn eigentlich lernt' }
            ].map((item, i) => (
              <div key={i} className="hover-lift" style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
                border: '1px solid #fecaca'
              }}>
                <span style={{ fontSize: '2rem' }}>{item.emoji}</span>
                <span style={{ fontSize: '1.1rem', color: '#374151', fontWeight: 500 }}>{item.text}</span>
              </div>
            ))}
          </div>

          <p style={{
            textAlign: 'center',
            marginTop: '50px',
            fontSize: '1.4rem',
            fontWeight: 700,
            color: '#14b8a6'
          }}>
            Zeit für ein Upgrade! 🚀
          </p>
        </div>
      </section>

      {/* SOLUTION - 3 Power-Ups */}
      <section style={{
        padding: '100px 32px',
        background: 'linear-gradient(180deg, #fff 0%, #f0fdfa 100%)'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
              color: '#0d9488',
              padding: '12px 28px',
              borderRadius: '50px',
              fontSize: '0.9rem',
              fontWeight: 700,
              marginBottom: '20px',
              border: '2px solid rgba(20, 184, 166, 0.2)'
            }}>⚡ Power-Ups</span>
            <h2 style={{
              fontSize: '2.8rem',
              fontWeight: 900,
              color: '#1f2937'
            }}>
              3 Superkräfte für dein Kind
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {/* Power-Up 1 */}
            <div className="hover-lift" style={{
              background: 'linear-gradient(180deg, #f0fdf4 0%, #fff 100%)',
              borderRadius: '28px',
              padding: '40px 32px',
              border: '3px solid #86efac',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#22c55e',
                color: '#fff',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 800
              }}>+150 XP</div>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🛡️</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669', marginBottom: '12px' }}>
                Selbstvertrauen
              </h3>
              <p style={{ color: '#4b5563', lineHeight: 1.7, marginBottom: '20px' }}>
                Wer an sich glaubt, lernt besser. Dein Kind entwickelt echte Superkraft-Confidence!
              </p>
              <span style={{
                display: 'inline-block',
                background: '#dcfce7',
                color: '#047857',
                padding: '8px 20px',
                borderRadius: '50px',
                fontSize: '0.85rem',
                fontWeight: 700
              }}>💪 Bandura Power</span>
            </div>

            {/* Power-Up 2 */}
            <div className="hover-lift" style={{
              background: 'linear-gradient(180deg, #faf5ff 0%, #fff 100%)',
              borderRadius: '28px',
              padding: '40px 32px',
              border: '3px solid #d8b4fe',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#a855f7',
                color: '#fff',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 800
              }}>+200 XP</div>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🧠</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#7c3aed', marginBottom: '12px' }}>
                Gehirn-Boost
              </h3>
              <p style={{ color: '#4b5563', lineHeight: 1.7, marginBottom: '20px' }}>
                Lerntechniken, die mit dem Gehirn arbeiten. Weniger büffeln, mehr verstehen!
              </p>
              <span style={{
                display: 'inline-block',
                background: '#f3e8ff',
                color: '#6b21a8',
                padding: '8px 20px',
                borderRadius: '50px',
                fontSize: '0.85rem',
                fontWeight: 700
              }}>🔬 Hattie Research</span>
            </div>

            {/* Power-Up 3 */}
            <div className="hover-lift" style={{
              background: 'linear-gradient(180deg, #fffbeb 0%, #fff 100%)',
              borderRadius: '28px',
              padding: '40px 32px',
              border: '3px solid #fcd34d',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#f59e0b',
                color: '#fff',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 800
              }}>+250 XP</div>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎮</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#b45309', marginBottom: '12px' }}>
                Flow-Modus
              </h3>
              <p style={{ color: '#4b5563', lineHeight: 1.7, marginBottom: '20px' }}>
                Gamification macht Lernen zum Abenteuer. Challenges, XP, Achievements!
              </p>
              <span style={{
                display: 'inline-block',
                background: '#fef3c7',
                color: '#92400e',
                padding: '8px 20px',
                borderRadius: '50px',
                fontSize: '0.85rem',
                fontWeight: 700
              }}>🏆 Level Up!</span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS - Quest Map Style */}
      <section style={{
        padding: '100px 32px',
        background: '#fff'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{
              display: 'inline-block',
              background: '#dbeafe',
              color: '#1d4ed8',
              padding: '12px 28px',
              borderRadius: '50px',
              fontSize: '0.9rem',
              fontWeight: 700,
              marginBottom: '20px'
            }}>🗺️ Die Quest</span>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: 900,
              color: '#1f2937'
            }}>
              Dein Lern-Abenteuer in 3 Kapiteln
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px'
          }}>
            {/* Quest 1 */}
            <div className="hover-lift" style={{
              background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
              borderRadius: '24px',
              padding: '32px',
              border: '3px solid #34d399',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '-16px',
                left: '24px',
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                color: '#fff',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1.2rem',
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)'
              }}>1</div>
              <div style={{ fontSize: '3rem', marginBottom: '16px', marginTop: '8px' }}>🎥👥</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#059669', marginBottom: '8px' }}>
                Live-Gruppen
              </h3>
              <p style={{ color: '#047857', fontSize: '0.9rem', fontWeight: 600, marginBottom: '16px' }}>
                2× pro Woche · Max 8 Kids
              </p>
              <p style={{ color: '#166534', lineHeight: 1.6, marginBottom: '16px' }}>
                Interaktive Video-Sessions mit echtem Coach. Lerntechniken üben & Fragen klären!
              </p>
              <div style={{
                background: 'rgba(255,255,255,0.7)',
                borderRadius: '12px',
                padding: '12px',
                textAlign: 'center',
                fontStyle: 'italic',
                color: '#059669',
                fontSize: '0.9rem'
              }}>
                "Wenn die das können, kann ich das auch!" 💪
              </div>
            </div>

            {/* Quest 2 */}
            <div className="hover-lift" style={{
              background: 'linear-gradient(135deg, #fefce8 0%, #fef08a 100%)',
              borderRadius: '24px',
              padding: '32px',
              border: '3px solid #facc15',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '-16px',
                left: '24px',
                background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
                color: '#fff',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1.2rem',
                boxShadow: '0 4px 12px rgba(234, 179, 8, 0.4)'
              }}>2</div>
              <div style={{ fontSize: '3rem', marginBottom: '16px', marginTop: '8px' }}>🗺️🎮</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#a16207', marginBottom: '8px' }}>
                Die Schatzkarte
              </h3>
              <p style={{ color: '#ca8a04', fontSize: '0.9rem', fontWeight: 600, marginBottom: '16px' }}>
                Jederzeit · Eigenes Tempo
              </p>
              <p style={{ color: '#854d0e', lineHeight: 1.6, marginBottom: '16px' }}>
                Spielerische Lernwelt mit Challenges, XP-Punkten und coolen Achievements!
              </p>
              <div style={{
                background: 'rgba(255,255,255,0.7)',
                borderRadius: '12px',
                padding: '12px',
                textAlign: 'center',
                fontStyle: 'italic',
                color: '#a16207',
                fontSize: '0.9rem'
              }}>
                "Lernen macht ja richtig Spaß!" 🎉
              </div>
            </div>

            {/* Quest 3 */}
            <div className="hover-lift" style={{
              background: 'linear-gradient(135deg, #eff6ff 0%, #bfdbfe 100%)',
              borderRadius: '24px',
              padding: '32px',
              border: '3px solid #60a5fa',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '-16px',
                left: '24px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: '#fff',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1.2rem',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
              }}>3</div>
              <div style={{ fontSize: '3rem', marginBottom: '16px', marginTop: '8px' }}>👨‍👩‍👧</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1d4ed8', marginBottom: '8px' }}>
                Eltern-Power
              </h3>
              <p style={{ color: '#2563eb', fontSize: '0.9rem', fontWeight: 600, marginBottom: '16px' }}>
                Exklusive Workshops
              </p>
              <p style={{ color: '#1e3a8a', lineHeight: 1.6, marginBottom: '16px' }}>
                Lernt, wie ihr optimal unterstützt – ohne Stress, mit den richtigen Strategien!
              </p>
              <div style={{
                background: 'rgba(255,255,255,0.7)',
                borderRadius: '12px',
                padding: '12px',
                textAlign: 'center',
                fontStyle: 'italic',
                color: '#1d4ed8',
                fontSize: '0.9rem'
              }}>
                "Endlich weiß ich, wie ich helfen kann!" 💙
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA - Final Boss */}
      <section style={{
        padding: '100px 32px',
        background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 50%, #115e59 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          fontSize: '6rem',
          opacity: 0.1
        }}>⭐</div>
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          fontSize: '5rem',
          opacity: 0.1
        }}>🏆</div>

        <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎯</div>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: 900,
              color: '#fff',
              marginBottom: '16px'
            }}>
              Ready to Level Up?
            </h2>
            <p style={{ fontSize: '1.2rem', color: '#a7f3d0' }}>
              Starte dein Abenteuer mit einer kostenlosen Infostunde!
            </p>
          </div>

          <div className="glass-card" style={{
            borderRadius: '28px',
            padding: '40px',
            boxShadow: '0 30px 60px rgba(0,0,0,0.25)'
          }}>
            {formSubmitted ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: '5rem', marginBottom: '20px' }}>🎉</div>
                <h3 style={{ fontWeight: 900, fontSize: '1.8rem', color: '#059669', marginBottom: '12px' }}>
                  Achievement Unlocked!
                </h3>
                <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
                  +500 XP · Ich melde mich in 24h bei dir!
                </p>
              </div>
            ) : (
              <div>
                <div style={{
                  textAlign: 'center',
                  marginBottom: '24px'
                }}>
                  <XPBadge value="Gratis +500 XP" />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                  <input type="text" placeholder="Dein Name 🙋" style={{
                    flex: '1 1 200px',
                    padding: '18px 24px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '16px',
                    fontSize: '1rem',
                    fontWeight: 500
                  }} />
                  <input type="email" placeholder="E-Mail 📧" style={{
                    flex: '1 1 200px',
                    padding: '18px 24px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '16px',
                    fontSize: '1rem',
                    fontWeight: 500
                  }} />
                </div>
                <select style={{
                  width: '100%',
                  padding: '18px 24px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '16px',
                  fontSize: '1rem',
                  fontWeight: 500,
                  background: '#fff',
                  marginBottom: '24px'
                }}>
                  <option>🎓 Klassenstufe wählen</option>
                  <option>Klasse 3–4 (Lernfuchs-Starter)</option>
                  <option>Klasse 5–7 (Quest-Explorer)</option>
                  <option>Klasse 8–10 (Pro-Learner)</option>
                </select>
                <button onClick={() => setFormSubmitted(true)} className="hover-lift" style={{
                  width: '100%',
                  padding: '20px',
                  borderRadius: '60px',
                  fontWeight: 800,
                  color: '#fff',
                  fontSize: '1.15rem',
                  background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 8px 25px rgba(20, 184, 166, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}>
                  🚀 Abenteuer starten!
                </button>
                <p style={{
                  textAlign: 'center',
                  fontSize: '0.85rem',
                  color: '#9ca3af',
                  marginTop: '16px'
                }}>
                  ✓ 100% kostenlos · ✓ Keine Verpflichtung · ✓ Antwort in 24h
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        padding: '60px 32px',
        background: '#111827',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem'
          }}>🗺️</div>
          <span style={{ fontWeight: 800, fontSize: '1.3rem', color: '#fff' }}>
            Pulse of Learning
          </span>
        </div>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>
          Lerncoaching für Superhelden 🦸 · Wissenschaftlich fundiert · Spielerisch motivierend
        </p>
        <p style={{ color: '#4b5563', fontSize: '0.9rem' }}>
          © 2025 Sandra Störkel · Impressum · Datenschutz
        </p>
      </footer>
    </div>
  );
}
