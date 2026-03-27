import React, { useId } from 'react';
import { IconProps } from './IconDefs';

/**
 * AusdauerGipfelIcon - Länger dranbleiben
 * Symbolisiert: Durchhaltevermögen, Ausdauer, Ziele erreichen
 * Design: Majestätischer Berg mit goldener Siegesflagge
 */

export const AusdauerGipfelIcon: React.FC<IconProps> = ({ 
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
        {/* Berg Gradient */}
        <linearGradient id={`${id}-mountainGradient`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#708090" />
          <stop offset="25%" stopColor="#5D6D7E" />
          <stop offset="50%" stopColor="#4A5568" />
          <stop offset="75%" stopColor="#5D6D7E" />
          <stop offset="100%" stopColor="#2D3748" />
        </linearGradient>
        
        <linearGradient id={`${id}-mountainDark`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4A5568" />
          <stop offset="100%" stopColor="#1A202C" />
        </linearGradient>

        {/* Schnee Gradient */}
        <linearGradient id={`${id}-snowGradient`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="25%" stopColor="#F7FAFC" />
          <stop offset="50%" stopColor="#EDF2F7" />
          <stop offset="75%" stopColor="#F7FAFC" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>

        {/* Gold Gradient */}
        <linearGradient id={`${id}-goldGradient`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE55C" />
          <stop offset="25%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#FFC125" />
          <stop offset="75%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>

        <linearGradient id={`${id}-goldDark`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DAA520" />
          <stop offset="100%" stopColor="#8B6914" />
        </linearGradient>

        {/* Flaggen-Rot */}
        <linearGradient id={`${id}-flagGradient`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6B6B" />
          <stop offset="25%" stopColor="#EE5A5A" />
          <stop offset="50%" stopColor="#E74C3C" />
          <stop offset="75%" stopColor="#EE5A5A" />
          <stop offset="100%" stopColor="#C0392B" />
        </linearGradient>

        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <linearGradient id={`${id}-shimmer`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0)">
            {animated && <animate attributeName="offset" values="-1;2" dur="2.5s" repeatCount="indefinite" />}
          </stop>
          <stop offset="50%" stopColor="rgba(255,255,255,0.5)">
            {animated && <animate attributeName="offset" values="-0.5;2.5" dur="2.5s" repeatCount="indefinite" />}
          </stop>
          <stop offset="100%" stopColor="rgba(255,255,255,0)">
            {animated && <animate attributeName="offset" values="0;3" dur="2.5s" repeatCount="indefinite" />}
          </stop>
        </linearGradient>
      </defs>

      {/* Glüh-Ring entfernt */}

      <g filter={glowing ? `url(#${id}-glow)` : undefined}>
        
        {/* Hintergrund-Berge */}
        <path d="M0 58 L14 36 L28 58 Z" fill={`url(#${id}-mountainDark)`} opacity="0.4" />
        <path d="M36 58 L52 40 L64 58 Z" fill={`url(#${id}-mountainDark)`} opacity="0.4" />

        {/* Hauptberg */}
        <path
          d="M6 58 L32 12 L58 58 Z"
          fill={`url(#${id}-mountainGradient)`}
          stroke={`url(#${id}-mountainDark)`}
          strokeWidth="0.5"
        />

        {/* Berg-Schattenseite */}
        <path d="M32 12 L32 58 L58 58 Z" fill={`url(#${id}-mountainDark)`} opacity="0.4" />

        {/* Fels-Struktur */}
        <path d="M20 48 L26 34" stroke="#2D3748" strokeWidth="0.5" opacity="0.4" />
        <path d="M44 48 L38 34" stroke="#1A202C" strokeWidth="0.5" opacity="0.3" />

        {/* Schneekappe */}
        <path
          d="M32 12 L24 26 Q28 28, 32 26 Q36 28, 40 26 L32 12"
          fill={`url(#${id}-snowGradient)`}
          stroke="#E2E8F0"
          strokeWidth="0.5"
        />
        
        {/* Schnee-Details */}
        <path d="M22 30 Q24 26, 26 28" fill={`url(#${id}-snowGradient)`} opacity="0.6" />
        <path d="M42 30 Q40 26, 38 28" fill={`url(#${id}-snowGradient)`} opacity="0.6" />

        {/* ========== GOLDENE FLAGGE ========== */}
        
        {/* Flaggen-Stange */}
        <line
          x1="32"
          y1="12"
          x2="32"
          y2="-2"
          stroke={`url(#${id}-goldGradient)`}
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Stangen-Highlight */}
        <line x1="31" y1="12" x2="31" y2="-2" stroke="#FFE55C" strokeWidth="0.5" opacity="0.5" />

        {/* Flagge */}
        <path
          d="M32 -2 L46 4 L32 10 Z"
          fill={`url(#${id}-flagGradient)`}
          stroke={`url(#${id}-goldDark)`}
          strokeWidth="0.5"
        >
          {animated && (
            <animate
              attributeName="d"
              values="M32 -2 L46 4 L32 10 Z;M32 -2 L44 3 L32 9 Z;M32 -2 L46 4 L32 10 Z"
              dur="1.5s"
              repeatCount="indefinite"
            />
          )}
        </path>

        {/* Stern auf der Flagge */}
        <path
          d="M38 4 L39 6 L41 6 L39.5 7.5 L40 10 L38 8.5 L36 10 L36.5 7.5 L35 6 L37 6 Z"
          fill={`url(#${id}-goldGradient)`}
        >
          {animated && (
            <animate attributeName="opacity" values="0.8;1;0.8" dur="1s" repeatCount="indefinite" />
          )}
        </path>

        {/* Goldene Kugel oben */}
        <circle cx="32" cy="-2" r="2" fill={`url(#${id}-goldGradient)`} stroke={`url(#${id}-goldDark)`} strokeWidth="0.5" />
        <ellipse cx="31" cy="-3" rx="0.8" ry="0.5" fill="white" opacity="0.5" />

        {/* Schimmer */}
        {animated && (
          <rect x="6" y="-4" width="52" height="64" fill={`url(#${id}-shimmer)`} style={{ mixBlendMode: 'overlay' }} />
        )}
      </g>

      {/* Funkeln */}
      {animated && (
        <>
          <path d="M18 8 L19 10 L21 10 L19.5 11.5 L20 14 L18 12.5 L16 14 L16.5 11.5 L15 10 L17 10 Z" fill="#FFF8DC" opacity="0.8">
            <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" />
          </path>
          <path d="M46 6 L47 8 L49 8 L47.5 9.5 L48 12 L46 10.5 L44 12 L44.5 9.5 L43 8 L45 8 Z" fill="#FFF8DC" opacity="0.6">
            <animate attributeName="opacity" values="0;1;0" dur="2s" begin="0.5s" repeatCount="indefinite" />
          </path>
          <path d="M52 28 L53 30 L55 30 L53.5 31.5 L54 34 L52 32.5 L50 34 L50.5 31.5 L49 30 L51 30 Z" fill="#FFF8DC" opacity="0.7">
            <animate attributeName="opacity" values="0;1;0" dur="1.8s" begin="1s" repeatCount="indefinite" />
          </path>
          <path d="M12 26 L13 28 L15 28 L13.5 29.5 L14 32 L12 30.5 L10 32 L10.5 29.5 L9 28 L11 28 Z" fill="#FFF8DC" opacity="0.6">
            <animate attributeName="opacity" values="0;1;0" dur="2.2s" begin="0.8s" repeatCount="indefinite" />
          </path>
        </>
      )}
    </svg>
  );
};

export default AusdauerGipfelIcon;
