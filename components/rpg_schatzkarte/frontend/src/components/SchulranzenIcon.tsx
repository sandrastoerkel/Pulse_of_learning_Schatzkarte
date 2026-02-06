import React from 'react';

/**
 * SchulranzenIcon - Schatzkarte-Stil
 * Repräsentiert "Vor dem Übertritt" (Klasse 3-4)
 * Goldener Schulranzen - Symbol für Aufbruch ins Abenteuer Lernen
 */

export const SchulranzenIcon = ({ 
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
          <stop offset="25%" stopColor="var(--fb-reward)" />
          <stop offset="50%" stopColor="#FFC125" />
          <stop offset="75%" stopColor="var(--fb-reward)" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
        
        {/* Dunklerer Gold-Gradient für Schatten/Tiefe */}
        <linearGradient id={`${id}-goldDark`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DAA520" />
          <stop offset="100%" stopColor="#8B6914" />
        </linearGradient>
        
        {/* Grün-Gradient für Akzente */}
        <linearGradient id={`${id}-greenGradient`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
        
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
          stroke="var(--fb-reward)"
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
        
        {/* Tragegriff oben */}
        <path
          d="M26 12 Q32 6 38 12"
          stroke={`url(#${id}-goldGradient)`}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Hauptkörper des Ranzens */}
        <rect
          x="14"
          y="14"
          width="36"
          height="40"
          rx="6"
          fill={`url(#${id}-goldGradient)`}
          stroke={`url(#${id}-goldDark)`}
          strokeWidth="1.5"
        />
        
        {/* Deckel/Klappe */}
        <path
          d="M14 24 L14 18 Q14 14 18 14 L46 14 Q50 14 50 18 L50 24"
          fill={`url(#${id}-goldDark)`}
          opacity="0.4"
        />
        
        {/* Verschluss */}
        <rect
          x="28"
          y="22"
          width="8"
          height="6"
          rx="2"
          fill={`url(#${id}-greenGradient)`}
          stroke={`url(#${id}-goldGradient)`}
          strokeWidth="1"
        />
        
        {/* Vordertasche */}
        <rect
          x="20"
          y="34"
          width="24"
          height="16"
          rx="3"
          fill="none"
          stroke={`url(#${id}-goldDark)`}
          strokeWidth="1.5"
          opacity="0.6"
        />
        
        {/* Stern auf der Tasche (Abenteuer-Symbol) */}
        <path
          d="M32 38 L33.5 41 L37 41.5 L34.5 44 L35 47.5 L32 46 L29 47.5 L29.5 44 L27 41.5 L30.5 41 Z"
          fill={`url(#${id}-greenGradient)`}
          stroke={`url(#${id}-goldGradient)`}
          strokeWidth="0.5"
        >
          {animated && (
            <animateTransform
              attributeName="transform"
              type="scale"
              values="1;1.1;1"
              dur="1.5s"
              repeatCount="indefinite"
              additive="sum"
            />
          )}
        </path>
        
        {/* Schulterriemen links */}
        <path
          d="M18 18 Q10 22 12 34 Q14 46 18 54"
          stroke={`url(#${id}-goldGradient)`}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Schulterriemen rechts */}
        <path
          d="M46 18 Q54 22 52 34 Q50 46 46 54"
          stroke={`url(#${id}-goldGradient)`}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Schimmer-Overlay */}
        {animated && (
          <rect
            x="14"
            y="14"
            width="36"
            height="40"
            rx="6"
            fill={`url(#${id}-shimmer)`}
            style={{ mixBlendMode: 'overlay' }}
          />
        )}
      </g>
      
      {/* Funkelnde Sterne */}
      {animated && (
        <>
          <g opacity="0.9">
            <path
              d="M8 20 L9 22 L11 22 L9.5 23.5 L10 26 L8 24.5 L6 26 L6.5 23.5 L5 22 L7 22 Z"
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
              d="M56 20 L57 22 L59 22 L57.5 23.5 L58 26 L56 24.5 L54 26 L54.5 23.5 L53 22 L55 22 Z"
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
              d="M32 2 L33 4 L35 4 L33.5 5.5 L34 8 L32 6.5 L30 8 L30.5 5.5 L29 4 L31 4 Z"
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

export default SchulranzenIcon;
