import React, { useId } from 'react';
import { IconProps } from './IconDefs';

/**
 * BaseCampIcon - Gemütliches Lager mit Kindergruppe
 * Symbolisiert: Gemeinschaft, sicherer Startpunkt, gemeinsames Lernen
 * Design: Kinder um Lagerfeuer, Zelt, magische Atmosphäre
 */

export const BaseCampIcon: React.FC<IconProps> = ({
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
        {/* ========== HIMMEL GRADIENTEN ========== */}
        <linearGradient id={`${id}-skyGradient`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0D1B2A" />
          <stop offset="25%" stopColor="#1B263B" />
          <stop offset="50%" stopColor="#2C3E50" />
          <stop offset="75%" stopColor="#E67E22" />
          <stop offset="100%" stopColor="#F39C12" />
        </linearGradient>

        {/* ========== ZELT GRADIENTEN ========== */}
        <linearGradient id={`${id}-tentMain`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#66BB6A" />
          <stop offset="25%" stopColor="#4CAF50" />
          <stop offset="50%" stopColor="#43A047" />
          <stop offset="75%" stopColor="#388E3C" />
          <stop offset="100%" stopColor="#2E7D32" />
        </linearGradient>

        <linearGradient id={`${id}-tentShadow`} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#388E3C" />
          <stop offset="50%" stopColor="#2E7D32" />
          <stop offset="100%" stopColor="#1B5E20" />
        </linearGradient>

        <linearGradient id={`${id}-tentHighlight`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A5D6A7" />
          <stop offset="100%" stopColor="#81C784" stopOpacity="0" />
        </linearGradient>

        {/* ========== FEUER GRADIENTEN ========== */}
        <linearGradient id={`${id}-fireOuter`} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#BF360C" />
          <stop offset="20%" stopColor="#E64A19" />
          <stop offset="40%" stopColor="#FF5722" />
          <stop offset="60%" stopColor="#FF9800" />
          <stop offset="80%" stopColor="#FFC107" />
          <stop offset="100%" stopColor="#FFEB3B" />
        </linearGradient>

        <linearGradient id={`${id}-fireInner`} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#FF5722" />
          <stop offset="25%" stopColor="#FF9800" />
          <stop offset="50%" stopColor="#FFC107" />
          <stop offset="75%" stopColor="#FFEB3B" />
          <stop offset="100%" stopColor="#FFFDE7" />
        </linearGradient>

        <linearGradient id={`${id}-fireCore`} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#FFC107" />
          <stop offset="50%" stopColor="#FFEB3B" />
          <stop offset="100%" stopColor="#FFFFFF" />
        </linearGradient>

        <radialGradient id={`${id}-fireGlow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF9800" stopOpacity="0.8" />
          <stop offset="40%" stopColor="#FF5722" stopOpacity="0.4" />
          <stop offset="70%" stopColor="#E64A19" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#BF360C" stopOpacity="0" />
        </radialGradient>

        <radialGradient id={`${id}-warmLight`} cx="50%" cy="80%" r="60%">
          <stop offset="0%" stopColor="#FF9800" stopOpacity="0.3" />
          <stop offset="50%" stopColor="#FF5722" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#FF5722" stopOpacity="0" />
        </radialGradient>

        {/* ========== KINDER/FIGUREN GRADIENTEN ========== */}
        <linearGradient id={`${id}-skinTone1`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFCC80" />
          <stop offset="50%" stopColor="#FFB74D" />
          <stop offset="100%" stopColor="#FFA726" />
        </linearGradient>

        <linearGradient id={`${id}-skinTone2`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D7CCC8" />
          <stop offset="50%" stopColor="#BCAAA4" />
          <stop offset="100%" stopColor="#A1887F" />
        </linearGradient>

        <linearGradient id={`${id}-skinTone3`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8D6E63" />
          <stop offset="50%" stopColor="#795548" />
          <stop offset="100%" stopColor="#6D4C41" />
        </linearGradient>

        {/* Kleidung */}
        <linearGradient id={`${id}-shirt1`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#64B5F6" />
          <stop offset="50%" stopColor="#42A5F5" />
          <stop offset="100%" stopColor="#1E88E5" />
        </linearGradient>

        <linearGradient id={`${id}-shirt2`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F48FB1" />
          <stop offset="50%" stopColor="#F06292" />
          <stop offset="100%" stopColor="#EC407A" />
        </linearGradient>

        <linearGradient id={`${id}-shirt3`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#81C784" />
          <stop offset="50%" stopColor="#66BB6A" />
          <stop offset="100%" stopColor="#4CAF50" />
        </linearGradient>

        <linearGradient id={`${id}-shirt4`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD54F" />
          <stop offset="50%" stopColor="#FFCA28" />
          <stop offset="100%" stopColor="#FFB300" />
        </linearGradient>

        {/* Haare */}
        <linearGradient id={`${id}-hairBrown`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6D4C41" />
          <stop offset="50%" stopColor="#5D4037" />
          <stop offset="100%" stopColor="#4E342E" />
        </linearGradient>

        <linearGradient id={`${id}-hairBlack`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#424242" />
          <stop offset="50%" stopColor="#212121" />
          <stop offset="100%" stopColor="#000000" />
        </linearGradient>

        <linearGradient id={`${id}-hairBlonde`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE082" />
          <stop offset="50%" stopColor="#FFD54F" />
          <stop offset="100%" stopColor="#FFCA28" />
        </linearGradient>

        {/* ========== BODEN/UMGEBUNG ========== */}
        <linearGradient id={`${id}-ground`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5D4037" />
          <stop offset="25%" stopColor="#4E342E" />
          <stop offset="50%" stopColor="#3E2723" />
          <stop offset="75%" stopColor="#4E342E" />
          <stop offset="100%" stopColor="#3E2723" />
        </linearGradient>

        <linearGradient id={`${id}-grass`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#558B2F" />
          <stop offset="50%" stopColor="#33691E" />
          <stop offset="100%" stopColor="#1B5E20" />
        </linearGradient>

        {/* ========== HOLZ ========== */}
        <linearGradient id={`${id}-wood`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8D6E63" />
          <stop offset="25%" stopColor="#795548" />
          <stop offset="50%" stopColor="#6D4C41" />
          <stop offset="75%" stopColor="#5D4037" />
          <stop offset="100%" stopColor="#4E342E" />
        </linearGradient>

        {/* ========== FILTER ========== */}
        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id={`${id}-fireGlowFilter`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id={`${id}-softGlow`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* ========== SHIMMER ========== */}
        <linearGradient id={`${id}-shimmer`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0)">
            {animated && <animate attributeName="offset" values="-1;2" dur="3s" repeatCount="indefinite" />}
          </stop>
          <stop offset="50%" stopColor="rgba(255,255,255,0.4)">
            {animated && <animate attributeName="offset" values="-0.5;2.5" dur="3s" repeatCount="indefinite" />}
          </stop>
          <stop offset="100%" stopColor="rgba(255,255,255,0)">
            {animated && <animate attributeName="offset" values="0;3" dur="3s" repeatCount="indefinite" />}
          </stop>
        </linearGradient>
      </defs>

      <g filter={glowing ? `url(#${id}-glow)` : undefined}>

        {/* ========== HINTERGRUND/HIMMEL ========== */}
        <rect x="0" y="0" width="64" height="42" fill={`url(#${id}-skyGradient)`} />

        {/* Sterne */}
        <circle cx="6" cy="6" r="1" fill="#FFF9C4" opacity="0.9">
          {animated && <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />}
        </circle>
        <circle cx="15" cy="4" r="0.7" fill="white" opacity="0.7">
          {animated && <animate attributeName="opacity" values="0.4;0.9;0.4" dur="2.5s" repeatCount="indefinite" />}
        </circle>
        <circle cx="52" cy="8" r="1.2" fill="#FFF9C4" opacity="0.8">
          {animated && <animate attributeName="opacity" values="0.6;1;0.6" dur="1.8s" repeatCount="indefinite" />}
        </circle>
        <circle cx="58" cy="4" r="0.6" fill="white" opacity="0.6">
          {animated && <animate attributeName="opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite" />}
        </circle>
        <circle cx="40" cy="6" r="0.8" fill="white" opacity="0.7">
          {animated && <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2.2s" repeatCount="indefinite" />}
        </circle>
        <circle cx="25" cy="8" r="0.5" fill="#FFF9C4" opacity="0.6">
          {animated && <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2.8s" repeatCount="indefinite" />}
        </circle>

        {/* ========== ZELT IM HINTERGRUND ========== */}
        <g transform="translate(44, 18)">
          {/* Zelt Schatten */}
          <ellipse cx="6" cy="24" rx="10" ry="2" fill="#1B5E20" opacity="0.3" />

          {/* Zelt Hauptform */}
          <path
            d="M-6 24 L6 0 L18 24 Z"
            fill={`url(#${id}-tentMain)`}
            stroke="#2E7D32"
            strokeWidth="0.5"
          />

          {/* Zelt Schattenseite */}
          <path
            d="M6 0 L6 24 L-6 24 Z"
            fill={`url(#${id}-tentShadow)`}
            opacity="0.6"
          />

          {/* Zelt Highlight */}
          <path
            d="M6 0 L10 8 L6 6 Z"
            fill={`url(#${id}-tentHighlight)`}
            opacity="0.5"
          />

          {/* Zelt Eingang */}
          <path
            d="M3 24 L6 14 L9 24 Z"
            fill="#3E2723"
          />
          <path
            d="M4 24 L6 16 L8 24 Z"
            fill="#2D1F1A"
          />

          {/* Zelt Nähte */}
          <line x1="6" y1="0" x2="6" y2="14" stroke="#4CAF50" strokeWidth="0.4" opacity="0.4" />
          <line x1="0" y1="12" x2="6" y2="0" stroke="#388E3C" strokeWidth="0.3" opacity="0.3" />
          <line x1="12" y1="12" x2="6" y2="0" stroke="#1B5E20" strokeWidth="0.3" opacity="0.3" />

          {/* Zeltspitze Flagge */}
          <rect x="5" y="-4" width="2" height="5" fill={`url(#${id}-wood)`} />
          <path d="M7 -4 L12 -2 L7 0 Z" fill="#E53935">
            {animated && (
              <animate
                attributeName="d"
                values="M7 -4 L12 -2 L7 0 Z;M7 -4 L11 -1.5 L7 0 Z;M7 -4 L12 -2 L7 0 Z"
                dur="2s"
                repeatCount="indefinite"
              />
            )}
          </path>
        </g>

        {/* ========== BODEN ========== */}
        <ellipse cx="32" cy="56" rx="34" ry="14" fill={`url(#${id}-ground)`} />
        <ellipse cx="32" cy="52" rx="30" ry="8" fill={`url(#${id}-grass)`} opacity="0.6" />

        {/* ========== WARMER LICHTSCHEIN VOM FEUER ========== */}
        <ellipse cx="32" cy="48" rx="24" ry="12" fill={`url(#${id}-warmLight)`} />

        {/* ========== LAGERFEUER ========== */}
        <g transform="translate(32, 48)" filter={`url(#${id}-fireGlowFilter)`}>

          {/* Feuer-Glow */}
          <ellipse cx="0" cy="2" rx="10" ry="6" fill={`url(#${id}-fireGlow)`}>
            {animated && <animate attributeName="rx" values="8;12;8" dur="0.5s" repeatCount="indefinite" />}
          </ellipse>

          {/* Holzscheite */}
          <ellipse cx="-4" cy="6" rx="5" ry="1.5" fill={`url(#${id}-wood)`} transform="rotate(-20)" />
          <ellipse cx="4" cy="6" rx="5" ry="1.5" fill={`url(#${id}-wood)`} transform="rotate(20)" />
          <ellipse cx="0" cy="5" rx="4" ry="1.2" fill="#5D4037" />

          {/* Glut */}
          <ellipse cx="0" cy="5" rx="3" ry="1" fill="#FF5722" opacity="0.8">
            {animated && <animate attributeName="opacity" values="0.6;0.9;0.6" dur="0.3s" repeatCount="indefinite" />}
          </ellipse>

          {/* Steine */}
          <ellipse cx="-6" cy="6" rx="2" ry="1.2" fill="#757575" stroke="#616161" strokeWidth="0.3" />
          <ellipse cx="6" cy="6" rx="2" ry="1.2" fill="#616161" stroke="#424242" strokeWidth="0.3" />
          <ellipse cx="-4" cy="7" rx="1.5" ry="0.8" fill="#9E9E9E" />
          <ellipse cx="4" cy="7" rx="1.5" ry="0.8" fill="#757575" />
          <ellipse cx="0" cy="7.5" rx="1.8" ry="0.9" fill="#616161" />

          {/* Äußere Flamme */}
          <path d="M0 4 Q-5 -2, -3 -10 Q-1 -5, 0 -14 Q1 -5, 3 -10 Q5 -2, 0 4 Z" fill={`url(#${id}-fireOuter)`}>
            {animated && (
              <animate
                attributeName="d"
                values="M0 4 Q-5 -2, -3 -10 Q-1 -5, 0 -14 Q1 -5, 3 -10 Q5 -2, 0 4 Z;
                        M0 4 Q-4 -1, -4 -9 Q0 -4, 0 -15 Q0 -4, 4 -9 Q4 -1, 0 4 Z;
                        M0 4 Q-5 -2, -3 -10 Q-1 -5, 0 -14 Q1 -5, 3 -10 Q5 -2, 0 4 Z"
                dur="0.4s"
                repeatCount="indefinite"
              />
            )}
          </path>

          {/* Mittlere Flamme */}
          <path d="M0 3 Q-3 0, -2 -7 Q0 -3, 0 -11 Q0 -3, 2 -7 Q3 0, 0 3 Z" fill={`url(#${id}-fireInner)`}>
            {animated && (
              <animate
                attributeName="d"
                values="M0 3 Q-3 0, -2 -7 Q0 -3, 0 -11 Q0 -3, 2 -7 Q3 0, 0 3 Z;
                        M0 3 Q-2.5 0.5, -2.5 -6 Q0 -2, 0 -12 Q0 -2, 2.5 -6 Q2.5 0.5, 0 3 Z;
                        M0 3 Q-3 0, -2 -7 Q0 -3, 0 -11 Q0 -3, 2 -7 Q3 0, 0 3 Z"
                dur="0.35s"
                repeatCount="indefinite"
              />
            )}
          </path>

          {/* Kern-Flamme */}
          <path d="M0 2 Q-1.5 0, -1 -4 Q0 -1, 0 -7 Q0 -1, 1 -4 Q1.5 0, 0 2 Z" fill={`url(#${id}-fireCore)`}>
            {animated && (
              <animate
                attributeName="d"
                values="M0 2 Q-1.5 0, -1 -4 Q0 -1, 0 -7 Q0 -1, 1 -4 Q1.5 0, 0 2 Z;
                        M0 2 Q-1 0.5, -1.2 -3 Q0 0, 0 -8 Q0 0, 1.2 -3 Q1 0.5, 0 2 Z;
                        M0 2 Q-1.5 0, -1 -4 Q0 -1, 0 -7 Q0 -1, 1 -4 Q1.5 0, 0 2 Z"
                dur="0.3s"
                repeatCount="indefinite"
              />
            )}
          </path>

          {/* Funken */}
          {animated && (
            <>
              <circle cx="-2" cy="0" r="0.8" fill="#FFEB3B">
                <animate attributeName="cy" values="0;-18" dur="1.2s" repeatCount="indefinite" />
                <animate attributeName="cx" values="-2;-4" dur="1.2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0" dur="1.2s" repeatCount="indefinite" />
              </circle>
              <circle cx="1.5" cy="0" r="0.6" fill="#FF9800">
                <animate attributeName="cy" values="0;-15" dur="1s" repeatCount="indefinite" />
                <animate attributeName="cx" values="1.5;3" dur="1s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0" dur="1s" repeatCount="indefinite" />
              </circle>
              <circle cx="0" cy="-2" r="0.5" fill="#FFEB3B">
                <animate attributeName="cy" values="-2;-20" dur="1.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0" dur="1.4s" repeatCount="indefinite" />
              </circle>
              <circle cx="-1" cy="-1" r="0.4" fill="#FFC107">
                <animate attributeName="cy" values="-1;-16" dur="0.9s" repeatCount="indefinite" />
                <animate attributeName="cx" values="-1;1" dur="0.9s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0" dur="0.9s" repeatCount="indefinite" />
              </circle>
            </>
          )}
        </g>

        {/* ========== KINDER UM DAS FEUER ========== */}

        {/* Kind 1 - links, sitzend (blaues Shirt) */}
        <g transform="translate(12, 42)" filter={`url(#${id}-softGlow)`}>
          {/* Körper/Shirt */}
          <ellipse cx="0" cy="4" rx="4" ry="5" fill={`url(#${id}-shirt1)`} />
          <ellipse cx="0" cy="3" rx="3.5" ry="4" fill={`url(#${id}-shirt1)`} />
          {/* Highlight */}
          <ellipse cx="-1" cy="2" rx="1.5" ry="2" fill="white" opacity="0.2" />
          {/* Kopf */}
          <circle cx="0" cy="-3" r="3.5" fill={`url(#${id}-skinTone1)`} />
          {/* Haare */}
          <ellipse cx="0" cy="-5" rx="3.5" ry="2.5" fill={`url(#${id}-hairBrown)`} />
          <ellipse cx="-1.5" cy="-4" rx="1" ry="1.5" fill={`url(#${id}-hairBrown)`} />
          {/* Gesicht - vom Feuer beleuchtet */}
          <ellipse cx="1" cy="-3" rx="1" ry="1.2" fill="#FFCC80" opacity="0.4" />
          {/* Augen */}
          <circle cx="-1" cy="-3" r="0.5" fill="#4E342E" />
          <circle cx="1" cy="-3" r="0.5" fill="#4E342E" />
          {/* Lächeln */}
          <path d="M-1 -1.5 Q0 -0.5, 1 -1.5" stroke="#5D4037" strokeWidth="0.4" fill="none" />
          {/* Wangen-Glow vom Feuer */}
          <circle cx="2" cy="-2" r="0.8" fill="#FF8A65" opacity="0.4" />
        </g>

        {/* Kind 2 - links-mitte, sitzend (pinkes Shirt) */}
        <g transform="translate(22, 44)" filter={`url(#${id}-softGlow)`}>
          {/* Körper */}
          <ellipse cx="0" cy="3" rx="3.5" ry="4.5" fill={`url(#${id}-shirt2)`} />
          <ellipse cx="-0.5" cy="2" rx="1.2" ry="1.8" fill="white" opacity="0.15" />
          {/* Kopf */}
          <circle cx="0" cy="-2.5" r="3.2" fill={`url(#${id}-skinTone2)`} />
          {/* Haare - Zöpfe */}
          <ellipse cx="0" cy="-4.5" rx="3.5" ry="2.2" fill={`url(#${id}-hairBlack)`} />
          <ellipse cx="-3" cy="-2" rx="1" ry="2" fill={`url(#${id}-hairBlack)`} />
          <ellipse cx="3" cy="-2" rx="1" ry="2" fill={`url(#${id}-hairBlack)`} />
          {/* Gesicht */}
          <circle cx="-0.8" cy="-2.5" r="0.45" fill="#3E2723" />
          <circle cx="0.8" cy="-2.5" r="0.45" fill="#3E2723" />
          <path d="M-0.8 -1 Q0 0, 0.8 -1" stroke="#5D4037" strokeWidth="0.35" fill="none" />
          <circle cx="1.5" cy="-1.5" r="0.7" fill="#FF8A65" opacity="0.35" />
        </g>

        {/* Kind 3 - rechts-mitte, sitzend (grünes Shirt) */}
        <g transform="translate(42, 44)" filter={`url(#${id}-softGlow)`}>
          {/* Körper */}
          <ellipse cx="0" cy="3" rx="3.5" ry="4.5" fill={`url(#${id}-shirt3)`} />
          <ellipse cx="0.5" cy="2" rx="1.2" ry="1.8" fill="white" opacity="0.15" />
          {/* Kopf */}
          <circle cx="0" cy="-2.5" r="3.2" fill={`url(#${id}-skinTone3)`} />
          {/* Haare - kurz */}
          <ellipse cx="0" cy="-4" rx="3" ry="2" fill={`url(#${id}-hairBlack)`} />
          {/* Gesicht */}
          <circle cx="-0.8" cy="-2.5" r="0.45" fill="#3E2723" />
          <circle cx="0.8" cy="-2.5" r="0.45" fill="#3E2723" />
          <path d="M-0.8 -1 Q0 0, 0.8 -1" stroke="#4E342E" strokeWidth="0.35" fill="none" />
          <circle cx="-1.5" cy="-1.5" r="0.7" fill="#FF8A65" opacity="0.3" />
        </g>

        {/* Kind 4 - rechts, sitzend (gelbes Shirt) */}
        <g transform="translate(52, 42)" filter={`url(#${id}-softGlow)`}>
          {/* Körper */}
          <ellipse cx="0" cy="4" rx="4" ry="5" fill={`url(#${id}-shirt4)`} />
          <ellipse cx="0.5" cy="2.5" rx="1.5" ry="2" fill="white" opacity="0.2" />
          {/* Kopf */}
          <circle cx="0" cy="-3" r="3.5" fill={`url(#${id}-skinTone1)`} />
          {/* Haare - blond */}
          <ellipse cx="0" cy="-5" rx="3.8" ry="2.5" fill={`url(#${id}-hairBlonde)`} />
          <ellipse cx="2" cy="-4" rx="1.2" ry="1.8" fill={`url(#${id}-hairBlonde)`} />
          {/* Gesicht */}
          <ellipse cx="-1" cy="-3" rx="0.8" ry="1" fill="#FFCC80" opacity="0.3" />
          <circle cx="-1" cy="-3" r="0.5" fill="#4E342E" />
          <circle cx="1" cy="-3" r="0.5" fill="#4E342E" />
          <path d="M-1 -1.5 Q0 -0.5, 1 -1.5" stroke="#5D4037" strokeWidth="0.4" fill="none" />
          <circle cx="-2" cy="-2" r="0.8" fill="#FF8A65" opacity="0.4" />
        </g>

        {/* ========== MAGISCHE PARTIKEL ========== */}
        {animated && (
          <>
            <circle cx="8" cy="38" r="1" fill="#FFD54F" opacity="0.7">
              <animate attributeName="cy" values="42;32;42" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;0.8;0" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="56" cy="36" r="0.8" fill="#4DD0E1" opacity="0.6">
              <animate attributeName="cy" values="42;30;42" dur="3.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;0.7;0" dur="3.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="32" cy="28" r="1.2" fill="#CE93D8" opacity="0.5">
              <animate attributeName="cy" values="36;24;36" dur="2.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;0.6;0" dur="2.8s" repeatCount="indefinite" />
            </circle>
          </>
        )}

        {/* ========== FUNKELN/SPARKLES ========== */}
        {animated && (
          <>
            <path d="M4 16 L5 18 L7 18 L5.5 19.5 L6 22 L4 20.5 L2 22 L2.5 19.5 L1 18 L3 18 Z" fill="#FFF8DC" opacity="0.8">
              <animate attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite" />
            </path>
            <path d="M60 14 L61 16 L63 16 L61.5 17.5 L62 20 L60 18.5 L58 20 L58.5 17.5 L57 16 L59 16 Z" fill="#FFF8DC" opacity="0.6">
              <animate attributeName="opacity" values="0;1;0" dur="2.2s" begin="0.6s" repeatCount="indefinite" />
            </path>
            <path d="M28 12 L29 14 L31 14 L29.5 15.5 L30 18 L28 16.5 L26 18 L26.5 15.5 L25 14 L27 14 Z" fill="#FFF8DC" opacity="0.7">
              <animate attributeName="opacity" values="0;1;0" dur="2s" begin="1s" repeatCount="indefinite" />
            </path>
          </>
        )}

        {/* ========== SHIMMER OVERLAY ========== */}
        {animated && (
          <rect x="0" y="0" width="64" height="64" fill={`url(#${id}-shimmer)`} style={{ mixBlendMode: 'overlay' }} />
        )}

      </g>
    </svg>
  );
};

export default BaseCampIcon;
