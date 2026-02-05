/**
 * JourneyPath Component
 * 
 * SVG-Pfad der die Stationen in der Journey-Reihenfolge verbindet.
 * Zeigt gestrichelte Linie mit Pfeilspitzen.
 */

import React, { useMemo } from 'react';
import type { Station, Slot } from '../../types';
import { GOLD } from '../../constants';

// =============================================================================
// TYPES
// =============================================================================

export interface JourneyPathProps {
  /** Stationen in Journey-Reihenfolge */
  stations: Station[];
  /** Alle Slots des Templates */
  slots: Slot[];
  /** Map von stationId zu Station */
  stationMap?: Map<string, Station>;
  /** Aktuelle Position im Journey (für Hervorhebung) */
  currentIndex?: number;
  /** Skalierungsfaktor */
  scale?: number;
  /** Viewport-Breite */
  width?: number;
  /** Viewport-Höhe */
  height?: number;
  /** Ist der Pfad sichtbar? */
  visible?: boolean;
}

interface Point {
  x: number;
  y: number;
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Berechnet den Mittelpunkt eines Slots
 */
function getSlotCenter(slot: Slot, scale: number): Point {
  return {
    x: (slot.x + slot.width / 2) * scale,
    y: (slot.y + slot.height / 2) * scale,
  };
}

/**
 * Erstellt einen SVG-Pfad zwischen Punkten
 */
function createPath(points: Point[]): string {
  if (points.length < 2) return '';
  
  const parts: string[] = [];
  
  points.forEach((point, index) => {
    if (index === 0) {
      parts.push(`M ${point.x} ${point.y}`);
    } else {
      // Einfache gerade Linie
      parts.push(`L ${point.x} ${point.y}`);
    }
  });
  
  return parts.join(' ');
}

/**
 * Erstellt einen Pfeilspitzen-Marker
 */
function createArrowPath(from: Point, to: Point, size: number = 10): string {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  
  const tip = { x: midX, y: midY };
  const left = {
    x: tip.x - size * Math.cos(angle - Math.PI / 6),
    y: tip.y - size * Math.sin(angle - Math.PI / 6),
  };
  const right = {
    x: tip.x - size * Math.cos(angle + Math.PI / 6),
    y: tip.y - size * Math.sin(angle + Math.PI / 6),
  };
  
  return `M ${left.x} ${left.y} L ${tip.x} ${tip.y} L ${right.x} ${right.y}`;
}

// =============================================================================
// STYLES
// =============================================================================

const styles = {
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 15,
  } as React.CSSProperties,

  svg: {
    width: '100%',
    height: '100%',
  } as React.CSSProperties,
};

// =============================================================================
// COMPONENT
// =============================================================================

export const JourneyPath: React.FC<JourneyPathProps> = ({
  stations,
  slots,
  currentIndex = -1,
  scale = 1,
  width = 1000,
  height = 600,
  visible = true,
}) => {
  // Create slot lookup map
  const slotMap = useMemo(() => {
    return new Map(slots.map(s => [s.id, s]));
  }, [slots]);

  // Calculate points for each station
  const points = useMemo((): Point[] => {
    return stations
      .map(station => {
        const slot = slotMap.get(station.slotId);
        if (!slot) return null;
        return getSlotCenter(slot, scale);
      })
      .filter((p): p is Point => p !== null);
  }, [stations, slotMap, scale]);

  // Generate main path
  const mainPath = useMemo(() => createPath(points), [points]);

  // Generate arrow paths
  const arrows = useMemo(() => {
    const result: { path: string; isPast: boolean }[] = [];
    
    for (let i = 0; i < points.length - 1; i++) {
      const from = points[i];
      const to = points[i + 1];
      if (from && to) {
        result.push({
          path: createArrowPath(from, to, 8 * scale),
          isPast: i < currentIndex,
        });
      }
    }
    
    return result;
  }, [points, currentIndex, scale]);

  if (!visible || points.length < 2) {
    return null;
  }

  return (
    <div style={styles.container}>
      <svg
        style={styles.svg}
        viewBox={`0 0 ${width * scale} ${height * scale}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Glow filter */}
        <defs>
          <filter id="pathGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          {/* Gradient for completed path */}
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={GOLD.primary} stopOpacity="0.8" />
            <stop offset="100%" stopColor={GOLD.dark} stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Background path (shadow) */}
        <path
          d={mainPath}
          fill="none"
          stroke="rgba(0, 0, 0, 0.3)"
          strokeWidth={4 * scale}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Main path */}
        <path
          d={mainPath}
          fill="none"
          stroke={GOLD.primary}
          strokeWidth={2.5 * scale}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={`${8 * scale} ${6 * scale}`}
          strokeOpacity={0.7}
          filter="url(#pathGlow)"
        />

        {/* Arrow markers */}
        {arrows.map((arrow, index) => (
          <path
            key={index}
            d={arrow.path}
            fill="none"
            stroke={arrow.isPast ? GOLD.dark : GOLD.primary}
            strokeWidth={2 * scale}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={arrow.isPast ? 0.5 : 0.9}
          />
        ))}

        {/* Station dots */}
        {points.map((point, index) => {
          const isCurrent = index === currentIndex;
          const isPast = index < currentIndex;
          
          return (
            <g key={index}>
              {/* Outer glow for current */}
              {isCurrent && (
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={12 * scale}
                  fill={GOLD.primary}
                  opacity={0.3}
                >
                  <animate
                    attributeName="r"
                    values={`${10 * scale};${14 * scale};${10 * scale}`}
                    dur="2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.3;0.1;0.3"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
              
              {/* Main dot */}
              <circle
                cx={point.x}
                cy={point.y}
                r={isCurrent ? 6 * scale : 4 * scale}
                fill={isCurrent ? GOLD.primary : isPast ? GOLD.dark : GOLD.light}
                stroke={isCurrent ? '#fff' : GOLD.primary}
                strokeWidth={isCurrent ? 2 * scale : 1 * scale}
                opacity={isPast ? 0.6 : 1}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default JourneyPath;
