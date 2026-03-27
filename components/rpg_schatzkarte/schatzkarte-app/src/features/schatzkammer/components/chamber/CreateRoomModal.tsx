/**
 * CreateRoomModal Component
 * 
 * Modal zum Erstellen eines neuen Loci-Raums.
 * Enthält Template-Auswahl mit Vorschau, Name, Beschreibung und Farbauswahl.
 */

import React, { useState, useCallback } from 'react';
import type { TemplateId, ColorTag } from '../../types';
import {
  ROOM_TEMPLATES,
  TEMPLATE_IDS,
  DEFAULT_TEMPLATE,
  COLOR_TAGS,
  COLOR_TAG_OPTIONS,
  UI,
  FEEDBACK,
} from '../../constants';

// =============================================================================
// TYPES
// =============================================================================

export interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: {
    name: string;
    description: string;
    templateId: TemplateId;
    subject?: string;
    colorTag: ColorTag;
  }) => void;
}

interface FormState {
  name: string;
  description: string;
  templateId: TemplateId;
  subject: string;
  colorTag: ColorTag;
}

// =============================================================================
// STYLES
// =============================================================================

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.8)',
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
    border: `2px solid ${UI.border}`,
    boxShadow: '0 24px 48px rgba(0, 0, 0, 0.5), 0 0 12px rgba(14, 165, 233, 0.3)',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    animation: 'scaleIn 0.3s ease',
  } as React.CSSProperties,

  header: {
    padding: '24px 24px 0',
    borderBottom: 'none',
  } as React.CSSProperties,

  title: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#fff',
    margin: 0,
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  } as React.CSSProperties,

  subtitle: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.6)',
    margin: 0,
  } as React.CSSProperties,

  content: {
    padding: '24px',
    overflowY: 'auto',
    flex: 1,
  } as React.CSSProperties,

  section: {
    marginBottom: '24px',
  } as React.CSSProperties,

  sectionTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: UI.action,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '12px',
  } as React.CSSProperties,

  templateGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  } as React.CSSProperties,

  templateCard: (isSelected: boolean): React.CSSProperties => ({
    padding: '16px 12px',
    background: isSelected
      ? UI.actionSubtle
      : 'rgba(255, 255, 255, 0.03)',
    border: `2px solid ${isSelected ? UI.action : 'rgba(255, 255, 255, 0.1)'}`,
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'center',
  }),

  templateIcon: {
    fontSize: '32px',
    marginBottom: '8px',
    display: 'block',
  } as React.CSSProperties,

  templateName: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '4px',
  } as React.CSSProperties,

  templateAge: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.5)',
  } as React.CSSProperties,

  templateSlots: {
    fontSize: '11px',
    color: UI.action,
    marginTop: '4px',
  } as React.CSSProperties,

  inputGroup: {
    marginBottom: '16px',
  } as React.CSSProperties,

  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.8)',
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
    transition: 'border-color 0.2s ease',
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
    minHeight: '80px',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  } as React.CSSProperties,

  colorGrid: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  } as React.CSSProperties,

  colorOption: (color: ColorTag, isSelected: boolean): React.CSSProperties => ({
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: COLOR_TAGS[color].bg,
    border: `3px solid ${isSelected ? '#fff' : COLOR_TAGS[color].border}`,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    transform: isSelected ? 'scale(1.1)' : 'scale(1)',
    boxShadow: isSelected ? `0 0 12px ${COLOR_TAGS[color].border}` : 'none',
  }),

  footer: {
    padding: '20px 24px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  } as React.CSSProperties,

  cancelButton: {
    padding: '12px 24px',
    background: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.7)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,

  createButton: (isValid: boolean): React.CSSProperties => ({
    padding: '12px 32px',
    background: isValid ? UI.action : 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: 600,
    color: isValid ? '#fff' : 'rgba(255, 255, 255, 0.4)',
    cursor: isValid ? 'pointer' : 'not-allowed',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }),

  closeButton: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    width: '36px',
    height: '36px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    borderRadius: '50%',
    fontSize: '18px',
    color: 'rgba(255, 255, 255, 0.6)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,

  previewSection: {
    padding: '16px',
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '12px',
    marginTop: '16px',
  } as React.CSSProperties,

  previewTitle: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: '12px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  } as React.CSSProperties,

  previewContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  } as React.CSSProperties,

  previewIcon: (colorTag: ColorTag): React.CSSProperties => ({
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    background: COLOR_TAGS[colorTag].bg,
    border: `1px solid ${COLOR_TAGS[colorTag].border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
  }),

  previewText: {
    flex: 1,
  } as React.CSSProperties,

  previewName: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '2px',
  } as React.CSSProperties,

  previewMeta: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.5)',
  } as React.CSSProperties,
};

// =============================================================================
// HELPER
// =============================================================================

function getAgeGroupLabel(ageGroup: '8-12' | '13-18' | 'all'): string {
  switch (ageGroup) {
    case '8-12': return '8-12 Jahre';
    case '13-18': return '13-18 Jahre';
    case 'all': return 'Alle Altersgruppen';
  }
}

// =============================================================================
// COMPONENT
// =============================================================================

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [form, setForm] = useState<FormState>({
    name: '',
    description: '',
    templateId: DEFAULT_TEMPLATE,
    subject: '',
    colorTag: 'gold',
  });

  const isValid = form.name.trim().length > 0;
  const selectedTemplate = ROOM_TEMPLATES[form.templateId];

  const handleChange = useCallback((
    field: keyof FormState,
    value: string | TemplateId | ColorTag
  ) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(() => {
    if (!isValid) return;

    onCreate({
      name: form.name.trim(),
      description: form.description.trim(),
      templateId: form.templateId,
      subject: form.subject.trim() || undefined,
      colorTag: form.colorTag,
    });

    // Reset form
    setForm({
      name: '',
      description: '',
      templateId: DEFAULT_TEMPLATE,
      subject: '',
      colorTag: 'gold',
    });
  }, [form, isValid, onCreate]);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={handleOverlayClick}>
      <div style={styles.modal} role="dialog" aria-labelledby="modal-title">
        {/* Close button */}
        <button
          style={styles.closeButton}
          onClick={onClose}
          aria-label="Schließen"
        >
          ✕
        </button>

        {/* Header */}
        <div style={styles.header}>
          <h2 id="modal-title" style={styles.title}>
            <span>✨</span>
            <span>Neuer Loci-Raum</span>
          </h2>
          <p style={styles.subtitle}>
            Wähle ein Template und gib deinem Raum einen Namen
          </p>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {/* Template Selection */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Template wählen</h3>
            <div style={styles.templateGrid}>
              {TEMPLATE_IDS.map(id => {
                const template = ROOM_TEMPLATES[id];
                const isSelected = form.templateId === id;
                
                return (
                  <div
                    key={id}
                    style={styles.templateCard(isSelected)}
                    onClick={() => handleChange('templateId', id)}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                  >
                    <span style={styles.templateIcon}>{template.icon}</span>
                    <div style={styles.templateName}>{template.name}</div>
                    <div style={styles.templateAge}>
                      {getAgeGroupLabel(template.ageGroup)}
                    </div>
                    <div style={styles.templateSlots}>
                      {template.slots.length} Plätze
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Name Input */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Details</h3>
            
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="room-name">
                Name *
              </label>
              <input
                id="room-name"
                type="text"
                style={styles.input}
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                placeholder="z.B. Mathe Formeln, Geschichte Epochen..."
                autoFocus
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="room-subject">
                Fach / Thema (optional)
              </label>
              <input
                id="room-subject"
                type="text"
                style={styles.input}
                value={form.subject}
                onChange={e => handleChange('subject', e.target.value)}
                placeholder="z.B. Mathematik, Geschichte, Biologie..."
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="room-description">
                Beschreibung (optional)
              </label>
              <textarea
                id="room-description"
                style={styles.textarea}
                value={form.description}
                onChange={e => handleChange('description', e.target.value)}
                placeholder="Worum geht es in diesem Raum?"
              />
            </div>
          </div>

          {/* Color Selection */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Farbe</h3>
            <div style={styles.colorGrid}>
              {COLOR_TAG_OPTIONS.map(color => (
                <div
                  key={color}
                  style={styles.colorOption(color, form.colorTag === color)}
                  onClick={() => handleChange('colorTag', color)}
                  role="button"
                  tabIndex={0}
                  aria-pressed={form.colorTag === color}
                  aria-label={`Farbe: ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          {form.name && (
            <div style={styles.previewSection}>
              <div style={styles.previewTitle}>Vorschau</div>
              <div style={styles.previewContent}>
                <div style={styles.previewIcon(form.colorTag)}>
                  {selectedTemplate.icon}
                </div>
                <div style={styles.previewText}>
                  <div style={styles.previewName}>{form.name}</div>
                  <div style={styles.previewMeta}>
                    {selectedTemplate.name}
                    {form.subject && ` · ${form.subject}`}
                    {` · ${selectedTemplate.slots.length} Plätze`}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button style={styles.cancelButton} onClick={onClose}>
            Abbrechen
          </button>
          <button
            style={styles.createButton(isValid)}
            onClick={handleSubmit}
            disabled={!isValid}
          >
            <span>🚀</span>
            <span>Raum erstellen</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomModal;
