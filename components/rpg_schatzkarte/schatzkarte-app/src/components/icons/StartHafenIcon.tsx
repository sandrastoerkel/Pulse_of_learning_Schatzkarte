import React, { useId } from 'react';
import { IconProps, COLORS, Sparkle, GlowRing } from './IconDefs';

/**
 * StartHafenIcon - Der Anfang der Lernreise
 * Symbolisiert: Willkommen, Aufbruch, Orientierung
 * Design: Anker mit integrierter Kompass-Rose
 */

export const StartHafenIcon: React.FC<IconProps> = ({ 
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
        {/* Bronze/Messing Gradient für Anker */}
        <linearGradient id={`${id}-anchorGradient`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DEB887" />
          <stop offset="25%" stopColor="#CD9B5A" />
          <stop offset="50%" stopColor="#CD7F32" />
          <stop offset="75%" stopColor="#B8860B" />
          <stop offset="100%" stopColor="#8B6914" />
        </linearGradient>
        
        <linearGradient id={`${id}-anchorDark`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B6914" />
          <stop offset="100%" stopColor="#5C4010" />
        </linearGradient>

        {/* Kompass Gold */}
        <linearGradient id={`${id}-compassGold`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE55C" />
          <stop offset="50%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>

        {/* Kompass Rot für Nord */}
        <linearGradient id={`${id}-compassRed`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#DC3545" />
          <stop offset="100%" stopColor="#8B0000" />
        </linearGradient>

        {/* Glow Filter */}
        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Shimmer Animation */}
        <linearGradient id={`${id}-shimmer`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0)">
            {animated && (
              <animate attributeName="offset" values="-1;2" dur="3s" repeatCount="indefinite" />
            )}
          </stop>
          <stop offset="50%" stopColor="rgba(255,255,255,0.5)">
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
        <GlowRing cx={32} cy={32} r={30} color="#CD7F32" animated={animated} />
      )}

      {/* Haupt-Gruppe mit Glow */}
      <g filter={glowing ? `url(#${id}-glow)` : undefined}>
        
        {/* ========== ANKER ========== */}
        
        {/* Anker-Schaft (vertikal) */}
        <rect
          x="29"
          y="22"
          width="6"
          height="32"
          rx="2"
          fill={`url(#${id}-anchorGradient)`}
          stroke={`url(#${id}-anchorDark)`}
          strokeWidth="0.5"
        />
        
        {/* Anker-Querbalken oben */}
        <rect
          x="22"
          y="26"
          width="20"
          height="5"
          rx="2"
          fill={`url(#${id}-anchorGradient)`}
          stroke={`url(#${id}-anchorDark)`}
          strokeWidth="0.5"
        />

        {/* Anker-Haken links */}
        <path
          d="M22 54 Q22 58, 18 58 Q12 58, 12 52 Q12 48, 18 48 L22 48"
          fill="none"
          stroke={`url(#${id}-anchorGradient)`}
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M18 58 L14 62"
          stroke={`url(#${id}-anchorGradient)`}
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Anker-Haken rechts */}
        <path
          d="M42 54 Q42 58, 46 58 Q52 58, 52 52 Q52 48, 46 48 L42 48"
          fill="none"
          stroke={`url(#${id}-anchorGradient)`}
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M46 58 L50 62"
          stroke={`url(#${id}-anchorGradient)`}
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* ========== KOMPASS-ROSE (im Ring oben) ========== */}
        
        {/* Kompass-Kreis (Basis) */}
        <circle
          cx="32"
          cy="14"
          r="10"
          fill="#1a1a2e"
          stroke={`url(#${id}-compassGold)`}
          strokeWidth="2"
        />
        
        {/* Kompass innerer Ring */}
        <circle
          cx="32"
          cy="14"
          r="7"
          fill="none"
          stroke={`url(#${id}-compassGold)`}
          strokeWidth="0.5"
          opacity="0.6"
        />

        {/* Nord-Pfeil (rot) */}
        <path
          d="M32 6 L34 14 L32 12 L30 14 Z"
          fill={`url(#${id}-compassRed)`}
        />
        
        {/* Süd-Pfeil (weiß) */}
        <path
          d="M32 22 L34 14 L32 16 L30 14 Z"
          fill="#F5F5F5"
        />
        
        {/* Ost-Pfeil */}
        <path
          d="M40 14 L32 16 L34 14 L32 12 Z"
          fill={`url(#${id}-compassGold)`}
        />
        
        {/* West-Pfeil */}
        <path
          d="M24 14 L32 16 L30 14 L32 12 Z"
          fill={`url(#${id}-compassGold)`}
        />

        {/* Kompass Mitte */}
        <circle
          cx="32"
          cy="14"
          r="2"
          fill={`url(#${id}-compassGold)`}
        />

        {/* N-Markierung */}
        <text
          x="32"
          y="6"
          textAnchor="middle"
          fontSize="3"
          fill="#FFD700"
          fontWeight="bold"
          style={{ fontFamily: 'serif' }}
        >
          N
        </text>

        {/* Schimmer-Overlay */}
        {animated && (
          <rect
            x="12"
            y="4"
            width="40"
            height="60"
            fill={`url(#${id}-shimmer)`}
            style={{ mixBlendMode: 'overlay' }}
          />
        )}
      </g>

      {/* Funkeln */}
      {animated && (
        <>
          <Sparkle x={10} y={20} size={5} delay={0} duration={1.5} animated={animated} />
          <Sparkle x={54} y={35} size={4} delay={0.7} duration={2} animated={animated} />
          <Sparkle x={48} y={10} size={5} delay={1.2} duration={1.8} animated={animated} />
        </>
      )}
    </svg>
  );
};

export default StartHafenIcon;
