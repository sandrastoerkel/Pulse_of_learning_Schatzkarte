import React, { useId } from 'react';
import { IconProps, COLORS, Sparkle, GlowRing } from './IconDefs';

/**
 * MeisterBergIcon - Berg der Meisterschaft
 * Symbolisiert: Finale, Meisterschaft, höchstes Ziel, Erfolg
 * Design: Majestätischer schneebedeckter Berg mit goldener Krone auf dem Gipfel
 */

export const MeisterBergIcon: React.FC<IconProps> = ({ 
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
        {/* Berg-Stein Gradient */}
        <linearGradient id={`${id}-mountainGradient`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#607D8B" />
          <stop offset="30%" stopColor="#455A64" />
          <stop offset="60%" stopColor="#37474F" />
          <stop offset="100%" stopColor="#263238" />
        </linearGradient>
        
        <linearGradient id={`${id}-mountainDark`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#37474F" />
          <stop offset="100%" stopColor="#1C2529" />
        </linearGradient>

        {/* Schnee Gradient */}
        <linearGradient id={`${id}-snowGradient`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#F5F5F5" />
          <stop offset="100%" stopColor="#E0E0E0" />
        </linearGradient>

        {/* Gold für Krone */}
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

        {/* Rubin-Rot für Kronjuwel */}
        <radialGradient id={`${id}-rubyGradient`} cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#FF6B6B" />
          <stop offset="50%" stopColor="#DC143C" />
          <stop offset="100%" stopColor="#8B0000" />
        </radialGradient>

        {/* Himmel-Gradient (Hintergrund-Aura) */}
        <radialGradient id={`${id}-skyGlow`} cx="50%" cy="20%" r="70%">
          <stop offset="0%" stopColor="#FFD700" stopOpacity="0.3" />
          <stop offset="50%" stopColor="#FFA500" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#87CEEB" stopOpacity="0" />
        </radialGradient>

        {/* Glow Filter */}
        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Crown Glow */}
        <filter id={`${id}-crownGlow`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
          <feFlood floodColor="#FFD700" floodOpacity="0.6" result="glowColor" />
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
          <stop offset="50%" stopColor="rgba(255,255,255,0.6)">
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

      {/* Himmel-Aura */}
      <ellipse
        cx="32"
        cy="24"
        rx="28"
        ry="22"
        fill={`url(#${id}-skyGlow)`}
      />

      {/* Äußerer Glow-Ring */}
      {glowing && (
        <GlowRing cx={32} cy={32} r={30} color="#FFD700" animated={animated} />
      )}

      {/* Haupt-Gruppe */}
      <g filter={glowing ? `url(#${id}-glow)` : undefined}>
        
        {/* ========== HINTERE BERGE (Tiefe) ========== */}
        
        {/* Linker Hintergrund-Berg */}
        <path
          d="M2 58 L14 32 L26 58 Z"
          fill="#455A64"
          opacity="0.6"
        />
        
        {/* Rechter Hintergrund-Berg */}
        <path
          d="M38 58 L50 36 L62 58 Z"
          fill="#455A64"
          opacity="0.6"
        />

        {/* ========== HAUPTBERG ========== */}
        
        {/* Berg-Körper */}
        <path
          d="M6 58 L32 16 L58 58 Z"
          fill={`url(#${id}-mountainGradient)`}
          stroke={`url(#${id}-mountainDark)`}
          strokeWidth="1"
        />

        {/* Berg-Schattenseite */}
        <path
          d="M32 16 L32 58 L58 58 Z"
          fill={`url(#${id}-mountainDark)`}
          opacity="0.4"
        />

        {/* Fels-Details */}
        <path d="M20 45 L28 30" stroke="#37474F" strokeWidth="1" opacity="0.5" />
        <path d="M44 45 L36 30" stroke="#263238" strokeWidth="0.5" opacity="0.4" />

        {/* ========== SCHNEEKAPPE ========== */}
        
        <path
          d="M32 16 
             L26 28 Q28 30, 32 28 Q36 30, 38 28
             L32 16"
          fill={`url(#${id}-snowGradient)`}
        />
        
        {/* Schnee-Details (zerklüftet) */}
        <path
          d="M24 32 Q26 28, 28 30 L26 28"
          fill={`url(#${id}-snowGradient)`}
          opacity="0.8"
        />
        <path
          d="M40 32 Q38 28, 36 30 L38 28"
          fill={`url(#${id}-snowGradient)`}
          opacity="0.8"
        />

        {/* ========== GOLDENE KRONE ========== */}
        <g filter={`url(#${id}-crownGlow)`} transform="translate(0, -2)">
          {/* Kronen-Basis */}
          <path
            d="M24 18 L26 10 L29 14 L32 6 L35 14 L38 10 L40 18 Z"
            fill={`url(#${id}-goldGradient)`}
            stroke={`url(#${id}-goldDark)`}
            strokeWidth="0.8"
          >
            {animated && (
              <animate
                attributeName="transform"
                values="translateY(0);translateY(-1);translateY(0)"
                dur="3s"
                repeatCount="indefinite"
              />
            )}
          </path>

          {/* Kronen-Band */}
          <rect
            x="24"
            y="18"
            width="16"
            height="4"
            rx="1"
            fill={`url(#${id}-goldGradient)`}
            stroke={`url(#${id}-goldDark)`}
            strokeWidth="0.5"
          />

          {/* Kronjuwelen */}
          {/* Zentraler Rubin */}
          <ellipse
            cx="32"
            cy="10"
            rx="2.5"
            ry="3"
            fill={`url(#${id}-rubyGradient)`}
          >
            {animated && (
              <animate
                attributeName="opacity"
                values="0.9;1;0.9"
                dur="2s"
                repeatCount="indefinite"
              />
            )}
          </ellipse>

          {/* Seitliche Juwelen */}
          <circle cx="26" cy="14" r="1.5" fill="#4FC3F7" />
          <circle cx="38" cy="14" r="1.5" fill="#4FC3F7" />

          {/* Gold-Perlen am Band */}
          <circle cx="27" cy="20" r="1" fill={`url(#${id}-goldDark)`} />
          <circle cx="32" cy="20" r="1" fill={`url(#${id}-goldDark)`} />
          <circle cx="37" cy="20" r="1" fill={`url(#${id}-goldDark)`} />
        </g>

        {/* ========== WOLKEN (optional) ========== */}
        <ellipse cx="12" cy="38" rx="6" ry="3" fill="white" opacity="0.3" />
        <ellipse cx="52" cy="42" rx="5" ry="2.5" fill="white" opacity="0.25" />

        {/* Schimmer-Overlay */}
        {animated && (
          <rect
            x="6"
            y="4"
            width="52"
            height="56"
            fill={`url(#${id}-shimmer)`}
            style={{ mixBlendMode: 'overlay' }}
          />
        )}
      </g>

      {/* Funkeln um Krone */}
      {animated && (
        <>
          <Sparkle x={20} y={8} size={5} delay={0} duration={1.5} animated={animated} />
          <Sparkle x={44} y={6} size={4} delay={0.5} duration={1.8} animated={animated} />
          <Sparkle x={32} y={2} size={6} delay={1} duration={2} animated={animated} />
          <Sparkle x={50} y={20} size={4} delay={0.8} duration={1.6} animated={animated} />
          <Sparkle x={14} y={18} size={5} delay={1.3} duration={1.4} animated={animated} />
        </>
      )}
    </svg>
  );
};

export default MeisterBergIcon;
