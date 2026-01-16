import React from 'react';

/**
 * Shared SVG Definitions für alle Schatzkarte-Icons
 * Stellt konsistente Gradienten, Filter und Animationen bereit
 */

// ============================================
// TYPES
// ============================================

export interface IconProps {
  size?: number;
  animated?: boolean;
  glowing?: boolean;
  className?: string;
}

export interface IconDefsProps {
  id: string; // Unique prefix für jede Icon-Instanz
  animated?: boolean;
}

// ============================================
// COLOR PALETTES
// ============================================

export const COLORS = {
  // Gold-Töne (wie GoldenKeyIcon)
  gold: {
    light: '#FFE55C',
    main: '#FFD700',
    mid: '#FFC125',
    dark: '#B8860B',
    darkest: '#8B6914',
    accent: '#DAA520',
  },
  // Bronze/Kupfer-Töne
  bronze: {
    light: '#CD9B5A',
    main: '#CD7F32',
    dark: '#8B4513',
  },
  // Ozean-Blau (für Wasser-Elemente)
  ocean: {
    light: '#87CEEB',
    main: '#4A90B8',
    dark: '#1E5F74',
    deepest: '#0D3B4C',
  },
  // Feuer/Vulkan
  fire: {
    light: '#FFE066',
    yellow: '#FFD700',
    orange: '#FF8C00',
    red: '#FF4500',
    dark: '#B22222',
  },
  // Natur/Grün
  nature: {
    light: '#90EE90',
    main: '#3CB371',
    dark: '#228B22',
    earth: '#8B4513',
  },
  // Stein/Berg
  stone: {
    light: '#A9A9A9',
    main: '#696969',
    dark: '#2F2F2F',
    snow: '#F0F8FF',
  },
  // UI-Farben
  ui: {
    sparkle: '#FFF8DC',
    glow: 'rgba(255, 215, 0, 0.4)',
  },
} as const;

// ============================================
// SHARED SVG DEFS COMPONENT
// ============================================

