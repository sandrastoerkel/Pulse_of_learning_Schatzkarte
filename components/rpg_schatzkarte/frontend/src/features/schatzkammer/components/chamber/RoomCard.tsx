/**
 * RoomCard Component
 * 
 * Zeigt einen einzelnen Raum als Karte in der Übersicht.
 * Enthält Template-Icon, Name, Statistiken und Aktionen.
 */

import React from 'react';
import type { Room, RoomStats, ColorTag } from '../../types';
import { ROOM_TEMPLATES, COLOR_TAGS, GOLD, DARK } from '../../constants';
import { formatRelativeDate, truncate } from '../../utils';

// =============================================================================
// TYPES
// =============================================================================

export interface RoomCardProps {
  room: Room;
  stats?: RoomStats;
  isSelected?: boolean;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onStartJourney?: () => void;
}

// =============================================================================
// STYLES
// =============================================================================

const styles = {
  card: (colorTag: ColorTag, isSelected: boolean): React.CSSProperties => ({
    position: 'relative',
    background: `linear-gradient(145deg, ${DARK.elevated} 0%, ${DARK.base} 100%)`,
    borderRadius: '16px',
    border: `2px solid ${isSelected ? GOLD.primary : COLOR_TAGS[colorTag].border}`,
    padding: '20px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: isSelected 
      ? `0 8px 32px rgba(255, 215, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)`
      : `0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)`,
    overflow: 'hidden',
  }),

  colorAccent: (colorTag: ColorTag): React.CSSProperties => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${COLOR_TAGS[colorTag].border}, transparent)`,
  }),

  header: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    marginBottom: '16px',
  } as React.CSSProperties,

  iconContainer: (colorTag: ColorTag): React.CSSProperties => ({
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    background: COLOR_TAGS[colorTag].bg,
    border: `1px solid ${COLOR_TAGS[colorTag].border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    flexShrink: 0,
  }),

  titleSection: {
    flex: 1,
    minWidth: 0,
  } as React.CSSProperties,

  title: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#fff',
    margin: 0,
    marginBottom: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  } as React.CSSProperties,

  subtitle: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.5)',
    margin: 0,
  } as React.CSSProperties,

  description: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 1.5,
    marginBottom: '16px',
    minHeight: '42px',
  } as React.CSSProperties,

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '16px',
  } as React.CSSProperties,

  statItem: {
    textAlign: 'center',
    padding: '10px 8px',
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '8px',
  } as React.CSSProperties,

  statValue: {
    fontSize: '20px',
    fontWeight: 700,
    color: GOLD.primary,
    display: 'block',
  } as React.CSSProperties,

  statLabel: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  } as React.CSSProperties,

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
    marginBottom: '12px',
  } as React.CSSProperties,

  actions: {
    display: 'flex',
    gap: '8px',
  } as React.CSSProperties,

  primaryButton: {
    flex: 1,
    padding: '12px 16px',
    background: GOLD.gradient,
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600,
    color: DARK.deepest,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  } as React.CSSProperties,

  secondaryButton: {
    padding: '12px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.7)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,

  emptyStats: {
    textAlign: 'center',
    padding: '20px',
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: '14px',
  } as React.CSSProperties,

  lastActivity: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'right',
    marginTop: '12px',
  } as React.CSSProperties,
};

// =============================================================================
// COMPONENT
// =============================================================================

export const RoomCard: React.FC<RoomCardProps> = ({
  room,
  stats,
  isSelected = false,
  onClick,
  onEdit,
  onDelete,
  onStartJourney,
}) => {
  const template = ROOM_TEMPLATES[room.templateId];
  const hasStations = stats && stats.totalStations > 0;
  const hasDueStations = stats && stats.dueForReview > 0;

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click when clicking buttons
    if ((e.target as HTMLElement).closest('button')) return;
    onClick?.();
  };

  const handleStartJourney = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStartJourney?.();
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };

  return (
    <div
      style={styles.card(room.colorTag, isSelected)}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      aria-label={`Raum: ${room.name}`}
    >
      {/* Color accent line */}
      <div style={styles.colorAccent(room.colorTag)} />

      {/* Header with icon and title */}
      <div style={styles.header}>
        <div style={styles.iconContainer(room.colorTag)}>
          {template.icon}
        </div>
        <div style={styles.titleSection}>
          <h3 style={styles.title}>{room.name}</h3>
          <p style={styles.subtitle}>
            {template.name}
            {room.subject && ` · ${room.subject}`}
          </p>
        </div>
      </div>

      {/* Description */}
      {room.description && (
        <p style={styles.description}>
          {truncate(room.description, 80)}
        </p>
      )}

      {/* Review badge */}
      {hasDueStations && (
        <div style={styles.reviewBadge}>
          <span>🔔</span>
          <span>{stats.dueForReview} zur Wiederholung</span>
        </div>
      )}

      {/* Statistics */}
      {hasStations ? (
        <div style={styles.statsGrid}>
          <div style={styles.statItem}>
            <span style={styles.statValue}>{stats.totalStations}</span>
            <span style={styles.statLabel}>Stationen</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statValue}>{stats.masteredStations}</span>
            <span style={styles.statLabel}>Gemeistert</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statValue}>
              {Math.round(stats.averageRecallRate * 100)}%
            </span>
            <span style={styles.statLabel}>Erfolg</span>
          </div>
        </div>
      ) : (
        <div style={styles.emptyStats as React.CSSProperties}>
          Noch keine Stationen erstellt
        </div>
      )}

      {/* Action buttons */}
      <div style={styles.actions}>
        {hasStations ? (
          <button
            style={styles.primaryButton}
            onClick={handleStartJourney}
            aria-label="Rundgang starten"
          >
            <span>🚀</span>
            <span>Rundgang</span>
          </button>
        ) : (
          <button
            style={styles.primaryButton}
            onClick={handleEdit}
            aria-label="Stationen hinzufügen"
          >
            <span>✨</span>
            <span>Stationen hinzufügen</span>
          </button>
        )}

        <button
          style={styles.secondaryButton}
          onClick={handleEdit}
          aria-label="Bearbeiten"
          title="Bearbeiten"
        >
          ✏️
        </button>

        <button
          style={styles.secondaryButton}
          onClick={handleDelete}
          aria-label="Löschen"
          title="Löschen"
        >
          🗑️
        </button>
      </div>

      {/* Last activity */}
      {stats?.lastJourneyAt && (
        <p style={styles.lastActivity as React.CSSProperties}>
          Zuletzt geübt: {formatRelativeDate(stats.lastJourneyAt)}
        </p>
      )}
    </div>
  );
};

export default RoomCard;
