import React, { useId } from 'react';
import { IconProps, COLORS, Sparkle, GlowRing } from './IconDefs';

/**
 * FestungIcon - Mental stark
 * Symbolisiert: Selbstwirksamkeit, innere Stärke, Resilienz
 * Design: Solide Festung mit leuchtendem Schild/Herz
 */

export const FestungIcon: React.FC<IconProps> = ({ 
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
        {/* Stein-Gradient für Festung */}
        <linearGradient id={`${id}-stoneGradient`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B8B8B" />
          <stop offset="30%" stopColor="#6B6B6B" />
          <stop offset="70%" stopColor="#4A4A4A" />
          <stop offset="100%" stopColor="#2F2F2F" />
        </linearGradient>
        
        <linearGradient id={`${id}-stoneDark`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4A4A4A" />
          <stop offset="100%" stopColor="#1A1A1A" />
        </linearGradient>

        {/* Gold für Akzente */}
        <linearGradient id={`${id}-goldGradient`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE55C" />
          <stop offset="50%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>

        {/* Schild-Gradient (Lila/Power) */}
        <linearGradient id={`${id}-shieldGradient`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#9B59B6" />
          <stop offset="50%" stopColor="#8E44AD" />
          <stop offset="100%" stopColor="#5B2C6F" />
        </linearGradient>

        {/* Herz-Rot */}
        <linearGradient id={`${id}-heartGradient`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FF6B6B" />
          <stop offset="50%" stopColor="#EE5A5A" />
          <stop offset="100%" stopColor="#C0392B" />
        </linearGradient>

        {/* Glow Filter */}
        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Inner Glow für Schild */}
        <filter id={`${id}-innerGlow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feFlood floodColor="#9B59B6" floodOpacity="0.6" result="glowColor" />
          <feComposite in="glowColor" in2="coloredBlur" operator="in" result="softGlow" />
          <feMerge>
            <feMergeNode in="softGlow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Shimmer */}
        <linearGradient id={`${id}-shimmer`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0)">
            {animated && (
              <animate attributeName="offset" values="-1;2" dur="3s" repeatCount="indefinite" />
            )}
          </stop>
          <stop offset="50%" stopColor="rgba(255,255,255,0.4)">
            {animated && (
              <animate attributeName="offset" values="-0.5;2.5" dur="3s" repeatCount="indefinite" />
            )}
          </stop>
          <stop offset="100%" stopColor="rgba(255,255,255,0)">
            {animated && (
              <animate attributeName="offset" values="0;3" dur="3s" repeatCount="indefinite" />
            )}
          </stop>
        </linearGradient>
      </defs>

      {/* Äußerer Glow-Ring */}
      {glowing && (
        <GlowRing cx={32} cy={32} r={30} color="#9B59B6" animated={animated} />
      )}

      {/* Haupt-Gruppe */}
      <g filter={glowing ? `url(#${id}-glow)` : undefined}>
        
        {/* ========== FESTUNG BASIS ========== */}
        
        {/* Hauptmauer */}
        <rect
          x="12"
          y="30"
          width="40"
          height="28"
          rx="2"
          fill={`url(#${id}-stoneGradient)`}
          stroke={`url(#${id}-stoneDark)`}
          strokeWidth="1"
        />

        {/* Zinnen links */}
        <rect x="8" y="26" width="8" height="8" fill={`url(#${id}-stoneGradient)`} stroke={`url(#${id}-stoneDark)`} strokeWidth="0.5" />
        <rect x="8" y="20" width="3" height="6" fill={`url(#${id}-stoneGradient)`} />
        <rect x="13" y="20" width="3" height="6" fill={`url(#${id}-stoneGradient)`} />

        {/* Zinnen rechts */}
        <rect x="48" y="26" width="8" height="8" fill={`url(#${id}-stoneGradient)`} stroke={`url(#${id}-stoneDark)`} strokeWidth="0.5" />
        <rect x="48" y="20" width="3" height="6" fill={`url(#${id}-stoneGradient)`} />
        <rect x="53" y="20" width="3" height="6" fill={`url(#${id}-stoneGradient)`} />

        {/* Mittelturm */}
        <rect
          x="24"
          y="10"
          width="16"
          height="24"
          rx="1"
          fill={`url(#${id}-stoneGradient)`}
          stroke={`url(#${id}-stoneDark)`}
          strokeWidth="1"
        />

        {/* Turm-Zinnen */}
        <rect x="24" y="4" width="4" height="6" fill={`url(#${id}-stoneGradient)`} />
        <rect x="30" y="4" width="4" height="6" fill={`url(#${id}-stoneGradient)`} />
        <rect x="36" y="4" width="4" height="6" fill={`url(#${id}-stoneGradient)`} />

        {/* Tor (Bogen) */}
        <path
          d="M26 58 L26 46 Q26 40, 32 40 Q38 40, 38 46 L38 58 Z"
          fill={`url(#${id}-stoneDark)`}
        />

        {/* Steinstruktur-Details */}
        <line x1="12" y1="40" x2="52" y2="40" stroke="#3A3A3A" strokeWidth="0.5" opacity="0.5" />
        <line x1="12" y1="50" x2="52" y2="50" stroke="#3A3A3A" strokeWidth="0.5" opacity="0.5" />

        {/* ========== SCHILD MIT HERZ ========== */}
        <g filter={`url(#${id}-innerGlow)`}>
          {/* Schild-Form */}
          <path
            d="M32 16 L38 18 L38 26 Q38 32, 32 35 Q26 32, 26 26 L26 18 Z"
            fill={`url(#${id}-shieldGradient)`}
            stroke={`url(#${id}-goldGradient)`}
            strokeWidth="1.5"
          >
            {animated && (
              <animate
                attributeName="opacity"
                values="0.9;1;0.9"
                dur="2s"
                repeatCount="indefinite"
              />
            )}
          </path>
          
          {/* Herz im Schild */}
          <path
            d="M32 22 
               C32 20, 29 19, 28 21
               C27 23, 32 27, 32 27
               C32 27, 37 23, 36 21
               C35 19, 32 20, 32 22"
            fill={`url(#${id}-heartGradient)`}
          >
            {animated && (
              <animate
                attributeName="transform"
                values="scale(1);scale(1.1);scale(1)"
                dur="1.5s"
                repeatCount="indefinite"
                type="scale"
                additive="sum"
              />
            )}
          </path>
        </g>

        {/* Gold-Fahne auf Turm */}
        <line x1="32" y1="4" x2="32" y2="-2" stroke={`url(#${id}-goldGradient)`} strokeWidth="1.5" />
        <path
          d="M32 -2 L40 2 L32 6 Z"
          fill={`url(#${id}-goldGradient)`}
        >
          {animated && (
            <animate
              attributeName="d"
              values="M32 -2 L40 2 L32 6 Z;M32 -2 L39 1 L32 5 Z;M32 -2 L40 2 L32 6 Z"
              dur="2s"
              repeatCount="indefinite"
            />
          )}
        </path>

        {/* Schimmer-Overlay */}
        {animated && (
          <rect
            x="8"
            y="0"
            width="48"
            height="60"
            fill={`url(#${id}-shimmer)`}
            style={{ mixBlendMode: 'overlay' }}
          />
        )}
      </g>

      {/* Funkeln */}
      {animated && (
        <>
          <Sparkle x={18} y={12} size={4} delay={0} duration={1.8} animated={animated} />
          <Sparkle x={46} y={18} size={5} delay={0.5} duration={1.5} animated={animated} />
          <Sparkle x={50} y={45} size={4} delay={1} duration={2} animated={animated} />
        </>
      )}
    </svg>
  );
};

export default FestungIcon;
