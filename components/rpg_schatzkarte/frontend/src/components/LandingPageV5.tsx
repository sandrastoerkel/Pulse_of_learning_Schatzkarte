import { useState } from 'react';

// =============================================
// PULSE OF LEARNING - LANDING PAGE V5
// =============================================
// Mit Schatzkarte-Illustrationen (Gold, Glow, Animationen)
// Stats korrigiert: Hatties Forschung, nicht deine
// Zielgruppe: ALLE Schüler
// Hattie + Bandura + Birkenbihl
// =============================================

// 1. SELBSTVERTRAUEN - Grünes Schild mit Herz
const SelbstvertrauenIllustration = ({ size = 160 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
    <defs>
      <linearGradient id="sv-goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFE55C" />
        <stop offset="50%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#B8860B" />
      </linearGradient>
      <linearGradient id="sv-shieldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#22c55e" />
        <stop offset="50%" stopColor="#16a34a" />
        <stop offset="100%" stopColor="#15803d" />
      </linearGradient>
      <linearGradient id="sv-heartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FF6B6B" />
        <stop offset="100%" stopColor="#C0392B" />
      </linearGradient>
      <filter id="sv-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
        <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <linearGradient id="sv-shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="rgba(255,255,255,0)" />
        <stop offset="50%" stopColor="rgba(255,255,255,0.3)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        <animate attributeName="x1" values="-100%;100%" dur="2s" repeatCount="indefinite" />
        <animate attributeName="x2" values="0%;200%" dur="2s" repeatCount="indefinite" />
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="30" fill="none" stroke="url(#sv-goldGradient)" strokeWidth="1" opacity="0.3">
      <animate attributeName="r" values="28;32;28" dur="3s" repeatCount="indefinite" />
    </circle>
    <g filter="url(#sv-glow)">
      <path d="M32 8 L52 18 L52 35 C52 45 42 55 32 58 C22 55 12 45 12 35 L12 18 Z" fill="url(#sv-shieldGradient)" stroke="url(#sv-goldGradient)" strokeWidth="2" />
      <path d="M32 12 L48 20 L48 34 C48 42 40 50 32 53 C24 50 16 42 16 34 L16 20 Z" fill="none" stroke="url(#sv-goldGradient)" strokeWidth="1.5" opacity="0.6" />
      <path d="M32 25 C32 22, 27 20, 24 23 C21 26, 21 30, 32 40 C43 30, 43 26, 40 23 C37 20, 32 22, 32 25" fill="url(#sv-heartGradient)">
        <animateTransform attributeName="transform" type="scale" values="1;1.08;1" dur="1s" repeatCount="indefinite" additive="sum" />
      </path>
      <g fill="url(#sv-goldGradient)">
        <path d="M32 2 L33 5 L36 5 L33.5 7 L34.5 10 L32 8 L29.5 10 L30.5 7 L28 5 L31 5 Z">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
        </path>
      </g>
      <path d="M32 8 L52 18 L52 35 C52 45 42 55 32 58 C22 55 12 45 12 35 L12 18 Z" fill="url(#sv-shimmer)" style={{ mixBlendMode: 'overlay' }} />
    </g>
    <g fill="#FFF8DC">
      <circle cx="20" cy="15" r="1.5"><animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" /></circle>
      <circle cx="44" cy="12" r="1"><animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" begin="0.5s" /></circle>
      <circle cx="8" cy="40" r="1.2"><animate attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite" begin="1s" /></circle>
      <circle cx="56" cy="38" r="1"><animate attributeName="opacity" values="0;1;0" dur="2.2s" repeatCount="indefinite" begin="0.3s" /></circle>
    </g>
  </svg>
);

// 2. GEHIRNGERECHT - Lila Gehirn mit grünen Synapsen
const GehirnIllustration = ({ size = 160 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
    <defs>
      <linearGradient id="gh-brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#a855f7" />
        <stop offset="50%" stopColor="#9333ea" />
        <stop offset="100%" stopColor="#6b21a8" />
      </linearGradient>
      <linearGradient id="gh-brainDark" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#7e22ce" />
        <stop offset="100%" stopColor="#581c87" />
      </linearGradient>
      <radialGradient id="gh-synapseGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#22c55e" />
        <stop offset="100%" stopColor="#15803d" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="gh-goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFE55C" />
        <stop offset="100%" stopColor="#B8860B" />
      </linearGradient>
      <filter id="gh-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
        <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <filter id="gh-synapseFilter" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
    <circle cx="32" cy="32" r="30" fill="none" stroke="url(#gh-brainGradient)" strokeWidth="1" opacity="0.3">
      <animate attributeName="r" values="28;32;28" dur="4s" repeatCount="indefinite" />
    </circle>
    <g filter="url(#gh-glow)">
      <path d="M32 12 C22 12 14 18 12 28 C10 36 14 44 18 50 C14 52 14 56 18 58 C22 60 28 58 32 54" fill="url(#gh-brainGradient)" stroke="url(#gh-brainDark)" strokeWidth="1" />
      <path d="M32 12 C42 12 50 18 52 28 C54 36 50 44 46 50 C50 52 50 56 46 58 C42 60 36 58 32 54" fill="url(#gh-brainGradient)" stroke="url(#gh-brainDark)" strokeWidth="1" />
      <g stroke="#e9d5ff" strokeWidth="1.5" fill="none" opacity="0.5">
        <path d="M18 24 Q22 22 24 28 Q26 34 22 38" />
        <path d="M16 36 Q20 34 22 40 Q24 46 20 48" />
        <path d="M46 24 Q42 22 40 28 Q38 34 42 38" />
        <path d="M48 36 Q44 34 42 40 Q40 46 44 48" />
      </g>
    </g>
    <g filter="url(#gh-synapseFilter)">
      <circle cx="32" cy="30" r="4" fill="url(#gh-synapseGlow)"><animate attributeName="r" values="3;5;3" dur="1.5s" repeatCount="indefinite" /></circle>
      <circle cx="20" cy="28" r="3" fill="url(#gh-synapseGlow)"><animate attributeName="r" values="2;4;2" dur="1.8s" repeatCount="indefinite" begin="0.3s" /></circle>
      <circle cx="44" cy="28" r="3" fill="url(#gh-synapseGlow)"><animate attributeName="r" values="2;4;2" dur="1.8s" repeatCount="indefinite" begin="0.5s" /></circle>
      <circle cx="22" cy="42" r="2.5" fill="url(#gh-synapseGlow)"><animate attributeName="r" values="2;3.5;2" dur="2s" repeatCount="indefinite" begin="0.6s" /></circle>
      <circle cx="42" cy="42" r="2.5" fill="url(#gh-synapseGlow)"><animate attributeName="r" values="2;3.5;2" dur="2s" repeatCount="indefinite" begin="0.8s" /></circle>
      <g stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" opacity="0.6">
        <line x1="20" y1="28" x2="32" y2="30"><animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.5s" repeatCount="indefinite" /></line>
        <line x1="32" y1="30" x2="44" y2="28"><animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.5s" repeatCount="indefinite" begin="0.2s" /></line>
        <line x1="22" y1="42" x2="32" y2="30"><animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.8s" repeatCount="indefinite" begin="0.4s" /></line>
        <line x1="32" y1="30" x2="42" y2="42"><animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.8s" repeatCount="indefinite" begin="0.6s" /></line>
      </g>
    </g>
    <g transform="translate(32, 4)">
      <ellipse cx="0" cy="0" rx="6" ry="4" fill="url(#gh-goldGradient)"><animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite" /></ellipse>
      <rect x="-2" y="3" width="4" height="3" fill="url(#gh-goldGradient)" rx="0.5" />
      <g stroke="#FFD700" strokeWidth="1" strokeLinecap="round" opacity="0.6">
        <line x1="0" y1="-6" x2="0" y2="-9"><animate attributeName="opacity" values="0.4;1;0.4" dur="1s" repeatCount="indefinite" /></line>
        <line x1="5" y1="-4" x2="8" y2="-6"><animate attributeName="opacity" values="0.4;1;0.4" dur="1s" repeatCount="indefinite" begin="0.2s" /></line>
        <line x1="-5" y1="-4" x2="-8" y2="-6"><animate attributeName="opacity" values="0.4;1;0.4" dur="1s" repeatCount="indefinite" begin="0.4s" /></line>
      </g>
    </g>
    <g fill="#FFF8DC">
      <circle cx="10" cy="20" r="1.2"><animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" /></circle>
      <circle cx="54" cy="22" r="1"><animate attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite" begin="0.5s" /></circle>
    </g>
  </svg>
);

// 3. FLOW - Goldener Stern mit Zielscheibe
const FlowIllustration = ({ size = 160 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
    <defs>
      <linearGradient id="fl-goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFE55C" />
        <stop offset="50%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#B8860B" />
      </linearGradient>
      <radialGradient id="fl-starCore" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="30%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#d97706" />
      </radialGradient>
      <linearGradient id="fl-targetRed" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#EF5350" />
        <stop offset="100%" stopColor="#C62828" />
      </linearGradient>
      <filter id="fl-starGlow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
    <g opacity="0.15" stroke="#22c55e" strokeWidth="1.5" fill="none">
      <path d="M5 40 Q20 35 32 40 T59 40"><animate attributeName="d" values="M5 40 Q20 35 32 40 T59 40;M5 40 Q20 45 32 40 T59 40;M5 40 Q20 35 32 40 T59 40" dur="3s" repeatCount="indefinite" /></path>
      <path d="M5 48 Q20 43 32 48 T59 48"><animate attributeName="d" values="M5 48 Q20 43 32 48 T59 48;M5 48 Q20 53 32 48 T59 48;M5 48 Q20 43 32 48 T59 48" dur="3.5s" repeatCount="indefinite" /></path>
    </g>
    <g transform="translate(32, 38)">
      <circle cx="0" cy="0" r="18" fill="none" stroke="url(#fl-targetRed)" strokeWidth="3" />
      <circle cx="0" cy="0" r="13" fill="none" stroke="white" strokeWidth="3" />
      <circle cx="0" cy="0" r="8" fill="none" stroke="url(#fl-targetRed)" strokeWidth="3" />
      <circle cx="0" cy="0" r="3" fill="url(#fl-targetRed)"><animate attributeName="r" values="2.5;4;2.5" dur="1s" repeatCount="indefinite" /></circle>
    </g>
    <g transform="translate(32, 14)" filter="url(#fl-starGlow)">
      <path d="M0 -12 L2 -4 L10 -4 L4 2 L6 10 L0 5 L-6 10 L-4 2 L-10 -4 L-2 -4 Z" fill="url(#fl-starCore)">
        <animateTransform attributeName="transform" type="rotate" values="0;360" dur="20s" repeatCount="indefinite" />
      </path>
      <circle cx="0" cy="0" r="4" fill="url(#fl-starCore)"><animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" /></circle>
      <circle cx="0" cy="0" r="2" fill="white"><animate attributeName="opacity" values="0.8;1;0.8" dur="1s" repeatCount="indefinite" /></circle>
      <g stroke="#fbbf24" strokeWidth="1" strokeLinecap="round" opacity="0.5">
        <line x1="0" y1="-14" x2="0" y2="-18"><animate attributeName="y2" values="-18;-22;-18" dur="1.5s" repeatCount="indefinite" /></line>
        <line x1="10" y1="-10" x2="14" y2="-14"><animate attributeName="x2" values="14;18;14" dur="1.5s" repeatCount="indefinite" begin="0.3s" /></line>
        <line x1="-10" y1="-10" x2="-14" y2="-14"><animate attributeName="x2" values="-14;-18;-14" dur="1.5s" repeatCount="indefinite" begin="0.6s" /></line>
      </g>
    </g>
    <g>
      <path d="M32 24 L32 32" stroke="url(#fl-goldGradient)" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 2">
        <animate attributeName="stroke-dashoffset" values="0;-12" dur="1s" repeatCount="indefinite" />
      </path>
      <path d="M32 32 L30 28 L32 30 L34 28 Z" fill="url(#fl-goldGradient)" />
    </g>
    <g fill="url(#fl-goldGradient)">
      <path d="M12 20 L13 23 L16 23 L13.5 25 L14.5 28 L12 26 L9.5 28 L10.5 25 L8 23 L11 23 Z" transform="scale(0.6)" style={{ transformOrigin: '12px 24px' }}>
        <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
      </path>
      <path d="M52 18 L53 21 L56 21 L53.5 23 L54.5 26 L52 24 L49.5 26 L50.5 23 L48 21 L51 21 Z" transform="scale(0.6)" style={{ transformOrigin: '52px 22px' }}>
        <animate attributeName="opacity" values="0.5;1;0.5" dur="1.8s" repeatCount="indefinite" begin="0.5s" />
      </path>
    </g>
    <g fill="#FFF8DC">
      <circle cx="18" cy="12" r="1"><animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" /></circle>
      <circle cx="46" cy="10" r="1.2"><animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" begin="0.5s" /></circle>
    </g>
  </svg>
);

// =============================================
// LANDING PAGE PROPS
// =============================================
interface LandingPageV5Props {
  onClose?: () => void;
}

// =============================================
// LANDING PAGE
// =============================================
export function LandingPageV5({ onClose }: LandingPageV5Props) {
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Wichtig: Alle Styles als CSS-String für bessere Kontrolle
  const globalStyles = `
    .landing-page-v5, .landing-page-v5 * {
      box-sizing: border-box;
    }
    .landing-page-v5 {
      color: #111827 !important;
    }
    .landing-page-v5 h1 {
      color: #111827 !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    }
    .landing-page-v5 h2 {
      color: #111827 !important;
    }
    .landing-page-v5 p {
      color: #4b5563 !important;
    }
    .landing-page-v5 .text-green {
      color: #16a34a !important;
    }
  `;

  return (
    <div className="landing-page-v5" style={{ background: 'white', fontFamily: "'Inter', system-ui, -apple-system, sans-serif", color: '#111827', fontSize: '16px', lineHeight: 1.5, overflow: 'visible' }}>
      <style>{globalStyles}</style>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', zIndex: 50, borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 'bold', fontSize: '1.25rem' }}><span style={{ color: '#16a34a' }}>Pulse</span> of Learning</div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {onClose && (
              <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: '8px' }}>✕</button>
            )}
            <button style={{ background: '#16a34a', color: 'white', padding: '8px 20px', borderRadius: '9999px', fontWeight: 600, fontSize: '0.875rem', border: 'none', cursor: 'pointer' }}>
              Kostenlose Infostunde
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        position: 'relative',
        paddingTop: '100px',
        paddingBottom: '80px',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
      }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: '80px', right: '40px', width: '288px', height: '288px', background: '#bbf7d0', borderRadius: '50%', filter: 'blur(64px)', opacity: 0.3, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '80px', left: '40px', width: '384px', height: '384px', background: '#fef3c7', borderRadius: '50%', filter: 'blur(64px)', opacity: 0.3, pointerEvents: 'none' }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 10, maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'center' }}>

            {/* Text Content */}
            <div style={{ flex: '1 1 450px' }}>
              <p style={{ color: '#16a34a', fontWeight: 600, marginBottom: '16px', fontSize: '18px' }}>
                🎓 Lerncoaching für Schüler aller Schulformen
              </p>
              <h1 style={{
                fontSize: '48px',
                fontWeight: 800,
                color: '#111827',
                marginBottom: '24px',
                lineHeight: 1.15,
                margin: '0 0 24px 0'
              }}>
                Dein Kind könnte mehr –<br/>
                wenn es nur wüsste, <span style={{ color: '#16a34a' }}>WIE</span>?
              </h1>
              <p style={{ fontSize: '20px', color: '#4b5563', marginBottom: '32px', lineHeight: 1.6 }}>
                Die Herausforderung ist <em>gehirngerecht</em> zu lernen – das Geheimnis der Überflieger!
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                <button style={{
                  background: '#16a34a',
                  color: 'white',
                  padding: '16px 32px',
                  borderRadius: '9999px',
                  fontWeight: 700,
                  fontSize: '18px',
                  boxShadow: '0 10px 25px rgba(22, 163, 74, 0.3)',
                  border: 'none',
                  cursor: 'pointer'
                }}>
                  🚀 Kostenlose Infostunde buchen
                </button>
                <button
                  onClick={onClose}
                  style={{
                    background: 'transparent',
                    color: '#16a34a',
                    padding: '16px 32px',
                    borderRadius: '9999px',
                    fontWeight: 700,
                    fontSize: '18px',
                    border: '2px solid #16a34a',
                    cursor: 'pointer'
                  }}>
                  🗺️ Demo ansehen
                </button>
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', marginTop: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '28px' }}>👩‍🏫</span>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>20+ Jahre Lehrerin</div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>am Gymnasium</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '28px' }}>📊</span>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>Data Science</div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>zertifiziert</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '28px' }}>👨‍👩‍👧‍👦</span>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>2 Kinder</div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>im Schulsystem</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Portrait */}
            <div style={{ flex: '0 0 auto', position: 'relative' }}>
              <div style={{
                width: '300px',
                height: '300px',
                borderRadius: '24px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                border: '4px solid white',
                overflow: 'hidden',
                background: '#d1d5db'
              }}>
                <img
                  src="images/sandra-portrait.jpg"
                  alt="Sandra Störkel - Lerncoach"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WISSENSCHAFT */}
      <section style={{ padding: '60px 24px', background: '#f9fafb', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <p style={{ textAlign: 'center', color: '#4b5563', marginBottom: '30px', fontSize: '16px' }}>
            Ich verstehe und wende die Erkenntnisse führender Lernforscher an:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
            {[
              { n: "John Hattie", s: "400 Mio. Schüler erforscht" },
              { n: "Albert Bandura", s: "Self-Efficacy Theorie" },
              { n: "Vera Birkenbihl", s: "Gehirngerechtes Lernen" },
              { n: "John Dunlosky", s: "Effektive Lernstrategien" }
            ].map((r, i) => (
              <div key={i} style={{ textAlign: 'center', background: 'white', borderRadius: '12px', padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div style={{ fontWeight: 700, color: '#1f2937', fontSize: '16px', marginBottom: '4px' }}>{r.n}</div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>{r.s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PAIN POINTS */}
      <section style={{ padding: '80px 24px', background: 'white' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '50px', alignItems: 'center' }}>
            {/* Mein Ansatz */}
            <div style={{ flex: '1 1 400px' }}>
              <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderRadius: '20px', padding: '40px', border: '2px solid #86efac' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎯</div>
                <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#15803d', marginBottom: '16px' }}>
                  Mein Ansatz
                </h3>
                <p style={{ fontSize: '18px', color: '#374151', lineHeight: 1.7, marginBottom: '16px' }}>
                  Ich übersetze internationale Lernforschung in <strong>praktische Methoden für das deutsche Schulsystem</strong>.
                </p>
                <p style={{ fontSize: '18px', color: '#374151', lineHeight: 1.7 }}>
                  Keine graue Theorie – sondern <strong>Techniken, die dein Kind sofort im Schulalltag anwenden kann</strong>.
                </p>
              </div>
            </div>
            {/* Text */}
            <div style={{ flex: '1 1 400px' }}>
              <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#111827', marginBottom: '30px' }}>
                Klingt ganz nach dir?
              </h2>
              <div>
                {[
                  "Dein Kind sitzt stundenlang am Schreibtisch – aber es bleibt nichts hängen.",
                  "Vor Klassenarbeiten herrscht Panik und Stress in der ganzen Familie.",
                  "Du hast das Gefühl, dass dein Kind Potential hat, aber irgendetwas blockiert.",
                  "Die Schule lehrt Mathe, Deutsch, Englisch – aber niemand zeigt den Kindern, wie das Gehirn eigentlich lernt."
                ].map((t, i) => (
                  <div key={i} style={{ display: 'flex', gap: '14px', marginBottom: '20px', alignItems: 'flex-start' }}>
                    <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '20px', lineHeight: 1.4 }}>✗</span>
                    <span style={{ fontSize: '17px', color: '#374151', lineHeight: 1.5 }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ZITAT */}
      <section style={{ padding: '70px 24px', background: '#111827' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <blockquote style={{ fontSize: '26px', fontWeight: 300, fontStyle: 'italic', marginBottom: '30px', color: 'white', lineHeight: 1.4 }}>
            "Die Schule lehrt WAS man lernt. Ich lehre WIE man lernt."
          </blockquote>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>👩‍🏫</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700, color: 'white', fontSize: '16px' }}>Sandra Störkel</div>
              <div style={{ color: '#9ca3af', fontSize: '14px' }}>Oberstudienrätin & Lerncoach</div>
            </div>
          </div>
        </div>
      </section>

      {/* LÖSUNG MIT ILLUSTRATIONEN */}
      <section style={{ padding: '80px 24px', background: 'linear-gradient(to bottom, #ffffff, #f0fdf4)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span style={{ display: 'inline-block', background: '#dcfce7', color: '#15803d', padding: '10px 20px', borderRadius: '20px', fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>💡 Die Lösung</span>
            <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#111827', marginBottom: '16px' }}>Das ändere ich.</h2>
            <p style={{ fontSize: '18px', color: '#4b5563' }}>Mit wissenschaftlich fundierten Methoden und 20 Jahren Praxiserfahrung.</p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'center' }}>
            {/* Karte 1 */}
            <div style={{ flex: '1 1 300px', maxWidth: '340px', background: 'white', borderRadius: '20px', padding: '30px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb', textAlign: 'center' }}>
              <div style={{ marginBottom: '20px' }}><SelbstvertrauenIllustration size={120} /></div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>Selbstvertrauen aufbauen</h3>
              <p style={{ color: '#4b5563', marginBottom: '16px', fontSize: '15px', lineHeight: 1.5 }}>Banduras Self-Efficacy zeigt: Wer an sich glaubt, lernt besser.</p>
              <span style={{ display: 'inline-block', background: '#dcfce7', color: '#15803d', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 600 }}>Bandura Self-Efficacy</span>
            </div>
            {/* Karte 2 */}
            <div style={{ flex: '1 1 300px', maxWidth: '340px', background: 'white', borderRadius: '20px', padding: '30px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb', textAlign: 'center' }}>
              <div style={{ marginBottom: '20px' }}><GehirnIllustration size={120} /></div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>Gehirngerecht lernen</h3>
              <p style={{ color: '#4b5563', marginBottom: '16px', fontSize: '15px', lineHeight: 1.5 }}>Methoden, die mit dem Gehirn arbeiten, nicht gegen es.</p>
              <span style={{ display: 'inline-block', background: '#f3e8ff', color: '#7c3aed', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 600 }}>Birkenbihl-Methoden</span>
            </div>
            {/* Karte 3 */}
            <div style={{ flex: '1 1 300px', maxWidth: '340px', background: 'white', borderRadius: '20px', padding: '30px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb', textAlign: 'center' }}>
              <div style={{ marginBottom: '20px' }}><FlowIllustration size={120} /></div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>In den Flow kommen</h3>
              <p style={{ color: '#4b5563', marginBottom: '16px', fontSize: '15px', lineHeight: 1.5 }}>Lernen soll Spaß machen. Mit Gamification und klaren Zielen.</p>
              <span style={{ display: 'inline-block', background: '#fef3c7', color: '#b45309', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 600 }}>Spielerisch motivierend</span>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <button
              onClick={() => document.getElementById('kontakt')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ background: '#16a34a', color: 'white', padding: '18px 36px', borderRadius: '30px', fontWeight: 700, fontSize: '18px', boxShadow: '0 8px 25px rgba(22,163,74,0.3)', border: 'none', cursor: 'pointer' }}>
              Mehr erfahren & Erstgespräch buchen →
            </button>
          </div>
        </div>
      </section>

      {/* SO FUNKTIONIERT DIE LERNBEGLEITUNG */}
      <section style={{ padding: '80px 24px', background: 'white', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span style={{ display: 'inline-block', background: '#dbeafe', color: '#1d4ed8', padding: '10px 20px', borderRadius: '20px', fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>🎯 Das Konzept</span>
            <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#111827', marginBottom: '16px' }}>So funktioniert die Lernbegleitung</h2>
            <p style={{ fontSize: '18px', color: '#4b5563', maxWidth: '700px', margin: '0 auto' }}>
              Nicht alleine lassen – aber auch nicht abhängig machen. <br/>
              <strong>Drei Bausteine</strong>, die ineinandergreifen.
            </p>
          </div>

          {/* 3 Säulen */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'center', marginBottom: '50px' }}>

            {/* Säule 1: Live-Kleingruppen */}
            <div style={{
              flex: '1 1 300px',
              maxWidth: '340px',
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
              borderRadius: '20px',
              padding: '30px',
              border: '2px solid #86efac',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '120px', opacity: 0.1 }}>🎥</div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎥👥</div>
                <div style={{ background: '#16a34a', color: 'white', display: 'inline-block', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, marginBottom: '12px' }}>BAUSTEIN 1</div>
                <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#15803d', marginBottom: '8px' }}>Live-Kleingruppen</h3>
                <p style={{ color: '#16a34a', fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>2× pro Woche · bis 8 Kinder</p>
                <p style={{ color: '#166534', fontSize: '15px', marginBottom: '16px', lineHeight: 1.6 }}>
                  In regelmäßigen Video-Calls werden <strong>Lerninhalte vermittelt</strong>, Techniken eingeübt und Fragen beantwortet.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {['Lerntechniken aktiv einüben', 'Fragen direkt klären', 'Voneinander lernen', 'Selbstvertrauen aufbauen'].map((item, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', color: '#15803d' }}>
                      <span style={{ color: '#22c55e', fontWeight: 700 }}>✓</span> {item}
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,255,255,0.7)', borderRadius: '12px', textAlign: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#15803d', fontStyle: 'italic' }}>"Wenn die das können, kann ich das auch!"</span>
                </div>
              </div>
            </div>

            {/* Säule 2: Interaktives Selbstlernen */}
            <div style={{
              flex: '1 1 300px',
              maxWidth: '340px',
              background: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)',
              borderRadius: '20px',
              padding: '30px',
              border: '2px solid #fcd34d',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '120px', opacity: 0.1 }}>🗺️</div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️🎮</div>
                <div style={{ background: '#d97706', color: 'white', display: 'inline-block', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, marginBottom: '12px' }}>BAUSTEIN 2</div>
                <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#b45309', marginBottom: '8px' }}>Interaktives Selbstlernen</h3>
                <p style={{ color: '#d97706', fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Jederzeit · Im eigenen Tempo</p>
                <p style={{ color: '#92400e', fontSize: '15px', marginBottom: '16px', lineHeight: 1.6 }}>
                  Mit der <strong>Schatzkarte</strong> üben die Kinder eigenständig – spielerisch, mit Challenges und Gaming-Elementen.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {['Interaktive Schatzkarte', 'Spannende Challenges', 'Gaming-Elemente & Belohnungen', 'Fortschritte sichtbar machen'].map((item, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', color: '#b45309' }}>
                      <span style={{ color: '#22c55e', fontWeight: 700 }}>✓</span> {item}
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,255,255,0.7)', borderRadius: '12px', textAlign: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#b45309', fontStyle: 'italic' }}>"Lernen macht ja richtig Spaß!"</span>
                </div>
              </div>
            </div>

            {/* Säule 3: Eltern-Workshop */}
            <div style={{
              flex: '1 1 300px',
              maxWidth: '340px',
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              borderRadius: '20px',
              padding: '30px',
              border: '2px solid #93c5fd',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '120px', opacity: 0.1 }}>👨‍👩‍👧</div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>👨‍👩‍👧‍👦</div>
                <div style={{ background: '#1d4ed8', color: 'white', display: 'inline-block', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, marginBottom: '12px' }}>BAUSTEIN 3</div>
                <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#1e40af', marginBottom: '8px' }}>Eltern-Workshop</h3>
                <p style={{ color: '#1d4ed8', fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Exklusiv für Eltern</p>
                <p style={{ color: '#1e3a8a', fontSize: '15px', marginBottom: '16px', lineHeight: 1.6 }}>
                  Eltern lernen, <strong>wie sie ihr Kind optimal unterstützen</strong> – ohne Druck, mit den richtigen Strategien.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {['Richtig Feedback geben', 'Motivation fördern', 'Lernumgebung gestalten', 'Stressfrei durch Prüfungen'].map((item, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', color: '#1e40af' }}>
                      <span style={{ color: '#22c55e', fontWeight: 700 }}>✓</span> {item}
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,255,255,0.7)', borderRadius: '12px', textAlign: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#1e40af', fontStyle: 'italic' }}>"Endlich weiß ich, wie ich helfen kann!"</span>
                </div>
              </div>
            </div>
          </div>

          {/* Verbindungspfeile und Erklärung */}
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '24px' }}>🎥</span>
                <span style={{ fontSize: '20px', color: '#9ca3af' }}>+</span>
                <span style={{ fontSize: '24px' }}>🗺️</span>
                <span style={{ fontSize: '20px', color: '#9ca3af' }}>+</span>
                <span style={{ fontSize: '24px' }}>👨‍👩‍👧‍👦</span>
                <span style={{ fontSize: '20px', color: '#9ca3af' }}>=</span>
                <span style={{ fontSize: '24px' }}>🎓</span>
              </div>
            </div>
            <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
              <p style={{ fontSize: '17px', color: '#374151', lineHeight: 1.7, margin: 0 }}>
                <strong style={{ color: '#111827' }}>Mein Ziel:</strong> Dein Kind soll <em>nicht</em> von mir abhängig werden –
                sondern lernen, <strong style={{ color: '#16a34a' }}>wie es selbstständig erfolgreich lernt</strong>.
                Die Live-Sessions geben den Kickstart, die Schatzkarte begleitet im Alltag – und die Eltern wissen, wie sie unterstützen können.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FÜR WEN */}
      <section style={{ padding: '80px 24px', background: 'white' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '50px', alignItems: 'center' }}>
            <div style={{ flex: '1 1 400px' }}>
              <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#111827', marginBottom: '24px' }}>Meine Familien sind...</h2>
              <p style={{ fontSize: '18px', color: '#374151', marginBottom: '24px', lineHeight: 1.6 }}>
                <strong>Engagierte Eltern</strong>, die wissen, dass ihr Kind mehr kann. Nachhilfe, Apps, Bücher – nichts hat nachhaltig funktioniert.
              </p>
              <p style={{ fontSize: '22px', color: '#15803d', fontWeight: 700, fontStyle: 'italic' }}>"Erwischt! Das sind wir."</p>
            </div>
            <div style={{ flex: '1 1 350px' }}>
              {[
                { i: "🎒", t: "Vor dem Übertritt", a: "Klasse 3–4" },
                { i: "📚", t: "Unterstufe", a: "Klasse 5–7" },
                { i: "🎯", t: "Mittelstufe", a: "Klasse 8–10" }
              ].map((g, i) => (
                <div key={i} style={{ background: '#f9fafb', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid #e5e7eb', marginBottom: '14px' }}>
                  <span style={{ fontSize: '32px' }}>{g.i}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: '#111827', fontSize: '17px' }}>{g.t}</div>
                    <div style={{ color: '#16a34a', fontWeight: 600, fontSize: '14px' }}>{g.a}</div>
                  </div>
                </div>
              ))}
              <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px', marginTop: '16px' }}>
                Alle Schulformen: Grundschule, Realschule, Gymnasium, Gesamtschule
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="kontakt" style={{ padding: '80px 24px', background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px', color: 'white' }}>Bereit für den nächsten Schritt?</h2>
            <p style={{ fontSize: '20px', color: '#bbf7d0' }}>Buche jetzt deine kostenlose Infostunde.</p>
          </div>
          <div style={{ background: 'white', borderRadius: '24px', padding: '36px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '24px', fontWeight: 700, textAlign: 'center', color: '#111827', marginBottom: '30px' }}>📬 Kostenlose Infostunde buchen</h3>
            {formSubmitted ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: '60px', marginBottom: '16px' }}>✅</div>
                <h4 style={{ fontWeight: 700, fontSize: '24px', color: '#16a34a' }}>Vielen Dank!</h4>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                  <input type="text" placeholder="Dein Name *" style={{ flex: '1 1 200px', padding: '16px', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '16px' }} />
                  <input type="email" placeholder="E-Mail-Adresse *" style={{ flex: '1 1 200px', padding: '16px', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '16px' }} />
                </div>
                <select style={{ width: '100%', padding: '16px', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '16px', background: 'white', marginBottom: '20px' }}>
                  <option>Klassenstufe des Kindes</option>
                  <option>3.–4. Klasse</option>
                  <option>5.–7. Klasse</option>
                  <option>8.–10. Klasse</option>
                </select>
                <button onClick={() => setFormSubmitted(true)} style={{ width: '100%', padding: '18px', borderRadius: '30px', fontWeight: 700, color: 'white', fontSize: '18px', background: '#16a34a', border: 'none', cursor: 'pointer' }}>
                  🚀 Kostenlose Infostunde buchen
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '50px 24px', background: '#030712' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontWeight: 700, fontSize: '20px', marginBottom: '16px', color: 'white' }}>
            <span style={{ color: '#22c55e' }}>Pulse</span> of Learning
          </p>
          <p style={{ fontSize: '15px', marginBottom: '30px', color: '#9ca3af' }}>
            Lerncoaching für alle Schüler. Wissenschaftlich fundiert. Spielerisch motivierend.
          </p>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>© 2025 Sandra Störkel · Impressum · Datenschutz</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPageV5;
