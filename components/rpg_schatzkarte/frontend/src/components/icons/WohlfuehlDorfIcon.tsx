import React, { useId } from 'react';
import { IconProps } from './IconDefs';

/**
 * WohlfuehlDorfIcon - Zugehörigkeit
 * Symbolisiert: Gemeinschaft, sich willkommen fühlen, Zusammenhalt
 * Design: Gemütliches Dorf mit warmen Lichtern und verbundenen Herzen
 */

export const WohlfuehlDorfIcon: React.FC<IconProps> = ({ 
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
        {/* Warmes Rot für Dächer */}
        <linearGradient id={`${id}-roofGradient`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EF9A9A" />
          <stop offset="25%" stopColor="#E57373" />
          <stop offset="50%" stopColor="#EF5350" />
          <stop offset="75%" stopColor="#E57373" />
          <stop offset="100%" stopColor="#C62828" />
        </linearGradient>

        <linearGradient id={`${id}-roofDark`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C62828" />
          <stop offset="100%" stopColor="#8E0000" />
        </linearGradient>

        {/* Creme für Hauswände */}
        <linearGradient id={`${id}-wallGradient`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFF8E1" />
          <stop offset="25%" stopColor="#FFECB3" />
          <stop offset="50%" stopColor="#FFE082" />
          <stop offset="75%" stopColor="#FFECB3" />
          <stop offset="100%" stopColor="#FFD54F" />
        </linearGradient>

        {/* Gold Gradient */}
        <linearGradient id={`${id}-goldGradient`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE55C" />
          <stop offset="25%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#FFC125" />
          <stop offset="75%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>

        {/* Warmes Licht */}
        <radialGradient id={`${id}-warmLight`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="30%" stopColor="#FFECB3" />
          <stop offset="60%" stopColor="#FFB74D" />
          <stop offset="100%" stopColor="#FF8F00" stopOpacity="0" />
        </radialGradient>

        {/* Herz Glow */}
        <radialGradient id={`${id}-heartGlow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="30%" stopColor="#FF80AB" />
          <stop offset="60%" stopColor="#F50057" />
          <stop offset="100%" stopColor="#C51162" stopOpacity="0" />
        </radialGradient>

        {/* Gras */}
        <linearGradient id={`${id}-grassGradient`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#81C784" />
          <stop offset="50%" stopColor="#66BB6A" />
          <stop offset="100%" stopColor="#4CAF50" />
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
        
        {/* Gras/Boden */}
        <ellipse cx="32" cy="56" rx="28" ry="8" fill={`url(#${id}-grassGradient)`} />
        <ellipse cx="32" cy="54" rx="24" ry="5" fill="#A5D6A7" opacity="0.4" />

        {/* ========== LINKES HAUS (klein) ========== */}
        
        {/* Wand */}
        <rect x="6" y="40" width="14" height="16" rx="1" fill={`url(#${id}-wallGradient)`} stroke="#FFB74D" strokeWidth="0.5" />
        <rect x="7" y="41" width="3" height="14" fill="white" opacity="0.3" />
        
        {/* Dach */}
        <path d="M4 40 L13 28 L22 40 Z" fill={`url(#${id}-roofGradient)`} stroke={`url(#${id}-roofDark)`} strokeWidth="0.5" />
        <path d="M6 39 L13 30 L15 30 L9 39 Z" fill="#EF9A9A" opacity="0.4" />
        
        {/* Fenster mit Licht */}
        <rect x="9" y="44" width="6" height="6" rx="0.5" fill="#5D4037" stroke={`url(#${id}-goldGradient)`} strokeWidth="0.5" />
        <circle cx="12" cy="47" r="4" fill={`url(#${id}-warmLight)`} opacity="0.6">
          {animated && <animate attributeName="opacity" values="0.5;0.8;0.5" dur="2s" repeatCount="indefinite" />}
        </circle>
        <rect x="10" y="45" width="2" height="4" fill="#FFF8E1" opacity="0.6" />
        <rect x="13" y="45" width="2" height="4" fill="#FFF8E1" opacity="0.6" />

        {/* ========== MITTLERES HAUS (groß) ========== */}
        
        {/* Wand */}
        <rect x="22" y="32" width="20" height="24" rx="1" fill={`url(#${id}-wallGradient)`} stroke="#FFB74D" strokeWidth="0.5" />
        <rect x="23" y="33" width="4" height="22" fill="white" opacity="0.3" />
        
        {/* Dach */}
        <path d="M20 32 L32 14 L44 32 Z" fill={`url(#${id}-roofGradient)`} stroke={`url(#${id}-roofDark)`} strokeWidth="0.5" />
        <path d="M22 31 L32 17 L35 17 L27 31 Z" fill="#EF9A9A" opacity="0.4" />
        
        {/* Schornstein */}
        <rect x="36" y="18" width="4" height="8" fill={`url(#${id}-roofGradient)`} />
        
        {/* Fenster oben */}
        <rect x="28" y="36" width="8" height="6" rx="0.5" fill="#5D4037" stroke={`url(#${id}-goldGradient)`} strokeWidth="0.5" />
        <circle cx="32" cy="39" r="5" fill={`url(#${id}-warmLight)`} opacity="0.7">
          {animated && <animate attributeName="opacity" values="0.6;0.9;0.6" dur="2s" begin="0.3s" repeatCount="indefinite" />}
        </circle>
        <rect x="29" y="37" width="3" height="4" fill="#FFF8E1" opacity="0.6" />
        <rect x="33" y="37" width="3" height="4" fill="#FFF8E1" opacity="0.6" />
        
        {/* Tür */}
        <rect x="29" y="46" width="6" height="10" rx="1" fill="#6D4C41" stroke={`url(#${id}-goldGradient)`} strokeWidth="0.5" />
        <circle cx="33" cy="52" r="1" fill={`url(#${id}-goldGradient)`} />

        {/* ========== RECHTES HAUS (klein) ========== */}
        
        {/* Wand */}
        <rect x="44" y="40" width="14" height="16" rx="1" fill={`url(#${id}-wallGradient)`} stroke="#FFB74D" strokeWidth="0.5" />
        <rect x="45" y="41" width="3" height="14" fill="white" opacity="0.3" />
        
        {/* Dach */}
        <path d="M42 40 L51 28 L60 40 Z" fill={`url(#${id}-roofGradient)`} stroke={`url(#${id}-roofDark)`} strokeWidth="0.5" />
        <path d="M44 39 L51 30 L53 30 L47 39 Z" fill="#EF9A9A" opacity="0.4" />
        
        {/* Fenster mit Licht */}
        <rect x="49" y="44" width="6" height="6" rx="0.5" fill="#5D4037" stroke={`url(#${id}-goldGradient)`} strokeWidth="0.5" />
        <circle cx="52" cy="47" r="4" fill={`url(#${id}-warmLight)`} opacity="0.6">
          {animated && <animate attributeName="opacity" values="0.5;0.8;0.5" dur="2s" begin="0.6s" repeatCount="indefinite" />}
        </circle>
        <rect x="50" y="45" width="2" height="4" fill="#FFF8E1" opacity="0.6" />
        <rect x="53" y="45" width="2" height="4" fill="#FFF8E1" opacity="0.6" />

        {/* ========== ZENTRALES HERZ (Gemeinschaft) ========== */}
        
        <circle cx="32" cy="10" r="7" fill={`url(#${id}-heartGlow)`} opacity="0.5">
          {animated && <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite" />}
        </circle>
        <path
          d="M32 16 C27 11, 24 6, 27 3 C30 0, 32 3, 32 3 C32 3, 34 0, 37 3 C40 6, 37 11, 32 16"
          fill="#F50057"
          stroke="#C51162"
          strokeWidth="0.5"
        />
        <ellipse cx="29" cy="5" rx="2" ry="1.2" fill="white" opacity="0.5" />

        {/* Verbindungslinien zu den Häusern */}
        {animated && (
          <>
            <path d="M32 16 Q22 24, 13 28" fill="none" stroke="#FF80AB" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5">
              <animate attributeName="stroke-dashoffset" values="0;-12" dur="2s" repeatCount="indefinite" />
            </path>
            <path d="M32 16 Q42 24, 51 28" fill="none" stroke="#FF80AB" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5">
              <animate attributeName="stroke-dashoffset" values="0;-12" dur="2s" repeatCount="indefinite" />
            </path>
          </>
        )}

        {/* Schimmer */}
        {animated && (
          <rect x="4" y="2" width="56" height="56" fill={`url(#${id}-shimmer)`} style={{ mixBlendMode: 'overlay' }} />
        )}
      </g>

      {/* Funkeln */}
      {animated && (
        <>
          <path d="M8 22 L9 24 L11 24 L9.5 25.5 L10 28 L8 26.5 L6 28 L6.5 25.5 L5 24 L7 24 Z" fill="#FFF8DC" opacity="0.8">
            <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" />
          </path>
          <path d="M56 22 L57 24 L59 24 L57.5 25.5 L58 28 L56 26.5 L54 28 L54.5 25.5 L53 24 L55 24 Z" fill="#FFF8DC" opacity="0.6">
            <animate attributeName="opacity" values="0;1;0" dur="2s" begin="0.5s" repeatCount="indefinite" />
          </path>
          <path d="M32 2 L33 4 L35 4 L33.5 5.5 L34 8 L32 6.5 L30 8 L30.5 5.5 L29 4 L31 4 Z" fill="#FFF8DC" opacity="0.7">
            <animate attributeName="opacity" values="0;1;0" dur="1.8s" begin="1s" repeatCount="indefinite" />
          </path>
        </>
      )}
    </svg>
  );
};

export default WohlfuehlDorfIcon;
