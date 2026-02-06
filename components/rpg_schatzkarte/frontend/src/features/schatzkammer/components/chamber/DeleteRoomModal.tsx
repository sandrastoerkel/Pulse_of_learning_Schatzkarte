/**
 * DeleteRoomModal Component
 * 
 * Bestätigungsdialog zum Löschen eines Raums.
 * Zeigt Warnung und erfordert explizite Bestätigung.
 */

import React, { useCallback } from 'react';
import type { Room, RoomStats } from '../../types';
import { ROOM_TEMPLATES, COLOR_TAGS, UI, FEEDBACK } from '../../constants';

// =============================================================================
// TYPES
// =============================================================================

export interface DeleteRoomModalProps {
  isOpen: boolean;
  room: Room | null;
  stats?: RoomStats;
  onClose: () => void;
  onConfirm: (roomId: string) => void;
}

// =============================================================================
// STYLES
// =============================================================================

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
    animation: 'fadeIn 0.2s ease',
  } as React.CSSProperties,

  modal: {
    background: `linear-gradient(145deg, ${UI.surface} 0%, ${UI.base} 100%)`,
    borderRadius: '20px',
    border: '2px solid rgba(239, 68, 68, 0.5)',
    boxShadow: '0 24px 48px rgba(0, 0, 0, 0.5), 0 0 40px rgba(239, 68, 68, 0.2)',
    width: '100%',
    maxWidth: '440px',
    overflow: 'hidden',
    animation: 'scaleIn 0.3s ease',
  } as React.CSSProperties,

  content: {
    padding: '32px',
    textAlign: 'center',
  } as React.CSSProperties,

  iconContainer: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    background: 'rgba(239, 68, 68, 0.15)',
    border: '2px solid rgba(239, 68, 68, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
    fontSize: '32px',
  } as React.CSSProperties,

  title: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#fff',
    margin: 0,
    marginBottom: '12px',
  } as React.CSSProperties,

  description: {
    fontSize: '15px',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 1.6,
    marginBottom: '24px',
  } as React.CSSProperties,

  roomPreview: {
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    textAlign: 'left',
  } as React.CSSProperties,

  roomIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    flexShrink: 0,
  } as React.CSSProperties,

  roomInfo: {
    flex: 1,
    minWidth: 0,
  } as React.CSSProperties,

  roomName: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  } as React.CSSProperties,

  roomMeta: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.5)',
  } as React.CSSProperties,

  warning: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '10px',
    padding: '14px',
    marginBottom: '24px',
    fontSize: '13px',
    color: '#f87171',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    textAlign: 'left',
  } as React.CSSProperties,

  warningIcon: {
    fontSize: '16px',
    flexShrink: 0,
    marginTop: '2px',
  } as React.CSSProperties,

  actions: {
    display: 'flex',
    gap: '12px',
  } as React.CSSProperties,

  cancelButton: {
    flex: 1,
    padding: '14px 20px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.8)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,

  deleteButton: {
    flex: 1,
    padding: '14px 20px',
    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: 600,
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  } as React.CSSProperties,
};

// =============================================================================
// COMPONENT
// =============================================================================

export const DeleteRoomModal: React.FC<DeleteRoomModalProps> = ({
  isOpen,
  room,
  stats,
  onClose,
  onConfirm,
}) => {
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const handleConfirm = useCallback(() => {
    if (room) {
      onConfirm(room.id);
    }
  }, [room, onConfirm]);

  if (!isOpen || !room) return null;

  const template = ROOM_TEMPLATES[room.templateId];
  const colorTag = room.colorTag;
  const stationCount = stats?.totalStations ?? 0;

  return (
    <div style={styles.overlay} onClick={handleOverlayClick}>
      <div style={styles.modal} role="alertdialog" aria-labelledby="delete-title">
        <div style={styles.content as React.CSSProperties}>
          {/* Warning icon */}
          <div style={styles.iconContainer}>
            ⚠️
          </div>

          {/* Title */}
          <h2 id="delete-title" style={styles.title}>
            Raum löschen?
          </h2>

          {/* Description */}
          <p style={styles.description}>
            Bist du sicher, dass du diesen Raum löschen möchtest?
          </p>

          {/* Room preview */}
          <div style={styles.roomPreview}>
            <div style={{
              ...styles.roomIcon,
              background: COLOR_TAGS[colorTag].bg,
              border: `1px solid ${COLOR_TAGS[colorTag].border}`,
            }}>
              {template.icon}
            </div>
            <div style={styles.roomInfo}>
              <div style={styles.roomName}>{room.name}</div>
              <div style={styles.roomMeta}>
                {template.name}
                {stationCount > 0 && ` · ${stationCount} Stationen`}
              </div>
            </div>
          </div>

          {/* Warning */}
          <div style={styles.warning}>
            <span style={styles.warningIcon}>⚠️</span>
            <span>
              Diese Aktion kann nicht rückgängig gemacht werden. 
              {stationCount > 0 && (
                <> Alle {stationCount} Stationen und ihr Lernfortschritt werden gelöscht.</>
              )}
            </span>
          </div>

          {/* Actions */}
          <div style={styles.actions}>
            <button
              style={styles.cancelButton}
              onClick={onClose}
            >
              Abbrechen
            </button>
            <button
              style={styles.deleteButton}
              onClick={handleConfirm}
            >
              <span>🗑️</span>
              <span>Löschen</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteRoomModal;
