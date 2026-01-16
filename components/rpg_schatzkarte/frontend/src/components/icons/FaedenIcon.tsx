import React, { useId } from 'react';
import { IconProps } from './IconDefs';

/**
 * FaedenIcon - Zusammenhänge erkennen
 * Symbolisiert: Netzwerk, Verbindungen, Wissen verknüpfen
 * Design: Elegantes Netzwerk aus goldenen und magenta Knoten
 */

export const FaedenIcon: React.FC<IconProps> = ({ 
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
        {/* Gold Gradient für Zentrum */}
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

        {/* Magenta Gradient */}
        <linearGradient id={`${id}-magentaGradient`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF80AB" />
          <stop offset="25%" stopColor="#F50057" />
          <stop offset="50%" stopColor="#C51162" />
          <stop offset="75%" stopColor="#F50057" />
          <stop offset="100%" stopColor="#880E4F" />
        </linearGradient>

        {/* Cyan Gradient */}
        <linearGradient id={`${id}-cyanGradient`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#84FFFF" />
          <stop offset="25%" stopColor="#18FFFF" />
          <stop offset="50%" stopColor="#00E5FF" />
          <stop offset="75%" stopColor="#18FFFF" />
          <stop offset="100%" stopColor="#00B8D4" />
        </linearGradient>

        {/* Faden/Linie Gradient */}
        <linearGradient id={`${id}-threadGradient`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E040FB" />
          <stop offset="50%" stopColor="#AA00FF" />
          <stop offset="100%" stopColor="#7C4DFF" />
        </linearGradient>

        {/* Knoten-Glow */}
        <radialGradient id={`${id}-nodeGlow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="40%" stopColor="#E040FB" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#AA00FF" stopOpacity="0" />
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
        
        {/* ========== FÄDEN / VERBINDUNGEN ========== */}
        
        {/* Haupt-Verbindungen vom Zentrum */}
        <line x1="32" y1="32" x2="32" y2="8" stroke={`url(#${id}-threadGradient)`} strokeWidth="2" strokeLinecap="round" />
        <line x1="32" y1="32" x2="54" y2="18" stroke={`url(#${id}-threadGradient)`} strokeWidth="2" strokeLinecap="round" />
        <line x1="32" y1="32" x2="54" y2="46" stroke={`url(#${id}-threadGradient)`} strokeWidth="2" strokeLinecap="round" />
        <line x1="32" y1="32" x2="32" y2="56" stroke={`url(#${id}-threadGradient)`} strokeWidth="2" strokeLinecap="round" />
        <line x1="32" y1="32" x2="10" y2="46" stroke={`url(#${id}-threadGradient)`} strokeWidth="2" strokeLinecap="round" />
        <line x1="32" y1="32" x2="10" y2="18" stroke={`url(#${id}-threadGradient)`} strokeWidth="2" strokeLinecap="round" />

        {/* Äußere Ring-Verbindungen */}
        <line x1="32" y1="8" x2="54" y2="18" stroke={`url(#${id}-threadGradient)`} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <line x1="54" y1="18" x2="54" y2="46" stroke={`url(#${id}-threadGradient)`} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <line x1="54" y1="46" x2="32" y2="56" stroke={`url(#${id}-threadGradient)`} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <line x1="32" y1="56" x2="10" y2="46" stroke={`url(#${id}-threadGradient)`} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <line x1="10" y1="46" x2="10" y2="18" stroke={`url(#${id}-threadGradient)`} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <line x1="10" y1="18" x2="32" y2="8" stroke={`url(#${id}-threadGradient)`} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />

        {/* Pulsierende Fäden */}
        {animated && (
          <>
            <line x1="32" y1="32" x2="32" y2="8" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" opacity="0.4">
              <animate attributeName="opacity" values="0;0.6;0" dur="2s" repeatCount="indefinite" />
            </line>
            <line x1="32" y1="32" x2="54" y2="46" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" opacity="0.4">
              <animate attributeName="opacity" values="0;0.6;0" dur="2s" begin="0.5s" repeatCount="indefinite" />
            </line>
            <line x1="32" y1="32" x2="10" y2="46" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" opacity="0.4">
              <animate attributeName="opacity" values="0;0.6;0" dur="2s" begin="1s" repeatCount="indefinite" />
            </line>
          </>
        )}

        {/* ========== KNOTEN ========== */}
        
        {/* Zentraler Gold-Knoten */}
        <circle cx="32" cy="32" r="8" fill={`url(#${id}-nodeGlow)`}>
          {animated && <animate attributeName="r" values="7;9;7" dur="2s" repeatCount="indefinite" />}
        </circle>
        <circle cx="32" cy="32" r="6" fill={`url(#${id}-goldGradient)`} stroke={`url(#${id}-goldDark)`} strokeWidth="0.5" />
        <ellipse cx="30" cy="30" rx="2" ry="1" fill="white" opacity="0.5" />

        {/* Äußere Knoten - Magenta */}
        <circle cx="32" cy="8" r="5" fill={`url(#${id}-magentaGradient)`} stroke="#880E4F" strokeWidth="0.5">
          {animated && <animate attributeName="r" values="4;5.5;4" dur="2s" begin="0.2s" repeatCount="indefinite" />}
        </circle>
        <ellipse cx="31" cy="7" rx="1.5" ry="0.8" fill="white" opacity="0.4" />

        <circle cx="54" cy="46" r="5" fill={`url(#${id}-magentaGradient)`} stroke="#880E4F" strokeWidth="0.5">
          {animated && <animate attributeName="r" values="4;5.5;4" dur="2s" begin="0.6s" repeatCount="indefinite" />}
        </circle>
        <ellipse cx="53" cy="45" rx="1.5" ry="0.8" fill="white" opacity="0.4" />

        <circle cx="10" cy="46" r="5" fill={`url(#${id}-magentaGradient)`} stroke="#880E4F" strokeWidth="0.5">
          {animated && <animate attributeName="r" values="4;5.5;4" dur="2s" begin="1s" repeatCount="indefinite" />}
        </circle>
        <ellipse cx="9" cy="45" rx="1.5" ry="0.8" fill="white" opacity="0.4" />

        {/* Äußere Knoten - Cyan */}
        <circle cx="54" cy="18" r="5" fill={`url(#${id}-cyanGradient)`} stroke="#00B8D4" strokeWidth="0.5">
          {animated && <animate attributeName="r" values="4;5.5;4" dur="2s" begin="0.4s" repeatCount="indefinite" />}
        </circle>
        <ellipse cx="53" cy="17" rx="1.5" ry="0.8" fill="white" opacity="0.4" />

        <circle cx="32" cy="56" r="5" fill={`url(#${id}-cyanGradient)`} stroke="#00B8D4" strokeWidth="0.5">
          {animated && <animate attributeName="r" values="4;5.5;4" dur="2s" begin="0.8s" repeatCount="indefinite" />}
        </circle>
        <ellipse cx="31" cy="55" rx="1.5" ry="0.8" fill="white" opacity="0.4" />

        <circle cx="10" cy="18" r="5" fill={`url(#${id}-cyanGradient)`} stroke="#00B8D4" strokeWidth="0.5">
          {animated && <animate attributeName="r" values="4;5.5;4" dur="2s" begin="1.2s" repeatCount="indefinite" />}
        </circle>
        <ellipse cx="9" cy="17" rx="1.5" ry="0.8" fill="white" opacity="0.4" />

        {/* Schimmer */}
        {animated && (
          <circle cx="32" cy="32" r="28" fill={`url(#${id}-shimmer)`} style={{ mixBlendMode: 'overlay' }} />
        )}
      </g>

      {/* Funkeln */}
      {animated && (
        <>
          <path d="M22 4 L23 6 L25 6 L23.5 7.5 L24 10 L22 8.5 L20 10 L20.5 7.5 L19 6 L21 6 Z" fill="#FFF8DC" opacity="0.8">
            <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" />
          </path>
          <path d="M58 32 L59 34 L61 34 L59.5 35.5 L60 38 L58 36.5 L56 38 L56.5 35.5 L55 34 L57 34 Z" fill="#FFF8DC" opacity="0.6">
            <animate attributeName="opacity" values="0;1;0" dur="2s" begin="0.5s" repeatCount="indefinite" />
          </path>
          <path d="M4 32 L5 34 L7 34 L5.5 35.5 L6 38 L4 36.5 L2 38 L2.5 35.5 L1 34 L3 34 Z" fill="#FFF8DC" opacity="0.7">
            <animate attributeName="opacity" values="0;1;0" dur="1.8s" begin="1s" repeatCount="indefinite" />
          </path>
        </>
      )}
    </svg>
  );
};

export default FaedenIcon;
