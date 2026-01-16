import React, { useId } from 'react';
import { IconProps, Sparkle, GlowRing } from './IconDefs';

/**
 * PolarsternIcon - Ziele setzen, Navigation
 * Symbolisiert: Orientierung, Ziele, Richtung finden
 * Design: Leuchtender Kompass-Stern mit 8 Zacken, inspiriert vom Original
 */

export const PolarsternIcon: React.FC<IconProps> = ({ 
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
        {/* Haupt-Blau Gradient (Hauptzacken) */}
        <linearGradient id={`${id}-blueGradient`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00D4FF" />
          <stop offset="30%" stopColor="#00A8CC" />
          <stop offset="60%" stopColor="#0077B6" />
          <stop offset="100%" stopColor="#023E8A" />
        </linearGradient>
        
        {/* Dunkles Blau für Schatten */}
        <linearGradient id={`${id}-blueDark`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0077B6" />
          <stop offset="100%" stopColor="#03045E" />
        </linearGradient>

        {/* Helles Cyan für Akzente */}
        <linearGradient id={`${id}-cyanLight`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="30%" stopColor="#E0FFFF" />
          <stop offset="100%" stopColor="#00D4FF" />
        </linearGradient>

        {/* Weißer Kern-Glow */}
        <radialGradient id={`${id}-coreGlow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
          <stop offset="30%" stopColor="#E0FFFF" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#00D4FF" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#0077B6" stopOpacity="0" />
        </radialGradient>

        {/* Äußerer Licht-Aura */}
        <radialGradient id={`${id}-outerGlow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#0077B6" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#023E8A" stopOpacity="0" />
        </radialGradient>

        {/* Gold für kleine Akzente */}
        <linearGradient id={`${id}-goldAccent`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE55C" />
          <stop offset="50%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>

        {/* Glow Filter */}
        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Starker Stern-Glow */}
        <filter id={`${id}-starGlow`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feFlood floodColor="#00D4FF" floodOpacity="0.6" result="glowColor" />
          <feComposite in="glowColor" in2="coloredBlur" operator="in" result="softGlow" />
          <feMerge>
            <feMergeNode in="softGlow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Shimmer Animation */}
        <linearGradient id={`${id}-shimmer`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0)">
            {animated && (
              <animate attributeName="offset" values="-1;2" dur="2.5s" repeatCount="indefinite" />
            )}
          </stop>
          <stop offset="50%" stopColor="rgba(255,255,255,0.7)">
            {animated && (
              <animate attributeName="offset" values="-0.5;2.5" dur="2.5s" repeatCount="indefinite" />
            )}
          </stop>
          <stop offset="100%" stopColor="rgba(255,255,255,0)">
            {animated && (
              <animate attributeName="offset" values="0;3" dur="2.5s" repeatCount="indefinite" />
            )}
          </stop>
        </linearGradient>
      </defs>

      {/* Äußere Licht-Aura */}
      {glowing && (
        <circle
          cx="32"
          cy="32"
          r="30"
          fill={`url(#${id}-outerGlow)`}
        >
          {animated && (
            <animate
              attributeName="r"
              values="28;32;28"
              dur="3s"
              repeatCount="indefinite"
            />
          )}
        </circle>
      )}

      {/* Äußerer Glow-Ring */}
      {glowing && (
        <GlowRing cx={32} cy={32} r={30} color="#00D4FF" animated={animated} />
      )}

      {/* Haupt-Gruppe */}
      <g filter={glowing ? `url(#${id}-starGlow)` : undefined}>
        
        {/* ========== 8-ZACKIGER STERN ========== */}
        
        {/* Haupt-Zacken (4 große - Nord, Süd, Ost, West) */}
        
        {/* Nord-Zacke */}
        <path
          d="M32 4 L35 26 L32 30 L29 26 Z"
          fill={`url(#${id}-blueGradient)`}
          stroke={`url(#${id}-blueDark)`}
          strokeWidth="0.5"
        />
        {/* Nord-Zacke Highlight */}
        <path
          d="M32 4 L33 24 L32 28 Z"
          fill={`url(#${id}-cyanLight)`}
          opacity="0.6"
        />

        {/* Süd-Zacke */}
        <path
          d="M32 60 L35 38 L32 34 L29 38 Z"
          fill={`url(#${id}-blueGradient)`}
          stroke={`url(#${id}-blueDark)`}
          strokeWidth="0.5"
        />
        <path
          d="M32 60 L31 40 L32 36 Z"
          fill={`url(#${id}-cyanLight)`}
          opacity="0.4"
        />

        {/* Ost-Zacke */}
        <path
          d="M60 32 L38 35 L34 32 L38 29 Z"
          fill={`url(#${id}-blueGradient)`}
          stroke={`url(#${id}-blueDark)`}
          strokeWidth="0.5"
        />
        <path
          d="M60 32 L40 31 L36 32 Z"
          fill={`url(#${id}-cyanLight)`}
          opacity="0.5"
        />

        {/* West-Zacke */}
        <path
          d="M4 32 L26 35 L30 32 L26 29 Z"
          fill={`url(#${id}-blueGradient)`}
          stroke={`url(#${id}-blueDark)`}
          strokeWidth="0.5"
        />
        <path
          d="M4 32 L24 33 L28 32 Z"
          fill={`url(#${id}-cyanLight)`}
          opacity="0.5"
        />

        {/* Diagonal-Zacken (4 kleinere - NE, SE, SW, NW) */}
        
        {/* Nordost */}
        <path
          d="M50 14 L36 28 L34 30 L36 26 Z"
          fill={`url(#${id}-blueDark)`}
          stroke={`url(#${id}-blueDark)`}
          strokeWidth="0.3"
        />
        <path
          d="M50 14 L37 27 L35 29 Z"
          fill={`url(#${id}-cyanLight)`}
          opacity="0.3"
        />

        {/* Südost */}
        <path
          d="M50 50 L36 36 L34 34 L36 38 Z"
          fill={`url(#${id}-blueDark)`}
          stroke={`url(#${id}-blueDark)`}
          strokeWidth="0.3"
        />

        {/* Südwest */}
        <path
          d="M14 50 L28 36 L30 34 L28 38 Z"
          fill={`url(#${id}-blueDark)`}
          stroke={`url(#${id}-blueDark)`}
          strokeWidth="0.3"
        />

        {/* Nordwest */}
        <path
          d="M14 14 L28 28 L30 30 L28 26 Z"
          fill={`url(#${id}-blueDark)`}
          stroke={`url(#${id}-blueDark)`}
          strokeWidth="0.3"
        />
        <path
          d="M14 14 L27 27 L29 29 Z"
          fill={`url(#${id}-cyanLight)`}
          opacity="0.3"
        />

        {/* ========== LEUCHTENDER KERN ========== */}
        
        {/* Kern-Glow Hintergrund */}
        <circle
          cx="32"
          cy="32"
          r="10"
          fill={`url(#${id}-coreGlow)`}
        >
          {animated && (
            <animate
              attributeName="r"
              values="9;11;9"
              dur="2s"
              repeatCount="indefinite"
            />
          )}
        </circle>

        {/* Innerer weißer Kern */}
        <circle
          cx="32"
          cy="32"
          r="5"
          fill="#FFFFFF"
        >
          {animated && (
            <animate
              attributeName="opacity"
              values="0.9;1;0.9"
              dur="1.5s"
              repeatCount="indefinite"
            />
          )}
        </circle>

        {/* Kern-Ring */}
        <circle
          cx="32"
          cy="32"
          r="7"
          fill="none"
          stroke={`url(#${id}-cyanLight)`}
          strokeWidth="1"
          opacity="0.7"
        />

        {/* Kleine Licht-Strahlen vom Kern */}
        {animated && (
          <g opacity="0.6">
            <line x1="32" y1="24" x2="32" y2="27" stroke="#FFFFFF" strokeWidth="1">
              <animate attributeName="opacity" values="0.4;1;0.4" dur="1s" repeatCount="indefinite" />
            </line>
            <line x1="32" y1="37" x2="32" y2="40" stroke="#FFFFFF" strokeWidth="1">
              <animate attributeName="opacity" values="0.4;1;0.4" dur="1s" begin="0.25s" repeatCount="indefinite" />
            </line>
            <line x1="24" y1="32" x2="27" y2="32" stroke="#FFFFFF" strokeWidth="1">
              <animate attributeName="opacity" values="0.4;1;0.4" dur="1s" begin="0.5s" repeatCount="indefinite" />
            </line>
            <line x1="37" y1="32" x2="40" y2="32" stroke="#FFFFFF" strokeWidth="1">
              <animate attributeName="opacity" values="0.4;1;0.4" dur="1s" begin="0.75s" repeatCount="indefinite" />
            </line>
          </g>
        )}

        {/* Schimmer-Overlay */}
        {animated && (
          <circle
            cx="32"
            cy="32"
            r="28"
            fill={`url(#${id}-shimmer)`}
            style={{ mixBlendMode: 'overlay' }}
          />
        )}
      </g>

      {/* Funkeln um den Stern */}
      {animated && (
        <>
          <Sparkle x={12} y={12} size={4} delay={0} duration={1.5} animated={animated} />
          <Sparkle x={52} y={12} size={5} delay={0.5} duration={1.8} animated={animated} />
          <Sparkle x={52} y={52} size={4} delay={1} duration={1.6} animated={animated} />
          <Sparkle x={12} y={52} size={5} delay={0.7} duration={2} animated={animated} />
          <Sparkle x={32} y={2} size={3} delay={1.2} duration={1.3} animated={animated} />
        </>
      )}
    </svg>
  );
};

export default PolarsternIcon;
