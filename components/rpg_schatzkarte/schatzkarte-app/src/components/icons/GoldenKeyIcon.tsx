import React from 'react';

/**
 * GoldenKeyIcon - Bandura-Challenge Symbol
 * Repräsentiert die 4 Quellen der Selbstwirksamkeit:
 * - Mastery Experiences (Erfolgserlebnisse)
 * - Vicarious Experiences (Vorbilder)
 * - Verbal Persuasion (Ermutigung)
 * - Physiological States (Körpergefühl)
 */

export const GoldenKeyIcon = ({ 
  size = 64, 
  animated = true,
  glowing = true,
  className = '' 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ overflow: 'visible' }}
    >
      {/* Definitions für Gradienten und Filter */}
      <defs>
        {/* Gold-Gradient für den Schlüssel */}
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE55C" />
          <stop offset="25%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#FFC125" />
          <stop offset="75%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
        
        {/* Dunklerer Gold-Gradient für Schatten/Tiefe */}
        <linearGradient id="goldDark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DAA520" />
          <stop offset="100%" stopColor="#8B6914" />
        </linearGradient>
        
        {/* Glüh-Effekt */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        
        {/* Schimmer-Animation */}
        <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0)">
            {animated && (
              <animate
                attributeName="offset"
                values="-1;2"
                dur="2.5s"
                repeatCount="indefinite"
              />
            )}
          </stop>
          <stop offset="50%" stopColor="rgba(255,255,255,0.6)">
            {animated && (
              <animate
                attributeName="offset"
                values="-0.5;2.5"
                dur="2.5s"
                repeatCount="indefinite"
              />
            )}
          </stop>
          <stop offset="100%" stopColor="rgba(255,255,255,0)">
            {animated && (
              <animate
                attributeName="offset"
                values="0;3"
                dur="2.5s"
                repeatCount="indefinite"
              />
            )}
          </stop>
        </linearGradient>
      </defs>
      
      {/* Äußerer Glüh-Ring (optional) */}
      {glowing && (
        <circle
          cx="32"
          cy="32"
          r="30"
          fill="none"
          stroke="#FFD700"
          strokeWidth="1"
          opacity="0.3"
        >
          {animated && (
            <animate
              attributeName="r"
              values="28;32;28"
              dur="2s"
              repeatCount="indefinite"
            />
          )}
          {animated && (
            <animate
              attributeName="opacity"
              values="0.3;0.6;0.3"
              dur="2s"
              repeatCount="indefinite"
            />
          )}
        </circle>
      )}
      
      {/* Schlüssel-Gruppe */}
      <g filter={glowing ? "url(#glow)" : undefined}>
        
        {/* Schlüsselkopf (Ring) - Außen */}
        <circle
          cx="22"
          cy="18"
          r="12"
          fill="none"
          stroke="url(#goldGradient)"
          strokeWidth="5"
        />
        
        {/* Schlüsselkopf - Innerer Akzent */}
        <circle
          cx="22"
          cy="18"
          r="12"
          fill="none"
          stroke="url(#goldDark)"
          strokeWidth="2"
          strokeDasharray="4 8"
          opacity="0.5"
        />
        
        {/* Herz im Schlüsselkopf (Symbol für Selbstwirksamkeit) */}
        <path
          d="M22 14 
             C22 12, 19 11, 18 13
             C17 15, 22 19, 22 19
             C22 19, 27 15, 26 13
             C25 11, 22 12, 22 14"
          fill="url(#goldGradient)"
          stroke="url(#goldDark)"
          strokeWidth="0.5"
        />
        
        {/* Schlüsselschaft */}
        <rect
          x="30"
          y="15"
          width="24"
          height="6"
          rx="1"
          fill="url(#goldGradient)"
          stroke="url(#goldDark)"
          strokeWidth="0.5"
        />
        
        {/* Schlüsselbart - Zacke 1 (Mastery) */}
        <rect
          x="44"
          y="21"
          width="4"
          height="10"
          rx="1"
          fill="url(#goldGradient)"
          stroke="url(#goldDark)"
          strokeWidth="0.5"
        />
        
        {/* Schlüsselbart - Zacke 2 (Vicarious) */}
        <rect
          x="50"
          y="21"
          width="4"
          height="14"
          rx="1"
          fill="url(#goldGradient)"
          stroke="url(#goldDark)"
          strokeWidth="0.5"
        />
        
        {/* Schlüsselbart - Verbindung */}
        <rect
          x="44"
          y="21"
          width="10"
          height="4"
          rx="1"
          fill="url(#goldGradient)"
          stroke="url(#goldDark)"
          strokeWidth="0.5"
        />
        
        {/* Kleine Verzierung am Schaft */}
        <circle
          cx="37"
          cy="18"
          r="2"
          fill="url(#goldDark)"
          opacity="0.6"
        />
        
        {/* Schimmer-Overlay */}
        {animated && (
          <rect
            x="10"
            y="6"
            width="44"
            height="30"
            fill="url(#shimmer)"
            style={{ mixBlendMode: 'overlay' }}
          />
        )}
      </g>
      
      {/* Funkeln / Sterne */}
      {animated && (
        <>
          <g opacity="0.8">
            <path
              d="M12 8 L13 10 L15 10 L13.5 11.5 L14 14 L12 12.5 L10 14 L10.5 11.5 L9 10 L11 10 Z"
              fill="#FFF8DC"
            >
              <animate
                attributeName="opacity"
                values="0;1;0"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </path>
          </g>
          <g opacity="0.6">
            <path
              d="M52 42 L53 44 L55 44 L53.5 45.5 L54 48 L52 46.5 L50 48 L50.5 45.5 L49 44 L51 44 Z"
              fill="#FFF8DC"
            >
              <animate
                attributeName="opacity"
                values="0;1;0"
                dur="2s"
                begin="0.5s"
                repeatCount="indefinite"
              />
            </path>
          </g>
          <g opacity="0.7">
            <path
              d="M8 32 L9 34 L11 34 L9.5 35.5 L10 38 L8 36.5 L6 38 L6.5 35.5 L5 34 L7 34 Z"
              fill="#FFF8DC"
            >
              <animate
                attributeName="opacity"
                values="0;1;0"
                dur="1.8s"
                begin="1s"
                repeatCount="indefinite"
              />
            </path>
          </g>
        </>
      )}
    </svg>
  );
};

// Variante: Kleineres Icon für Listen/Buttons
export const GoldenKeyIconSmall = ({ size = 24, className = '' }) => (
  <GoldenKeyIcon size={size} animated={false} glowing={false} className={className} />
);

// Variante: Badge-Version mit Kreis-Hintergrund
export const GoldenKeyBadge = ({ 
  size = 80, 
  unlocked = true,
  className = '' 
}) => {
  return (
    <div 
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: unlocked 
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
          : 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: unlocked
          ? '0 0 20px rgba(255, 215, 0, 0.4), inset 0 0 20px rgba(255, 215, 0, 0.1)'
          : '0 4px 8px rgba(0,0,0,0.3)',
        border: unlocked 
          ? '3px solid #FFD700'
          : '3px solid #444',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <GoldenKeyIcon 
        size={size * 0.65} 
        animated={unlocked}
        glowing={unlocked}
      />
      {!unlocked && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ fontSize: size * 0.3, filter: 'grayscale(100%)' }}>🔒</span>
        </div>
      )}
    </div>
  );
};

export default GoldenKeyIcon;
