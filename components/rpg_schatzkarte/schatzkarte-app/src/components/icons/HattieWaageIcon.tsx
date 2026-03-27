import React, { useId } from 'react';
import { IconProps, Sparkle, GlowRing } from './IconDefs';

/**
 * HattieWaageIcon - Selbsteinschätzung
 * Symbolisiert: Vorhersagen treffen, sich selbst einschätzen, Balance
 * Design: Elegante goldene Waage mit animierten Waagschalen
 * Basiert auf Hatties Forschung zur Selbsteinschätzung (Self-reported grades)
 */

export const HattieWaageIcon: React.FC<IconProps> = ({ 
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
        {/* Gold-Gradient */}
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

        {/* Bronze für Waagschalen */}
        <linearGradient id={`${id}-bronzeGradient`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DEB887" />
          <stop offset="30%" stopColor="#CD9B5A" />
          <stop offset="70%" stopColor="#CD7F32" />
          <stop offset="100%" stopColor="#8B4513" />
        </linearGradient>

        {/* Waagschale innerer Gradient */}
        <radialGradient id={`${id}-bowlInner`} cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFE4B5" />
          <stop offset="50%" stopColor="#DEB887" />
          <stop offset="100%" stopColor="#8B4513" />
        </radialGradient>

        {/* Smaragd-Grün für Juwel */}
        <radialGradient id={`${id}-emeraldGradient`} cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#50C878" />
          <stop offset="50%" stopColor="#2E8B57" />
          <stop offset="100%" stopColor="#006400" />
        </radialGradient>

        {/* Kristall-Effekt */}
        <linearGradient id={`${id}-crystalGradient`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E6E6FA" />
          <stop offset="50%" stopColor="#9370DB" />
          <stop offset="100%" stopColor="#4B0082" />
        </linearGradient>

        {/* Glow Filter */}
        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
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
        
        {/* ========== STANDFUSS ========== */}
        
        {/* Basis-Platte */}
        <ellipse
          cx="32"
          cy="58"
          rx="14"
          ry="4"
          fill={`url(#${id}-goldDark)`}
        />
        <ellipse
          cx="32"
          cy="57"
          rx="12"
          ry="3"
          fill={`url(#${id}-goldGradient)`}
        />

        {/* Säule */}
        <rect
          x="29"
          y="28"
          width="6"
          height="30"
          rx="1"
          fill={`url(#${id}-goldGradient)`}
          stroke={`url(#${id}-goldDark)`}
          strokeWidth="0.5"
        />
        
        {/* Säulen-Verzierung Mitte */}
        <ellipse
          cx="32"
          cy="42"
          rx="4"
          ry="2"
          fill={`url(#${id}-goldDark)`}
        />

        {/* ========== WAAGEBALKEN ========== */}
        
        <g>
          {animated && (
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="-3 32 20;3 32 20;-3 32 20"
              dur="4s"
              repeatCount="indefinite"
            />
          )}
          
          {/* Haupt-Balken */}
          <rect
            x="6"
            y="18"
            width="52"
            height="4"
            rx="2"
            fill={`url(#${id}-goldGradient)`}
            stroke={`url(#${id}-goldDark)`}
            strokeWidth="0.5"
          />

          {/* Balken-Verzierungen */}
          <circle cx="10" cy="20" r="2" fill={`url(#${id}-goldDark)`} />
          <circle cx="54" cy="20" r="2" fill={`url(#${id}-goldDark)`} />
          
          {/* ========== LINKE WAAGSCHALE ========== */}
          
          <g>
            {/* Ketten */}
            <line x1="10" y1="22" x2="6" y2="36" stroke={`url(#${id}-goldGradient)`} strokeWidth="1.5" />
            <line x1="10" y1="22" x2="14" y2="36" stroke={`url(#${id}-goldGradient)`} strokeWidth="1.5" />
            <line x1="10" y1="22" x2="10" y2="36" stroke={`url(#${id}-goldGradient)`} strokeWidth="1" />

            {/* Schale */}
            <ellipse
              cx="10"
              cy="40"
              rx="10"
              ry="4"
              fill={`url(#${id}-bronzeGradient)`}
              stroke={`url(#${id}-goldDark)`}
              strokeWidth="0.5"
            />
            <ellipse
              cx="10"
              cy="39"
              rx="8"
              ry="3"
              fill={`url(#${id}-bowlInner)`}
            />

            {/* Kristallkugel in linker Schale (Vorhersage-Symbol) */}
            <circle
              cx="10"
              cy="38"
              r="4"
              fill={`url(#${id}-crystalGradient)`}
              opacity="0.8"
            >
              {animated && (
                <animate
                  attributeName="opacity"
                  values="0.7;0.9;0.7"
                  dur="2s"
                  repeatCount="indefinite"
                />
              )}
            </circle>
            <ellipse
              cx="9"
              cy="36"
              rx="1.5"
              ry="1"
              fill="white"
              opacity="0.6"
            />
          </g>

          {/* ========== RECHTE WAAGSCHALE ========== */}
          
          <g>
            {/* Ketten */}
            <line x1="54" y1="22" x2="50" y2="36" stroke={`url(#${id}-goldGradient)`} strokeWidth="1.5" />
            <line x1="54" y1="22" x2="58" y2="36" stroke={`url(#${id}-goldGradient)`} strokeWidth="1.5" />
            <line x1="54" y1="22" x2="54" y2="36" stroke={`url(#${id}-goldGradient)`} strokeWidth="1" />

            {/* Schale */}
            <ellipse
              cx="54"
              cy="40"
              rx="10"
              ry="4"
              fill={`url(#${id}-bronzeGradient)`}
              stroke={`url(#${id}-goldDark)`}
              strokeWidth="0.5"
            />
            <ellipse
              cx="54"
              cy="39"
              rx="8"
              ry="3"
              fill={`url(#${id}-bowlInner)`}
            />

            {/* Stern in rechter Schale (Ergebnis-Symbol) */}
            <path
              d="M54 34 L55.5 37 L59 37.5 L56.5 39.5 L57 43 L54 41 L51 43 L51.5 39.5 L49 37.5 L52.5 37 Z"
              fill={`url(#${id}-goldGradient)`}
            >
              {animated && (
                <animate
                  attributeName="opacity"
                  values="0.8;1;0.8"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              )}
            </path>
          </g>
        </g>

        {/* ========== DREHPUNKT / ZENTRUM ========== */}
        
        {/* Zentrale Aufhängung */}
        <circle
          cx="32"
          cy="20"
          r="5"
          fill={`url(#${id}-goldGradient)`}
          stroke={`url(#${id}-goldDark)`}
          strokeWidth="1"
        />
        
        {/* Smaragd im Zentrum */}
        <circle
          cx="32"
          cy="20"
          r="3"
          fill={`url(#${id}-emeraldGradient)`}
        >
          {animated && (
            <animate
              attributeName="opacity"
              values="0.9;1;0.9"
              dur="2s"
              repeatCount="indefinite"
            />
          )}
        </circle>
        
        {/* Smaragd Highlight */}
        <ellipse
          cx="31"
          cy="19"
          rx="1"
          ry="0.5"
          fill="white"
          opacity="0.5"
        />

        {/* ========== DEKORATIVE SPITZE ========== */}
        
        {/* Pfeil nach oben (Ziel-Symbol) */}
        <path
          d="M32 6 L36 14 L33 14 L33 18 L31 18 L31 14 L28 14 Z"
          fill={`url(#${id}-goldGradient)`}
          stroke={`url(#${id}-goldDark)`}
          strokeWidth="0.5"
        />

        {/* Schimmer-Overlay */}
        {animated && (
          <rect
            x="4"
            y="4"
            width="56"
            height="56"
            fill={`url(#${id}-shimmer)`}
            style={{ mixBlendMode: 'overlay' }}
          />
        )}
      </g>

      {/* Funkeln */}
      {animated && (
        <>
          <Sparkle x={20} y={10} size={4} delay={0} duration={1.5} animated={animated} />
          <Sparkle x={44} y={8} size={5} delay={0.5} duration={1.8} animated={animated} />
          <Sparkle x={6} y={32} size={4} delay={0.8} duration={1.6} animated={animated} />
          <Sparkle x={58} y={30} size={4} delay={1.1} duration={2} animated={animated} />
        </>
      )}
    </svg>
  );
};

export default HattieWaageIcon;
