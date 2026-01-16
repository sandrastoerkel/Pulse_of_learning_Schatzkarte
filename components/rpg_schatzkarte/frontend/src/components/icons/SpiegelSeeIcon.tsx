import React, { useId } from 'react';
import { IconProps } from './IconDefs';

/**
 * SpiegelSeeIcon - Metakognition
 * Symbolisiert: Über das eigene Lernen nachdenken, Reflexion
 * Design: Leuchtendes Gehirn mit Spiegelung im ruhigen See
 */

export const SpiegelSeeIcon: React.FC<IconProps> = ({ 
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
        {/* Lila/Violett Gradient für Gehirn */}
        <linearGradient id={`${id}-mindGradient`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E1BEE7" />
          <stop offset="25%" stopColor="#CE93D8" />
          <stop offset="50%" stopColor="#BA68C8" />
          <stop offset="75%" stopColor="#CE93D8" />
          <stop offset="100%" stopColor="#9C27B0" />
        </linearGradient>

        <linearGradient id={`${id}-mindDark`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9C27B0" />
          <stop offset="100%" stopColor="#6A1B9A" />
        </linearGradient>

        {/* Gold Akzent */}
        <linearGradient id={`${id}-goldGradient`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE55C" />
          <stop offset="25%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#FFC125" />
          <stop offset="75%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>

        {/* Wasser Gradient */}
        <linearGradient id={`${id}-waterGradient`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#64B5F6" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#42A5F5" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#1E88E5" stopOpacity="0.8" />
        </linearGradient>

        {/* Inneres Leuchten */}
        <radialGradient id={`${id}-innerGlow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="40%" stopColor="#E1BEE7" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#9C27B0" stopOpacity="0" />
        </radialGradient>

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
        
        {/* ========== SEE / WASSER ========== */}
        
        {/* Wasser-Ellipse */}
        <ellipse cx="32" cy="50" rx="26" ry="10" fill={`url(#${id}-waterGradient)`} />
        
        {/* Wasser-Oberfläche */}
        <ellipse cx="32" cy="48" rx="24" ry="8" fill="#64B5F6" opacity="0.3" />
        
        {/* Goldener Rand */}
        <ellipse cx="32" cy="50" rx="26" ry="10" fill="none" stroke={`url(#${id}-goldGradient)`} strokeWidth="2" opacity="0.6" />

        {/* Sanfte Wellen */}
        <path d="M10 50 Q18 46, 26 50 T42 50 T54 50" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.3">
          {animated && (
            <animate attributeName="d" values="M10 50 Q18 46, 26 50 T42 50 T54 50;M10 50 Q18 54, 26 50 T42 50 T54 50;M10 50 Q18 46, 26 50 T42 50 T54 50" dur="3s" repeatCount="indefinite" />
          )}
        </path>

        {/* ========== SPIEGELUNG IM WASSER ========== */}
        
        <g opacity="0.35" transform="translate(0, 66) scale(1, -0.4)">
          <ellipse cx="32" cy="24" rx="12" ry="10" fill={`url(#${id}-mindGradient)`} />
          <path d="M24 22 Q28 16, 32 20 Q36 16, 40 22" fill="none" stroke="#E1BEE7" strokeWidth="1.5" opacity="0.6" />
        </g>

        {/* ========== GEHIRN ========== */}
        
        {/* Aura */}
        <ellipse cx="32" cy="22" rx="16" ry="14" fill={`url(#${id}-innerGlow)`} opacity="0.5">
          {animated && <animate attributeName="opacity" values="0.4;0.6;0.4" dur="2.5s" repeatCount="indefinite" />}
        </ellipse>

        {/* Gehirn-Form */}
        <ellipse cx="32" cy="22" rx="14" ry="12" fill={`url(#${id}-mindGradient)`} stroke={`url(#${id}-mindDark)`} strokeWidth="0.5" />

        {/* Gehirn-Windungen */}
        <path d="M22 20 Q26 12, 32 18 Q38 12, 42 20" fill="none" stroke="#E1BEE7" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        <path d="M24 26 Q28 20, 32 24 Q36 20, 40 26" fill="none" stroke="#E1BEE7" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        <path d="M27 30 Q32 26, 37 30" fill="none" stroke="#E1BEE7" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />

        {/* Mittlere Furche */}
        <line x1="32" y1="12" x2="32" y2="32" stroke={`url(#${id}-mindDark)`} strokeWidth="1" opacity="0.3" />

        {/* Leuchtendes Zentrum (Erkenntnis) */}
        <circle cx="32" cy="20" r="4" fill={`url(#${id}-innerGlow)`}>
          {animated && (
            <>
              <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
            </>
          )}
        </circle>
        <circle cx="32" cy="20" r="2" fill="#FFFFFF" />

        {/* Highlight */}
        <ellipse cx="28" cy="16" rx="3" ry="1.5" fill="white" opacity="0.4" />

        {/* ========== AUFSTEIGENDE GEDANKEN ========== */}
        
        {animated && (
          <>
            <circle cx="20" cy="14" r="1.5" fill="#E1BEE7" opacity="0.6">
              <animate attributeName="cy" values="14;8;14" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0.2;0.6" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="44" cy="16" r="1" fill="#CE93D8" opacity="0.5">
              <animate attributeName="cy" values="16;10;16" dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0.1;0.5" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="26" cy="8" r="1.2" fill="#BA68C8" opacity="0.4">
              <animate attributeName="cy" values="8;2;8" dur="2.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0;0.4" dur="2.8s" repeatCount="indefinite" />
            </circle>
          </>
        )}

        {/* Verbindungslinie */}
        {animated && (
          <line x1="32" y1="34" x2="32" y2="42" stroke="#9C27B0" strokeWidth="1" strokeDasharray="2 2" opacity="0.5">
            <animate attributeName="stroke-dashoffset" values="0;-8" dur="1s" repeatCount="indefinite" />
          </line>
        )}

        {/* Schimmer */}
        {animated && (
          <rect x="6" y="4" width="52" height="52" fill={`url(#${id}-shimmer)`} style={{ mixBlendMode: 'overlay' }} />
        )}
      </g>

      {/* Funkeln */}
      {animated && (
        <>
          <path d="M14 10 L15 12 L17 12 L15.5 13.5 L16 16 L14 14.5 L12 16 L12.5 13.5 L11 12 L13 12 Z" fill="#FFF8DC" opacity="0.8">
            <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" />
          </path>
          <path d="M50 12 L51 14 L53 14 L51.5 15.5 L52 18 L50 16.5 L48 18 L48.5 15.5 L47 14 L49 14 Z" fill="#FFF8DC" opacity="0.6">
            <animate attributeName="opacity" values="0;1;0" dur="2s" begin="0.5s" repeatCount="indefinite" />
          </path>
          <path d="M54 40 L55 42 L57 42 L55.5 43.5 L56 46 L54 44.5 L52 46 L52.5 43.5 L51 42 L53 42 Z" fill="#FFF8DC" opacity="0.7">
            <animate attributeName="opacity" values="0;1;0" dur="1.8s" begin="0.8s" repeatCount="indefinite" />
          </path>
        </>
      )}
    </svg>
  );
};

export default SpiegelSeeIcon;
