/**
 * AddStationModal Component
 * 
 * Modal zum Erstellen einer neuen Lernstation.
 * Schritt 1: Artefakt-Typ wählen
 * Schritt 2: Details eingeben (Icon, Titel, Inhalt, Hinweis)
 */

import React, { useState, useCallback } from 'react';
import type { ArtifactType, CreateStation } from '../../types';
import {
  ARTIFACT_CONFIGS,
  ARTIFACT_TYPES,
  ARTIFACT_ICON_SUGGESTIONS,
  DEFAULT_ARTIFACT_TYPE,
  GOLD,
  DARK
} from '../../constants';
import { VoiceTextInput } from '../../../../components/VoiceTextInput';

// =============================================================================
// TYPES
// =============================================================================

export interface AddStationModalProps {
  isOpen: boolean;
  slotLabel?: string;
  onClose: () => void;
  onCreate: (data: Omit<CreateStation, 'roomId' | 'slotId'>) => void;
}

type Step = 'type' | 'details';

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
    background: `linear-gradient(145deg, ${DARK.elevated} 0%, ${DARK.base} 100%)`,
    borderRadius: '20px',
    border: `2px solid ${GOLD.dark}`,
    boxShadow: `0 24px 48px rgba(0, 0, 0, 0.5), ${GOLD.glow}`,
    width: '100%',
    maxWidth: '520px',
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  } as React.CSSProperties,

  header: {
    padding: '24px 24px 0',
  } as React.CSSProperties,

  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
  } as React.CSSProperties,

  title: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#fff',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
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
  } as React.CSSProperties,

  subtitle: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.6)',
    margin: 0,
  } as React.CSSProperties,

  stepIndicator: {
    display: 'flex',
    gap: '8px',
    padding: '16px 24px',
  } as React.CSSProperties,

  stepDot: (isActive: boolean, isComplete: boolean): React.CSSProperties => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: isActive || isComplete ? GOLD.primary : 'rgba(255, 255, 255, 0.2)',
    transition: 'all 0.2s ease',
  }),

  content: {
    padding: '0 24px 24px',
    overflowY: 'auto',
    flex: 1,
  } as React.CSSProperties,

  // Step 1: Type selection
  typeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  } as React.CSSProperties,

  typeCard: (isSelected: boolean): React.CSSProperties => ({
    padding: '16px',
    background: isSelected ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 255, 255, 0.03)',
    border: `2px solid ${isSelected ? GOLD.primary : 'rgba(255, 255, 255, 0.1)'}`,
    borderRadius: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left',
  }),

  typeIcon: {
    fontSize: '28px',
    marginBottom: '10px',
  } as React.CSSProperties,

  typeName: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '4px',
  } as React.CSSProperties,

  typeDesc: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.5)',
    lineHeight: 1.4,
  } as React.CSSProperties,

  // Step 2: Details
  section: {
    marginBottom: '20px',
  } as React.CSSProperties,

  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: GOLD.primary,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '8px',
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
    minHeight: '120px',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  } as React.CSSProperties,

  iconInput: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  } as React.CSSProperties,

  iconField: {
    width: '64px',
    height: '52px',
    padding: '0',
    background: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    fontSize: '28px',
    color: '#fff',
    textAlign: 'center',
    outline: 'none',
  } as React.CSSProperties,

  iconSuggestions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    flex: 1,
  } as React.CSSProperties,

  iconSuggestion: (isSelected: boolean): React.CSSProperties => ({
    width: '40px',
    height: '40px',
    background: isSelected ? 'rgba(255, 215, 0, 0.15)' : 'rgba(255, 255, 255, 0.05)',
    border: `1px solid ${isSelected ? GOLD.primary : 'rgba(255, 255, 255, 0.1)'}`,
    borderRadius: '8px',
    fontSize: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  }),

  selectedTypePreview: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: 'rgba(255, 215, 0, 0.1)',
    border: `1px solid ${GOLD.dark}`,
    borderRadius: '12px',
    marginBottom: '20px',
  } as React.CSSProperties,

  previewIcon: {
    fontSize: '24px',
  } as React.CSSProperties,

  previewText: {
    flex: 1,
  } as React.CSSProperties,

  previewName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#fff',
  } as React.CSSProperties,

  previewUse: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.5)',
  } as React.CSSProperties,

  changeTypeButton: {
    padding: '6px 12px',
    background: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '6px',
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.6)',
    cursor: 'pointer',
  } as React.CSSProperties,

  footer: {
    padding: '16px 24px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  } as React.CSSProperties,

  button: (variant: 'primary' | 'secondary', disabled?: boolean): React.CSSProperties => ({
    padding: '12px 24px',
    background: variant === 'primary' 
      ? disabled ? 'rgba(255, 255, 255, 0.1)' : GOLD.gradient
      : 'transparent',
    border: variant === 'secondary' ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600,
    color: variant === 'primary' 
      ? disabled ? 'rgba(255, 255, 255, 0.4)' : DARK.deepest
      : 'rgba(255, 255, 255, 0.8)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
  }),

  slotInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '10px',
    marginBottom: '20px',
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.6)',
  } as React.CSSProperties,
};

// =============================================================================
// COMPONENT
// =============================================================================

