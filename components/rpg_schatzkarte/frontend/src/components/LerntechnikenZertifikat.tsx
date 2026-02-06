// ============================================
// Lerntechniken-Zertifikat Komponente
// Urkunde "Lerntechniken-Entdecker"
// Für Grundschule (8-10 Jahre)
// ============================================

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import {
  LerntechnikenZertifikatProps,
  TechniqueKey,
  TechniqueData,
  TECHNIQUES_DATA,
} from './powertechnikenTypes';
import '../styles/powertechniken-challenge.css';

// ============================================
// HAUPT-KOMPONENTE
// ============================================

export function LerntechnikenZertifikat({
  studentName,
  top3,
  completionDate,
  onClose,
  onDownload,
  onPrint,
}: LerntechnikenZertifikatProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [showConfetti, setShowConfetti] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  // Download als Bild
  const handleDownload = useCallback(async () => {
    if (!certificateRef.current) return;

    setIsDownloading(true);
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: '#fff8e1',
        useCORS: true,
      });

      const link = document.createElement('a');
      link.download = `Lerntechniken-Zertifikat-${studentName.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      onDownload?.();
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      alert('Beim Speichern ist ein Fehler aufgetreten. Bitte versuche es erneut.');
    }
    setIsDownloading(false);
  }, [onDownload, studentName]);

  // Drucken
  const handlePrint = useCallback(() => {
    onPrint?.();
    window.print();
  }, [onPrint]);

  // Top 3 Techniken auflösen
  const top3Techniques = top3.map(
    (key) => TECHNIQUES_DATA.find((t) => t.key === key)!
  );

  // Datum formatieren
  const formattedDate = new Date(completionDate).toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="zertifikat-container">
      {/* Konfetti Animation */}
      {showConfetti && (
        <CertificateConfetti onComplete={() => setShowConfetti(false)} />
      )}

      {/* Header mit Aktionen */}
      <div className="zertifikat-header">
        <button className="close-btn" onClick={onClose}>
          ← Zurück
        </button>
        <h1 className="header-title">
          <span className="title-icon">🎓</span>
          Dein Zertifikat
        </h1>
      </div>

      {/* Zertifikat-Dokument */}
      <div className="zertifikat-wrapper">
        <motion.div
          ref={certificateRef}
          className="zertifikat-document"
          initial={{ scale: 0.8, opacity: 0, rotateY: -90 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          transition={{ 
            type: 'spring', 
            stiffness: 100, 
            damping: 15,
            delay: 0.3 
          }}
        >
          {/* Goldener Rahmen */}
          <div className="zertifikat-rahmen">
            {/* Eckverzierungen */}
            <div className="ecke ecke-tl">✧</div>
            <div className="ecke ecke-tr">✧</div>
            <div className="ecke ecke-bl">✧</div>
            <div className="ecke ecke-br">✧</div>

            {/* Innerer Rahmen */}
            <div className="zertifikat-inner">
              {/* Siegel */}
              <motion.div
                className="zertifikat-siegel"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.8, type: 'spring' }}
              >
                <div className="siegel-outer">
                  <div className="siegel-inner">
                    <span className="siegel-icon">🏆</span>
                  </div>
                </div>
              </motion.div>

              {/* Titel */}
              <motion.h1
                className="zertifikat-titel"
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                URKUNDE
              </motion.h1>

              {/* Untertitel */}
              <motion.h2
                className="zertifikat-untertitel"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                ✨ Lerntechniken-Entdecker ✨
              </motion.h2>

              {/* Trennlinie */}
              <motion.div
                className="zertifikat-divider"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.7 }}
              />

              {/* Name */}
              <motion.div
                className="zertifikat-name-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <span className="name-label">Dies bestätigt, dass</span>
                <span className="student-name">{studentName}</span>
              </motion.div>

              {/* Leistung */}
              <motion.p
                className="zertifikat-leistung"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                erfolgreich alle <strong>7 Powertechniken</strong> kennengelernt hat
                und nun ein echter <strong>Lernprofi</strong> ist!
              </motion.p>

              {/* Top 3 */}
              <motion.div
                className="zertifikat-top3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                <h3 className="top3-titel">🌟 Meine Top 3 Techniken 🌟</h3>
                <div className="top3-liste">
                  {top3Techniques.map((tech, index) => (
                    <motion.div
                      key={tech.key}
                      className="top3-eintrag"
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 1.2 + index * 0.15 }}
                    >
                      <span className="top3-medaille">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </span>
                      <span className="top3-icon">{tech.icon}</span>
                      <span className="top3-name">{tech.name}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Trennlinie */}
              <motion.div
                className="zertifikat-divider bottom"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.5 }}
              />

              {/* Footer */}
              <motion.div
                className="zertifikat-footer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6 }}
              >
                <div className="footer-datum">
                  <span className="datum-label">Verliehen am</span>
                  <span className="datum-wert">{formattedDate}</span>
                </div>

                <div className="footer-signatur">
                  <div className="signatur-linie">
                    <span className="signatur-icon">✨</span>
                    <span className="signatur-text">Pulse of Learning</span>
                    <span className="signatur-icon">✨</span>
                  </div>
                </div>
              </motion.div>

              {/* Wasserzeichen */}
              <div className="zertifikat-watermark">
                <span className="watermark-text">🧠 LERNPROFI 🧠</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Aktions-Buttons */}
      <motion.div
        className="zertifikat-actions"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8 }}
      >
        <button className="action-btn download-btn" onClick={handleDownload} disabled={isDownloading}>
          <span className="btn-icon">{isDownloading ? '⏳' : '📥'}</span>
          <span className="btn-text">{isDownloading ? 'Speichern...' : 'Als Bild speichern'}</span>
        </button>
        <button className="action-btn print-btn" onClick={handlePrint}>
          <span className="btn-icon">🖨️</span>
          <span className="btn-text">Ausdrucken</span>
        </button>
      </motion.div>

      {/* Motivations-Nachricht */}
      <motion.div
        className="zertifikat-motivation"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <p>
          🎉 <strong>Herzlichen Glückwunsch!</strong> Du hast gezeigt, dass du ein
          echter Lernprofi bist. Nutze diese Techniken und werde noch besser!
        </p>
      </motion.div>
    </div>
  );
}

// ============================================
// KONFETTI ANIMATION
// ============================================

interface ConfettiProps {
  onComplete?: () => void;
}

function CertificateConfetti({ onComplete }: ConfettiProps) {
  const colors = [
    'var(--fb-reward)', // Gold
    '#ffb347', // Orange
    '#ff6961', // Rot
    '#77dd77', // Grün
    '#89cff0', // Blau
    '#ca9bf7', // Lila
  ];

  const confettiPieces = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1.5,
    duration: 3 + Math.random() * 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 720,
    size: 8 + Math.random() * 12,
    type: Math.random() > 0.5 ? 'circle' : 'rect',
  }));

  return (
    <div className="certificate-confetti">
      {confettiPieces.map((piece) => (
        <motion.div
          key={piece.id}
          className={`confetti-piece ${piece.type}`}
          style={{
            left: `${piece.left}%`,
            backgroundColor: piece.color,
            width: piece.size,
            height: piece.type === 'rect' ? piece.size * 0.4 : piece.size,
          }}
          initial={{ y: -50, opacity: 1, rotate: 0 }}
          animate={{
            y: '110vh',
            opacity: [1, 1, 0],
            rotate: piece.rotation,
            x: [0, Math.random() * 100 - 50, Math.random() * 200 - 100],
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: 'linear',
          }}
          onAnimationComplete={() => {
            if (piece.id === confettiPieces.length - 1) {
              onComplete?.();
            }
          }}
        />
      ))}
    </div>
  );
}

// ============================================
// STANDALONE ZERTIFIKAT-ANSICHT
// ============================================

interface ZertifikatStandaloneProps {
  progress: {
    completedTechniques: TechniqueKey[];
    top3?: TechniqueKey[];
  };
  onClose: () => void;
}

export function ZertifikatStandalone({ progress, onClose }: ZertifikatStandaloneProps) {
  const [step, setStep] = useState<'name' | 'top3' | 'certificate'>('name');
  const [studentName, setStudentName] = useState('');
  const [selectedTop3, setSelectedTop3] = useState<TechniqueKey[]>(progress.top3 || []);

  const isAllComplete = progress.completedTechniques.length === 7;

  if (!isAllComplete) {
    return (
      <div className="zertifikat-locked">
        <div className="locked-icon">🔒</div>
        <h2>Zertifikat noch gesperrt</h2>
        <p>
          Du musst erst alle 7 Techniken entdecken, um dein Zertifikat zu erhalten!
        </p>
        <div className="progress-hint">
          <span className="progress-number">{progress.completedTechniques.length}/7</span>
          <span className="progress-text">Techniken entdeckt</span>
        </div>
        <button className="back-btn" onClick={onClose}>
          ← Zurück zur Übersicht
        </button>
      </div>
    );
  }

  const toggleTop3 = (key: TechniqueKey) => {
    if (selectedTop3.includes(key)) {
      setSelectedTop3(selectedTop3.filter((k) => k !== key));
    } else if (selectedTop3.length < 3) {
      setSelectedTop3([...selectedTop3, key]);
    }
  };

  return (
    <div className="zertifikat-standalone">
      <AnimatePresence mode="wait">
        {step === 'name' && (
          <motion.div
            key="name"
            className="setup-step"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
          >
            <button className="close-btn" onClick={onClose}>✕</button>
            
            <div className="step-icon">🎓</div>
            <h2>Dein Name auf dem Zertifikat</h2>
            <p>Schreibe deinen Namen so, wie er auf der Urkunde stehen soll:</p>
            
            <input
              type="text"
              className="name-input"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Dein Name..."
              autoFocus
            />

            <button
              className="next-btn"
              onClick={() => setStep('top3')}
              disabled={!studentName.trim()}
            >
              Weiter →
            </button>
          </motion.div>
        )}

        {step === 'top3' && (
          <motion.div
            key="top3"
            className="setup-step"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
          >
            <button className="back-btn" onClick={() => setStep('name')}>
              ← Zurück
            </button>

            <div className="step-icon">🏆</div>
            <h2>Wähle deine Top 3</h2>
            <p>Welche Techniken haben dir am besten gefallen?</p>

            <div className="top3-selector">
              {TECHNIQUES_DATA.map((tech) => (
                <button
                  key={tech.key}
                  className={`selector-btn ${
                    selectedTop3.includes(tech.key) ? 'selected' : ''
                  }`}
                  onClick={() => toggleTop3(tech.key)}
                  style={{ '--technique-color': tech.color } as React.CSSProperties}
                >
                  <span className="tech-icon">{tech.icon}</span>
                  <span className="tech-name">{tech.name}</span>
                  {selectedTop3.includes(tech.key) && (
                    <span className="selection-badge">
                      #{selectedTop3.indexOf(tech.key) + 1}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <p className="selection-count">
              {selectedTop3.length}/3 ausgewählt
            </p>

            <button
              className="next-btn"
              onClick={() => setStep('certificate')}
              disabled={selectedTop3.length !== 3}
            >
              Zertifikat erstellen! 🎉
            </button>
          </motion.div>
        )}

        {step === 'certificate' && (
          <motion.div
            key="certificate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LerntechnikenZertifikat
              studentName={studentName}
              top3={selectedTop3}
              completionDate={new Date().toISOString()}
              onClose={onClose}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// MINI-ZERTIFIKAT-BADGE (für WorldMap)
// ============================================

interface ZertifikatBadgeProps {
  isEarned: boolean;
  onClick?: () => void;
}

export function ZertifikatBadge({ isEarned, onClick }: ZertifikatBadgeProps) {
  return (
    <motion.button
      className={`zertifikat-badge ${isEarned ? 'earned' : 'locked'}`}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="badge-icon">{isEarned ? '🎓' : '🔒'}</span>
      <span className="badge-label">
        {isEarned ? 'Zertifikat' : 'Noch 7 Techniken'}
      </span>
      {isEarned && (
        <motion.div
          className="earned-glow"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      )}
    </motion.button>
  );
}
