/**
 * RoomHeader Component
 * 
 * Header für den Loci-Raum mit:
 * - Zurück-Button
 * - Raum-Name
 * - Modi-Buttons (View/Edit/Order)
 * - Journey-Button
 * - Progress-Anzeige im Journey-Modus
 */

import React from 'react';
import type { Room, RoomMode, RoomStats } from '../../types';
import { ROOM_TEMPLATES, GOLD, DARK, COLOR_TAGS } from '../../constants';

// =============================================================================
// TYPES
// =============================================================================

export interface RoomHeaderProps {
  room: Room;
  mode: RoomMode;
  stats?: RoomStats;
  /** Progress im Journey-Modus */
  journeyProgress?: {
    current: number;
    total: number;
    percent: number;
  };
  /** Anzahl Stationen zur Wiederholung */
  reviewCount?: number;
  onBack: () => void;
  onModeChange: (mode: RoomMode) => void;
  onStartJourney: () => void;
}

// =============================================================================
// STYLES
// =============================================================================

const styles = {
  header: {
    background: `linear-gradient(180deg, ${DARK.elevated} 0%, transparent 100%)`,
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    position: 'relative',
    zIndex: 100,
  } as React.CSSProperties,

  backButton: {
    width: '40px',
    height: '40px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    fontSize: '18px',
    color: 'rgba(255, 255, 255, 0.7)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    flexShrink: 0,
  } as React.CSSProperties,

  titleSection: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  } as React.CSSProperties,

  roomIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    flexShrink: 0,
  } as React.CSSProperties,

  titleText: {
    flex: 1,
    minWidth: 0,
  } as React.CSSProperties,

  roomName: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#fff',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  } as React.CSSProperties,

  roomMeta: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.5)',
    margin: 0,
  } as React.CSSProperties,

  modeButtons: {
    display: 'flex',
    gap: '4px',
    background: 'rgba(0, 0, 0, 0.2)',
    padding: '4px',
    borderRadius: '10px',
  } as React.CSSProperties,

  modeButton: (isActive: boolean): React.CSSProperties => ({
    padding: '8px 16px',
    background: isActive ? 'rgba(255, 215, 0, 0.15)' : 'transparent',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: isActive ? 600 : 400,
    color: isActive ? GOLD.primary : 'rgba(255, 255, 255, 0.6)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  }),

  journeyButton: (hasStations: boolean): React.CSSProperties => ({
    padding: '10px 20px',
    background: hasStations ? GOLD.gradient : 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600,
    color: hasStations ? DARK.deepest : 'rgba(255, 255, 255, 0.4)',
    cursor: hasStations ? 'pointer' : 'not-allowed',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    boxShadow: hasStations ? '0 4px 12px rgba(255, 215, 0, 0.3)' : 'none',
  }),

  reviewBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '20px',
    fontSize: '12px',
    color: '#f87171',
  } as React.CSSProperties,

  // Journey Mode Header
  journeyHeader: {
    background: `linear-gradient(180deg, rgba(26, 26, 46, 0.95) 0%, rgba(26, 26, 46, 0.8) 100%)`,
    backdropFilter: 'blur(10px)',
    padding: '16px 24px',
    position: 'relative',
    zIndex: 100,
  } as React.CSSProperties,

  journeyTopRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  } as React.CSSProperties,

  journeyTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  } as React.CSSProperties,

  exitButton: {
    padding: '8px 16px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '8px',
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.7)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,

  progressContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  } as React.CSSProperties,

  progressBar: {
    flex: 1,
    height: '8px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
  } as React.CSSProperties,

  progressFill: (percent: number): React.CSSProperties => ({
    width: `${percent}%`,
    height: '100%',
    background: GOLD.gradient,
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  }),

  progressText: {
    fontSize: '14px',
    fontWeight: 600,
    color: GOLD.primary,
    minWidth: '80px',
    textAlign: 'right',
  } as React.CSSProperties,
};

// =============================================================================
// COMPONENT
// =============================================================================

export const RoomHeader: React.FC<RoomHeaderProps> = ({
  room,
  mode,
  stats,
  journeyProgress,
  reviewCount = 0,
  onBack,
  onModeChange,
  onStartJourney,
}) => {
  const template = ROOM_TEMPLATES[room.templateId];
  const hasStations = stats && stats.totalStations > 0;
  const isJourneyMode = mode === 'journey';

  // Journey mode header
  if (isJourneyMode && journeyProgress) {
    return (
      <header style={styles.journeyHeader}>
        <div style={styles.journeyTopRow}>
          <div style={styles.journeyTitle}>
            <span>🚀</span>
            <span>Rundgang: {room.name}</span>
          </div>
          <button
            style={styles.exitButton}
            onClick={() => onModeChange('view')}
          >
            <span>✕</span>
            <span>Beenden</span>
          </button>
        </div>

        <div style={styles.progressContainer}>
          <div style={styles.progressBar}>
            <div style={styles.progressFill(journeyProgress.percent)} />
          </div>
          <span style={styles.progressText as React.CSSProperties}>
            {journeyProgress.current} / {journeyProgress.total}
          </span>
        </div>
      </header>
    );
  }

  // Normal header
  return (
    <header style={styles.header}>
      {/* Back button */}
      <button
        style={styles.backButton}
        onClick={onBack}
        aria-label="Zurück zur Übersicht"
      >
        ←
      </button>

      {/* Room info */}
      <div style={styles.titleSection}>
        <div style={{
          ...styles.roomIcon,
          background: COLOR_TAGS[room.colorTag].bg,
          border: `1px solid ${COLOR_TAGS[room.colorTag].border}`,
        }}>
          {template.icon}
        </div>
        <div style={styles.titleText}>
          <h1 style={styles.roomName}>{room.name}</h1>
          <p style={styles.roomMeta}>
            {template.name}
            {stats && ` · ${stats.totalStations} Stationen`}
          </p>
        </div>
      </div>

      {/* Review badge */}
      {reviewCount > 0 && (
        <div style={styles.reviewBadge}>
          <span>🔔</span>
          <span>{reviewCount} wiederholen</span>
        </div>
      )}

      {/* Mode buttons */}
      <div style={styles.modeButtons}>
        <button
          style={styles.modeButton(mode === 'view')}
          onClick={() => onModeChange('view')}
          aria-pressed={mode === 'view'}
        >
          <span>👁️</span>
          <span>Ansehen</span>
        </button>
        <button
          style={styles.modeButton(mode === 'edit')}
          onClick={() => onModeChange('edit')}
          aria-pressed={mode === 'edit'}
        >
          <span>✏️</span>
          <span>Bearbeiten</span>
        </button>
        <button
          style={styles.modeButton(mode === 'order')}
          onClick={() => onModeChange('order')}
          aria-pressed={mode === 'order'}
        >
          <span>📋</span>
          <span>Reihenfolge</span>
        </button>
      </div>

      {/* Journey button */}
      <button
        style={styles.journeyButton(!!hasStations)}
        onClick={onStartJourney}
        disabled={!hasStations}
        aria-label="Rundgang starten"
      >
        <span>🚀</span>
        <span>Rundgang</span>
      </button>
    </header>
  );
};

export default RoomHeader;
