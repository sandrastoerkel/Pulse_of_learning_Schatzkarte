import React from 'react';

/**
 * BuecherIcon - Schatzkarte-Stil
 * Repräsentiert "Unterstufe" (Klasse 5-7)
 * Gestapelte Bücher mit Leuchten - Symbol für Wissen aufbauen
 */

export const BuecherIcon = ({ 
  size = 48, 
  animated = true,
  glowing = true,
  className = '' 
}: {
  size?: number;
  animated?: boolean;
  glowing?: boolean;
  className?: string;
}) => {
  const id = React.useId().replace(/:/g, '');
  
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
      <defs>
        {/* Gold-Gradient für Hauptelemente */}
        <linearGradient id={`${id}-goldGradient`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE55C" />
          <stop offset="25%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#FFC125" />
          <stop offset="75%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
        
        {/* Dunklerer Gold-Gradient für Schatten/Tiefe */}
        <linearGradient id={`${id}-goldDark`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DAA520" />
          <stop offset="100%" stopColor="#8B6914" />
        </linearGradient>
        
        {/* Grün-Gradient für mittleres Buch */}
        <linearGradient id={`${id}-greenGradient`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
        
        {/* Lila-Gradient für oberes Buch */}
        <linearGradient id={`${id}-purpleGradient`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        
        {/* Wissens-Glow */}
        <radialGradient id={`${id}-knowledgeGlow`} cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#FFD700" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
        </radialGradient>
        
        {/* Glüh-Effekt */}
        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        
        {/* Schimmer-Animation */}
        <linearGradient id={`${id}-shimmer`} x1="0%" y1="0%" x2="100%" y2="0%">
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
          <stop offset="50%" stopColor="rgba(255,255,255,0.5)">
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
      
      {/* Äußerer Glüh-Ring */}
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
            <>
              <animate
                attributeName="r"
                values="28;32;28"
                dur="2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.3;0.6;0.3"
                dur="2s"
                repeatCount="indefinite"
              />
            </>
          )}
        </circle>
      )}
      
      {/* Wissens-Aura */}
      <ellipse
        cx="32"
        cy="28"
        rx="24"
        ry="18"
        fill={`url(#${id}-knowledgeGlow)`}
        opacity="0.4"
      >
        {animated && (
          <animate
            attributeName="opacity"
            values="0.3;0.5;0.3"
            dur="2s"
            repeatCount="indefinite"
          />
        )}
      </ellipse>
      
      {/* Hauptgruppe */}
      <g filter={glowing ? `url(#${id}-glow)` : undefined}>
        
        {/* === Buch 1 (unten) - Gold === */}
        <g>
          {/* Buchrücken */}
          <rect
            x="12"
            y="44"
            width="40"
            height="12"
            rx="2"
            fill={`url(#${id}-goldGradient)`}
            stroke={`url(#${id}-goldDark)`}
            strokeWidth="1"
          />
          {/* Seiten */}
          <rect
            x="14"
            y="46"
            width="36"
            height="8"
            fill="#FFF8DC"
            opacity="0.3"
          />
          {/* Buchrücken-Linie */}
          <line
            x1="12"
            y1="50"
            x2="52"
            y2="50"
            stroke={`url(#${id}-goldDark)`}
            strokeWidth="0.5"
            opacity="0.5"
          />
        </g>
        
        {/* === Buch 2 (mitte) - Grün === */}
        <g>
          <rect
            x="10"
            y="30"
            width="44"
            height="12"
            rx="2"
            fill={`url(#${id}-greenGradient)`}
            stroke={`url(#${id}-goldGradient)`}
            strokeWidth="1"
          />
          {/* Seiten */}
          <rect
            x="12"
            y="32"
            width="40"
            height="8"
            fill="#FFF8DC"
            opacity="0.2"
          />
          {/* Titel-Linie */}
          <line
            x1="18"
            y1="36"
            x2="36"
            y2="36"
            stroke={`url(#${id}-goldGradient)`}
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.8"
          />
        </g>
        
        {/* === Buch 3 (oben, leicht gedreht) - Lila === */}
        <g transform="rotate(-8, 32, 22)">
          <rect
            x="14"
            y="16"
            width="36"
            height="12"
            rx="2"
            fill={`url(#${id}-purpleGradient)`}
            stroke={`url(#${id}-goldGradient)`}
            strokeWidth="1"
          />
          {/* Seiten */}
          <rect
            x="16"
            y="18"
            width="32"
            height="8"
            fill="#FFF8DC"
            opacity="0.2"
          />
          {/* Stern auf Buch */}
          <path
            d="M42 22 L43 24 L45 24 L43.5 25.5 L44 27.5 L42 26 L40 27.5 L40.5 25.5 L39 24 L41 24 Z"
            fill={`url(#${id}-goldGradient)`}
          >
            {animated && (
              <animate
                attributeName="opacity"
                values="0.7;1;0.7"
                dur="1.5s"
                repeatCount="indefinite"
              />
            )}
          </path>
        </g>
        
        {/* Lesezeichen */}
        <path
          d="M44 16 L44 8 L48 12 L52 8 L52 16"
          fill={`url(#${id}-goldGradient)`}
          stroke={`url(#${id}-goldDark)`}
          strokeWidth="0.5"
        >
          {animated && (
            <animate
              attributeName="d"
              values="M44 16 L44 8 L48 12 L52 8 L52 16;M44 16 L44 6 L48 10 L52 6 L52 16;M44 16 L44 8 L48 12 L52 8 L52 16"
              dur="2s"
              repeatCount="indefinite"
            />
          )}
        </path>
        
        {/* Schimmer-Overlay */}
        {animated && (
          <rect
            x="10"
            y="16"
            width="44"
            height="40"
            fill={`url(#${id}-shimmer)`}
            style={{ mixBlendMode: 'overlay' }}
          />
        )}
      </g>
      
      {/* Funkelnde Sterne (Wissen leuchtet) */}
      {animated && (
        <>
          <g opacity="0.9">
            <path
              d="M6 26 L7 28 L9 28 L7.5 29.5 L8 32 L6 30.5 L4 32 L4.5 29.5 L3 28 L5 28 Z"
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
          <g opacity="0.7">
            <path
              d="M58 26 L59 28 L61 28 L59.5 29.5 L60 32 L58 30.5 L56 32 L56.5 29.5 L55 28 L57 28 Z"
              fill="#FFF8DC"
            >
              <animate
                attributeName="opacity"
                values="0;1;0"
                dur="1.8s"
                begin="0.5s"
                repeatCount="indefinite"
              />
            </path>
          </g>
          <g opacity="0.8">
            <path
              d="M20 6 L21 8 L23 8 L21.5 9.5 L22 12 L20 10.5 L18 12 L18.5 9.5 L17 8 L19 8 Z"
              fill="#FFF8DC"
            >
              <animate
                attributeName="opacity"
                values="0;1;0"
                dur="2s"
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

export default BuecherIcon;
