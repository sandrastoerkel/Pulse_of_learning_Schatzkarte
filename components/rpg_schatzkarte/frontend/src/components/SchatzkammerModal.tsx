/**
 * SchatzkammerModal Component
 *
 * Container-Komponente für das Schatzkammer Loci-System.
 * Verwaltet Navigation zwischen ChamberOverview und LociRoom,
 * localStorage-Persistenz und XP-Integration.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  // Types
  type Room,
  type Station,
  type Chamber,
  type RoomStats,
  type TemplateId,
  type ColorTag,
  type RecallStatus,
  type JourneyResult,
  // Components
  ChamberOverview,
  LociRoom,
  StationModal,
  AddStationModal,
  ResultsModal,
  DeleteRoomModal,
  // Hooks
  useChamber,
  useLociRoom,
  // Utils & Constants
  createChamber,
  calculateRoomStats,
  getBackgroundComponent,
  calculateJourneyXp,
} from '../features/schatzkammer';

// =============================================================================
// TYPES
// =============================================================================

interface SchatzkammerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onXPEarned?: (xp: number) => void;
}

type ViewMode = 'overview' | 'room';

// =============================================================================
// LOCALSTORAGE KEYS
// =============================================================================

const STORAGE_KEYS = {
  CHAMBER: 'schatzkarte_schatzkammer_chamber',
  ROOMS: 'schatzkarte_schatzkammer_rooms',
  STATIONS: 'schatzkarte_schatzkammer_stations',
  TOTAL_XP: 'schatzkarte_schatzkammer_xp',
};

// =============================================================================
// PERSISTENCE HELPERS
// =============================================================================

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    return JSON.parse(stored) as T;
  } catch (e) {
    console.warn(`Schatzkammer: Fehler beim Laden von ${key}:`, e);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Schatzkammer: Fehler beim Speichern von ${key}:`, e);
  }
}

// =============================================================================
// DEFAULT CHAMBER
// =============================================================================

function getOrCreateDefaultChamber(): Chamber {
  const stored = loadFromStorage<Chamber | null>(STORAGE_KEYS.CHAMBER, null);
  if (stored) return stored;

  const newChamber = createChamber({
    userId: 'local-user',
    name: 'Meine Schatzkammer',
  });
  saveToStorage(STORAGE_KEYS.CHAMBER, newChamber);
  return newChamber;
}

// =============================================================================
// STYLES
// =============================================================================

const styles = {
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    overflow: 'hidden',
  },
  container: {
    position: 'relative' as const,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)',
    overflow: 'auto',
  },
  closeButton: {
    position: 'fixed' as const,
    top: '16px',
    right: '16px',
    width: '48px',
    height: '48px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '2px solid rgba(255, 215, 0, 0.3)',
    borderRadius: '50%',
    color: '#fff',
    fontSize: '24px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2100,
    transition: 'all 0.2s ease',
  },
};

// =============================================================================
// COMPONENT
// =============================================================================

export const SchatzkammerModal: React.FC<SchatzkammerModalProps> = ({
  isOpen,
  onClose,
  onXPEarned,
}) => {
  // =========================================================================
  // STATE
  // =========================================================================

  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [totalXp, setTotalXp] = useState(() => loadFromStorage<number>(STORAGE_KEYS.TOTAL_XP, 0));
  const [deleteModalRoomId, setDeleteModalRoomId] = useState<string | null>(null);

  // Load persisted data
  const [chamber] = useState(() => getOrCreateDefaultChamber());
  const [rooms, setRooms] = useState<Room[]>(() => loadFromStorage<Room[]>(STORAGE_KEYS.ROOMS, []));
  const [allStations, setAllStations] = useState<Station[]>(() =>
    loadFromStorage<Station[]>(STORAGE_KEYS.STATIONS, [])
  );

  // =========================================================================
  // CHAMBER HOOK
  // =========================================================================

  const chamberHook = useChamber({
    chamber,
    rooms,
  });

  // Calculate room stats
  const roomStats = useMemo((): Record<string, RoomStats> => {
    const stats: Record<string, RoomStats> = {};
    rooms.forEach(room => {
      const roomStations = allStations.filter(s => s.roomId === room.id);
      stats[room.id] = calculateRoomStats(roomStations);
    });
    return stats;
  }, [rooms, allStations]);

  // =========================================================================
  // ROOM HOOK (for selected room)
  // =========================================================================

  const selectedRoom = useMemo(() => {
    if (!selectedRoomId) return undefined;
    return rooms.find(r => r.id === selectedRoomId);
  }, [rooms, selectedRoomId]);

  const roomStations = useMemo(() => {
    if (!selectedRoomId) return [];
    return allStations.filter(s => s.roomId === selectedRoomId);
  }, [allStations, selectedRoomId]);

  const roomHook = useLociRoom({
    room: selectedRoom,
    stations: roomStations,
  });

  // =========================================================================
  // PERSISTENCE EFFECTS
  // =========================================================================

  // Save rooms when changed
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ROOMS, rooms);
  }, [rooms]);

  // Save stations when changed
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.STATIONS, allStations);
  }, [allStations]);

  // Save XP when changed
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.TOTAL_XP, totalXp);
  }, [totalXp]);

  // Sync roomHook stations back to allStations
  useEffect(() => {
    if (!selectedRoomId || viewMode !== 'room') return;

    const otherStations = allStations.filter(s => s.roomId !== selectedRoomId);
    const newAllStations = [...otherStations, ...roomHook.state.stations];

    // Only update if actually changed
    if (JSON.stringify(newAllStations) !== JSON.stringify(allStations)) {
      setAllStations(newAllStations);
    }
  }, [roomHook.state.stations, selectedRoomId, viewMode]);

  // Sync room changes (journeyOrder etc.)
  useEffect(() => {
    if (!roomHook.state.room || !selectedRoomId) return;

    setRooms(prev => prev.map(r =>
      r.id === selectedRoomId ? roomHook.state.room! : r
    ));
  }, [roomHook.state.room, selectedRoomId]);

  // =========================================================================
  // HANDLERS
  // =========================================================================

  // Navigate to room
  const handleRoomClick = useCallback((roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    const stations = allStations.filter(s => s.roomId === roomId);
    setSelectedRoomId(roomId);
    roomHook.loadRoom(room, stations);
    setViewMode('room');
  }, [rooms, allStations, roomHook]);

  // Navigate back to overview
  const handleBackToOverview = useCallback(() => {
    setViewMode('overview');
    setSelectedRoomId(null);
    roomHook.enterViewMode();
  }, [roomHook]);

  // Create room
  const handleCreateRoom = useCallback((data: {
    name: string;
    description: string;
    templateId: TemplateId;
    subject?: string;
    colorTag: ColorTag;
  }) => {
    const newRoom = chamberHook.createRoom(data);
    setRooms(prev => [...prev, newRoom]);
    chamberHook.closeModals();
  }, [chamberHook]);

  // Delete room
  const handleDeleteRoom = useCallback((roomId: string) => {
    setDeleteModalRoomId(roomId);
  }, []);

  const handleConfirmDeleteRoom = useCallback(() => {
    if (!deleteModalRoomId) return;

    setRooms(prev => prev.filter(r => r.id !== deleteModalRoomId));
    setAllStations(prev => prev.filter(s => s.roomId !== deleteModalRoomId));
    setDeleteModalRoomId(null);
  }, [deleteModalRoomId]);

  // Station click in room
  const handleStationClick = useCallback((stationId: string) => {
    roomHook.selectStation(stationId);
  }, [roomHook]);

  // Slot click in room (for adding new station)
  const handleSlotClick = useCallback((slotId: string) => {
    if (roomHook.state.mode === 'edit') {
      roomHook.selectSlot(slotId);
      roomHook.openAddModal();
    }
  }, [roomHook]);

  // Add station (data from CreateStation without roomId and slotId)
  // Note: useLociRoom.addStation uses state.selectedSlotId internally
  const handleAddStation = useCallback((data: {
    title: string;
    content: string;
    hint: string;
    icon: string;
    artifactType: 'poster' | 'figure' | 'chest' | 'scroll' | 'magic_item';
  }) => {
    // useLociRoom.addStation expects Omit<CreateStation, 'roomId'> which includes slotId
    // But it actually uses state.selectedSlotId internally, so we need to provide slotId anyway
    const slotId = roomHook.state.selectedSlotId || '';
    roomHook.addStation({
      slotId,
      ...data,
    });
    roomHook.closeModals();
  }, [roomHook]);

  // Update station
  const handleUpdateStation = useCallback((id: string, data: Partial<Station>) => {
    roomHook.updateStation(id, data);
    roomHook.closeModals();
  }, [roomHook]);

  // Delete station
  const handleDeleteStation = useCallback((id: string) => {
    roomHook.deleteStation(id);
    roomHook.closeModals();
  }, [roomHook]);

  // Journey complete - handle XP
  const handleJourneyComplete = useCallback(() => {
    const result = roomHook.getJourneyResult();
    if (result && result.xpEarned > 0) {
      const newTotalXp = totalXp + result.xpEarned;
      setTotalXp(newTotalXp);

      // Notify parent
      if (onXPEarned) {
        onXPEarned(result.xpEarned);
      }
    }
    roomHook.endJourney();
  }, [roomHook, totalXp, onXPEarned]);

  // Rate recall in journey
  const handleRateRecall = useCallback((status: RecallStatus) => {
    roomHook.rateRecall(status);
  }, [roomHook]);

  // Start journey from overview
  const handleStartJourney = useCallback((roomId: string) => {
    handleRoomClick(roomId);
    // Small delay to ensure room is loaded
    setTimeout(() => {
      roomHook.startJourney();
    }, 100);
  }, [handleRoomClick, roomHook]);

  // Get background component for current room
  const BackgroundComponent = useMemo((): React.ComponentType<{ scale: number }> | undefined => {
    if (!selectedRoom) return undefined;
    const component = getBackgroundComponent(selectedRoom.templateId);
    // Cast to the correct type expected by LociRoom
    return component as React.ComponentType<{ scale: number }> | undefined;
  }, [selectedRoom]);

  // =========================================================================
  // RENDER
  // =========================================================================

  if (!isOpen) return null;

  const roomToDelete = deleteModalRoomId ? rooms.find(r => r.id === deleteModalRoomId) : null;

  return (
    <AnimatePresence>
      <motion.div
        style={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          style={styles.container}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
        >
          {/* Close Button */}
          <button
            style={styles.closeButton}
            onClick={onClose}
            aria-label="Schließen"
          >
            ×
          </button>

          {/* Chamber Overview */}
          {viewMode === 'overview' && (
            <ChamberOverview
              rooms={rooms}
              roomStats={roomStats}
              totalXp={totalXp}
              isCreateModalOpen={chamberHook.state.modals.createRoom}
              onCreateRoom={handleCreateRoom}
              onOpenCreateModal={chamberHook.openCreateModal}
              onCloseCreateModal={chamberHook.closeModals}
              onRoomClick={handleRoomClick}
              onEditRoom={() => {}} // TODO: Implement edit modal
              onDeleteRoom={handleDeleteRoom}
              onStartJourney={handleStartJourney}
            />
          )}

          {/* Loci Room */}
          {viewMode === 'room' && selectedRoom && (
            <LociRoom
              room={selectedRoom}
              stations={roomHook.state.stations}
              stats={roomStats[selectedRoom.id]}
              mode={roomHook.state.mode}
              selectedStationId={roomHook.state.selectedStationId}
              selectedSlotId={roomHook.state.selectedSlotId}
              journeyProgress={roomHook.journeyProgress}
              journeyIndex={roomHook.state.journey.currentIndex}
              BackgroundComponent={BackgroundComponent}
              onBack={handleBackToOverview}
              onModeChange={roomHook.setMode}
              onStartJourney={roomHook.startJourney}
              onSlotClick={handleSlotClick}
              onStationClick={handleStationClick}
            />
          )}

          {/* Station Modal (View/Edit/Journey) */}
          {/* Im Journey-Modus: currentStation anzeigen, sonst selectedStation */}
          {(roomHook.state.mode === 'journey' && roomHook.currentStation) ? (
            <StationModal
              isOpen={true}
              mode="journey"
              station={roomHook.currentStation}
              isRevealed={roomHook.state.journey.isRevealed}
              onClose={roomHook.closeModals}
              onReveal={roomHook.revealContent}
              onRate={handleRateRecall}
            />
          ) : roomHook.selectedStation && (
            <StationModal
              isOpen={true}
              mode={roomHook.state.mode === 'edit' ? 'edit' : 'view'}
              station={roomHook.selectedStation}
              isRevealed={false}
              onClose={roomHook.closeModals}
              onSave={(data: Partial<Station>) => handleUpdateStation(roomHook.selectedStation!.id, data)}
              onDelete={(stationId: string) => handleDeleteStation(stationId)}
            />
          )}

          {/* Add Station Modal */}
          {roomHook.state.modals.addStation && roomHook.state.selectedSlotId && (
            <AddStationModal
              isOpen={true}
              slotLabel={roomHook.slots.find(s => s.id === roomHook.state.selectedSlotId)?.label}
              onClose={roomHook.closeModals}
              onCreate={handleAddStation}
            />
          )}

          {/* Results Modal */}
          {roomHook.state.journey.isActive &&
           roomHook.state.journey.currentIndex >= (selectedRoom?.journeyOrder.length || 0) && (
            <ResultsModal
              isOpen={true}
              result={roomHook.getJourneyResult()!}
              onClose={handleJourneyComplete}
              onRetry={roomHook.restartJourney}
            />
          )}

          {/* Delete Room Modal */}
          {roomToDelete && (
            <DeleteRoomModal
              isOpen={true}
              room={roomToDelete}
              onClose={() => setDeleteModalRoomId(null)}
              onConfirm={handleConfirmDeleteRoom}
            />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SchatzkammerModal;
