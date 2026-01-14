// components/VideoChat/ScreenShareHelper.jsx
// Kindgerechte Screen-Sharing Hilfe-Komponente für die Schatzkarte-App

import React, { useState } from 'react';

/**
 * ScreenShareHelper - Erklärt Kindern (8-10 Jahre) wie sie ihren Bildschirm teilen
 * 
 * Features:
 * - Schritt-für-Schritt Anleitung mit Bildern
 * - Geräte-Auswahl (Computer/Tablet)
 * - Tipps vor dem Teilen
 * - Hilfe bei Problemen
 */

const ScreenShareHelper = ({ 
  onStartShare, 
  onStopShare,
  isSharing = false,
  sharingParticipant = null,  // Name des aktuell Teilenden
  userRole = 'kind'
}) => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDevice, setSelectedDevice] = useState(null);

  // Tutorial-Schritte
  const tutorialSteps = [
    {
      id: 'prepare',
      title: '1. Vorbereiten',
      icon: '🎯',
      content: (
        <div className="step-content">
          <p className="step-text">
            <strong>Bevor du teilst:</strong> Öffne das Fenster oder die App, 
            die du zeigen möchtest.
          </p>
          <div className="example-box">
            <span className="example-icon">💡</span>
            <p>
              Zum Beispiel: Dein Lerntagebuch, die Schatzkarte-App 
              oder eine Aufgabe, bei der du Hilfe brauchst.
            </p>
          </div>
          <div className="visual-hint">
            <div className="window-mockup">
              <div className="window-header">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
                <span className="window-title">Meine Schatzkarte</span>
              </div>
              <div className="window-content">
                <span className="content-icon">🗺️</span>
              </div>
            </div>
            <span className="arrow">←</span>
            <p className="hint-text">Das hier möchte ich zeigen!</p>
          </div>
        </div>
      )
    },
    {
      id: 'click-button',
      title: '2. Button klicken',
      icon: '🖱️',
      content: (
        <div className="step-content">
          <p className="step-text">
            Klicke unten auf den <strong>Bildschirm-Button</strong>:
          </p>
          <div className="button-demo">
            <div className="demo-toolbar">
              <span className="toolbar-btn">🎤</span>
              <span className="toolbar-btn">📹</span>
              <span className="toolbar-btn highlight">🖥️</span>
              <span className="toolbar-btn">💬</span>
              <span className="toolbar-btn">✋</span>
            </div>
            <div className="pointer-arrow">↑</div>
            <p className="pointer-text">Dieser hier!</p>
          </div>
        </div>
      )
    },
    {
      id: 'choose-window',
      title: '3. Fenster wählen',
      icon: '🪟',
      content: (
        <div className="step-content">
          <p className="step-text">
            Es öffnet sich ein Menü. Wähle aus, <strong>was</strong> du teilen möchtest:
          </p>
          <div className="share-options">
            <div className="share-option">
              <div className="option-icon">🖥️</div>
              <div className="option-text">
                <strong>Ganzer Bildschirm</strong>
                <p>Alle sehen alles auf deinem Bildschirm</p>
              </div>
            </div>
            <div className="share-option recommended">
              <div className="option-icon">🪟</div>
              <div className="option-text">
                <strong>Ein Fenster</strong>
                <p>Nur eine App oder ein Programm zeigen</p>
                <span className="badge">✨ Empfohlen</span>
              </div>
            </div>
            <div className="share-option">
              <div className="option-icon">📑</div>
              <div className="option-text">
                <strong>Ein Tab</strong>
                <p>Nur ein Browser-Tab zeigen</p>
              </div>
            </div>
          </div>
          <div className="tip-box">
            <span className="tip-icon">💡</span>
            <p><strong>Tipp:</strong> "Ein Fenster" ist am besten - 
            dann sehen die anderen nur das, was du zeigen möchtest!</p>
          </div>
        </div>
      )
    },
    {
      id: 'confirm',
      title: '4. Bestätigen',
      icon: '✅',
      content: (
        <div className="step-content">
          <p className="step-text">
            Klicke auf das Fenster, das du teilen möchtest, 
            und dann auf <strong>"Teilen"</strong> oder <strong>"Freigeben"</strong>.
          </p>
          <div className="confirm-demo">
            <div className="selected-window">
              <div className="window-mini">
                <span>🗺️</span>
              </div>
              <span className="checkmark">✓</span>
            </div>
            <button className="demo-share-btn">Teilen</button>
          </div>
          <div className="success-message">
            <span className="success-icon">🎉</span>
            <p>Geschafft! Jetzt können alle dein Fenster sehen!</p>
          </div>
        </div>
      )
    },
    {
      id: 'stop',
      title: '5. Beenden',
      icon: '🛑',
      content: (
        <div className="step-content">
          <p className="step-text">
            Wenn du fertig bist, klicke wieder auf den <strong>Bildschirm-Button</strong> 
            oder auf <strong>"Freigabe beenden"</strong>.
          </p>
          <div className="stop-demo">
            <div className="sharing-indicator">
              <span className="pulse-dot"></span>
              <span>Du teilst gerade...</span>
            </div>
            <div className="stop-options">
              <button className="stop-btn-demo">
                🛑 Freigabe beenden
              </button>
              <p className="or-text">oder</p>
              <div className="toolbar-btn-stop">🖥️</div>
            </div>
          </div>
        </div>
      )
    }
  ];

  // Navigation
  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const closeTutorial = () => {
    setShowTutorial(false);
    setCurrentStep(0);
  };

  // Wenn jemand anderes gerade teilt
  if (sharingParticipant && !isSharing) {
    return (
      <div className="screen-share-helper viewing">
        <div className="viewing-indicator">
          <span className="screen-icon">🖥️</span>
          <p><strong>{sharingParticipant}</strong> zeigt gerade den Bildschirm</p>
        </div>
      </div>
    );
  }

  // Aktive Freigabe
  if (isSharing) {
    return (
      <div className="screen-share-helper sharing-active">
        <div className="active-share-banner">
          <div className="banner-left">
            <span className="pulse-dot"></span>
            <span className="banner-text">
              <strong>Du zeigst deinen Bildschirm</strong>
              <small>Alle können sehen, was du zeigst</small>
            </span>
          </div>
          <button 
            className="stop-share-btn"
            onClick={onStopShare}
          >
            🛑 Beenden
          </button>
        </div>
        
        <div className="sharing-tips">
          <p>💡 <strong>Erinnerung:</strong></p>
          <ul>
            <li>Zeige nur das, was du teilen möchtest</li>
            <li>Erzähle dazu, was du gerade zeigst</li>
            <li>Klicke auf "Beenden", wenn du fertig bist</li>
          </ul>
        </div>
      </div>
    );
  }

  // Normal-Zustand (nicht teilend)
  return (
    <div className="screen-share-helper">
      {/* Hauptbereich */}
      <div className="share-main">
        <div className="share-header">
          <span className="header-icon">🖥️</span>
          <h3>Bildschirm teilen</h3>
        </div>
        
        <p className="share-description">
          Zeige den anderen deinen Bildschirm - zum Beispiel 
          deine Schatzkarte oder eine Aufgabe.
        </p>

        <div className="share-actions">
          <button 
            className="start-share-btn"
            onClick={onStartShare}
          >
            <span className="btn-icon">🖥️</span>
            <span className="btn-text">Bildschirm teilen</span>
          </button>
          
          <button 
            className="help-btn"
            onClick={() => setShowTutorial(true)}
          >
            <span className="btn-icon">❓</span>
            <span className="btn-text">Wie geht das?</span>
          </button>
        </div>

        {/* Quick-Tipps */}
        <div className="quick-tips">
          <div className="tip">
            <span className="tip-emoji">💡</span>
            <span>Öffne zuerst, was du zeigen willst</span>
          </div>
          <div className="tip">
            <span className="tip-emoji">🪟</span>
            <span>Wähle "Ein Fenster" statt "Ganzer Bildschirm"</span>
          </div>
        </div>
      </div>

      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="tutorial-overlay">
          <div className="tutorial-modal">
            {/* Header */}
            <div className="tutorial-header">
              <h2>🎓 So teilst du deinen Bildschirm</h2>
              <button 
                className="close-btn"
                onClick={closeTutorial}
              >
                ✕
              </button>
            </div>

            {/* Progress */}
            <div className="tutorial-progress">
              {tutorialSteps.map((step, index) => (
                <div 
                  key={step.id}
                  className={`progress-step ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
                >
                  <span className="step-number">{index + 1}</span>
                </div>
              ))}
            </div>

            {/* Content */}
            <div className="tutorial-content">
              <div className="step-header">
                <span className="step-icon">{tutorialSteps[currentStep].icon}</span>
                <h3>{tutorialSteps[currentStep].title}</h3>
              </div>
              {tutorialSteps[currentStep].content}
            </div>

            {/* Navigation */}
            <div className="tutorial-nav">
              <button 
                className="nav-btn prev"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                ← Zurück
              </button>
              
              <span className="step-indicator">
                {currentStep + 1} von {tutorialSteps.length}
              </span>
              
              {currentStep < tutorialSteps.length - 1 ? (
                <button 
                  className="nav-btn next"
                  onClick={nextStep}
                >
                  Weiter →
                </button>
              ) : (
                <button 
                  className="nav-btn finish"
                  onClick={closeTutorial}
                >
                  ✅ Verstanden!
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScreenShareHelper;
