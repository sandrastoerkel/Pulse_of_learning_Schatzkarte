/**
 * Slot Component
 * 
 * Interaktiver Ablageplatz im Loci-Raum.
 * Zeigt entweder einen leeren Platz oder eine Station.
 */

import React from 'react';
import type { Slot as SlotType, Station, RecallStatus, RoomMode } from '../../types';
import { STATUS_COLORS, GOLD, DARK } from '../../constants';

// =============================================================================
// TYPES
// =============================================================================

export interface SlotProps {
  slot: SlotType;
  station?: Station;
  mode: RoomMode;
  isSelected?: boolean;
  isHighlighted?: boolean;
  journeyNumber?: number;
  showJourneyNumber?: boolean;
  needsReview?: boolean;
  onClick?: () => void;
  /** Skalierungsfaktor für responsive Darstellung */
  scale?: number;
}

// =============================================================================
// HELPERS
// =============================================================================

function getStatusColor(status: RecallStatus | null): string {
  if (!status) return STATUS_COLORS.neutral;
  return STATUS_COLORS[status === 'needs_practice' ? 'needsPractice' : status];
}

// =============================================================================
// STYLES
// =============================================================================

const createStyles = (scale: number) => ({
  container: (
    slot: SlotType,
    hasStation: boolean,
    isSelected: boolean,
    isHighlighted: boolean,
    mode: RoomMode
  ): React.CSSProperties => ({
    position: 'absolute',
    left: `${slot.x * scale}px`,
    top: `${slot.y * scale}px`,
    width: `${slot.width * scale}px`,
    height: `${slot.height * scale}px`,
    cursor: mode === 'journey' && !isHighlighted ? 'default' : 'pointer',
    transition: 'all 0.3s ease',
    zIndex: isSelected || isHighlighted ? 30 : 20,
  }),

  emptySlot: (isSelected: boolean, mode: RoomMode): React.CSSProperties => ({
    width: '100%',
    height: '100%',
    border: `2px dashed ${mode === 'edit' ? 'rgba(255, 215, 0, 0.4)' : 'rgba(255, 255, 255, 0.15)'}`,
    borderRadius: '12px',
    background: mode === 'edit' ? 'rgba(255, 215, 0, 0.05)' : 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    opacity: mode === 'edit' ? 1 : 0.5,
  }),

  addIcon: {
    fontSize: '24px',
    color: GOLD.primary,
    opacity: 0.6,
  } as React.CSSProperties,

  stationContainer: (
    isSelected: boolean,
    isHighlighted: boolean,
    statusColor: string,
    needsReview: boolean
  ): React.CSSProperties => ({
    width: '100%',
    height: '100%',
    background: `linear-gradient(145deg, ${DARK.elevated} 0%, ${DARK.base} 100%)`,
    borderRadius: '12px',
    border: `2px solid ${isSelected || isHighlighted ? GOLD.primary : statusColor}`,
    boxShadow: isHighlighted 
      ? `0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.3)`
      : isSelected
        ? `0 0 15px rgba(255, 215, 0, 0.3)`
        : `0 4px 12px rgba(0, 0, 0, 0.3)`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
  }),

  reviewIndicator: {
    position: 'absolute',
    inset: '-2px',
    borderRadius: '14px',
    border: '2px solid #ef4444',
    animation: 'pulse 2s ease-in-out infinite',
    pointerEvents: 'none',
  } as React.CSSProperties,

  statusRing: (color: string): React.CSSProperties => ({
    position: 'absolute',
    top: '6px',
    right: '6px',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: color,
    boxShadow: `0 0 6px ${color}`,
  }),

  icon: {
    fontSize: '28px',
    marginBottom: '4px',
  } as React.CSSProperties,

  title: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#fff',
    textAlign: 'center',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    width: '100%',
    padding: '0 4px',
  } as React.CSSProperties,

  journeyNumber: (isHighlighted: boolean): React.CSSProperties => ({
    position: 'absolute',
    top: '-10px',
    left: '-10px',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: isHighlighted ? GOLD.gradient : DARK.surface,
    border: `2px solid ${isHighlighted ? GOLD.primary : GOLD.dark}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 700,
    color: isHighlighted ? DARK.deepest : GOLD.primary,
    boxShadow: isHighlighted 
      ? '0 0 10px rgba(255, 215, 0, 0.5)' 
      : '0 2px 4px rgba(0, 0, 0, 0.3)',
    zIndex: 10,
  }),

  label: {
    position: 'absolute',
    bottom: '-20px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '10px',
    color: 'rgba(255, 255, 255, 0.4)',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
  } as React.CSSProperties,

  highlightGlow: {
    position: 'absolute',
    inset: '-4px',
    borderRadius: '16px',
    background: 'transparent',
    boxShadow: '0 0 30px rgba(255, 215, 0, 0.4)',
    pointerEvents: 'none',
    animation: 'glow 2s ease-in-out infinite',
  } as React.CSSProperties,
});

// =============================================================================
// COMPONENT
// =============================================================================

export const Slot: React.FC<SlotProps> = ({
  slot,
  station,
  mode,
  isSelected = false,
  isHighlighted = false,
  journeyNumber,
  showJourneyNumber = false,
  needsReview = false,
  onClick,
  scale = 1,
}) => {
  const styles = createStyles(scale);
  const hasStation = !!station;
  const statusColor = station ? getStatusColor(station.recallStatus) : STATUS_COLORS.neutral;

  const handleClick = () => {
    // In journey mode, only allow clicking highlighted station
    if (mode === 'journey' && !isHighlighted) return;
    onClick?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      style={styles.container(slot, hasStation, isSelected, isHighlighted, mode)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={mode === 'journey' && !isHighlighted ? -1 : 0}
      aria-label={
        hasStation 
          ? `Station: ${station.title}` 
          : `Leerer Platz: ${slot.label}`
      }
      aria-pressed={isSelected}
    >
      {/* Journey number badge */}
      {showJourneyNumber && journeyNumber !== undefined && (
        <div style={styles.journeyNumber(isHighlighted)}>
          {journeyNumber}
        </div>
      )}

      {hasStation ? (
        /* Station content */
        <div style={styles.stationContainer(isSelected, isHighlighted, statusColor, needsReview)}>
          {/* Review indicator (pulsing border) */}
          {needsReview && !isHighlighted && (
            <div style={styles.reviewIndicator} />
          )}

          {/* Highlight glow for journey mode */}
          {isHighlighted && (
            <div style={styles.highlightGlow} />
          )}

          {/* Status indicator dot */}
          {station.recallStatus && (
            <div style={styles.statusRing(statusColor)} />
          )}

          {/* Station icon */}
          <span style={styles.icon}>{station.icon}</span>

          {/* Station title */}
          <span style={styles.title}>{station.title}</span>
        </div>
      ) : (
        /* Empty slot */
        mode === 'edit' && (
          <div style={styles.emptySlot(isSelected, mode)}>
            <span style={styles.addIcon}>+</span>
          </div>
        )
      )}

      {/* Slot label (shown on hover in edit mode) */}
      {mode === 'edit' && !hasStation && (
        <span style={styles.label}>{slot.label}</span>
      )}
    </div>
  );
};

export default Slot;
