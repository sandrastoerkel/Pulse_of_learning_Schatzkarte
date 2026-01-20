import React from 'react';

/**
 * ZielIcon - Schatzkarte-Stil
 * Repräsentiert "Mittelstufe" (Klasse 8-10)
 * Zielscheibe mit goldenem Pfeil - Symbol für Fokus und Ziele erreichen
 */

export const ZielIcon = ({ 
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
        
        {/* Grün-Gradient für Zielscheibe */}
        <linearGradient id={`${id}-greenGradient`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
        
        {/* Rot für äußeren Ring */}
        <linearGradient id={`${id}-redGradient`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
        
        {/* Treffer-Glow */}
        <radialGradient id={`${id}-hitGlow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD700" stopOpacity="0.8" />
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
        
        {/* Starker Glow für Treffer */}
        <filter id={`${id}-hitFilter`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
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
          cy="34"
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
      
      {/* Hauptgruppe */}
      <g filter={glowing ? `url(#${id}-glow)` : undefined}>
        
        {/* === Zielscheibe === */}
        
        {/* Äußerer Ring - Rot */}
        <circle
          cx="32"
          cy="36"
          r="24"
          fill={`url(#${id}-redGradient)`}
          stroke={`url(#${id}-goldGradient)`}
          strokeWidth="2"
        />
        
        {/* Zweiter Ring - Weiß/Cream */}
        <circle
          cx="32"
          cy="36"
          r="18"
          fill="#FFF8DC"
          stroke={`url(#${id}-goldGradient)`}
          strokeWidth="1"
        />
        
        {/* Dritter Ring - Grün */}
        <circle
          cx="32"
          cy="36"
          r="12"
          fill={`url(#${id}-greenGradient)`}
          stroke={`url(#${id}-goldGradient)`}
          strokeWidth="1"
        />
        
        {/* Bullseye - Gold */}
        <circle
          cx="32"
          cy="36"
          r="6"
          fill={`url(#${id}-goldGradient)`}
          stroke={`url(#${id}-goldDark)`}
          strokeWidth="1"
        />
        
        {/* Treffer-Glow im Zentrum */}
        <circle
          cx="32"
          cy="36"
          r="8"
          fill={`url(#${id}-hitGlow)`}
          filter={`url(#${id}-hitFilter)`}
        >
          {animated && (
            <animate
              attributeName="r"
              values="6;10;6"
              dur="1.5s"
              repeatCount="indefinite"
            />
          )}
        </circle>
        
        {/* === Pfeil === */}
        <g>
          {/* Pfeilschaft */}
          <line
            x1="32"
            y1="36"
            x2="54"
            y2="14"
            stroke={`url(#${id}-goldGradient)`}
            strokeWidth="3"
            strokeLinecap="round"
          />
          
          {/* Pfeilspitze */}
          <path
            d="M32 36 L28 32 L32 28 L36 32 Z"
            fill={`url(#${id}-goldGradient)`}
            stroke={`url(#${id}-goldDark)`}
            strokeWidth="0.5"
          />
          
          {/* Pfeilfedern */}
          <path
            d="M50 18 L56 10 L58 16"
            stroke={`url(#${id}-goldGradient)`}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M50 18 L56 14 L54 20"
            stroke={`url(#${id}-goldGradient)`}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>
        
        {/* Schimmer-Overlay */}
        {animated && (
          <circle
            cx="32"
            cy="36"
            r="24"
            fill={`url(#${id}-shimmer)`}
            style={{ mixBlendMode: 'overlay' }}
          />
        )}
      </g>
      
      {/* Funkelnde Sterne (Erfolg) */}
      {animated && (
        <>
          <g opacity="0.9">
            <path
              d="M8 44 L9 46 L11 46 L9.5 47.5 L10 50 L8 48.5 L6 50 L6.5 47.5 L5 46 L7 46 Z"
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
              d="M58 6 L59 8 L61 8 L59.5 9.5 L60 12 L58 10.5 L56 12 L56.5 9.5 L55 8 L57 8 Z"
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
              d="M12 16 L13 18 L15 18 L13.5 19.5 L14 22 L12 20.5 L10 22 L10.5 19.5 L9 18 L11 18 Z"
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

export default ZielIcon;
