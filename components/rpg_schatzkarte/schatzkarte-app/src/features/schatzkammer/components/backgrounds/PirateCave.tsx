/**
 * PirateCave Background
 * 
 * SVG-Hintergrund für das Piratenhöhle-Template.
 * Enthält Schatztruhen, Fässer, Wasser, Stalaktiten.
 */

import React from 'react';
import { UI, FEEDBACK, GOLD } from '../../constants';

// =============================================================================
// TYPES
// =============================================================================

export interface PirateCaveProps {
  scale?: number;
}

// =============================================================================
// COMPONENT
// =============================================================================

export const PirateCave: React.FC<PirateCaveProps> = ({ scale = 1 }) => {
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
        <linearGradient id="pc-bg-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a1a1a" />
          <stop offset="50%" stopColor="#2a2520" />
          <stop offset="100%" stopColor="#1a1510" />
        </linearGradient>

        <linearGradient id="pc-rock-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3a3530" />
          <stop offset="100%" stopColor="#252220" />
        </linearGradient>

        <linearGradient id="pc-water-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a4a5a" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#0a2a3a" stopOpacity="0.9" />
        </linearGradient>

        <linearGradient id="pc-gold-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={UI.actionHover} />
          <stop offset="50%" stopColor={UI.action} />
          <stop offset="100%" stopColor={UI.border} />
        </linearGradient>

        <linearGradient id="pc-wood-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#5a4030" />
          <stop offset="50%" stopColor="#6a5040" />
          <stop offset="100%" stopColor="#4a3020" />
        </linearGradient>

        <radialGradient id="pc-torch-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.7" />
          <stop offset="50%" stopColor="#FF4500" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FF0000" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="pc-coin-shine" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFE066" />
          <stop offset="100%" stopColor="#B8860B" />
        </radialGradient>

        {/* Filters */}
        <filter id="pc-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="pc-shadow">
          <feDropShadow dx="3" dy="5" stdDeviation="5" floodOpacity="0.6" />
        </filter>

        {/* Patterns */}
        <pattern id="pc-rock-texture" width="60" height="60" patternUnits="userSpaceOnUse">
          <rect width="60" height="60" fill="#2a2520" />
          <circle cx="15" cy="15" r="8" fill="#252220" opacity="0.5" />
          <circle cx="45" cy="35" r="10" fill="#1a1510" opacity="0.4" />
          <circle cx="30" cy="50" r="6" fill="#302a25" opacity="0.3" />
        </pattern>

        <pattern id="pc-water-ripple" width="100" height="20" patternUnits="userSpaceOnUse">
          <path d="M0 10 Q25 5 50 10 Q75 15 100 10" stroke="rgba(255,255,255,0.1)" strokeWidth="1" fill="none" />
        </pattern>
      </defs>

      {/* Background */}
      <rect width="1000" height="600" fill="url(#pc-bg-gradient)" />

      {/* Cave ceiling with stalactites */}
      <path
        d="M0 0 L0 80 Q100 100 150 60 L150 120 L160 60 Q200 90 250 70 L250 130 L260 70 
           Q350 100 400 80 L400 150 L410 80 Q500 110 550 90 L550 140 L560 85 
           Q650 100 700 75 L700 160 L710 75 Q800 95 850 85 L850 145 L860 80 
           Q920 100 1000 70 L1000 0 Z"
        fill="url(#pc-rock-gradient)"
      />

      {/* Additional stalactites */}
      {[
        { x: 80, h: 90 },
        { x: 180, h: 70 },
        { x: 320, h: 100 },
        { x: 480, h: 85 },
        { x: 620, h: 95 },
        { x: 780, h: 75 },
        { x: 920, h: 80 },
      ].map((s, i) => (
        <polygon
          key={i}
          points={`${s.x - 8},60 ${s.x + 8},60 ${s.x},${60 + s.h}`}
          fill="#3a3530"
        />
      ))}

      {/* Cave floor */}
      <path
        d="M0 520 Q100 510 200 530 Q350 520 500 540 Q650 530 800 545 Q900 535 1000 525 L1000 600 L0 600 Z"
        fill="url(#pc-rock-gradient)"
      />
      <path
        d="M0 520 Q100 510 200 530 Q350 520 500 540 Q650 530 800 545 Q900 535 1000 525"
        fill="none"
        stroke="#4a4540"
        strokeWidth="3"
      />

      {/* Water pool */}
      <ellipse cx="350" cy="560" rx="180" ry="35" fill="url(#pc-water-gradient)" />
      <ellipse cx="350" cy="555" rx="170" ry="30" fill="url(#pc-water-ripple)" opacity="0.5" />
      {/* Water shine */}
      <ellipse cx="320" cy="550" rx="40" ry="8" fill="rgba(255,255,255,0.1)" />

      {/* Rock formations */}
      <path d="M0 350 Q30 320 50 380 Q70 340 100 400 L100 520 L0 520 Z" fill="url(#pc-rock-gradient)" />
      <path d="M900 380 Q930 340 950 400 Q980 360 1000 420 L1000 530 L900 530 Z" fill="url(#pc-rock-gradient)" />

      {/* Treasure pile (left) */}
      <g transform="translate(100, 430)">
        <ellipse cx="60" cy="80" rx="70" ry="20" fill="#1a1510" opacity="0.5" />
        {/* Gold coins scattered */}
        {[
          { x: 20, y: 60 }, { x: 40, y: 55 }, { x: 60, y: 50 }, { x: 80, y: 55 }, { x: 100, y: 60 },
          { x: 30, y: 45 }, { x: 50, y: 40 }, { x: 70, y: 42 }, { x: 90, y: 48 },
          { x: 45, y: 30 }, { x: 65, y: 28 }, { x: 55, y: 20 },
        ].map((coin, i) => (
          <ellipse key={i} cx={coin.x} cy={coin.y} rx="8" ry="5" fill="url(#pc-coin-shine)" />
        ))}
        {/* Gems */}
        <polygon points="35,35 40,25 45,35 40,40" fill="#ff0040" filter="url(#pc-glow)" />
        <polygon points="75,32 80,22 85,32 80,37" fill="#00ff80" filter="url(#pc-glow)" />
        <polygon points="55,15 60,5 65,15 60,20" fill="#4040ff" filter="url(#pc-glow)" />
        {/* Crown */}
        <path d="M50 8 L45 -5 L50 0 L55 -8 L60 0 L65 -5 L60 8 Z" fill={UI.action} stroke={UI.border} strokeWidth="1" />
      </g>

      {/* Ship wheel */}
      <g transform="translate(60, 130)">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#5a4030" strokeWidth="8" />
        <circle cx="50" cy="50" r="15" fill="#4a3020" stroke="#5a4030" strokeWidth="4" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <line
            key={i}
            x1="50"
            y1="50"
            x2={50 + Math.cos((angle * Math.PI) / 180) * 40}
            y2={50 + Math.sin((angle * Math.PI) / 180) * 40}
            stroke="#5a4030"
            strokeWidth="6"
          />
        ))}
        {/* Handle knobs */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <circle
            key={i}
            cx={50 + Math.cos((angle * Math.PI) / 180) * 42}
            cy={50 + Math.sin((angle * Math.PI) / 180) * 42}
            r="6"
            fill="#6a5040"
          />
        ))}
      </g>

      {/* Map table */}
      <g transform="translate(380, 300)">
        <rect x="0" y="50" width="140" height="10" fill="#5a4030" />
        <rect x="10" y="60" width="10" height="60" fill="#4a3020" />
        <rect x="120" y="60" width="10" height="60" fill="#4a3020" />
        {/* Map on table */}
        <rect x="15" y="30" width="110" height="70" fill="#d4c4a8" rx="2" />
        <rect x="20" y="35" width="100" height="60" fill="#e8dcc8" rx="1" />
        {/* Map details */}
        <path d="M40 50 Q60 45 80 55 Q100 60 110 50" stroke="#8b7355" strokeWidth="1" fill="none" />
        <circle cx="60" cy="60" r="3" fill="#8b0000" />
        <text x="55" y="75" fill="#8b7355" fontSize="8">X</text>
        {/* Compass on map */}
        <circle cx="100" cy="50" r="8" fill="none" stroke="#8b7355" strokeWidth="1" />
        <line x1="100" y1="43" x2="100" y2="57" stroke="#8b7355" strokeWidth="1" />
        <line x1="93" y1="50" x2="107" y2="50" stroke="#8b7355" strokeWidth="1" />
      </g>

      {/* Anchor */}
      <g transform="translate(810, 400)">
        <ellipse cx="40" cy="90" rx="35" ry="10" fill="#1a1510" opacity="0.3" />
        <rect x="35" y="0" width="10" height="70" fill="#4a4a4a" />
        <rect x="20" y="0" width="40" height="10" fill="#4a4a4a" rx="2" />
        <path d="M10 70 Q10 90 40 85 Q70 90 70 70" fill="none" stroke="#4a4a4a" strokeWidth="10" strokeLinecap="round" />
        <circle cx="40" cy="5" r="8" fill="none" stroke="#4a4a4a" strokeWidth="5" />
      </g>

      {/* Rum barrels */}
      <g transform="translate(650, 470)">
        <ellipse cx="30" cy="50" rx="28" ry="12" fill="#4a3020" />
        <rect x="5" y="0" width="50" height="50" fill="url(#pc-wood-gradient)" rx="3" />
        <ellipse cx="30" cy="0" rx="25" ry="10" fill="#5a4030" />
        <rect x="10" y="10" width="40" height="5" fill="#3a2010" />
        <rect x="10" y="35" width="40" height="5" fill="#3a2010" />
        {/* Barrel 2 (lying) */}
        <g transform="translate(60, 20) rotate(-15)">
          <rect x="0" y="0" width="60" height="40" fill="url(#pc-wood-gradient)" rx="5" />
          <ellipse cx="0" cy="20" rx="8" ry="20" fill="#5a4030" />
          <ellipse cx="60" cy="20" rx="8" ry="20" fill="#4a3020" />
          <rect x="10" y="0" width="5" height="40" fill="#3a2010" />
          <rect x="45" y="0" width="5" height="40" fill="#3a2010" />
        </g>
      </g>

      {/* Cannon */}
      <g transform="translate(250, 480)">
        <ellipse cx="50" cy="50" rx="45" ry="12" fill="#1a1510" opacity="0.3" />
        {/* Wheels */}
        <circle cx="20" cy="45" r="15" fill="#4a3020" stroke="#3a2010" strokeWidth="3" />
        <circle cx="80" cy="45" r="15" fill="#4a3020" stroke="#3a2010" strokeWidth="3" />
        {/* Barrel */}
        <rect x="10" y="15" width="90" height="25" fill="#3a3a3a" rx="3" />
        <circle cx="105" cy="27" r="10" fill="#2a2a2a" stroke="#3a3a3a" strokeWidth="2" />
        {/* Cannonball stack */}
        <circle cx="130" cy="50" r="8" fill="#2a2a2a" />
        <circle cx="145" cy="50" r="8" fill="#2a2a2a" />
        <circle cx="137" cy="38" r="8" fill="#2a2a2a" />
      </g>

      {/* Lantern */}
      <g transform="translate(200, 80)">
        <circle cx="25" cy="25" r="35" fill="url(#pc-torch-glow)" />
        <rect x="20" y="0" width="10" height="5" fill="#5a4a3a" />
        <rect x="15" y="5" width="20" height="35" fill="#3a3a3a" rx="2" />
        <rect x="18" y="10" width="14" height="25" fill="var(--fb-reward)" opacity="0.6" />
        <ellipse cx="25" cy="20" rx="5" ry="8" fill="#FF6B00" filter="url(#pc-glow)" />
      </g>

      {/* Pirate flag (mounted on wall) */}
      <g transform="translate(450, 40)">
        <rect x="0" y="0" width="5" height="100" fill="#4a3020" />
        <rect x="5" y="10" width="100" height="70" fill="#1a1a1a" />
        {/* Skull */}
        <ellipse cx="55" cy="35" rx="18" ry="15" fill="#f5f5f5" />
        <ellipse cx="48" cy="32" rx="5" ry="6" fill="#1a1a1a" />
        <ellipse cx="62" cy="32" rx="5" ry="6" fill="#1a1a1a" />
        <path d="M50 42 L55 48 L60 42" fill="none" stroke="#1a1a1a" strokeWidth="2" />
        {/* Crossbones */}
        <line x1="35" y1="55" x2="75" y2="65" stroke="#f5f5f5" strokeWidth="6" strokeLinecap="round" />
        <line x1="75" y1="55" x2="35" y2="65" stroke="#f5f5f5" strokeWidth="6" strokeLinecap="round" />
        {/* Flag wave effect */}
        <path d="M105 10 Q115 25 105 40 Q95 55 105 70 Q115 85 105 80" fill="none" stroke="#1a1a1a" strokeWidth="3" />
      </g>

      {/* Skeleton */}
      <g transform="translate(760, 150)">
        <ellipse cx="30" cy="45" rx="20" ry="5" fill="#1a1510" opacity="0.2" />
        {/* Skull */}
        <ellipse cx="30" cy="15" rx="12" ry="10" fill="#e8e0d0" />
        <circle cx="25" cy="13" r="3" fill="#1a1a1a" />
        <circle cx="35" cy="13" r="3" fill="#1a1a1a" />
        <path d="M27 20 L30 22 L33 20" fill="#1a1a1a" />
        <rect x="25" y="24" width="10" height="3" fill="#d0c8b8" />
        {/* Body */}
        <rect x="28" y="27" width="4" height="20" fill="#d0c8b8" />
        {/* Arms */}
        <line x1="30" y1="30" x2="15" y2="40" stroke="#d0c8b8" strokeWidth="3" />
        <line x1="30" y1="30" x2="45" y2="40" stroke="#d0c8b8" strokeWidth="3" />
      </g>

      {/* Chest (main treasure) */}
      <g transform="translate(550, 430)">
        <ellipse cx="50" cy="70" rx="55" ry="15" fill="#1a1510" opacity="0.4" />
        <rect x="0" y="20" width="100" height="50" fill="#5a4030" rx="3" />
        <path d="M0 20 Q50 0 100 20" fill="#6a5040" />
        <rect x="40" y="35" width="20" height="15" fill={UI.action} rx="2" />
        <circle cx="50" cy="42" r="4" fill={UI.border} />
        {/* Metal bands */}
        <rect x="0" y="25" width="100" height="5" fill="#3a3a3a" />
        <rect x="0" y="55" width="100" height="5" fill="#3a3a3a" />
        {/* Gold spilling out */}
        <ellipse cx="50" cy="22" rx="30" ry="8" fill={UI.action} />
        <ellipse cx="40" cy="18" rx="5" ry="3" fill={UI.actionHover} />
        <ellipse cx="60" cy="19" rx="5" ry="3" fill={UI.actionHover} />
        <polygon points="50,10 55,5 60,10 55,15" fill="#ff0040" filter="url(#pc-glow)" />
      </g>

      {/* Torches on walls */}
      {[
        { x: 50, y: 280 },
        { x: 950, y: 280 },
      ].map((torch, i) => (
        <g key={i} transform={`translate(${torch.x}, ${torch.y})`}>
          <circle cx="0" cy="0" r="40" fill="url(#pc-torch-glow)" />
          <rect x="-5" y="10" width="10" height="40" fill="#4a3020" />
          <ellipse cx="0" cy="5" rx="8" ry="15" fill="#FF6B00" filter="url(#pc-glow)" />
          <ellipse cx="0" cy="-5" rx="5" ry="10" fill="var(--fb-reward)" opacity="0.8" />
        </g>
      ))}

      {/* Rope */}
      <path
        d="M150 150 Q200 180 180 220 Q160 260 200 280"
        stroke="#8b7355"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />

      {/* Scattered coins on floor */}
      {[
        { x: 300, y: 545 },
        { x: 450, y: 555 },
        { x: 600, y: 548 },
        { x: 750, y: 552 },
        { x: 280, y: 540 },
      ].map((coin, i) => (
        <ellipse key={i} cx={coin.x} cy={coin.y} rx="6" ry="3" fill="url(#pc-coin-shine)" />
      ))}
    </svg>
  );
};

export default PirateCave;
