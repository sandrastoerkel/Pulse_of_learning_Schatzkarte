// ============================================
// Lerntechniken-Übersicht Komponente
// Persönliches Dokument mit allen 7 Techniken
// Für Grundschule (8-10 Jahre)
// ============================================

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LerntechnikenUebersichtProps,
  PowertechnikenProgress,
  TechniqueData,
  TechniqueKey,
  TECHNIQUES_DATA,
} from './powertechnikenTypes';
import '../styles/powertechniken-challenge.css';

// ============================================
// HAUPT-KOMPONENTE
// ============================================

export function LerntechnikenUebersicht({
  progress,
  techniques = TECHNIQUES_DATA,
  onClose,
  onGoToChallenge,
}: LerntechnikenUebersichtProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview');
  const [selectedTechnique, setSelectedTechnique] = useState<TechniqueKey | null>(null);
  const overviewRef = useRef<HTMLDivElement>(null);

  const completedCount = progress.completedTechniques.length;
  const progressPercent = (completedCount / 7) * 100;

  // Zur Challenge navigieren
  const handleGoToChallenge = () => {
    onGoToChallenge?.();
    onClose();
  };

  return (
    <div className="lerntechniken-uebersicht">
      {/* Header */}
      <div className="uebersicht-header">
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>
        <h1 className="uebersicht-title">
          <span className="title-icon">📋</span>
          Meine Lerntechniken-Übersicht
        </h1>
      </div>

      {/* Fortschrittsanzeige */}
      <div className="progress-summary">
        <div className="progress-circle">
          <svg viewBox="0 0 100 100" className="progress-svg">
            <circle
              className="progress-bg"
              cx="50"
              cy="50"
              r="45"
              fill="none"
              strokeWidth="8"
            />
            <motion.circle
              className="progress-fill"
              cx="50"
              cy="50"
              r="45"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              initial={{ strokeDasharray: '0, 283' }}
              animate={{ strokeDasharray: `${progressPercent * 2.83}, 283` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <div className="progress-text">
            <span className="progress-number">{completedCount}</span>
            <span className="progress-label">von 7</span>
          </div>
        </div>
        <div className="progress-status">
          {completedCount === 7 ? (
            <span className="status-complete">🎉 Alle Techniken entdeckt!</span>
          ) : (
            <span className="status-progress">
              Noch {7 - completedCount} Techniken zu entdecken!
            </span>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Übersicht
        </button>
        <button
          className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          📖 Details
        </button>
      </div>

      {/* Content */}
      <div className="uebersicht-content" ref={overviewRef}>
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="overview-grid"
            >
              {techniques.map((technique, index) => {
                const isCompleted = progress.completedTechniques.includes(technique.key);
                const application = progress.applications[technique.key];

                return (
                  <motion.div
                    key={technique.key}
                    className={`technique-summary-card ${isCompleted ? 'completed' : 'pending'}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => {
                      setSelectedTechnique(technique.key);
                      setActiveTab('details');
                    }}
                    style={{ '--technique-color': technique.color } as React.CSSProperties}
                  >
                    <div className="card-header">
                      <span className="technique-icon">{technique.icon}</span>
                      <span className="technique-number">#{technique.order}</span>
                      {isCompleted && (
                        <span className="completed-check">✓</span>
                      )}
                    </div>

                    <h3 className="technique-name">{technique.name}</h3>

                    <p className="technique-short">
                      {technique.kurzanleitung.substring(0, 60)}...
                    </p>

                    <div className="card-footer">
                      {isCompleted ? (
                        <span className="status-badge done">✅ Entdeckt</span>
                      ) : (
                        <span className="status-badge open">⏳ Offen</span>
                      )}
                    </div>

                    {application && (
                      <div className="application-preview">
                        <span className="app-label">Anwenden bei:</span>
                        <span className="app-text">{application}</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {activeTab === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="details-view"
            >
              {selectedTechnique ? (
                <TechniqueDetailCard
                  technique={techniques.find((t) => t.key === selectedTechnique)!}
                  progress={progress}
                  onBack={() => setSelectedTechnique(null)}
                />
              ) : (
                <div className="details-list">
                  {techniques.map((technique) => (
                    <TechniqueListItem
                      key={technique.key}
                      technique={technique}
                      progress={progress}
                      onClick={() => setSelectedTechnique(technique.key)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Zur Challenge Button */}
      <div className="uebersicht-actions">
        <button className="challenge-link-btn" onClick={handleGoToChallenge}>
          <span className="btn-icon">🏝️</span>
          <span className="btn-text">Zur Insel der 7 Werkzeuge</span>
        </button>
      </div>
    </div>
  );
}

// ============================================
// TECHNIK-DETAIL-KARTE
// ============================================

interface TechniqueDetailCardProps {
  technique: TechniqueData;
  progress: PowertechnikenProgress;
  onBack: () => void;
}

function TechniqueDetailCard({ technique, progress, onBack }: TechniqueDetailCardProps) {
  const isCompleted = progress.completedTechniques.includes(technique.key);
  const application = progress.applications[technique.key];

  return (
    <motion.div
      className="technique-detail-card"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ '--technique-color': technique.color } as React.CSSProperties}
    >
      <button className="back-btn" onClick={onBack}>
        ← Alle Techniken
      </button>

      <div className="detail-header">
        <span className="detail-icon">{technique.icon}</span>
        <div className="detail-info">
          <h2 className="detail-name">{technique.name}</h2>
          <span className="detail-number">Technik #{technique.order}</span>
        </div>
        {isCompleted && (
          <span className="detail-badge">✅ Entdeckt</span>
        )}
      </div>

      <div className="detail-sections">
        {/* Kurzanleitung */}
        <div className="detail-section">
          <h4 className="section-title">
            <span className="section-icon">📋</span>
            So geht's:
          </h4>
          <p className="section-content">{technique.kurzanleitung}</p>
        </div>

        {/* Ideal für */}
        <div className="detail-section">
          <h4 className="section-title">
            <span className="section-icon">🎯</span>
            Ideal für:
          </h4>
          <div className="ideal-tags">
            {technique.idealFuer.map((item, i) => (
              <span key={i} className="ideal-tag">{item}</span>
            ))}
          </div>
        </div>

        {/* Anwendung (wenn ausgefüllt) */}
        {application && (
          <div className="detail-section application-section">
            <h4 className="section-title">
              <span className="section-icon">✏️</span>
              Ich nutze es für:
            </h4>
            <div className="application-box">
              <p className="application-text">{application}</p>
            </div>
          </div>
        )}

        {/* Fun Fact */}
        <div className="detail-section funfact-section">
          <h4 className="section-title">
            <span className="section-icon">🤓</span>
            Wusstest du?
          </h4>
          <p className="funfact-text">{technique.funFact}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// TECHNIK-LISTEN-EINTRAG
// ============================================

interface TechniqueListItemProps {
  technique: TechniqueData;
  progress: PowertechnikenProgress;
  onClick: () => void;
}

function TechniqueListItem({ technique, progress, onClick }: TechniqueListItemProps) {
  const isCompleted = progress.completedTechniques.includes(technique.key);
  const application = progress.applications[technique.key];

  return (
    <motion.button
      className={`technique-list-item ${isCompleted ? 'completed' : 'pending'}`}
      onClick={onClick}
      whileHover={{ x: 5 }}
      style={{ '--technique-color': technique.color } as React.CSSProperties}
    >
      <div className="list-item-left">
        <span className="item-icon">{technique.icon}</span>
        <div className="item-info">
          <span className="item-name">{technique.name}</span>
          <span className="item-short">
            {technique.kurzanleitung.substring(0, 40)}...
          </span>
        </div>
      </div>

      <div className="list-item-right">
        {isCompleted ? (
          <span className="item-status done">✓</span>
        ) : (
          <span className="item-status open">○</span>
        )}
        <span className="item-arrow">→</span>
      </div>

      {application && (
        <div className="item-application">
          <span className="app-icon">📝</span>
          <span className="app-text">{application}</span>
        </div>
      )}
    </motion.button>
  );
}

// ============================================
// MODAL-WRAPPER (für Einbindung in WorldMap)
// ============================================

interface UebersichtModalProps {
  isOpen: boolean;
  progress: PowertechnikenProgress;
  onClose: () => void;
  onGoToChallenge?: () => void;
  activeTab?: 'uebersicht' | 'zertifikat';
}

export function UebersichtModal({
  isOpen,
  progress,
  onClose,
  onGoToChallenge,
  activeTab = 'uebersicht',
}: UebersichtModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="uebersicht-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="uebersicht-modal-content"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <LerntechnikenUebersicht
            progress={progress}
            techniques={TECHNIQUES_DATA}
            onClose={onClose}
            onGoToChallenge={onGoToChallenge}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================
// BUTTON FÜR WORLDMAP
// ============================================

interface UebersichtButtonProps {
  onClick: () => void;
  completedCount: number;
}

export function UebersichtButton({ onClick, completedCount }: UebersichtButtonProps) {
  return (
    <motion.button
      className="uebersicht-worldmap-btn"
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="btn-icon">📋</span>
      <span className="btn-label">Meine Techniken</span>
      {completedCount > 0 && (
        <span className="btn-badge">{completedCount}/7</span>
      )}
    </motion.button>
  );
}
