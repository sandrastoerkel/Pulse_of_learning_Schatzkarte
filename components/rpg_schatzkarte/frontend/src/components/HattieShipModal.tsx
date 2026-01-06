// ============================================
// RPG Schatzkarte - Hattie Ship Modal
// Die Selbsteinschaetzungs-Challenge
// ============================================
import { useState } from 'react';
import { HATTIE_CHALLENGE_INFO, HATTIE_SUBJECTS, HATTIE_SCIENCE } from '../content/hattieContent';

interface HattieShipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEntrySubmit: (entry: HattieEntry, xp: number) => void;
}

interface HattieEntry {
  subject: string;
  task: string;
  prediction: number;
  result?: number;
  reflection?: string;
}

type Step = 'intro' | 'subject' | 'task' | 'prediction' | 'result' | 'reflection' | 'complete';

export function HattieShipModal({
  isOpen,
  onClose,
  onEntrySubmit
}: HattieShipModalProps) {
  const [step, setStep] = useState<Step>('intro');
  const [entry, setEntry] = useState<HattieEntry>({
    subject: '',
    task: '',
    prediction: 0
  });
  const [showScience, setShowScience] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);

  if (!isOpen) return null;

  const handleSubjectSelect = (subjectId: string) => {
    setEntry({ ...entry, subject: subjectId });
    setStep('task');
  };

  const handleTaskSubmit = () => {
    if (entry.task.trim().length >= 5) {
      setStep('prediction');
    }
  };

  const handlePredictionSubmit = () => {
    setStep('result');
  };

  const handleResultSubmit = () => {
    setStep('reflection');
  };

  const handleComplete = () => {
    let xp = HATTIE_CHALLENGE_INFO.xp.entry;

    // Bonus wenn Ergebnis besser als Erwartung
    if (entry.result && entry.result > entry.prediction) {
      xp += HATTIE_CHALLENGE_INFO.xp.exceeded;
    }

    setEarnedXp(xp);
    setStep('complete');
    onEntrySubmit(entry, xp);

    // Nach 3 Sekunden Modal schliessen
    setTimeout(() => {
      setStep('intro');
      setEntry({ subject: '', task: '', prediction: 0 });
    }, 3000);
  };

  const exceeded = entry.result && entry.result > entry.prediction;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="ship-modal hattie" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="ship-modal-header">
          <h2>
            <span>🚢</span>
            {HATTIE_CHALLENGE_INFO.title}
          </h2>
          <p>{HATTIE_CHALLENGE_INFO.subtitle}</p>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="ship-modal-body">
          {/* Intro */}
          {step === 'intro' && (
            <div className="hattie-intro">
              <div
                className="hattie-description"
                style={{
                  color: 'var(--text-light)',
                  marginBottom: '20px',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-line'
                }}
                dangerouslySetInnerHTML={{
                  __html: HATTIE_CHALLENGE_INFO.description
                    .replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--gold)">$1</strong>')
                }}
              />

              {/* Die 5 Schritte */}
              <div className="hattie-steps">
                {HATTIE_CHALLENGE_INFO.steps.map(s => (
                  <div key={s.step} className="hattie-step">
                    <div className="hattie-step-icon">{s.icon}</div>
                    <div className="hattie-step-content">
                      <h4>{s.step}. {s.title}</h4>
                      <p>{s.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                className="submit-entry-btn"
                onClick={() => setStep('subject')}
                style={{ marginTop: '20px' }}
              >
                🎯 Challenge starten!
              </button>

              <button
                className="back-btn"
                onClick={() => setShowScience(!showScience)}
                style={{ marginTop: '10px', width: '100%' }}
              >
                {showScience ? '📚 Weniger anzeigen' : '📚 Die Forschung dahinter'}
              </button>

              {showScience && (
                <div
                  className="entry-form"
                  style={{ marginTop: '15px' }}
                  dangerouslySetInnerHTML={{
                    __html: HATTIE_SCIENCE.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--gold)">$1</strong>')
                      .replace(/\n\n/g, '<br/><br/>')
                      .replace(/\|/g, ' ')
                  }}
                />
              )}
            </div>
          )}

          {/* Schritt 1: Fach waehlen */}
          {step === 'subject' && (
            <div className="hattie-subject-select">
              <h3 style={{ color: 'var(--gold)', marginBottom: '15px' }}>
                📚 Waehle ein Fach
              </h3>
              <div className="bandura-sources" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {HATTIE_SUBJECTS.map(subject => (
                  <div
                    key={subject.id}
                    className="bandura-source-card"
                    onClick={() => handleSubjectSelect(subject.id)}
                  >
                    <div className="bandura-source-icon">{subject.icon}</div>
                    <div className="bandura-source-name">{subject.name}</div>
                  </div>
                ))}
              </div>
              <button className="back-btn" onClick={() => setStep('intro')} style={{ marginTop: '20px' }}>
                ← Zurueck
              </button>
            </div>
          )}

          {/* Schritt 2: Aufgabe beschreiben */}
          {step === 'task' && (
            <div className="hattie-task-input">
              <h3 style={{ color: 'var(--gold)', marginBottom: '15px' }}>
                📝 Beschreibe die Aufgabe
              </h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '15px' }}>
                Was wirst du machen? (z.B. "10 Mathe-Aufgaben", "Diktat", "Vokabeltest")
              </p>
              <textarea
                className="entry-textarea"
                placeholder="Beschreibe deine Aufgabe..."
                value={entry.task}
                onChange={e => setEntry({ ...entry, task: e.target.value })}
                autoFocus
              />
              <button
                className="submit-entry-btn"
                onClick={handleTaskSubmit}
                disabled={entry.task.trim().length < 5}
              >
                Weiter →
              </button>
              <button className="back-btn" onClick={() => setStep('subject')} style={{ marginTop: '10px', width: '100%' }}>
                ← Zurueck
              </button>
            </div>
          )}

          {/* Schritt 3: Vorhersage */}
          {step === 'prediction' && (
            <div className="hattie-prediction">
              <h3 style={{ color: 'var(--gold)', marginBottom: '15px' }}>
                🎯 Deine Schaetzung
              </h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '15px' }}>
                Aufgabe: <strong style={{ color: 'var(--text-light)' }}>{entry.task}</strong>
              </p>
              <p style={{ color: 'var(--text-light)', marginBottom: '15px' }}>
                Wie viele Punkte/Prozent erwartest du? (0-100)
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', justifyContent: 'center' }}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={entry.prediction}
                  onChange={e => setEntry({ ...entry, prediction: parseInt(e.target.value) })}
                  style={{ flex: 1 }}
                />
                <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--gold)', minWidth: '60px' }}>
                  {entry.prediction}%
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', marginTop: '20px', fontStyle: 'italic' }}>
                Sei ehrlich! Es geht nicht darum, richtig zu liegen, sondern darum zu lernen.
              </p>
              <button
                className="submit-entry-btn"
                onClick={handlePredictionSubmit}
                style={{ marginTop: '20px' }}
              >
                ✓ Schaetzung abgeben
              </button>
              <button className="back-btn" onClick={() => setStep('task')} style={{ marginTop: '10px', width: '100%' }}>
                ← Zurueck
              </button>
            </div>
          )}

          {/* Schritt 4: Ergebnis eintragen */}
          {step === 'result' && (
            <div className="hattie-result">
              <h3 style={{ color: 'var(--gold)', marginBottom: '15px' }}>
                ✅ Dein Ergebnis
              </h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '10px' }}>
                Aufgabe: <strong style={{ color: 'var(--text-light)' }}>{entry.task}</strong>
              </p>
              <p style={{ color: 'var(--text-muted)', marginBottom: '15px' }}>
                Deine Schaetzung: <strong style={{ color: 'var(--gold)' }}>{entry.prediction}%</strong>
              </p>
              <p style={{ color: 'var(--text-light)', marginBottom: '15px' }}>
                Wie war dein echtes Ergebnis?
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', justifyContent: 'center' }}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={entry.result || 0}
                  onChange={e => setEntry({ ...entry, result: parseInt(e.target.value) })}
                  style={{ flex: 1 }}
                />
                <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--xp-green)', minWidth: '60px' }}>
                  {entry.result || 0}%
                </span>
              </div>
              <button
                className="submit-entry-btn"
                onClick={handleResultSubmit}
                style={{ marginTop: '20px' }}
              >
                Weiter zur Reflexion →
              </button>
              <button className="back-btn" onClick={() => setStep('prediction')} style={{ marginTop: '10px', width: '100%' }}>
                ← Zurueck
              </button>
            </div>
          )}

          {/* Schritt 5: Reflexion */}
          {step === 'reflection' && (
            <div className="hattie-reflection">
              <h3 style={{ color: 'var(--gold)', marginBottom: '15px' }}>
                🔄 Reflexion
              </h3>

              <div style={{
                background: exceeded ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 215, 0, 0.1)',
                border: `2px solid ${exceeded ? 'var(--xp-green)' : 'var(--gold-dark)'}`,
                borderRadius: '15px',
                padding: '20px',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>
                  {exceeded ? '🎉' : '🤔'}
                </div>
                <div style={{ fontSize: '18px', color: 'var(--text-light)' }}>
                  Schaetzung: <strong>{entry.prediction}%</strong>
                  {' → '}
                  Ergebnis: <strong style={{ color: exceeded ? 'var(--xp-green)' : 'var(--gold)' }}>{entry.result}%</strong>
                </div>
                <div style={{ marginTop: '10px', color: exceeded ? 'var(--xp-green)' : 'var(--text-muted)' }}>
                  {exceeded
                    ? '✨ Besser als erwartet! Dein Gehirn speichert: "Ich kann mehr als ich denke!"'
                    : 'Das hilft dir, dich beim naechsten Mal besser einzuschaetzen!'
                  }
                </div>
              </div>

              <p style={{ color: 'var(--text-light)', marginBottom: '10px' }}>
                Was hat dich ueberrascht? Was nimmst du mit?
              </p>
              <textarea
                className="entry-textarea"
                placeholder="Deine Gedanken..."
                value={entry.reflection || ''}
                onChange={e => setEntry({ ...entry, reflection: e.target.value })}
              />

              <button
                className="submit-entry-btn"
                onClick={handleComplete}
                style={{ marginTop: '20px' }}
              >
                ✓ Challenge abschliessen
              </button>
            </div>
          )}

          {/* Abschluss */}
          {step === 'complete' && (
            <div className="reward-popup" style={{ position: 'relative', background: 'transparent' }}>
              <div className="reward-content">
                <h3>🎊 Challenge geschafft!</h3>
                <div className="reward-items">
                  <div className="reward-xp">
                    <span className="reward-icon">⭐</span>
                    <span className="reward-value">+{earnedXp} XP</span>
                  </div>
                  {exceeded && (
                    <div className="reward-gold">
                      <span className="reward-icon">🏆</span>
                      <span className="reward-value">Uebertroffen!</span>
                    </div>
                  )}
                </div>
                <p style={{ color: 'var(--text-muted)', marginTop: '15px' }}>
                  Je oefter du das machst, desto besser wirst du darin, dich selbst einzuschaetzen!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