export const AddStationModal: React.FC<AddStationModalProps> = ({
  isOpen,
  slotLabel,
  onClose,
  onCreate,
}) => {
  const [step, setStep] = useState<Step>('type');
  const [artifactType, setArtifactType] = useState<ArtifactType>(DEFAULT_ARTIFACT_TYPE);
  const [icon, setIcon] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hint, setHint] = useState('');

  const selectedConfig = ARTIFACT_CONFIGS[artifactType];
  const iconSuggestions = ARTIFACT_ICON_SUGGESTIONS[artifactType];
  const isValid = title.trim().length > 0 && content.trim().length > 0;

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

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setStep('type');
      setArtifactType(DEFAULT_ARTIFACT_TYPE);
      setIcon('');
      setTitle('');
      setContent('');
      setHint('');
    }
  }, [isOpen]);

  // Set default icon when type changes
  React.useEffect(() => {
    if (!icon) {
      setIcon(ARTIFACT_CONFIGS[artifactType].defaultIcon);
    }
  }, [artifactType, icon]);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const handleTypeSelect = useCallback((type: ArtifactType) => {
    setArtifactType(type);
    setIcon(ARTIFACT_CONFIGS[type].defaultIcon);
  }, []);

  const handleNext = useCallback(() => {
    setStep('details');
  }, []);

  const handleBack = useCallback(() => {
    setStep('type');
  }, []);

  const handleCreate = useCallback(() => {
    if (!isValid) return;

    onCreate({
      artifactType,
      icon: icon || selectedConfig.defaultIcon,
      title: title.trim(),
      content: content.trim(),
      hint: hint.trim(),
    });

    onClose();
  }, [isValid, artifactType, icon, title, content, hint, selectedConfig, onCreate, onClose]);

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={handleOverlayClick}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerRow}>
            <h2 style={styles.title}>
              <span>✨</span>
              <span>Neue Station</span>
            </h2>
            <button style={styles.closeButton} onClick={onClose}>✕</button>
          </div>
          <p style={styles.subtitle}>
            {step === 'type' 
              ? 'Wähle einen Artefakt-Typ für deine Station'
              : 'Fülle die Details aus'}
          </p>
        </div>

        {/* Step indicator */}
        <div style={styles.stepIndicator}>
          <div style={styles.stepDot(step === 'type', step === 'details')} />
          <div style={styles.stepDot(step === 'details', false)} />
        </div>

        {/* Content */}
        <div style={styles.content}>
          {/* Slot info */}
          {slotLabel && (
            <div style={styles.slotInfo}>
              <span>📍</span>
              <span>Platz: <strong style={{ color: '#fff' }}>{slotLabel}</strong></span>
            </div>
          )}

          {/* Step 1: Type selection */}
          {step === 'type' && (
            <div style={styles.typeGrid}>
              {ARTIFACT_TYPES.map(type => {
                const config = ARTIFACT_CONFIGS[type];
                const isSelected = artifactType === type;

                return (
                  <div
                    key={type}
                    style={styles.typeCard(isSelected)}
                    onClick={() => handleTypeSelect(type)}
                    role="button"
                    tabIndex={0}
                  >
                    <div style={styles.typeIcon}>{config.icon}</div>
                    <div style={styles.typeName}>{config.name}</div>
                    <div style={styles.typeDesc}>{config.description}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Step 2: Details */}
          {step === 'details' && (
            <>
              {/* Selected type preview */}
              <div style={styles.selectedTypePreview}>
                <span style={styles.previewIcon}>{selectedConfig.icon}</span>
                <div style={styles.previewText}>
                  <div style={styles.previewName}>{selectedConfig.name}</div>
                  <div style={styles.previewUse}>{selectedConfig.useCase}</div>
                </div>
                <button style={styles.changeTypeButton} onClick={handleBack}>
                  Ändern
                </button>
              </div>

              {/* Icon */}
              <div style={styles.section}>
                <span style={styles.label}>Icon</span>
                <div style={styles.iconInput}>
                  <input
                    type="text"
                    style={styles.iconField as React.CSSProperties}
                    value={icon}
                    onChange={e => setIcon(e.target.value)}
                    maxLength={2}
                  />
                  <div style={styles.iconSuggestions as React.CSSProperties}>
                    {iconSuggestions.map(suggestion => (
                      <button
                        key={suggestion}
                        style={styles.iconSuggestion(icon === suggestion)}
                        onClick={() => setIcon(suggestion)}
                        type="button"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Title */}
              <div style={styles.section}>
                <VoiceTextInput
                  value={title}
                  onChange={setTitle}
                  placeholder="z.B. Satz des Pythagoras"
                  label="Titel *"
                  autoFocus
                  showHint={false}
                  style={voiceInputStyle}
                />
              </div>

              {/* Content */}
              <div style={styles.section}>
                <VoiceTextInput
                  value={content}
                  onChange={setContent}
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
                  value={hint}
                  onChange={setHint}
                  placeholder="Eine kleine Gedächtnisstütze für den Rundgang..."
                  label="Hinweis (optional)"
                  showHint={false}
                  style={voiceInputStyle}
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          {step === 'type' ? (
            <>
              <button style={styles.button('secondary')} onClick={onClose}>
                Abbrechen
              </button>
              <button style={styles.button('primary')} onClick={handleNext}>
                <span>Weiter</span>
                <span>→</span>
              </button>
            </>
          ) : (
            <>
              <button style={styles.button('secondary')} onClick={handleBack}>
                <span>←</span>
                <span>Zurück</span>
              </button>
              <button 
                style={styles.button('primary', !isValid)} 
                onClick={handleCreate}
                disabled={!isValid}
              >
                <span>✨</span>
                <span>Hinzufügen</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddStationModal;
