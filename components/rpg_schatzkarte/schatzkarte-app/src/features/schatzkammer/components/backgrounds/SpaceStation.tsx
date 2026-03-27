/**
 * SpaceStation Background
 * 
 * SVG-Hintergrund für das Raumstation-Template.
 * Enthält Kontrollpulte, Sterne, holographische Elemente.
 */

import React from 'react';
import { GOLD } from '../../constants';

// =============================================================================
// TYPES
// =============================================================================

export interface SpaceStationProps {
  scale?: number;
}

// =============================================================================
// COMPONENT
// =============================================================================

export const SpaceStation: React.FC<SpaceStationProps> = ({ scale = 1 }) => {
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
        <linearGradient id="ss-bg-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0a0a1a" />
          <stop offset="100%" stopColor="#050510" />
        </linearGradient>

        <linearGradient id="ss-metal-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4a4a5a" />
          <stop offset="50%" stopColor="#3a3a4a" />
          <stop offset="100%" stopColor="#2a2a3a" />
        </linearGradient>

        <linearGradient id="ss-panel-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2a3a4a" />
          <stop offset="100%" stopColor="#1a2a3a" />
        </linearGradient>

        <linearGradient id="ss-screen-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0a2a4a" />
          <stop offset="100%" stopColor="#051525" />
        </linearGradient>

        <linearGradient id="ss-glow-blue" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00ffff" />
          <stop offset="100%" stopColor="#0080ff" />
        </linearGradient>

        <linearGradient id="ss-glow-green" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00ff80" />
          <stop offset="100%" stopColor="#00aa40" />
        </linearGradient>

        <linearGradient id="ss-glow-orange" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ff8000" />
          <stop offset="100%" stopColor="#ff4000" />
        </linearGradient>

        <radialGradient id="ss-star-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="1" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="ss-planet-gradient" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#4080ff" />
          <stop offset="100%" stopColor="#1040a0" />
        </radialGradient>

        <radialGradient id="ss-hologram-gradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00ffff" stopOpacity="0.3" />
          <stop offset="70%" stopColor="#00ffff" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#00ffff" stopOpacity="0" />
        </radialGradient>

        {/* Filters */}
        <filter id="ss-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="ss-strong-glow">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Patterns */}
        <pattern id="ss-grid" width="50" height="50" patternUnits="userSpaceOnUse">
          <rect width="50" height="50" fill="none" />
          <line x1="0" y1="50" x2="50" y2="50" stroke="#1a2a3a" strokeWidth="1" />
          <line x1="50" y1="0" x2="50" y2="50" stroke="#1a2a3a" strokeWidth="1" />
        </pattern>

        <pattern id="ss-hex-pattern" width="30" height="26" patternUnits="userSpaceOnUse">
          <polygon 
            points="15,0 30,7.5 30,22.5 15,30 0,22.5 0,7.5" 
            fill="none" 
            stroke="#1a2a3a" 
            strokeWidth="0.5"
            transform="translate(0, -2)"
          />
        </pattern>
      </defs>

      {/* Space background */}
      <rect width="1000" height="600" fill="url(#ss-bg-gradient)" />

      {/* Stars */}
      {Array.from({ length: 100 }, (_, i) => ({
        x: Math.random() * 1000,
        y: Math.random() * 600,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.3,
      })).map((star, i) => (
        <circle key={i} cx={star.x} cy={star.y} r={star.size} fill="#fff" opacity={star.opacity} />
      ))}

      {/* Distant nebula */}
      <ellipse cx="800" cy="100" rx="200" ry="100" fill="url(#ss-hologram-gradient)" opacity="0.3" />
      <ellipse cx="150" cy="500" rx="150" ry="80" fill="#800080" opacity="0.1" />

      {/* Planet through window */}
      <g transform="translate(100, 50)">
        <circle cx="0" cy="0" r="80" fill="url(#ss-planet-gradient)" />
        <ellipse cx="0" cy="0" rx="80" ry="20" fill="none" stroke="#60a0ff" strokeWidth="2" opacity="0.3" transform="rotate(-20)" />
        <circle cx="-20" cy="-20" r="30" fill="#fff" opacity="0.1" />
      </g>

      {/* Floor grid */}
      <rect x="0" y="480" width="1000" height="120" fill="url(#ss-grid)" opacity="0.5" />

      {/* Floor panels */}
      <path
        d="M0 520 L200 480 L400 490 L600 485 L800 495 L1000 475 L1000 600 L0 600 Z"
        fill="url(#ss-metal-gradient)"
        opacity="0.8"
      />

      {/* Floor lights */}
      {[100, 300, 500, 700, 900].map((x, i) => (
        <g key={i}>
          <rect x={x - 30} y="510" width="60" height="4" fill="#00ffff" opacity="0.3" />
          <rect x={x - 20} y="511" width="40" height="2" fill="#00ffff" filter="url(#ss-glow)" />
        </g>
      ))}

      {/* Ceiling structure */}
      <rect x="0" y="0" width="1000" height="60" fill="url(#ss-metal-gradient)" />
      <rect x="0" y="55" width="1000" height="5" fill="#2a3a4a" />

      {/* Ceiling lights */}
      {[150, 350, 550, 750, 950].map((x, i) => (
        <g key={i}>
          <rect x={x - 40} y="45" width="80" height="15" fill="#1a2a3a" />
          <rect x={x - 35} y="55" width="70" height="5" fill="#00ffff" opacity="0.5" filter="url(#ss-glow)" />
        </g>
      ))}

      {/* Left wall panel */}
      <rect x="0" y="60" width="80" height="420" fill="url(#ss-panel-gradient)" />
      <rect x="75" y="60" width="5" height="420" fill="#3a4a5a" />
      {/* Wall details */}
      {[100, 180, 260, 340, 420].map((y, i) => (
        <g key={i}>
          <rect x="10" y={y} width="60" height="40" fill="url(#ss-screen-gradient)" rx="3" />
          <rect x="15" y={y + 5} width="50" height="2" fill="#00ff80" opacity="0.6" />
          <rect x="15" y={y + 12} width="30" height="2" fill="#00ff80" opacity="0.4" />
          <circle cx="55" cy={y + 30} r="5" fill={i % 2 === 0 ? '#00ff00' : '#ffff00'} filter="url(#ss-glow)" />
        </g>
      ))}

      {/* Right wall panel */}
      <rect x="920" y="60" width="80" height="420" fill="url(#ss-panel-gradient)" />
      <rect x="920" y="60" width="5" height="420" fill="#3a4a5a" />
      {/* Airlock door */}
      <g transform="translate(925, 200)">
        <rect x="0" y="0" width="70" height="150" fill="#2a3a4a" rx="5" />
        <rect x="5" y="5" width="60" height="140" fill="#1a2a3a" rx="3" />
        <line x1="35" y1="10" x2="35" y2="140" stroke="#3a4a5a" strokeWidth="2" />
        <circle cx="55" cy="75" r="8" fill="#ff4040" filter="url(#ss-glow)" />
        <text x="20" y="160" fill="#00ffff" fontSize="8" fontFamily="monospace">AIRLOCK</text>
      </g>

      {/* Main control panel */}
      <g transform="translate(350, 80)">
        <rect x="0" y="0" width="300" height="100" fill="url(#ss-panel-gradient)" rx="5" />
        <rect x="5" y="5" width="290" height="60" fill="url(#ss-screen-gradient)" rx="3" />
        {/* Screen content */}
        <text x="15" y="25" fill="#00ffff" fontSize="10" fontFamily="monospace">SYSTEM STATUS: ONLINE</text>
        <text x="15" y="40" fill="#00ff80" fontSize="8" fontFamily="monospace">LIFE SUPPORT: 100%</text>
        <text x="15" y="52" fill="#00ff80" fontSize="8" fontFamily="monospace">HULL INTEGRITY: 98.7%</text>
        <text x="180" y="25" fill="#ffff00" fontSize="8" fontFamily="monospace">⚠ 2 ALERTS</text>
        {/* Control buttons */}
        {[20, 70, 120, 170, 220, 270].map((x, i) => (
          <rect key={i} x={x} y="75" width="25" height="15" fill={['#ff4040', '#ffff00', '#00ff80', '#00ffff', '#8080ff', '#ff80ff'][i]} rx="2" opacity="0.7" />
        ))}
      </g>

      {/* Panorama window frame */}
      <g transform="translate(350, 0)">
        <rect x="0" y="0" width="300" height="60" fill="url(#ss-metal-gradient)" />
        <rect x="10" y="5" width="280" height="50" fill="#0a1020" />
        <text x="130" y="35" fill="#00ffff" fontSize="10" fontFamily="monospace" opacity="0.5">OBSERVATION DECK</text>
      </g>

      {/* Robot assistant placeholder */}
      <g transform="translate(100, 280)">
        <ellipse cx="50" cy="100" rx="40" ry="10" fill="#1a1a2a" opacity="0.5" />
        {/* Robot body */}
        <rect x="20" y="50" width="60" height="50" fill="url(#ss-metal-gradient)" rx="10" />
        {/* Robot head */}
        <rect x="25" y="20" width="50" height="35" fill="url(#ss-metal-gradient)" rx="8" />
        {/* Eyes */}
        <circle cx="40" cy="35" r="8" fill="#00ffff" filter="url(#ss-glow)" />
        <circle cx="60" cy="35" r="8" fill="#00ffff" filter="url(#ss-glow)" />
        <circle cx="40" cy="35" r="4" fill="#fff" />
        <circle cx="60" cy="35" r="4" fill="#fff" />
        {/* Antenna */}
        <line x1="50" y1="20" x2="50" y2="5" stroke="#4a4a5a" strokeWidth="3" />
        <circle cx="50" cy="5" r="4" fill="#ff4040" filter="url(#ss-glow)" />
      </g>

      {/* Hologram display */}
      <g transform="translate(700, 100)">
        <ellipse cx="60" cy="120" rx="50" ry="10" fill="#00ffff" opacity="0.2" />
        <rect x="40" y="100" width="40" height="25" fill="url(#ss-metal-gradient)" rx="3" />
        {/* Hologram projection */}
        <circle cx="60" cy="60" r="50" fill="url(#ss-hologram-gradient)" />
        <circle cx="60" cy="60" r="30" fill="none" stroke="#00ffff" strokeWidth="1" opacity="0.5" />
        <circle cx="60" cy="60" r="20" fill="none" stroke="#00ffff" strokeWidth="1" opacity="0.7" />
        {/* Hologram content - rotating planet */}
        <circle cx="60" cy="60" r="15" fill="none" stroke="#00ffff" strokeWidth="2" filter="url(#ss-glow)" />
        <ellipse cx="60" cy="60" rx="15" ry="5" fill="none" stroke="#00ffff" strokeWidth="1" opacity="0.5" />
        <text x="40" y="140" fill="#00ffff" fontSize="8" fontFamily="monospace">HOLODISPLAY</text>
      </g>

      {/* Lab station */}
      <g transform="translate(50, 80)">
        <rect x="0" y="0" width="100" height="80" fill="url(#ss-panel-gradient)" rx="5" />
        {/* Microscope shape */}
        <rect x="40" y="10" width="20" height="50" fill="#3a4a5a" />
        <circle cx="50" cy="15" r="12" fill="#2a3a4a" stroke="#4a5a6a" strokeWidth="2" />
        <rect x="30" y="55" width="40" height="8" fill="#3a4a5a" />
        {/* Petri dishes */}
        <ellipse cx="20" cy="70" rx="12" ry="6" fill="#00ff80" opacity="0.3" />
        <ellipse cx="80" cy="70" rx="12" ry="6" fill="#ff8000" opacity="0.3" />
      </g>

      {/* Cryo pod */}
      <g transform="translate(810, 420)">
        <ellipse cx="50" cy="100" rx="45" ry="12" fill="#1a1a2a" opacity="0.5" />
        <rect x="10" y="0" width="80" height="100" fill="url(#ss-panel-gradient)" rx="10" />
        <rect x="20" y="10" width="60" height="80" fill="#0a2040" rx="5" />
        {/* Frost effect */}
        <rect x="20" y="10" width="60" height="80" fill="url(#ss-hologram-gradient)" opacity="0.3" rx="5" />
        {/* Status lights */}
        <circle cx="30" cy="95" r="3" fill="#00ff80" filter="url(#ss-glow)" />
        <circle cx="50" cy="95" r="3" fill="#00ff80" filter="url(#ss-glow)" />
        <circle cx="70" cy="95" r="3" fill="#00ff80" filter="url(#ss-glow)" />
        <text x="25" y="115" fill="#00ffff" fontSize="7" fontFamily="monospace">CRYO-01</text>
      </g>

      {/* Cargo area */}
      <g transform="translate(200, 440)">
        <rect x="0" y="0" width="80" height="60" fill="#3a4a5a" rx="3" />
        <rect x="5" y="5" width="70" height="50" fill="#2a3a4a" rx="2" />
        <text x="15" y="35" fill="#ffff00" fontSize="10" fontFamily="monospace">CARGO</text>
        {/* Boxes */}
        <rect x="90" y="20" width="40" height="40" fill="#4a5a6a" rx="2" />
        <rect x="95" y="25" width="30" height="10" fill="#00ffff" opacity="0.3" />
        <rect x="135" y="30" width="35" height="30" fill="#4a5a6a" rx="2" />
      </g>

      {/* Communication array */}
      <g transform="translate(540, 280)">
        <rect x="0" y="50" width="80" height="60" fill="url(#ss-panel-gradient)" rx="5" />
        <rect x="10" y="55" width="60" height="30" fill="url(#ss-screen-gradient)" rx="3" />
        {/* Waveform */}
        <path d="M15 70 Q25 60 35 70 Q45 80 55 70 Q65 60 70 70" stroke="#00ff80" strokeWidth="2" fill="none" filter="url(#ss-glow)" />
        {/* Antenna dish */}
        <ellipse cx="40" cy="30" rx="35" ry="20" fill="none" stroke="#4a5a6a" strokeWidth="3" />
        <line x1="40" y1="30" x2="40" y2="50" stroke="#4a5a6a" strokeWidth="4" />
        <circle cx="40" cy="30" r="5" fill="#00ffff" filter="url(#ss-glow)" />
        <text x="15" y="100" fill="#00ffff" fontSize="8" fontFamily="monospace">COMM ARRAY</text>
      </g>

      {/* Hydroponics */}
      <g transform="translate(50, 420)">
        <rect x="0" y="0" width="100" height="80" fill="url(#ss-panel-gradient)" rx="5" />
        <rect x="10" y="10" width="80" height="50" fill="#0a2010" rx="3" />
        {/* Plants */}
        {[20, 40, 60, 80].map((x, i) => (
          <g key={i}>
            <rect x={x - 5} y="40" width="10" height="15" fill="#2a1a00" />
            <ellipse cx={x} cy="35" rx="8" ry="12" fill="#00aa40" />
            <ellipse cx={x - 3} cy="30" rx="5" ry="8" fill="#00cc50" />
          </g>
        ))}
        {/* Grow lights */}
        <rect x="10" y="5" width="80" height="3" fill="#ff00ff" opacity="0.5" filter="url(#ss-glow)" />
        <text x="20" y="75" fill="#00ff80" fontSize="8" fontFamily="monospace">HYDROPONICS</text>
      </g>

      {/* Spacesuit */}
      <g transform="translate(300, 280)">
        <ellipse cx="40" cy="100" rx="30" ry="8" fill="#1a1a2a" opacity="0.3" />
        {/* Helmet */}
        <ellipse cx="40" cy="20" rx="25" ry="20" fill="#e8e8e8" />
        <ellipse cx="40" cy="20" rx="18" ry="15" fill="#1a3050" />
        <ellipse cx="35" cy="15" rx="8" ry="6" fill="#fff" opacity="0.3" />
        {/* Body */}
        <rect x="15" y="35" width="50" height="50" fill="#e8e8e8" rx="10" />
        <rect x="25" y="45" width="30" height="20" fill="#ff4040" />
        {/* Arms */}
        <ellipse cx="5" cy="55" rx="10" ry="15" fill="#e8e8e8" />
        <ellipse cx="75" cy="55" rx="10" ry="15" fill="#e8e8e8" />
      </g>

      {/* Engine core (background element) */}
      <g transform="translate(650, 440)">
        <ellipse cx="50" cy="70" rx="45" ry="12" fill="#ff8000" opacity="0.1" />
        <rect x="10" y="0" width="80" height="70" fill="url(#ss-panel-gradient)" rx="5" />
        <circle cx="50" cy="35" r="25" fill="#1a1020" />
        <circle cx="50" cy="35" r="20" fill="#ff4000" opacity="0.3" filter="url(#ss-strong-glow)" />
        <circle cx="50" cy="35" r="12" fill="#ff8000" opacity="0.5" filter="url(#ss-glow)" />
        <circle cx="50" cy="35" r="5" fill="#ffff00" filter="url(#ss-glow)" />
        <text x="15" y="80" fill="#ff8000" fontSize="8" fontFamily="monospace">REACTOR CORE</text>
      </g>

      {/* Ambient light effects */}
      <rect x="0" y="0" width="1000" height="600" fill="url(#ss-hex-pattern)" opacity="0.1" />
    </svg>
  );
};

export default SpaceStation;
