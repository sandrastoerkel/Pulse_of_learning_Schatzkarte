import React from 'react';

/**
 * LehrerinIcon - Schatzkarte-Stil
 * Repräsentiert 20+ Jahre Erfahrung als Gymnasiallehrerin
 * FOKUS: Kinder begeistern und inspirieren
 * Lehrerin mit ausgebreiteten Armen, Kinder schauen auf, Funken der Inspiration
 */

export const LehrerinIcon = ({
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

        {/* Herz-Gradient (für Leidenschaft) */}
        <linearGradient id={`${id}-heartGradient`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FF6B6B" />
          <stop offset="100%" stopColor="#C0392B" />
        </linearGradient>

        {/* Inspirations-Glow (warm) */}
        <radialGradient id={`${id}-inspireGlow`} cx="50%" cy="50%" r="50%">
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

        {/* Starker Glow für Herz */}
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

      {/* Inspirations-Aura hinter der Lehrerin */}
      <circle
        cx="32"
        cy="24"
        r="18"
        fill={`url(#${id}-inspireGlow)`}
        opacity="0.4"
      >
        {animated && (
          <animate
            attributeName="r"
            values="16;20;16"
            dur="2s"
            repeatCount="indefinite"
          />
        )}
      </circle>

      {/* Hauptgruppe */}
      <g filter={glowing ? `url(#${id}-glow)` : undefined}>

        {/* === LEHRERIN (zentral, oben) === */}

        {/* Kopf */}
        <circle
          cx="32"
          cy="16"
          r="8"
          fill={`url(#${id}-goldGradient)`}
          stroke={`url(#${id}-goldDark)`}
          strokeWidth="1"
        />

        {/* Lächelndes Gesicht */}
        <path
          d="M29 17 Q32 20 35 17"
          stroke={`url(#${id}-goldDark)`}
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="29" cy="15" r="1" fill={`url(#${id}-goldDark)`} />
        <circle cx="35" cy="15" r="1" fill={`url(#${id}-goldDark)`} />

        {/* Körper */}
        <path
          d="M32 24 L32 38"
          stroke={`url(#${id}-goldGradient)`}
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Ausgebreitete Arme (einladend/begeisternd) */}
        <path
          d="M32 28 L18 22"
          stroke={`url(#${id}-goldGradient)`}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M32 28 L46 22"
          stroke={`url(#${id}-goldGradient)`}
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Hände (kleine Kreise) */}
        <circle cx="17" cy="21" r="2.5" fill={`url(#${id}-goldGradient)`} />
        <circle cx="47" cy="21" r="2.5" fill={`url(#${id}-goldGradient)`} />

        {/* Beine */}
        <path
          d="M32 38 L28 50 M32 38 L36 50"
          stroke={`url(#${id}-goldGradient)`}
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* === KINDER (unten links und rechts, kleiner) === */}

        {/* Kind links - schaut auf */}
        <g>
          <circle
            cx="16"
            cy="42"
            r="5"
            fill={`url(#${id}-goldGradient)`}
            stroke={`url(#${id}-goldDark)`}
            strokeWidth="0.8"
          />
          {/* Staunende Augen (nach oben schauend) */}
          <circle cx="14.5" cy="41" r="0.8" fill={`url(#${id}-goldDark)`} />
          <circle cx="17.5" cy="41" r="0.8" fill={`url(#${id}-goldDark)`} />
          {/* Offener Mund (staunend) */}
          <ellipse cx="16" cy="44" rx="1.5" ry="1" fill={`url(#${id}-goldDark)`} opacity="0.7" />
          {/* Körper */}
          <path
            d="M16 47 L16 56"
            stroke={`url(#${id}-goldGradient)`}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M16 50 L12 48 M16 50 L20 48"
            stroke={`url(#${id}-goldGradient)`}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>

        {/* Kind rechts - schaut auf */}
        <g>
          <circle
            cx="48"
            cy="42"
            r="5"
            fill={`url(#${id}-goldGradient)`}
            stroke={`url(#${id}-goldDark)`}
            strokeWidth="0.8"
          />
          {/* Staunende Augen */}
          <circle cx="46.5" cy="41" r="0.8" fill={`url(#${id}-goldDark)`} />
          <circle cx="49.5" cy="41" r="0.8" fill={`url(#${id}-goldDark)`} />
          {/* Offener Mund */}
          <ellipse cx="48" cy="44" rx="1.5" ry="1" fill={`url(#${id}-goldDark)`} opacity="0.7" />
          {/* Körper */}
          <path
            d="M48 47 L48 56"
            stroke={`url(#${id}-goldGradient)`}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M48 50 L44 48 M48 50 L52 48"
            stroke={`url(#${id}-goldGradient)`}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>

        {/* Kleines Herz über Lehrerin (Leidenschaft fürs Lehren) */}
        <g filter={`url(#${id}-heartGlow)`}>
          <path
            d="M32 4
               C32 2, 29 1, 28 3
               C27 5, 27 6, 32 9
               C37 6, 37 5, 36 3
               C35 1, 32 2, 32 4"
            fill={`url(#${id}-heartGradient)`}
            stroke={`url(#${id}-goldGradient)`}
            strokeWidth="0.5"
          >
            {animated && (
              <animateTransform
                attributeName="transform"
                type="scale"
                values="1;1.15;1"
                dur="1s"
                repeatCount="indefinite"
                additive="sum"
              />
            )}
          </path>
        </g>

        {/* Schimmer-Overlay */}
        {animated && (
          <rect
            x="8"
            y="0"
            width="48"
            height="58"
            fill={`url(#${id}-shimmer)`}
            style={{ mixBlendMode: 'overlay' }}
          />
        )}
      </g>

      {/* Inspirations-Funken (strahlen von Lehrerin aus) */}
      {animated && (
        <>
          {/* Funke oben links */}
          <g opacity="0.9">
            <path
              d="M10 12 L11 14 L13 14 L11.5 15.5 L12 18 L10 16.5 L8 18 L8.5 15.5 L7 14 L9 14 Z"
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

          {/* Funke oben rechts */}
          <g opacity="0.8">
            <path
              d="M54 12 L55 14 L57 14 L55.5 15.5 L56 18 L54 16.5 L52 18 L52.5 15.5 L51 14 L53 14 Z"
              fill="#FFF8DC"
            >
              <animate
                attributeName="opacity"
                values="0;1;0"
                dur="1.8s"
                begin="0.3s"
                repeatCount="indefinite"
              />
            </path>
          </g>

          {/* Funke links mitte */}
          <g opacity="0.7">
            <path
              d="M6 30 L7 32 L9 32 L7.5 33.5 L8 36 L6 34.5 L4 36 L4.5 33.5 L3 32 L5 32 Z"
              fill="#FFF8DC"
            >
              <animate
                attributeName="opacity"
                values="0;1;0"
                dur="2s"
                begin="0.6s"
                repeatCount="indefinite"
              />
            </path>
          </g>

          {/* Funke rechts mitte */}
          <g opacity="0.75">
            <path
              d="M58 30 L59 32 L61 32 L59.5 33.5 L60 36 L58 34.5 L56 36 L56.5 33.5 L55 32 L57 32 Z"
              fill="#FFF8DC"
            >
              <animate
                attributeName="opacity"
                values="0;1;0"
                dur="1.7s"
                begin="0.9s"
                repeatCount="indefinite"
              />
            </path>
          </g>
        </>
      )}
    </svg>
  );
};

export default LehrerinIcon;
