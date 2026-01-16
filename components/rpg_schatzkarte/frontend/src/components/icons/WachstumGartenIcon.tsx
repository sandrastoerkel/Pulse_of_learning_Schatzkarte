import React, { useId } from 'react';
import { IconProps } from './IconDefs';

/**
 * WachstumGartenIcon - Growth Mindset
 * Symbolisiert: Wachstum, Entwicklung, "Ich kann es noch nicht"
 * Design: Eleganter Baum mit goldenen Blättern und leuchtendem Herz
 */

export const WachstumGartenIcon: React.FC<IconProps> = ({ 
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
        {/* Grün Gradient für Blätter */}
        <linearGradient id={`${id}-leafGradient`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#81C784" />
          <stop offset="25%" stopColor="#66BB6A" />
          <stop offset="50%" stopColor="#4CAF50" />
          <stop offset="75%" stopColor="#66BB6A" />
          <stop offset="100%" stopColor="#388E3C" />
        </linearGradient>

        <linearGradient id={`${id}-leafDark`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#388E3C" />
          <stop offset="100%" stopColor="#1B5E20" />
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

        {/* Stamm Braun */}
        <linearGradient id={`${id}-trunkGradient`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6D4C41" />
          <stop offset="25%" stopColor="#8D6E63" />
          <stop offset="50%" stopColor="#A1887F" />
          <stop offset="75%" stopColor="#8D6E63" />
          <stop offset="100%" stopColor="#5D4037" />
        </linearGradient>

        {/* Erde */}
        <linearGradient id={`${id}-earthGradient`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8D6E63" />
          <stop offset="50%" stopColor="#6D4C41" />
          <stop offset="100%" stopColor="#4E342E" />
        </linearGradient>

        {/* Herz-Glow */}
        <radialGradient id={`${id}-heartGlow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="30%" stopColor="#FFD700" />
          <stop offset="60%" stopColor="#FFA000" />
          <stop offset="100%" stopColor="#FF6F00" stopOpacity="0" />
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
        
        {/* Erde/Boden */}
        <ellipse cx="32" cy="56" rx="20" ry="6" fill={`url(#${id}-earthGradient)`} />
        <ellipse cx="32" cy="55" rx="16" ry="4" fill="#8D6E63" opacity="0.3" />

        {/* Stamm */}
        <path
          d="M32 54 L32 34 Q32 30, 32 28"
          fill="none"
          stroke={`url(#${id}-trunkGradient)`}
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M32 54 L32 34"
          fill="none"
          stroke="#A1887F"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.4"
        />

        {/* Äste */}
        <path d="M32 38 Q26 34, 20 30" fill="none" stroke={`url(#${id}-trunkGradient)`} strokeWidth="3" strokeLinecap="round" />
        <path d="M32 38 Q38 34, 44 30" fill="none" stroke={`url(#${id}-trunkGradient)`} strokeWidth="3" strokeLinecap="round" />
        <path d="M32 32 Q24 26, 16 24" fill="none" stroke={`url(#${id}-trunkGradient)`} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M32 32 Q40 26, 48 24" fill="none" stroke={`url(#${id}-trunkGradient)`} strokeWidth="2.5" strokeLinecap="round" />

        {/* Blätterkrone - Hauptform */}
        <ellipse cx="32" cy="20" rx="20" ry="16" fill={`url(#${id}-leafGradient)`} stroke={`url(#${id}-leafDark)`} strokeWidth="0.5" />
        
        {/* Blätter-Details */}
        <ellipse cx="22" cy="18" rx="8" ry="10" fill={`url(#${id}-leafGradient)`} opacity="0.8" />
        <ellipse cx="42" cy="18" rx="8" ry="10" fill={`url(#${id}-leafGradient)`} opacity="0.8" />
        <ellipse cx="32" cy="12" rx="10" ry="8" fill={`url(#${id}-leafGradient)`} opacity="0.9" />

        {/* Blätter-Highlights */}
        <ellipse cx="26" cy="14" rx="4" ry="3" fill="#A5D6A7" opacity="0.5" />
        <ellipse cx="38" cy="16" rx="3" ry="2" fill="#A5D6A7" opacity="0.4" />

        {/* Goldene Früchte/Blüten */}
        <circle cx="18" cy="22" r="3" fill={`url(#${id}-goldGradient)`} stroke={`url(#${id}-goldDark)`} strokeWidth="0.3">
          {animated && <animate attributeName="r" values="2.5;3.5;2.5" dur="2s" repeatCount="indefinite" />}
        </circle>
        <ellipse cx="17" cy="21" rx="1" ry="0.5" fill="white" opacity="0.5" />

        <circle cx="46" cy="20" r="3" fill={`url(#${id}-goldGradient)`} stroke={`url(#${id}-goldDark)`} strokeWidth="0.3">
          {animated && <animate attributeName="r" values="2.5;3.5;2.5" dur="2s" begin="0.4s" repeatCount="indefinite" />}
        </circle>
        <ellipse cx="45" cy="19" rx="1" ry="0.5" fill="white" opacity="0.5" />

        <circle cx="32" cy="8" r="3.5" fill={`url(#${id}-goldGradient)`} stroke={`url(#${id}-goldDark)`} strokeWidth="0.3">
          {animated && <animate attributeName="r" values="3;4;3" dur="2s" begin="0.8s" repeatCount="indefinite" />}
        </circle>
        <ellipse cx="31" cy="7" rx="1.2" ry="0.6" fill="white" opacity="0.5" />

        {/* Leuchtendes Herz im Zentrum */}
        <circle cx="32" cy="20" r="6" fill={`url(#${id}-heartGlow)`} opacity="0.6">
          {animated && <animate attributeName="r" values="5;7;5" dur="2s" repeatCount="indefinite" />}
        </circle>
        <path
          d="M32 24 C28 20, 26 16, 28 14 C30 12, 32 14, 32 14 C32 14, 34 12, 36 14 C38 16, 36 20, 32 24"
          fill={`url(#${id}-goldGradient)`}
          stroke={`url(#${id}-goldDark)`}
          strokeWidth="0.5"
        />
        <ellipse cx="30" cy="16" rx="1.5" ry="1" fill="white" opacity="0.5" />

        {/* Kleine Sprossen */}
        <path d="M24 52 Q22 48, 24 46" fill="none" stroke="#66BB6A" strokeWidth="1.5" strokeLinecap="round" />
        <ellipse cx="23" cy="45" rx="2" ry="3" fill={`url(#${id}-leafGradient)`} />
        
        <path d="M40 52 Q42 48, 40 46" fill="none" stroke="#66BB6A" strokeWidth="1.5" strokeLinecap="round" />
        <ellipse cx="41" cy="45" rx="2" ry="3" fill={`url(#${id}-leafGradient)`} />

        {/* Schimmer */}
        {animated && (
          <rect x="12" y="4" width="40" height="52" fill={`url(#${id}-shimmer)`} style={{ mixBlendMode: 'overlay' }} />
        )}
      </g>

      {/* Funkeln */}
      {animated && (
        <>
          <path d="M10 12 L11 14 L13 14 L11.5 15.5 L12 18 L10 16.5 L8 18 L8.5 15.5 L7 14 L9 14 Z" fill="#FFF8DC" opacity="0.8">
            <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" />
          </path>
          <path d="M54 14 L55 16 L57 16 L55.5 17.5 L56 20 L54 18.5 L52 20 L52.5 17.5 L51 16 L53 16 Z" fill="#FFF8DC" opacity="0.6">
            <animate attributeName="opacity" values="0;1;0" dur="2s" begin="0.5s" repeatCount="indefinite" />
          </path>
          <path d="M50 36 L51 38 L53 38 L51.5 39.5 L52 42 L50 40.5 L48 42 L48.5 39.5 L47 38 L49 38 Z" fill="#FFF8DC" opacity="0.7">
            <animate attributeName="opacity" values="0;1;0" dur="1.8s" begin="1s" repeatCount="indefinite" />
          </path>
        </>
      )}
    </svg>
  );
};

export default WachstumGartenIcon;
