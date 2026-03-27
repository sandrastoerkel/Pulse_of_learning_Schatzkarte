import React, { useId } from 'react';
import { IconProps } from './IconDefs';

/**
 * LehrerTurmIcon - Lehrer-Schüler-Beziehung
 * Symbolisiert: Unterstützung, Mentoring, Vertrauen zum Lehrer
 * Design: Eleganter Turm mit zwei verbundenen Sternen (Lehrer & Schüler)
 */

export const LehrerTurmIcon: React.FC<IconProps> = ({ 
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
        {/* Blau Gradient für Turm */}
        <linearGradient id={`${id}-towerGradient`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#5C6BC0" />
          <stop offset="25%" stopColor="#7986CB" />
          <stop offset="50%" stopColor="#9FA8DA" />
          <stop offset="75%" stopColor="#7986CB" />
          <stop offset="100%" stopColor="#3F51B5" />
        </linearGradient>

        <linearGradient id={`${id}-towerDark`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3F51B5" />
          <stop offset="100%" stopColor="#1A237E" />
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

        {/* Warm Orange für Verbindung */}
        <linearGradient id={`${id}-warmGradient`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFCC80" />
          <stop offset="25%" stopColor="#FFB74D" />
          <stop offset="50%" stopColor="#FFA726" />
          <stop offset="75%" stopColor="#FFB74D" />
          <stop offset="100%" stopColor="#F57C00" />
        </linearGradient>

        {/* Stern Glow */}
        <radialGradient id={`${id}-starGlow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="30%" stopColor="#FFD700" />
          <stop offset="60%" stopColor="#FFA000" />
          <stop offset="100%" stopColor="#FF6F00" stopOpacity="0" />
        </radialGradient>

        {/* Verbindungs-Glow */}
        <linearGradient id={`${id}-connectionGlow`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFD700" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#FFA000" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FFD700" stopOpacity="0.2" />
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
        
        {/* Turm-Basis */}
        <path d="M22 58 L22 38 L42 38 L42 58 Z" fill={`url(#${id}-towerGradient)`} stroke={`url(#${id}-towerDark)`} strokeWidth="0.5" />
        <rect x="24" y="39" width="4" height="18" fill="#9FA8DA" opacity="0.3" />

        {/* Turm-Mittelteil */}
        <path d="M20 38 L24 24 L40 24 L44 38 Z" fill={`url(#${id}-towerGradient)`} stroke={`url(#${id}-towerDark)`} strokeWidth="0.5" />
        <path d="M22 37 L25 26 L28 26 L26 37 Z" fill="#9FA8DA" opacity="0.3" />

        {/* Turm-Spitze */}
        <path d="M24 24 L32 8 L40 24 Z" fill={`url(#${id}-towerGradient)`} stroke={`url(#${id}-towerDark)`} strokeWidth="0.5" />
        <path d="M28 22 L32 12 L34 12 L31 22 Z" fill="#9FA8DA" opacity="0.3" />

        {/* Goldene Kuppel */}
        <ellipse cx="32" cy="8" rx="4" ry="2" fill={`url(#${id}-goldGradient)`} stroke={`url(#${id}-goldDark)`} strokeWidth="0.3" />
        <ellipse cx="31" cy="7" rx="1.5" ry="0.6" fill="white" opacity="0.5" />

        {/* Goldene Spitze */}
        <circle cx="32" cy="4" r="2" fill={`url(#${id}-goldGradient)`} stroke={`url(#${id}-goldDark)`} strokeWidth="0.3" />
        <ellipse cx="31" cy="3" rx="0.8" ry="0.4" fill="white" opacity="0.5" />

        {/* Fenster */}
        <rect x="28" y="28" width="8" height="8" rx="1" fill="#1A237E" stroke={`url(#${id}-goldGradient)`} strokeWidth="1" />
        <rect x="29" y="29" width="2.5" height="6" fill="#FFF8E1" opacity="0.4" />
        <rect x="32.5" y="29" width="2.5" height="6" fill="#FFF8E1" opacity="0.4" />

        <rect x="27" y="44" width="10" height="12" rx="1" fill="#1A237E" stroke={`url(#${id}-goldGradient)`} strokeWidth="1" />
        <rect x="28" y="45" width="3" height="10" fill="#FFF8E1" opacity="0.4" />
        <rect x="33" y="45" width="3" height="10" fill="#FFF8E1" opacity="0.4" />

        {/* ========== VERBINDUNG: ZWEI STERNE ========== */}
        
        {/* Verbindungslinie */}
        <path d="M12 24 Q22 20, 32 16" fill="none" stroke={`url(#${id}-connectionGlow)`} strokeWidth="4" strokeLinecap="round">
          {animated && (
            <animate attributeName="stroke-width" values="3;5;3" dur="2s" repeatCount="indefinite" />
          )}
        </path>
        <path d="M12 24 Q22 20, 32 16" fill="none" stroke={`url(#${id}-warmGradient)`} strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4">
          {animated && (
            <animate attributeName="stroke-dashoffset" values="0;-16" dur="1.5s" repeatCount="indefinite" />
          )}
        </path>

        {/* Großer Stern (Lehrer) - oben am Turm */}
        <circle cx="32" cy="16" r="6" fill={`url(#${id}-starGlow)`} opacity="0.6">
          {animated && <animate attributeName="r" values="5;7;5" dur="2s" repeatCount="indefinite" />}
        </circle>
        <path
          d="M32 10 L33.5 14 L38 14.5 L34.5 17 L35.5 21 L32 18.5 L28.5 21 L29.5 17 L26 14.5 L30.5 14 Z"
          fill={`url(#${id}-goldGradient)`}
          stroke={`url(#${id}-goldDark)`}
          strokeWidth="0.3"
        />
        <ellipse cx="30" cy="14" rx="1.5" ry="1" fill="white" opacity="0.5" />

        {/* Kleiner Stern (Schüler) - links unten */}
        <circle cx="12" cy="24" r="5" fill={`url(#${id}-starGlow)`} opacity="0.5">
          {animated && <animate attributeName="r" values="4;6;4" dur="2s" begin="0.5s" repeatCount="indefinite" />}
        </circle>
        <path
          d="M12 19 L13.2 22 L16.5 22.3 L14 24.3 L14.8 27.5 L12 25.5 L9.2 27.5 L10 24.3 L7.5 22.3 L10.8 22 Z"
          fill={`url(#${id}-warmGradient)`}
          stroke="#F57C00"
          strokeWidth="0.3"
        />
        <ellipse cx="10.5" cy="22" rx="1" ry="0.6" fill="white" opacity="0.5" />

        {/* Energie-Partikel auf der Verbindung */}
        {animated && (
          <>
            <circle cx="18" cy="22" r="1.5" fill="#FFD700">
              <animate attributeName="cx" values="12;32;12" dur="2s" repeatCount="indefinite" />
              <animate attributeName="cy" values="24;16;24" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="24" cy="19" r="1" fill="#FFA000">
              <animate attributeName="cx" values="12;32;12" dur="2s" begin="0.7s" repeatCount="indefinite" />
              <animate attributeName="cy" values="24;16;24" dur="2s" begin="0.7s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;0.8;0" dur="2s" begin="0.7s" repeatCount="indefinite" />
            </circle>
          </>
        )}

        {/* Schimmer */}
        {animated && (
          <rect x="6" y="2" width="52" height="58" fill={`url(#${id}-shimmer)`} style={{ mixBlendMode: 'overlay' }} />
        )}
      </g>

      {/* Funkeln */}
      {animated && (
        <>
          <path d="M52 12 L53 14 L55 14 L53.5 15.5 L54 18 L52 16.5 L50 18 L50.5 15.5 L49 14 L51 14 Z" fill="#FFF8DC" opacity="0.8">
            <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" />
          </path>
          <path d="M50 44 L51 46 L53 46 L51.5 47.5 L52 50 L50 48.5 L48 50 L48.5 47.5 L47 46 L49 46 Z" fill="#FFF8DC" opacity="0.6">
            <animate attributeName="opacity" values="0;1;0" dur="2s" begin="0.5s" repeatCount="indefinite" />
          </path>
          <path d="M6 40 L7 42 L9 42 L7.5 43.5 L8 46 L6 44.5 L4 46 L4.5 43.5 L3 42 L5 42 Z" fill="#FFF8DC" opacity="0.7">
            <animate attributeName="opacity" values="0;1;0" dur="1.8s" begin="1s" repeatCount="indefinite" />
          </path>
        </>
      )}
    </svg>
  );
};

export default LehrerTurmIcon;
