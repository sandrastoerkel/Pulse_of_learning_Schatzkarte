/**
 * WizardTower Background
 * 
 * SVG-Hintergrund für das Zaubererturm-Template.
 * Enthält magische Elemente wie Sterne, Kerzen, Regale.
 */

import React from 'react';
import { UI, FEEDBACK, GOLD, DARK } from '../../constants';

// =============================================================================
// TYPES
// =============================================================================

export interface WizardTowerProps {
  scale?: number;
}

// =============================================================================
// COMPONENT
// =============================================================================

export const WizardTower: React.FC<WizardTowerProps> = ({ scale = 1 }) => {
  const width = 1000 * scale;
  const height = 600 * scale;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 1000 600"
      style={{ position: 'absolute', top: 0, left: 0 }}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        {/* Gradients */}
        <linearGradient id="wt-bg-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a1a3e" />
          <stop offset="50%" stopColor="#12122a" />
          <stop offset="100%" stopColor="#0a0a1a" />
        </linearGradient>

        <linearGradient id="wt-wall-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2a2a4a" />
          <stop offset="100%" stopColor="#1a1a3a" />
        </linearGradient>

        <linearGradient id="wt-gold-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={UI.actionHover} />
          <stop offset="50%" stopColor={UI.action} />
          <stop offset="100%" stopColor={UI.border} />
        </linearGradient>

        <linearGradient id="wt-window-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a3a5a" />
          <stop offset="100%" stopColor="#0a1a2a" />
        </linearGradient>

        <radialGradient id="wt-candle-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--fb-reward)" stopOpacity="0.6" />
          <stop offset="50%" stopColor="var(--fb-reward)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FF8C00" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="wt-star-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>

        {/* Filters */}
        <filter id="wt-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="wt-soft-shadow">
          <feDropShadow dx="2" dy="4" stdDeviation="4" floodOpacity="0.5" />
        </filter>

        {/* Patterns */}
        <pattern id="wt-stone-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="40" height="40" fill="#1a1a3a" />
          <rect x="0" y="0" width="19" height="19" fill="#1e1e40" rx="1" />
          <rect x="21" y="0" width="19" height="19" fill="#1c1c3c" rx="1" />
          <rect x="0" y="21" width="19" height="19" fill="#1c1c3c" rx="1" />
          <rect x="21" y="21" width="19" height="19" fill="#1e1e40" rx="1" />
        </pattern>
      </defs>

      {/* Background */}
      <rect width="1000" height="600" fill="url(#wt-bg-gradient)" />

      {/* Stone walls */}
      <rect x="0" y="0" width="1000" height="600" fill="url(#wt-stone-pattern)" opacity="0.5" />

      {/* Floor */}
      <path
        d="M0 500 Q250 480 500 490 Q750 500 1000 485 L1000 600 L0 600 Z"
        fill="#1a1a2e"
        stroke="#2a2a4e"
        strokeWidth="2"
      />
      <ellipse cx="500" cy="550" rx="450" ry="40" fill="#12121e" opacity="0.5" />

      {/* Arched window (right side) */}
      <g transform="translate(780, 80)">
        <path
          d="M0 120 L0 40 Q0 0 40 0 L80 0 Q120 0 120 40 L120 120 Z"
          fill="url(#wt-window-gradient)"
          stroke={UI.border}
          strokeWidth="3"
        />
        {/* Window bars */}
        <line x1="40" y1="0" x2="40" y2="120" stroke={UI.border} strokeWidth="2" />
        <line x1="80" y1="0" x2="80" y2="120" stroke={UI.border} strokeWidth="2" />
        <line x1="0" y1="60" x2="120" y2="60" stroke={UI.border} strokeWidth="2" />
        {/* Stars through window */}
        <circle cx="30" cy="30" r="2" fill="#fff" opacity="0.8" />
        <circle cx="90" cy="45" r="1.5" fill="#fff" opacity="0.6" />
        <circle cx="60" cy="25" r="1" fill="#fff" opacity="0.7" />
        {/* Moon */}
        <circle cx="70" cy="35" r="15" fill="#e8e8ff" opacity="0.3" />
      </g>

      {/* Bookshelf frame (left side) */}
      <g transform="translate(50, 150)">
        <rect x="0" y="0" width="120" height="200" fill="#2a1a1a" rx="4" />
        <rect x="5" y="5" width="110" height="190" fill="#1a0a0a" rx="2" />
        {/* Shelves */}
        <rect x="5" y="50" width="110" height="4" fill="#3a2a2a" />
        <rect x="5" y="100" width="110" height="4" fill="#3a2a2a" />
        <rect x="5" y="150" width="110" height="4" fill="#3a2a2a" />
        {/* Books */}
        <rect x="10" y="10" width="15" height="38" fill="#8B0000" rx="1" />
        <rect x="28" y="15" width="12" height="33" fill="#00008B" rx="1" />
        <rect x="43" y="12" width="18" height="36" fill="#006400" rx="1" />
        <rect x="64" y="18" width="10" height="30" fill="#4B0082" rx="1" />
        <rect x="77" y="10" width="14" height="38" fill="#8B4513" rx="1" />
        <rect x="94" y="14" width="16" height="34" fill="#800000" rx="1" />
        {/* Second shelf books */}
        <rect x="12" y="58" width="20" height="38" fill="#2F4F4F" rx="1" />
        <rect x="35" y="62" width="14" height="34" fill="#B8860B" rx="1" />
        <rect x="52" y="56" width="16" height="40" fill="#191970" rx="1" />
        <rect x="71" y="60" width="12" height="36" fill="#556B2F" rx="1" />
        <rect x="86" y="58" width="22" height="38" fill="#8B0000" rx="1" />
      </g>

      {/* Magic mirror frame */}
      <g transform="translate(190, 50)">
        <ellipse cx="50" cy="60" rx="45" ry="55" fill={UI.border} />
        <ellipse cx="50" cy="60" rx="38" ry="48" fill="#1a2a4a" />
        {/* Mirror shimmer */}
        <ellipse cx="50" cy="60" rx="35" ry="45" fill="url(#wt-window-gradient)" opacity="0.8" />
        <ellipse cx="40" cy="50" rx="15" ry="20" fill="#fff" opacity="0.1" />
        {/* Decorative gems */}
        <circle cx="50" cy="8" r="6" fill="#9400D3" filter="url(#wt-glow)" />
        <circle cx="10" cy="60" r="4" fill="#00CED1" filter="url(#wt-glow)" />
        <circle cx="90" cy="60" r="4" fill="#00CED1" filter="url(#wt-glow)" />
      </g>

      {/* Large table */}
      <g transform="translate(420, 420)">
        <ellipse cx="100" cy="80" rx="120" ry="30" fill="#1a0a0a" opacity="0.5" />
        <rect x="0" y="0" width="200" height="80" fill="#3a2a1a" rx="4" />
        <rect x="5" y="0" width="190" height="5" fill={UI.border} />
        {/* Table items */}
        <circle cx="50" cy="40" r="15" fill="#4a3a2a" /> {/* Plate */}
        <rect x="130" y="25" width="40" height="50" fill="#2a1a1a" rx="2" /> {/* Book */}
        <rect x="135" y="30" width="30" height="3" fill={UI.border} opacity="0.5" />
      </g>

      {/* Cauldron */}
      <g transform="translate(80, 430)">
        <ellipse cx="50" cy="70" rx="45" ry="15" fill="#1a1a1a" opacity="0.5" />
        <path
          d="M10 30 Q0 50 10 70 Q25 85 50 85 Q75 85 90 70 Q100 50 90 30 Q75 20 50 20 Q25 20 10 30"
          fill="#2a2a2a"
          stroke="#3a3a3a"
          strokeWidth="2"
        />
        {/* Bubbling potion */}
        <ellipse cx="50" cy="40" rx="35" ry="15" fill="#4a0080" opacity="0.8" />
        <circle cx="35" cy="38" r="4" fill="#6a00a0" opacity="0.6" />
        <circle cx="55" cy="42" r="3" fill="#8a00c0" opacity="0.7" />
        <circle cx="65" cy="35" r="2" fill="#aa00e0" opacity="0.5" />
        {/* Steam */}
        <path d="M40 25 Q35 15 40 5" stroke="#6a00a0" strokeWidth="2" fill="none" opacity="0.4" />
        <path d="M55 20 Q60 10 55 0" stroke="#6a00a0" strokeWidth="2" fill="none" opacity="0.3" />
      </g>

      {/* Crystal ball stand */}
      <g transform="translate(680, 450)">
        <ellipse cx="50" cy="60" rx="30" ry="10" fill="#1a1a1a" opacity="0.5" />
        <path d="M35 50 L30 60 L70 60 L65 50" fill="#3a3a3a" />
        <circle cx="50" cy="35" r="25" fill="#1a3a5a" opacity="0.8" />
        <circle cx="50" cy="35" r="22" fill="url(#wt-window-gradient)" />
        <circle cx="42" cy="28" r="8" fill="#fff" opacity="0.2" />
        {/* Mystical glow */}
        <circle cx="50" cy="35" r="30" fill="url(#wt-candle-glow)" opacity="0.5" />
      </g>

      {/* Telescope */}
      <g transform="translate(640, 100)">
        <rect x="0" y="60" width="8" height="80" fill="#4a3a2a" />
        <rect x="50" y="70" width="8" height="70" fill="#4a3a2a" />
        <rect x="-5" y="30" width="70" height="35" fill="#5a4a3a" rx="4" transform="rotate(-15 30 45)" />
        <circle cx="0" cy="40" r="12" fill="#3a3a4a" stroke={UI.border} strokeWidth="2" transform="rotate(-15 30 45)" />
        <circle cx="65" cy="55" r="8" fill="#2a2a3a" stroke={UI.border} strokeWidth="1" transform="rotate(-15 30 45)" />
      </g>

      {/* Armor stand */}
      <g transform="translate(160, 350)">
        <rect x="30" y="80" width="20" height="80" fill="#3a3a3a" />
        <ellipse cx="40" cy="160" rx="30" ry="8" fill="#2a2a2a" />
        {/* Helmet */}
        <ellipse cx="40" cy="20" rx="25" ry="20" fill="#5a5a6a" />
        <rect x="15" y="25" width="50" height="8" fill="#4a4a5a" />
        <rect x="30" y="10" width="20" height="5" fill={UI.border} />
        {/* Chest plate */}
        <path d="M20 45 Q15 60 20 90 L60 90 Q65 60 60 45 Q40 35 20 45" fill="#5a5a6a" />
        <line x1="40" y1="50" x2="40" y2="85" stroke={UI.border} strokeWidth="2" />
      </g>

      {/* Floating candles with glow */}
      {[
        { x: 300, y: 100 },
        { x: 450, y: 80 },
        { x: 600, y: 120 },
        { x: 150, y: 280 },
        { x: 850, y: 250 },
      ].map((pos, i) => (
        <g key={i} transform={`translate(${pos.x}, ${pos.y})`}>
          <circle cx="0" cy="0" r="30" fill="url(#wt-candle-glow)" />
          <rect x="-3" y="0" width="6" height="25" fill="#f5f5dc" />
          <ellipse cx="0" cy="-5" rx="4" ry="8" fill="var(--fb-reward)" filter="url(#wt-glow)" />
        </g>
      ))}

      {/* Floating stars */}
      {[
        { x: 50, y: 50, size: 3 },
        { x: 200, y: 30, size: 2 },
        { x: 380, y: 60, size: 2.5 },
        { x: 550, y: 40, size: 2 },
        { x: 720, y: 55, size: 3 },
        { x: 900, y: 35, size: 2 },
        { x: 950, y: 80, size: 1.5 },
        { x: 100, y: 100, size: 1.5 },
        { x: 480, y: 25, size: 2 },
      ].map((star, i) => (
        <g key={i}>
          <circle cx={star.x} cy={star.y} r={star.size * 3} fill="url(#wt-star-glow)" />
          <circle cx={star.x} cy={star.y} r={star.size} fill="#fff" />
        </g>
      ))}

      {/* Magical sparkles */}
      {[
        { x: 250, y: 120 },
        { x: 720, y: 480 },
        { x: 550, y: 300 },
        { x: 120, y: 450 },
      ].map((pos, i) => (
        <g key={i} transform={`translate(${pos.x}, ${pos.y})`} opacity="0.6">
          <line x1="-8" y1="0" x2="8" y2="0" stroke={UI.action} strokeWidth="2" />
          <line x1="0" y1="-8" x2="0" y2="8" stroke={UI.action} strokeWidth="2" />
          <line x1="-5" y1="-5" x2="5" y2="5" stroke={UI.action} strokeWidth="1" />
          <line x1="5" y1="-5" x2="-5" y2="5" stroke={UI.action} strokeWidth="1" />
        </g>
      ))}

      {/* Wall sconces with flames */}
      {[
        { x: 40, y: 200 },
        { x: 960, y: 200 },
        { x: 40, y: 400 },
        { x: 960, y: 400 },
      ].map((pos, i) => (
        <g key={i} transform={`translate(${pos.x}, ${pos.y})`}>
          <circle cx="0" cy="0" r="25" fill="url(#wt-candle-glow)" opacity="0.7" />
          <path d="M-8 10 L8 10 L5 -5 L-5 -5 Z" fill={UI.border} />
          <ellipse cx="0" cy="-12" rx="5" ry="10" fill="#FF6B00" filter="url(#wt-glow)" />
        </g>
      ))}

      {/* Cobwebs in corners */}
      <path
        d="M0 0 Q30 5 50 0 M0 0 Q5 30 0 50 M0 0 Q20 20 35 35"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1"
        fill="none"
      />
      <path
        d="M1000 0 Q970 5 950 0 M1000 0 Q995 30 1000 50 M1000 0 Q980 20 965 35"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1"
        fill="none"
      />

      {/* Magical runes on floor */}
      <g transform="translate(400, 520)" opacity="0.3">
        <circle cx="100" cy="30" r="60" stroke={UI.action} strokeWidth="1" fill="none" />
        <circle cx="100" cy="30" r="50" stroke={UI.action} strokeWidth="1" fill="none" />
        <polygon points="100,0 120,45 80,15 120,15 80,45" stroke={UI.action} strokeWidth="1" fill="none" transform="translate(0, 10)" />
      </g>
    </svg>
  );
};

export default WizardTower;
