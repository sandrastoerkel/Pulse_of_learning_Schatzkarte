/**
 * ChamberOverview Component
 * 
 * Hauptseite der Schatzkammer mit Übersicht aller Räume.
 * Enthält Header mit Stats, Raum-Grid und Create-Button.
 */

import React, { useCallback } from 'react';
import type { Room, RoomStats, TemplateId, ColorTag } from '../../types';
import { GOLD, DARK, KEYFRAMES } from '../../constants';
import { RoomCard } from './RoomCard';
import { CreateRoomModal } from './CreateRoomModal';

// =============================================================================
// TYPES
// =============================================================================

export interface ChamberOverviewProps {
  /** Alle Räume */
  rooms: Room[];
  /** Statistiken pro Raum */
  roomStats: Record<string, RoomStats>;
  /** Gesamte XP des Benutzers */
  totalXp?: number;
  /** Modal-State */
  isCreateModalOpen: boolean;
  /** Raum erstellen Handler */
  onCreateRoom: (data: {
    name: string;
    description: string;
    templateId: TemplateId;
    subject?: string;
    colorTag: ColorTag;
  }) => void;
  /** Modal öffnen */
  onOpenCreateModal: () => void;
  /** Modal schließen */
  onCloseCreateModal: () => void;
  /** Raum anklicken (Navigation) */
  onRoomClick: (roomId: string) => void;
  /** Raum bearbeiten */
  onEditRoom?: (roomId: string) => void;
  /** Raum löschen */
  onDeleteRoom?: (roomId: string) => void;
  /** Rundgang starten */
  onStartJourney?: (roomId: string) => void;
  /** Loading-State */
  isLoading?: boolean;
}

// =============================================================================
// STYLES
// =============================================================================

const styles = {
  container: {
    minHeight: '100vh',
    background: `linear-gradient(180deg, ${DARK.deepest} 0%, ${DARK.base} 100%)`,
    padding: '0',
  } as React.CSSProperties,

  header: {
    background: `linear-gradient(180deg, ${DARK.elevated} 0%, transparent 100%)`,
    padding: '32px 24px 48px',
    borderBottom: '1px solid rgba(255, 215, 0, 0.1)',
  } as React.CSSProperties,

  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
  } as React.CSSProperties,

  titleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '24px',
  } as React.CSSProperties,

  title: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#fff',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  } as React.CSSProperties,

  titleIcon: {
    fontSize: '40px',
  } as React.CSSProperties,

  titleText: {
    background: GOLD.gradient,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  } as React.CSSProperties,

  createButton: {
    padding: '14px 28px',
    background: GOLD.gradient,
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 600,
    color: DARK.deepest,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 16px rgba(255, 215, 0, 0.3)',
  } as React.CSSProperties,

  statsRow: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
  } as React.CSSProperties,

  statCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '16px 24px',
    minWidth: '140px',
  } as React.CSSProperties,

  statValue: {
    fontSize: '28px',
    fontWeight: 700,
    color: GOLD.primary,
    display: 'block',
    marginBottom: '4px',
  } as React.CSSProperties,

  statLabel: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  } as React.CSSProperties,

  xpBadge: {
    background: `linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 165, 0, 0.2) 100%)`,
    border: `1px solid ${GOLD.dark}`,
    borderRadius: '12px',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  } as React.CSSProperties,

  xpIcon: {
    fontSize: '28px',
  } as React.CSSProperties,

  xpValue: {
    fontSize: '24px',
    fontWeight: 700,
    color: GOLD.primary,
  } as React.CSSProperties,

  xpLabel: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
  } as React.CSSProperties,

  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '32px 24px',
  } as React.CSSProperties,

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px',
  } as React.CSSProperties,

  emptyState: {
    textAlign: 'center',
    padding: '80px 24px',
    maxWidth: '480px',
    margin: '0 auto',
  } as React.CSSProperties,

  emptyIcon: {
    fontSize: '80px',
    marginBottom: '24px',
    opacity: 0.5,
  } as React.CSSProperties,

  emptyTitle: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '12px',
  } as React.CSSProperties,

  emptyText: {
    fontSize: '16px',
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 1.6,
    marginBottom: '32px',
  } as React.CSSProperties,

  emptyButton: {
    padding: '16px 32px',
    background: GOLD.gradient,
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 600,
    color: DARK.deepest,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 16px rgba(255, 215, 0, 0.3)',
  } as React.CSSProperties,

  reviewBanner: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '12px',
    padding: '16px 20px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  } as React.CSSProperties,

  reviewIcon: {
    fontSize: '24px',
  } as React.CSSProperties,

  reviewText: {
    flex: 1,
    fontSize: '14px',
    color: '#f87171',
  } as React.CSSProperties,

  reviewCount: {
    fontWeight: 600,
  } as React.CSSProperties,

  loadingOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 500,
  } as React.CSSProperties,

  loadingSpinner: {
    width: '48px',
    height: '48px',
    border: `3px solid ${DARK.surface}`,
    borderTopColor: GOLD.primary,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  } as React.CSSProperties,

  sectionTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  } as React.CSSProperties,
};

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

