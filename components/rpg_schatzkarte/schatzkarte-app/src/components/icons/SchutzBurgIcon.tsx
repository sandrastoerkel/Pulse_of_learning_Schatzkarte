import React, { useId } from 'react';
import { IconProps } from './IconDefs';

/**
 * SchutzBurgIcon - Mobbing-Schutz
 * Symbolisiert: Schutz, Sicherheit, sich verteidigen können
 * Design: Starke Burg mit leuchtendem Schutzschild
 */

export const SchutzBurgIcon: React.FC<IconProps> = ({ 
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
        {/* Stein Gradient */}
        <linearGradient id={`${id}-stoneGradient`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#90A4AE" />
          <stop offset="25%" stopColor="#78909C" />
          <stop offset="50%" stopColor="#607D8B" />
          <stop offset="75%" stopColor="#78909C" />
          <stop offset="100%" stopColor="#455A64" />
        </linearGradient>

        <linearGradient id={`${id}-stoneDark`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#546E7A" />
          <stop offset="100%" stopColor="#263238" />
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

        {/* Schild Blau */}
        <linearGradient id={`${id}-shieldGradient`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#64B5F6" />
          <stop offset="25%" stopColor="#42A5F5" />
          <stop offset="50%" stopColor="#2196F3" />
          <stop offset="75%" stopColor="#42A5F5" />
          <stop offset="100%" stopColor="#1976D2" />
        </linearGradient>

        <linearGradient id={`${id}-shieldDark`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1976D2" />
          <stop offset="100%" stopColor="#0D47A1" />
        </linearGradient>

        {/* Schild Glow */}
        <radialGradient id={`${id}-shieldGlow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="30%" stopColor="#64B5F6" />
          <stop offset="60%" stopColor="#2196F3" />
          <stop offset="100%" stopColor="#1565C0" stopOpacity="0" />
        </radialGradient>

        {/* Flagge Rot */}
        <linearGradient id={`${id}-flagGradient`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EF5350" />
          <stop offset="50%" stopColor="#E53935" />
          <stop offset="100%" stopColor="#C62828" />
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
        
        {/* ========== LINKER TURM ========== */}
        
        <rect x="6" y="28" width="12" height="30" fill={`url(#${id}-stoneGradient)`} stroke={`url(#${id}-stoneDark)`} strokeWidth="0.5" />
        <rect x="7" y="29" width="3" height="28" fill="#90A4AE" opacity="0.3" />
        
        {/* Zinnen */}
        <rect x="6" y="24" width="4" height="6" fill={`url(#${id}-stoneGradient)`} stroke={`url(#${id}-stoneDark)`} strokeWidth="0.3" />
        <rect x="10" y="26" width="4" height="4" fill={`url(#${id}-stoneGradient)`} stroke={`url(#${id}-stoneDark)`} strokeWidth="0.3" />
        <rect x="14" y="24" width="4" height="6" fill={`url(#${id}-stoneGradient)`} stroke={`url(#${id}-stoneDark)`} strokeWidth="0.3" />
        
        {/* Fenster */}
        <rect x="10" y="36" width="4" height="6" rx="2" fill="#263238" stroke={`url(#${id}-goldGradient)`} strokeWidth="0.5" />

        {/* ========== RECHTER TURM ========== */}
        
        <rect x="46" y="28" width="12" height="30" fill={`url(#${id}-stoneGradient)`} stroke={`url(#${id}-stoneDark)`} strokeWidth="0.5" />
        <rect x="47" y="29" width="3" height="28" fill="#90A4AE" opacity="0.3" />
        
        {/* Zinnen */}
        <rect x="46" y="24" width="4" height="6" fill={`url(#${id}-stoneGradient)`} stroke={`url(#${id}-stoneDark)`} strokeWidth="0.3" />
        <rect x="50" y="26" width="4" height="4" fill={`url(#${id}-stoneGradient)`} stroke={`url(#${id}-stoneDark)`} strokeWidth="0.3" />
        <rect x="54" y="24" width="4" height="6" fill={`url(#${id}-stoneGradient)`} stroke={`url(#${id}-stoneDark)`} strokeWidth="0.3" />
        
        {/* Fenster */}
        <rect x="50" y="36" width="4" height="6" rx="2" fill="#263238" stroke={`url(#${id}-goldGradient)`} strokeWidth="0.5" />

        {/* ========== HAUPTMAUER ========== */}
        
        <rect x="16" y="36" width="32" height="22" fill={`url(#${id}-stoneGradient)`} stroke={`url(#${id}-stoneDark)`} strokeWidth="0.5" />
        <rect x="17" y="37" width="6" height="20" fill="#90A4AE" opacity="0.3" />
        
        {/* Tor */}
        <path d="M26 58 L26 44 Q32 38, 38 44 L38 58 Z" fill="#263238" stroke={`url(#${id}-goldGradient)`} strokeWidth="1" />
        <rect x="27" y="46" width="4" height="11" fill="#37474F" />
        <rect x="33" y="46" width="4" height="11" fill="#37474F" />
        
        {/* Tor-Details */}
        <circle cx="30" cy="52" r="1" fill={`url(#${id}-goldGradient)`} />
        <circle cx="34" cy="52" r="1" fill={`url(#${id}-goldGradient)`} />

        {/* ========== MITTLERER TURM ========== */}
        
        <rect x="26" y="18" width="12" height="20" fill={`url(#${id}-stoneGradient)`} stroke={`url(#${id}-stoneDark)`} strokeWidth="0.5" />
        <rect x="27" y="19" width="3" height="18" fill="#90A4AE" opacity="0.3" />
        
        {/* Zinnen */}
        <rect x="26" y="14" width="4" height="6" fill={`url(#${id}-stoneGradient)`} stroke={`url(#${id}-stoneDark)`} strokeWidth="0.3" />
        <rect x="30" y="16" width="4" height="4" fill={`url(#${id}-stoneGradient)`} stroke={`url(#${id}-stoneDark)`} strokeWidth="0.3" />
        <rect x="34" y="14" width="4" height="6" fill={`url(#${id}-stoneGradient)`} stroke={`url(#${id}-stoneDark)`} strokeWidth="0.3" />

        {/* Flagge */}
        <line x1="32" y1="14" x2="32" y2="2" stroke={`url(#${id}-goldGradient)`} strokeWidth="2" strokeLinecap="round" />
        <path d="M32 2 L44 6 L32 10 Z" fill={`url(#${id}-flagGradient)`} stroke="#C62828" strokeWidth="0.3">
          {animated && (
            <animate attributeName="d" values="M32 2 L44 6 L32 10 Z;M32 2 L42 5 L32 9 Z;M32 2 L44 6 L32 10 Z" dur="1.5s" repeatCount="indefinite" />
          )}
        </path>
        <circle cx="32" cy="2" r="1.5" fill={`url(#${id}-goldGradient)`} />

        {/* ========== SCHUTZSCHILD ========== */}
        
        <g transform="translate(32, 28)">
          {/* Schild-Glow */}
          <circle cx="0" cy="0" r="12" fill={`url(#${id}-shieldGlow)`} opacity="0.4">
            {animated && (
              <>
                <animate attributeName="r" values="10;14;10" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" />
              </>
            )}
          </circle>
          
          {/* Schild-Form */}
          <path
            d="M0 -10 L8 -6 L8 2 Q8 10, 0 14 Q-8 10, -8 2 L-8 -6 Z"
            fill={`url(#${id}-shieldGradient)`}
            stroke={`url(#${id}-shieldDark)`}
            strokeWidth="1"
          />
          
          {/* Schild-Highlight */}
          <path d="M-6 -6 L-2 -8 L-2 0 Q-2 6, -4 8 L-6 6 Z" fill="#90CAF9" opacity="0.4" />
          
          {/* Goldenes Kreuz auf dem Schild */}
          <rect x="-1.5" y="-6" width="3" height="14" rx="0.5" fill={`url(#${id}-goldGradient)`} stroke={`url(#${id}-goldDark)`} strokeWidth="0.3" />
          <rect x="-5" y="-1" width="10" height="3" rx="0.5" fill={`url(#${id}-goldGradient)`} stroke={`url(#${id}-goldDark)`} strokeWidth="0.3" />
          
          {/* Highlight auf dem Kreuz */}
          <ellipse cx="-0.5" cy="-4" rx="1" ry="0.5" fill="white" opacity="0.5" />
        </g>

        {/* Schimmer */}
        {animated && (
          <rect x="4" y="0" width="56" height="60" fill={`url(#${id}-shimmer)`} style={{ mixBlendMode: 'overlay' }} />
        )}
      </g>

      {/* Funkeln */}
      {animated && (
        <>
          <path d="M10 16 L11 18 L13 18 L11.5 19.5 L12 22 L10 20.5 L8 22 L8.5 19.5 L7 18 L9 18 Z" fill="#FFF8DC" opacity="0.8">
            <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" />
          </path>
          <path d="M54 16 L55 18 L57 18 L55.5 19.5 L56 22 L54 20.5 L52 22 L52.5 19.5 L51 18 L53 18 Z" fill="#FFF8DC" opacity="0.6">
            <animate attributeName="opacity" values="0;1;0" dur="2s" begin="0.5s" repeatCount="indefinite" />
          </path>
          <path d="M48 6 L49 8 L51 8 L49.5 9.5 L50 12 L48 10.5 L46 12 L46.5 9.5 L45 8 L47 8 Z" fill="#FFF8DC" opacity="0.7">
            <animate attributeName="opacity" values="0;1;0" dur="1.8s" begin="1s" repeatCount="indefinite" />
          </path>
        </>
      )}
    </svg>
  );
};

export default SchutzBurgIcon;
