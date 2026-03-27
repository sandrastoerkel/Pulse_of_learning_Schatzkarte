import React, { useId } from 'react';
import { IconProps, COLORS, Sparkle, GlowRing } from './IconDefs';

/**
 * WerkzeugeIcon - Cleverer lernen
 * Symbolisiert: Lerntechniken, Werkzeuge, Effizienz
 * Design: Ineinandergreifende Zahnräder mit leuchtender Glühbirne
 */

export const WerkzeugeIcon: React.FC<IconProps> = ({ 
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
        {/* Bronze/Messing für Zahnräder */}
        <linearGradient id={`${id}-gearGradient`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DEB887" />
          <stop offset="25%" stopColor="#CD9B5A" />
          <stop offset="50%" stopColor="#CD7F32" />
          <stop offset="75%" stopColor="#B8860B" />
          <stop offset="100%" stopColor="#8B6914" />
        </linearGradient>
        
        <linearGradient id={`${id}-gearDark`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B6914" />
          <stop offset="100%" stopColor="#5C4010" />
        </linearGradient>

        {/* Glühbirnen-Glas */}
        <radialGradient id={`${id}-bulbGlass`} cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#FFFACD" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#FFE4B5" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#FFD700" stopOpacity="0.4" />
        </radialGradient>

        {/* Glühbirnen-Licht */}
        <radialGradient id={`${id}-bulbGlow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFF99" stopOpacity="1" />
          <stop offset="40%" stopColor="#FFD700" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FFA500" stopOpacity="0" />
        </radialGradient>

        {/* Gold für Sockel */}
        <linearGradient id={`${id}-goldGradient`} x1="0%" y1="0%" x2="100%" y2="100%">
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

        {/* Starker Glow für Glühbirne */}
        <filter id={`${id}-bulbGlowFilter`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feFlood floodColor="#FFD700" floodOpacity="0.5" result="glowColor" />
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
              <animate attributeName="offset" values="-1;2" dur="2.5s" repeatCount="indefinite" />
            )}
          </stop>
          <stop offset="50%" stopColor="rgba(255,255,255,0.5)">
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

      {/* Äußerer Glow-Ring */}
      {glowing && (
        <GlowRing cx={32} cy={32} r={30} color="#FFD700" animated={animated} />
      )}

      {/* Haupt-Gruppe */}
      <g filter={glowing ? `url(#${id}-glow)` : undefined}>
        
        {/* ========== GROSSES ZAHNRAD (links unten) ========== */}
        <g transform="translate(16, 40)">
          {animated && (
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 0 0"
              to="360 0 0"
              dur="8s"
              repeatCount="indefinite"
              additive="sum"
            />
          )}
          {/* Zahnrad-Basis */}
          <circle
            cx="0"
            cy="0"
            r="14"
            fill={`url(#${id}-gearGradient)`}
            stroke={`url(#${id}-gearDark)`}
            strokeWidth="1"
          />
          {/* Zähne */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <rect
              key={i}
              x="-3"
              y="-18"
              width="6"
              height="6"
              rx="1"
              fill={`url(#${id}-gearGradient)`}
              stroke={`url(#${id}-gearDark)`}
              strokeWidth="0.5"
              transform={`rotate(${angle})`}
            />
          ))}
          {/* Innerer Kreis */}
          <circle cx="0" cy="0" r="6" fill={`url(#${id}-gearDark)`} />
          <circle cx="0" cy="0" r="3" fill={`url(#${id}-gearGradient)`} />
        </g>

        {/* ========== KLEINES ZAHNRAD (rechts) ========== */}
        <g transform="translate(42, 48)">
          {animated && (
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="360 0 0"
              to="0 0 0"
              dur="5s"
              repeatCount="indefinite"
              additive="sum"
            />
          )}
          {/* Zahnrad-Basis */}
          <circle
            cx="0"
            cy="0"
            r="9"
            fill={`url(#${id}-gearGradient)`}
            stroke={`url(#${id}-gearDark)`}
            strokeWidth="0.8"
          />
          {/* Zähne */}
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <rect
              key={i}
              x="-2"
              y="-12"
              width="4"
              height="4"
              rx="0.5"
              fill={`url(#${id}-gearGradient)`}
              stroke={`url(#${id}-gearDark)`}
              strokeWidth="0.3"
              transform={`rotate(${angle})`}
            />
          ))}
          {/* Innerer Kreis */}
          <circle cx="0" cy="0" r="4" fill={`url(#${id}-gearDark)`} />
          <circle cx="0" cy="0" r="2" fill={`url(#${id}-gearGradient)`} />
        </g>

        {/* ========== GLÜHBIRNE ========== */}
        <g filter={`url(#${id}-bulbGlowFilter)`}>
          {/* Lichtkegel/Aura */}
          <ellipse
            cx="36"
            cy="18"
            rx="16"
            ry="14"
            fill={`url(#${id}-bulbGlow)`}
            opacity="0.5"
          >
            {animated && (
              <animate
                attributeName="opacity"
                values="0.3;0.6;0.3"
                dur="2s"
                repeatCount="indefinite"
              />
            )}
          </ellipse>

          {/* Glühbirnen-Glas */}
          <path
            d="M36 8 
               C44 8, 48 14, 48 20
               C48 26, 44 30, 40 32
               L40 36
               L32 36
               L32 32
               C28 30, 24 26, 24 20
               C24 14, 28 8, 36 8"
            fill={`url(#${id}-bulbGlass)`}
            stroke={`url(#${id}-goldGradient)`}
            strokeWidth="1"
          />

          {/* Filament */}
          <path
            d="M33 20 Q34 16, 36 18 Q38 20, 36 24 Q34 22, 36 20"
            fill="none"
            stroke="#FFD700"
            strokeWidth="1.5"
            opacity="0.9"
          >
            {animated && (
              <animate
                attributeName="opacity"
                values="0.7;1;0.7"
                dur="0.5s"
                repeatCount="indefinite"
              />
            )}
          </path>

          {/* Sockel */}
          <rect
            x="31"
            y="36"
            width="10"
            height="4"
            rx="1"
            fill={`url(#${id}-goldGradient)`}
          />
          <rect
            x="32"
            y="40"
            width="8"
            height="2"
            fill="#B8860B"
          />
          <rect
            x="33"
            y="42"
            width="6"
            height="2"
            rx="1"
            fill={`url(#${id}-gearDark)`}
          />

          {/* Sockel-Rillen */}
          <line x1="31" y1="37" x2="41" y2="37" stroke="#8B6914" strokeWidth="0.5" />
          <line x1="31" y1="39" x2="41" y2="39" stroke="#8B6914" strokeWidth="0.5" />
        </g>

        {/* Schimmer-Overlay */}
        {animated && (
          <rect
            x="8"
            y="4"
            width="48"
            height="56"
            fill={`url(#${id}-shimmer)`}
            style={{ mixBlendMode: 'overlay' }}
          />
        )}
      </g>

      {/* Funkeln um Glühbirne */}
      {animated && (
        <>
          <Sparkle x={48} y={10} size={5} delay={0} duration={1.2} animated={animated} />
          <Sparkle x={24} y={12} size={4} delay={0.4} duration={1.5} animated={animated} />
          <Sparkle x={52} y={24} size={4} delay={0.8} duration={1.3} animated={animated} />
          <Sparkle x={8} y={36} size={5} delay={1.1} duration={1.8} animated={animated} />
        </>
      )}
    </svg>
  );
};

export default WerkzeugeIcon;
