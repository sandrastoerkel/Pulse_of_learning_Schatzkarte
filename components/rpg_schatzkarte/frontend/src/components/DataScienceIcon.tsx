import React from 'react';

/**
 * DataScienceIcon - Schatzkarte-Stil
 * Repräsentiert Data Science Zertifizierung
 * Aufsteigendes Balkendiagramm mit verbundenen Datenpunkten
 */

export const DataScienceIcon = ({
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

        {/* Grün-Gradient für Balken */}
        <linearGradient id={`${id}-greenGradient`} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#15803d" />
          <stop offset="50%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>

        {/* Lila-Gradient für Datenpunkte */}
        <linearGradient id={`${id}-purpleGradient`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>

        {/* Glüh-Effekt */}
        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Datenpunkt-Glühen */}
        <filter id={`${id}-dataGlow`} x="-100%" y="-100%" width="300%" height="300%">
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

        {/* Achsen */}
        <path
          d="M12 52 L12 12 M12 52 L56 52"
          stroke={`url(#${id}-goldGradient)`}
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Pfeilspitzen */}
        <path
          d="M12 12 L9 18 M12 12 L15 18"
          stroke={`url(#${id}-goldGradient)`}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M56 52 L50 49 M56 52 L50 55"
          stroke={`url(#${id}-goldGradient)`}
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Balken - aufsteigend */}
        <rect x="18" y="44" width="8" height="8" rx="1" fill={`url(#${id}-greenGradient)`} stroke={`url(#${id}-goldGradient)`} strokeWidth="1">
          {animated && (
            <animate attributeName="height" values="0;8" dur="0.5s" fill="freeze" />
          )}
        </rect>

        <rect x="30" y="34" width="8" height="18" rx="1" fill={`url(#${id}-greenGradient)`} stroke={`url(#${id}-goldGradient)`} strokeWidth="1">
          {animated && (
            <animate attributeName="height" values="0;18" dur="0.7s" fill="freeze" />
          )}
        </rect>

        <rect x="42" y="20" width="8" height="32" rx="1" fill={`url(#${id}-greenGradient)`} stroke={`url(#${id}-goldGradient)`} strokeWidth="1">
          {animated && (
            <animate attributeName="height" values="0;32" dur="0.9s" fill="freeze" />
          )}
        </rect>

        {/* Trendlinie */}
        <path
          d="M22 40 L34 28 L46 16"
          stroke={`url(#${id}-purpleGradient)`}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          {animated && (
            <animate
              attributeName="stroke-dasharray"
              values="0,100;100,0"
              dur="1.2s"
              fill="freeze"
            />
          )}
        </path>

        {/* Datenpunkte auf Trendlinie */}
        <g filter={`url(#${id}-dataGlow)`}>
          <circle cx="22" cy="40" r="4" fill={`url(#${id}-goldGradient)`}>
            {animated && (
              <animate attributeName="r" values="3;5;3" dur="1.5s" repeatCount="indefinite" />
            )}
          </circle>
          <circle cx="34" cy="28" r="4" fill={`url(#${id}-goldGradient)`}>
            {animated && (
              <animate attributeName="r" values="3;5;3" dur="1.5s" repeatCount="indefinite" begin="0.3s" />
            )}
          </circle>
          <circle cx="46" cy="16" r="4" fill={`url(#${id}-goldGradient)`}>
            {animated && (
              <animate attributeName="r" values="3;5;3" dur="1.5s" repeatCount="indefinite" begin="0.6s" />
            )}
          </circle>
        </g>

        {/* Schimmer-Overlay */}
        {animated && (
          <rect
            x="10"
            y="10"
            width="48"
            height="44"
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
              d="M52 8 L53 10 L55 10 L53.5 11.5 L54 14 L52 12.5 L50 14 L50.5 11.5 L49 10 L51 10 Z"
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
              d="M8 8 L9 10 L11 10 L9.5 11.5 L10 14 L8 12.5 L6 14 L6.5 11.5 L5 10 L7 10 Z"
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
              d="M58 42 L59 44 L61 44 L59.5 45.5 L60 48 L58 46.5 L56 48 L56.5 45.5 L55 44 L57 44 Z"
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

export default DataScienceIcon;
