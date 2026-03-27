/**
 * ResultsModal Component
 * 
 * Zeigt das Ergebnis eines Rundgangs mit:
 * - Erfolgs-Emoji basierend auf Ergebnis
 * - Statistiken (Gemeistert/Fast/Üben)
 * - Verdiente XP
 * - Aktions-Buttons (Zurück/Nochmal)
 */

import React, { useMemo } from 'react';
import type { JourneyResult } from '../../types';
import {
  STATUS_COLORS,
  STATUS_LABELS,
  getResultEmoji,
  getResultMessage,
  UI,
  FEEDBACK,
  KEYFRAMES,
} from '../../constants';

// =============================================================================
// TYPES
// =============================================================================

export interface ResultsModalProps {
  isOpen: boolean;
  result: JourneyResult | null;
  roomName?: string;
  onClose: () => void;
  onRetry: () => void;
}

// =============================================================================
// STYLES
// =============================================================================

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.9)',
    backdropFilter: 'blur(12px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
    padding: '20px',
  } as React.CSSProperties,

  modal: {
    background: `linear-gradient(145deg, ${UI.surface} 0%, ${UI.base} 100%)`,
    borderRadius: '24px',
    border: `2px solid ${UI.border}`,
    boxShadow: '0 24px 48px rgba(0, 0, 0, 0.5), 0 0 20px rgba(14, 165, 233, 0.5)',
    width: '100%',
    maxWidth: '420px',
    overflow: 'hidden',
    textAlign: 'center',
  } as React.CSSProperties,

  confetti: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '200px',
    overflow: 'hidden',
    pointerEvents: 'none',
  } as React.CSSProperties,

  content: {
    padding: '40px 32px 32px',
    position: 'relative',
  } as React.CSSProperties,

  emojiContainer: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: UI.actionSubtle,
    border: `3px solid ${UI.action}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
    fontSize: '50px',
    animation: 'scaleIn 0.5s ease',
    boxShadow: '0 0 12px rgba(14, 165, 233, 0.3)',
  } as React.CSSProperties,

  title: {
    fontSize: '26px',
    fontWeight: 700,
    color: '#fff',
    margin: 0,
    marginBottom: '8px',
  } as React.CSSProperties,

  message: {
    fontSize: '16px',
    color: 'rgba(255, 255, 255, 0.7)',
    margin: 0,
    marginBottom: '32px',
    lineHeight: 1.5,
  } as React.CSSProperties,

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '24px',
  } as React.CSSProperties,

  statCard: (color: string): React.CSSProperties => ({
    padding: '16px 12px',
    background: `${color}10`,
    border: `1px solid ${color}40`,
    borderRadius: '14px',
  }),

  statValue: (color: string): React.CSSProperties => ({
    fontSize: '32px',
    fontWeight: 700,
    color: color,
    display: 'block',
    marginBottom: '4px',
  }),

  statLabel: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  } as React.CSSProperties,

  xpSection: {
    padding: '20px',
    background: FEEDBACK.rewardSubtle,
    border: `1px solid ${UI.border}`,
    borderRadius: '16px',
    marginBottom: '32px',
  } as React.CSSProperties,

  xpLabel: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '8px',
  } as React.CSSProperties,

  xpValue: {
    fontSize: '40px',
    fontWeight: 700,
    color: FEEDBACK.reward,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
  } as React.CSSProperties,

  xpStar: {
    fontSize: '32px',
    animation: 'glow 2s ease-in-out infinite',
  } as React.CSSProperties,

  perfectBonus: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    background: 'rgba(34, 197, 94, 0.15)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    borderRadius: '20px',
    fontSize: '13px',
    color: '#22c55e',
    marginTop: '12px',
  } as React.CSSProperties,

  progressBar: {
    marginBottom: '32px',
  } as React.CSSProperties,

  progressLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: '8px',
  } as React.CSSProperties,

  progressTrack: {
    height: '12px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    overflow: 'hidden',
    display: 'flex',
  } as React.CSSProperties,

  progressSegment: (color: string, percent: number): React.CSSProperties => ({
    width: `${percent}%`,
    height: '100%',
    background: color,
    transition: 'width 0.5s ease',
  }),

  actions: {
    display: 'flex',
    gap: '12px',
  } as React.CSSProperties,

  button: (variant: 'primary' | 'secondary'): React.CSSProperties => ({
    flex: 1,
    padding: '14px 20px',
    background: variant === 'primary' ? UI.action : 'rgba(255, 255, 255, 0.05)',
    border: variant === 'secondary' ? '1px solid rgba(255, 255, 255, 0.15)' : 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: 600,
    color: variant === 'primary' ? '#fff' : 'rgba(255, 255, 255, 0.8)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
  }),

  roomName: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: '16px',
  } as React.CSSProperties,
};

// =============================================================================
// CONFETTI ANIMATION
// =============================================================================

const ConfettiPiece: React.FC<{ delay: number; left: number; color: string }> = ({ 
  delay, 
  left, 
  color 
}) => (
  <div
    style={{
      position: 'absolute',
      left: `${left}%`,
      top: '-20px',
      width: '10px',
      height: '10px',
      background: color,
      borderRadius: '2px',
      animation: `confettiFall 3s ease-in ${delay}s infinite`,
      transform: `rotate(${Math.random() * 360}deg)`,
    }}
  />
);

const Confetti: React.FC<{ show: boolean }> = ({ show }) => {
  if (!show) return null;

  const colors = [UI.action, FEEDBACK.reward, '#22c55e', '#3b82f6', '#a78bfa'];
  const pieces = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    delay: Math.random() * 2,
    left: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)]!,
  }));

  return (
    <div style={styles.confetti}>
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(300px) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {pieces.map(piece => (
        <ConfettiPiece key={piece.id} {...piece} />
      ))}
    </div>
  );
};

// =============================================================================
// COMPONENT
// =============================================================================

export const ResultsModal: React.FC<ResultsModalProps> = ({
  isOpen,
  result,
  roomName,
  onClose,
  onRetry,
}) => {
  // Calculate success rate
  const successRate = useMemo(() => {
    if (!result || result.stats.total === 0) return 0;
    return result.stats.mastered / result.stats.total;
  }, [result]);

  // Check if perfect
  const isPerfect = useMemo(() => {
    if (!result) return false;
    return result.stats.mastered === result.stats.total && result.stats.total > 0;
  }, [result]);

  // Get emoji and message
  const emoji = useMemo(() => getResultEmoji(successRate), [successRate]);
  const message = useMemo(() => getResultMessage(successRate), [successRate]);

  // Calculate progress percentages
  const progressPercents = useMemo(() => {
    if (!result || result.stats.total === 0) {
      return { mastered: 0, almost: 0, needsPractice: 0 };
    }
    const total = result.stats.total;
    return {
      mastered: (result.stats.mastered / total) * 100,
      almost: (result.stats.almost / total) * 100,
      needsPractice: (result.stats.needsPractice / total) * 100,
    };
  }, [result]);

  if (!isOpen || !result) return null;

  return (
    <>
      <style>{KEYFRAMES}</style>
      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes glow {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(14, 165, 233, 0.6)); }
          50% { filter: drop-shadow(0 0 16px rgba(14, 165, 233, 0.9)); }
        }
      `}</style>

      <div style={styles.overlay}>
        <div style={styles.modal}>
          {/* Confetti for good results */}
          <Confetti show={successRate >= 0.5} />

          <div style={styles.content}>
            {/* Room name */}
            {roomName && (
              <p style={styles.roomName}>Rundgang: {roomName}</p>
            )}

            {/* Result emoji */}
            <div style={styles.emojiContainer}>
              {emoji}
            </div>

            {/* Title and message */}
            <h2 style={styles.title}>Rundgang abgeschlossen!</h2>
            <p style={styles.message}>{message}</p>

            {/* Stats grid */}
            <div style={styles.statsGrid}>
              <div style={styles.statCard(STATUS_COLORS.mastered)}>
                <span style={styles.statValue(STATUS_COLORS.mastered)}>
                  {result.stats.mastered}
                </span>
                <span style={styles.statLabel}>{STATUS_LABELS.mastered}</span>
              </div>
              <div style={styles.statCard(STATUS_COLORS.almost)}>
                <span style={styles.statValue(STATUS_COLORS.almost)}>
                  {result.stats.almost}
                </span>
                <span style={styles.statLabel}>{STATUS_LABELS.almost}</span>
              </div>
              <div style={styles.statCard(STATUS_COLORS.needsPractice)}>
                <span style={styles.statValue(STATUS_COLORS.needsPractice)}>
                  {result.stats.needsPractice}
                </span>
                <span style={styles.statLabel}>{STATUS_LABELS.needs_practice}</span>
              </div>
            </div>

            {/* Progress bar */}
            <div style={styles.progressBar}>
              <div style={styles.progressLabel}>
                <span>Fortschritt</span>
                <span>{Math.round(successRate * 100)}% gemeistert</span>
              </div>
              <div style={styles.progressTrack}>
                <div style={styles.progressSegment(STATUS_COLORS.mastered, progressPercents.mastered)} />
                <div style={styles.progressSegment(STATUS_COLORS.almost, progressPercents.almost)} />
                <div style={styles.progressSegment(STATUS_COLORS.needsPractice, progressPercents.needsPractice)} />
              </div>
            </div>

            {/* XP section */}
            <div style={styles.xpSection}>
              <div style={styles.xpLabel}>Verdiente Punkte</div>
              <div style={styles.xpValue}>
                <span style={styles.xpStar}>⭐</span>
                <span>+{result.xpEarned} XP</span>
              </div>
              {isPerfect && (
                <div style={styles.perfectBonus}>
                  <span>🏆</span>
                  <span>Perfekter Rundgang! +25 Bonus</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={styles.actions}>
              <button style={styles.button('secondary')} onClick={onClose}>
                <span>🏠</span>
                <span>Zurück</span>
              </button>
              <button style={styles.button('primary')} onClick={onRetry}>
                <span>🔄</span>
                <span>Nochmal</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResultsModal;
