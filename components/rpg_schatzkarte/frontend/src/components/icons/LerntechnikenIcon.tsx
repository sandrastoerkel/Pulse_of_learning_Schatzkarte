import React, { useId } from 'react';
import { IconProps } from './IconDefs';

/**
 * LerntechnikenIcon - Lernstrategien & Techniken
 * Symbolisiert: Effektive Methoden, Werkzeuge zum Lernen, Strategien
 * Design: Magisches aufgeschlagenes Buch mit schwebenden Symbolen
 */

export const LerntechnikenIcon: React.FC<IconProps> = ({ 
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
        {/* Buch Leder Gradient */}
        <linearGradient id={`${id}-bookGradient`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8D6E63" />
          <stop offset="25%" stopColor="#6D4C41" />
          <stop offset="50%" stopColor="#5D4037" />
          <stop offset="75%" stopColor="#6D4C41" />
          <stop offset="100%" stopColor="#4E342E" />
        </linearGradient>

        <linearGradient id={`${id}-bookDark`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4E342E" />
          <stop offset="100%" stopColor="#3E2723" />
        </linearGradient>

        {/* Seiten Gradient */}
        <linearGradient id={`${id}-pageGradient`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFDF7" />
          <stop offset="25%" stopColor="#FFF8E1" />
          <stop offset="50%" stopColor="#FFECB3" />
          <stop offset="75%" stopColor="#FFF8E1" />
          <stop offset="100%" stopColor="#FFE082" />
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

        {/* Magenta/Pink für Glühbirne */}
        <linearGradient id={`${id}-ideaGradient`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE082" />
          <stop offset="25%" stopColor="#FFD54F" />
          <stop offset="50%" stopColor="#FFCA28" />
          <stop offset="75%" stopColor="#FFD54F" />
          <stop offset="100%" stopColor="#FFB300" />
        </linearGradient>

        {/* Cyan für Zahnrad */}
        <linearGradient id={`${id}-gearGradient`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#80DEEA" />
          <stop offset="25%" stopColor="#4DD0E1" />
          <stop offset="50%" stopColor="#26C6DA" />
          <stop offset="75%" stopColor="#4DD0E1" />
          <stop offset="100%" stopColor="#00ACC1" />
        </linearGradient>

        {/* Lila für Stern */}
        <linearGradient id={`${id}-starGradient`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#CE93D8" />
          <stop offset="25%" stopColor="#BA68C8" />
          <stop offset="50%" stopColor="#AB47BC" />
          <stop offset="75%" stopColor="#BA68C8" />
          <stop offset="100%" stopColor="#8E24AA" />
        </linearGradient>

        {/* Magisches Leuchten */}
        <radialGradient id={`${id}-magicGlow`} cx="50%" cy="50%" r="50%">
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
        
        {/* ========== BUCH ========== */}
        
        {/* Buchrücken */}
        <rect x="30" y="36" width="4" height="22" rx="1" fill={`url(#${id}-bookDark)`} />
        
        {/* Linke Buchseite (Deckel) */}
        <path 
          d="M6 36 Q6 34, 8 34 L30 34 L30 58 L8 58 Q6 58, 6 56 Z" 
          fill={`url(#${id}-bookGradient)`} 
          stroke={`url(#${id}-bookDark)`} 
          strokeWidth="0.5"
        />
        <path d="M8 36 L8 56 L10 56 L10 36 Z" fill="#8D6E63" opacity="0.3" />
        
        {/* Rechte Buchseite (Deckel) */}
        <path 
          d="M34 34 L56 34 Q58 34, 58 36 L58 56 Q58 58, 56 58 L34 58 Z" 
          fill={`url(#${id}-bookGradient)`} 
          stroke={`url(#${id}-bookDark)`} 
          strokeWidth="0.5"
        />
        <path d="M54 36 L54 56 L56 56 L56 36 Z" fill="#4E342E" opacity="0.3" />

        {/* Seiten links */}
        <path 
          d="M10 38 L28 38 L28 54 L10 54 Q9 54, 9 53 L9 39 Q9 38, 10 38 Z" 
          fill={`url(#${id}-pageGradient)`} 
          stroke="#E0E0E0" 
          strokeWidth="0.3"
        />
        <line x1="12" y1="42" x2="26" y2="42" stroke="#BDBDBD" strokeWidth="0.5" opacity="0.6" />
        <line x1="12" y1="46" x2="24" y2="46" stroke="#BDBDBD" strokeWidth="0.5" opacity="0.6" />
        <line x1="12" y1="50" x2="25" y2="50" stroke="#BDBDBD" strokeWidth="0.5" opacity="0.6" />

        {/* Seiten rechts */}
        <path 
          d="M36 38 L54 38 Q55 38, 55 39 L55 53 Q55 54, 54 54 L36 54 Z" 
          fill={`url(#${id}-pageGradient)`} 
          stroke="#E0E0E0" 
          strokeWidth="0.3"
        />
        <line x1="38" y1="42" x2="52" y2="42" stroke="#BDBDBD" strokeWidth="0.5" opacity="0.6" />
        <line x1="38" y1="46" x2="50" y2="46" stroke="#BDBDBD" strokeWidth="0.5" opacity="0.6" />
        <line x1="38" y1="50" x2="51" y2="50" stroke="#BDBDBD" strokeWidth="0.5" opacity="0.6" />

        {/* Goldene Verzierung */}
        <rect x="29" y="34" width="6" height="2" rx="0.5" fill={`url(#${id}-goldGradient)`} />
        <rect x="29" y="56" width="6" height="2" rx="0.5" fill={`url(#${id}-goldGradient)`} />
        <ellipse cx="32" cy="46" rx="2" ry="2" fill={`url(#${id}-goldGradient)`} stroke={`url(#${id}-goldDark)`} strokeWidth="0.3" />

        {/* ========== SCHWEBENDE SYMBOLE ========== */}

        {/* Magisches Leuchten aus dem Buch */}
        <ellipse cx="32" cy="36" rx="16" ry="8" fill={`url(#${id}-magicGlow)`} opacity="0.3">
          {animated && <animate attributeName="opacity" values="0.2;0.4;0.2" dur="2s" repeatCount="indefinite" />}
        </ellipse>

        {/* Glühbirne (Idee) - links */}
        <g transform="translate(14, 18)">
          {animated && (
            <animateTransform attributeName="transform" type="translate" values="14 18;14 15;14 18" dur="2.5s" repeatCount="indefinite" />
          )}
          
          {/* Glow */}
          <circle cx="0" cy="0" r="8" fill={`url(#${id}-magicGlow)`} opacity="0.4">
            {animated && <animate attributeName="r" values="7;9;7" dur="2s" repeatCount="indefinite" />}
          </circle>
          
          {/* Birne */}
          <path 
            d="M0 -6 Q-5 -6, -5 -1 Q-5 3, -2 5 L-2 7 L2 7 L2 5 Q5 3, 5 -1 Q5 -6, 0 -6" 
            fill={`url(#${id}-ideaGradient)`} 
            stroke="#FFB300" 
            strokeWidth="0.5"
          />
          <rect x="-2" y="7" width="4" height="2" rx="0.5" fill="#9E9E9E" />
          <ellipse cx="-2" cy="-2" rx="1.5" ry="1" fill="white" opacity="0.5" />
          
          {/* Strahlen */}
          <line x1="-7" y1="-3" x2="-9" y2="-4" stroke="#FFD700" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
          <line x1="7" y1="-3" x2="9" y2="-4" stroke="#FFD700" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
          <line x1="0" y1="-9" x2="0" y2="-11" stroke="#FFD700" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
        </g>

        {/* Zahnrad (Technik) - mitte */}
        <g transform="translate(32, 14)">
          {animated && (
            <>
              <animateTransform attributeName="transform" type="translate" values="32 14;32 11;32 14" dur="2.8s" repeatCount="indefinite" />
            </>
          )}
          
          {/* Glow */}
          <circle cx="0" cy="0" r="8" fill="#4DD0E1" opacity="0.3">
            {animated && <animate attributeName="r" values="7;9;7" dur="2s" begin="0.3s" repeatCount="indefinite" />}
          </circle>
          
          {/* Zahnrad */}
          <g>
            {animated && (
              <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="8s" repeatCount="indefinite" />
            )}
            <circle cx="0" cy="0" r="5" fill={`url(#${id}-gearGradient)`} stroke="#00ACC1" strokeWidth="0.5" />
            <circle cx="0" cy="0" r="2" fill="#00ACC1" />
            {/* Zähne */}
            <rect x="-1" y="-7" width="2" height="3" fill={`url(#${id}-gearGradient)`} />
            <rect x="-1" y="4" width="2" height="3" fill={`url(#${id}-gearGradient)`} />
            <rect x="-7" y="-1" width="3" height="2" fill={`url(#${id}-gearGradient)`} />
            <rect x="4" y="-1" width="3" height="2" fill={`url(#${id}-gearGradient)`} />
            <rect x="3" y="-5.5" width="2" height="2" fill={`url(#${id}-gearGradient)`} transform="rotate(45 4 -4.5)" />
            <rect x="-5" y="-5.5" width="2" height="2" fill={`url(#${id}-gearGradient)`} transform="rotate(-45 -4 -4.5)" />
            <rect x="3" y="3.5" width="2" height="2" fill={`url(#${id}-gearGradient)`} transform="rotate(-45 4 4.5)" />
            <rect x="-5" y="3.5" width="2" height="2" fill={`url(#${id}-gearGradient)`} transform="rotate(45 -4 4.5)" />
          </g>
          <ellipse cx="-1" cy="-1" rx="1" ry="0.6" fill="white" opacity="0.4" />
        </g>

        {/* Stern (Erfolg) - rechts */}
        <g transform="translate(50, 18)">
          {animated && (
            <animateTransform attributeName="transform" type="translate" values="50 18;50 15;50 18" dur="2.2s" repeatCount="indefinite" />
          )}
          
          {/* Glow */}
          <circle cx="0" cy="0" r="8" fill="#BA68C8" opacity="0.3">
            {animated && <animate attributeName="r" values="7;9;7" dur="2s" begin="0.6s" repeatCount="indefinite" />}
          </circle>
          
          {/* Stern */}
          <path 
            d="M0 -7 L2 -2 L7 -2 L3 2 L5 7 L0 4 L-5 7 L-3 2 L-7 -2 L-2 -2 Z" 
            fill={`url(#${id}-starGradient)`} 
            stroke="#8E24AA" 
            strokeWidth="0.5"
          />
          <ellipse cx="-2" cy="-3" rx="1.5" ry="1" fill="white" opacity="0.5" />
        </g>

        {/* Magische Partikel */}
        {animated && (
          <>
            <circle cx="22" cy="28" r="1" fill="#FFD700">
              <animate attributeName="cy" values="32;24;32" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="42" cy="26" r="1" fill="#4DD0E1">
              <animate attributeName="cy" values="32;22;32" dur="2.3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;1;0" dur="2.3s" repeatCount="indefinite" />
            </circle>
            <circle cx="32" cy="24" r="1.5" fill="#BA68C8">
              <animate attributeName="cy" values="34;20;34" dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite" />
            </circle>
          </>
        )}

        {/* Schimmer */}
        {animated && (
          <rect x="4" y="4" width="56" height="56" fill={`url(#${id}-shimmer)`} style={{ mixBlendMode: 'overlay' }} />
        )}
      </g>

      {/* Funkeln */}
      {animated && (
        <>
          <path d="M6 10 L7 12 L9 12 L7.5 13.5 L8 16 L6 14.5 L4 16 L4.5 13.5 L3 12 L5 12 Z" fill="#FFF8DC" opacity="0.8">
            <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" />
          </path>
          <path d="M58 10 L59 12 L61 12 L59.5 13.5 L60 16 L58 14.5 L56 16 L56.5 13.5 L55 12 L57 12 Z" fill="#FFF8DC" opacity="0.6">
            <animate attributeName="opacity" values="0;1;0" dur="2s" begin="0.5s" repeatCount="indefinite" />
          </path>
          <path d="M32 4 L33 6 L35 6 L33.5 7.5 L34 10 L32 8.5 L30 10 L30.5 7.5 L29 6 L31 6 Z" fill="#FFF8DC" opacity="0.7">
            <animate attributeName="opacity" values="0;1;0" dur="1.8s" begin="1s" repeatCount="indefinite" />
          </path>
        </>
      )}
    </svg>
  );
};

export default LerntechnikenIcon;
