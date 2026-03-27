import React, { useId } from 'react';
import { IconProps } from './IconDefs';

/**
 * BrueckenIcon - Transferlernen
 * Symbolisiert: Wissen übertragen, Verbindungen schaffen
 * Design: Elegante goldene Bogenbrücke mit leuchtenden Endpunkten
 */

export const BrueckenIcon: React.FC<IconProps> = ({ 
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

        {/* Stein Gradient */}
        <linearGradient id={`${id}-stoneGradient`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9CA3AF" />
          <stop offset="25%" stopColor="#6B7280" />
          <stop offset="50%" stopColor="#4B5563" />
          <stop offset="75%" stopColor="#6B7280" />
          <stop offset="100%" stopColor="#374151" />
        </linearGradient>

        {/* Cyan Glow für Verbindungspunkte */}
        <radialGradient id={`${id}-cyanGlow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="30%" stopColor="#00E5FF" />
          <stop offset="60%" stopColor="#00B8D4" />
          <stop offset="100%" stopColor="#0097A7" stopOpacity="0" />
        </radialGradient>

        {/* Wasser */}
        <linearGradient id={`${id}-waterGradient`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1E90FF" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#4169E1" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#1E90FF" stopOpacity="0.2" />
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
          <stop offset="50%" stopColor="rgba(255,255,255,0.6)">
            {animated && <animate attributeName="offset" values="-0.5;2.5" dur="2.5s" repeatCount="indefinite" />}
          </stop>
          <stop offset="100%" stopColor="rgba(255,255,255,0)">
            {animated && <animate attributeName="offset" values="0;3" dur="2.5s" repeatCount="indefinite" />}
          </stop>
        </linearGradient>
      </defs>

      {/* Glüh-Ring entfernt */}

      {/* Wasser-Basis */}
      <ellipse cx="32" cy="52" rx="28" ry="8" fill={`url(#${id}-waterGradient)`}>
        {animated && <animate attributeName="ry" values="8;9;8" dur="3s" repeatCount="indefinite" />}
      </ellipse>

      <g filter={glowing ? `url(#${id}-glow)` : undefined}>
        
        {/* Stein-Pfeiler links */}
        <rect x="8" y="40" width="8" height="18" rx="1" fill={`url(#${id}-stoneGradient)`} />
        <rect x="9" y="41" width="2" height="16" fill="#9CA3AF" opacity="0.3" />
        
        {/* Stein-Pfeiler rechts */}
        <rect x="48" y="40" width="8" height="18" rx="1" fill={`url(#${id}-stoneGradient)`} />
        <rect x="49" y="41" width="2" height="16" fill="#9CA3AF" opacity="0.3" />

        {/* Haupt-Bogen */}
        <path
          d="M6 40 Q32 6, 58 40"
          fill="none"
          stroke={`url(#${id}-goldGradient)`}
          strokeWidth="6"
          strokeLinecap="round"
        />
        
        {/* Bogen-Highlight */}
        <path
          d="M8 38 Q32 8, 56 38"
          fill="none"
          stroke="#FFE55C"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.5"
        />

        {/* Brücken-Deck */}
        <rect x="4" y="38" width="56" height="5" rx="1" fill={`url(#${id}-goldGradient)`} stroke={`url(#${id}-goldDark)`} strokeWidth="0.5" />
        
        {/* Deck-Highlight */}
        <rect x="6" y="39" width="52" height="1.5" rx="0.5" fill="#FFE55C" opacity="0.4" />

        {/* Vertikale Streben */}
        <line x1="16" y1="32" x2="16" y2="38" stroke={`url(#${id}-goldGradient)`} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="26" y1="20" x2="26" y2="38" stroke={`url(#${id}-goldGradient)`} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="32" y1="14" x2="32" y2="38" stroke={`url(#${id}-goldGradient)`} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="38" y1="20" x2="38" y2="38" stroke={`url(#${id}-goldGradient)`} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="48" y1="32" x2="48" y2="38" stroke={`url(#${id}-goldGradient)`} strokeWidth="2.5" strokeLinecap="round" />

        {/* Leuchtende Verbindungspunkte */}
        <circle cx="12" cy="40" r="5" fill={`url(#${id}-cyanGlow)`}>
          {animated && <animate attributeName="r" values="4;6;4" dur="1.5s" repeatCount="indefinite" />}
        </circle>
        <circle cx="12" cy="40" r="2" fill="#FFFFFF" />

        <circle cx="52" cy="40" r="5" fill={`url(#${id}-cyanGlow)`}>
          {animated && <animate attributeName="r" values="4;6;4" dur="1.5s" begin="0.5s" repeatCount="indefinite" />}
        </circle>
        <circle cx="52" cy="40" r="2" fill="#FFFFFF" />

        {/* Zentraler Leuchtpunkt */}
        <circle cx="32" cy="12" r="6" fill={`url(#${id}-cyanGlow)`}>
          {animated && <animate attributeName="r" values="5;7;5" dur="2s" repeatCount="indefinite" />}
        </circle>
        <circle cx="32" cy="12" r="2.5" fill="#FFFFFF" />

        {/* Energie-Linie */}
        {animated && (
          <path
            d="M12 40 Q32 6, 52 40"
            fill="none"
            stroke="#00E5FF"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.6"
            strokeDasharray="8 12"
          >
            <animate attributeName="stroke-dashoffset" values="0;-40" dur="1.5s" repeatCount="indefinite" />
          </path>
        )}

        {/* Schimmer */}
        {animated && (
          <rect x="4" y="6" width="56" height="52" fill={`url(#${id}-shimmer)`} style={{ mixBlendMode: 'overlay' }} />
        )}
      </g>

      {/* Funkeln */}
      {animated && (
        <>
          <path d="M20 8 L21 10 L23 10 L21.5 11.5 L22 14 L20 12.5 L18 14 L18.5 11.5 L17 10 L19 10 Z" fill="#FFF8DC" opacity="0.8">
            <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" />
          </path>
          <path d="M44 10 L45 12 L47 12 L45.5 13.5 L46 16 L44 14.5 L42 16 L42.5 13.5 L41 12 L43 12 Z" fill="#FFF8DC" opacity="0.6">
            <animate attributeName="opacity" values="0;1;0" dur="2s" begin="0.6s" repeatCount="indefinite" />
          </path>
        </>
      )}
    </svg>
  );
};

export default BrueckenIcon;
