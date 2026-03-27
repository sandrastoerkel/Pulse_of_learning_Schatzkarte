/**
 * StationModal Component
 * 
 * Modal für eine einzelne Station mit drei Modi:
 * - View: Inhalt anzeigen
 * - Edit: Station bearbeiten
 * - Journey: Aufdecken + Selbsteinschätzung
 */

import React, { useState, useCallback, useEffect } from 'react';
import type { Station, ArtifactType, RecallStatus } from '../../types';
import {
  ARTIFACT_CONFIGS,
  ARTIFACT_ICON_SUGGESTIONS,
  STATUS_COLORS,
  STATUS_LABELS,
  STATUS_EMOJIS,
  UI,
  FEEDBACK
} from '../../constants';
import { formatRelativeDate } from '../../utils';
import { VoiceTextInput } from '../../../../components/VoiceTextInput';

// =============================================================================
// TYPES
// =============================================================================

export type StationModalMode = 'view' | 'edit' | 'journey';

export interface StationModalProps {
  isOpen: boolean;
  station: Station | null;
  mode: StationModalMode;
  /** Journey-spezifisch: Ist der Inhalt aufgedeckt? */
  isRevealed?: boolean;
  onClose: () => void;
  onSave?: (data: Partial<Station>) => void;
  onDelete?: (stationId: string) => void;
  /** Journey: Inhalt aufdecken */
  onReveal?: () => void;
  /** Journey: Selbsteinschätzung */
  onRate?: (status: RecallStatus) => void;
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
    zIndex: 200,
    padding: '20px',
  } as React.CSSProperties,

  modal: {
    background: `linear-gradient(145deg, ${UI.surface} 0%, ${UI.base} 100%)`,
    borderRadius: '20px',
    border: `2px solid ${UI.action}`,
    boxShadow: `0 24px 48px rgba(0, 0, 0, 0.5), 0 0 12px rgba(14, 165, 233, 0.3)`,
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  } as React.CSSProperties,

  header: {
    padding: '20px 24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  } as React.CSSProperties,

  iconContainer: {
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    background: 'rgba(14, 165, 233, 0.1)',
    border: `1px solid ${UI.action}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    flexShrink: 0,
  } as React.CSSProperties,

  headerText: {
    flex: 1,
    minWidth: 0,
  } as React.CSSProperties,

  title: {
    fontSize: '20px',
    fontWeight: 600,
    color: '#fff',
    margin: 0,
    marginBottom: '4px',
  } as React.CSSProperties,

  subtitle: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.5)',
    margin: 0,
  } as React.CSSProperties,

  closeButton: {
    width: '36px',
    height: '36px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: 'none',
    borderRadius: '50%',
    fontSize: '18px',
    color: 'rgba(255, 255, 255, 0.6)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  } as React.CSSProperties,

  content: {
    padding: '24px',
    overflowY: 'auto',
    flex: 1,
  } as React.CSSProperties,

  section: {
    marginBottom: '20px',
  } as React.CSSProperties,

  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: UI.action,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '8px',
  } as React.CSSProperties,

  text: {
    fontSize: '15px',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
  } as React.CSSProperties,

  input: {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    fontSize: '15px',
    color: '#fff',
    outline: 'none',
    boxSizing: 'border-box',
  } as React.CSSProperties,

  textarea: {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    fontSize: '15px',
    color: '#fff',
    outline: 'none',
    resize: 'vertical',
    minHeight: '100px',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  } as React.CSSProperties,

  iconInput: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  } as React.CSSProperties,

  iconField: {
    width: '60px',
    height: '48px',
    padding: '0',
    background: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    fontSize: '24px',
    color: '#fff',
    textAlign: 'center',
    outline: 'none',
  } as React.CSSProperties,

  iconSuggestions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    flex: 1,
  } as React.CSSProperties,

  iconSuggestion: {
    width: '36px',
    height: '36px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,

  statusBadge: (status: RecallStatus | null): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    background: status 
      ? `${STATUS_COLORS[status === 'needs_practice' ? 'needsPractice' : status]}20`
      : 'rgba(255, 255, 255, 0.05)',
    border: `1px solid ${status 
      ? STATUS_COLORS[status === 'needs_practice' ? 'needsPractice' : status] 
      : 'rgba(255, 255, 255, 0.1)'}`,
    borderRadius: '20px',
    fontSize: '13px',
    color: status 
      ? STATUS_COLORS[status === 'needs_practice' ? 'needsPractice' : status]
      : 'rgba(255, 255, 255, 0.5)',
  }),

  footer: {
    padding: '16px 24px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  } as React.CSSProperties,

  button: (variant: 'primary' | 'secondary' | 'danger'): React.CSSProperties => ({
    padding: '12px 24px',
    background: variant === 'primary'
      ? UI.action
      : variant === 'danger'
        ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
        : 'rgba(255, 255, 255, 0.05)',
    border: variant === 'secondary' ? '1px solid rgba(255, 255, 255, 0.15)' : 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600,
    color: variant === 'primary' ? '#fff' : variant === 'danger' ? '#fff' : 'rgba(255, 255, 255, 0.8)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }),

  // Journey-specific styles
  journeyQuestion: {
    textAlign: 'center',
    padding: '40px 20px',
  } as React.CSSProperties,

  journeyIcon: {
    fontSize: '64px',
    marginBottom: '20px',
  } as React.CSSProperties,

  journeyPrompt: {
    fontSize: '22px',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '12px',
  } as React.CSSProperties,

  journeyHint: {
    fontSize: '15px',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: '32px',
    padding: '16px',
    background: 'rgba(14, 165, 233, 0.1)',
    borderRadius: '12px',
    border: `1px solid ${UI.action}`,
  } as React.CSSProperties,

  revealButton: {
    padding: '16px 40px',
    background: UI.action,
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 600,
    color: '#fff',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 4px 16px rgba(14, 165, 233, 0.3)',
  } as React.CSSProperties,

  journeyContent: {
    textAlign: 'center',
    padding: '20px',
  } as React.CSSProperties,

  journeyTitle: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#fff',
    marginBottom: '16px',
  } as React.CSSProperties,

  journeyText: {
    fontSize: '16px',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 1.7,
    marginBottom: '32px',
    padding: '20px',
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '12px',
    textAlign: 'left',
    whiteSpace: 'pre-wrap',
  } as React.CSSProperties,

  ratingButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  } as React.CSSProperties,

  ratingButton: (status: RecallStatus): React.CSSProperties => ({
    flex: 1,
    maxWidth: '140px',
    padding: '16px 12px',
    background: `${STATUS_COLORS[status === 'needs_practice' ? 'needsPractice' : status]}15`,
    border: `2px solid ${STATUS_COLORS[status === 'needs_practice' ? 'needsPractice' : status]}`,
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 600,
    color: STATUS_COLORS[status === 'needs_practice' ? 'needsPractice' : status],
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
  }),

  ratingEmoji: {
    fontSize: '28px',
  } as React.CSSProperties,

  metaInfo: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.5)',
  } as React.CSSProperties,

  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  } as React.CSSProperties,

  deleteSection: {
    marginTop: '24px',
    paddingTop: '20px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  } as React.CSSProperties,

  deleteButton: {
    width: '100%',
    padding: '12px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#f87171',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  } as React.CSSProperties,
};

// =============================================================================
// COMPONENT
// =============================================================================

export const StationModal: React.FC<StationModalProps> = ({
  isOpen,
  station,
  mode,
  isRevealed = false,
  onClose,
  onSave,
  onDelete,
  onReveal,
  onRate,
}) => {
  // Edit form state
  const [editIcon, setEditIcon] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editHint, setEditHint] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Sync form state with station
  useEffect(() => {
    if (station && mode === 'edit') {
      setEditIcon(station.icon);
      setEditTitle(station.title);
      setEditContent(station.content);
      setEditHint(station.hint);
      setConfirmDelete(false);
    }
  }, [station, mode, isOpen]);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget && mode !== 'journey') {
      onClose();
    }
  }, [mode, onClose]);

  const handleSave = useCallback(() => {
    if (!station || !onSave) return;
    onSave({
      id: station.id,
      icon: editIcon,
      title: editTitle.trim(),
      content: editContent.trim(),
      hint: editHint.trim(),
    });
  }, [station, editIcon, editTitle, editContent, editHint, onSave]);

  const handleDelete = useCallback(() => {
    if (!station || !onDelete) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    onDelete(station.id);
  }, [station, confirmDelete, onDelete]);

  if (!isOpen || !station) return null;

  const artifactConfig = ARTIFACT_CONFIGS[station.artifactType];
  const iconSuggestions = ARTIFACT_ICON_SUGGESTIONS[station.artifactType];
  const isValid = editTitle.trim().length > 0 && editContent.trim().length > 0;

  // Styles for VoiceTextInput to match modal theme
  const voiceInputStyle: React.CSSProperties = {
    padding: '12px 16px',
    background: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    fontSize: '15px',
    color: '#fff',
  };

  const voiceTextareaStyle: React.CSSProperties = {
    ...voiceInputStyle,
    minHeight: '120px',
  };

  // Journey mode - not revealed
  if (mode === 'journey' && !isRevealed) {
    return (
      <div style={styles.overlay} onClick={handleOverlayClick}>
        <div style={styles.modal}>
          <div style={styles.journeyQuestion as React.CSSProperties}>
            <div style={styles.journeyIcon}>{station.icon}</div>
            <h2 style={styles.journeyPrompt}>Was war hier?</h2>
            
            {station.hint && (
              <div style={styles.journeyHint}>
                💡 <strong>Hinweis:</strong> {station.hint}
              </div>
            )}

            <button style={styles.revealButton} onClick={onReveal}>
              <span>👁️</span>
              <span>Aufdecken</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Journey mode - revealed
  if (mode === 'journey' && isRevealed) {
    return (
      <div style={styles.overlay} onClick={handleOverlayClick}>
        <div style={styles.modal}>
          <div style={styles.journeyContent as React.CSSProperties}>
            <div style={styles.journeyIcon}>{station.icon}</div>
            <h2 style={styles.journeyTitle}>{station.title}</h2>
            <div style={styles.journeyText}>{station.content}</div>

            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>
              Wie gut wusstest du das?
            </p>

            <div style={styles.ratingButtons}>
              <button
                style={styles.ratingButton('mastered')}
                onClick={() => onRate?.('mastered')}
              >
                <span style={styles.ratingEmoji}>{STATUS_EMOJIS.mastered}</span>
                <span>{STATUS_LABELS.mastered}</span>
              </button>
              <button
                style={styles.ratingButton('almost')}
                onClick={() => onRate?.('almost')}
              >
                <span style={styles.ratingEmoji}>{STATUS_EMOJIS.almost}</span>
                <span>{STATUS_LABELS.almost}</span>
              </button>
              <button
                style={styles.ratingButton('needs_practice')}
                onClick={() => onRate?.('needs_practice')}
              >
                <span style={styles.ratingEmoji}>{STATUS_EMOJIS.needs_practice}</span>
                <span>{STATUS_LABELS.needs_practice}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // View mode
  if (mode === 'view') {
    return (
      <div style={styles.overlay} onClick={handleOverlayClick}>
        <div style={styles.modal}>
          <div style={styles.header}>
            <div style={styles.iconContainer}>{station.icon}</div>
            <div style={styles.headerText}>
              <h2 style={styles.title}>{station.title}</h2>
              <p style={styles.subtitle}>{artifactConfig.name}</p>
            </div>
            <button style={styles.closeButton} onClick={onClose}>✕</button>
          </div>

          <div style={styles.content}>
            <div style={styles.section}>
              <span style={styles.label}>Inhalt</span>
              <p style={styles.text}>{station.content}</p>
            </div>

            {station.hint && (
              <div style={styles.section}>
                <span style={styles.label}>Hinweis</span>
                <p style={styles.text}>{station.hint}</p>
              </div>
            )}

            <div style={styles.section}>
              <span style={styles.label}>Status</span>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={styles.statusBadge(station.recallStatus)}>
                  {station.recallStatus 
                    ? `${STATUS_EMOJIS[station.recallStatus]} ${STATUS_LABELS[station.recallStatus]}`
                    : '⚪ Noch nicht geübt'}
                </span>
              </div>
            </div>

            <div style={styles.metaInfo as React.CSSProperties}>
              <span style={styles.metaItem}>
                🔄 {station.reviewCount} Wiederholungen
              </span>
              {station.lastReviewedAt && (
                <span style={styles.metaItem}>
                  📅 Zuletzt: {formatRelativeDate(station.lastReviewedAt)}
                </span>
              )}
            </div>
          </div>

          <div style={styles.footer}>
            <button style={styles.button('secondary')} onClick={onClose}>
              Schließen
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Edit mode
  return (
    <div style={styles.overlay} onClick={handleOverlayClick}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div style={styles.iconContainer}>{editIcon || '📝'}</div>
          <div style={styles.headerText}>
            <h2 style={styles.title}>Station bearbeiten</h2>
            <p style={styles.subtitle}>{artifactConfig.name}</p>
          </div>
          <button style={styles.closeButton} onClick={onClose}>✕</button>
        </div>

        <div style={styles.content}>
          {/* Icon */}
          <div style={styles.section}>
            <span style={styles.label}>Icon</span>
            <div style={styles.iconInput}>
              <input
                type="text"
                style={styles.iconField as React.CSSProperties}
                value={editIcon}
                onChange={e => setEditIcon(e.target.value)}
                maxLength={2}
              />
              <div style={styles.iconSuggestions as React.CSSProperties}>
                {iconSuggestions.slice(0, 8).map(icon => (
                  <button
                    key={icon}
                    style={styles.iconSuggestion}
                    onClick={() => setEditIcon(icon)}
                    type="button"
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Title */}
          <div style={styles.section}>
            <VoiceTextInput
              value={editTitle}
              onChange={setEditTitle}
              placeholder="z.B. Satz des Pythagoras"
              label="Titel *"
              showHint={false}
              style={voiceInputStyle}
            />
          </div>

          {/* Content */}
          <div style={styles.section}>
            <VoiceTextInput
              value={editContent}
              onChange={setEditContent}
              placeholder="Der Lerninhalt, den du dir merken möchtest..."
              label="Inhalt *"
              multiline
              rows={4}
              showHint
              style={voiceTextareaStyle}
            />
          </div>

          {/* Hint */}
          <div style={styles.section}>
            <VoiceTextInput
              value={editHint}
              onChange={setEditHint}
              placeholder="Eine kleine Gedächtnisstütze..."
              label="Hinweis (optional)"
              showHint={false}
              style={voiceInputStyle}
            />
          </div>

          {/* Status (read-only) */}
          <div style={styles.section}>
            <span style={styles.label}>Aktueller Status</span>
            <span style={styles.statusBadge(station.recallStatus)}>
              {station.recallStatus 
                ? `${STATUS_EMOJIS[station.recallStatus]} ${STATUS_LABELS[station.recallStatus]}`
                : '⚪ Noch nicht geübt'}
            </span>
          </div>

          {/* Delete */}
          <div style={styles.deleteSection}>
            <button 
              style={styles.deleteButton} 
              onClick={handleDelete}
            >
              <span>🗑️</span>
              <span>{confirmDelete ? 'Wirklich löschen?' : 'Station löschen'}</span>
            </button>
          </div>
        </div>

        <div style={styles.footer}>
          <button style={styles.button('secondary')} onClick={onClose}>
            Abbrechen
          </button>
          <button 
            style={{
              ...styles.button('primary'),
              opacity: isValid ? 1 : 0.5,
              cursor: isValid ? 'pointer' : 'not-allowed',
            }} 
            onClick={handleSave}
            disabled={!isValid}
          >
            <span>💾</span>
            <span>Speichern</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StationModal;
