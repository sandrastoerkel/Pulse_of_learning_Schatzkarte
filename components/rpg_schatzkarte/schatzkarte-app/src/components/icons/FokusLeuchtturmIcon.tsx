import React, { useId } from 'react';
import { IconProps } from './IconDefs';

/**
 * FokusLeuchtturmIcon - Fokus halten
 * Symbolisiert: Konzentration, Aufmerksamkeit, den Weg weisen
 * Design: Eleganter Leuchtturm mit strahlendem Licht
 */

export const FokusLeuchtturmIcon: React.FC<IconProps> = ({ 
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
        {/* Leuchtturm Weiß */}
        <linearGradient id={`${id}-towerWhite`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#E8E8E8" />
          <stop offset="25%" stopColor="#F5F5F5" />
          <stop offset="50%" stopColor="#FFFFFF" />
          <stop offset="75%" stopColor="#F5F5F5" />
          <stop offset="100%" stopColor="#D0D0D0" />
        </linearGradient>

        {/* Leuchtturm Rot */}
        <linearGradient id={`${id}-towerRed`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#C0392B" />
          <stop offset="25%" stopColor="#E74C3C" />
          <stop offset="50%" stopColor="#FF6B6B" />
          <stop offset="75%" stopColor="#E74C3C" />
          <stop offset="100%" stopColor="#A93226" />
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

        {/* Licht-Gradient */}
        <radialGradient id={`${id}-lightGlow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="30%" stopColor="#FFFACD" />
          <stop offset="60%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#FFA500" stopOpacity="0" />
        </radialGradient>

        {/* Lichtstrahl */}
        <linearGradient id={`${id}-beamGradient`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFFACD" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#FFD700" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FFA500" stopOpacity="0" />
        </linearGradient>

        {/* Felsen */}
        <linearGradient id={`${id}-rockGradient`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#708090" />
          <stop offset="50%" stopColor="#5D6D7E" />
          <stop offset="100%" stopColor="#4A5568" />
        </linearGradient>

        {/* Wasser */}
        <linearGradient id={`${id}-waterGradient`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1E90FF" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#4169E1" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#1E90FF" stopOpacity="0.2" />
        </linearGradient>

        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id={`${id}-lightGlowFilter`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
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

      {/* Wasser */}
      <ellipse cx="32" cy="56" rx="30" ry="6" fill={`url(#${id}-waterGradient)`}>
        {animated && <animate attributeName="ry" values="6;7;6" dur="3s" repeatCount="indefinite" />}
      </ellipse>

      <g filter={glowing ? `url(#${id}-glow)` : undefined}>
        
        {/* Felsen-Basis */}
        <ellipse cx="32" cy="54" rx="14" ry="4" fill={`url(#${id}-rockGradient)`} />
        <path d="M18 54 Q18 50, 22 48 L42 48 Q46 50, 46 54 Z" fill={`url(#${id}-rockGradient)`} />

        {/* ========== LEUCHTTURM ========== */}
        
        {/* Basis */}
        <path d="M24 48 L26 38 L38 38 L40 48 Z" fill={`url(#${id}-towerWhite)`} stroke="#BDBDBD" strokeWidth="0.5" />
        
        {/* Mittelteil */}
        <path d="M26 38 L27 24 L37 24 L38 38 Z" fill={`url(#${id}-towerWhite)`} stroke="#BDBDBD" strokeWidth="0.5" />
        
        {/* Oberteil */}
        <path d="M27 24 L28 16 L36 16 L37 24 Z" fill={`url(#${id}-towerWhite)`} stroke="#BDBDBD" strokeWidth="0.5" />

        {/* Rote Streifen */}
        <rect x="25" y="42" width="14" height="4" rx="0.5" fill={`url(#${id}-towerRed)`} />
        <rect x="26.5" y="30" width="11" height="4" rx="0.5" fill={`url(#${id}-towerRed)`} />
        <rect x="28" y="20" width="8" height="3" rx="0.5" fill={`url(#${id}-towerRed)`} />

        {/* Fenster */}
        <rect x="30" y="26" width="4" height="5" rx="2" fill="#87CEEB" stroke="#5D6D7E" strokeWidth="0.5" />

        {/* ========== LATERNE ========== */}
        
        {/* Geländer */}
        <rect x="27" y="14" width="10" height="2" rx="0.5" fill={`url(#${id}-goldGradient)`} stroke={`url(#${id}-goldDark)`} strokeWidth="0.3" />
        
        {/* Laternen-Gehäuse */}
        <rect x="28" y="8" width="8" height="6" rx="1" fill="#2C3E50" stroke={`url(#${id}-goldGradient)`} strokeWidth="1" />
        
        {/* Glas */}
        <rect x="29" y="9" width="2.5" height="4" fill="#87CEEB" opacity="0.6" />
        <rect x="32.5" y="9" width="2.5" height="4" fill="#87CEEB" opacity="0.6" />

        {/* Dach */}
        <path d="M27 8 L32 2 L37 8 Z" fill="#2C3E50" stroke={`url(#${id}-goldGradient)`} strokeWidth="0.5" />
        
        {/* Spitze */}
        <circle cx="32" cy="2" r="1.5" fill={`url(#${id}-goldGradient)`} stroke={`url(#${id}-goldDark)`} strokeWidth="0.3" />
        <ellipse cx="31.5" cy="1.5" rx="0.5" ry="0.3" fill="white" opacity="0.5" />

        {/* ========== LICHT ========== */}
        
        <g filter={`url(#${id}-lightGlowFilter)`}>
          {/* Zentrales Licht */}
          <circle cx="32" cy="11" r="4" fill={`url(#${id}-lightGlow)`}>
            {animated && (
              <>
                <animate attributeName="r" values="3;5;3" dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;1;0.8" dur="1.5s" repeatCount="indefinite" />
              </>
            )}
          </circle>

          {/* Rotierender Lichtstrahl */}
          {animated && (
            <path d="M36 11 L58 4 L58 18 Z" fill={`url(#${id}-beamGradient)`} opacity="0.7">
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 32 11"
                to="360 32 11"
                dur="4s"
                repeatCount="indefinite"
              />
            </path>
          )}
        </g>

        {/* Schimmer */}
        {animated && (
          <rect x="18" y="0" width="28" height="56" fill={`url(#${id}-shimmer)`} style={{ mixBlendMode: 'overlay' }} />
        )}
      </g>

      {/* Funkeln */}
      {animated && (
        <>
          <path d="M10 12 L11 14 L13 14 L11.5 15.5 L12 18 L10 16.5 L8 18 L8.5 15.5 L7 14 L9 14 Z" fill="#FFF8DC" opacity="0.8">
            <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" />
          </path>
          <path d="M54 14 L55 16 L57 16 L55.5 17.5 L56 20 L54 18.5 L52 20 L52.5 17.5 L51 16 L53 16 Z" fill="#FFF8DC" opacity="0.6">
            <animate attributeName="opacity" values="0;1;0" dur="2s" begin="0.3s" repeatCount="indefinite" />
          </path>
          <path d="M50 30 L51 32 L53 32 L51.5 33.5 L52 36 L50 34.5 L48 36 L48.5 33.5 L47 32 L49 32 Z" fill="#FFF8DC" opacity="0.7">
            <animate attributeName="opacity" values="0;1;0" dur="1.8s" begin="0.7s" repeatCount="indefinite" />
          </path>
          <path d="M14 28 L15 30 L17 30 L15.5 31.5 L16 34 L14 32.5 L12 34 L12.5 31.5 L11 30 L13 30 Z" fill="#FFF8DC" opacity="0.6">
            <animate attributeName="opacity" values="0;1;0" dur="2.2s" begin="1s" repeatCount="indefinite" />
          </path>
        </>
      )}
    </svg>
  );
};

export default FokusLeuchtturmIcon;
