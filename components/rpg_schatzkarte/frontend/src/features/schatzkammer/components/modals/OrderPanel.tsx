/**
 * OrderPanel Component
 * 
 * Panel zum Bearbeiten der Rundgang-Reihenfolge.
 * Zeigt Liste aller Stationen mit ▲▼ Buttons.
 */

import React, { useCallback } from 'react';
import type { Station } from '../../types';
import { UI, FEEDBACK } from '../../constants';

// =============================================================================
// TYPES
// =============================================================================

export interface OrderPanelProps {
  isOpen: boolean;
  stations: Station[];
  onMoveUp: (stationId: string) => void;
  onMoveDown: (stationId: string) => void;
  onClose: () => void;
}

// =============================================================================
// STYLES
// =============================================================================

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 150,
    padding: '20px',
  } as React.CSSProperties,

  panel: {
    background: `linear-gradient(145deg, ${UI.surface} 0%, ${UI.base} 100%)`,
    borderRadius: '20px',
    border: `2px solid ${UI.action}`,
    boxShadow: `0 20px 40px rgba(0, 0, 0, 0.5), 0 0 12px rgba(14, 165, 233, 0.3)`,
    width: '100%',
    maxWidth: '380px',
    maxHeight: '80vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  } as React.CSSProperties,

  header: {
    padding: '20px 24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as React.CSSProperties,

  title: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#fff',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  } as React.CSSProperties,

  closeButton: {
    width: '32px',
    height: '32px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: 'none',
    borderRadius: '50%',
    fontSize: '16px',
    color: 'rgba(255, 255, 255, 0.6)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,

  content: {
    padding: '16px',
    overflowY: 'auto',
    flex: 1,
  } as React.CSSProperties,

  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    color: 'rgba(255, 255, 255, 0.5)',
  } as React.CSSProperties,

  emptyIcon: {
    fontSize: '40px',
    marginBottom: '12px',
    opacity: 0.5,
  } as React.CSSProperties,

  emptyText: {
    fontSize: '14px',
    lineHeight: 1.5,
  } as React.CSSProperties,

  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  } as React.CSSProperties,

  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,

  number: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: UI.action,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
  } as React.CSSProperties,

  icon: {
    fontSize: '22px',
    flexShrink: 0,
  } as React.CSSProperties,

  info: {
    flex: 1,
    minWidth: 0,
  } as React.CSSProperties,

  stationTitle: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#fff',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  } as React.CSSProperties,

  stationMeta: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.4)',
  } as React.CSSProperties,

  controls: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  } as React.CSSProperties,

  moveButton: (disabled: boolean): React.CSSProperties => ({
    width: '28px',
    height: '22px',
    background: disabled ? 'transparent' : 'rgba(255, 255, 255, 0.05)',
    border: disabled ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    fontSize: '12px',
    color: disabled ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.7)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  }),

  footer: {
    padding: '16px 24px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  } as React.CSSProperties,

  doneButton: {
    width: '100%',
    padding: '12px',
    background: UI.action,
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  } as React.CSSProperties,

  hint: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    marginBottom: '12px',
  } as React.CSSProperties,
};

// =============================================================================
// COMPONENT
// =============================================================================

export const OrderPanel: React.FC<OrderPanelProps> = ({
  isOpen,
  stations,
  onMoveUp,
  onMoveDown,
  onClose,
}) => {
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const handleMoveUp = useCallback((stationId: string) => {
    onMoveUp(stationId);
  }, [onMoveUp]);

  const handleMoveDown = useCallback((stationId: string) => {
    onMoveDown(stationId);
  }, [onMoveDown]);

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={handleOverlayClick}>
      <div style={styles.panel}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>
            <span>📋</span>
            <span>Reihenfolge</span>
          </h2>
          <button style={styles.closeButton} onClick={onClose}>✕</button>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {stations.length === 0 ? (
            <div style={styles.emptyState as React.CSSProperties}>
              <div style={styles.emptyIcon}>📝</div>
              <p style={styles.emptyText}>
                Noch keine Stationen vorhanden.<br />
                Erstelle zuerst einige Stationen.
              </p>
            </div>
          ) : (
            <>
              <p style={styles.hint as React.CSSProperties}>
                Verschiebe Stationen mit den Pfeilen
              </p>
              
              <div style={styles.list as React.CSSProperties}>
                {stations.map((station, index) => {
                  const isFirst = index === 0;
                  const isLast = index === stations.length - 1;

                  return (
                    <div key={station.id} style={styles.item}>
                      {/* Number */}
                      <div style={styles.number}>{index + 1}</div>

                      {/* Icon */}
                      <span style={styles.icon}>{station.icon}</span>

                      {/* Info */}
                      <div style={styles.info}>
                        <div style={styles.stationTitle}>{station.title}</div>
                        {station.hint && (
                          <div style={styles.stationMeta}>💡 {station.hint}</div>
                        )}
                      </div>

                      {/* Move controls */}
                      <div style={styles.controls as React.CSSProperties}>
                        <button
                          style={styles.moveButton(isFirst)}
                          onClick={() => !isFirst && handleMoveUp(station.id)}
                          disabled={isFirst}
                          aria-label="Nach oben"
                        >
                          ▲
                        </button>
                        <button
                          style={styles.moveButton(isLast)}
                          onClick={() => !isLast && handleMoveDown(station.id)}
                          disabled={isLast}
                          aria-label="Nach unten"
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button style={styles.doneButton} onClick={onClose}>
            <span>✓</span>
            <span>Fertig</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderPanel;
