/**
 * LociRoom Component
 * 
 * Haupt-Container für einen einzelnen Loci-Raum.
 * Orchestriert Header, Slots, JourneyPath und Background.
 */

import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import type { 
  Room, 
  Station, 
  Slot as SlotType, 
  RoomMode,
  RoomStats,
  TemplateId,
} from '../../types';
import { 
  getTemplateSlots, 
  ROOM_VIEWPORT, 
  DARK, 
  KEYFRAMES,
  needsReview,
} from '../../constants';
import { stationsBySlot, sortStationsByJourneyOrder } from '../../utils';
import { Slot } from './Slot';
import { JourneyPath } from './JourneyPath';
import { RoomHeader } from './RoomHeader';

// =============================================================================
// TYPES
// =============================================================================

export interface LociRoomProps {
  room: Room;
  stations: Station[];
  stats?: RoomStats;
  mode: RoomMode;
  selectedStationId?: string | null;
  selectedSlotId?: string | null;
  journeyProgress?: {
    current: number;
    total: number;
    percent: number;
  };
  journeyIndex?: number;
  /** Custom Background Component */
  BackgroundComponent?: React.ComponentType<{ scale: number }>;
  // Callbacks
  onBack: () => void;
  onModeChange: (mode: RoomMode) => void;
  onStartJourney: () => void;
  onSlotClick: (slotId: string) => void;
  onStationClick: (stationId: string) => void;
}

// =============================================================================
// STYLES
// =============================================================================

const styles = {
  container: {
    minHeight: '100vh',
    background: `linear-gradient(180deg, ${DARK.deepest} 0%, ${DARK.base} 100%)`,
    display: 'flex',
    flexDirection: 'column',
  } as React.CSSProperties,

  roomContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    overflow: 'hidden',
  } as React.CSSProperties,

  roomWrapper: {
    position: 'relative',
    width: '100%',
    maxWidth: '1000px',
    aspectRatio: `${ROOM_VIEWPORT.width} / ${ROOM_VIEWPORT.height}`,
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), inset 0 0 0 2px rgba(255, 215, 0, 0.2)',
  } as React.CSSProperties,

  roomInner: {
    position: 'absolute',
    inset: 0,
  } as React.CSSProperties,

  backgroundPlaceholder: {
    position: 'absolute',
    inset: 0,
    background: `linear-gradient(145deg, ${DARK.elevated} 0%, ${DARK.base} 100%)`,
  } as React.CSSProperties,

  slotsContainer: {
    position: 'absolute',
    inset: 0,
  } as React.CSSProperties,

  emptyState: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '20px',
    padding: '40px',
    textAlign: 'center',
    zIndex: 50,
  } as React.CSSProperties,

  emptyIcon: {
    fontSize: '64px',
    marginBottom: '20px',
    opacity: 0.6,
  } as React.CSSProperties,

  emptyTitle: {
    fontSize: '22px',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '10px',
  } as React.CSSProperties,

  emptyText: {
    fontSize: '15px',
    color: 'rgba(255, 255, 255, 0.6)',
    maxWidth: '320px',
    lineHeight: 1.5,
  } as React.CSSProperties,
};

// =============================================================================
// DEFAULT BACKGROUND
// =============================================================================

/**
 * Placeholder Background (wird durch Template-spezifische ersetzt)
 */
const DefaultBackground: React.FC<{ scale: number }> = ({ scale }) => (
  <div style={styles.backgroundPlaceholder}>
    {/* Simple grid pattern */}
    <svg
      width="100%"
      height="100%"
      style={{ position: 'absolute', opacity: 0.1 }}
    >
      <defs>
        <pattern id="grid" width={40 * scale} height={40 * scale} patternUnits="userSpaceOnUse">
          <path
            d={`M ${40 * scale} 0 L 0 0 0 ${40 * scale}`}
            fill="none"
            stroke="rgba(255, 215, 0, 0.3)"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  </div>
);

// =============================================================================
// COMPONENT
// =============================================================================

