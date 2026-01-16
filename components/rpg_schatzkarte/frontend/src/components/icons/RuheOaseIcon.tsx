import React, { useId } from 'react';
import { IconProps } from './IconDefs';

/**
 * RuheOaseIcon - Weniger Stress
 * Symbolisiert: Entspannung, Stressabbau, innere Ruhe
 * Design: Elegante Lotusblüte auf ruhigem Wasser
 */

export const RuheOaseIcon: React.FC<IconProps> = ({ 
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
        {/* Türkis Gradient */}
        <linearGradient id={`${id}-aquaGradient`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7FDBDA" />
          <stop offset="25%" stopColor="#5BC0BE" />
          <stop offset="50%" stopColor="#3A9188" />
          <stop offset="75%" stopColor="#5BC0BE" />
          <stop offset="100%" stopColor="#2E8B8B" />
        </linearGradient>
        
        <linearGradient id={`${id}-aquaDark`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3A9188" />
          <stop offset="100%" stopColor="#1D5C5C" />
        </linearGradient>

        {/* Lotus Rosa */}
        <linearGradient id={`${id}-lotusGradient`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD1DC" />
          <stop offset="25%" stopColor="#FFB6C1" />
          <stop offset="50%" stopColor="#FF9AA2" />
          <stop offset="75%" stopColor="#FFB6C1" />
          <stop offset="100%" stopColor="#E88D94" />
        </linearGradient>

        <linearGradient id={`${id}-lotusDark`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E88D94" />
          <stop offset="100%" stopColor="#C77B82" />
        </linearGradient>

        {/* Gold Zentrum */}
        <linearGradient id={`${id}-goldGradient`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE55C" />
          <stop offset="25%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#FFC125" />
          <stop offset="75%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#B8860B" />
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

      <g filter={glowing ? `url(#${id}-glow)` : undefined}>
        
        {/* Wasser-Ring */}
        <ellipse cx="32" cy="50" rx="26" ry="8" fill="none" stroke={`url(#${id}-aquaGradient)`} strokeWidth="4" />
        <ellipse cx="32" cy="50" rx="22" ry="6" fill="none" stroke={`url(#${id}-aquaDark)`} strokeWidth="1.5" opacity="0.5" />

        {/* Sanfte Wellen */}
        <path d="M12 50 Q19 46, 26 50 T40 50 T54 50" fill="none" stroke={`url(#${id}-aquaGradient)`} strokeWidth="1.5" opacity="0.4">
          {animated && (
            <animate attributeName="d" values="M12 50 Q19 46, 26 50 T40 50 T54 50;M12 50 Q19 54, 26 50 T40 50 T54 50;M12 50 Q19 46, 26 50 T40 50 T54 50" dur="3s" repeatCount="indefinite" />
          )}
        </path>

        {/* ========== LOTUSBLÜTE ========== */}
        
        {/* Äußere Blätter */}
        <path d="M32 30 Q18 26, 14 14 Q22 20, 32 30" fill={`url(#${id}-lotusGradient)`} stroke={`url(#${id}-lotusDark)`} strokeWidth="0.5" />
        <path d="M32 30 Q46 26, 50 14 Q42 20, 32 30" fill={`url(#${id}-lotusGradient)`} stroke={`url(#${id}-lotusDark)`} strokeWidth="0.5" />
        <path d="M32 30 Q16 30, 8 26 Q16 26, 32 30" fill={`url(#${id}-lotusGradient)`} stroke={`url(#${id}-lotusDark)`} strokeWidth="0.5" />
        <path d="M32 30 Q48 30, 56 26 Q48 26, 32 30" fill={`url(#${id}-lotusGradient)`} stroke={`url(#${id}-lotusDark)`} strokeWidth="0.5" />

        {/* Mittlere Blätter */}
        <path d="M32 28 Q22 22, 20 10 Q26 18, 32 28" fill={`url(#${id}-lotusGradient)`} stroke={`url(#${id}-lotusDark)`} strokeWidth="0.5" />
        <path d="M32 28 Q42 22, 44 10 Q38 18, 32 28" fill={`url(#${id}-lotusGradient)`} stroke={`url(#${id}-lotusDark)`} strokeWidth="0.5" />

        {/* Zentrale Blätter */}
        <path d="M32 26 Q28 16, 28 6 Q32 14, 32 26" fill={`url(#${id}-lotusGradient)`} stroke={`url(#${id}-lotusDark)`} strokeWidth="0.5" />
        <path d="M32 26 Q36 16, 36 6 Q32 14, 32 26" fill={`url(#${id}-lotusGradient)`} stroke={`url(#${id}-lotusDark)`} strokeWidth="0.5" />

        {/* Gold-Zentrum */}
        <circle cx="32" cy="30" r="7" fill={`url(#${id}-goldGradient)`} stroke={`url(#${id}-lotusDark)`} strokeWidth="0.5" />
        <circle cx="30" cy="28" r="1.5" fill="#B8860B" opacity="0.7" />
        <circle cx="34" cy="28" r="1.5" fill="#B8860B" opacity="0.7" />
        <circle cx="32" cy="32" r="1.5" fill="#B8860B" opacity="0.7" />
        
        {/* Highlight */}
        <ellipse cx="30" cy="28" rx="2" ry="1" fill="white" opacity="0.4" />

        {/* Stiel-Andeutung */}
        <ellipse cx="32" cy="42" rx="3" ry="1.5" fill={`url(#${id}-aquaDark)`} opacity="0.5" />

        {/* Schimmer */}
        {animated && (
          <rect x="8" y="4" width="48" height="52" fill={`url(#${id}-shimmer)`} style={{ mixBlendMode: 'overlay' }} />
        )}
      </g>

      {/* Funkeln */}
      {animated && (
        <>
          <path d="M12 18 L13 20 L15 20 L13.5 21.5 L14 24 L12 22.5 L10 24 L10.5 21.5 L9 20 L11 20 Z" fill="#FFF8DC" opacity="0.8">
            <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" />
          </path>
          <path d="M52 16 L53 18 L55 18 L53.5 19.5 L54 22 L52 20.5 L50 22 L50.5 19.5 L49 18 L51 18 Z" fill="#FFF8DC" opacity="0.6">
            <animate attributeName="opacity" values="0;1;0" dur="2s" begin="0.5s" repeatCount="indefinite" />
          </path>
          <path d="M54 40 L55 42 L57 42 L55.5 43.5 L56 46 L54 44.5 L52 46 L52.5 43.5 L51 42 L53 42 Z" fill="#FFF8DC" opacity="0.7">
            <animate attributeName="opacity" values="0;1;0" dur="1.8s" begin="1s" repeatCount="indefinite" />
          </path>
        </>
      )}
    </svg>
  );
};

export default RuheOaseIcon;