const StatCard: React.FC<{ value: number | string; label: string }> = ({ value, label }) => (
  <div style={styles.statCard}>
    <span style={styles.statValue}>{value}</span>
    <span style={styles.statLabel}>{label}</span>
  </div>
);

// =============================================================================
// COMPONENT
// =============================================================================

export const ChamberOverview: React.FC<ChamberOverviewProps> = ({
  rooms,
  roomStats,
  totalXp = 0,
  isCreateModalOpen,
  onCreateRoom,
  onOpenCreateModal,
  onCloseCreateModal,
  onRoomClick,
  onEditRoom,
  onDeleteRoom,
  onStartJourney,
  isLoading = false,
}) => {
  // Calculate aggregate stats
  const totalRooms = rooms.length;
  const totalStations = Object.values(roomStats).reduce(
    (sum, stats) => sum + stats.totalStations,
    0
  );
  const totalMastered = Object.values(roomStats).reduce(
    (sum, stats) => sum + stats.masteredStations,
    0
  );
  const totalDueForReview = Object.values(roomStats).reduce(
    (sum, stats) => sum + stats.dueForReview,
    0
  );

  // Handlers
  const handleRoomClick = useCallback((roomId: string) => {
    onRoomClick(roomId);
  }, [onRoomClick]);

  const handleEditRoom = useCallback((roomId: string) => {
    onEditRoom?.(roomId);
  }, [onEditRoom]);

  const handleDeleteRoom = useCallback((roomId: string) => {
    onDeleteRoom?.(roomId);
  }, [onDeleteRoom]);

  const handleStartJourney = useCallback((roomId: string) => {
    onStartJourney?.(roomId);
  }, [onStartJourney]);

  return (
    <>
      {/* Keyframes injection */}
      <style>{KEYFRAMES}</style>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div style={styles.container}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerContent}>
            {/* Title row */}
            <div style={styles.titleRow}>
              <h1 style={styles.title}>
                <span style={styles.titleIcon}>🗝️</span>
                <span style={styles.titleText}>Meine Schatzkammer</span>
              </h1>

              <button
                style={styles.createButton}
                onClick={onOpenCreateModal}
                aria-label="Neuen Raum erstellen"
              >
                <span>✨</span>
                <span>Neuer Raum</span>
              </button>
            </div>

            {/* Stats row */}
            <div style={styles.statsRow}>
              <StatCard value={totalRooms} label="Räume" />
              <StatCard value={totalStations} label="Stationen" />
              <StatCard value={totalMastered} label="Gemeistert" />
              
              <div style={styles.xpBadge}>
                <span style={styles.xpIcon}>⭐</span>
                <div>
                  <div style={styles.xpValue}>{totalXp.toLocaleString()}</div>
                  <div style={styles.xpLabel}>Gesamt XP</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main style={styles.main}>
          {/* Review reminder banner */}
          {totalDueForReview > 0 && (
            <div style={styles.reviewBanner}>
              <span style={styles.reviewIcon}>🔔</span>
              <span style={styles.reviewText}>
                <span style={styles.reviewCount}>{totalDueForReview} Stationen</span>
                {' '}warten auf Wiederholung
              </span>
            </div>
          )}

          {/* Empty state */}
          {rooms.length === 0 ? (
            <div style={styles.emptyState as React.CSSProperties}>
              <div style={styles.emptyIcon}>🏰</div>
              <h2 style={styles.emptyTitle}>Deine Schatzkammer ist noch leer</h2>
              <p style={styles.emptyText}>
                Erstelle deinen ersten Loci-Raum und beginne, dein Wissen 
                an magischen Orten zu verankern. Wähle aus verschiedenen 
                Templates wie Zaubererturm, Piratenhöhle oder Raumstation!
              </p>
              <button
                style={styles.emptyButton}
                onClick={onOpenCreateModal}
              >
                <span>✨</span>
                <span>Ersten Raum erstellen</span>
              </button>
            </div>
          ) : (
            <>
              {/* Section title */}
              <h2 style={styles.sectionTitle}>
                <span>🚪</span>
                <span>Deine Räume</span>
              </h2>

              {/* Room grid */}
              <div style={styles.grid}>
                {rooms.map(room => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    stats={roomStats[room.id]}
                    onClick={() => handleRoomClick(room.id)}
                    onEdit={() => handleEditRoom(room.id)}
                    onDelete={() => handleDeleteRoom(room.id)}
                    onStartJourney={() => handleStartJourney(room.id)}
                  />
                ))}
              </div>
            </>
          )}
        </main>

        {/* Create Room Modal */}
        <CreateRoomModal
          isOpen={isCreateModalOpen}
          onClose={onCloseCreateModal}
          onCreate={onCreateRoom}
        />

        {/* Loading overlay */}
        {isLoading && (
          <div style={styles.loadingOverlay}>
            <div style={styles.loadingSpinner} />
          </div>
        )}
      </div>
    </>
  );
};

export default ChamberOverview;
