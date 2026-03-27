import React, { useId } from 'react';
import { IconProps, Sparkle, GlowRing } from './IconDefs';

/**
 * LootIcon - Lernkarten / Flashcards
 * Symbolisiert: Wissenserwerb, Spaced Repetition, Vokabeln lernen
 * Design: Gestapelte goldene Karten mit Glanzeffekt
 */

export const LootIcon: React.FC<IconProps> = ({
  size = 64,
  animated = true,
  glowing = true,
  className = ''
}) => {
  const id = useId().replace(/:/g, '');

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
        {/* Gold Gradient für Karten */}
        <linearGradient id={`${id}-goldGradient`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE55C" />
          <stop offset="25%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#FFC125" />
          <stop offset="75%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>

        {/* Dunkles Gold für Schatten */}
        <linearGradient id={`${id}-goldDark`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DAA520" />
          <stop offset="100%" stopColor="#8B6914" />
        </linearGradient>

        {/* Heller Gold-Akzent */}
        <linearGradient id={`${id}-goldLight`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFACD" />
          <stop offset="30%" stopColor="#FFE55C" />
          <stop offset="100%" stopColor="#FFD700" />
        </linearGradient>

        {/* Pergament-Farbe für Karteninhalt */}
        <linearGradient id={`${id}-parchment`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFF8E7" />
          <stop offset="50%" stopColor="#F5E6C8" />
          <stop offset="100%" stopColor="#E8D4B8" />
        </linearGradient>

        {/* Grüner Akzent für "gelernt" */}
        <linearGradient id={`${id}-success`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4ADE80" />
          <stop offset="100%" stopColor="#22C55E" />
        </linearGradient>

        {/* Äußerer Glow */}
        <radialGradient id={`${id}-outerGlow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD700" stopOpacity="0.4" />
          <stop offset="60%" stopColor="#DAA520" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#B8860B" stopOpacity="0" />
        </radialGradient>

        {/* Glow Filter */}
        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Card Shadow */}
        <filter id={`${id}-cardShadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.3" />
        </filter>

        {/* Shimmer Animation */}
        <linearGradient id={`${id}-shimmer`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0)">
            {animated && (
              <animate attributeName="offset" values="-1;2" dur="2.5s" repeatCount="indefinite" />
            )}
          </stop>
          <stop offset="50%" stopColor="rgba(255,255,255,0.6)">
            {animated && (
              <animate attributeName="offset" values="-0.5;2.5" dur="2.5s" repeatCount="indefinite" />
            )}
          </stop>
          <stop offset="100%" stopColor="rgba(255,255,255,0)">
            {animated && (
              <animate attributeName="offset" values="0;3" dur="2.5s" repeatCount="indefinite" />
            )}
          </stop>
        </linearGradient>
      </defs>

      {/* Äußere Licht-Aura */}
      {glowing && (
        <circle
          cx="32"
          cy="32"
          r="30"
          fill={`url(#${id}-outerGlow)`}
        >
          {animated && (
            <animate
              attributeName="r"
              values="28;32;28"
              dur="3s"
              repeatCount="indefinite"
            />
          )}
        </circle>
      )}

      {/* Äußerer Glow-Ring */}
      {glowing && (
        <GlowRing cx={32} cy={32} r={30} color="#FFD700" animated={animated} />
      )}

      {/* Haupt-Gruppe */}
      <g filter={glowing ? `url(#${id}-glow)` : undefined}>

        {/* ========== HINTERSTE KARTE (versetzt) ========== */}
        <g transform="translate(4, 6)">
          <rect
            x="12"
            y="12"
            width="32"
            height="40"
            rx="4"
            fill={`url(#${id}-goldDark)`}
            opacity="0.6"
          />
        </g>

        {/* ========== MITTLERE KARTE (leicht versetzt) ========== */}
        <g transform="translate(2, 3)">
          <rect
            x="12"
            y="12"
            width="32"
            height="40"
            rx="4"
            fill={`url(#${id}-goldGradient)`}
            stroke={`url(#${id}-goldDark)`}
            strokeWidth="1"
          />
          {/* Pergament-Innenseite */}
          <rect
            x="15"
            y="15"
            width="26"
            height="34"
            rx="2"
            fill={`url(#${id}-parchment)`}
          />
          {/* Linien auf der mittleren Karte */}
          <line x1="18" y1="22" x2="38" y2="22" stroke="#D4BC8A" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="18" y1="28" x2="35" y2="28" stroke="#D4BC8A" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* ========== VORDERSTE KARTE (Hauptkarte) ========== */}
        <g filter={`url(#${id}-cardShadow)`}>
          <rect
            x="12"
            y="12"
            width="32"
            height="40"
            rx="4"
            fill={`url(#${id}-goldGradient)`}
            stroke={`url(#${id}-goldDark)`}
            strokeWidth="1.5"
          />

          {/* Pergament-Innenseite */}
          <rect
            x="15"
            y="15"
            width="26"
            height="34"
            rx="2"
            fill={`url(#${id}-parchment)`}
          />

          {/* Goldener Rand */}
          <rect
            x="15"
            y="15"
            width="26"
            height="34"
            rx="2"
            fill="none"
            stroke={`url(#${id}-goldGradient)`}
            strokeWidth="1"
          />

          {/* Fragezeichen auf der Karte */}
          <text
            x="28"
            y="38"
            textAnchor="middle"
            fill="#8B6914"
            fontSize="18"
            fontWeight="bold"
            fontFamily="Georgia, serif"
          >
            ?
          </text>

          {/* Highlight-Effekt oben */}
          <path
            d="M15 17 Q28 15, 39 17"
            fill="none"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>

        {/* ========== ERFOLGS-HÄKCHEN ========== */}
        <circle
          cx="48"
          cy="16"
          r="8"
          fill={`url(#${id}-success)`}
          stroke="#fff"
          strokeWidth="2"
        >
          {animated && (
            <animate
              attributeName="r"
              values="7;9;7"
              dur="2s"
              repeatCount="indefinite"
            />
          )}
        </circle>
        <path
          d="M44 16 L47 19 L52 13"
          fill="none"
          stroke="#fff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Schimmer-Overlay */}
        {animated && (
          <rect
            x="12"
            y="12"
            width="32"
            height="40"
            rx="4"
            fill={`url(#${id}-shimmer)`}
            style={{ mixBlendMode: 'overlay' }}
          />
        )}
      </g>

      {/* Funkeln um die Karten */}
      {animated && (
        <>
          <Sparkle x={8} y={18} size={4} delay={0} duration={1.5} animated={animated} />
          <Sparkle x={52} y={24} size={5} delay={0.5} duration={1.8} animated={animated} />
          <Sparkle x={10} y={48} size={4} delay={1} duration={1.6} animated={animated} />
          <Sparkle x={54} y={50} size={5} delay={0.7} duration={2} animated={animated} />
          <Sparkle x={32} y={6} size={3} delay={1.2} duration={1.3} animated={animated} />
        </>
      )}
    </svg>
  );
};

export default LootIcon;
