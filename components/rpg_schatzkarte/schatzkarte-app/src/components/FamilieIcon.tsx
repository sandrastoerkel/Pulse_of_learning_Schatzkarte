import React from 'react';

/**
 * FamilieIcon - Schatzkarte-Stil
 * Repräsentiert 2 Kinder im Schulsystem
 * Stilisierte Familie (2 Erwachsene, 2 Kinder) mit Herz
 */

export const FamilieIcon = ({
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

        {/* Herz-Gradient (Rot/Rosa) */}
        <linearGradient id={`${id}-heartGradient`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FF6B6B" />
          <stop offset="100%" stopColor="#C0392B" />
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

        {/* Herz-Glühen */}
        <filter id={`${id}-heartGlow`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="2" result="blur" />
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

        {/* === Erwachsene (hinten, größer) === */}

        {/* Elternteil 1 - Links */}
        <g>
          {/* Kopf */}
          <circle
            cx="20"
            cy="20"
            r="7"
            fill={`url(#${id}-goldGradient)`}
            stroke={`url(#${id}-goldDark)`}
            strokeWidth="1"
          />
          {/* Körper */}
          <path
            d="M20 27 L20 44 M14 34 L26 34"
            stroke={`url(#${id}-goldGradient)`}
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Beine */}
          <path
            d="M20 44 L15 56 M20 44 L25 56"
            stroke={`url(#${id}-goldGradient)`}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>

        {/* Elternteil 2 - Rechts */}
        <g>
          {/* Kopf */}
          <circle
            cx="44"
            cy="20"
            r="7"
            fill={`url(#${id}-goldGradient)`}
            stroke={`url(#${id}-goldDark)`}
            strokeWidth="1"
          />
          {/* Körper */}
          <path
            d="M44 27 L44 44 M38 34 L50 34"
            stroke={`url(#${id}-goldGradient)`}
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Beine */}
          <path
            d="M44 44 L39 56 M44 44 L49 56"
            stroke={`url(#${id}-goldGradient)`}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>

        {/* === Kinder (vorne, kleiner) === */}

        {/* Kind 1 - Links-Mitte */}
        <g>
          {/* Kopf */}
          <circle
            cx="27"
            cy="34"
            r="5"
            fill={`url(#${id}-goldGradient)`}
            stroke={`url(#${id}-goldDark)`}
            strokeWidth="1"
          />
          {/* Körper */}
          <path
            d="M27 39 L27 50 M23 44 L31 44"
            stroke={`url(#${id}-goldGradient)`}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Beine */}
          <path
            d="M27 50 L24 58 M27 50 L30 58"
            stroke={`url(#${id}-goldGradient)`}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>

        {/* Kind 2 - Rechts-Mitte */}
        <g>
          {/* Kopf */}
          <circle
            cx="37"
            cy="34"
            r="5"
            fill={`url(#${id}-goldGradient)`}
            stroke={`url(#${id}-goldDark)`}
            strokeWidth="1"
          />
          {/* Körper */}
          <path
            d="M37 39 L37 50 M33 44 L41 44"
            stroke={`url(#${id}-goldGradient)`}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Beine */}
          <path
            d="M37 50 L34 58 M37 50 L40 58"
            stroke={`url(#${id}-goldGradient)`}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>

        {/* Herz über der Familie */}
        <g filter={`url(#${id}-heartGlow)`}>
          <path
            d="M32 8
               C32 5, 28 3, 26 6
               C24 9, 24 12, 32 18
               C40 12, 40 9, 38 6
               C36 3, 32 5, 32 8"
            fill={`url(#${id}-heartGradient)`}
            stroke={`url(#${id}-goldGradient)`}
            strokeWidth="1"
          >
            {animated && (
              <animateTransform
                attributeName="transform"
                type="scale"
                values="1;1.1;1"
                dur="1s"
                repeatCount="indefinite"
                additive="sum"
              />
            )}
          </path>
        </g>

        {/* Verbindungsbogen (Familie zusammen) */}
        <path
          d="M16 56 Q32 62 48 56"
          stroke={`url(#${id}-greenGradient)`}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />

        {/* Schimmer-Overlay */}
        {animated && (
          <rect
            x="10"
            y="2"
            width="44"
            height="58"
            fill={`url(#${id}-shimmer)`}
            style={{ mixBlendMode: 'overlay' }}
          />
        )}
      </g>

      {/* Funkelnde Sterne */}
      {animated && (
        <>
          <g opacity="0.8">
            <path
              d="M8 12 L9 14 L11 14 L9.5 15.5 L10 18 L8 16.5 L6 18 L6.5 15.5 L5 14 L7 14 Z"
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
              d="M56 12 L57 14 L59 14 L57.5 15.5 L58 18 L56 16.5 L54 18 L54.5 15.5 L53 14 L55 14 Z"
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
              d="M32 58 L33 60 L35 60 L33.5 61.5 L34 64 L32 62.5 L30 64 L30.5 61.5 L29 60 L31 60 Z"
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

export default FamilieIcon;