export const SharedIconDefs: React.FC<IconDefsProps> = ({ id, animated = true }) => (
  <defs>
    {/* ========== GOLD GRADIENTS ========== */}
    <linearGradient id={`${id}-goldGradient`} x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor={COLORS.gold.light} />
      <stop offset="25%" stopColor={COLORS.gold.main} />
      <stop offset="50%" stopColor={COLORS.gold.mid} />
      <stop offset="75%" stopColor={COLORS.gold.main} />
      <stop offset="100%" stopColor={COLORS.gold.dark} />
    </linearGradient>
    
    <linearGradient id={`${id}-goldDark`} x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor={COLORS.gold.accent} />
      <stop offset="100%" stopColor={COLORS.gold.darkest} />
    </linearGradient>

    {/* ========== BRONZE GRADIENTS ========== */}
    <linearGradient id={`${id}-bronzeGradient`} x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor={COLORS.bronze.light} />
      <stop offset="50%" stopColor={COLORS.bronze.main} />
      <stop offset="100%" stopColor={COLORS.bronze.dark} />
    </linearGradient>

    {/* ========== OCEAN GRADIENTS ========== */}
    <linearGradient id={`${id}-oceanGradient`} x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor={COLORS.ocean.light} />
      <stop offset="50%" stopColor={COLORS.ocean.main} />
      <stop offset="100%" stopColor={COLORS.ocean.dark} />
    </linearGradient>

    {/* ========== FIRE GRADIENTS ========== */}
    <linearGradient id={`${id}-fireGradient`} x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stopColor={COLORS.fire.dark} />
      <stop offset="30%" stopColor={COLORS.fire.red} />
      <stop offset="60%" stopColor={COLORS.fire.orange} />
      <stop offset="85%" stopColor={COLORS.fire.yellow} />
      <stop offset="100%" stopColor={COLORS.fire.light} />
    </linearGradient>

    <radialGradient id={`${id}-fireGlow`} cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor={COLORS.fire.orange} stopOpacity="0.8" />
      <stop offset="100%" stopColor={COLORS.fire.red} stopOpacity="0" />
    </radialGradient>

    {/* ========== STONE/MOUNTAIN GRADIENTS ========== */}
    <linearGradient id={`${id}-stoneGradient`} x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor={COLORS.stone.light} />
      <stop offset="50%" stopColor={COLORS.stone.main} />
      <stop offset="100%" stopColor={COLORS.stone.dark} />
    </linearGradient>

    <linearGradient id={`${id}-snowGradient`} x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#FFFFFF" />
      <stop offset="100%" stopColor={COLORS.stone.snow} />
    </linearGradient>

    {/* ========== NATURE GRADIENTS ========== */}
    <linearGradient id={`${id}-natureGradient`} x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor={COLORS.nature.light} />
      <stop offset="50%" stopColor={COLORS.nature.main} />
      <stop offset="100%" stopColor={COLORS.nature.dark} />
    </linearGradient>

    {/* ========== FILTERS ========== */}
    
    {/* Golden Glow */}
    <filter id={`${id}-glowGold`} x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2" result="coloredBlur" />
      <feMerge>
        <feMergeNode in="coloredBlur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    {/* Fire Glow */}
    <filter id={`${id}-glowFire`} x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
      <feFlood floodColor={COLORS.fire.orange} floodOpacity="0.5" result="glowColor" />
      <feComposite in="glowColor" in2="coloredBlur" operator="in" result="softGlow" />
      <feMerge>
        <feMergeNode in="softGlow" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    {/* Subtle Shadow */}
    <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.3" />
    </filter>

    {/* ========== SHIMMER ANIMATION ========== */}
    <linearGradient id={`${id}-shimmer`} x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="rgba(255,255,255,0)">
        {animated && (
          <animate
            attributeName="offset"
            values="-1;2"
            dur="2.5s"
            repeatCount="indefinite"
          />
        )}
      </stop>
      <stop offset="50%" stopColor="rgba(255,255,255,0.6)">
        {animated && (
          <animate
            attributeName="offset"
            values="-0.5;2.5"
            dur="2.5s"
            repeatCount="indefinite"
          />
        )}
      </stop>
      <stop offset="100%" stopColor="rgba(255,255,255,0)">
        {animated && (
          <animate
            attributeName="offset"
            values="0;3"
            dur="2.5s"
            repeatCount="indefinite"
          />
        )}
      </stop>
    </linearGradient>
  </defs>
);

// ============================================
// REUSABLE COMPONENTS
// ============================================

interface SparkleProps {
  x: number;
  y: number;
  size?: number;
  delay?: number;
  duration?: number;
  animated?: boolean;
}

export const Sparkle: React.FC<SparkleProps> = ({ 
  x, y, 
  size = 6, 
  delay = 0, 
  duration = 1.5,
  animated = true 
}) => {
  const halfSize = size / 2;
  const path = `
    M${x} ${y - halfSize} 
    L${x + halfSize * 0.3} ${y - halfSize * 0.3} 
    L${x + halfSize} ${y} 
    L${x + halfSize * 0.3} ${y + halfSize * 0.3} 
    L${x} ${y + halfSize} 
    L${x - halfSize * 0.3} ${y + halfSize * 0.3} 
    L${x - halfSize} ${y} 
    L${x - halfSize * 0.3} ${y - halfSize * 0.3} 
    Z
  `;
  
  return (
    <path d={path} fill={COLORS.ui.sparkle} opacity="0.8">
      {animated && (
        <animate
          attributeName="opacity"
          values="0;1;0"
          dur={`${duration}s`}
          begin={`${delay}s`}
          repeatCount="indefinite"
        />
      )}
    </path>
  );
};

interface GlowRingProps {
  cx: number;
  cy: number;
  r: number;
  color?: string;
  animated?: boolean;
}

export const GlowRing: React.FC<GlowRingProps> = ({
  cx, cy, r,
  color = COLORS.gold.main,
  animated = true
}) => {
  // GlowRing deaktiviert - gibt null zurück
  return null;
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export const useUniqueId = (prefix: string): string => {
  // In production, use React.useId() or a proper unique ID generator
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

export default SharedIconDefs;