export const LociRoom: React.FC<LociRoomProps> = ({
  room,
  stations,
  stats,
  mode,
  selectedStationId,
  selectedSlotId,
  journeyProgress,
  journeyIndex = -1,
  BackgroundComponent,
  onBack,
  onModeChange,
  onStartJourney,
  onSlotClick,
  onStationClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Get template slots
  const slots = useMemo(() => getTemplateSlots(room.templateId), [room.templateId]);

  // Create station map (slotId -> Station)
  const stationMap = useMemo(() => stationsBySlot(stations), [stations]);

  // Get ordered stations for journey
  const orderedStations = useMemo(() => 
    sortStationsByJourneyOrder(stations, room.journeyOrder),
    [stations, room.journeyOrder]
  );

  // Calculate which stations need review
  const stationsNeedingReview = useMemo(() => {
    return new Set(
      stations
        .filter(s => needsReview(s.lastReviewedAt, s.recallStatus))
        .map(s => s.id)
    );
  }, [stations]);

  // Current station in journey
  const currentJourneyStationId = useMemo(() => {
    if (mode !== 'journey' || journeyIndex < 0) return null;
    return room.journeyOrder[journeyIndex] ?? null;
  }, [mode, journeyIndex, room.journeyOrder]);

  // Calculate scale based on container size
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const scaleX = rect.width / ROOM_VIEWPORT.width;
        const scaleY = rect.height / ROOM_VIEWPORT.height;
        setScale(Math.min(scaleX, scaleY, 1));
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Handle slot click
  const handleSlotClick = useCallback((slot: SlotType) => {
    const station = stationMap.get(slot.id);
    if (station) {
      onStationClick(station.id);
    } else {
      onSlotClick(slot.id);
    }
  }, [stationMap, onSlotClick, onStationClick]);

  // Get journey number for a station
  const getJourneyNumber = useCallback((stationId: string): number | undefined => {
    const index = room.journeyOrder.indexOf(stationId);
    return index >= 0 ? index + 1 : undefined;
  }, [room.journeyOrder]);

  // Show journey path in order and journey modes
  const showJourneyPath = mode === 'order' || mode === 'journey';

  // Show empty state
  const showEmptyState = stations.length === 0 && mode === 'view';

  // Background component to use
  const Background = BackgroundComponent || DefaultBackground;

  return (
    <>
      {/* Inject keyframes */}
      <style>{KEYFRAMES}</style>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.4); }
          50% { box-shadow: 0 0 40px rgba(255, 215, 0, 0.6); }
        }
      `}</style>

      <div style={styles.container}>
        {/* Header */}
        <RoomHeader
          room={room}
          mode={mode}
          stats={stats}
          journeyProgress={journeyProgress}
          reviewCount={stationsNeedingReview.size}
          onBack={onBack}
          onModeChange={onModeChange}
          onStartJourney={onStartJourney}
        />

        {/* Room area */}
        <div style={styles.roomContainer}>
          <div style={styles.roomWrapper} ref={containerRef}>
            <div style={styles.roomInner}>
              {/* Background */}
              <Background scale={scale} />

              {/* Journey path */}
              {showJourneyPath && orderedStations.length > 1 && (
                <JourneyPath
                  stations={orderedStations}
                  slots={slots}
                  currentIndex={journeyIndex}
                  scale={scale}
                  width={ROOM_VIEWPORT.width}
                  height={ROOM_VIEWPORT.height}
                  visible={true}
                />
              )}

              {/* Slots */}
              <div style={styles.slotsContainer}>
                {slots.map(slot => {
                  const station = stationMap.get(slot.id);
                  const isSelected = station 
                    ? station.id === selectedStationId 
                    : slot.id === selectedSlotId;
                  const isHighlighted = station?.id === currentJourneyStationId;
                  const journeyNumber = station ? getJourneyNumber(station.id) : undefined;
                  const showNumber = showJourneyPath && journeyNumber !== undefined;
                  const stationNeedsReview = station ? stationsNeedingReview.has(station.id) : false;

                  return (
                    <Slot
                      key={slot.id}
                      slot={slot}
                      station={station}
                      mode={mode}
                      isSelected={isSelected}
                      isHighlighted={isHighlighted}
                      journeyNumber={journeyNumber}
                      showJourneyNumber={showNumber}
                      needsReview={stationNeedsReview}
                      onClick={() => handleSlotClick(slot)}
                      scale={scale}
                    />
                  );
                })}
              </div>

              {/* Empty state */}
              {showEmptyState && (
                <div style={styles.emptyState as React.CSSProperties}>
                  <div style={styles.emptyIcon}>✨</div>
                  <h3 style={styles.emptyTitle}>Dieser Raum ist noch leer</h3>
                  <p style={styles.emptyText}>
                    Wechsle in den Bearbeitungsmodus und klicke auf einen 
                    Platz, um deine erste Lernstation zu erstellen.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LociRoom;
