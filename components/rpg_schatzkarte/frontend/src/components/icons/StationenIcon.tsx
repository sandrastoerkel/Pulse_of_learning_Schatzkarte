import React, { useId } from 'react';
import { IconProps } from './IconDefs';

/**
 * StationenIcon - Magischer Wegweiser für die Lernreise
 * Symbolisiert: Verschiedene Lernstationen, Orientierung, Fortschritt auf der Reise
 * Design: Detaillierter Holz-Wegweiser mit leuchtenden Schildern und magischem Kompass
 */

export const StationenIcon: React.FC<IconProps> = ({
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
        {/* Holz Gradient für Pfosten */}
        <linearGradient id={`${id}-woodGradient`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8B5A2B" />
          <stop offset="20%" stopColor="#A0522D" />
          <stop offset="40%" stopColor="#8B4513" />
          <stop offset="60%" stopColor="#A0522D" />
          <stop offset="80%" stopColor="#8B5A2B" />
          <stop offset="100%" stopColor="#6B4423" />
        </linearGradient>

        <linearGradient id={`${id}-woodDark`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#5D3A1A" />
          <stop offset="100%" stopColor="#3E2713" />
        </linearGradient>

        {/* Schild Gradient - Türkis/Cyan */}
        <linearGradient id={`${id}-signCyan`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#80DEEA" />
          <stop offset="25%" stopColor="#4DD0E1" />
          <stop offset="50%" stopColor="#26C6DA" />
          <stop offset="75%" stopColor="#4DD0E1" />
          <stop offset="100%" stopColor="#00ACC1" />
        </linearGradient>

        {/* Schild Gradient - Orange/Gold */}
        <linearGradient id={`${id}-signGold`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE082" />
          <stop offset="25%" stopColor="#FFD54F" />
          <stop offset="50%" stopColor="#FFCA28" />
          <stop offset="75%" stopColor="#FFD54F" />
          <stop offset="100%" stopColor="#FFB300" />
        </linearGradient>

        {/* Schild Gradient - Lila/Magenta */}
        <linearGradient id={`${id}-signPurple`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#CE93D8" />
          <stop offset="25%" stopColor="#BA68C8" />
          <stop offset="50%" stopColor="#AB47BC" />
          <stop offset="75%" stopColor="#BA68C8" />
          <stop offset="100%" stopColor="#8E24AA" />
        </linearGradient>

        {/* Schild Gradient - Grün */}
        <linearGradient id={`${id}-signGreen`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A5D6A7" />
          <stop offset="25%" stopColor="#81C784" />
          <stop offset="50%" stopColor="#66BB6A" />
          <stop offset="75%" stopColor="#81C784" />
          <stop offset="100%" stopColor="#4CAF50" />
        </linearGradient>

        {/* Kompass Gold Gradient */}
        <linearGradient id={`${id}-compassGold`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE55C" />
          <stop offset="25%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#FFC125" />
          <stop offset="75%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>

        {/* Magisches Leuchten */}
        <radialGradient id={`${id}-magicGlow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="30%" stopColor="#FFD700" />
          <stop offset="60%" stopColor="#FFA000" />
          <stop offset="100%" stopColor="#FF6F00" stopOpacity="0" />
        </radialGradient>

        <radialGradient id={`${id}-compassGlow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#FFD700" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
        </radialGradient>

        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id={`${id}-signGlow`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Shimmer Animation */}
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

      <g filter={glowing ? `url(#${id}-glow)` : undefined}>

        {/* ========== HOLZPFOSTEN ========== */}

        {/* Haupt-Pfosten */}
        <rect
          x="28" y="20" width="8" height="40" rx="1"
          fill={`url(#${id}-woodGradient)`}
          stroke={`url(#${id}-woodDark)`}
          strokeWidth="0.5"
        />

        {/* Holzmaserung Details */}
        <line x1="30" y1="22" x2="30" y2="58" stroke="#6B4423" strokeWidth="0.5" opacity="0.4" />
        <line x1="34" y1="22" x2="34" y2="58" stroke="#6B4423" strokeWidth="0.5" opacity="0.3" />
        <line x1="29" y1="30" x2="35" y2="30" stroke="#5D3A1A" strokeWidth="0.3" opacity="0.3" />
        <line x1="29" y1="42" x2="35" y2="42" stroke="#5D3A1A" strokeWidth="0.3" opacity="0.3" />
        <line x1="29" y1="52" x2="35" y2="52" stroke="#5D3A1A" strokeWidth="0.3" opacity="0.3" />

        {/* Highlight auf Pfosten */}
        <rect x="29" y="20" width="2" height="40" fill="white" opacity="0.1" />

        {/* Boden/Gras */}
        <ellipse cx="32" cy="60" rx="10" ry="3" fill="#4CAF50" opacity="0.6" />
        <ellipse cx="32" cy="60" rx="6" ry="2" fill="#66BB6A" opacity="0.4" />

        {/* ========== WEGWEISER-SCHILDER ========== */}

        {/* Schild 1 - Nach rechts (Cyan) - oben */}
        <g filter={`url(#${id}-signGlow)`}>
          <g>
            {animated && (
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 32 26;2 32 26;0 32 26;-1 32 26;0 32 26"
                dur="4s"
                repeatCount="indefinite"
              />
            )}
            <path
              d="M34 22 L54 22 L58 26 L54 30 L34 30 Z"
              fill={`url(#${id}-signCyan)`}
              stroke="#00838F"
              strokeWidth="0.5"
            />
            {/* Text-Linien auf Schild */}
            <line x1="38" y1="25" x2="50" y2="25" stroke="white" strokeWidth="1.5" opacity="0.7" strokeLinecap="round" />
            <line x1="38" y1="28" x2="46" y2="28" stroke="white" strokeWidth="1" opacity="0.5" strokeLinecap="round" />
            {/* Glanz */}
            <rect x="36" y="23" width="16" height="2" fill="white" opacity="0.2" rx="1" />
          </g>
        </g>

        {/* Schild 2 - Nach links (Gold/Orange) - mitte */}
        <g filter={`url(#${id}-signGlow)`}>
          <g>
            {animated && (
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 32 36;-2 32 36;0 32 36;1 32 36;0 32 36"
                dur="3.5s"
                repeatCount="indefinite"
              />
            )}
            <path
              d="M30 32 L10 32 L6 36 L10 40 L30 40 Z"
              fill={`url(#${id}-signGold)`}
              stroke="#F57C00"
              strokeWidth="0.5"
            />
            {/* Text-Linien auf Schild */}
            <line x1="12" y1="35" x2="26" y2="35" stroke="white" strokeWidth="1.5" opacity="0.7" strokeLinecap="round" />
            <line x1="14" y1="38" x2="22" y2="38" stroke="white" strokeWidth="1" opacity="0.5" strokeLinecap="round" />
            {/* Glanz */}
            <rect x="12" y="33" width="14" height="2" fill="white" opacity="0.2" rx="1" />
          </g>
        </g>

        {/* Schild 3 - Nach rechts (Lila) - unten */}
        <g filter={`url(#${id}-signGlow)`}>
          <g>
            {animated && (
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 32 46;1.5 32 46;0 32 46;-1.5 32 46;0 32 46"
                dur="4.5s"
                repeatCount="indefinite"
              />
            )}
            <path
              d="M34 42 L50 42 L54 46 L50 50 L34 50 Z"
              fill={`url(#${id}-signPurple)`}
              stroke="#7B1FA2"
              strokeWidth="0.5"
            />
            {/* Text-Linien auf Schild */}
            <line x1="38" y1="45" x2="48" y2="45" stroke="white" strokeWidth="1.5" opacity="0.7" strokeLinecap="round" />
            <line x1="38" y1="48" x2="44" y2="48" stroke="white" strokeWidth="1" opacity="0.5" strokeLinecap="round" />
            {/* Glanz */}
            <rect x="36" y="43" width="12" height="2" fill="white" opacity="0.2" rx="1" />
          </g>
        </g>

        {/* ========== MAGISCHER KOMPASS OBEN ========== */}

        <g transform="translate(32, 10)">
          {animated && (
            <animateTransform
              attributeName="transform"
              type="translate"
              values="32 10;32 8;32 10"
              dur="3s"
              repeatCount="indefinite"
            />
          )}

          {/* Glow unter Kompass */}
          <circle cx="0" cy="0" r="10" fill={`url(#${id}-compassGlow)`} opacity="0.5">
            {animated && <animate attributeName="r" values="8;11;8" dur="2s" repeatCount="indefinite" />}
          </circle>

          {/* Kompass Ring */}
          <circle
            cx="0" cy="0" r="7"
            fill="none"
            stroke={`url(#${id}-compassGold)`}
            strokeWidth="2"
          />
          <circle
            cx="0" cy="0" r="5.5"
            fill="#1A237E"
            stroke="#FFD700"
            strokeWidth="0.5"
          />

          {/* Kompass Stern / Nadel */}
          <g>
            {animated && (
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 0 0;10 0 0;0 0 0;-10 0 0;0 0 0"
                dur="5s"
                repeatCount="indefinite"
              />
            )}
            {/* Nord (Gold) */}
            <path d="M0 -4 L1.5 0 L0 -1 L-1.5 0 Z" fill="#FFD700" />
            {/* Süd (Silber) */}
            <path d="M0 4 L1.5 0 L0 1 L-1.5 0 Z" fill="#E0E0E0" />
            {/* Ost */}
            <path d="M4 0 L0 1.5 L1 0 L0 -1.5 Z" fill="#FFD700" opacity="0.8" />
            {/* West */}
            <path d="M-4 0 L0 1.5 L-1 0 L0 -1.5 Z" fill="#E0E0E0" opacity="0.8" />
          </g>

          {/* Mittelpunkt */}
          <circle cx="0" cy="0" r="1" fill="#FFD700" />
          <circle cx="0" cy="0" r="0.5" fill="white" />

          {/* Glanz auf Kompass */}
          <ellipse cx="-2" cy="-2" rx="2" ry="1" fill="white" opacity="0.3" />
        </g>

        {/* ========== MAGISCHE PARTIKEL ========== */}

        {animated && (
          <>
            {/* Aufsteigende Partikel */}
            <circle cx="24" cy="30" r="1.5" fill="#4DD0E1">
              <animate attributeName="cy" values="35;20;35" dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;0.8;0" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="40" cy="38" r="1.5" fill="#FFD54F">
              <animate attributeName="cy" values="42;26;42" dur="2.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;0.8;0" dur="2.8s" repeatCount="indefinite" />
            </circle>
            <circle cx="20" cy="42" r="1" fill="#BA68C8">
              <animate attributeName="cy" values="48;32;48" dur="2.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;0.7;0" dur="2.2s" repeatCount="indefinite" />
            </circle>
            <circle cx="44" cy="28" r="1" fill="#81C784">
              <animate attributeName="cy" values="34;18;34" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;0.7;0" dur="3s" repeatCount="indefinite" />
            </circle>
          </>
        )}

        {/* ========== FUNKELN ========== */}

        {animated && (
          <>
            <path d="M8 18 L9 20 L11 20 L9.5 21.5 L10 24 L8 22.5 L6 24 L6.5 21.5 L5 20 L7 20 Z" fill="#FFF8DC" opacity="0.8">
              <animate attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite" />
            </path>
            <path d="M56 34 L57 36 L59 36 L57.5 37.5 L58 40 L56 38.5 L54 40 L54.5 37.5 L53 36 L55 36 Z" fill="#FFF8DC" opacity="0.6">
              <animate attributeName="opacity" values="0;1;0" dur="2.2s" begin="0.5s" repeatCount="indefinite" />
            </path>
            <path d="M14 50 L15 52 L17 52 L15.5 53.5 L16 56 L14 54.5 L12 56 L12.5 53.5 L11 52 L13 52 Z" fill="#FFF8DC" opacity="0.7">
              <animate attributeName="opacity" values="0;1;0" dur="2s" begin="1s" repeatCount="indefinite" />
            </path>
          </>
        )}

        {/* Schimmer-Overlay */}
        {animated && (
          <rect x="4" y="4" width="56" height="56" fill={`url(#${id}-shimmer)`} style={{ mixBlendMode: 'overlay' }} />
        )}
      </g>
    </svg>
  );
};

export default StationenIcon;
